import {createAsyncThunk} from "@reduxjs/toolkit";

import {curryGetThunkName} from "@/utils/ReduxUtil";

import {httpStatusCodes} from "@/customTypes/NetworkTypes";
import {iStateMessage} from "@/customTypes/GenericReduxTypes";
import {iGenericResponse} from "@/customTypes/CommonServiceTypes";

import {iStatus} from "@/customTypes/appDataTypes/statusTypes";
import {statusService} from "@/services/api/eventManagementServer";

import {REDUCER_NAME} from "./Types";

const curriedGetThunkName = curryGetThunkName(REDUCER_NAME);

export const fetchStatus = createAsyncThunk<
	iGenericResponse<iStatus[] | null> | null,
	void,
	{
		rejectValue: iStateMessage;
	}
>(curriedGetThunkName("fetchServices"), async (arg, {rejectWithValue}) => {
	try {
		const response = await statusService.fetchStatus();

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
