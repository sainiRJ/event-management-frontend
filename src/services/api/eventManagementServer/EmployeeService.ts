import {AxiosInstance} from "axios";
import {APIResponse} from "@/customTypes/NetworkTypes";
import {apiEndpoints} from "./axiosConfig/AxiosServiceConstants";
import NetworkUtil from "@/utils/NetworkUtil";
import {
	iCreateEmployeeDTO,
	iEmployeeStatsResponse,
	iEmployeePaymentUpdate,
	iAssignedServicesResponse,
	iEmployeeAssignedServices,
} from "../../../customTypes/appDataTypes/employeeTypes";

function EmployeeService(apiServer: AxiosInstance) {
	const createEmployee = async (
		createEmployeeDTO: Partial<iCreateEmployeeDTO>,
	): Promise<APIResponse<iCreateEmployeeDTO> | null> => {
		let result = null;

		await apiServer
			.post(apiEndpoints.employee.createEmployee(), createEmployeeDTO)
			.then(
				(value) => {
					result = NetworkUtil.buildResult<null>(
						null,
						value.status,
						null,
						value.data,
					);
				},
				(reason) => {
					const {response} = reason;
					const {status, data} = response;
					result = NetworkUtil.buildResult<null>(data, status, data, null);
				},
			)
			.catch((error) => {
				throw error;
			});

		return result;
	};

	const getAllEmployees = async (): Promise<APIResponse<
		iCreateEmployeeDTO[]
	> | null> => {
		let result = null;

		await apiServer
			.get(apiEndpoints.employee.getAllEmployees())
			.then(
				(value) => {
					result = NetworkUtil.buildResult<null>(
						value.data.data,
						value.status,
						null,
						null,
					);
				},
				(reason) => {
					const {response} = reason;
					const {status, data} = response;
					result = NetworkUtil.buildResult<null>(data, status, data, null);
				},
			)
			.catch((error) => {
				throw error;
			});

		return result;
	};

	const updateEmployee = async (
		employeeData: iCreateEmployeeDTO,
	): Promise<APIResponse<iCreateEmployeeDTO> | null> => {
		let result = null;

		await apiServer
			.patch(
				apiEndpoints.employee.updateEmployee(employeeData.id!),
				employeeData,
			)
			.then(
				(value) => {
					result = NetworkUtil.buildResult<null>(
						null,
						value.status,
						null,
						value.data,
					);
				},
				(reason) => {
					const {response} = reason;
					const {status, data} = response;
					result = NetworkUtil.buildResult<null>(data, status, data, null);
				},
			)
			.catch((error) => {
				throw error;
			});

		return result;
	};

	const deleteEmployee = async (
		id: string | string[],
	): Promise<APIResponse<null> | null> => {
		let result = null;

		await apiServer
			.delete(
				apiEndpoints.employee.deleteEmployee(
					Array.isArray(id) ? id.join(",") : id,
				),
			)
			.then(
				(value) => {
					result = NetworkUtil.buildResult<null>(
						null,
						value.status,
						null,
						value.data,
					);
				},
				(reason) => {
					const {response} = reason;
					const {status, data} = response;
					result = NetworkUtil.buildResult<null>(data, status, data, null);
				},
			)
			.catch((error) => {
				throw error;
			});

		return result;
	};

	const getEmployeeStats =
		async (): Promise<APIResponse<iEmployeeStatsResponse> | null> => {
			let result = null;

			await apiServer
				.get(apiEndpoints.employee.getEmployeeStats())
				.then(
					(value) => {
						console.log("Employee stats API raw response:", value.data);
						result = NetworkUtil.buildResult<iEmployeeStatsResponse>(
							value.data,
							value.status,
							null,
							null,
						);
						console.log("Employee stats API processed result:", result);
					},
					(reason) => {
						const {response} = reason;
						const {status, data} = response;
						console.log("Employee stats API error:", data);
						result = NetworkUtil.buildResult<null>(data, status, data, null);
					},
				)
				.catch((error) => {
					console.error("Employee stats API error:", error);
					throw error;
				});

			return result;
		};

	const updateEmployeePayment = async (
		paymentData: iEmployeePaymentUpdate,
	): Promise<APIResponse<null> | null> => {
		let result = null;

		await apiServer
			.patch(apiEndpoints.employee.updateEmployeePayment(), paymentData)
			.then(
				(value) => {
					result = NetworkUtil.buildResult<null>(
						null,
						value.status,
						null,
						value.data,
					);
				},
				(reason) => {
					const {response} = reason;
					const {status, data} = response;
					result = NetworkUtil.buildResult<null>(data, status, data, null);
				},
			)
			.catch((error) => {
				throw error;
			});

		return result;
	};

	const getAssignedServices = async (): Promise<APIResponse<
		iEmployeeAssignedServices[]
	> | null> => {
		let result: APIResponse<iEmployeeAssignedServices[]> | null = null;

		try {
			console.log("Calling assigned services API...");
			const response = await apiServer.get(
				apiEndpoints.employee.getAssignedServices(),
			);
			console.log("Raw API response:", response);

			if (response.data?.data) {
				result = NetworkUtil.buildResult<iEmployeeAssignedServices[]>(
					response.data,
					response.status,
					null,
					null,
				);
			} else {
				result = NetworkUtil.buildResult<iEmployeeAssignedServices[]>(
					{
						data: [],
						error: null,
						meta: {
							URID: null,
							paginationInfo: {
								page: 1,
								pageSize: 10,
								totalPages: 1,
								totalItems: 0,
							},
						},
					},
					response.status,
					null,
					null,
				);
			}
			console.log("Processed result:", result);
		} catch (error: any) {
			console.error("Error in getAssignedServices service:", error);
			if (error.response) {
				const {status, data} = error.response;
				result = NetworkUtil.buildResult<iEmployeeAssignedServices[]>(
					{
						data: [],
						error: data,
						meta: {
							URID: null,
							paginationInfo: {
								page: 1,
								pageSize: 10,
								totalPages: 1,
								totalItems: 0,
							},
						},
					},
					status,
					data,
					null,
				);
			} else {
				throw error;
			}
		}

		return result;
	};

	return {
		createEmployee,
		getAllEmployees,
		updateEmployee,
		deleteEmployee,
		getEmployeeStats,
		updateEmployeePayment,
		getAssignedServices,
	};
}

export default EmployeeService;
