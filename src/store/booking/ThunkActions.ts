import {createAsyncThunk} from "@reduxjs/toolkit";

import {curryGetThunkName} from "@/utils/ReduxUtil";

import {httpStatusCodes, iPaginatedResult} from "@/customTypes/NetworkTypes";
import {iStateMessage} from "@/customTypes/GenericReduxTypes";
import {iGenericResponse} from "@/customTypes/CommonServiceTypes";

import {
	iCreateBookingDTO,
	iBookingRequest,
} from "@/customTypes/appDataTypes/bookingTypes";
import {bookingService} from "@/services/api/eventManagementServer";

import {REDUCER_NAME} from "./Types";

const curriedGetThunkName = curryGetThunkName(REDUCER_NAME);

export const createBooking = createAsyncThunk<
	iGenericResponse<iCreateBookingDTO | null> | null,
	iCreateBookingDTO,
	{
		rejectValue: iStateMessage;
	}
>(curriedGetThunkName("createBooking"), async (arg, {rejectWithValue}) => {
	try {
		const response = await bookingService.createBooking(arg);

		if (response) {
			const {httpStatusCode, data, message} = response;
			switch (httpStatusCode) {
				case httpStatusCodes.SUCCESS_OK: {
					if (data && data.data) {
						const payload = {
							...data,
							data: data.data,
						};

						return payload;
					} else {
						return rejectWithValue({
							httpStatusCode,
							message,
						});
					}
				}

				default: {
					return rejectWithValue({
						httpStatusCode,
						message,
					});
				}
			}
		} else {
			return rejectWithValue({
				message: "No response received", // or some other appropriate message
			});
		}
	} catch (error) {
		return rejectWithValue({
			message: "Something went wrong",
		});
	}
});

export const getAllBookings = createAsyncThunk<
	iGenericResponse<iPaginatedResult<iCreateBookingDTO> | null> | null,
	{page?: number; limit?: number; search?: string; statusId?: string} | void,
	{
		rejectValue: iStateMessage;
	}
>(curriedGetThunkName("getAllBookings"), async (arg, {rejectWithValue}) => {
	try {
		const response = await bookingService.getAllBookings(arg || {});

		if (response) {
			const {httpStatusCode, data, message} = response;
			switch (httpStatusCode) {
				case httpStatusCodes.SUCCESS_OK: {
					if (data && data.data) {
						const payload = {
							...data,
							data: data.data,
						};

						return payload;
					} else {
						return rejectWithValue({
							httpStatusCode,
							message,
						});
					}
				}

				default: {
					return rejectWithValue({
						httpStatusCode,
						message,
					});
				}
			}
		} else {
			return rejectWithValue({
				message: "No response received", // or some other appropriate message
			});
		}
	} catch (error) {
		return rejectWithValue({
			message: "Something went wrong",
		});
	}
});

export const getBookingRequest = createAsyncThunk<
	iGenericResponse<iBookingRequest[] | null> | null,
	void,
	{
		rejectValue: iStateMessage;
	}
>(curriedGetThunkName("getBookingRequest"), async (arg, {rejectWithValue}) => {
	try {
		const response = await bookingService.getBookingRequest();

		if (response) {
			const {httpStatusCode, data, message} = response;
			switch (httpStatusCode) {
				case httpStatusCodes.SUCCESS_OK: {
					if (data && data.data) {
						const payload = {
							...data,
							data: data.data,
						};

						return payload;
					} else {
						return rejectWithValue({
							httpStatusCode,
							message,
						});
					}
				}

				default: {
					return rejectWithValue({
						httpStatusCode,
						message,
					});
				}
			}
		} else {
			return rejectWithValue({
				message: "No response received",
			});
		}
	} catch (error) {
		return rejectWithValue({
			message: "Something went wrong",
		});
	}
});

export const deleteBooking = createAsyncThunk(
	"booking/deleteBooking",
	async (ids: string | string[], {rejectWithValue}) => {
		try {
			const response = await bookingService.deleteBooking(ids);
			if (!response) {
				return rejectWithValue({
					message: "Failed to delete booking(s)",
				});
			}
			return response;
		} catch (error) {
			return rejectWithValue({
				message: "Failed to delete booking(s)",
			});
		}
	},
);

export const updateBooking = createAsyncThunk(
	"booking/updateBooking",
	async (booking: iCreateBookingDTO) => {
		const response = await bookingService.updateBooking(booking);
		if (!response) {
			throw new Error("Failed to update booking");
		}
		return response.data;
	},
);
