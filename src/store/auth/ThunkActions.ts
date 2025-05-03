import {createAsyncThunk} from "@reduxjs/toolkit";
import {curryGetThunkName} from "@/utils/ReduxUtil";
import {iGoogleUserData, iLoginCredentials, iAuthResponse} from "./Types";
import {
	iLoginDTO,
	iLoginResponse,
	iSignupDTO,
} from "@/customTypes/appDataTypes/authTypes";

interface iSignupResponse {
	message: string;
}
import {iStateMessage} from "@/customTypes/GenericReduxTypes";
import {iGenericResponse} from "@/customTypes/CommonServiceTypes";
import {httpStatusCodes} from "@/customTypes/NetworkTypes";
import Cookies from "js-cookie";
import {REDUCER_NAME} from "./Types";
import {authService} from "@/services/api/eventManagementServer";
const curriedGetThunkName = curryGetThunkName(REDUCER_NAME);

const setTokens = (accessToken: string, refreshToken: string) => {
	localStorage.setItem("access_token", accessToken);
	Cookies.set("refresh_token", refreshToken, {expires: 7}); // Cookie expires in 7 days
};

export const login = createAsyncThunk<
	iGenericResponse<iLoginResponse | null> | null,
	iLoginDTO,
	{
		rejectValue: iStateMessage;
	}
>(curriedGetThunkName("auth/login"), async (arg, {rejectWithValue}) => {
	try {
		const response = await authService.login(arg);
		if (response) {
			const {httpStatusCode, data, message} = response;
			switch (httpStatusCode) {
				case httpStatusCodes.SUCCESS_OK: {
					if (data && data.data) {
						setTokens(
							data.data.token.accessToken,
							data.data.token.refreshToken,
						);
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

export const signup = createAsyncThunk<
	iGenericResponse<iSignupResponse | null> | null,
	iSignupDTO,
	{
		rejectValue: iStateMessage;
	}
>(curriedGetThunkName("auth/signup"), async (arg, {rejectWithValue}) => {
	try {
		const response = await authService.signup(arg);
		if (response) {
			const {httpStatusCode, data, message} = response;
			switch (httpStatusCode) {
				case httpStatusCodes.SUCCESS_OK: {
					if (data) {
						return response;
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

export const handleGoogleCallback = createAsyncThunk(
	"auth/handleGoogleCallback",
	async (userData: iGoogleUserData) => {
		const response = await fetch(
			"http://localhost:3080/api/auth/google/callback",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(userData),
			},
		);

		if (!response.ok) {
			throw new Error("Failed to authenticate");
		}

		const data: iAuthResponse = await response.json();
		setTokens(data.data.token.accessToken, data.data.token.refreshToken);
		return data;
	},
);
