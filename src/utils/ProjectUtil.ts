import moment from "moment-timezone";
import Decimal from "decimal.js";

import {
	iMultiResourceAllocation,
	iProjectTaskAssigneeTableRowData,
	iMultiTaskItemForUpdate,
	iPhaseItem,
	iProjectDetails,
	iMultiEstimateResource,
	iMultiTask,
	iMultiPhase,
	iTaskItem,
	iModuleItem,
	iMultiModule,
	ProjectSummaryTypeWithoutDetails,
	iProjectOrderedTaskIds,
	iFormattedProjectDetailsForTable,
	iMultiBug,
	iBugItem,
	projectSyncSources,
} from "@/customTypes/appDataTypes/projectTypes";
import {
	iProjectTaskTimelogTableRowData,
	timelogEntriesByDateType,
} from "@/customTypes/appDataTypes/timeLogTypes";
import {
	defaultProjectTaskIdTypes,
	doneStatusType,
	projectContractTypes,
	projectTaskTypes,
} from "@/constants/projectConstants";
import {NullableString, StringArray} from "@/customTypes/CommonTypes";
import {iMultiTimeLogDetails} from "@/customTypes/appDataTypes/timeLogTypes";
import {iMultiEmployeeDetails} from "@/customTypes/appDataTypes/employeeTypes";

import StringUtil from "./StringUtil";
import DateTimeUtil from "./DateTImeUtil";
import OptimizedProjectUtil from "./OptimizedProjectUtil";
import FixedBidProjectPlanUtil from "./fixedBidProjectPlanUtil";

/**
 * Function that returns the task object from the project details object.
 *
 * @param taskId - The id of the task of which the details are to be fetched. This can be a task, module or phase.
 * @param projectDetails - The project details object.
 * @returns
 */
function getTaskFromProjectDetails(
	taskId: string,
	projectDetails: iProjectDetails,
): iTaskItem | iBugItem | iModuleItem | iPhaseItem | null {
	const {tasks, bugs, modules, phases} = projectDetails;

	if (tasks.items[taskId]) {
		return tasks.items[taskId];
	}

	if (bugs.items[taskId]) {
		return bugs.items[taskId];
	}

	if (modules.items[taskId]) {
		return modules.items[taskId];
	}

	if (phases.items[taskId]) {
		return phases.items[taskId];
	}

	return null;
}

/**
 * Calculates the financial summary for a project based on resource allocations and estimate resources associated with tasks.
 *
 * This function aggregates information from the provided resource allocations and corresponding estimate resources
 * to compute the total cost, total hours, total revenue, total billed hours, and total write-off hours for a project.
 * Each parameter represents a collection of entities indexed by their unique identifiers.
 *
 * @param {iMultiResourceAllocation} resourceAllocations - An object representing the resource allocations for the project.
 *   The structure contains an array of allocation IDs and a dictionary of resource allocation items indexed by their IDs.
 *
 * @param {iMultiEstimateResource} estimateResources - An object representing the estimate resources associated with tasks.
 *   The structure contains a dictionary of estimate resource items indexed by their IDs, including details such as
 *   hourly cost rates and bill rates.
 *
 * @param {iMultiTask} tasks - An object representing the tasks involved in the project.
 *   The structure contains an array of task IDs and a dictionary of task items indexed by their IDs, with each task
 *   detailing the allocated resources.
 *
 * @returns {Object} A summary object containing financial information about the project:
 *   - totalCost: The aggregate cost of all billed hours based on the hourly cost rates of associated estimate resources.
 *   - totalHours: The sum of all billed and write-off hours for the project.
 *   - totalRevenue: The total revenue calculated based on billed hours and bill rates of associated estimate resources.
 *   - totalBilledHours: The total number of billed hours for the project.
 *   - totalWriteoffHours: The total number of hours written off in the project.
 *
 * All returned values are strings representing decimal numbers to maintain precision.
 *
 * The function iterates through each task's allocated resources, retrieves the corresponding estimate resource details,
 * and performs calculations based on the estimate resources' hourly rates and the hours detailed in the allocations.
 * The results are cumulative, with each allocation contributing to the total values.
 *
 * If an allocation references an estimate resource not present in the provided estimate resources parameter, that
 * allocation is skipped in the calculations.
 */
function calculateProjectSummary(
	resourceAllocations: iMultiResourceAllocation,
	estimateResources: iMultiEstimateResource,
	tasks: iMultiTask,
	bugs: iMultiBug,
): {
	totalCost: string;
	totalHours: string;
	totalRevenue: string;
	totalBilledHours: string;
	totalWriteoffHours: string;
} {
	let totalCost = new Decimal("0.00");
	let totalHours = new Decimal("0.00");
	let totalRevenue = new Decimal("0.00");
	let totalBilledHours = new Decimal("0.00");
	let totalWriteoffHours = new Decimal("0.00");

	const processItem = (item: iTaskItem | iBugItem) => {
		// Check if allocatedResources exists and is iterable
		const allocatedResources = item.allocatedResources || [];
		if (!Array.isArray(allocatedResources)) {
			return;
		}

		// Loop through allocatedResources for each item (task or bug)
		for (const allocationId of allocatedResources) {
			const allocation = resourceAllocations.items[allocationId];
			if (!allocation) {
				continue;
			}

			const {estimateResourceId} = allocation;

			const estimateResource = estimateResources.items[estimateResourceId];

			if (!estimateResource) {
				continue; // skip if no corresponding estimate resource found
			}

			const {hourlyCostRate, hourlyBillRate} = estimateResource;

			// Calculate billed hours for this allocation
			const billedHours = new Decimal(allocation.billedHours);

			// Calculate write-off hours for this allocation
			const writeOffHours = new Decimal(allocation.writeOff);

			// Calculate the cost (hourlyCostRate * billedHours) for this allocation
			if (hourlyCostRate) {
				const cost = new Decimal(hourlyCostRate).mul(billedHours);
				totalCost = totalCost.add(cost);
			}

			// Calculate the revenue (hourlyBillRate * billedHours) for this allocation
			const revenue = new Decimal(hourlyBillRate).mul(billedHours);

			// Add to the total accumulators
			totalHours = totalHours.add(billedHours.add(writeOffHours));
			totalRevenue = totalRevenue.add(revenue);
			totalBilledHours = totalBilledHours.add(billedHours);
			totalWriteoffHours = totalWriteoffHours.add(writeOffHours);
		}
	};

	// Process tasks
	for (const taskId of tasks.ids) {
		const task = tasks.items[taskId];
		processItem(task);
	}

	// Process bugs
	for (const bugId of bugs.ids) {
		const bug = bugs.items[bugId];
		processItem(bug);
	}

	return {
		totalCost: totalCost.toString(),
		totalHours: totalHours.toString(),
		totalRevenue: totalRevenue.toString(),
		totalBilledHours: totalBilledHours.toString(),
		totalWriteoffHours: totalWriteoffHours.toString(),
	};
}

function formatOptions(projectDetails: iProjectDetails) {
	const options = [];

	// Extract Uid and Name from Tasks
	const taskIds = projectDetails.tasks.ids;
	const taskItems = projectDetails.tasks.items;
	for (const taskId of taskIds) {
		const task = taskItems[taskId];
		options.push({id: task.id, uid: task.uid, name: task.name});
	}

	// Extract Uid and Name from Bugs
	const bugIds = projectDetails.bugs.ids;
	const bugItems = projectDetails.bugs.items;
	for (const bugId of bugIds) {
		const bug = bugItems[bugId];
		options.push({id: bug.id, uid: bug.uid, name: bug.name});
	}

	// Extract Uid and Name from Modules
	const moduleIds = projectDetails.modules.ids;
	const moduleItems = projectDetails.modules.items;
	for (const moduleId of moduleIds) {
		const modules = moduleItems[moduleId];
		options.push({id: modules.id, uid: modules.uid, name: modules.name});
	}

	// Extract Uid and Name from Phases
	const phaseIds = projectDetails.phases.ids;
	const phaseItems = projectDetails.phases.items;
	for (const phaseId of phaseIds) {
		const phase = phaseItems[phaseId];
		options.push({id: phase.id, uid: phase.uid, name: phase.name});
	}

	return options;
}

/**
 * Calculates the updated start and end dates of a task based on the end date of the task it is linked to.
 *
 * @param mCurrentStartDate - The current start date of the task for which the dates are being calculated.
 * @param mCurrentEndDate - The current end date of the task for which the dates are being calculated.
 * @param currentDuration - The current duration of the task in working days.
 * @param linkedToTaskDuration - The duration of the task it is linked to in working days.
 * @param mEndDateOfLinkedToTaskBeforeUpdate - The end date of the task it is linked to before the update of the linkedTo task.
 * @param mEndDateOfLinkedToTask - The end date of the task it is linked to after the update of the linkedTo task.
 * @returns {{mUpdatedStartDate: Moment, mUpdatedEndDate: Moment}}
 */
