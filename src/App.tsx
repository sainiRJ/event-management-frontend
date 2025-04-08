import React, { useEffect, useState } from "react";
import {CustomProvider, Container} from "rsuite";
import "rsuite/dist/rsuite.min.css";
import HeaderTab from "./components/layouts/Header";
import CustomSideNav from "./components/CustomSideNav/CustomSideNav";
import {BsChevronRight, BsChevronLeft} from "react-icons/bs";
import {Routes, Route, BrowserRouter as Router} from "react-router-dom";
import BookingPage from "./components/Booking/BookingPage";
import FinancePage from "./components/Finance/FinancePage";
import LoginPage from "./components/Auth/LoginPage";
import SignupPage from "./components/Auth/SignupPage";
import DashboardPage from "./components/Dashboard/DashboardPage";
import OAuthCallback from "./components/Auth/OAuthCallback";
import EmployeeTable from "./components/Employee/EmployeeTable";
import AuthGuard from "./Authguard";
import { ImportSite } from "@rsuite/icons";
import "./App.css";

function App() {
	const [showSideNav, setShowSideNav] = React.useState(false);
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 768);
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	function toggleSideNav() {
		setShowSideNav((prev) => !prev);
	}

	return (
		<CustomProvider theme="light">
			<Container className="app">
				<HeaderTab />
				<div className="main-content">
					{!isMobile && (
						<div
							onClick={toggleSideNav}
							className="side-nav-toggle"
							style={{
								right: showSideNav ? "50px" : "0px",
							}}
						>
							{showSideNav ? (
								<BsChevronLeft size={24} />
							) : (
								<BsChevronRight size={24} />
							)}
						</div>
					)}
					{!isMobile && showSideNav && <CustomSideNav />}
					<div className={`content-wrapper ${isMobile ? 'mobile-content' : ''}`}>
						<Routes>
							<Route
								path="/dashboard"
								element={
									<AuthGuard requireAuth={true}>
										<DashboardPage />
									</AuthGuard>
								}
							/>
							<Route
								path="/employees"
								element={
									<AuthGuard requireAuth={true}>
										<EmployeeTable />
									</AuthGuard>
								}
							/>
							<Route
								path="/booking"
								element={
									<AuthGuard requireAuth={true}>
										<BookingPage />
									</AuthGuard>
								}
							/>
							<Route
								path="/finance"
								element={
									<AuthGuard requireAuth={true}>
										<FinancePage />
									</AuthGuard>
								}
							/>
							<Route
								path="/login"
								element={
									<AuthGuard requireAuth={false}>
										<LoginPage />
									</AuthGuard>
								}
							/>
							<Route path="/signup" element={<SignupPage />} />
							<Route path="/auth/callback" element={<OAuthCallback />} />
						</Routes>
					</div>
				</div>
			</Container>
		</CustomProvider>
	);
}

export default App;
