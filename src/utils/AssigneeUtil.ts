import {iMultiEmployeeDetails} from "@/customTypes/appDataTypes/employeeTypes";
import {
	iEstimateLineItemResourceAllocationMap,
	iMultiResourceAllocation,
	iMultiEstimateResource,
	iProjectDetails,
	iProjectTaskAssigneeTableRowData,
} from "@/customTypes/appDataTypes/projectTypes";
import {NullableString} from "@/customTypes/CommonTypes";

import StringUtil from "./StringUtil";

function getConcatenatedAssignees(
	estimateLineItemId: string,
	estimateLineItemResourceAllocationMap: iEstimateLineItemResourceAllocationMap,
	resourceAllocations: iMultiResourceAllocation,
	estimateResources: iMultiEstimateResource,
	multiEmployeeDetails: iMultiEmployeeDetails,
): string {
	let concatenatedAssignees = "";

	const resourceAllocationIds =
		estimateLineItemResourceAllocationMap[estimateLineItemId];

	if (resourceAllocationIds) {
		resourceAllocationIds.forEach((resourceAllocationId) => {
			const resourceAllocation =
				resourceAllocations.items[resourceAllocationId];

			if (resourceAllocation) {
				const estimateResourceId = resourceAllocation.estimateResourceId;
				const estimateResource = estimateResources.items[estimateResourceId];

				if (estimateResource) {
					const employeeId = estimateResource.employeeId;

					if (employeeId) {
						/**
						 * If the employeeId is present, then we will use the employee's first name and last name
						 * as the assignee name.
						 */
						const employeeDetails = multiEmployeeDetails.items[employeeId];

						if (employeeDetails) {
							const {firstName, lastName} = employeeDetails;

							const employeeName = `${firstName} ${lastName}`;

							if (concatenatedAssignees) {
								concatenatedAssignees += `, ${employeeName}`;
							} else {
								concatenatedAssignees += employeeName;
							}
						}
					} else {
						/**
						 * If the employeeId is not present, then we will use the resourceRole
						 * as the assignee name.
						 */
						const {resourceRole} = estimateResource;

						if (concatenatedAssignees) {
							concatenatedAssignees += `, ${resourceRole}`;
						} else {
							concatenatedAssignees += resourceRole;
						}
					}
				}
			}
		});
	}

	return concatenatedAssignees;
}

/**
 * Function that formats the normalized data structure from redux store/api response to the
 * format required by the Table component for rendering the assignee details on the task details page's
 * Assignee popup.
 *
 * @param projectDetails - The normalized data structure from redux store/api response
 * @param multiEmployeeDetails - the employee details from api response
 * @param taskId - The ID of the task for which the assignee details are to be rendered
 * @returns
 */
function formatAssigneesForTable(
	projectDetails: iProjectDetails,
	multiEmployeeDetails: iMultiEmployeeDetails,
	taskId: string,
	// taskType: projectTaskTypes,
): Array<iProjectTaskAssigneeTableRowData> {
	const tableData: Array<iProjectTaskAssigneeTableRowData> = [];

	// Use the estimateLineItemResourceAllocationMap to get allocated resources for the task
	const allocatedResources =
		projectDetails.estimateLineItemResourceAllocationMap[taskId] || [];

	allocatedResources.forEach((allocationId) => {
		const resourceAllocation =
			projectDetails.resourceAllocations.items[allocationId];
		if (!resourceAllocation) {
			console.warn(
				`Resource allocation ${allocationId} not found for task ${taskId}`,
			);
			return;
		}

		const {billedHours, writeOff, estimateResourceId} = resourceAllocation;

		const estimateResource =
			projectDetails.estimateResources.items[estimateResourceId];
		if (!estimateResource) {
			console.warn(
				`Estimate resource ${estimateResourceId} not found for task ${taskId}`,
			);
			return;
		}

		const {employeeId, hourlyBillRate, projectRole, resourceRole} =
			estimateResource;

		// Retrieve employee details from multiEmployeeDetails instead of projectDetails
		let employeeName: NullableString = null;
		if (employeeId) {
			const employeeDetails = multiEmployeeDetails.items[employeeId];
			if (employeeDetails) {
				const {firstName, lastName, middleName} = employeeDetails;
				employeeName = `${StringUtil.safeTrim(firstName)} ${StringUtil.safeTrim(
					middleName,
					" ",
				)} ${StringUtil.safeTrim(lastName, " ")}`;
			} else {
				console.warn(`Employee ${employeeId} not found for task ${taskId}`);
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

	return tableData;
}

const AssigneeUtil = {
	getConcatenatedAssignees,
	formatAssigneesForTable,
};

export default AssigneeUtil;
