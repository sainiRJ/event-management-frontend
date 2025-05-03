import {createSlice} from "@reduxjs/toolkit";

interface iFinanceState {
	revenueData: any[];
	expenseData: any[];
	projectData: any[];
	loading: boolean;
	error: string | null;
}

const initialState: iFinanceState = {
	revenueData: [
		{month: "Jan", revenue: 45000, expenses: 32000, profit: 13000},
		{month: "Feb", revenue: 52000, expenses: 34000, profit: 18000},
		{month: "Mar", revenue: 61000, expenses: 39000, profit: 22000},
		{month: "Apr", revenue: 58000, expenses: 36000, profit: 22000},
		{month: "May", revenue: 72000, expenses: 41000, profit: 31000},
		{month: "Jun", revenue: 85000, expenses: 44000, profit: 41000},
	],
	expenseData: [
		{name: "Decorations", value: 35000, color: "#8884d8"},
		{name: "Labor", value: 25000, color: "#82ca9d"},
		{name: "Transportation", value: 15000, color: "#ffc658"},
		{name: "Marketing", value: 12000, color: "#ff8042"},
		{name: "Utilities", value: 8000, color: "#0088fe"},
	],
	projectData: [
		{name: "Wedding Decor", profit: 15000},
		{name: "Corporate Events", profit: 12000},
		{name: "Birthday Parties", profit: 8000},
		{name: "Festival Decor", profit: 10000},
		{name: "Home Decor", profit: 6000},
	],
	loading: false,
	error: null,
};

const financeSlice = createSlice({
	name: "finance",
	initialState,
	reducers: {
		setLoading: (state, action) => {
			state.loading = action.payload;
		},
		setError: (state, action) => {
			state.error = action.payload;
		},
		updateRevenueData: (state, action) => {
			state.revenueData = action.payload;
		},
		updateExpenseData: (state, action) => {
			state.expenseData = action.payload;
		},
		updateProjectData: (state, action) => {
			state.projectData = action.payload;
		},
	},
});

export const {
	setLoading,
	setError,
	updateRevenueData,
	updateExpenseData,
	updateProjectData,
} = financeSlice.actions;

export default financeSlice.reducer;
