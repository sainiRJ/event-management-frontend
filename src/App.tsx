import React from "react";
import {CustomProvider, Container} from "rsuite";
import "rsuite/dist/rsuite.min.css";
import HeaderTab from "./components/layouts/Header";
import CustomSideNav from "./components/CustomSideNav";
import {BsChevronRight, BsChevronLeft} from "react-icons/bs";
import {Routes, Route, BrowserRouter as Router} from "react-router-dom";
import BookingPage from "./components/Booking/BookingPage";
import LoginPage from "./components/Auth/LoginPage";
import SignupPage from "./components/Auth/SignupPage";
import OAuthCallback from "./components/Auth/OAuthCallback";

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
							zIndex: 9000,
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
					<Route path="/booking" element={<BookingPage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/signup" element={<SignupPage />} />
					<Route path="/auth/callback" element={<OAuthCallback />} />
				</Routes>
			</Container>
		</CustomProvider>
	);
}

export default App;