const calculateUpdatedDatesBasedOnLinkedToEndDate = (
	mCurrentStartDate: moment.Moment,
	mCurrentEndDate: moment.Moment,
	currentDuration: number,
	linkedToTaskDuration: number,
	mEndDateOfLinkedToTaskBeforeUpdate: moment.Moment,
	mEndDateOfLinkedToTask: moment.Moment,
) => {
	/**
	 * The duration of the task is the no of working days between the start date
	 * and end date of the task inclusive of the start and end dates.
	 *
	 * This is the number of days the task spans.
	 *
	 * This is used to calculate the new end date of the task.
	 */
	let taskDuration = currentDuration;
	if (currentDuration === 0) {
		taskDuration = 1;
	}

	let mUpdatedStartDate: moment.Moment;
	/**
	 * If the linked to task is a single day task, there is a possibility that the
	 * duration of it could be 0. In such cases, we need to handle the computation of
	 * the linkedBy task's start and end dates differently.
	 *
	 * if the linkedToTaskDuration is 0, then the linkedBy task's start date could be
	 * the same as the end date of the linkedTo task. To make sure that we maintain the
	 * original gap between the linkedTo end date and the linked by start date, we need to
	 * compute the next working day after the end date of the linkedTo task by using the
	 * original gap before the update.
	 *
	 * Please note that the gap is calculated based on the days linkedTo task end date and
	 * linkedBy task start date without considering the weekends and holidays.
	 */
	if (linkedToTaskDuration === 0) {
		let gapBetweenLinkedToTaskAndLinkedByTaskBeforeUpdate =
			DateTimeUtil.calculateWorkingDays(
				mEndDateOfLinkedToTaskBeforeUpdate,
				mCurrentStartDate,
			) - 1;

		if (gapBetweenLinkedToTaskAndLinkedByTaskBeforeUpdate > 1) {
			gapBetweenLinkedToTaskAndLinkedByTaskBeforeUpdate = 1;
		}

		/**
		 * The new start date of the task is the next working day that comes after
		 * the minimum gap after the end date of the task it is linked to.
		 */
		mUpdatedStartDate = DateTimeUtil.getTheNextWorkingDayAfterWithAGap(
			mEndDateOfLinkedToTask,
			gapBetweenLinkedToTaskAndLinkedByTaskBeforeUpdate,
		);
	} else {
		/**
		 * The new start date of the task is the next working day after the end date
		 * of the task it is linked to.
		 */
		mUpdatedStartDate = DateTimeUtil.getTheNextWorkingDayAfter(
			mEndDateOfLinkedToTask,
		);
	}

	/**
	 * The new end date of the task is the new start date plus the duration of the same task.
	 * Which is computed by using the task duration (no of working days) between the start and end dates
	 * of the task.
	 */
	const mUpdatedEndDate = DateTimeUtil.computeUpdatedEndDate(
		mUpdatedStartDate,
		taskDuration,
	);

	return {mUpdatedStartDate, mUpdatedEndDate};
};

/**
 * Calculate the startDate and endDate of the parent (phase or module) based on the children's
 * (tasks or modules) start and end dates.
 *
 * @param childItems
 * @param childrenIds
 * @returns {updatedStartDate: NullableString, updatedEndDate: NullableString}
 */
const calculateUpdatedParentDates = (
	childItems: iMultiTaskItemForUpdate,
	childrenIds: StringArray,
): {
	updatedStartDate: NullableString;
	updatedEndDate: NullableString;
} => {
	let mUpdatedStartDate: moment.Moment | null = null;
	let mUpdatedEndDate: moment.Moment | null = null;

	childrenIds.forEach((childId) => {
		const childItem = childItems.items[childId];
		const {startDate, endDate} = childItem;

		if (startDate) {
			const mStartDate = DateTimeUtil.toServerDateTime(startDate);

			if (mUpdatedStartDate) {
				if (startDate) {
					if (mStartDate.isBefore(mUpdatedStartDate)) {
						mUpdatedStartDate = mStartDate;
					}
				}
			} else {
				mUpdatedStartDate = mStartDate;
			}
		}

		if (endDate) {
			const mEndDate = DateTimeUtil.toServerDateTime(endDate);

			if (mUpdatedEndDate) {
				if (endDate) {
					if (mEndDate.isAfter(mUpdatedEndDate)) {
						mUpdatedEndDate = mEndDate;
					}
				}
			} else {
				mUpdatedEndDate = mEndDate;
			}
		}
	});

	const result: {
		updatedStartDate: NullableString;
		updatedEndDate: NullableString;
	} = {
		updatedStartDate: null,
		updatedEndDate: null,
	};

	if (mUpdatedStartDate) {
		const updatedStartDateStr = (mUpdatedStartDate as moment.Moment).format(
			DateTimeUtil.DEFAULT_DATE_FORMAT,
		);

		result.updatedStartDate = updatedStartDateStr;
	}

	if (mUpdatedEndDate) {
		const updatedEndDateStr = (mUpdatedEndDate as moment.Moment).format(
			DateTimeUtil.DEFAULT_DATE_FORMAT,
		);

		result.updatedEndDate = updatedEndDateStr;
	}

	return result;
};

