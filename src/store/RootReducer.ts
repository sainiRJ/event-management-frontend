import {combineReducers} from "@reduxjs/toolkit";

import exampleReducer from "./example/ExampleSlice";
import serviceReducer from "./services/ServicesSlice";

// Combine multiple reducers into a single root reducer
const rootReducer = combineReducers({
	serviceReducer,
});
export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
