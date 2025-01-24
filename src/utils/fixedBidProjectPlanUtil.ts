import Decimal from "decimal.js";

import {
	doneStatusType,
	projectContractTypes,
	projectsStatusTypes,
	projectTaskTypes,
} from "@/constants/projectConstants";
import {
	iProjectDetails,
	iProjectDetailsTableRowData,
	iBugItem,
	iModuleItem,
	iPhaseItem,
	iTaskItem,
	iProjectSummary,
	iProjectDetailsTableTaskRowData,
} from "@/customTypes/appDataTypes/projectTypes";
import {
	iProjectDetailsTableRowDataForFixBidNew,
	iAccruedDragAndDropValidationResult,
	iFixedBidTaskItem,
	iModuleUpdate,
	iModuleRowData,
} from "@/customTypes/appDataTypes/fixedBidProjectTypes";
import {NullableBoolean} from "@/customTypes/CommonTypes";

/**
 *  Checks deletion rules specific to Fixed Bid New project covering tasks, modules, phases, and bugs..
 *
 * @param {string[]} selectedTaskIds - Array of selected task IDs.
 * @param {iProjectSummary} projectSummary - The project summary object.
 * @param {iProjectDetails} projectDetails - The project details object.
 * @returns {{
 *   shouldPreventDeletion: boolean;
 *   alertMessage?: string;
 * }} - Returns an object indicating if deletion is prevented, qualified IDs for deletion, and optional alert messages.
 */
const validateFixedBidNewDeletionRules = (
	selectedTaskIds: string[],
	projectSummary: iProjectSummary,
	projectDetails: iProjectDetails,
): {
	shouldPreventDeletion: boolean;
	alertMessage?: string;
} => {
	// Step 1: Disable the delete feature if the project is Fixed Bid New and in WIP status
	const isFixedBidNew =
		projectSummary.contractType === projectContractTypes.FIXED_BID_NEW;
	const isConfirmed = !!projectSummary.approverInfo?.approvedBy;
	const isWipAndConfirmed =
		projectSummary.projectStatusId === projectsStatusTypes.WIP && isConfirmed;

	if (isFixedBidNew && isWipAndConfirmed) {
		return {
			shouldPreventDeletion: true,
			alertMessage:
				"The delete feature is disabled for Fixed Bid New projects that have been confirmed and are in 'WIP' status.",
		};
	}

	// Step 2: Check for Fixed Bid New-specific logic (e.g., accrued tasks)
	// Checks if there are any accrued tasks in the selected tasks for a FIXED_BID_NEW project.
	// If accrued tasks are found, it prevents their deletion and shows an alert.
	const accruedTasks: string[] = [];

	selectedTaskIds.forEach((taskId) => {
		const taskItem =
			projectDetails.tasks.items[taskId] ||
			projectDetails.bugs.items[taskId] ||
			projectDetails.modules.items[taskId] ||
			projectDetails.phases.items[taskId];

		if (taskItem?.isAccrued) {
			accruedTasks.push(taskItem.uid);
		}
	});

	if (accruedTasks.length > 0) {
		const concatenatedAccruedTasks = accruedTasks.join(", ");
		return {
			shouldPreventDeletion: true,
			alertMessage: `The following tasks cannot be deleted as they are accrued:\n\n${concatenatedAccruedTasks}`,
		};
	}

	// Return success if all rules are satisfied
	return {
		shouldPreventDeletion: false,
	};
};

export function shouldDisableForFixedBidNew(
	contractType: projectContractTypes | null,
	rowData: iProjectDetailsTableRowData,
): boolean {
	// Check if the project type is FIXED_BID_NEW
	if (contractType === projectContractTypes.FIXED_BID_NEW) {
		//Check if the row is accrued
		if (rowData.isAccrued === true) {
			return true;
		}
	}

	// Return false for all other cases
	return false;
}

