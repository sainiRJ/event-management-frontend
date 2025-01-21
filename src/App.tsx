import React from "react";
import {Button, CustomProvider, Container} from "rsuite";
import "rsuite/dist/rsuite.min.css";
import HeaderTab from "./components/layouts/Header";
import SidebarUI from "./components/layouts/Sidebar";
import CustomSideNav from "./components/CustomSideNav";

function App() {
	console.log("App");
	return (
		<CustomProvider theme="light">
			<Container className="app">
				<HeaderTab />
				<CustomSideNav />
			</Container>
		</CustomProvider>
	);
}

export default App;
