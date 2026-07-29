import {AxiosRequestConfig} from "axios";
import config from "../../../../config/index";

/**
 * The base url of the api server's endpoint needs to be configured here.
 *
 * NOTE: This has to be manged by a build flavour configuration files
 * such as environment fils or via a remote configuration manger.
 */
const API_SERVER_BASE_URL = config.EVENT_MANAGEMENT_BASE_URL;

/**
 * The request timeout of the api server needs to be configured here.
 *
 * NOTE: This has to be manged by a build flavour configuration files
 * such as environment fils  or via a remote configuration manger.
 */
const API_SERVER_REQUEST_TIMEOUT = config.EVENT_MANAGEMENT_API_SERVER_TIMEOUT;

/**
 * All basic axios request-configurations needs to be set here.
 * This will used inside the services/api/index.ts file while
 * creating axios service instance to handle api calls.
 */
export const axiosRequestConfig: AxiosRequestConfig =
	Object.freeze<AxiosRequestConfig>({
		withCredentials: true,
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
		login: () => {
			return "auth/login";
		},
		signup: () => {
			return "auth/signup";
		},
	},

	employee: {
		createEmployee: () => "employee/create",
		getAllEmployees: () => "employee/all",
		updateEmployee: (id: string) => `employee/update/${id}`,
		deleteEmployee: (id: string) => `employee/delete/${id}`,
		getEmployeeStats: () => "employee/stats",
		updateEmployeePayment: () => "employee/payment/update",
		getAssignedServices: () => "employee/assigned-services",
		getEmployeeServiceHistory: (employeeId: string) =>
			`employee/${employeeId}/service-history`,
	},
	booking: {
		createBooking: () => {
			return "booking/create";
		},
		getAllBooking: () => {
			return "booking/all";
		},
		deleteBooking: (id: string) => {
			return `booking/delete/${id}`;
		},
		updateBooking: (id: string) => {
			return `booking/update/${id}`;
		},
		bulkDelete: () => {
			return "booking/bulk-delete";
		},
		bookingRequest: () => {
			return "booking/request";
		},
		getFinanceData: (queryParams: string) => {
			return `finance/all?${queryParams}`;
		},
	},

	allStatus: {
		getAllStatus: () => {
			return "/status/getAllStatus";
		},
	},

	user: {
		userProfileDetails: () => {
			return "/user/me/profile";
		},
		updateProfile: () => {
			return "/user/me/profile";
		},
		uploadProfilePhoto: () => {
			return "/user/me/photo";
		},
		changePassword: () => {
			return "/user/me/password";
		},
	},
	service: {
		getAllServices: () => {
			return "/service/all";
		},
		createService: () => {
			return "service/create";
		},
		updateService: (serviceId: string) => {
			return `service/update/${serviceId}`;
		},
	},
	status: {
		getAllStatus: () => {
			return "/status/all";
		},
	},
});