function buildDateUpdatesOnDependencyChange(
	projectDetails: iProjectDetails,
	taskId: string,
	mUpdatedStartDate: moment.Moment,
	mUpdatedEndDate: moment.Moment,
	durationOfTheUpdatedTask: number,
	contractType: projectContractTypes | null,
	updatedLinkedToTaskUid?: string,
) {
	let hasLinkedToOfFirstTaskUpdated = false;

	if (!updatedLinkedToTaskUid) {
		hasLinkedToOfFirstTaskUpdated = true;
	}

	const phasesToUpdate: iMultiTaskItemForUpdate = {
		ids: [],
		items: {},
	};

	const modulesToUpdate: iMultiTaskItemForUpdate = {
		ids: [],
		items: {},
	};

	const tasksToUpdate: iMultiTaskItemForUpdate = {
		ids: [],
		items: {},
	};

	const moduleIdsNeedsToBeUpdated: {
		[key in string]: boolean;
	} = {};

	const phaseIdsNeedsToBeUpdated: {
		[key in string]: boolean;
	} = {};

	function updateTaskDates(
		taskId: string,
		mUpdatedStartDate: moment.Moment,
		mUpdatedEndDate: moment.Moment,
		taskDuration: number,
	) {
		const getItem = (id: string) => {
			const item =
				projectDetails.tasks.items[id] || projectDetails.bugs.items[id];
			if (!item) {
				console.error(`Item not found for id ${id}`);
			}
			return item;
		};

		const taskToUpdate = getItem(taskId);

		if (!taskToUpdate) {
			console.error(`Task or bug with id ${taskId} not found`);
			return;
		}

		const {linkedBy, parentId: moduleId} = taskToUpdate;

		tasksToUpdate.ids.push(taskId);

		tasksToUpdate.items[taskId] = {
			id: taskId,
			startDate: mUpdatedStartDate.format(DateTimeUtil.DEFAULT_DATE_FORMAT),
			endDate: mUpdatedEndDate.format(DateTimeUtil.DEFAULT_DATE_FORMAT),
			duration: taskDuration,
		};

		if (!hasLinkedToOfFirstTaskUpdated && updatedLinkedToTaskUid) {
			hasLinkedToOfFirstTaskUpdated = true;
			tasksToUpdate.items[taskId].linkedTo = updatedLinkedToTaskUid;
		}

		if (moduleId) {
			moduleIdsNeedsToBeUpdated[moduleId] = true;
		}

		if (linkedBy) {
			for (const linkedByTaskId of linkedBy) {
				const linkedToTaskId = taskId;

				const linkedToTaskBeforeUpdate = getItem(linkedToTaskId);
				const taskToUpdate = getItem(linkedByTaskId);

				if (!linkedToTaskBeforeUpdate || !taskToUpdate) {
					console.error(
						`Linked task not found: ${linkedToTaskId} or ${linkedByTaskId}`,
					);
					continue;
				}

				//check if the linkedBy task is Accrued
				const isAccrued = FixedBidProjectPlanUtil.isTaskAccrued(
					taskToUpdate,
					contractType,
				);

				// Skip updating if the linkedBy task is accrued
				if (isAccrued) {
					continue;
				}

				const {startDate, endDate, duration: currentDurationVal} = taskToUpdate;

				if (startDate && endDate) {
					const mCurrentStartDate = DateTimeUtil.toServerDateTime(startDate);
					const mCurrentEndDate = DateTimeUtil.toServerDateTime(endDate);

					let currentTaskDuration: number = 1;
					if (currentDurationVal !== null && currentDurationVal !== undefined) {
						currentTaskDuration = currentDurationVal;
					} else {
						currentTaskDuration = DateTimeUtil.calculateWorkingDays(
							mCurrentStartDate,
							mCurrentEndDate,
						);
					}

					const {
						duration: linkedToTaskDuration,
						endDate: linkedToTaskEndDateBeforeUpdate,
					} = linkedToTaskBeforeUpdate;

					if (
						linkedToTaskDuration !== null &&
						linkedToTaskDuration !== undefined &&
						linkedToTaskEndDateBeforeUpdate !== null &&
						linkedToTaskEndDateBeforeUpdate !== undefined
					) {
						const {
							mUpdatedStartDate: mUpdatedStartDateOTheTaskToUpdate,
							mUpdatedEndDate: mUpdatedEndDateOTheTaskToUpdate,
						} = calculateUpdatedDatesBasedOnLinkedToEndDate(
							mCurrentStartDate,
							mCurrentEndDate,
							currentTaskDuration,
							linkedToTaskDuration,
							DateTimeUtil.toServerDateTime(linkedToTaskEndDateBeforeUpdate),
							mUpdatedEndDate,
						);

						updateTaskDates(
							linkedByTaskId,
							mUpdatedStartDateOTheTaskToUpdate,
							mUpdatedEndDateOTheTaskToUpdate,
							currentTaskDuration,
						);
					} else {
						console.error(`Invalid data for linked task ${linkedByTaskId}`);
					}
				} else {
					console.error(`Missing start or end date for task ${linkedByTaskId}`);
				}
			}
		}
	}

	updateTaskDates(
		taskId,
		mUpdatedStartDate,
		mUpdatedEndDate,
		durationOfTheUpdatedTask,
	);

	// Updating the startDate & endDate of modules of which the tasks are being updated.
	Object.keys(moduleIdsNeedsToBeUpdated).forEach((moduleId) => {
		const moduleToUpdate = projectDetails.modules.items[moduleId];
		if (!moduleToUpdate) {
			console.error(`Module ${moduleId} not found`);
			return;
		}
		const {
			childrenIds: childTaskIds,
			startDate,
			endDate,
			parentId: phaseIdToUpdate,
		} = moduleToUpdate;

		const nonUpdatedTaskIds = childTaskIds.filter((childTaskId) => {
			return !tasksToUpdate.ids.includes(childTaskId);
		});

		const combinedTasks: iMultiTaskItemForUpdate = {
			ids: childTaskIds,
			items: {
				...tasksToUpdate.items,
			},
		};

		if (nonUpdatedTaskIds.length > 0) {
			nonUpdatedTaskIds.forEach((nonUpdatedTaskId) => {
				const nonUpdatedTask =
					projectDetails.tasks.items[nonUpdatedTaskId] ||
					projectDetails.bugs.items[nonUpdatedTaskId];
				if (!nonUpdatedTask) {
					console.error(`Task or bug ${nonUpdatedTaskId} not found`);
					return;
				}

				const {startDate, endDate} = nonUpdatedTask;

				combinedTasks.items[nonUpdatedTaskId] = {
					id: nonUpdatedTaskId,
					startDate,
					endDate,
				};
			});
		}

		const {updatedStartDate, updatedEndDate} = calculateUpdatedParentDates(
			combinedTasks,
			childTaskIds,
		);

		if (
			phaseIdToUpdate &&
			updatedStartDate &&
			updatedEndDate &&
			(startDate !== DateTimeUtil.formatDate(updatedStartDate) ||
				endDate !== DateTimeUtil.formatDate(updatedEndDate))
		) {
			phaseIdsNeedsToBeUpdated[phaseIdToUpdate] = true;
		}

		modulesToUpdate.ids.push(moduleId);
		modulesToUpdate.items[moduleId] = {
			id: moduleId,
			startDate: updatedStartDate,
			endDate: updatedEndDate,
		};
	});

	// Updating the startDate & endDate of phases of which the modules are being updated.
	Object.keys(phaseIdsNeedsToBeUpdated).forEach((phaseIdNeedsToBeUpdated) => {
		const phaseToUpdate = projectDetails.phases.items[phaseIdNeedsToBeUpdated];
		if (!phaseToUpdate) {
			console.error(`Phase ${phaseIdNeedsToBeUpdated} not found`);
			return;
		}
		const {childrenIds: childModuleIds} = phaseToUpdate;

		const nonUpdatedModuleIds = childModuleIds.filter((childModuleId) => {
			return !modulesToUpdate.ids.includes(childModuleId);
		});

		const combinedModules: iMultiTaskItemForUpdate = {
			ids: childModuleIds,
			items: {
				...modulesToUpdate.items,
			},
		};

		if (nonUpdatedModuleIds.length > 0) {
			nonUpdatedModuleIds.forEach((nonUpdatedModuleId) => {
				const nonUpdatedModule =
					projectDetails.modules.items[nonUpdatedModuleId];
				if (!nonUpdatedModule) {
					console.error(`Module ${nonUpdatedModuleId} not found`);
					return;
				}

				const {startDate, endDate} = nonUpdatedModule;

				combinedModules.items[nonUpdatedModuleId] = {
					id: nonUpdatedModuleId,
					startDate,
					endDate,
				};
			});
		}

		const {updatedStartDate, updatedEndDate} = calculateUpdatedParentDates(
			combinedModules,
			childModuleIds,
		);

		phasesToUpdate.ids.push(phaseIdNeedsToBeUpdated);
		phasesToUpdate.items[phaseIdNeedsToBeUpdated] = {
			id: phaseIdNeedsToBeUpdated,
			startDate: updatedStartDate,
			endDate: updatedEndDate,
		};
	});

	return {
		phasesToUpdate,
		modulesToUpdate,
		tasksToUpdate,
	};
}

/**
 * Function that returns the task id of the task that has the given uid.
 *
 * @param projectDetails - The project details object
 * @param uid - The uid of the task
 * @returns - The task id of the task that has the given uid
 */
function getTaskIdFromUid(
	projectDetails: iProjectDetails,
	uid: string,
): string {
	let taskIdOfUid = "";

	const {tasks, modules, phases, bugs} = projectDetails;

	tasks.ids.filter((taskId) => {
		const task = tasks.items[taskId];
		if (task.uid === uid) {
			taskIdOfUid = task.id;

			return true;
		}
		return false;
	});

	if (taskIdOfUid.length > 0) {
		return taskIdOfUid;
	}

	bugs.ids.filter((bugId) => {
		const bug = bugs.items[bugId];
		if (bug.uid === uid) {
			taskIdOfUid = bug.id;

			return true;
		}
		return false;
	});

	if (taskIdOfUid.length > 0) {
		return taskIdOfUid;
	}

	modules.ids.filter((moduleId) => {
		const moduleItem = modules.items[moduleId];

		if (moduleItem.uid === uid) {
			taskIdOfUid = moduleItem.id;

			return true;
		}
		return false;
	});

	if (taskIdOfUid.length > 0) {
		return taskIdOfUid;
	}

	phases.ids.filter((phaseId) => {
		const phaseItem: iPhaseItem = phases.items[phaseId];

		if (phaseItem.uid === uid) {
			taskIdOfUid = phaseItem.id;

			return true;
		}
		return false;
	});

	return taskIdOfUid;
}

