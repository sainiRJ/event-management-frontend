import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {WritableDraft} from "immer/dist/internal.js";
import Decimal from "decimal.js";

import {apiResponseStatuses} from "@/customTypes/NetworkTypes";
import {
	NullableNumber,
	NullableString,
	StringArray,
} from "@/customTypes/CommonTypes";
import {createBooking} from "./ThunkActions";
import {iBookingState, REDUCER_NAME} from "./Types";

// Define initial state based on the provided structure
const initialState: iBookingState = {
	isLoading: false,
	responseStatus: apiResponseStatuses.IDLE,
	httpStatusCode: null,
	booking: null,
	message: null,
	bookingList: [],
};
export const projectSlice = createSlice({
	name: REDUCER_NAME,
	initialState,
	reducers: {
		resetBookingState: () => {
			return initialState; // Reset to the initial state
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(createBooking.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(createBooking.fulfilled, (state, action) => {
				const payload = action.payload;
				if (payload && payload.data) {
					state.booking = payload.data; // This should be a single order object
					state.isLoading = false;
					state.responseStatus = apiResponseStatuses.SUCCESS;
				}
			})
			.addCase(createBooking.rejected, (state, action) => {
				state.message = "Failed to fetch order data";
				state.isLoading = false;
				state.responseStatus = apiResponseStatuses.ERROR;
			});
	},
});
