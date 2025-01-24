import axios from "axios";

/**
 * NOTE: Currently we're not using redux in this project.
 * The type of this will be changed to the proper
 * redux store type once we start using redux.
 */
// import type {StoreType} from "@store/index";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StoreType = any;

import AxiosResponseInterceptors from "@/services/api/commonInterceptors/AxiosResponseInterceptors";
import EventServerAxiosResponseInterceptors from "@/services/api/eventManagementServer/axiosConfig/EventServerAxiosResponseInterceptors";
import EventServerAxiosRequestInterceptors from "@/services/api/eventManagementServer/axiosConfig/EventServerAxiosRequestInterceptors";

import {axiosRequestConfig} from "./AxiosServiceConstants";

/**
 * Creating axios instance for handling api service requests with
 * apiServerConfig.
 *
 * For updating any of the request configuration or for reviewing
 * the current configuration, please refer AxiosServiceConstants.axiosRequestConfig.
 */
const apiServer = axios.create(axiosRequestConfig);

/**
 * Injects the redux store to the local variable reduxStore which gets used
 * inside the axios interceptors.
 *
 * For more details, please refer:
 * https://redux.js.org/faq/code-structure#how-can-i-use-the-redux-store-in-non-component-files
 *
 * @param store
 */
export const injectStore = (store: StoreType): void => {
	// registering common axios response interceptors
	AxiosResponseInterceptors(store, apiServer);

	// registering axios request interceptors specific to EventServer
	EventServerAxiosRequestInterceptors(store, apiServer);

	// registering axios response interceptors specific to EventServer
	EventServerAxiosResponseInterceptors(store, apiServer);
};

export {apiServer};
