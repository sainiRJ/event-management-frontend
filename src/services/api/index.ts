import {injectStore as eventManagementServerInjectStore} from "./eventManagementServer/axiosConfig/index";

/**
 * NOTE: Currently we're not using redux in this project.
 * The type of this will be changed to the proper
 * redux store type once we start using redux.
 */
// import type {StoreType} from "@store/index";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type StoreType = any;

/**
 * Injects redux-store to the local variable reduxStore which gets used
 * inside the axios interceptors.
 *
 * For more details, please refer:
 * https://redux.js.org/faq/code-structure#how-can-i-use-the-redux-store-in-non-component-files
 *
 * @param store
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const injectStore = (store: StoreType): void => {
	eventManagementServerInjectStore(store);
};