// need to refactor this funtion we can use the isRowTaskAccrued function instead
/**
 * Checks if a phase is accrued in a FIXED_BID_NEW project.
 *
 * @param {projectContractTypes} contractType - The type of the project.
 * @param {string} phaseId - The ID of the phase to check.
 * @param {iProjectDetails} projectDetails - The details of the project.
 * @returns {boolean} - Returns true if the phase is accrued, otherwise false.
 */
export function isPhaseAccrued(
	contractType: projectContractTypes,
	phaseId: string,
	projectDetails: iProjectDetails,
): boolean {
	if (contractType === projectContractTypes.FIXED_BID_NEW) {
		return projectDetails.phases.items[phaseId]?.isAccrued || false;
	}
	return false;
}

// need to refactor this funtion we can use the isRowTaskAccrued function instead
/**
 * Checks if a module is accrued in a FIXED_BID_NEW project otherwise return false.
 *
 * @param {projectContractTypes} contractType - The type of the project.
 * @param {string} moduleId - The ID of the module to check.
 * @param {iProjectDetails} projectDetails - The details of the project.
 * @returns {boolean} - Returns true if the module is accrued, otherwise false.
 */
export function isModuleAccrued(
	contractType: projectContractTypes | null,
	moduleId: string,
	projectDetails: iProjectDetails,
): boolean {
	if (contractType === projectContractTypes.FIXED_BID_NEW) {
		return projectDetails.modules.items[moduleId]?.isAccrued || false;
	}
	return false;
}

// need to refactor this funtion we can use the isRowTaskAccrued function instead
/**
 * Determines if a given task or module is accrued based on the project type and task details.
 *
 * @param {iProjectDetailsTableRowData | iProjectDetailsTableRowDataForFixBidNew} rowData - The row data of the task.
 * @param {projectContractTypes} contractType - The type of the project.
 * @returns {boolean} - Returns `true` if the task or module is accrued and the project type is `FIXED_BID_NEW`, otherwise `false`.
 */
export function isTaskAccrued(
	rowData:
		| iProjectDetailsTableRowData
		| iProjectDetailsTableRowDataForFixBidNew
		| iFixedBidTaskItem,
	contractType: projectContractTypes | null,
): boolean {
	// Check if the contract type is FIXED_BID_NEW and the rowData has 'isAccrued' property
	if (
		contractType === projectContractTypes.FIXED_BID_NEW &&
		"isAccrued" in rowData
	) {
		return rowData.isAccrued === true;
	}
	return false;
}

/**
 * Checks if a task, bug, module, or phase is accrued in a FIXED_BID_NEW project.
 *
 * @param {projectContractTypes} contractType - The type of the project.
 * @param {projectTaskTypes} rowTaskType - The type of the row task to check.
 * @param {string} rowTaskId - The ID of the task, bug, module, or phase to check.
 * @param {iProjectDetails} projectDetails - The details of the project.
 * @returns {boolean} - Returns true if the task is accrued, otherwise false.
 */
export function isRowTaskAccrued(
	contractType: projectContractTypes | null,
	rowTaskType: projectTaskTypes,
	rowTaskId: string,
	projectDetails: iProjectDetails,
): boolean {
	if (contractType === projectContractTypes.FIXED_BID_NEW) {
		switch (rowTaskType) {
			case projectTaskTypes.TASK:
				return projectDetails.tasks.items[rowTaskId]?.isAccrued || false;
			case projectTaskTypes.BUG:
				return projectDetails.bugs.items[rowTaskId]?.isAccrued || false;
			case projectTaskTypes.MODULE:
				return projectDetails.modules.items[rowTaskId]?.isAccrued || false;
			case projectTaskTypes.PHASE:
				return projectDetails.phases.items[rowTaskId]?.isAccrued || false;
			default:
				return false;
		}
	}
	return false;
}

