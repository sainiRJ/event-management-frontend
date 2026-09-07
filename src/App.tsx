import React, {lazy, Suspense, useEffect, useState} from "react";
import {Routes, Route, useLocation} from "react-router-dom";
import {PageTransition} from "@/components/motion";
import HeaderTab from "./components/layouts/Header";
import Sidebar from "./components/layouts/Sidebar";
import LoginPage from "./components/Auth/LoginPage";
import DashboardPage from "./components/Dashboard/DashboardPage";
import AuthGuard from "./Authguard";
import {VENDOR_ROLES} from "./config/roles";
import ErrorBoundary from "./components/common/ErrorBoundary";
/**
 * Screens are loaded when they are opened.
 *
 * The dashboard shipped as one 1.1 MB bundle, so signing in downloaded the
 * finance charts, the calendar and every employee screen before the login
 * form could render. Login and Dashboard stay eager because they are the
 * first two things anyone sees.
 */
const BookingPage = lazy(() => import("./components/Booking/BookingPage"));
const FinancePage = lazy(() => import("./components/Finance/FinancePage"));
const SignupPage = lazy(() => import("./components/Auth/SignupPage"));
const EmployeeTable = lazy(() => import("./components/Employee/EmployeeTable"));
const ServiceTable = lazy(() => import("./components/Services/ServiceTable"));
const EmployeeServiceHistory = lazy(
	() => import("./components/Employee/EmployeeServiceHistory"),
);
const EmployeeDetails = lazy(
	() => import("./components/Employee/EmployeeDetails"),
);
const CustomersPage = lazy(
	() => import("./components/Customers/CustomersPage"),
);
const ActivityPage = lazy(() => import("./components/Activity/ActivityPage"));
const ProfilePage = lazy(() => import("./components/Profile/ProfilePage"));
const GalleryPage = lazy(() => import("./components/Gallery/GalleryPage"));
const ChatTranscriptsPage = lazy(
	() => import("./components/ChatTranscripts/ChatTranscriptsPage"),
);
const ContactMessagesPage = lazy(
	() => import("./components/ContactMessages/ContactMessagesPage"),
);
const BookingRequestsPage = lazy(
	() => import("./components/BookingRequests/BookingRequestsPage"),
);
const CalendarPage = lazy(() => import("./components/Calendar/CalendarPage"));
const ReviewsPage = lazy(() => import("./components/Reviews/ReviewsPage"));
const TodayPage = lazy(() => import("./components/Today/TodayPage"));
const PackagesPage = lazy(() => import("./components/Packages/PackagesPage"));
const AttendancePage = lazy(
	() => import("./components/Attendance/AttendancePage"),
);
const ForgotPasswordPage = lazy(
	() => import("./components/Auth/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(
	() => import("./components/Auth/ResetPasswordPage"),
);
const OAuthCallback = lazy(() => import("./components/Auth/OAuthCallback"));

import NotFoundPage from "./components/common/NotFoundPage";
import {useNotificationSocket} from "./hooks/useNotificationSocket";
import {Toaster} from "sonner";
import "./App.css";
import {useSession} from "./hooks/useSession";
import {useAppDispatch} from "./store/Hooks";
import {fetchProfile} from "./store/user/ThunkActions";
import {usePendingCounts} from "./hooks/usePendingCounts";

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
	const location = useLocation();

	useNotificationSocket(isAuthenticated);
	const counts = usePendingCounts(isAuthenticated);

	// The header needs the signed-in user's real name and role.
	useEffect(() => {
		if (isAuthenticated) {
			dispatch(fetchProfile());
		}
	}, [isAuthenticated, dispatch]);

	return (
		<div className="min-h-screen bg-cream-100 font-sans text-ink-800">
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
					className={`mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 ${
						isAuthenticated ? "pt-[5.5rem] sm:pt-24" : ""
					}`}
				>
					<ErrorBoundary>
						<PageTransition key={location.pathname}>
							<Suspense
								fallback={
									<div className="flex min-h-[60vh] items-center justify-center text-sm text-ink-500">
										Loading…
									</div>
								}
							>
								<Routes>
									<Route
										path="/"
										element={
											<AuthGuard requireAuth={true} roles={VENDOR_ROLES}>
												<DashboardPage />
											</AuthGuard>
										}
									/>
									<Route
										path="/dashboard"
										element={
											<AuthGuard requireAuth={true} roles={VENDOR_ROLES}>
												<DashboardPage />
											</AuthGuard>
										}
									/>
									<Route
										path="/employees"
										element={
											<AuthGuard requireAuth={true} roles={VENDOR_ROLES}>
												<EmployeeTable />
											</AuthGuard>
										}
									/>
									<Route
										path="/services"
										element={
											<AuthGuard requireAuth={true} roles={VENDOR_ROLES}>
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
											<AuthGuard requireAuth={true} roles={VENDOR_ROLES}>
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
									<Route
										path="/forgot-password"
										element={<ForgotPasswordPage />}
									/>
									<Route
										path="/reset-password"
										element={<ResetPasswordPage />}
									/>
									<Route path="/auth/callback" element={<OAuthCallback />} />
									<Route
										path="/employee/:employeeId/details"
										element={
											<AuthGuard requireAuth={true} roles={VENDOR_ROLES}>
												<EmployeeDetails />
											</AuthGuard>
										}
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
											<AuthGuard requireAuth={true} roles={VENDOR_ROLES}>
												<BookingRequestsPage />
											</AuthGuard>
										}
									/>
									<Route
										path="/enquiries"
										element={
											<AuthGuard requireAuth={true} roles={VENDOR_ROLES}>
												<ContactMessagesPage />
											</AuthGuard>
										}
									/>
									<Route
										path="/conversations"
										element={
											<AuthGuard requireAuth={true} roles={VENDOR_ROLES}>
												<ChatTranscriptsPage />
											</AuthGuard>
										}
									/>
									<Route
										path="/gallery"
										element={
											<AuthGuard requireAuth={true} roles={VENDOR_ROLES}>
												<GalleryPage />
											</AuthGuard>
										}
									/>
									<Route
										path="/customers"
										element={
											<AuthGuard requireAuth={true} roles={VENDOR_ROLES}>
												<CustomersPage />
											</AuthGuard>
										}
									/>
									<Route
										path="/reviews"
										element={
											<AuthGuard requireAuth={true} roles={VENDOR_ROLES}>
												<ReviewsPage />
											</AuthGuard>
										}
									/>
									<Route
										path="/packages"
										element={
											<AuthGuard requireAuth={true} roles={VENDOR_ROLES}>
												<PackagesPage />
											</AuthGuard>
										}
									/>
									<Route
										path="/today"
										element={
											<AuthGuard requireAuth={true}>
												<TodayPage />
											</AuthGuard>
										}
									/>
									<Route
										path="/attendance"
										element={
											<AuthGuard requireAuth={true}>
												<AttendancePage />
											</AuthGuard>
										}
									/>
									<Route
										path="/activity"
										element={
											<AuthGuard requireAuth={true} roles={VENDOR_ROLES}>
												<ActivityPage />
											</AuthGuard>
										}
									/>
									<Route path="*" element={<NotFoundPage />} />
								</Routes>
							</Suspense>
						</PageTransition>
					</ErrorBoundary>
				</main>
			</div>
		</div>
	);
}

export default App;
