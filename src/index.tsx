import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter as Router} from "react-router-dom";
import App from "./App";
import {ReduxProvider} from "./store/Provider";
import ErrorBoundary from "./components/common/ErrorBoundary";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement,
);
root.render(
	<ErrorBoundary>
		<ReduxProvider>
			<Router>
				<App />
			</Router>
		</ReduxProvider>
	</ErrorBoundary>,
);
