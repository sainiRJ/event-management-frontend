import React, {useEffect, useState} from "react";
import {Routes, Route, BrowserRouter as Router} from "react-router-dom";
import HeaderTab from "./components/layouts/Header";
import Sidebar from "./components/layouts/Sidebar";
import BookingPage from "./components/Booking/BookingPage";
import FinancePage from "./components/Finance/FinancePage";
import LoginPage from "./components/Auth/LoginPage";
import SignupPage from "./components/Auth/SignupPage";
import DashboardPage from "./components/Dashboard/DashboardPage";
import OAuthCallback from "./components/Auth/OAuthCallback";
import EmployeeTable from "./components/Employee/EmployeeTable";
import AuthGuard from "./Authguard";
import ServiceTable from "./components/Services/ServiceTable";
import EmployeeServiceHistory from "./components/Employee/EmployeeServiceHistory";
import EmployeeDetails from "./components/Employee/EmployeeDetails";
import {Toaster} from "sonner";
import "./App.css";

function App() {
	const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth <= 1024);
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const token = localStorage.getItem("access_token");

	return (
		<div className="min-h-screen bg-gray-50/50 font-sans text-gray-900">
			<Toaster position="top-right" richColors />

			{token && (
				<>
					<Sidebar
						isCollapsed={isSidebarCollapsed}
						setIsCollapsed={setIsSidebarCollapsed}
					/>
					<HeaderTab />
				</>
			)}

			<div
				className={`transition-all duration-300 ${
					token && !isMobile ? (isSidebarCollapsed ? "pl-20" : "pl-64") : ""
				}`}
			>
				<main
					className={`w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 ${
						token ? "pt-24" : ""
					}`}
				>
					<Routes>
						<Route
							path="/"
							element={
								<AuthGuard requireAuth={true}>
									<DashboardPage />
								</AuthGuard>
							}
						/>
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
							path="/services"
							element={
								<AuthGuard requireAuth={true}>
									<ServiceTable />
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
						<Route
							path="/employee/:employeeId/details"
							element={<EmployeeDetails />}
						/>
						<Route
							path="/employee/:employeeId/service-history"
							element={<EmployeeServiceHistory />}
						/>
					</Routes>
				</main>
			</div>
		</div>
	);
}

export default App;
