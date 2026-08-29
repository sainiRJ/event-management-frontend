import {AxiosInstance} from "axios";
import {APIResponse} from "@/customTypes/NetworkTypes";
import {apiEndpoints} from "./axiosConfig/AxiosServiceConstants";
import NetworkUtil from "@/utils/NetworkUtil";
import {
	iCreateEmployeeDTO,
	iEmployeeStatsResponse,
	iEmployeePaymentUpdate,
	iEmployeeAssignedServices,
	iEmployeeServiceHistory,
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
		console.log(
			"EmployeeService.updateEmployee called with data:",
			employeeData,
		);
		let result = null;

		const employeeId = employeeData.id;
		if (!employeeId) {
			throw new Error("Employee ID is required for updates");
		}

		try {
			console.log(
				"Making PATCH request to:",
				apiEndpoints.employee.updateEmployee(employeeId),
			);
			const response = await apiServer.patch(
				apiEndpoints.employee.updateEmployee(employeeId),
				employeeData,
			);
			result = NetworkUtil.buildResult<iCreateEmployeeDTO>(
				response.data,
				response.status,
				null,
				null,
			);
		} catch (error: any) {
			console.error("Error in updateEmployee service:", error);
			if (error.response) {
				const {status, data} = error.response;
				result = NetworkUtil.buildResult<iCreateEmployeeDTO>(
					data,
					status,
					data,
					null,
				);
			}
			throw error;
		}

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
						result = NetworkUtil.buildResult<iEmployeeStatsResponse>(
							value.data,
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
			const response = await apiServer.get(
				apiEndpoints.employee.getAssignedServices(),
			);
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

	const getEmployeeServiceHistory = async (
		employeeId: string,
	): Promise<APIResponse<iEmployeeServiceHistory> | null> => {
		try {
			const response = await apiServer.get(
				apiEndpoints.employee.getEmployeeServiceHistory(employeeId),
			);
			return NetworkUtil.buildResult<iEmployeeServiceHistory>(
				response.data,
				response.status,
				null,
				null,
			);
		} catch (error: any) {
			console.error("Error fetching employee service history:", error);
			return NetworkUtil.buildResult<iEmployeeServiceHistory>(
				null,
				error?.response?.status || 500,
				error?.response?.data || error,
				error,
			);
		}
	};

	return {
		createEmployee,
		getAllEmployees,
		updateEmployee,
		deleteEmployee,
		getEmployeeStats,
		updateEmployeePayment,
		getAssignedServices,
		getEmployeeServiceHistory,
	};
}

export default EmployeeService;
