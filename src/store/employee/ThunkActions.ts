import {createAsyncThunk} from "@reduxjs/toolkit";
import {employeeService} from "../../services/api/eventManagementServer";
import {iCreateEmployeeDTO} from "../../customTypes/appDataTypes/employeeTypes";

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
			return response.data;
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
			return response.data;
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
			return response.data;
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
			return response.data;
		} catch (error) {
			return rejectWithValue({
				message: "Failed to delete employee(s)",
			});
		}
	},
);
