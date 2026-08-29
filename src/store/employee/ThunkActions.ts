import {createAsyncThunk} from "@reduxjs/toolkit";
import {employeeService} from "../../services/api/eventManagementServer";
import {
	iCreateEmployeeDTO,
	iEmployeePaymentUpdate,
} from "../../customTypes/appDataTypes/employeeTypes";

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

export const getEmployeeStats = createAsyncThunk(
	"employee/getEmployeeStats",
	async (_, {rejectWithValue}) => {
		try {
			const response = await employeeService.getEmployeeStats();
			console.log("Raw API Response:", response); // Debug log

			if (!response) {
				return rejectWithValue({
					message: "No response received",
				});
			}

			const {httpStatusCode, data, message} = response;
			console.log("Response data:", data); // Debug log

			if (httpStatusCode === 200) {
				// Check if data exists and has the expected structure
				if (data?.data?.employeeStats && data?.data?.ids) {
					return {
						httpStatusCode,
						data: data.data,
						message: message || "Employee stats fetched successfully",
					};
				} else {
					console.log("Invalid data structure:", data); // Debug log
					return rejectWithValue({
						httpStatusCode,
						message: "Invalid employee stats data structure",
					});
				}
			}

			return rejectWithValue({
				httpStatusCode,
				message: message || "Failed to fetch employee stats",
			});
		} catch (error) {
			console.error("Error in getEmployeeStats:", error); // Debug log
			return rejectWithValue({
				message: "Failed to fetch employee stats",
			});
		}
	},
);

export const updateEmployeePayment = createAsyncThunk(
	"employee/updateEmployeePayment",
	async (paymentData: iEmployeePaymentUpdate, {rejectWithValue}) => {
		try {
			const response = await employeeService.updateEmployeePayment(paymentData);
			if (!response) {
				return rejectWithValue({
					message: "No response received",
				});
			}
			return response;
		} catch (error) {
			return rejectWithValue({
				message: "Failed to update employee payment",
			});
		}
	},
);

export const getAssignedServices = createAsyncThunk(
	"employee/getAssignedServices",
	async (_, {rejectWithValue}) => {
		try {
			const response = await employeeService.getAssignedServices();
			if (!response) {
				console.error("No response received from getAssignedServices");
				return rejectWithValue({
					message: "No response received",
				});
			}

			const {httpStatusCode, data, message} = response;
			if (httpStatusCode === 200) {
				if (data?.data) {
					return {
						httpStatusCode,
						data: data.data,
						message: message || "Assigned services fetched successfully",
					};
				} else {
					console.error("Invalid data structure:", data);
					return rejectWithValue({
						httpStatusCode,
						message: "Invalid data structure received",
					});
				}
			}

			console.error("Failed to fetch assigned services:", message);
			return rejectWithValue({
				httpStatusCode,
				message: message || "Failed to fetch assigned services",
			});
		} catch (error) {
			console.error("Error in getAssignedServices:", error);
			return rejectWithValue({
				message: "Failed to fetch assigned services",
			});
		}
	},
);

export const getEmployeeServiceHistory = createAsyncThunk(
	"employee/getEmployeeServiceHistory",
	async (employeeId: string) => {
		const response = await employeeService.getEmployeeServiceHistory(
			employeeId,
		);
		if (!response) {
			throw new Error("Failed to fetch employee service history");
		}
		return response;
	},
);
