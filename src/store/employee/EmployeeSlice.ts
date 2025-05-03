import {createSlice} from "@reduxjs/toolkit";
import {iEmployeeState} from "../../customTypes/appDataTypes/employeeTypes";
import {
	createEmployee,
	getAllEmployees,
	updateEmployee,
	deleteEmployee,
} from "./ThunkActions";

const initialState: iEmployeeState = {
	employeeList: [],
	loading: false,
	error: null,
};

const employeeSlice = createSlice({
	name: "employee",
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		// Get All Employees
		builder.addCase(getAllEmployees.pending, (state) => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(getAllEmployees.fulfilled, (state, action) => {
			state.loading = false;
			state.employeeList = action.payload?.data || [];
		});
		builder.addCase(getAllEmployees.rejected, (state, action) => {
			state.loading = false;
			state.error = action.error.message || "Failed to fetch employees";
		});

		// Create Employee
		builder.addCase(createEmployee.pending, (state) => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(createEmployee.fulfilled, (state) => {
			state.loading = false;
		});
		builder.addCase(createEmployee.rejected, (state, action) => {
			state.loading = false;
			state.error = action.error.message || "Failed to create employee";
		});

		// Update Employee
		builder.addCase(updateEmployee.pending, (state) => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(updateEmployee.fulfilled, (state) => {
			state.loading = false;
		});
		builder.addCase(updateEmployee.rejected, (state, action) => {
			state.loading = false;
			state.error = action.error.message || "Failed to update employee";
		});

		// Delete Employee
		builder.addCase(deleteEmployee.pending, (state) => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(deleteEmployee.fulfilled, (state) => {
			state.loading = false;
		});
		builder.addCase(deleteEmployee.rejected, (state, action) => {
			state.loading = false;
			state.error = action.error.message || "Failed to delete employee";
		});
	},
});

export default employeeSlice.reducer;