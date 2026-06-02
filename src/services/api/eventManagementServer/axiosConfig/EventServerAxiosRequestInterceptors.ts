import {AxiosInstance} from "axios";

import AppUtil from "../../../../utils/AppUtil";

import type {AxiosRequestHeaders, InternalAxiosRequestConfig} from "axios";
import {getAccessToken} from "../../../../utils/tokenUtils";

/**
 * Mapping all the requestInterceptors defined as closures inside this function
 * to the axios-instance apiServer.
 *
 * Defined requestInterceptor closures needs to be registered to the constant object
 * axiosRequestInterceptors in order to get mapped.
 *
 * @param apiServer
 */
function BIToolServerAxiosRequestInterceptors(apiServer: AxiosInstance): void {
	/**
	 * Request Interceptor for adding Authorization: Bearer token by taking token from authSate in redux store.
	 * @param {AxiosRequestConfig} config
	 */
	function requestAuthorizationInterceptor(
		config: InternalAxiosRequestConfig,
	): InternalAxiosRequestConfig {
		const accessToken = getAccessToken();
		if (accessToken) {
			const updatedConfig = {
				...config,
				headers: {
					...config.headers,
					Authorization: `Bearer ${accessToken}`,
				} as AxiosRequestHeaders,
			};
			return updatedConfig;
		}
		return config;
	}

	/**
	 * Axios Request Interceptor for injecting dummy OIDC access token in local development environment
	 * for user profile testing purposes.
	 *
	 * This interceptor should be used only in local development environment.
	 * @param config
	 * @returns
	 */
	function requestLocalDevDummyOIDCAccessTokenInterceptor(
		config: InternalAxiosRequestConfig,
	): InternalAxiosRequestConfig {
		if (AppUtil.isDev()) {
			const oidcAccessToken = "dummy-oidc-access-token";
			const oidcHeaderKey = "x-amzn-oidc-accesstoken";

			return {
				...config,
				headers: {
					...config.headers,
					[oidcHeaderKey]: oidcAccessToken,
				} as unknown as AxiosRequestHeaders,
			};
		} else {
			return config;
		}
	}

	/**
	 * All request-interceptors should be registered here.
	 *
	 * eg: {
	 *     requestAuthorizationInterceptor: requestAuthorizationInterceptor
	 * }
	 */
	const axiosRequestInterceptors = {
		requestAuthorizationInterceptor,
		requestLocalDevDummyOIDCAccessTokenInterceptor,
	};

	/**
	 * Extracting and mapping each requestInterceptors with the axios-instance
	 * apiServer.
	 */
	Object.values(axiosRequestInterceptors).forEach((requestInterceptor) => {
		return apiServer.interceptors.request.use(requestInterceptor);
	});
}

export default BIToolServerAxiosRequestInterceptors;
