import {createSlice} from "@reduxjs/toolkit";
import {apiResponseStatuses} from "@/customTypes/NetworkTypes";
import {handleGoogleCallback, login} from "./ThunkActions";
import {iAuthState, REDUCER_NAME, iAuthResponse} from "./Types";
import Cookies from "js-cookie";

const initialState: iAuthState = {
	isLoading: false,
	responseStatus: apiResponseStatuses.IDLE,
	httpStatusCode: null,
	token: null,
	user: null,
	message: null,
};

export const authSlice = createSlice({
	name: REDUCER_NAME,
	initialState,
	reducers: {
		resetAuthState: () => {
			return initialState;
		},
		logout: (state) => {
			localStorage.removeItem("access_token");
			Cookies.remove("refresh_token");
			return initialState;
		},
	},
	extraReducers: (builder) => {
		builder
			// Login cases
			.addCase(login.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(login.fulfilled, (state, action) => {
				const payload = action.payload;
				if (payload && payload.data) {
					state.token = payload.data.token;
					state.user = payload.data.userResponse;
					state.isLoading = false;
					state.responseStatus = apiResponseStatuses.SUCCESS;
				}
			})
			.addCase(login.rejected, (state, action) => {
				state.message = "Failed to login";
				state.isLoading = false;
				state.responseStatus = apiResponseStatuses.ERROR;
			})
			// Google callback cases
			.addCase(handleGoogleCallback.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(handleGoogleCallback.fulfilled, (state, action) => {
				const payload = action.payload;
				if (payload && payload.data) {
					state.token = payload.data.token;
					state.user = payload.data.userResponse;
					state.isLoading = false;
					state.responseStatus = apiResponseStatuses.SUCCESS;
				}
			})
			.addCase(handleGoogleCallback.rejected, (state, action) => {
				state.message = "Failed to authenticate";
				state.isLoading = false;
				state.responseStatus = apiResponseStatuses.ERROR;
			});
	},
});

export const {resetAuthState, logout} = authSlice.actions;
export default authSlice.reducer;
