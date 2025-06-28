import {createSlice} from "@reduxjs/toolkit";
import {
	iEmployeeState,
	iEmployeeStatsResponse,
	iEmployeeServiceHistory,
} from "../../customTypes/appDataTypes/employeeTypes";
import {
	createEmployee,
	getAllEmployees,
	updateEmployee,
	deleteEmployee,
	getEmployeeStats,
	updateEmployeePayment,
	getAssignedServices,
	getEmployeeServiceHistory,
} from "./ThunkActions";

const initialState: iEmployeeState = {
	employeeList: [],
	loading: false,
	error: null,
	stats: null,
	assignedServices: null,
	serviceHistory: null,
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

		// Get Employee Stats
		builder.addCase(getEmployeeStats.pending, (state) => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(getEmployeeStats.fulfilled, (state, action) => {
			state.loading = false;
			console.log("Reducer received payload:", action.payload); // Debug log

			if (action.payload?.data?.employeeStats && action.payload?.data?.ids) {
				console.log("Setting stats:", action.payload.data); // Debug log
				state.stats = action.payload.data;
			} else {
				console.log(
					"No stats data found in response. Payload:",
					action.payload,
				); // Debug log
				state.stats = null;
			}
		});
		builder.addCase(getEmployeeStats.rejected, (state, action) => {
			state.loading = false;
			console.log("Stats fetch rejected:", action.payload); // Debug log
			state.error =
				typeof action.payload === "object" &&
				action.payload !== null &&
				"message" in action.payload
					? (action.payload.message as string)
					: "Failed to fetch employee stats";
			state.stats = null;
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

		// Update Employee Payment
		builder.addCase(updateEmployeePayment.pending, (state) => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(updateEmployeePayment.fulfilled, (state) => {
			state.loading = false;
		});
		builder.addCase(updateEmployeePayment.rejected, (state, action) => {
			state.loading = false;
			state.error = action.error.message || "Failed to update employee payment";
		});

		// Get Assigned Services
		builder.addCase(getAssignedServices.pending, (state) => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(getAssignedServices.fulfilled, (state, action) => {
			state.loading = false;
			state.assignedServices = action.payload?.data || null;
		});
		builder.addCase(getAssignedServices.rejected, (state, action) => {
			state.loading = false;
			state.error = action.error.message || "Failed to fetch assigned services";
			state.assignedServices = null;
		});

		// Get Employee Service History
		builder.addCase(getEmployeeServiceHistory.pending, (state) => {
			state.loading = true;
			state.error = null;
		});
		builder.addCase(getEmployeeServiceHistory.fulfilled, (state, action) => {
			state.loading = false;
			if (action.payload?.data?.data) {
				state.serviceHistory = action.payload.data.data;
			} else {
				state.serviceHistory = null;
			}
		});
		builder.addCase(getEmployeeServiceHistory.rejected, (state, action) => {
			state.loading = false;
			state.error =
				action.error.message || "Failed to fetch employee service history";
			state.serviceHistory = null;
		});
	},
});

export default employeeSlice.reducer;