function findTargetIdAndGetNeighbors(
	projectDetails: iProjectDetails,
	formattedProjectDetailsForTable: iFormattedProjectDetailsForTable,
	taskId: string,
	idOfNextTaskInTheNewPlace: NullableString,
): {
	isSuccess: boolean;
	taskType: projectTaskTypes | null;
	newParentId: NullableString;
	newPreviousTaskId: NullableString;
	newNextTaskId: NullableString;
} {
	const {tasks, modules, phases, bugs} = projectDetails;

	const {tableData, phaseIdIndexMap, moduleIdIndexMap} =
		formattedProjectDetailsForTable;

	const taskItemBeingMoved:
		| iTaskItem
		| iModuleItem
		| iPhaseItem
		| iBugItem
		| null = getTaskFromProjectDetails(taskId, projectDetails);

	if (!taskItemBeingMoved) {
		return {
			isSuccess: false,
			taskType: null,
			newParentId: null,
			newPreviousTaskId: null,
			newNextTaskId: null,
		};
	}

	const typeOfTaskBeingMoved = taskItemBeingMoved.type;

	if (
		idOfNextTaskInTheNewPlace &&
		idOfNextTaskInTheNewPlace !== defaultProjectTaskIdTypes.PLACEHOLDER
	) {
		/**
		 * nextTaskInTheNewPlace is the task that will be after the task being moved in the new place.
		 * This task might not be necessarily considered as the next task in the context of ordering
		 * as the we're capturing the link between in the same sibling group. Based on the type of this
		 * task, we can determine the actual previous and next tasks of the new location.
		 */
		let nextTaskInTheNewPlace: iTaskItem | iModuleItem | iPhaseItem | iBugItem;

		if (tasks.items[idOfNextTaskInTheNewPlace]) {
			nextTaskInTheNewPlace = tasks.items[idOfNextTaskInTheNewPlace];
		} else if (modules.items[idOfNextTaskInTheNewPlace]) {
			nextTaskInTheNewPlace = modules.items[idOfNextTaskInTheNewPlace];
		} else if (bugs.items[idOfNextTaskInTheNewPlace]) {
			nextTaskInTheNewPlace = bugs.items[idOfNextTaskInTheNewPlace];
		} else {
			nextTaskInTheNewPlace = phases.items[idOfNextTaskInTheNewPlace];
		}

		const typeOfTheNextTaskInTheNewPlace = nextTaskInTheNewPlace.type;

		if (typeOfTaskBeingMoved === typeOfTheNextTaskInTheNewPlace) {
			/**
			 * If the task being moved and the next task in the new place are of the same type,
			 * then the next task in the new place will be the next task in the list as per the
			 * updated order.
			 */
			const nextTask = nextTaskInTheNewPlace;

			const previousTaskId = nextTask.previousTaskId;

			return {
				isSuccess: true,
				taskType: typeOfTaskBeingMoved,
				/**
				 * If the task being moved is a phase, then the newParentId will be null
				 * as the task of type PHASE is the top level task type and does not have a parent.
				 */
				newParentId:
					typeOfTaskBeingMoved === projectTaskTypes.PHASE
						? null
						: nextTask.parentId,
				newPreviousTaskId: previousTaskId,
				newNextTaskId: idOfNextTaskInTheNewPlace,
			};
		} else {
			if (typeOfTaskBeingMoved === projectTaskTypes.PHASE) {
				if (typeOfTheNextTaskInTheNewPlace !== projectTaskTypes.PHASE) {
					/**
					 * If the task being moved is a phase and the next task in the new place is not a phase,
					 * it task of type PHASE is being moved to either the middle of MODULES or TASKS.
					 * This is not allowed. So, the move operation is not successful.
					 */
					return {
						isSuccess: false,
						taskType: typeOfTaskBeingMoved,
						newParentId: null,
						newPreviousTaskId: null,
						newNextTaskId: null,
					};
				} else {
					/**
					 * If the task being moved is a phase and the next task in the new place is a phase,
					 * then the next task in the new place will be the next task in the list as per the
					 * updated order.
					 */
					const nextPhase = nextTaskInTheNewPlace;

					const previousTaskId = nextPhase.previousTaskId;

					return {
						isSuccess: true,
						taskType: typeOfTaskBeingMoved,
						newParentId: nextPhase.parentId,
						newPreviousTaskId: previousTaskId,
						newNextTaskId: idOfNextTaskInTheNewPlace,
					};
				}
			} else {
				/**
				 * If the task being moved is not a phase, then it is either a module or a task.
				 */
				if (typeOfTheNextTaskInTheNewPlace === projectTaskTypes.PHASE) {
					/**
					 * If the previousTaskId of the nextTaskInTheNewPlace is null, then the task being moved
					 * is moved to the beginning of the list. Since the task being moved is not a phase, it is
					 * not allowed to move it to the beginning of the list.
					 */
					if (nextTaskInTheNewPlace.previousTaskId === null) {
						return {
							isSuccess: false,
							taskType: typeOfTaskBeingMoved,
							newParentId: null,
							newPreviousTaskId: null,
							newNextTaskId: null,
						};
					} else {
						/**
						 * if the previousTaskId of the nextTaskInTheNewPlace of type PHASE is not null, this means
						 * there are other PHASES before the nextTaskInTheNewPlace. In such cases, the task being moved
						 * is actually moved to the end of the list of the phase before the nextTaskInTheNewPlace.
						 */
						const indexOfTheNextTaskInTheNewPlace =
							phaseIdIndexMap[nextTaskInTheNewPlace.id];
						const indexOfThePhaseBeforeTheNextTaskInTheNewPlace =
							indexOfTheNextTaskInTheNewPlace - 1;

						const phaseBeforeTheNextTaskInTheNewPlace =
							tableData[indexOfThePhaseBeforeTheNextTaskInTheNewPlace];
						const childModules = phaseBeforeTheNextTaskInTheNewPlace.children;

						if (typeOfTaskBeingMoved === projectTaskTypes.MODULE) {
							/**
							 * Since the type of the nextTaskInTheNewPlace is PHASE and the type of the task being moved
							 * is MODULE, the next task in the new place will be null.
							 * In such cases, the previous task will be the last MODULE in the phase before the nextTaskInTheNewPlace.
							 *
							 * If there are no modules in the phase before the nextTaskInTheNewPlace, then the module being moved
							 * will be the first module. In such cases, the previous task and the next task will be null. But the
							 * updatedParentId will be the id of the phase before the nextTaskInTheNewPlace.
							 */
							if (childModules.length > 0) {
								const lastModuleItemInTheList =
									childModules[childModules.length - 1];

								return {
									isSuccess: true,
									taskType: typeOfTaskBeingMoved,
									newParentId: phaseBeforeTheNextTaskInTheNewPlace.id,
									newPreviousTaskId: lastModuleItemInTheList.id,
									newNextTaskId: null,
								};
							} else {
								return {
									isSuccess: true,
									taskType: typeOfTaskBeingMoved,
									newParentId: phaseBeforeTheNextTaskInTheNewPlace.id,
									newNextTaskId: null,
									newPreviousTaskId: null,
								};
							}
						} else {
							// WHEN: typeOfTaskBeingMoved === projectTaskTypes.TASK || typeOfTaskBeingMoved === projectTaskTypes.BUG
							/**
							 * Since the type of the nextTaskInTheNewPlace is PHASE and the type of the task being moved
							 * is TASK, the next task in the new place will be null. In such cases, the previous task will be
							 * the last TASK in the last MODULE of the PHASE before the nextTaskInTheNewPlace (if there are any
							 * child modules in the phase before the nextTaskInTheNewPlace). If there are no child tasks of type
							 * TASK in the last module of the phase before the nextTaskInTheNewPlace, then the task being moved
							 * will be the first task of type TASK in the last module of the phase before the nextTaskInTheNewPlace.
							 * In such cases, the previous task and the next task will be null. But the updatedParentId will be
							 * the id of the phase before the nextTaskInTheNewPlace.
							 *
							 * If the phase before the nextTaskInTheNewPlace has no modules, then this movement is not allowed as
							 * a task of type TASK cannot be moved to the end of the list of a phase and it can only be moved to the
							 * tasks of type MODULE.
							 */
							if (childModules.length > 0) {
								const lastModuleItemInTheList =
									childModules[childModules.length - 1];
								const childTasksOfTheLastModule =
									lastModuleItemInTheList.children;

								if (childTasksOfTheLastModule.length > 0) {
									const lastTaskItemInTheList =
										childTasksOfTheLastModule[
											childTasksOfTheLastModule.length - 1
										];

									return {
										isSuccess: true,
										taskType: typeOfTaskBeingMoved,
										newParentId: lastModuleItemInTheList.id,
										newPreviousTaskId: lastTaskItemInTheList.id,
										newNextTaskId: null,
									};
								} else {
									return {
										isSuccess: true,
										taskType: typeOfTaskBeingMoved,
										newParentId: lastModuleItemInTheList.id,
										newNextTaskId: null,
										newPreviousTaskId: null,
									};
								}
							} else {
								return {
									isSuccess: false,
									taskType: typeOfTaskBeingMoved,
									newParentId: null,
									newPreviousTaskId: null,
									newNextTaskId: null,
								};
							}
						}
					}
				} else if (typeOfTheNextTaskInTheNewPlace === projectTaskTypes.MODULE) {
					if (typeOfTaskBeingMoved === projectTaskTypes.MODULE) {
						/**
						 * If the task being moved is a module and the next task in the new place is a module,
						 * then the next task in the new place will be the next task in the list as per the
						 * updated order.
						 */
						const nextModule = nextTaskInTheNewPlace;

						const previousTaskId = nextModule.previousTaskId;

						return {
							isSuccess: true,
							taskType: typeOfTaskBeingMoved,
							newParentId: nextModule.parentId,
							newPreviousTaskId: previousTaskId,
							newNextTaskId: idOfNextTaskInTheNewPlace,
						};
					} else {
						// WHEN: typeOfTaskBeingMoved === projectTaskTypes.TASK || typeOfTaskBeingMoved === projectTaskTypes.BUG
						/**
						 * If the task being moved is a task and the next task in the new place is a module,
						 * and the previousTaskId of the nextTaskInTheNewPlace is null, then the task being moved
						 * is moved to the beginning of the list of the child modules of the phase which the nextTaskInTheNewPlace
						 * belongs to. Since the task being moved is not a module, it is not allowed to move it to the beginning
						 * of the list which is out side the scope of a module.
						 */
						if (nextTaskInTheNewPlace.previousTaskId === null) {
							return {
								isSuccess: false,
								taskType: typeOfTaskBeingMoved,
								newParentId: null,
								newPreviousTaskId: null,
								newNextTaskId: null,
							};
						} else {
							/**
							 * if the previousTaskId of the nextTaskInTheNewPlace of type MODULE is not null, this means
							 * there are other MODULES before the nextTaskInTheNewPlace. In such cases, the task being moved
							 * is actually moved to the end of the list of the MODULE before the nextTaskInTheNewPlace.
							 * Since the type of the nextTaskInTheNewPlace is MODULE and the type of the task being moved
							 * is TASK, the next task in the new place will be null. In such cases, the previous task will be
							 * the last TASK in the last MODULE before the nextTaskInTheNewPlace. If there are no tasks in the
							 * last module before the nextTaskInTheNewPlace, then the task being moved will be the first task
							 * in the last module before the nextTaskInTheNewPlace. In such cases, the previous task and the next
							 * task will be null. But the updatedParentId will be the id of the module before the nextTaskInTheNewPlace.
							 */

							const parentPhaseIdOfTheNextTaskInTheNewPlace =
								nextTaskInTheNewPlace.parentId;

							if (parentPhaseIdOfTheNextTaskInTheNewPlace === null) {
								/**
								 * This will not happen as a module will always belong to a phase and the parent id of a module
								 * will always be the id of the phase it belongs to and it will never be null.
								 * This is just a safety check.
								 */
								return {
									isSuccess: false,
									taskType: typeOfTaskBeingMoved,
									newParentId: null,
									newPreviousTaskId: null,
									newNextTaskId: null,
								};
							}

							const indexOfThePhaseOfTheNextTaskInTheNewPlace =
								phaseIdIndexMap[parentPhaseIdOfTheNextTaskInTheNewPlace];

							const indexOfTheNextTaskInTheNewPlace =
								moduleIdIndexMap[nextTaskInTheNewPlace.id];

							const indexOfTheModuleBeforeTheNextTaskInTheNewPlace =
								indexOfTheNextTaskInTheNewPlace - 1;

							const moduleBeforeTheNextTaskInTheNewPlace =
								tableData[indexOfThePhaseOfTheNextTaskInTheNewPlace].children[
									indexOfTheModuleBeforeTheNextTaskInTheNewPlace
								];

							const childTasksOfTheModuleBeforeTheNextTaskInTheNewPlace =
								moduleBeforeTheNextTaskInTheNewPlace.children;

							if (
								childTasksOfTheModuleBeforeTheNextTaskInTheNewPlace.length > 0
							) {
								const lastTaskItemInTheList =
									childTasksOfTheModuleBeforeTheNextTaskInTheNewPlace[
										childTasksOfTheModuleBeforeTheNextTaskInTheNewPlace.length -
											1
									];

								return {
									isSuccess: true,
									taskType: typeOfTaskBeingMoved,
									newParentId: moduleBeforeTheNextTaskInTheNewPlace.id,
									newPreviousTaskId: lastTaskItemInTheList.id,
									newNextTaskId: null,
								};
							} else {
								return {
									isSuccess: true,
									taskType: typeOfTaskBeingMoved,
									newParentId: moduleBeforeTheNextTaskInTheNewPlace.id,
									newNextTaskId: null,
									newPreviousTaskId: null,
								};
							}
						}
					}
				} else {
					// WHEN: typeOfTheNextTaskInTheNewPlace === projectTaskTypes.TASK
					if (typeOfTaskBeingMoved === projectTaskTypes.MODULE) {
						/**
						 * If the task being moved is a module and the next task in the new place is a task,
						 * this means the module is being moved to either the middle of the tasks of type TASK or
						 * to the beginning of the tasks of type TASK. This is not allowed. So, the move operation
						 * is not successful.
						 */
						return {
							isSuccess: false,
							taskType: typeOfTaskBeingMoved,
							newParentId: null,
							newPreviousTaskId: null,
							newNextTaskId: null,
						};
					} else {
						// WHEN: typeOfTaskBeingMoved === projectTaskTypes.TASK || typeOfTaskBeingMoved === projectTaskTypes.BUG
						/**
						 * If the task being moved is of type TASK and the next task in the new place is also of type TASK,
						 * then the next task in the new place will be the next task in the list as per the
						 * updated order.
						 */
						const nextTask = nextTaskInTheNewPlace;

						const previousTaskId = nextTask.previousTaskId;

						return {
							isSuccess: true,
							taskType: typeOfTaskBeingMoved,
							newParentId: nextTask.parentId,
							newPreviousTaskId: previousTaskId,
							newNextTaskId: idOfNextTaskInTheNewPlace,
						};
					}
				}
			}
		}
	} else {
		/**
		 * if the idOfNextTaskInTheNewPlace is null, then the task being moved is moved to the end of the sibling group.
		 * In such cases, the next task in the new place will be null.
		 *
		 * If the idOfNextTaskInTheNewPlace is the defaultProjectTaskIdTypes.PLACEHOLDER, then the task being moved
		 * is moved to the end of the list. In such cases, the next task in the new place will be null.
		 */

		/**
		 * Taking the last task from the list.
		 *
		 * The reason why we're taking the second last item from the list is because the last item in the list is the
		 * Placeholder item which is used to show the drop zone for the user if they user wants to move a task to the
		 * end of the list. So, we need to take the second last item from the list to get the actual last task in the list.
		 */
		const lastPhaseItemInTheList =
			idOfNextTaskInTheNewPlace === defaultProjectTaskIdTypes.PLACEHOLDER
				? tableData[tableData.length - 2]
				: tableData[tableData.length - 1];

		if (typeOfTaskBeingMoved === projectTaskTypes.PHASE) {
			return {
				isSuccess: true,
				taskType: typeOfTaskBeingMoved,
				newParentId: null,
				newPreviousTaskId: lastPhaseItemInTheList.id,
				newNextTaskId: null,
			};
		}

		const childModulesOfTheLastPhase = lastPhaseItemInTheList.children;

		if (typeOfTaskBeingMoved === projectTaskTypes.MODULE) {
			if (childModulesOfTheLastPhase.length > 0) {
				const lastModuleItemInTheList =
					childModulesOfTheLastPhase[childModulesOfTheLastPhase.length - 1];

				return {
					isSuccess: true,
					taskType: typeOfTaskBeingMoved,
					newParentId: lastPhaseItemInTheList.id,
					newPreviousTaskId: lastModuleItemInTheList.id,
					newNextTaskId: null,
				};
			} else {
				/**
				 * If there are no modules in the last phase, then the module being moved will be the first module.
				 * In such cases, the previous task and the next task will be null.
				 */
				return {
					isSuccess: true,
					taskType: typeOfTaskBeingMoved,
					newParentId: lastPhaseItemInTheList.id,
					newNextTaskId: null,
					newPreviousTaskId: null,
				};
			}
		} else {
			/**
			 * typeOfTaskBeingMoved === projectTaskTypes.TASK || typeOfTaskBeingMoved === projectTaskTypes.BUG
			 */
			if (childModulesOfTheLastPhase.length > 0) {
				const lastModuleItemInTheList =
					childModulesOfTheLastPhase[childModulesOfTheLastPhase.length - 1];

				const childTasksOfTheLastModule = lastModuleItemInTheList.children;

				if (childTasksOfTheLastModule.length > 0) {
					const lastTaskItemInTheList =
						childTasksOfTheLastModule[childTasksOfTheLastModule.length - 1];

					return {
						isSuccess: true,
						taskType: typeOfTaskBeingMoved,
						newParentId: lastModuleItemInTheList.id,
						newPreviousTaskId: lastTaskItemInTheList.id,
						newNextTaskId: null,
					};
				} else {
					/**
					 * If there are no tasks in the last module, then the task being moved will be the first task.
					 * In such cases, the previous task and the next task will be null.
					 */
					return {
						isSuccess: true,
						taskType: typeOfTaskBeingMoved,
						newParentId: lastModuleItemInTheList.id,
						newNextTaskId: null,
						newPreviousTaskId: null,
					};
				}
			} else {
				/**
				 * If there are no modules in the last phase, then this movement is not allowed as a task of type TASK
				 * cannot be moved to the end of the list of a phase and it can only be moved to the tasks of type MODULE.
				 */
				return {
					isSuccess: false,
					taskType: typeOfTaskBeingMoved,
					newParentId: null,
					newPreviousTaskId: null,
					newNextTaskId: null,
				};
			}
		}
	}
}

