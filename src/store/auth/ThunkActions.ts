import {createAsyncThunk} from "@reduxjs/toolkit";
import {curryGetThunkName} from "@/utils/ReduxUtil";
import {iGoogleAuthRequest, iAuthResponse} from "./Types";
import {
	iLoginDTO,
	iLoginResponse,
	iSignupDTO,
} from "@/customTypes/appDataTypes/authTypes";
import config from "../../config";

interface iSignupResponse {
	message: string;
}
import {iStateMessage} from "@/customTypes/GenericReduxTypes";
import {iGenericResponse} from "@/customTypes/CommonServiceTypes";
import {httpStatusCodes} from "@/customTypes/NetworkTypes";
import {REDUCER_NAME} from "./Types";
import {authService} from "@/services/api/eventManagementServer";
import {notifyAuthChanged} from "@/hooks/useSession";
const curriedGetThunkName = curryGetThunkName(REDUCER_NAME);

/**
 * Stores the access token only.
 *
 * The refresh token is set by the backend as an httpOnly cookie, so it is
 * neither written nor readable here - that is what keeps it out of reach of
 * any script on the page.
 */
const setTokens = (accessToken: string) => {
	localStorage.setItem("access_token", accessToken);
	// Lets the app shell react immediately instead of waiting for a reload.
	notifyAuthChanged();
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
						setTokens(data.data.token.accessToken);
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
	async (payload: iGoogleAuthRequest) => {
		const response = await fetch(
			`${config.EVENT_MANAGEMENT_BASE_URL}/auth/google/callback`,
			{
				method: "POST",
				headers: {"Content-Type": "application/json"},
				// Required so the backend can set the httpOnly refresh cookie.
				credentials: "include",
				body: JSON.stringify(payload),
			},
		);

		if (!response.ok) {
			throw new Error("Failed to authenticate");
		}

		const data: iAuthResponse = await response.json();
		setTokens(data.data.token.accessToken);
		return data;
	},
);
