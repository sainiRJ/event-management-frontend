import {combineReducers} from "@reduxjs/toolkit";
import employeeReducer from "./employee/EmployeeSlice";
import bookingReducer from "./booking/BookingSlice";
import serviceReducer from "./services/ServicesSlice";
import statusReducer from "./status/StatusSlice";
import financeReducer from "./finance/FinanceSlice";
import authReducer from "./auth/authSlice";

export const rootReducer = combineReducers({
	employeeReducer,
	bookingReducer,
	serviceReducer,
	statusReducer,
	financeReducer,
	authReducer,
});
export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