/**
 * Function that formats the normalized data structure from redux store/api response to the
 * format required by the Table component for rendering the assignee details on the task details page's
 * Assignee popup.
 *
 * @param projectDetails - The normalized data structure from redux store/api response
 * @param taskId - The ID of the task for which the assignee details are to be rendered
 * @param taskType - The type of the task (phase, module, or task)
 * @returns
 */
function formatAssigneesForTable(
	projectDetails: iProjectDetails,
	multiEmployeeDetails: iMultiEmployeeDetails,
	taskId: string,
	taskType: projectTaskTypes,
): Array<iProjectTaskAssigneeTableRowData> {
	const tableData: Array<iProjectTaskAssigneeTableRowData> = [];

	if (taskType === projectTaskTypes.TASK) {
		const {tasks} = projectDetails;

		const taskDetails = tasks.items[taskId];

		if (taskDetails) {
			const {allocatedResources} = taskDetails;

			if (allocatedResources.length > 0) {
				allocatedResources.forEach((allocationId) => {
					const resourceAllocation =
						projectDetails.resourceAllocations.items[allocationId];
					const {billedHours, writeOff, estimateResourceId} =
						resourceAllocation;

					const estimateResource =
						projectDetails.estimateResources.items[estimateResourceId];
					const {employeeId, hourlyBillRate, projectRole, resourceRole} =
						estimateResource;

					let employeeName: NullableString = null;
					if (employeeId) {
						const employeeDetails = multiEmployeeDetails.items[employeeId];
						const {firstName, lastName, middleName} = employeeDetails;

						employeeName = `${StringUtil.safeTrim(
							firstName,
						)} ${StringUtil.safeTrim(middleName, " ")} ${StringUtil.safeTrim(
							lastName,
							" ",
						)}`;
					}

					tableData.push({
						estimateResourceId,
						allocationId,
						employeeId,
						employeeName,
						billedHours,
						writeOff,
						hourlyBillRate,
						projectRole,
						resourceRole,
					});
				});
			}
		}
	} else if (taskType === projectTaskTypes.BUG) {
		const {bugs} = projectDetails;

		if (!bugs || !bugs.items) {
			console.warn("Bug data is missing or in unexpected format");
			return tableData;
		}

		const bugDetails = bugs.items[taskId];

		if (!bugDetails) {
			console.warn(`Bug details not found for taskId: ${taskId}`);
			return tableData;
		}

		const {allocatedResources} = bugDetails;

		if (allocatedResources && allocatedResources.length > 0) {
			allocatedResources.forEach((allocationId) => {
				const resourceAllocation =
					projectDetails.resourceAllocations?.items[allocationId];
				if (!resourceAllocation) {
					console.warn(
						`Resource allocation ${allocationId} not found for bug ${taskId}`,
					);
					return;
				}

				const {billedHours, writeOff, estimateResourceId} = resourceAllocation;

				if (
					!projectDetails.estimateResources ||
					!projectDetails.estimateResources.items
				) {
					console.warn(
						"Estimate resources data is missing or in unexpected format",
					);
					return;
				}

				const estimateResource =
					projectDetails.estimateResources.items[estimateResourceId];
				if (!estimateResource) {
					console.warn(
						`Estimate resource ${estimateResourceId} not found for bug ${taskId}`,
					);
					return;
				}

				const {employeeId, hourlyBillRate, projectRole, resourceRole} =
					estimateResource;

				let employeeName: NullableString = null;
				if (employeeId && multiEmployeeDetails && multiEmployeeDetails.items) {
					const employeeDetails = multiEmployeeDetails.items[employeeId];
					if (employeeDetails) {
						const {firstName, lastName, middleName} = employeeDetails;
						employeeName = `${StringUtil.safeTrim(firstName)} ${StringUtil.safeTrim(middleName, " ")} ${StringUtil.safeTrim(lastName, " ")}`;
					} else {
						console.warn(`Employee ${employeeId} not found for bug ${taskId}`);
					}
				}

				tableData.push({
					estimateResourceId,
					allocationId,
					employeeId,
					employeeName,
					billedHours,
					writeOff,
					hourlyBillRate,
					projectRole,
					resourceRole,
				});
			});
		}
	}
	return tableData;
}

