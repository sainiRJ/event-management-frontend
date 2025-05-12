import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import Decimal from "decimal.js";

import {apiResponseStatuses} from "@/customTypes/NetworkTypes";
import {
	NullableNumber,
	NullableString,
	StringArray,
} from "@/customTypes/CommonTypes";
import {createBooking, getAllBookings, getBookingRequest} from "./ThunkActions";
import {iBookingState, REDUCER_NAME, iBooking} from "./Types";

// Define initial state based on the provided structure
const initialState: iBookingState = {
	isLoading: false,
	responseStatus: apiResponseStatuses.IDLE,
	httpStatusCode: null,
	booking: null,
	message: null,
	bookingList: [],
	bookingRequest: [],
};
export const bookingSlice = createSlice({
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
					state.booking = payload.data as iBooking; // Cast to iBooking
					state.isLoading = false;
					state.responseStatus = apiResponseStatuses.SUCCESS;
				}
			})
			.addCase(createBooking.rejected, (state, action) => {
				state.message = "Failed to fetch order data";
				state.isLoading = false;
				state.responseStatus = apiResponseStatuses.ERROR;
			})
			.addCase(getAllBookings.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(getAllBookings.fulfilled, (state, action) => {
				const payload = action.payload;
				if (payload && payload.data) {
					state.bookingList = payload.data as iBooking[]; // Cast to iBooking[]
					state.isLoading = false;
					state.responseStatus = apiResponseStatuses.SUCCESS;
				}
			})
			.addCase(getAllBookings.rejected, (state, action) => {
				state.message = "Failed to fetch order data";
				state.isLoading = false;
				state.responseStatus = apiResponseStatuses.ERROR;
			})
			.addCase(getBookingRequest.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(getBookingRequest.fulfilled, (state, action) => {
				const payload = action.payload;
				if (payload && payload.data) {
					state.bookingRequest = payload.data;
					state.isLoading = false;
					state.responseStatus = apiResponseStatuses.SUCCESS;
				}
			})
			.addCase(getBookingRequest.rejected, (state, action) => {
				state.message = "Failed to fetch order data";
				state.isLoading = false;
				state.responseStatus = apiResponseStatuses.ERROR;
			});
	},
});

export const {resetBookingState} = bookingSlice.actions;
export default bookingSlice.reducer;