/**
 * Determines if a new bug can be added to module based on the project type, active tab, selected dropdown, and status.
 *
 * @param {projectContractTypes} contractType - The type of the project.
 * @param {string} activeTab - The current active tab in the UI.
 * @param {string} dropdownLabel - The label of the dropdown being checked.
 * @param {boolean} isModuleAccruedOrKilled - Whether the selected module is accrued or killed.
 * @returns {boolean} - Returns true if a bug cannot be added, otherwise false.
 */
export function shouldPreventAddingNewBugToModule(
	contractType: projectContractTypes | null,
	activeTab: string,
	dropdownLabel: string,
	isModuleAccruedOrKilled: boolean,
): boolean {
	return (
		contractType === projectContractTypes.FIXED_BID_NEW &&
		activeTab === "tab4" &&
		dropdownLabel === "Module" &&
		isModuleAccruedOrKilled
	);
}

/**
 * Validates whether an accrued module can be dragged and dropped to a new phase within the planning module.
 *
 * @param {projectContractTypes} contractType - The type of the project.
 * @param {iTaskItem | iBugItem | iModuleItem | iPhaseItem} currentTaskDetails - The current details of the task being dragged.
 * @param {string | null} newParentId - The ID of the new parent task where the module is being dropped.
 * @returns {iAccruedDragAndDropValidationResult} - Returns an object containing a boolean `isValid` and an optional `message` if the move is not valid.
 */
export function validateAccruedModuleDragAndDrop(
	contractType: projectContractTypes,
	currentTaskDetails: iTaskItem | iBugItem | iModuleItem | iPhaseItem,
	newParentId: string | null,
): iAccruedDragAndDropValidationResult {
	// Accessing the parentId directly from currentTaskDetails
	const currentParentId = currentTaskDetails.parentId ?? null;

	if (
		contractType === projectContractTypes.FIXED_BID_NEW &&
		currentTaskDetails.type === projectTaskTypes.MODULE &&
		"isAccrued" in currentTaskDetails &&
		currentTaskDetails.isAccrued &&
		newParentId !== currentParentId
	) {
		return {
			isValid: false,
			message:
				"Accrued modules cannot be moved to another phase. Please move it within the same phase.",
		};
	}
	return {isValid: true};
}

/**
 * Validates whether an accrued task can be dragged and dropped to a new module within the planning module.
 *
 * @param {projectContractTypes} contractType - The type of the project.
 * @param {iTaskItem | iBugItem | iModuleItem | iPhaseItem} currentTaskDetails - The current details of the task being dragged.
 * @param {string | null} newParentId - The ID of the new parent task where the task is being dropped.
 * @returns {iAccruedDragAndDropValidationResult} - Returns an object containing a boolean `isValid` and an optional `message` if the move is not valid.
 */
export function validateAccruedTaskDragAndDrop(
	contractType: projectContractTypes,
	currentTaskDetails: iTaskItem | iBugItem | iModuleItem | iPhaseItem,
	newParentId: string | null,
): iAccruedDragAndDropValidationResult {
	// Accessing the parentId directly from currentTaskDetails
	const currentParentId = currentTaskDetails.parentId ?? null;

	if (
		contractType === projectContractTypes.FIXED_BID_NEW &&
		currentTaskDetails.type === projectTaskTypes.TASK &&
		"isAccrued" in currentTaskDetails &&
		currentTaskDetails.isAccrued &&
		newParentId !== currentParentId
	) {
		return {
			isValid: false,
			message:
				"Accrued tasks cannot be moved out of their module. Please keep it within the same module.",
		};
	}
	return {isValid: true};
}

/**
 * Validates whether a task can be added to an accrued module during a drag and drop operation within the project structure.
 *
 * @param {projectContractTypes} contractType - The type of the project.
 * @param {iTaskItem | iBugItem | iModuleItem | iPhaseItem} currentTaskDetails - The current details of the task being dragged.
 * @param {string | null} newParentId - The ID of the new parent task where the task is being dropped.
 * @param {iProjectDetails} projectDetails - The overall details of the project.
 * @returns {iAccruedDragAndDropValidationResult} - Returns an object containing a boolean `isValid` and an optional `message` if the move is not valid.
 */
