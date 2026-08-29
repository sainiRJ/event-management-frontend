import {createSlice} from "@reduxjs/toolkit";

import {apiResponseStatuses} from "@/customTypes/NetworkTypes";
import {fetchProfile, updateProfile, uploadProfilePhoto} from "./ThunkActions";
import {iUserState, REDUCER_NAME} from "./Types";

const initialState: iUserState = {
	isLoading: false,
	responseStatus: apiResponseStatuses.IDLE,
	httpStatusCode: null,
	message: null,
	profile: null,
};

export const userSlice = createSlice({
	name: REDUCER_NAME,
	initialState,
	reducers: {
		resetUserState: () => {
			return initialState;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchProfile.pending, (state) => {
				state.isLoading = true;
			})
			.addCase(fetchProfile.fulfilled, (state, action) => {
				const payload = action.payload;
				if (payload && payload.data) {
					state.profile = payload.data;
					state.isLoading = false;
					state.responseStatus = apiResponseStatuses.SUCCESS;
				}
			})
			.addCase(fetchProfile.rejected, (state) => {
				state.isLoading = false;
				state.responseStatus = apiResponseStatuses.ERROR;
			})
			.addCase(updateProfile.fulfilled, (state, action) => {
				const payload = action.payload;
				if (payload && payload.data) {
					state.profile = payload.data;
				}
			})
			.addCase(uploadProfilePhoto.fulfilled, (state, action) => {
				const payload = action.payload;
				if (payload && payload.data) {
					state.profile = payload.data;
				}
			});
	},
});

export const {resetUserState} = userSlice.actions;
export default userSlice.reducer;
