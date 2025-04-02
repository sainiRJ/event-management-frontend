import {AxiosInstance} from "axios";

import AppUtil from "../../../../utils/AppUtil";

import type {AxiosRequestHeaders, InternalAxiosRequestConfig} from "axios";
import { getAccessToken } from "../../../../utils/tokenUtils";
/**
 * NOTE: Currently we're not using redux in this project.
 * The type of this will be changed to the proper
 * redux store type once we start using redux.
 */
// import type {StoreType} from "@store/index";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StoreType = any;

/**
 * Mapping all the requestInterceptors defined as closures inside this function
 * to the axios-instance apiServer.
 *
 * Defined requestInterceptor closures needs to be registered to the constant object
 * axiosRequestInterceptors in order to get mapped.
 *
 * @param store
 * @param apiServer
 */
function BIToolServerAxiosRequestInterceptors(
	store: StoreType | null = null,
	apiServer: AxiosInstance,
): void {
	/**
	 * Request Interceptor for adding Authorization: Bearer token by taking token from authSate in redux store.
	 * @param {AxiosRequestConfig} config
	 */
	function requestAuthorizationInterceptor(
		config: InternalAxiosRequestConfig,
	): InternalAxiosRequestConfig {
		const accessToken = getAccessToken();
		console.log('Request URL:', config.url);
		console.log('Access Token:', accessToken);
		
		if (accessToken) {
			const updatedConfig = {
				...config,
				headers: {
					...config.headers,
					Authorization: `Bearer ${accessToken}`,
				} as AxiosRequestHeaders,
			};
			console.log('Request Headers:', updatedConfig.headers);
			return updatedConfig;
		}
		console.log('No access token found');
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
			const oidcAccessToken =
				"eyJ0eXAiOiJKV1QiLCJub25jZSI6IkxXa1h4aGdOMmJ4RFJkb1M2YkgyN01fM0hKOVkyU3dkRXFfcGczNHZmZXciLCJhbGciOiJSUzI1NiIsIng1dCI6InEtMjNmYWxldlpoaEQzaG05Q1Fia1A1TVF5VSIsImtpZCI6InEtMjNmYWxldlpoaEQzaG05Q1Fia1A1TVF5VSJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9mNTM1NjYwYS03NDkzLTRjNzctOGI5Mi01YmJjZWVmNWJkY2MvIiwiaWF0IjoxNzEzNDMxNTU0LCJuYmYiOjE3MTM0MzE1NTQsImV4cCI6MTcxMzQzNjEyNSwiYWNjdCI6MCwiYWNyIjoiMSIsImFpbyI6IkFWUUFxLzhXQUFBQTlzZ0FHdU1MQi9DS1BjOGU1b2VmMU9Ndk55YTB5VC90cklnV0U4WnN5SHFZanRpRmFrTTBQWnAwNEVRVmoxWDBFVms1cE1iQlNvOU9YUStRTTc2ZnZMVDZTUzQ4THJRUnBic21aS0ErL3ZzPSIsImFtciI6WyJwd2QiLCJtZmEiXSwiYXBwX2Rpc3BsYXluYW1lIjoiQkkgVG9vbCAiLCJhcHBpZCI6ImJkOTAyYWY4LWQ5MjctNGE1OC04ZjJlLTgzY2JiMWE3NmQwNCIsImFwcGlkYWNyIjoiMSIsImZhbWlseV9uYW1lIjoiU3dhbGFoIiwiZ2l2ZW5fbmFtZSI6Ik11aGFtbWFkIiwiaWR0eXAiOiJ1c2VyIiwiaXBhZGRyIjoiMTAzLjE2MS4xNDUuNzMiLCJuYW1lIjoiTXVoYW1tYWQgU3dhbGFoIiwib2lkIjoiYzZkNWQ0MDgtZWVjNS00ZmRiLTg0ZTctZjFkMmI2OGI5MzUzIiwicGxhdGYiOiI1IiwicHVpZCI6IjEwMDMyMDAxQ0NBNTA0NjEiLCJyaCI6IjAuQVZBQUNtWTE5Wk4wZDB5TGtsdTg3dlc5ekFNQUFBQUFBQUFBd0FBQUFBQUFBQUMyQU9NLiIsInNjcCI6IlVzZXIuUmVhZCBwcm9maWxlIG9wZW5pZCBlbWFpbCIsInN1YiI6IjBMRmROOWdNYTBrMk80VVZNUkZKb0xVRjJLWk44Wmx2elBDZEdkZHBRTDAiLCJ0ZW5hbnRfcmVnaW9uX3Njb3BlIjoiTkEiLCJ0aWQiOiJmNTM1NjYwYS03NDkzLTRjNzctOGI5Mi01YmJjZWVmNWJkY2MiLCJ1bmlxdWVfbmFtZSI6InN3YWxhaEBzb2Z0d2F5LmNvbSIsInVwbiI6InN3YWxhaEBzb2Z0d2F5LmNvbSIsInV0aSI6IlF1RV9SWGg5NlVtb2VjTE9UdlpmQUEiLCJ2ZXIiOiIxLjAiLCJ3aWRzIjpbImI3OWZiZjRkLTNlZjktNDY4OS04MTQzLTc2YjE5NGU4NTUwOSJdLCJ4bXNfc3QiOnsic3ViIjoiU01MZklLUVFCMXJBMHAwdDZneHQwdTBvNnpMcU5lUE9raFA3NzJpQlhRMCJ9LCJ4bXNfdGNkdCI6MTM5Mzk1OTA1OX0.tZEunBqqnrSvoGyje4hVSS5vPR6ps2UdnQm4eKFrqluKUAJYIsGWO6Kt2h9IiQb7_Iloe4DNEj84ofZ8icIRTk3EPZnEfXxhregUQHCiFABZkrYK6WrJA3QHUsVtO769_oKqtyTS6Vswfmb7x0AgHWPCWP-h-KI8FZVKkh_lEj9DuoZtr9mwiktAjYqF3UiTDnaSZGgN-VdJ8rpSlkARWdh64vVdM0yJuG_43nUypD0mibYKDH-VZVOXRXaJ50cCw_R2S8kEjGpU6cO0tutEXf-ACONEsX1XfAK0SSNrSeyaK6JOUHBjgNx5MzI0rI86oJ5tBrfclaFlX-2Slx49xw";
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