export function validateAddingToAccruedModuleDuringDragAndDrop(
	contractType: projectContractTypes,
	currentTaskDetails: iTaskItem | iBugItem | iModuleItem | iPhaseItem,
	newParentId: string | null,
	projectDetails: iProjectDetails,
): iAccruedDragAndDropValidationResult {
	if (
		contractType === projectContractTypes.FIXED_BID_NEW &&
		currentTaskDetails.type === projectTaskTypes.TASK &&
		"isAccrued" in currentTaskDetails &&
		currentTaskDetails.isAccrued &&
		newParentId !== null &&
		projectDetails.modules.items[newParentId]?.isAccrued
	) {
		return {
			isValid: false,
			message: "Adding new tasks into an Accrued module is not allowed.",
		};
	}
	return {isValid: true};
}

/**
 * Filters dropdown options based on whether the task is accrued.
 *
 * @param {Array<{ id: string; uid: string; name: string }>} options - The full list of dropdown options.
 * @param {NullableBoolean} isAccrued - A flag indicating if the task is accrued.
 * @param {string} selectedValue - The currently selected option value.
 * @param {string} previousSelectedValue - The previously selected option value.
 * @returns {Array<{ id: string; uid: string; name: string }>} - The filtered list of dropdown options if accrued, or the full list otherwise.
 */

const getOptionsForLinkedToDropdown = (
	options: {id: string; uid: string; name: string}[],
	isAccrued: NullableBoolean,
	selectedValue: string,
	previousSelectedValue: string,
): {id: string; uid: string; name: string}[] => {
	// If not accrued, return all options directly
	if (!isAccrued) {
		return options;
	}

	// Filter only if accrued
	return options.filter((item) => {
		return (
			item.id === selectedValue ||
			item.id === "none" ||
			item.id === previousSelectedValue
		);
	});
};

/**
 * Extracts project status flags for Fixed Bid New and related checks.
 * @param projectSummary - The project summary object.
 * @returns An object containing the computed flags.
 */
export const getProjectStatusFlags = (projectSummary: iProjectSummary) => {
	const isFixedBidNew =
		projectSummary.contractType === projectContractTypes.FIXED_BID_NEW;

	const isConfirmed = !!projectSummary.approverInfo?.approvedBy;

	const isWipAndConfirmed =
		projectSummary.projectStatusId === projectsStatusTypes.WIP && isConfirmed;

	const isWinPending =
		projectSummary.projectStatusId === projectsStatusTypes["Win Pending"];

	return {
		isFixedBidNew,
		isConfirmed,
		isWipAndConfirmed,
		isWinPending,
	};
};

/**
 * Distributes the planned revenue and calculates the profit percentage for tasks, bugs, and the module itself.
 *
 * This function takes the total planned revenue for a module (`modulePlannedRevenue`) and proportionally distributes it
 * across all associated tasks, bugs, and sub-modules based on their respective planned hours. The formula for this distribution is:
 *
 * Task Planned Revenue = (Module Planned Revenue / Total Module Planned Hours) * Task Planned Hours
 *
 * It also calculates the profit percentage for each task and the module by using the planned revenue and associated costs.
 *
 * @param moduleRow - The module data containing tasks, bugs, the parent phase, and module-specific information.
 * @param modulePlannedRevenue - The total planned revenue assigned to the module.
 * @returns The updated `moduleRow` object with distributed planned revenue and calculated profit percentages for each task and the module.
 */

