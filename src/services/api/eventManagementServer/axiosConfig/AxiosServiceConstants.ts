import {AxiosRequestConfig} from "axios";

import config from "@/config";

/**
 * The base url of the api server's endpoint needs to be configured here.
 *
 * NOTE: This has to be manged by a build flavour configuration files
 * such as environment fils or via a remote configuration manger.
 */
const API_SERVER_BASE_URL = config.BITOOL_BASE_URL;
/**
 * The request timeout of the api server needs to be configured here.
 *
 * NOTE: This has to be manged by a build flavour configuration files
 * such as environment fils  or via a remote configuration manger.
 */
const API_SERVER_REQUEST_TIMEOUT = config.BITOOL_API_SERVER_TIMEOUT;

/**
 * All basic axios request-configurations needs to be set here.
 * This will used inside the services/api/index.ts file while
 * creating axios service instance to handle api calls.
 */
export const axiosRequestConfig: AxiosRequestConfig =
	Object.freeze<AxiosRequestConfig>({
		// withCredentials: true,
		baseURL: API_SERVER_BASE_URL,

		/**
		 * The timeout for axios is set in milliseconds.
		 * Here, it's set to 15 seconds (15000ms) as the default value if
		 * the API_SERVER_REQUEST_TIMEOUT is not set in the
		 * environment files.
		 */
		timeout: API_SERVER_REQUEST_TIMEOUT || 15000,
	});

/**
 * All the application service api endpoints should be defined here and never
 * directly define and use apiEndpoints as the baseURL is configured based on
 * the build flavour or other remote configuration managers.
 *
 * While defining endpoints here, kindly note that the part after the base url
 * should be added here and shouldn't include the host/baseURL part.
 *
 * Kindly refer the below examples for more details:
 *
 * If the endpoint is "https://dev.exampleapiserver.tld/api/v1/login" , then it
 * should be split as below:
 * API_SERVER_BASE_URL =  "https://dev.exampleapiserver.tld/api/v1"
 * apiEndpoints = {
 *     authentication: {
 *         login: "/login"
 *     }
 * }
 *
 */
export const apiEndpoints = Object.freeze({
	auth: {
		authenticate: "",
	},

	project: {
		optimized: {
			getProjectSummary: (projectId: string) => {
				return `/project/optimized/${projectId}`;
			},

			getProjectInfo: (projectId: string) => {
				return `/optimized-projects/project-info/${projectId}`;
			},

			getProjectPlan: (projectId: string) => {
				return `/optimized-projects/project-plan/${projectId}`;
			},

			getProjectResourceAllocationDetails: (projectId: string) => {
				return `/optimized-projects/resource-allocation-details/${projectId}`;
			},
		},

		getProjectSummary: (projectId: string) => {
			return `/project/${projectId}`;
		},

		updateTask: (projectId: string, taskId: string) => {
			return `/project/${projectId}/${taskId}`;
		},

		updateAssignees: (projectId: string, taskId: string) => {
			return `/project/${projectId}/${taskId}/assignees`;
		},

		bulkTaskUpdate: (projectId: string) => {
			return `/project/${projectId}/bulk-task`;
		},

		bulkTaskCreate: (projectId: string) => {
			return `/project/${projectId}/bulk-task`;
		},

		bulkTaskDelete: (projectId: string) => {
			return `/project/${projectId}/bulk-task`;
		},

		addOrUpdateRoles: (projectId: string) => {
			return `/project/${projectId}/addOrUpdateRoles`;
		},

		updateGSheetSyncStatus: (projectId: string) => {
			return `/project/${projectId}/gsheet-sync-disable-status`;
		},

		updateProjectTaskOrder: (projectId: string, taskId: string) => {
			return `projects/${projectId}/tasks/${taskId}/order`;
		},

		getAllBugTypes: () => {
			return `/projects/getAllBugTypes`;
		},

		createProjectBug: (projectId: string) => {
			return `project/${projectId}/bug`;
		},

		getTaskDescription: (projectId: string, taskId: string) => {
			return `/projects/${projectId}/task/${taskId}/description`;
		},
	},

	employee: {
		getAllEmployeeDetailsWithRoles: () => {
			return `/employee/getAllEmployeeDetailsWithRoles`;
		},
		addCapabilities: () => {
			return `/employee/add-capabilities`;
		},
	},
	attachment: {
		issueBulkPresignedUploadUrls: (projectId: string) => {
			return `/attachment/${projectId}/bulk-presigned-upload-urls`;
		},
		issueBulkPresignedFetchUrls: (projectId: string) => {
			return `/attachment/${projectId}/bulk-presigned-fetch-urls`;
		},
		updateAttachmentStatus: (attachmentId: string) => {
			return `/attachment/${attachmentId}/attachment-status`;
		},
	},

	allStatus: {
		getAllStatus: () => {
			return `/status/getAllStatus`;
		},
	},

	modifyValue: {
		modifyProjectValue: (projectId: string, taskId: string) => {
			return `/modifyValue/${projectId}/${taskId}`;
		},
	},

	timeLog: {
		addUpdateTimeLog: (projectId: string, taskId: string) => {
			return `/timelog/projects/${projectId}/tasks/${taskId}/logs`;
		},

		getTimeLogDetails: (projectId: string, taskId: string) => {
			return `/timelog/projects/${projectId}/tasks/${taskId}/logs`;
		},

		getProjectTimelogReportDetails: (projectId: string) => {
			return `/timelog/projects/${projectId}`;
		},
		getProjectTimelogReportTotalLoggedHours: (projectId: string) => {
			return `/timelog/projects/${projectId}/summary`;
		},
		getTimelogSummaryEmployeeLoggedHours: (projectId: string) => {
			return `/timelog/projects/${projectId}/summary/totalloggedhours`;
		},
	},

	user: {
		userProfileDetails: () => {
			return `/user/me/profile`;
		},
	},

	exportReport: {
		exportReportPage: (projectId: string) => {
			return `/reports/projects/${projectId}/timelog/csv`;
		},

		getMultiProjectList: () => {
			return `/projects`;
		},

		getProjectsStatusOptions: () => {
			return `/projects/status-options`;
		},

		getroleIdsForProject: (projectId: string) => {
			return `/projects/${projectId}/roleIds`;
		},

		getEmployeeIdsForProject: (projectId: string) => {
			return `/projects/${projectId}/employeeIds`;
		},
	},
});
