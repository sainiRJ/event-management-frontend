import {combineReducers} from "@reduxjs/toolkit";

import exampleReducer from "./example/ExampleSlice";
import serviceReducer from "./services/ServicesSlice";
import statusReducer from "./status/StatusSlice";
import bookingReducer from "./booking/BookingSlice";

// Combine multiple reducers into a single root reducer
const rootReducer = combineReducers({
	serviceReducer,
	statusReducer,
	bookingReducer,
});
export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
