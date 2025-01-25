import {createAsyncThunk} from "@reduxjs/toolkit";
import Decimal from "decimal.js";

import {RootState} from "@store/index";
import {curryGetThunkName} from "@/utils/ReduxUtil";

import {httpStatusCodes} from "@/customTypes/NetworkTypes";
import {iStateMessage} from "@/customTypes/GenericReduxTypes";
import {iGenericResponse} from "@/customTypes/CommonServiceTypes";

import {iCreateBookingDTO} from "@/customTypes/appDataTypes/bookingTypes";
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