function distributeRevenueAndCalculateProfit(
	moduleRow: iModuleRowData,
	modulePlannedRevenue: number,
): iModuleRowData {
	// Calculate total planned hours for non-accrued tasks
	const totalPlannedHours = moduleRow.children.reduce(
		(sum: number, item: iProjectDetailsTableTaskRowData) => {
			const hours = Number(item.hours);
			if (!isNaN(hours) && hours > 0 && item.status !== doneStatusType.DONE) {
				return sum + hours;
			}
			return sum;
		},
		0,
	);

	// Calculate the sum of planned revenue for accrued tasks
	const sumOfAccruedTasksPlannedRevenue = moduleRow.children.reduce(
		(sum: number, item: iProjectDetailsTableTaskRowData) => {
			if (item.status === doneStatusType.DONE) {
				return sum + Number(item.plannedRevenue);
			}
			return sum;
		},
		0,
	);

	// Calculate the remaining budget
	const remainingBudget =
		modulePlannedRevenue - sumOfAccruedTasksPlannedRevenue;

	let totalModuleCost = 0;
	const updatedChildren: Array<iProjectDetailsTableTaskRowData> = [];

	// Distribute revenue across each item using forEach
	moduleRow.children.forEach((item: iProjectDetailsTableTaskRowData) => {
		const hours = Number(item.hours);
		let plannedRevenue = Number(item.plannedRevenue);
		const cost = Number(item.cost);

		if (item.status !== doneStatusType.DONE) {
			if (!isNaN(hours) && hours > 0) {
				plannedRevenue = (remainingBudget / totalPlannedHours) * hours;
			} else {
				plannedRevenue = 0;
			}
		}

		totalModuleCost += cost;

		// Calculate profit percentage for the item
		const profitPercentage = calculateProfitPercentage(plannedRevenue, cost);

		// Push the updated item into the new array
		updatedChildren.push({
			...item,
			plannedRevenue: String(Math.round(plannedRevenue)),
			profitPercentage,
		});
	});

	// Calculate profit percentage for the entire module
	const moduleProfitPercentage = calculateProfitPercentage(
		modulePlannedRevenue,
		totalModuleCost,
	);

	// Return the updated moduleRow with the new children
	return {
		...moduleRow,
		children: updatedChildren,
		plannedRevenue: String(Math.round(modulePlannedRevenue)),
		profitPercentage: moduleProfitPercentage,
	};
}

/**
 * Calculates the profit percentage based on the planned revenue and planned cost.
 *
 * The profit percentage is determined using the formula:
 *
 * Profit Percentage = ((Planned Revenue - Planned Cost) / Planned Cost) * 100
 *
 * This function converts the `plannedRevenue` and `plannedCost` to Decimal values for accurate precision and checks for cases where
 * either value is zero or results in a negative profit. If any invalid conditions are met, the profit percentage is set to "0.00".
 *
 * The result is returned as a string, formatted to two decimal places for display purposes.
 *
 * @param plannedRevenue - The total planned revenue for the task, module, or phase.
 * @param plannedCost - The total planned cost for the task, module, or phase.
 * @returns The profit percentage as a string, formatted to two decimal places. If invalid values are detected, "0.00" is returned.
 */
function calculateProfitPercentage(
	plannedRevenue: number,
	plannedCost: number,
): string {
	// Validate inputs: Ensure they are finite numbers
	if (
		isNaN(plannedRevenue) ||
		isNaN(plannedCost) ||
		!isFinite(plannedRevenue) ||
		!isFinite(plannedCost)
	) {
		return "0.00";
	}

	// Convert the planned revenue and planned cost to Decimal
	const revenue = new Decimal(plannedRevenue);
	const cost = new Decimal(plannedCost);

	// Handle cases where revenue is zero
	if (revenue.isZero()) {
		// If revenue is zero and cost is also zero, return zero profit percentage
		if (cost.isZero()) {
			return "0.00";
		}
		// If revenue is zero and cost is positive, indicate extreme loss
		return "-100.00";
	} else if (revenue.isPositive() && cost.isZero()) {
		return "100.00";
	}

	// Calculate profit percentage, allowing for negative profits beyond -100%
	const profitPercentage = revenue.minus(cost).div(revenue).times(100);

	// Return the profit percentage formatted to nearest integer
	return profitPercentage.toNumber().toFixed(2);
}

