import {createAsyncThunk} from "@reduxjs/toolkit";

import {curryGetThunkName} from "@/utils/ReduxUtil";

import {httpStatusCodes} from "@/customTypes/NetworkTypes";
import {iStateMessage} from "@/customTypes/GenericReduxTypes";
import {iGenericResponse} from "@/customTypes/CommonServiceTypes";

import {
	iUserProfile,
	iUpdateProfileDTO,
	iChangePasswordDTO,
} from "@/customTypes/appDataTypes/userTypes";
import {userService} from "@/services/api/eventManagementServer";

import {REDUCER_NAME} from "./Types";

const curriedGetThunkName = curryGetThunkName(REDUCER_NAME);

export const fetchProfile = createAsyncThunk<
	iGenericResponse<iUserProfile | null> | null,
	void,
	{
		rejectValue: iStateMessage;
	}
>(curriedGetThunkName("fetchProfile"), async (arg, {rejectWithValue}) => {
	try {
		const response = await userService.getProfile();

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
						return rejectWithValue({httpStatusCode, message});
					}
				}

				default: {
					return rejectWithValue({httpStatusCode, message});
				}
			}
		} else {
			return rejectWithValue({message: "No response received"});
		}
	} catch (error) {
		return rejectWithValue({message: "Something went wrong"});
	}
});

export const updateProfile = createAsyncThunk<
	iGenericResponse<iUserProfile | null> | null,
	iUpdateProfileDTO,
	{
		rejectValue: iStateMessage;
	}
>(curriedGetThunkName("updateProfile"), async (arg, {rejectWithValue}) => {
	try {
		const response = await userService.updateProfile(arg);

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
						return rejectWithValue({httpStatusCode, message});
					}
				}

				default: {
					return rejectWithValue({httpStatusCode, message});
				}
			}
		} else {
			return rejectWithValue({message: "No response received"});
		}
	} catch (error) {
		return rejectWithValue({message: "Something went wrong"});
	}
});

export const uploadProfilePhoto = createAsyncThunk<
	iGenericResponse<iUserProfile | null> | null,
	File,
	{
		rejectValue: iStateMessage;
	}
>(curriedGetThunkName("uploadProfilePhoto"), async (arg, {rejectWithValue}) => {
	try {
		const response = await userService.uploadProfilePhoto(arg);

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
						return rejectWithValue({httpStatusCode, message});
					}
				}

				default: {
					return rejectWithValue({httpStatusCode, message});
				}
			}
		} else {
			return rejectWithValue({message: "No response received"});
		}
	} catch (error) {
		return rejectWithValue({message: "Something went wrong"});
	}
});

export const changePassword = createAsyncThunk<
	iGenericResponse<null> | null,
	iChangePasswordDTO,
	{
		rejectValue: iStateMessage;
	}
>(curriedGetThunkName("changePassword"), async (arg, {rejectWithValue}) => {
	try {
		const response = await userService.changePassword(arg);

		if (response) {
			const {httpStatusCode, data, message} = response;
			switch (httpStatusCode) {
				case httpStatusCodes.SUCCESS_OK: {
					return data;
				}

				default: {
					return rejectWithValue({httpStatusCode, message});
				}
			}
		} else {
			return rejectWithValue({message: "No response received"});
		}
	} catch (error) {
		return rejectWithValue({message: "Something went wrong"});
	}
});
