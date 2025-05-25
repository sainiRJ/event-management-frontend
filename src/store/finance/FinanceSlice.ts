import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {FinanceState, FinanceData, REDUCER_NAME} from "./Types";
import {fetchFinanceData} from "./ThunkActions";
import {apiResponseStatuses} from "@/customTypes/NetworkTypes";
import {iGenericResponse} from "@/customTypes/CommonServiceTypes";

const initialState: FinanceState = {
	isLoading: false,
	httpStatusCode: null,
	message: null,
	responseStatus: apiResponseStatuses.IDLE,
	data: null,
};

const financeSlice = createSlice({
	name: REDUCER_NAME,
	initialState,
	reducers: {
		resetFinanceState: () => {
			return initialState;
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchFinanceData.pending, (state) => {
				state.isLoading = true;
				state.responseStatus = apiResponseStatuses.IDLE;
			})
			.addCase(
				fetchFinanceData.fulfilled,
				(
					state,
					action: PayloadAction<iGenericResponse<FinanceData | null> | null>,
				) => {
					state.isLoading = false;
					if (action.payload?.data) {
						state.data = action.payload.data;
					}
					state.responseStatus = apiResponseStatuses.SUCCESS;
				},
			)
			.addCase(fetchFinanceData.rejected, (state, action) => {
				state.isLoading = false;
				state.message =
					action.payload?.message || "Failed to fetch finance data";
				state.responseStatus = apiResponseStatuses.ERROR;
			});
	},
});

export const {resetFinanceState} = financeSlice.actions;
export default financeSlice.reducer;