function getEmployeeNameById(
	employeeId: number,
	rawData: iMultiEmployeeDetails,
) {
	if (employeeId && rawData.items && rawData.items[employeeId]) {
		const employeeDetails = rawData.items[employeeId];
		const {firstName, lastName, middleName} = employeeDetails;
		return `${StringUtil.safeTrim(firstName)} ${StringUtil.safeTrim(middleName, " ")} ${StringUtil.safeTrim(lastName, " ")}`;
	} else {
		return null;
	}
}

/**
 * Formats time log details into table row data for display.
 *
 * @param timeLogDetails - Object containing time log details.
 * @param projectDetails - Project details with summary.
 * @param taskId - ID of the task.
 * @param taskType - Type of the project task.
 * @returns Array of formatted table row data representing time log entries.
 */
function formatTimeLogsForTable(
	timeLogDetails: iMultiTimeLogDetails,
	projectDetails: iProjectDetails,
	employeeDetails: iMultiEmployeeDetails,
	taskId: string,
	taskType: projectTaskTypes,
): Array<iProjectTaskTimelogTableRowData> {
	const tableData: Array<iProjectTaskTimelogTableRowData> = [];

	// Function to process resource allocation
	const processResourceAllocation = (
		employeeId: NullableString,
		resourceRole: string,
		projectRoleId: string,
		plannedHours: number,
	) => {
		if (employeeId === null) {
			// Handle the case where employeeId is null
			console.warn("Encountered null employeeId");
			return;
		}

		// Find the corresponding time log entries for the employee
		const timeLogs = Object.values(timeLogDetails.items).filter(
			(timeLogEntry) => {
				return (
					timeLogEntry.employeeId === employeeId &&
					timeLogEntry.projectRoleId === Number(projectRoleId)
				);
			},
		);

		// Create a map to store work dates and logged hours for the employee
		const timelogEntriesByDate: timelogEntriesByDateType = {};

		timeLogs.forEach((timelog) => {
			const {workDate, loggedHours, loggedBy, id, updatedAt} = timelog;

			if (loggedHours && workDate) {
				const timeFormattedLoggedHours =
					DateTimeUtil.formatTimeToHoursAndMinutes(loggedHours);

				let loggedByName = null;
				if (loggedBy) {
					loggedByName = getEmployeeNameById(loggedBy, employeeDetails);
				}

				timelogEntriesByDate[workDate] = {
					id: id ? id : null,
					workDate,
					loggedHours: timeFormattedLoggedHours,
					loggedBy: loggedBy ? String(loggedBy) : null,
					loggedByName: loggedByName,
					updatedAt: updatedAt ? String(updatedAt) : null,
					isLoggedHoursUpdated: false,
				};
			}
		});

		// Get the employee's name
		const employeeName = getEmployeeNameById(
			Number(employeeId),
			employeeDetails,
		);

		// Push a new row to the tableData array
		tableData.push({
			allocationId: employeeId,
			employeeName: `${employeeName || "Unknown"} - ${resourceRole}`,
			plannedHours,
			projectRoleId: Number(projectRoleId),
			timelogEntriesByDate,
		});
	};

	if (taskType === projectTaskTypes.TASK || taskType === projectTaskTypes.BUG) {
		const {tasks, bugs} = projectDetails;
		const itemDetails =
			taskType === projectTaskTypes.TASK
				? tasks.items[taskId]
				: bugs.items[taskId];

		if (itemDetails) {
			// Use estimateLineItemResourceAllocationMap to get allocated resources
			const allocatedResources =
				projectDetails.estimateLineItemResourceAllocationMap[taskId] || [];

			// Iterate over each allocated resource
			allocatedResources.forEach((resourceId) => {
				// Get the resource allocation details
				const resourceAllocationDetails =
					projectDetails.resourceAllocations.items[resourceId];
				const resourceAllocation =
					projectDetails.estimateResources.items[
						resourceAllocationDetails.estimateResourceId
					];

				const {employeeId, resourceRole, projectRoleId} = resourceAllocation;

				// Get the planned hours from resource allocation details
				const billedHoursDecimal = new Decimal(
					resourceAllocationDetails.billedHours,
				);
				const writeOffDecimal = new Decimal(resourceAllocationDetails.writeOff);

				// Perform addition using Decimal objects
				const plannedHours = billedHoursDecimal
					.plus(writeOffDecimal)
					.toNumber();

				processResourceAllocation(
					employeeId,
					resourceRole,
					projectRoleId,
					plannedHours,
				);
			});
		}
	}
	return tableData;
}

