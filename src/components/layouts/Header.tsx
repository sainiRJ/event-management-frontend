import React, {useState} from "react";
import {useNavigate, Link, useLocation} from "react-router-dom";
import {AnimatePresence, motion, useReducedMotion} from "framer-motion";
import {
	Menu,
	Bell,
	LogOut,
	Settings,
	CheckCheck,
	Inbox,
	ChevronDown,
} from "lucide-react";

import {useAppDispatch, useAppSelector} from "@/store/Hooks";
import {RootState} from "@/store";
import {
	markAllAsRead,
	markAsRead,
} from "@/store/notification/NotificationSlice";
import {
	markAllNotificationsRead,
	markNotificationRead,
} from "@/store/notification/ThunkActions";
import {logout} from "@/store/auth/authSlice";
import {allNavItems} from "@/config/navigation";
import {iPendingCounts} from "@/hooks/usePendingCounts";
import {EASE} from "@/components/motion";
import MobileNav from "./MobileNav";
import BrandLogo from "./BrandLogo";

const timeAgo = (iso: string): string => {
	const diffMs = Date.now() - new Date(iso).getTime();
	const mins = Math.floor(diffMs / 60000);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.floor(hours / 24)}d ago`;
};

interface iHeaderTabProps {
	counts: iPendingCounts;
}

const popover = {
	initial: {opacity: 0, y: -6, scale: 0.98},
	animate: {opacity: 1, y: 0, scale: 1},
	exit: {opacity: 0, y: -6, scale: 0.98},
};

/**
 * Top bar: current screen's name, notifications, account menu. The logo
 * only shows here below `lg`, where the sidebar is hidden.
 */
const HeaderTab: React.FC<iHeaderTabProps> = ({counts}) => {
	const profile = useAppSelector((state) => {
		return state.userReducer.profile;
	});
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useAppDispatch();
	const prefersReduced = useReducedMotion();

	const [showMobileMenu, setShowMobileMenu] = useState(false);
	const [showProfileDropdown, setShowProfileDropdown] = useState(false);
	const [showNotifications, setShowNotifications] = useState(false);

	const {items: notifications, unreadCount} = useAppSelector(
		(state: RootState) => state.notificationReducer,
	);

	const displayName = profile?.name?.trim() || "Account";
	const initials =
		displayName
			.split(/\s+/)
			.slice(0, 2)
			.map((part: string) => {
				return part[0];
			})
			.join("")
			.toUpperCase() || "AC";

	const currentScreen =
		allNavItems.find((item) => {
			return item.path === location.pathname;
		})?.label ??
		(location.pathname.startsWith("/employee") ? "Employees" : "Account");

	const handleLogout = (): void => {
		dispatch(logout());
		navigate("/login");
	};

	const handleNavigation = (path: string): void => {
		navigate(path);
		setShowMobileMenu(false);
		setShowProfileDropdown(false);
	};

	const transition = prefersReduced
		? {duration: 0}
		: {duration: 0.18, ease: EASE};

	return (
		<>
			<header className="fixed left-0 right-0 top-0 z-40 flex h-16 items-center justify-between border-b border-ink-200/60 bg-white/80 px-4 backdrop-blur-xl lg:px-8">
				<div className="flex min-w-0 items-center gap-3">
					<button
						className="rounded-xl p-2 text-ink-500 transition-colors hover:bg-ink-100 lg:hidden"
						onClick={() => setShowMobileMenu(true)}
						aria-label="Open navigation"
					>
						<Menu className="h-6 w-6" />
					</button>

					<Link to="/dashboard" className="lg:hidden" aria-label="Dashboard">
						<BrandLogo isCompact />
					</Link>

					<div className="hidden min-w-0 lg:block">
						<p className="eyebrow">{profile?.role ?? "Vendor"} console</p>
						<h2 className="truncate font-display text-lg leading-tight text-ink-900">
							{currentScreen}
						</h2>
					</div>
				</div>

				<nav className="flex items-center gap-1 sm:gap-2">
					{/* Notifications */}
					<div className="relative">
						<button
							onClick={() => setShowNotifications(!showNotifications)}
							className="relative rounded-xl p-2.5 text-ink-500 transition-colors hover:bg-ink-100 hover:text-brand-700"
							aria-label="Notifications"
							aria-expanded={showNotifications}
						>
							<Bell className="h-5 w-5" />
							{unreadCount > 0 && (
								<span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full border-2 border-white bg-brand-600 px-1 text-[10px] font-bold text-white">
									{unreadCount > 9 ? "9+" : unreadCount}
								</span>
							)}
						</button>

						<AnimatePresence>
							{showNotifications && (
								<>
									<div
										className="fixed inset-0 z-10"
										onClick={() => setShowNotifications(false)}
									/>
									<motion.div
										{...popover}
										transition={transition}
										className="absolute right-0 z-20 mt-2 flex max-h-96 w-80 flex-col overflow-hidden rounded-2xl border border-ink-200/70 bg-white shadow-lift"
									>
										<div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
											<p className="font-display text-base text-ink-900">
												Notifications
											</p>
											{unreadCount > 0 && (
												<button
													onClick={() => {
														dispatch(markAllAsRead());
														dispatch(markAllNotificationsRead());
													}}
													className="flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
												>
													<CheckCheck className="h-3.5 w-3.5" />
													Mark all read
												</button>
											)}
										</div>
										<div className="flex-1 overflow-y-auto">
											{notifications.length === 0 ? (
												<div className="flex flex-col items-center justify-center px-4 py-10 text-center">
													<Inbox className="mb-2 h-8 w-8 text-ink-300" />
													<p className="text-xs font-medium text-ink-400">
														No notifications yet
													</p>
												</div>
											) : (
												notifications.map((n) => (
													<button
														key={n.id}
														onClick={() => {
															dispatch(markAsRead(n.id));
															dispatch(markNotificationRead(n.id));
														}}
														className={`w-full border-b border-ink-100 px-4 py-3 text-left transition-colors hover:bg-ink-50 ${
															!n.isRead ? "bg-brand-50/50" : ""
														}`}
													>
														<div className="flex items-start gap-2">
															<span
																className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
																	n.isRead ? "bg-transparent" : "bg-brand-600"
																}`}
															/>
															<div className="min-w-0">
																<p className="truncate text-sm font-semibold text-ink-900">
																	{n.title}
																</p>
																<p className="mt-0.5 line-clamp-2 text-xs text-ink-500">
																	{n.message}
																</p>
																<p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
																	{timeAgo(n.createdAt)}
																</p>
															</div>
														</div>
													</button>
												))
											)}
										</div>
									</motion.div>
								</>
							)}
						</AnimatePresence>
					</div>

					{/* Account */}
					<div className="relative">
						<button
							onClick={() => setShowProfileDropdown(!showProfileDropdown)}
							className={`flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors sm:pr-3 ${
								showProfileDropdown ? "bg-ink-100" : "hover:bg-ink-100"
							}`}
							aria-label="Account menu"
							aria-expanded={showProfileDropdown}
						>
							{profile?.photoUrl ? (
								<img
									src={profile.photoUrl}
									alt=""
									className="h-8 w-8 rounded-full object-cover"
								/>
							) : (
								<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
									{initials}
								</span>
							)}
							<span className="hidden max-w-[12ch] truncate text-sm font-semibold text-ink-800 sm:block">
								{displayName}
							</span>
							<ChevronDown className="hidden h-4 w-4 text-ink-400 sm:block" />
						</button>

						<AnimatePresence>
							{showProfileDropdown && (
								<>
									<div
										className="fixed inset-0 z-10"
										onClick={() => setShowProfileDropdown(false)}
									/>
									<motion.div
										{...popover}
										transition={transition}
										className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-2xl border border-ink-200/70 bg-white py-1.5 shadow-lift"
									>
										<div className="border-b border-ink-100 px-4 py-3">
											<p className="eyebrow">Signed in as</p>
											<p className="truncate text-sm font-semibold text-ink-900">
												{displayName}
											</p>
											{profile?.email && (
												<p className="truncate text-xs text-ink-500">
													{profile.email}
												</p>
											)}
										</div>
										<button
											onClick={() => handleNavigation("/profile")}
											className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-ink-50 hover:text-brand-700"
										>
											<Settings className="h-4 w-4" />
											Account settings
										</button>
										<button
											onClick={handleLogout}
											className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50"
										>
											<LogOut className="h-4 w-4" />
											Log out
										</button>
									</motion.div>
								</>
							)}
						</AnimatePresence>
					</div>
				</nav>
			</header>

			<MobileNav
				isOpen={showMobileMenu}
				onClose={() => setShowMobileMenu(false)}
				counts={counts}
			/>
		</>
	);
};

export default HeaderTab;