/**
 * Calculates and updates the planned revenue for a module based on the provided profit percentage.
 *
 * This function computes the module's planned revenue by applying the given profit percentage to the module's
 * planned cost. The planned revenue is then used to update the module row data. The updated module row is
 * subsequently passed to the `distributeRevenueAndCalculateProfit` function to further distribute the revenue
 * and calculate the profit for each task and the module itself.
 *
 * @param moduleRow - The module data containing tasks, bugs, the parent phase, and module-specific information.
 * @param moduleProfitPercentage - The profit percentage to be applied to the module's planned cost to calculate
 *                                  the planned revenue.
 *
 * @returns The updated module row object, which includes the calculated planned revenue and profit percentage,
 *          and has been processed by the `distributeRevenueAndCalculateProfit` function to reflect revenue
 *          distribution and profit calculations for all associated tasks and the module itself.
 */
function calculateModuleRevenueFromProfit(
	moduleRow: iModuleRowData,
	moduleProfitPercentage: number,
): iModuleRowData {
	const modulePlannedCost = Number(moduleRow.cost);

	// Calculate the module planned revenue using the profit percentage
	const modulePlannedRevenue =
		modulePlannedCost / (1 - Number(moduleProfitPercentage) / 100);

	// Prepare the updated module row with calculated revenue and profit percentage
	const updatedModuleRow: iModuleRowData = {
		...moduleRow,
		plannedRevenue: Math.round(modulePlannedRevenue).toString(),
		profitPercentage: moduleProfitPercentage.toFixed(2).toString(),
	};

	// Distribute the revenue and calculate profit for each task and the module
	return distributeRevenueAndCalculateProfit(
		updatedModuleRow,
		modulePlannedRevenue,
	);
}

/**
 * Prepares data for saving planned revenue and profit information to the database and Redux store.
 *
 * This function calculates the total planned revenue and profit percentage for tasks, modules, and phases
 * based on the updated module row values. It updates the corresponding objects for database and Redux store
 * with the new values and returns them for further processing.
 *
 * @param projectDetails - The project details containing information about phases and modules.
 * @param updatedModuleRowValues - The updated row values for the module, including planned revenue and profit percentage.
 *
 * @returns An object containing the updates required for tasks, modules, and phases in both the database and Redux store.
 */
