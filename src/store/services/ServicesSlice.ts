import {createSlice} from "@reduxjs/toolkit";

import {apiResponseStatuses} from "@/customTypes/NetworkTypes";
import {fetchServices} from "./ThunkActions";
import {iServiceState, REDUCER_NAME} from "./Types";

// Define initial state based on the provided structure
const initialState: iServiceState = {
	isLoading: false,
	responseStatus: apiResponseStatuses.IDLE,
	httpStatusCode: null,
	service: null,
	message: null,
	serviceList: [],
};
export const serviceSlice = createSlice({
	name: REDUCER_NAME,
	initialState,
	reducers: {
		resetServiceState: () => {
			return initialState; // Reset to the initial state
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchServices.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(fetchServices.fulfilled, (state, action) => {
				const payload = action.payload;
				if (payload && payload.data) {
					state.serviceList = payload.data; // This should be a single order object
					state.isLoading = false;
					state.responseStatus = apiResponseStatuses.SUCCESS;
				}
			})
			.addCase(fetchServices.rejected, (state) => {
				state.message = "Failed to fetch order data";
				state.isLoading = false;
				state.responseStatus = apiResponseStatuses.ERROR;
			});
	},
});

export const {resetServiceState} = serviceSlice.actions;
export default serviceSlice.reducer;
