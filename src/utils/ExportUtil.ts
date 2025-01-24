import moment from "moment-timezone";

import AssigneeUtil from "@utils/AssigneeUtil";

import {
	iBugItem,
	iEstimateLineItemPlannedRevenueCostMap,
	iModuleItem,
	iMultiTaskStatusOption,
	iPhaseItem,
	iProjectDetails,
	iProjectOrderedTaskIds,
	iTaskItem,
	ProjectSummaryTypeWithoutDetails,
} from "@/customTypes/appDataTypes/projectTypes";
import {iMultiEmployeeDetails} from "@/customTypes/appDataTypes/employeeTypes";

/**
 * Exports selected project items as a CSV file.
 * If no items are selected, all items will be exported.
 *
 * @param taskSelectionStatus - An object representing the selection status of tasks, where the key is the task ID and the value is a boolean indicating whether the task is selected.
 * @param projectSummary - A summary of the project without detailed information.
 * @param projectOrderedTaskIds - An object containing ordered IDs of phases, modules, and tasks within the project.
 * @param projectDetails - Detailed information about the project, including phases, modules, tasks, and bugs.
 * @param employeeDetails - Details of employees involved in the project.
 * @param taskStatusOptions - Options for task statuses.
 */
function exportSelectedProjectItemsAsCSV(
	taskSelectionStatus: {[x: string]: boolean},
	projectSummary: ProjectSummaryTypeWithoutDetails,
	projectOrderedTaskIds: iProjectOrderedTaskIds,
	projectDetails: iProjectDetails,
	employeeDetails: iMultiEmployeeDetails,
	taskStatusOptions: iMultiTaskStatusOption,
) {
	/**
	 * Escape the value to be included in the CSV.
	 * @param value - The value to escape
	 * @returns The escaped value
	 */
	const escapeCSVValue = (value: string | null) => {
		if (!value) {
			return "";
		}

		// eslint-disable-next-line quotes
		if (value.includes('"')) {
			// Escape double quotes by doubling them
			// eslint-disable-next-line quotes, no-param-reassign
			value = value.replace(/"/g, '""');
		}

		// eslint-disable-next-line quotes
		if (value.includes(",") || value.includes('"') || value.includes("\n")) {
			// Enclose the value in double quotes if it contains a comma, quote, or newline
			// eslint-disable-next-line no-param-reassign
			value = `"${value}"`;
		}

		return value;
	};

	/**
	 * Check if the item should be included in the export based on the selection status.
	 *
	 * If no items are selected, all items should be included.
	 * If items are selected, only the selected items should be included.
	 *
	 * @param itemId - The ID of the phase/module/task/bug item
	 * @returns
	 */
	const shouldIncludeItemInExport = (itemId: string) => {
		if (selectedItemCount === 0) {
			return true;
		}

		return taskSelectionStatus[itemId];
	};

	/**
	 * Get the status name of the item.
	 * @param itemDetails - The details of the phase/module/task/bug item
	 * @param taskStatusOptions - The task status options
	 * @returns The status name of the item
	 */
	const getStatusName = (
		itemDetails: iPhaseItem | iModuleItem | iTaskItem | iBugItem,
		taskStatusOptions: iMultiTaskStatusOption,
	) => {
		const statusId = itemDetails.status;

		if (statusId) {
			return taskStatusOptions.items[statusId].status;
		}

		return "None";
	};

	/**
	 * Get the planned revenue and cost for the estimate line item.
	 * @param estimateLineItemId - The ID of the estimate line item
	 * @param estimateLineItemPlannedRevenueCostMap - The map of planned revenue and cost for each estimate line item
	 * @returns
	 */
	const getPlannedRevenueAndCost = (
		estimateLineItemId: string,
		estimateLineItemPlannedRevenueCostMap: iEstimateLineItemPlannedRevenueCostMap,
	): {
		plannedRevenue: string;
		plannedCost: string;
	} => {
		let plannedRevenue = "0";
		let plannedCost = "0";

		if (estimateLineItemPlannedRevenueCostMap[estimateLineItemId]) {
			const {revenue, cost} =
				estimateLineItemPlannedRevenueCostMap[estimateLineItemId];

			plannedRevenue = revenue;
			plannedCost = cost;
		}

		return {
			plannedRevenue: `$ ${plannedRevenue}`,
			plannedCost: `$ ${plannedCost}`,
		};
	};

	// Count the number of selected items
	const selectedItemCount = Object.keys(taskSelectionStatus).filter((key) => {
		return taskSelectionStatus[key];
	}).length;

	// Generate CSV headers (adjust based on your project plan structure)
	const csvHeaders = [
		"ID",
		"UID",
		"TASK NAME",
		"PLANNED START DATE",
		"PLANNED END DATE",
		"ASSIGNED",
		"STATUS",
		"NOTES",
		"PLANNED HOURS",
		"LOGGED HOURS",
		"PLANNED REVENUE",
		"PLANNED COST",
	];

	// Generate CSV rows based on selected tasks
	const csvRows: Array<Array<unknown>> = [];

	const {phases, modules, tasks, bugs, estimateLineItemPlannedRevenueCostMap} =
		projectDetails;

	const {orderedPhaseIds} = projectOrderedTaskIds;
	const orderedModuleIds = [...projectOrderedTaskIds.orderedModuleIds];
	const orderedTaskIds = [...projectOrderedTaskIds.orderedTaskIds];

	orderedPhaseIds.forEach((phaseId) => {
		const phaseItemDetails = phases.items[phaseId];

		if (shouldIncludeItemInExport(phaseItemDetails.id)) {
			const {plannedRevenue, plannedCost} = getPlannedRevenueAndCost(
				phaseItemDetails.id,
				estimateLineItemPlannedRevenueCostMap,
			);

			// Add phase row
			const phaseRow = [
				phaseItemDetails.id,
				phaseItemDetails.uid,
				escapeCSVValue(phaseItemDetails.name),
				phaseItemDetails.startDate,
				phaseItemDetails.endDate,
				"", // Phase will never have an assignees
				getStatusName(phaseItemDetails, taskStatusOptions),
				escapeCSVValue(phaseItemDetails.notes),
				phaseItemDetails.hours,
				phaseItemDetails.totalTimeLog,
				plannedRevenue,
				plannedCost,
			];

			csvRows.push(phaseRow);
		}

		// Add module rows
		const childModuleIds = phaseItemDetails.childrenIds;
		if (childModuleIds && childModuleIds.length > 0) {
			orderedModuleIds.forEach((moduleId) => {
				if (childModuleIds.includes(moduleId)) {
					const moduleItemDetails = modules.items[moduleId];

					if (shouldIncludeItemInExport(moduleItemDetails.id)) {
						const {plannedRevenue, plannedCost} = getPlannedRevenueAndCost(
							moduleItemDetails.id,
							estimateLineItemPlannedRevenueCostMap,
						);

						const moduleRow = [
							moduleItemDetails.id,
							moduleItemDetails.uid,
							escapeCSVValue(moduleItemDetails.name),
							moduleItemDetails.startDate,
							moduleItemDetails.endDate,
							"", // Module will never have an assignees
							getStatusName(moduleItemDetails, taskStatusOptions),
							escapeCSVValue(moduleItemDetails.notes),
							moduleItemDetails.hours,
							moduleItemDetails.totalTimeLog,
							plannedRevenue,
							plannedCost,
						];

						csvRows.push(moduleRow);
					}

					// Add task rows
					const childTaskOrBugIds = moduleItemDetails.childrenIds;

					orderedTaskIds.forEach((taskOrBugItemId) => {
						if (childTaskOrBugIds.includes(taskOrBugItemId)) {
							let taskOrBugItemDetails: iTaskItem | iBugItem;

							if (tasks.items[taskOrBugItemId]) {
								taskOrBugItemDetails = tasks.items[taskOrBugItemId];
							} else {
								taskOrBugItemDetails = bugs.items[taskOrBugItemId];
							}

							if (shouldIncludeItemInExport(taskOrBugItemDetails.id)) {
								const concatenatedAssignees =
									AssigneeUtil.getConcatenatedAssignees(
										taskOrBugItemId,
										projectDetails.estimateLineItemResourceAllocationMap,
										projectDetails.resourceAllocations,
										projectDetails.estimateResources,
										employeeDetails,
									);

								const {plannedRevenue, plannedCost} = getPlannedRevenueAndCost(
									taskOrBugItemDetails.id,
									estimateLineItemPlannedRevenueCostMap,
								);

								const taskRow = [
									taskOrBugItemDetails.id,
									taskOrBugItemDetails.uid,
									escapeCSVValue(taskOrBugItemDetails.name),
									taskOrBugItemDetails.startDate,
									taskOrBugItemDetails.endDate,
									escapeCSVValue(concatenatedAssignees),
									getStatusName(taskOrBugItemDetails, taskStatusOptions),
									escapeCSVValue(taskOrBugItemDetails.notes),
									taskOrBugItemDetails.hours,
									taskOrBugItemDetails.totalTimeLog,
									plannedRevenue,
									plannedCost,
								];

								csvRows.push(taskRow);
							}
						}
					});
				}
			});
		}
	});

	// Generate CSV content
	const csvContent = [
		csvHeaders.join(","),
		...csvRows.map((csvRow) => {
			return csvRow.join(",");
		}),
	].join("\n");

	// Create a Blob and download link
	const blob = new Blob([csvContent], {type: "text/csv;charset=utf-8;"});
	const csvURL = URL.createObjectURL(blob);

	const link = document.createElement("a");
	link.href = csvURL;
	link.setAttribute(
		"download",
		`BIT_Project_Plan_${projectSummary.id}_${moment().format("YYYY-MM-DD-HH-mm-ss")}.csv`,
	); // Name of the CSV file
	document.body.appendChild(link);

	link.click();

	document.body.removeChild(link); // Clean up and remove the link
}

const exportUtil = {
	exportSelectedProjectItemsAsCSV,
};

export default exportUtil;
