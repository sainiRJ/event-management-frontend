import {createAsyncThunk} from "@reduxjs/toolkit";
import {setLoading, setError} from "./FinanceSlice";

// Simulated API call delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Thunk action to fetch financial data
export const fetchFinancialData = createAsyncThunk(
	"finance/fetchFinancialData",
	async (_, {dispatch}) => {
		try {
			dispatch(setLoading(true));
			// Simulate API call
			await delay(1000);

			// In a real application, this would be an API call
			const response = {
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
			};

			return response;
		} catch (error: any) {
			dispatch(setError(error.message));
			throw error;
		} finally {
			dispatch(setLoading(false));
		}
	},
);
