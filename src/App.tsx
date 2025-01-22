import React from "react";
import {Button, CustomProvider, Container} from "rsuite";
import "rsuite/dist/rsuite.min.css";
import HeaderTab from "./components/layouts/Header";
import CustomSideNav from "./components/CustomSideNav";
import {BsChevronRight, BsChevronLeft} from "react-icons/bs";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import AddNewBooking from "./components/Booking/AddNewBooking/AddNewBooking";
import BookingTable from "./components/Booking/BookingTable";

function App() {
	const [showSideNav, setShowSideNav] = React.useState(false);

	function toggleSideNav() {
		setShowSideNav((prev) => !prev);
	}

	return (
		<CustomProvider theme="light">
			<Container className="app">
				<HeaderTab />
				<div style={{display: "flex", alignItems: "center"}}>
					<div
						onClick={toggleSideNav}
						style={{
							cursor: "pointer",
							position: "fixed",
							top: "50%",
							right: showSideNav ? "50px" : "0px",
							transition: "right 0.3s ease",
							zIndex: 9001,
						}}
					>
						{showSideNav ? (
							<BsChevronLeft size={24} />
						) : (
							<BsChevronRight size={24} />
						)}
					</div>
				</div>
				{showSideNav && <CustomSideNav />}
				<Routes>
					<Route path="/booking" element={<BookingTable />} />
				</Routes>
			</Container>
		</CustomProvider>
	);
}

export default App;
