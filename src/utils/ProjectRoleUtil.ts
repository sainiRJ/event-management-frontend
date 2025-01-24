import {iMultiEmployeeDetails} from "@/customTypes/appDataTypes/employeeTypes";
import {
	iMultiProjectRoleDetails,
	iProjectRoleTalentMappingTableRowData,
	iRoleIdToEmployeeIdMap,
} from "@/customTypes/appDataTypes/projectRoleTypes";
import {iMultiEstimateResource} from "@/customTypes/appDataTypes/projectTypes";

import SecurityUtil from "./SecurityUtil";

/**
 * The prefix used to identify new estimate resources. This will be added as a
 * prefix to the estimate resource ID which is being generated on the client
 * side. This id will be replaced with the actual id from the server when the
 * estimate resource is saved via the API.
 */
const NEW_ESTIMATE_RESOURCE_ID_PREFIX = "NEW_";

/**
 * Transforms the estimate resources and employee details data into a format
 * that can be used to populate the project role talent mapping table. It also
 * generates a map of project role ids to employee ids.
 *
 * @param estimateResources
 * @param employeeDetails
 * @returns
 */
function formatProjectRoleTalentMappingTableData(
	estimateResources: iMultiEstimateResource,
	employeeDetails: iMultiEmployeeDetails,
): {
	projectRoleTalentMappingTableData: Array<iProjectRoleTalentMappingTableRowData>;
	projectRoleIdsToEmployeeIdsMap: iRoleIdToEmployeeIdMap;
} {
	const projectRoleTalentMappingTableData: Array<iProjectRoleTalentMappingTableRowData> =
		[];

	const projectRoleIdsToEmployeeIdsMap: iRoleIdToEmployeeIdMap = {};

	const {ids: estimateResourceIds, items: estimateResourceItems} =
		estimateResources;

	estimateResourceIds.forEach((estimateResourceId) => {
		const estimateResource = estimateResourceItems[estimateResourceId];
		const {employeeId, resourceRole, hourlyBillRate, projectRoleId} =
			estimateResource;

		let employeeName = "";
		if (employeeId) {
			const employee = employeeDetails.items[employeeId];

			if (employee) {
				const {firstName, lastName} = employee;

				employeeName = `${firstName} ${lastName}`;
			}
		}

		const projectRoleTalentMappingTableRowData: iProjectRoleTalentMappingTableRowData =
			{
				estimateResourceId,
				projectRoleId: projectRoleId,
				projectRole: resourceRole,
				employeeId,
				employeeName,
				hourlyRate: hourlyBillRate,
			};

		projectRoleTalentMappingTableData.push(
			projectRoleTalentMappingTableRowData,
		);

		if (projectRoleId) {
			if (!projectRoleIdsToEmployeeIdsMap[projectRoleId]) {
				projectRoleIdsToEmployeeIdsMap[projectRoleId] = {};
			}

			if (employeeId) {
				projectRoleIdsToEmployeeIdsMap[projectRoleId][employeeId] = employeeId;
			}
		}
	});
	// Sort the data by projectRole in ascending order
	projectRoleTalentMappingTableData.sort((a, b) => {
		if (a.projectRole < b.projectRole) return -1;
		if (a.projectRole > b.projectRole) return 1;
		return 0;
	});

	return {projectRoleTalentMappingTableData, projectRoleIdsToEmployeeIdsMap};
}

/**
 * Transforms the employee details data into a format that can be used to
 * populate the options for the employee selection dropdown.
 *
 * @param employeeDetails
 * @returns
 */
function formatEmployeeDetailsForOptionsDropdown(
	employeeDetails: iMultiEmployeeDetails,
): Array<{label: string; value: string}> {
	const employeeOptions: Array<{label: string; value: string}> = [];

	const {ids: employeeIds, items} = employeeDetails;

	employeeIds.forEach((employeeId) => {
		const {firstName, lastName} = items[employeeId];

		const employeeName = `${firstName} ${lastName}`;

		employeeOptions.push({
			value: employeeId,
			label: employeeName,
		});
	});

	return employeeOptions;
}

/**
 * Transforms the project roles data into a format that can be used to populate
 * the options for the project roles selection dropdown.
 *
 * @param projectRoles
 * @returns
 */
function formatProjectRolesForOptionsDropdown(
	projectRoles: iMultiProjectRoleDetails,
) {
	const rolesList: Array<{label: string; value: string}> = [];

	const {ids: roleIds, items} = projectRoles;

	roleIds.forEach((roleId) => {
		const {title, isActive} = items[roleId];
		if (isActive === true) {
			rolesList.push({
				value: roleId,
				label: `${title}`,
			});
		}
	});

	return rolesList;
}

/**
 * Generates and returns a new estimate resource id.
 *
 * @returns - The new estimate resource id.
 */
function generateNewEstimateResourceId(): string {
	return `${NEW_ESTIMATE_RESOURCE_ID_PREFIX}${SecurityUtil.generateUUID()}`;
}

/**
 * Function to check if the estimate resource is new or not.
 * New estimate resources are identified by the prefix `NEW_` in their id.
 *
 * @param estimateResourceId - The id of the estimate resource.
 * @returns - A boolean indicating whether the estimate resource is new or not.
 */
function isNewEstimateResource(estimateResourceId: string): boolean {
	return estimateResourceId.startsWith(NEW_ESTIMATE_RESOURCE_ID_PREFIX);
}

const ProjectRoleUtil = {
	formatProjectRoleTalentMappingTableData,
	formatEmployeeDetailsForOptionsDropdown,
	formatProjectRolesForOptionsDropdown,
	NEW_ESTIMATE_RESOURCE_ID_PREFIX,
	generateNewEstimateResourceId,
	isNewEstimateResource,
};

export default ProjectRoleUtil;
