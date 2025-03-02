import React from "react";
import ReactDOM from "react-dom/client";
import {BrowserRouter as Router} from "react-router-dom";
import App from "./App";
import {ReduxProvider} from "./store/Provider";

const root = ReactDOM.createRoot(
	document.getElementById("root") as HTMLElement,
);
root.render(
	<React.StrictMode>
		<ReduxProvider>
			<Router>
				<App />
			</Router>
		</ReduxProvider>
	</React.StrictMode>,
);
