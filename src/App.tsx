import React, {useEffect, useState} from "react";
import {Routes, Route} from "react-router-dom";
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
import ErrorBoundary from "./components/common/ErrorBoundary";
import ProfilePage from "./components/Profile/ProfilePage";
import NotFoundPage from "./components/common/NotFoundPage";
import {useNotificationSocket} from "./hooks/useNotificationSocket";
import {Toaster} from "sonner";
import "./App.css";
import {useSession} from "./hooks/useSession";
import {useAppDispatch} from "./store/Hooks";
import {fetchProfile} from "./store/user/ThunkActions";
import GalleryPage from "./components/Gallery/GalleryPage";
import ChatTranscriptsPage from "./components/ChatTranscripts/ChatTranscriptsPage";
import ContactMessagesPage from "./components/ContactMessages/ContactMessagesPage";
import BookingRequestsPage from "./components/BookingRequests/BookingRequestsPage";
import CalendarPage from "./components/Calendar/CalendarPage";
import {usePendingCounts} from "./hooks/usePendingCounts";
import ForgotPasswordPage from "./components/Auth/ForgotPasswordPage";
import ResetPasswordPage from "./components/Auth/ResetPasswordPage";

/* Tailwind's `lg:` breakpoint activates at >=1024px, so mobile state must
   flip at the same boundary — otherwise the sidebar and the content padding
   disagree at exactly 1024px and the layout overlaps/breaks. */
const MOBILE_BREAKPOINT = 1024;

function App() {
	const [isMobile, setIsMobile] = useState(
		window.innerWidth < MOBILE_BREAKPOINT,
	);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	/**
	 * Reactive: the shell appears the moment login succeeds, instead of only
	 * after a manual page reload.
	 */
	const isAuthenticated = useSession();
	const dispatch = useAppDispatch();

	useNotificationSocket(isAuthenticated);
	const counts = usePendingCounts(isAuthenticated);

	// The header needs the signed-in user's real name and role.
	useEffect(() => {
		if (isAuthenticated) {
			dispatch(fetchProfile());
		}
	}, [isAuthenticated, dispatch]);

	return (
		<div className="min-h-screen bg-cream-100 font-sans text-[#2B2129]">
			<Toaster position="top-right" richColors />

			{isAuthenticated && (
				<>
					<Sidebar
						isCollapsed={isSidebarCollapsed}
						setIsCollapsed={setIsSidebarCollapsed}
						counts={counts}
					/>
					<HeaderTab counts={counts} />
				</>
			)}

			<div
				className={`transition-all duration-300 ${
					isAuthenticated && !isMobile
						? isSidebarCollapsed
							? "lg:pl-20"
							: "lg:pl-64"
						: ""
				}`}
			>
				<main
					className={`w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 ${
						isAuthenticated ? "pt-24" : ""
					}`}
				>
					<ErrorBoundary>
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
							<Route path="/forgot-password" element={<ForgotPasswordPage />} />
							<Route path="/reset-password" element={<ResetPasswordPage />} />
							<Route path="/auth/callback" element={<OAuthCallback />} />
							<Route
								path="/employee/:employeeId/details"
								element={<EmployeeDetails />}
							/>
							<Route
								path="/employee/:employeeId/service-history"
								element={<EmployeeServiceHistory />}
							/>
							<Route
								path="/profile"
								element={
									<AuthGuard requireAuth={true}>
										<ProfilePage />
									</AuthGuard>
								}
							/>
							<Route
								path="/calendar"
								element={
									<AuthGuard requireAuth={true}>
										<CalendarPage />
									</AuthGuard>
								}
							/>
							<Route
								path="/booking-requests"
								element={
									<AuthGuard requireAuth={true}>
										<BookingRequestsPage />
									</AuthGuard>
								}
							/>
							<Route
								path="/enquiries"
								element={
									<AuthGuard requireAuth={true}>
										<ContactMessagesPage />
									</AuthGuard>
								}
							/>
							<Route
								path="/conversations"
								element={
									<AuthGuard requireAuth={true}>
										<ChatTranscriptsPage />
									</AuthGuard>
								}
							/>
							<Route
								path="/gallery"
								element={
									<AuthGuard requireAuth={true}>
										<GalleryPage />
									</AuthGuard>
								}
							/>
							<Route path="*" element={<NotFoundPage />} />
						</Routes>
					</ErrorBoundary>
				</main>
			</div>
		</div>
	);
}

export default App;
