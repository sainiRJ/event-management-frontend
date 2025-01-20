import React from "react";
import {Button, CustomProvider, Container} from "rsuite";
import "rsuite/dist/rsuite.min.css";
import HeaderTab from "./components/layouts/Header";
import SidebarUI from "./components/layouts/Sidebar";

function App() {
	console.log("App");
	return (
		<CustomProvider theme="light">
			<Container className="app">
				<HeaderTab />
				<SidebarUI />
				<header className="app-header">
					<p>
						Edit <code>src/App.js</code> and save to reload.
					</p>

					<Button
						href="https://reactjs.org"
						target="_blank"
						rel="noopener noreferrer"
					>
						Learn React
					</Button>
				</header>
			</Container>
		</CustomProvider>
	);
}

export default App;
