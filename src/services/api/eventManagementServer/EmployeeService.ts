import {AxiosInstance} from "axios";
import {APIResponse} from "@/customTypes/NetworkTypes";
import {apiEndpoints} from "./axiosConfig/AxiosServiceConstants";
import NetworkUtil from "@/utils/NetworkUtil";
import {iCreateEmployeeDTO} from "../../../customTypes/appDataTypes/employeeTypes";

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

	const getAllEmployees = async (): Promise<APIResponse<iCreateEmployeeDTO[]> | null> => {
		let result = null;

		await apiServer
			.get(apiEndpoints.employee.getAllEmployees())
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

	const updateEmployee = async (
		employeeData: iCreateEmployeeDTO,
	): Promise<APIResponse<iCreateEmployeeDTO> | null> => {
		let result = null;

		await apiServer
			.put(apiEndpoints.employee.updateEmployee(employeeData.id!), employeeData)
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

	return {
		createEmployee,
		getAllEmployees,
		updateEmployee,
		deleteEmployee,
	};
}

export default EmployeeService;
