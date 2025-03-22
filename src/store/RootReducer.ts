import {combineReducers} from "@reduxjs/toolkit";

import exampleReducer from "./example/ExampleSlice";
import serviceReducer from "./services/ServicesSlice";
import statusReducer from "./status/StatusSlice";
import bookingReducer from "./booking/BookingSlice";
import employeeReducer from "./employee/EmployeeSlice"

// Combine multiple reducers into a single root reducer
const rootReducer = combineReducers({
	serviceReducer,
	statusReducer,
	bookingReducer,
	employeeReducer,
});
export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
