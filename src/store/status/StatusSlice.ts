import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {WritableDraft} from "immer/dist/internal.js";
import Decimal from "decimal.js";

import {apiResponseStatuses} from "@/customTypes/NetworkTypes";
import {
	NullableNumber,
	NullableString,
	StringArray,
} from "@/customTypes/CommonTypes";
import {fetchStatus} from "./ThunkActions";
import {iStatusState, REDUCER_NAME} from "./Types";

// Define initial state based on the provided structure
const initialState: iStatusState = {
	isLoading: false,
	responseStatus: apiResponseStatuses.IDLE,
	httpStatusCode: null,
	status: null,
	message: null,
	statusList: [],
};
export const statusSlice = createSlice({
	name: REDUCER_NAME,
	initialState,
	reducers: {
		resetStatusState: () => {
			return initialState; // Reset to the initial state
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchStatus.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(fetchStatus.fulfilled, (state, action) => {
				const payload = action.payload;
				console.log("payload.data", payload);
				if (payload && payload.data) {
					state.statusList = payload.data; // This should be a single order object
					state.isLoading = false;
					state.responseStatus = apiResponseStatuses.SUCCESS;
				}
			})
			.addCase(fetchStatus.rejected, (state, action) => {
				state.message = "Failed to fetch order data";
				state.isLoading = false;
				state.responseStatus = apiResponseStatuses.ERROR;
			});
	},
});

export const {resetStatusState} = statusSlice.actions;
export default statusSlice.reducer;
