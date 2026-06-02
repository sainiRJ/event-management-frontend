import {createAsyncThunk} from "@reduxjs/toolkit";
import Decimal from "decimal.js";

import {RootState} from "@store/index";
import {curryGetThunkName} from "@/utils/ReduxUtil";

import {httpStatusCodes} from "@/customTypes/NetworkTypes";
import {iStateMessage} from "@/customTypes/GenericReduxTypes";
import {iGenericResponse} from "@/customTypes/CommonServiceTypes";

import {
	iService,
	iCreateServiceDTO,
} from "@/customTypes/appDataTypes/serviceTypes";
import {serviceService} from "@/services/api/eventManagementServer";

import {REDUCER_NAME} from "./Types";

const curriedGetThunkName = curryGetThunkName(REDUCER_NAME);

export const fetchServices = createAsyncThunk<
	iGenericResponse<iService[] | null> | null,
	void,
	{
		rejectValue: iStateMessage;
	}
>(curriedGetThunkName("fetchServices"), async (arg, {rejectWithValue}) => {
	try {
		const response = await serviceService.fetchServices();

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

export const createService = createAsyncThunk<
	iGenericResponse<iService | null> | null,
	iCreateServiceDTO,
	{
		rejectValue: iStateMessage;
	}
>(curriedGetThunkName("createService"), async (arg, {rejectWithValue}) => {
	try {
		const response = await serviceService.createService(arg);

		if (response) {
			const {httpStatusCode, data, message} = response;
			switch (httpStatusCode) {
				case httpStatusCodes.SUCCESS_CREATED: {
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

export const updateService = createAsyncThunk<
	iGenericResponse<iService | null> | null,
	iCreateServiceDTO,
	{
		rejectValue: iStateMessage;
	}
>(curriedGetThunkName("updateService"), async (arg, {rejectWithValue}) => {
	try {
		const {id, ...updateData} = arg;
		const response = await serviceService.updateService(id!, updateData);

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

export const deleteService = createAsyncThunk<
	iGenericResponse<{message: string} | null> | null,
	string,
	{
		rejectValue: iStateMessage;
	}
>(curriedGetThunkName("deleteService"), async (arg, {rejectWithValue}) => {
	try {
		const response = await serviceService.deleteService(arg);

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
