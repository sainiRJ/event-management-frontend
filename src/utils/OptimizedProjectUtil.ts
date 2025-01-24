/* eslint-disable indent */
import Decimal from "decimal.js";

import DateTimeUtil from "@utils/DateTImeUtil";

import {
	iBugItem,
	iEstimateLineItemPlannedRevenueCostMap,
	iEstimateLineItemResourceAllocationMap,
	iFormattedProjectDetailsForTable,
	iMultiBug,
	iMultiEstimateResource,
	iMultiModule,
	iMultiPhase,
	iMultiResourceAllocation,
	iMultiTask,
	iProjectDetailsTablePhaseRowData,
	iProjectOrderedTaskIds,
	iProjectPlan,
	iTaskItem,
	ProjectDetailsTableDataType,
} from "@/customTypes/appDataTypes/projectTypes";
import {
	defaultProjectTaskIdTypes,
	projectContractTypes,
	projectTaskTypes,
} from "@/constants/projectConstants";
import FixedBidProjectPlanUtil from "@/utils/fixedBidProjectPlanUtil";
/**
 * Function that formats the normalized data structure from redux store/api response to the
 * format required by the Table component.
 *
 * @returns `tableData [...]`
 */
function formatTableData(
	projectPlan: iProjectPlan,
	projectOrderedTaskIds: iProjectOrderedTaskIds,
	contractType?: projectContractTypes | null,
): iFormattedProjectDetailsForTable {
	const tableData: ProjectDetailsTableDataType = [];

	const isFixedBidNew = contractType === projectContractTypes.FIXED_BID_NEW;

	const {phases, modules, tasks, bugs} = projectPlan;
	const {orderedPhaseIds, orderedModuleIds, orderedTaskIds} =
		projectOrderedTaskIds;

	const phaseIdIndexMap: {[key in string]: number} = {};
	const moduleIdIndexMap: {[key in string]: number} = {};
	const taskIdIndexMap: {[key in string]: number} = {};
	const bugIdIndexMap: {[key in string]: number} = {};

	for (let phaseIndex = 0; phaseIndex < orderedPhaseIds.length; phaseIndex++) {
		const phaseId = orderedPhaseIds[phaseIndex];
		const {items} = phases;
		const phaseData = items[phaseId];
		const plannedRevenue = Math.round(
			parseFloat(phaseData.plannedRevenue || "0"),
		);

		const newLength = tableData.push({
			...phaseData,
			startDate:
				phaseData.startDate && DateTimeUtil.formatDate(phaseData.startDate),
			endDate: phaseData.endDate && DateTimeUtil.formatDate(phaseData.endDate),
			cost: "0.00",
			revenue: "0.00",
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			children: [] as Array<any>,
			plannedRevenue: plannedRevenue.toString(),
			profitPercentage: "0.00",
			fixedBidCost: 0,
		});
		const insertedIndex = newLength - 1;
		phaseIdIndexMap[phaseId] = insertedIndex;
	}

	for (
		let moduleIdIndex = 0;
		moduleIdIndex < orderedModuleIds.length;
		moduleIdIndex++
	) {
		const moduleId = orderedModuleIds[moduleIdIndex];
		const {items} = modules;
		const moduleData = items[moduleId];
		const plannedRevenue = Math.round(
			parseFloat(moduleData.plannedRevenue || "0"),
		);
		const profitPercentage = plannedRevenue > 0 ? "100" : "0.00";

		const moduleDataToPush = {
			...moduleData,
			startDate:
				moduleData.startDate && DateTimeUtil.formatDate(moduleData.startDate),
			endDate:
				moduleData.endDate && DateTimeUtil.formatDate(moduleData.endDate),
			cost: "0.00",
			revenue: "0.00",
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			children: [] as Array<any>,
			plannedRevenue: plannedRevenue.toString(),
			profitPercentage,
			fixedBidCost: 0,
		};

		const parentPhaseId = moduleData.parentId;
		if (parentPhaseId) {
			const indexOfPhase = phaseIdIndexMap[parentPhaseId];
			const newLength = tableData[indexOfPhase].children.push(moduleDataToPush);
			const insertedIndex = newLength - 1;
			moduleIdIndexMap[moduleId] = insertedIndex;
		}
	}

	const orderedItems = orderedTaskIds;
	for (let itemIndex = 0; itemIndex < orderedItems.length; itemIndex++) {
		const itemId = orderedItems[itemIndex];

		let itemData: iBugItem | iTaskItem;
		if (tasks.items[itemId]) {
			itemData = tasks.items[itemId];
		} else {
			itemData = bugs.items[itemId];
		}

		const concatenatedAllocatedResources = "";
		const itemRevenue = new Decimal("0.00");
		const itemCost = new Decimal("0.00");

		const plannedRevenue = Math.round(
			parseFloat(itemData.plannedRevenue || "0"),
		).toString();

		// Show profit percentage for tasks and bugs only if project type is FIXED_BID_NEW and the task is accrued otherwise show 0.00
		const isAccrued = itemData?.isAccrued;

		let profitPercentage = "0.00";

		if (isFixedBidNew && isAccrued) {
			const {plannedRevenue} = itemData;

			profitPercentage = FixedBidProjectPlanUtil.calculateProfitPercentage(
				Number(plannedRevenue),
				Number(itemCost),
			);
		}

		const itemDataToPush = {
			...itemData,
			assignees: concatenatedAllocatedResources,
			startDate:
				itemData.startDate && DateTimeUtil.formatDate(itemData.startDate),
			endDate: itemData.endDate && DateTimeUtil.formatDate(itemData.endDate),
			type: itemData.type,
			// Apply profit percentage if project is FixedBid and task is accrued
			profitPercentage: profitPercentage,
			isAccrued: itemData.isAccrued,
			plannedRevenue: plannedRevenue,
			fixedBidCost: 0,
			revenue: itemRevenue.toFixed(2),
			cost: itemCost.toFixed(2),
		};

		const parentModuleId = itemData.parentId;
		if (parentModuleId) {
			const {parentId: moduleParentPhaseId} = modules.items[parentModuleId];

			if (moduleParentPhaseId) {
				const indexOfPhase = phaseIdIndexMap[moduleParentPhaseId];
				const indexOfModule = moduleIdIndexMap[parentModuleId];

				const newLength =
					tableData[indexOfPhase].children[indexOfModule]?.children.push(
						itemDataToPush,
					);
				const insertedIndex = newLength - 1;
				if (itemData.type === projectTaskTypes.BUG) {
					bugIdIndexMap[itemId] = insertedIndex;
				} else {
					taskIdIndexMap[itemId] = insertedIndex;
				}
				// Update module and phase costs and revenues
				const {cost: moduleCost, revenue: moduleRevenue} =
					tableData[indexOfPhase].children[indexOfModule];

				let moduleCostInDecimal = new Decimal(moduleCost || "0.00");
				let moduleRevenueInDecimal = new Decimal(moduleRevenue || "0.00");

				moduleCostInDecimal = moduleCostInDecimal.add(itemCost);
				moduleRevenueInDecimal = moduleRevenueInDecimal.add(itemRevenue);

				const {cost: phaseCost, revenue: phaseRevenue} =
					tableData[indexOfPhase];

				let phaseCostInDecimal = new Decimal(phaseCost || "0.00");
				let phaseRevenueInDecimal = new Decimal(phaseRevenue || "0.00");

				phaseCostInDecimal = phaseCostInDecimal.add(itemCost);
				phaseRevenueInDecimal = phaseRevenueInDecimal.add(itemRevenue);

				tableData[indexOfPhase].children[indexOfModule].cost =
					moduleCostInDecimal.toFixed(2);
				tableData[indexOfPhase].children[indexOfModule].revenue =
					moduleRevenueInDecimal.toFixed(2);

				const modulePlannedRevenue = Number(
					tableData[indexOfPhase].children[indexOfModule].plannedRevenue,
				);
				const costInDecimal = Number(moduleCostInDecimal);

				const moduleProfitPercentage =
					costInDecimal === 0 && modulePlannedRevenue > costInDecimal
						? "100"
						: FixedBidProjectPlanUtil.calculateProfitPercentage(
								modulePlannedRevenue,
								costInDecimal,
							);

				// Profit percentage of module
				tableData[indexOfPhase].children[indexOfModule].profitPercentage =
					moduleProfitPercentage;

				tableData[indexOfPhase].cost = phaseCostInDecimal.toFixed(2);
				tableData[indexOfPhase].revenue = phaseRevenueInDecimal.toFixed(2);
				// Profit percentage of phase
				tableData[indexOfPhase].profitPercentage =
					FixedBidProjectPlanUtil.calculateProfitPercentage(
						Number(tableData[indexOfPhase].plannedRevenue),
						Number(tableData[indexOfPhase].cost),
					);
			}
		}
	}

	if (tableData.length > 0) {
		const placeholderPhaseRow: iProjectDetailsTablePhaseRowData = {
			id: defaultProjectTaskIdTypes.PLACEHOLDER,
			uid: defaultProjectTaskIdTypes.PLACEHOLDER,
			type: projectTaskTypes.PLACEHOLDER,
			name: "",
			startDate: null,
			endDate: null,
			linkedTo: null,
			status: null,
			notes: null,
			hours: null,
			duration: null,
			totalTimeLog: null,
			linkedBy: [],
			previousTaskId: null,
			nextTaskId: null,
			childrenIds: [],
			children: [],
			plannedRevenue: "0",
			profitPercentage: "0.00",
			fixedBidCost: 0,
			revenue: "0.00",
			cost: "0.00",
		};

		tableData.push(placeholderPhaseRow);
	}

	return {
		tableData,
		phaseIdIndexMap,
		moduleIdIndexMap,
		taskIdIndexMap,
		bugIdIndexMap,
	};
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
 * @param {estimateLineItemResourceAllocationMap} resourceAllocationMap - An array containes the mapped allocated resources ids for a specific task
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
 * The function iterates through estimateLineItemResourceAllocationMap each allocated resource for the task, retrieves the corresponding estimate resource details,
 * and performs calculations based on the estimate resources' hourly rates and the hours detailed in the allocations.
 * The results are cumulative, with each allocation contributing to the total values.
 *
 * If an allocation references an estimate resource not present in the provided estimate resources parameter, that
 * allocation is skipped in the calculations.
 */
function calculateProjectSummaryOptimized(
	resourceAllocations: iMultiResourceAllocation,
	estimateResources: iMultiEstimateResource,
	tasks: iMultiTask,
	bugs: iMultiBug,
	modules: iMultiModule,
	estimateLineItemResourceAllocationMap: iEstimateLineItemResourceAllocationMap,
	contractType: projectContractTypes | null,
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

	const processItem = (itemId: string) => {
		// Check if the item has allocations in the estimateLineItemResourceAllocationMap
		const allocatedResources =
			estimateLineItemResourceAllocationMap[itemId] || [];
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
		processItem(taskId); // Pass the taskId to the processItem function
	}

	// Process bugs
	for (const bugId of bugs.ids) {
		processItem(bugId); // Pass the bugId to the processItem function
	}

	// Process modules for FIXED_BID_NEW project types to calculate the total revenue
	if (contractType === projectContractTypes.FIXED_BID_NEW) {
		for (const moduleId of modules.ids) {
			const modyule = modules.items[moduleId];

			// Calculate totalRevenue from plannedRevenue for each module
			const plannedRevenue = new Decimal(modyule.plannedRevenue || "0");
			totalRevenue = totalRevenue.add(plannedRevenue);
		}
	}

	return {
		totalCost: totalCost.toString(),
		totalHours: totalHours.toString(),
		totalRevenue: totalRevenue.toString(),
		totalBilledHours: totalBilledHours.toString(),
		totalWriteoffHours: totalWriteoffHours.toString(),
	};
}

function buildPlannedRevenueAndCostMap(
	phases: iMultiPhase,
	modules: iMultiModule,
	resourceAllocations: iMultiResourceAllocation,
	estimateResources: iMultiEstimateResource,
	estimateLineItemResourceAllocationMap: iEstimateLineItemResourceAllocationMap,
): iEstimateLineItemPlannedRevenueCostMap {
	const plannedRevenueCostMap: iEstimateLineItemPlannedRevenueCostMap = {};

	phases.ids.forEach((phaseId) => {
		const phaseItemData = phases.items[phaseId];
		const {childrenIds: childModuleIds} = phaseItemData;

		let phaseItemRevenue = new Decimal("0.00");
		let phaseItemCost = new Decimal("0.00");

		if (childModuleIds && childModuleIds.length > 0) {
			childModuleIds.forEach((moduleId) => {
				const moduleItemData = modules.items[moduleId];
				const {childrenIds: childTaskOrBugIds} = moduleItemData;

				let moduleItemRevenue = new Decimal("0.00");
				let moduleItemCost = new Decimal("0.00");

				if (childTaskOrBugIds && childTaskOrBugIds.length > 0) {
					childTaskOrBugIds.forEach((childTaskOrBugItemId) => {
						let taskOrBugItemRevenue = new Decimal("0.00");
						let taskOrBugItemCost = new Decimal("0.00");

						const resourceAllocationIds =
							estimateLineItemResourceAllocationMap[childTaskOrBugItemId];

						if (resourceAllocationIds && resourceAllocationIds.length > 0) {
							resourceAllocationIds.forEach((resourceAllocationId) => {
								const {estimateResourceId, billedHours, writeOff} =
									resourceAllocations.items[resourceAllocationId];

								const {hourlyCostRate, hourlyBillRate} =
									estimateResources.items[estimateResourceId];

								// Computing the revenue
								const billedHoursInDecimal = new Decimal(billedHours || "0");
								const hourlyBillingRateInDecimal = new Decimal(
									hourlyBillRate || "0",
								);

								const revenuePerAllocation = billedHoursInDecimal.mul(
									hourlyBillingRateInDecimal,
								);

								taskOrBugItemRevenue =
									taskOrBugItemRevenue.add(revenuePerAllocation);

								// Computing the cost
								const hourlyCostRateInDecimal = new Decimal(
									hourlyCostRate || "0",
								);

								const writeOffHoursInDecimal = new Decimal(writeOff || "0");

								const totalWorkHours = billedHoursInDecimal.add(
									writeOffHoursInDecimal,
								);

								const costPerAllocation = totalWorkHours.mul(
									hourlyCostRateInDecimal,
								);

								taskOrBugItemCost = taskOrBugItemCost.add(costPerAllocation);
							});
						}

						plannedRevenueCostMap[childTaskOrBugItemId] = {
							revenue: taskOrBugItemRevenue.toFixed(2),
							cost: taskOrBugItemCost.toFixed(2),
						};

						moduleItemRevenue = moduleItemRevenue.add(taskOrBugItemRevenue);
						moduleItemCost = moduleItemCost.add(taskOrBugItemCost);
					});
				}

				plannedRevenueCostMap[moduleId] = {
					revenue: moduleItemRevenue.toFixed(2),
					cost: moduleItemCost.toFixed(2),
				};

				phaseItemRevenue = phaseItemRevenue.add(moduleItemRevenue);
				phaseItemCost = phaseItemCost.add(moduleItemCost);
			});
		}

		plannedRevenueCostMap[phaseId] = {
			revenue: phaseItemRevenue.toFixed(2),
			cost: phaseItemCost.toFixed(2),
		};
	});

	return plannedRevenueCostMap;
}

const OptimizedProjectUtil = {
	formatTableData,
	calculateProjectSummaryOptimized,
	buildPlannedRevenueAndCostMap,
};

export default OptimizedProjectUtil;