function formatAssignees(
	projectDetails: iProjectDetails,
	multiEmployeeDetails: iMultiEmployeeDetails, // Argument for retrieving all active employees
) {
	const multiAssigneeList: Array<{
		value: string;
		label: string;
	}> = [];
	let activeEmployeeIds;
	if (multiEmployeeDetails) {
		activeEmployeeIds = multiEmployeeDetails.ids;
	}
	const {estimateResources} = projectDetails;
	const estimateResourceIds = estimateResources.ids;

	for (const estimateResourceId of estimateResourceIds) {
		const estimateResource = estimateResources.items[estimateResourceId];

		const {employeeId, resourceRole} = estimateResource;

		let employeeName = "";
		let isActive = true;

		if (employeeId) {
			// Get employee details from multiEmployeeDetails instead of projectDetails
			const employeeDetails = multiEmployeeDetails.items[employeeId];
			if (employeeDetails) {
				const {firstName, lastName} = employeeDetails;

				employeeName = `${firstName} ${lastName} - `;
			}

			// Check if the employee is inactive
			if (activeEmployeeIds && !activeEmployeeIds.includes(employeeId)) {
				isActive = false;
			}
		}
		// add  inactive status with onactive employee
		const label = isActive
			? `${employeeName} - ${resourceRole}`
			: `${employeeName} - ${resourceRole} (Inactive)`;

		multiAssigneeList.push({
			value: estimateResourceId,
			label,
		});
	}

	return multiAssigneeList;
}

function detectCircularDependency(
	projectDetails: iProjectDetails,
	taskId: string,
	updatedLinkedTaskId: string,
) {
	const {tasks, bugs} = projectDetails;

	// Function to get the item regardless of whether it's a task or bug
	const getItem = (id: string) => {
		return tasks.items[id] || bugs.items[id];
	};

	const itemToUpdate = getItem(taskId);

	if (!itemToUpdate) {
		console.error(`Item with id ${taskId} not found`);
		return false;
	}

	const {linkedBy} = itemToUpdate;

	/**
	 * Check for self dependency
	 */
	if (taskId === updatedLinkedTaskId) {
		return true;
	}

	/**
	 * Check for circular dependency
	 * If the itemToUpdate is linked to the updatedLinkedTaskId, then there is a circular dependency.
	 * If the itemToUpdate is linked to another item, then check if that item is linked to the updatedLinkedTaskId.
	 */
	if (linkedBy) {
		for (const linkedByItemId of linkedBy) {
			if (linkedByItemId === updatedLinkedTaskId) {
				return true;
			}

			const isCircularDependency = detectCircularDependency(
				projectDetails,
				linkedByItemId,
				updatedLinkedTaskId,
			);

			if (isCircularDependency) {
				return true;
			}
		}
	}

	return false;
}

function computeProjectStartDateAndEndDate(rawData: iProjectDetails): {
	startDate: string;
	endDate: string;
} {
	const projectStartEndDate: {
		startDate: moment.Moment | null;
		endDate: moment.Moment | null;
	} = {
		startDate: null,
		endDate: null,
	};

	const {phases} = rawData;
	const {ids} = phases;

	ids.forEach((phaseId) => {
		const {startDate: phaseStartDate, endDate: phaseEndDate} =
			phases.items[phaseId];

		if (phaseStartDate) {
			const mPhaseStartDate = DateTimeUtil.toServerDateTime(phaseStartDate);

			if (!projectStartEndDate.startDate) {
				projectStartEndDate.startDate = mPhaseStartDate.clone();
			} else {
				if (
					projectStartEndDate.startDate &&
					mPhaseStartDate.isBefore(projectStartEndDate.startDate)
				) {
					projectStartEndDate.startDate = mPhaseStartDate.clone();
				}
			}
		}

		if (phaseEndDate) {
			const mPhaseEndDate = DateTimeUtil.toServerDateTime(phaseEndDate);

			if (!projectStartEndDate.endDate) {
				projectStartEndDate.endDate = mPhaseEndDate.clone();
			} else {
				if (mPhaseEndDate.isAfter(projectStartEndDate.endDate)) {
					projectStartEndDate.endDate = mPhaseEndDate.clone();
				}
			}
		}
	});

	return {
		startDate:
			(projectStartEndDate.startDate &&
				projectStartEndDate.startDate.format("MM-DD-YYYY")) ||
			"",
		endDate:
			(projectStartEndDate.endDate &&
				projectStartEndDate.endDate.format("MM-DD-YYYY")) ||
			"",
	};
}

function computeProjectCompletionPercentage(rawData: iProjectDetails): number {
	const {tasks, bugs} = rawData;
	let totalHours = new Decimal("0.00");
	let completedHours = new Decimal("0.00");

	// Process tasks
	tasks.ids.forEach((taskId) => {
		const {hours, status} = tasks.items[taskId];
		const result = updateCompletionHours(hours, status);
		totalHours = totalHours.add(result.itemHours);
		completedHours = completedHours.add(result.itemCompletedHours);
	});

	// Process bugs
	if (bugs && bugs.ids) {
		bugs.ids.forEach((bugId) => {
			const {hours, status} = bugs.items[bugId];
			const result = updateCompletionHours(hours, status);
			totalHours = totalHours.add(result.itemHours);
			completedHours = completedHours.add(result.itemCompletedHours);
		});
	}

	if (totalHours.isZero()) {
		return 0;
	}

	return completedHours
		.div(totalHours)
		.mul(100)
		.toSignificantDigits(4)
		.toNumber();
}

function updateCompletionHours(
	hours: Number | null | undefined,
	status: string | null | undefined,
): {itemHours: Decimal; itemCompletedHours: Decimal} {
	const itemHours = new Decimal(hours?.toString() || "0.00");
	let itemCompletedHours = new Decimal("0.00");

	/**
	 * FIXME: The status ID is hardcoded here. This should be changed to a constant.
	 */
	if (status === doneStatusType.DONE) {
		itemCompletedHours = itemHours;
	}

	return {itemHours, itemCompletedHours};
}

function computeProjectSummary(
	projectDetails: iProjectDetails,
	projectSummary: ProjectSummaryTypeWithoutDetails,
): {
	totalCost: string;
	totalHours: string;
	totalRevenue: string;
	totalBilledHours: string;
	totalWriteoffHours: string;
	startDate: string;
	endDate: string;
	completedPercentage: number;
	remainingBudget: string;
} {
	const {
		resourceAllocations,
		estimateResources,
		tasks,
		bugs,
		modules,
		estimateLineItemResourceAllocationMap,
	} = projectDetails;
	const {contractType} = projectSummary;
	const {
		totalCost,
		totalHours,
		totalRevenue,
		totalBilledHours,
		totalWriteoffHours,
	} = OptimizedProjectUtil.calculateProjectSummaryOptimized(
		resourceAllocations,
		estimateResources,
		tasks,
		bugs,
		modules,
		estimateLineItemResourceAllocationMap,
		contractType,
	);

	const {startDate, endDate} =
		ProjectUtil.computeProjectStartDateAndEndDate(projectDetails);

	const completedPercentage =
		ProjectUtil.computeProjectCompletionPercentage(projectDetails);

	const remainingBudget = new Decimal(projectSummary.totalBudget)
		.sub(totalRevenue)
		.toString();

	return {
		totalCost,
		totalHours,
		totalRevenue,
		totalBilledHours,
		totalWriteoffHours,
		startDate,
		endDate,
		completedPercentage,
		remainingBudget,
	};
}

/**
 * FIXME: this function name and variable names inside it is not clear.
 * @param projectDetails
 * @returns
 */
function phasesList(projectDetails: iProjectDetails) {
	const multiPhaseList: Array<{
		value: string;
		label: string;
	}> = [];

	const phasesList = projectDetails.phases.ids;

	const multiPhasesItems = projectDetails.phases.items;

	for (const phasesId of phasesList) {
		const phases = multiPhasesItems[phasesId];

		const phaseName = `${phases.name}`;
		const phaseId = `${phases.id}`;
		multiPhaseList.push({
			value: phaseId,
			label: phaseName,
		});
	}

	return multiPhaseList;
}

/**
 * Extracts the number from the UID of a task.
 * The UID will be in the format of "P 1", "M 1", or "TSK 1".
 * @param uid - The UID of the task
 * @returns - The number extracted from the UID
 */
function extractNumberFromUID(uid: string): number {
	// UID will be in the format of "P 1", "M 1", or "TSK 1"
	const uidParts = uid.split(" ");

	const uidNumber = parseInt(uidParts[1]);

	return uidNumber;
}

const findMaxUIDNumber = <T extends {uid: string}>(items: T[]): number => {
	let maxUIDNumber = 0;
	items.forEach((item) => {
		const uidNumber = ProjectUtil.extractNumberFromUID(item.uid);
		if (uidNumber > maxUIDNumber) {
			maxUIDNumber = uidNumber;
		}
	});
	return maxUIDNumber;
};

/**
 * Checks if a task is overdue based on its end date and current status
 * by comparing the end date with the current date.
 *
 * @param endDate - The end date of the task
 * @param currentStatusId - The ID of the current status of the task
 * @returns - A boolean indicating whether the task is overdue
 */
