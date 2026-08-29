import {AxiosInstance} from "axios";

import {APIResponse} from "@/customTypes/NetworkTypes";

import NetworkUtil from "@/utils/NetworkUtil";
import {apiEndpoints} from "./axiosConfig/AxiosServiceConstants";
import {
	iLoginDTO,
	iLoginResponse,
	iSignupDTO,
} from "@/customTypes/appDataTypes/authTypes";

function AuthService(apiServer: AxiosInstance) {
	const login = async (
		loginDTO: Partial<iLoginDTO>,
	): Promise<APIResponse<iLoginResponse> | null> => {
		let result = null;

		await apiServer
			.post(apiEndpoints.auth.login(), loginDTO)
			.then(
				(value) => {
					result = NetworkUtil.buildResult<null>(
						value.data,
						value.status,
						null,
						null,
					);
				},

				(reason) => {
					const {response} = reason;
					const {status, data} = response;

					result = NetworkUtil.buildResult<null>(data, status, data, null);
				},
			)
			.catch((error) => {
				throw error;
			});

		return result;
	};

	const signup = async (signDTO: Partial<iSignupDTO>) => {
		let result = null;

		await apiServer
			.post(apiEndpoints.auth.signup(), signDTO)
			.then(
				(value) => {
					result = NetworkUtil.buildResult<null>(
						null,
						value.status,
						value.data.message,
						null,
					);
				},

				(reason) => {
					const {response} = reason;
					const {status, data} = response;

					result = NetworkUtil.buildResult<null>(data, status, data, null);
				},
			)
			.catch((error) => {
				throw error;
			});

		return result;
	};

	/**
	 * Exchanges the httpOnly refresh cookie for a new access token.
	 * No body is sent - the cookie is the credential.
	 */
	const refreshToken = async (): Promise<APIResponse<{
		accessToken: string;
	}> | null> => {
		let result = null;

		await apiServer
			.post(apiEndpoints.auth.refresh())
			.then(
				(value) => {
					result = NetworkUtil.buildResult<{accessToken: string}>(
						value.data,
						value.status,
						null,
						null,
					);
				},

				(reason) => {
					const {response} = reason;
					const status = response?.status ?? 0;
					const data = response?.data ?? null;

					result = NetworkUtil.buildResult<null>(data, status, data, null);
				},
			)
			.catch(() => {
				result = null;
			});

		return result;
	};

	/** Revokes the refresh token server-side and clears the cookie. */
	const logout = async (): Promise<void> => {
		try {
			await apiServer.post(apiEndpoints.auth.logout());
		} catch {
			// Logging out locally must succeed even if the server call fails.
		}
	};

	/**
	 * Starts a password reset. The backend answers identically whether or not
	 * the address is registered, so this never reveals which emails exist.
	 */
	const forgotPassword = async (
		email: string,
	): Promise<APIResponse<{message: string}> | null> => {
		let result = null;

		await apiServer
			.post(apiEndpoints.auth.forgotPassword(), {email})
			.then(
				(value) => {
					result = NetworkUtil.buildResult<{message: string}>(
						value.data,
						value.status,
						null,
						null,
					);
				},
				(reason) => {
					const {response} = reason;
					result = NetworkUtil.buildResult<null>(
						response?.data ?? null,
						response?.status ?? 0,
						null,
						response?.data?.error ?? null,
					);
				},
			)
			.catch(() => {
				result = null;
			});

		return result;
	};

	/** Completes a reset with the emailed token. */
	const resetPassword = async (
		token: string,
		newPassword: string,
	): Promise<APIResponse<{message: string}> | null> => {
		let result = null;

		await apiServer
			.post(apiEndpoints.auth.resetPassword(), {token, newPassword})
			.then(
				(value) => {
					result = NetworkUtil.buildResult<{message: string}>(
						value.data,
						value.status,
						null,
						null,
					);
				},
				(reason) => {
					const {response} = reason;
					result = NetworkUtil.buildResult<null>(
						response?.data ?? null,
						response?.status ?? 0,
						null,
						response?.data?.error ?? null,
					);
				},
			)
			.catch(() => {
				result = null;
			});

		return result;
	};

	return {
		login,
		signup,
		refreshToken,
		logout,
		forgotPassword,
		resetPassword,
	};
}

export default AuthService;
