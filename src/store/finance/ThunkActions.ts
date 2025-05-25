import {createAsyncThunk} from "@reduxjs/toolkit";
import {RootState} from "@store/index";
import {curryGetThunkName} from "@/utils/ReduxUtil";
import {httpStatusCodes} from "@/customTypes/NetworkTypes";
import {iStateMessage} from "@/customTypes/GenericReduxTypes";
import {iGenericResponse} from "@/customTypes/CommonServiceTypes";
import {bookingService} from "@/services/api/eventManagementServer";
import {REDUCER_NAME, FetchFinanceParams, FinanceData} from "./Types";

const curriedGetThunkName = curryGetThunkName(REDUCER_NAME);

export const fetchFinanceData = createAsyncThunk<
	iGenericResponse<FinanceData | null> | null,
	FetchFinanceParams,
	{
		rejectValue: iStateMessage;
	}
>(
	curriedGetThunkName("fetchFinanceData"),
	async (params, {rejectWithValue}) => {
		try {
			// Build query string from params
			const queryParams = new URLSearchParams();
			if (params.fromDate) queryParams.append("fromDate", params.fromDate);
			if (params.toDate) queryParams.append("toDate", params.toDate);
			if (params.bookingStatusId)
				queryParams.append("bookingStatusId", params.bookingStatusId);
			if (params.paymentStatusId)
				queryParams.append("paymentStatusId", params.paymentStatusId);
			if (params.serviceId) queryParams.append("serviceId", params.serviceId);

			const response = await bookingService.getFinanceData(
				queryParams.toString(),
			);

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
	},
);