function isTaskOverdue(
	endDate: NullableString,
	currentStatusId: NullableString,
): boolean {
	if (endDate) {
		const mDate = moment(endDate);

		if (mDate.isValid()) {
			const currentDate = moment();

			if (currentDate.isAfter(mDate, "day")) {
				const isOverdue = currentStatusId !== doneStatusType.DONE;

				return isOverdue;
			}
		}
	}

	return false;
}

function orderTasksByOrderLinks(
	phases: iMultiPhase,
	modules: iMultiModule,
	tasks: iMultiTask,
	bugs: iMultiBug,
): iProjectOrderedTaskIds {
	const reorderIds = (
		idsArray: StringArray,
		type: projectTaskTypes,
		parentId: string | null = null,
	) => {
		if (idsArray.length === 0) {
			return [];
		}

		// Create dictionaries to store the mapping of elements to their prev and next
		const prevMap: {[key: string]: string | null} = {};
		const nextMap: {[key: string]: string | null} = {};
		let startItemId: string | null = null;

		// Create new objects with updated parentId
		const updatedItems: {
			[key: string]: iTaskItem | iModuleItem | iPhaseItem | iBugItem;
		} = {};

		idsArray.forEach((itemId) => {
			let item: iTaskItem | iModuleItem | iPhaseItem | iBugItem;

			if (type === projectTaskTypes.TASK) {
				/**
				 * If the type is TASK, then it could be a task or a bug.
				 */
				if (tasks.items[itemId]) {
					item = tasks.items[itemId];
				} else {
					item = bugs.items[itemId];
				}
			} else if (type === projectTaskTypes.MODULE) {
				item = modules.items[itemId];
			} else {
				item = phases.items[itemId];
			}

			if (item) {
				prevMap[itemId] = item.previousTaskId;
				nextMap[itemId] = item.nextTaskId;

				// Create a new object with updated parentId
				updatedItems[itemId] = {
					...item,
					parentId: parentId !== null ? parentId : item.parentId,
				};

				if (item.previousTaskId === null) {
					startItemId = item.id;
				}
			}
		});

		if (startItemId === null && idsArray.length > 0) {
			startItemId = idsArray[0];
		}

		const orderedIdsArray: StringArray = [];
		let currentItemId: string | null = startItemId;

		while (currentItemId !== null && orderedIdsArray.length < idsArray.length) {
			const currentItem = updatedItems[currentItemId];

			if (currentItem) {
				orderedIdsArray.push(currentItemId);
				currentItemId = nextMap[currentItemId] || null;
			} else {
				const nextUnprocessedId = idsArray.find((id) => {
					return !orderedIdsArray.includes(id);
				});
				currentItemId = nextUnprocessedId || null;
			}
		}

		return orderedIdsArray;
	};

	const orderedPhaseIdsArray = reorderIds(phases.ids, projectTaskTypes.PHASE);
	const orderedModuleIdsArray: StringArray = [];
	const orderedTaskIdsArray: StringArray = [];

	orderedPhaseIdsArray.forEach((phaseId) => {
		const phaseItem = phases.items[phaseId];
		if (phaseItem) {
			const moduleIds = phaseItem.childrenIds;
			const orderedModuleIds = reorderIds(
				moduleIds,
				projectTaskTypes.MODULE,
				phaseId,
			);
			orderedModuleIdsArray.push(...orderedModuleIds);

			orderedModuleIds.forEach((moduleId) => {
				const moduleItem = modules.items[moduleId];
				if (moduleItem) {
					const taskIds = moduleItem.childrenIds.filter((id) => {
						return tasks.items[id];
					});

					const bugIds = moduleItem.childrenIds.filter((id) => {
						return bugs.items[id];
					});

					orderedTaskIdsArray.push(
						...reorderIds(
							/**
							 * Concatenating the taskIds and bugIds to get the ordered list of tasks and bugs.
							 * This is because both tasks and bugs are comes under the same level in the hierarchy.
							 * Both these types comes as the children of a module.
							 */
							[...taskIds, ...bugIds],
							// Passing the type as TASK, as the reorderIds function will handle both tasks and bugs.
							projectTaskTypes.TASK,
							moduleId,
						),
					);
				}
			});
		}
	});

	return {
		orderedPhaseIds: orderedPhaseIdsArray,
		orderedModuleIds: orderedModuleIdsArray,
		orderedTaskIds: orderedTaskIdsArray,
	};
}

function getProjectSummaryTaskTypeObjectName(taskType: projectTaskTypes) {
	switch (taskType) {
		case projectTaskTypes.TASK:
			return "tasks";
		case projectTaskTypes.MODULE:
			return "modules";
		case projectTaskTypes.PHASE:
			return "phases";
		default:
			throw new Error(`Invalid task type: ${taskType}`);
	}
}

/**
 * Checks if a task is dropped on the same location.
 *
 * @param projectDetails - The project details.
 * @param idOfTheTaskBeingMoved - The ID of the task being moved.
 * @param findTargetIdAndGetNeighborsResponse - The response from the findTargetIdAndGetNeighbors function.
 * @returns A boolean indicating whether the task is dropped on the same location.
 * @throws Error if the task with the given ID is not found in the project details or if finding the target ID and neighbors fails.
 */
function isDroppedOnTheSameLocation(
	projectDetails: iProjectDetails,
	idOfTheTaskBeingMoved: string,
	findTargetIdAndGetNeighborsResponse: {
		isSuccess: boolean;
		taskType: projectTaskTypes | null;
		newParentId: NullableString;
		newPreviousTaskId: NullableString;
		newNextTaskId: NullableString;
	},
): boolean {
	const currentTaskDetails = ProjectUtil.getTaskFromProjectDetails(
		idOfTheTaskBeingMoved,
		projectDetails,
	);

	if (!currentTaskDetails) {
		throw new Error(
			`Task with id ${idOfTheTaskBeingMoved} not found in project details.`,
		);
	}

	const {isSuccess, taskType, newParentId, newPreviousTaskId, newNextTaskId} =
		findTargetIdAndGetNeighborsResponse;

	if (!isSuccess) {
		throw new Error(`Failed to find target id and get neighbors.`);
	}

	/**
	 * If the type of the task which is being moved is a phase, then the parent id
	 * of the task will be null. In such cases, we need to set the current parent id
	 * to null, otherwise the safety checks will give false positives.
	 *
	 * The reason for this is that, in redux, the parent id of the task of type PHASE
	 * is undefined. But the findTargetIdAndGetNeighbors function will return the parent
	 * id as null for the task of type PHASE. Thus, we need to set the current parent id
	 * to null, if the task type is PHASE.
	 */
	const currentParentId =
		taskType === projectTaskTypes.PHASE ? null : currentTaskDetails.parentId;

	if (
		currentParentId === newParentId &&
		currentTaskDetails.nextTaskId === newNextTaskId &&
		(currentTaskDetails.previousTaskId === newPreviousTaskId ||
			/**
			 * If the task is being moved to the same location, then sometimes the previous task id
			 * will be the same as the new previous task id. In such cases, we don't need to make any
			 * API calls to update the task order. We can simply return from here.
			 */
			idOfTheTaskBeingMoved === newPreviousTaskId)
	) {
		return true;
	}

	return false;
}

/**
 * Retrieves the project sync source based on the provided flag.
 * If the `hasSyncDisabled` flag is true, the project sync source will be the planning module.
 * Otherwise, the project sync source will be the estimation sheet.
 *
 * @param hasSyncDisabled - A boolean flag indicating whether project sync is disabled.
 * @returns The project sync source.
 */
function getProjectSyncSource(hasSyncDisabled: boolean): projectSyncSources {
	let projectSyncSource: projectSyncSources =
		projectSyncSources.ESTIMATION_SHEET;

	/**
	 * If the hasSyncDisabled flag is true, then the project sync source will be the planning module.
	 * Otherwise, the project sync source will be the estimation sheet.
	 */
	if (hasSyncDisabled) {
		projectSyncSource = projectSyncSources.PLANNING_MODULE;
	}

	return projectSyncSource;
}

const ProjectUtil = {
	getTaskFromProjectDetails,
	calculateProjectSummary,
	formatOptions,
	formatAssignees,
	formatAssigneesForTable,
	buildDateUpdatesOnDependencyChange,
	getTaskIdFromUid,
	detectCircularDependency,
	computeProjectStartDateAndEndDate,
	computeProjectCompletionPercentage,
	computeProjectSummary,
	phasesList,
	extractNumberFromUID,
	findMaxUIDNumber,
	isTaskOverdue,
	formatTimeLogsForTable,
	orderTasksByOrderLinks,
	findTargetIdAndGetNeighbors,
	getProjectSummaryTaskTypeObjectName,
	isDroppedOnTheSameLocation,
	getProjectSyncSource,
};

export default ProjectUtil;
