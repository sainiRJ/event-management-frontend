import {AxiosError, AxiosInstance, AxiosResponse} from "axios";
import {httpStatusCodes} from "../../../../customTypes/NetworkTypes";
import { isAccessTokenExpired, isRefreshTokenExpired, refreshAccessToken, clearTokens, getAccessToken } from "../../../../utils/tokenUtils";
import { useNavigate } from "react-router-dom";

/**
 * NOTE: Currently we're not using redux in this project.
 * The type of this will be changed to the proper
 * redux store type once we start using redux.
 */
// import type {StoreType} from "@store/index";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StoreType = any;

/**
 * Mapping all the responseInterceptors defined as closures inside this function
 * to the axios-instance apiServer.
 *
 * Defined responseInterceptor closures needs to be registered to the constant object
 * axiosResponseInterceptors in order to get mapped.
 *
 * @param store
 * @param apiServer
 */
function BIToolServerAxiosResponseInterceptors(
	store: StoreType | null,
	apiServer: AxiosInstance,
): void {
	/*
		Response Interceptor which determines whether the error caused by authorization
		token expiration or not in case of an error reason.

		If yes, it attempts to get a new authorization token issued by invoking the
		designated api. If the refresh attempt is successful, then it will retry the
		originally failed request with the newly issued authorization token.
	 */
	const responseAuthTokenExpireInterceptor = {
		onFulfilled: async (
			response: AxiosResponse,
		): Promise<AxiosResponse> => {
			return response;
		},

		onRejected: async (reason: AxiosError): Promise<unknown> => {
			const originalRequest = reason.config;

			if (!originalRequest) {
				return Promise.reject(reason);
			}

			// Check if the error is due to unauthorized access
			if (reason.response?.status === httpStatusCodes.CLIENT_ERROR_UNAUTHORIZED) {
				const accessToken = getAccessToken();
				
				if (accessToken && isAccessTokenExpired(accessToken)) {
					// Check if refresh token is expired
					if (isRefreshTokenExpired()) {
						// If refresh token is expired, clear tokens and redirect to login
						clearTokens();
						window.location.href = '/login';
						return Promise.reject(reason);
					}

					try {
						// Try to refresh the access token
						const newAccessToken = await refreshAccessToken();
						if (newAccessToken) {
							// Update the original request with the new token
							originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
							// Retry the original request
							return apiServer(originalRequest);
						}
					} catch (error) {
						console.error('Error refreshing token:', error);
						// If refresh fails, redirect to login
						clearTokens();
						window.location.href = '/login';
					}
				}
			}

			return Promise.reject(reason);
		},
	};

	// TODO: add responseNetworkFailureInterceptor

	/**
	 * All response-interceptors should be registered here.
	 *
	 * eg: {
	 *     responseAuthorizationTokenExpireInterceptor: responseAuthorizationTokenExpireInterceptor
	 * }
	 */
	const axiosResponseInterceptors = {
		responseAuthTokenExpireInterceptor,
	};

	/**
	 * Extracting and mapping each responseInterceptor defined inside
	 * AxiosInterceptors.responseInterceptors with the axios-instance
	 * apiServer.
	 */
	Object.values(axiosResponseInterceptors).forEach(
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(responseInterceptor: any) => {
			apiServer.interceptors.response.use(
				responseInterceptor.onFulfilled,
				responseInterceptor.onRejected,
			);
		},
	);
}

export default BIToolServerAxiosResponseInterceptors;
