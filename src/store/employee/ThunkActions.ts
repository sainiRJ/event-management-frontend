import {createAsyncThunk} from "@reduxjs/toolkit";
import {employeeService} from "../../services/api/eventManagementServer";
import {iCreateEmployeeDTO} from "../../customTypes/appDataTypes/employeeTypes";
import {iEmployeeResponse} from "../../customTypes/CommonServiceTypes";

export const getAllEmployees = createAsyncThunk(
	"employee/getAllEmployees",
	async (_, {rejectWithValue}) => {
		try {
			const response = await employeeService.getAllEmployees();
			if (!response) {
				return rejectWithValue({
					message: "Failed to fetch employees",
				});
			}
			const {httpStatusCode, data, message} = response;
			if (httpStatusCode === 200 && data) {
				// Handle both array and nested object response formats
				const responseData = data;
				let employeeList: iCreateEmployeeDTO[] = [];

				console.log("responseData", responseData);
				if (Array.isArray(responseData)) {
					employeeList = responseData;
				} else if (
					typeof responseData === "object" &&
					responseData.employeeDetails
				) {
					employeeList = Object.values(responseData.employeeDetails);
				} else if (typeof responseData === "object" && responseData.data) {
					employeeList = responseData.data;
				}
				return {
					httpStatusCode,
					data: employeeList,
					message: "Employees fetched successfully",
				};
			}
			return rejectWithValue({
				httpStatusCode,
				message: message || "Invalid employee data format",
			});
		} catch (error) {
			return rejectWithValue({
				message: "Failed to fetch employees",
			});
		}
	},
);

export const createEmployee = createAsyncThunk(
	"employee/createEmployee",
	async (employeeData: iCreateEmployeeDTO, {rejectWithValue}) => {
		try {
			const response = await employeeService.createEmployee(employeeData);
			if (!response) {
				return rejectWithValue({
					message: "Failed to create employee",
				});
			}
			const {httpStatusCode, data, message} = response;
			if (httpStatusCode === 200) {
				if (data && data.data) {
					return {
						...data,
						data: data.data,
					};
				}
			}
			return rejectWithValue({
				httpStatusCode,
				message: message || "Failed to create employee",
			});
		} catch (error) {
			return rejectWithValue({
				message: "Failed to create employee",
			});
		}
	},
);

export const updateEmployee = createAsyncThunk(
	"employee/updateEmployee",
	async (employeeData: iCreateEmployeeDTO, {rejectWithValue}) => {
		try {
			const response = await employeeService.updateEmployee(employeeData);
			if (!response) {
				return rejectWithValue({
					message: "Failed to update employee",
				});
			}
			const {httpStatusCode, data, message} = response;
			if (httpStatusCode === 200) {
				if (data && data.data) {
					return {
						...data,
						data: data.data,
					};
				}
			}
			return rejectWithValue({
				httpStatusCode,
				message: message || "Failed to update employee",
			});
		} catch (error) {
			return rejectWithValue({
				message: "Failed to update employee",
			});
		}
	},
);

export const deleteEmployee = createAsyncThunk(
	"employee/deleteEmployee",
	async (id: string | string[], {rejectWithValue}) => {
		try {
			const response = await employeeService.deleteEmployee(id);
			if (!response) {
				return rejectWithValue({
					message: "Failed to delete employee(s)",
				});
			}
			const {httpStatusCode, data, message} = response;
			if (httpStatusCode === 200) {
				if (data && data.data) {
					return {
						...data,
						data: data.data,
					};
				}
			}
			return rejectWithValue({
				httpStatusCode,
				message: message || "Failed to delete employee(s)",
			});
		} catch (error) {
			return rejectWithValue({
				message: "Failed to delete employee(s)",
			});
		}
	},
);
