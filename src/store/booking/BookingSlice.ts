import {createSlice} from "@reduxjs/toolkit";

import {apiResponseStatuses} from "@/customTypes/NetworkTypes";
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
	pagination: null,
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
			.addCase(createBooking.rejected, (state) => {
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
					state.bookingList = payload.data.items as iBooking[];
					state.pagination = payload.data.pagination;
					state.isLoading = false;
					state.responseStatus = apiResponseStatuses.SUCCESS;
				}
			})
			.addCase(getAllBookings.rejected, (state) => {
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
			.addCase(getBookingRequest.rejected, (state) => {
				state.message = "Failed to fetch order data";
				state.isLoading = false;
				state.responseStatus = apiResponseStatuses.ERROR;
			});
	},
});

export const {resetBookingState} = bookingSlice.actions;
export default bookingSlice.reducer;
