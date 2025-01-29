import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {WritableDraft} from "immer/dist/internal.js";
import Decimal from "decimal.js";

import {apiResponseStatuses} from "@/customTypes/NetworkTypes";
import {
	NullableNumber,
	NullableString,
	StringArray,
} from "@/customTypes/CommonTypes";
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
				console.log("payload.data", payload);
				if (payload && payload.data) {
					state.serviceList = payload.data; // This should be a single order object
					state.isLoading = false;
					state.responseStatus = apiResponseStatuses.SUCCESS;
				}
			})
			.addCase(fetchServices.rejected, (state, action) => {
				state.message = "Failed to fetch order data";
				state.isLoading = false;
				state.responseStatus = apiResponseStatuses.ERROR;
			});
	},
});

export const {resetServiceState} = serviceSlice.actions;
export default serviceSlice.reducer;
