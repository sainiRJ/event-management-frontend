import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter as Router} from "react-router-dom";
import App from "./App";
import {ReduxProvider} from "./store/Provider";
import ErrorBoundary from "./components/common/ErrorBoundary";
import * as Sentry from "@sentry/react";

/**
 * Error reporting is opt-in: with no VITE_SENTRY_DSN nothing initialises
 * and nothing is sent. Uncaught errors only; no replay, no tracing.
 */
if (import.meta.env.VITE_SENTRY_DSN) {
	Sentry.init({
		dsn: import.meta.env.VITE_SENTRY_DSN,
		environment: import.meta.env.MODE,
		tracesSampleRate: 0,
		sendDefaultPii: false,
	});
}

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