function prepareRevenueAndProfitDataForSave(
	projectDetails: iProjectDetails,
	updatedModuleRowValues: iModuleUpdate,
) {
	// Utility function to initialize update objects for phases, modules, and tasks
	const initializeUpdateObject = () => {
		return {
			ids: [] as string[],
			items: {} as Record<
				string,
				{id: string; plannedRevenue?: string; profitPercentage?: string}
			>,
		};
	};

	// Initialize update objects for database and Redux store
	const phasesToUpdateOnDB = initializeUpdateObject();
	const modulesToUpdateOnDB = initializeUpdateObject();
	const tasksToUpdateOnDB = initializeUpdateObject();
	const phasesToUpdateOnReduxStore = initializeUpdateObject();
	const modulesToUpdateOnReduxStore = initializeUpdateObject();
	const tasksToUpdateOnReduxStore = initializeUpdateObject();

	// Variables to accumulate planned revenue and profit percentage
	let plannedRevenueSum = 0.0;
	let profitPercentageSum = 0.0;

	// Process tasks and prepare the tasksToUpdate object
	updatedModuleRowValues.children.forEach((task) => {
		const {id} = task;

		tasksToUpdateOnDB.ids.push(id);
		tasksToUpdateOnDB.items[id] = {
			id: id,
			plannedRevenue: Math.round(
				parseFloat(task.plannedRevenue || "0"),
			).toString(),
		};

		tasksToUpdateOnReduxStore.ids.push(id);
		tasksToUpdateOnReduxStore.items[id] = {
			id: id,
			profitPercentage: String(task.profitPercentage),
		};
	});

	// Retrieve the parent phase ID and related module IDs
	const phaseId = updatedModuleRowValues.parentId;
	const moduleIds = projectDetails.phases.items[phaseId].childrenIds;

	// Calculate total planned revenue and profit percentage for modules
	moduleIds.forEach((moduleId) => {
		const moduleInfo = projectDetails.modules.items[moduleId];

		// Skip the current module being updated to avoid double counting
		if (updatedModuleRowValues.id !== moduleId) {
			plannedRevenueSum += Number(moduleInfo.plannedRevenue) || 0; // Add module's plannedRevenue to the sum
			profitPercentageSum += Number(moduleInfo.profitPercentage) || 0; // Add module's profitPercentage to the sum
		}
	});

	// Add the current module's revenue and profit to the phase totals
	const phasePlannedRevenue =
		plannedRevenueSum + Number(updatedModuleRowValues.plannedRevenue);
	const phaseProfitPercentage =
		profitPercentageSum + Number(updatedModuleRowValues.profitPercentage);

	// Update the phase with the calculated revenue and profit
	phasesToUpdateOnDB.ids.push(phaseId);
	phasesToUpdateOnDB.items[phaseId] = {
		id: phaseId,
		plannedRevenue: Math.round(phasePlannedRevenue).toString(),
	};

	// Update the phase with the calculated revenue and profitPercenatge in the redux store
	phasesToUpdateOnReduxStore.ids.push(phaseId);
	phasesToUpdateOnReduxStore.items[phaseId] = {
		id: phaseId,
		profitPercentage: String(phaseProfitPercentage), // Rounded phase profitPercentage
	};

	// Update the module itself with the new plannedRevenue and profitPercentage
	modulesToUpdateOnDB.ids.push(updatedModuleRowValues.id);
	modulesToUpdateOnDB.items[updatedModuleRowValues.id] = {
		id: updatedModuleRowValues.id,
		plannedRevenue: Math.round(
			parseFloat(updatedModuleRowValues.plannedRevenue || "0"),
		).toString(),
	};

	// Update the module itself with the new plannedRevenue and profitPercentage in the redux store
	modulesToUpdateOnReduxStore.ids.push(updatedModuleRowValues.id);
	modulesToUpdateOnReduxStore.items[updatedModuleRowValues.id] = {
		id: updatedModuleRowValues.id,
		profitPercentage: parseFloat(
			updatedModuleRowValues.profitPercentage || "0.00",
		)
			.toFixed(2)
			.toString(),
	};

	// Return the updates for tasks, modules, and phases
	return {
		tasksToUpdate: tasksToUpdateOnDB,
		modulesToUpdate: modulesToUpdateOnDB,
		phasesToUpdate: phasesToUpdateOnDB,
		tasksToUpdateOnReduxStore,
		modulesToUpdateOnReduxStore,
		phasesToUpdateOnReduxStore,
	};
}

/**
 * Checks if the project is a Fixed Bid New type
 * @param contractType - The type of the project contract
 * @returns boolean indicating if the project is Fixed Bid New type
 */
function isFixedBidNewProject(contractType: number): boolean {
	return contractType === projectContractTypes.FIXED_BID_NEW;
}

const FixedBidProjectPlanUtil = {
	shouldDisableForFixedBidNew,
	isPhaseAccrued,
	isModuleAccrued,
	isTaskAccrued,
	isRowTaskAccrued,
	shouldPreventAddingNewBugToModule,
	validateAccruedModuleDragAndDrop,
	validateAccruedTaskDragAndDrop,
	validateAddingToAccruedModuleDuringDragAndDrop,
	getOptionsForLinkedToDropdown,
	getProjectStatusFlags,
	validateFixedBidNewDeletionRules,
	distributeRevenueAndCalculateProfit,
	calculateProfitPercentage,
	calculateModuleRevenueFromProfit,
	prepareRevenueAndProfitDataForSave,
	isFixedBidNewProject,
};

export default FixedBidProjectPlanUtil;
