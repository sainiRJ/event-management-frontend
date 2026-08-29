import React, {useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import {
	Menu,
	X,
	Bell,
	LogOut,
	Settings,
	Sparkles,
	LayoutDashboard,
	Users,
	ClipboardList,
	TrendingUp,
	CheckCheck,
	Inbox,
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
import MobileNav from "./MobileNav";
import {iPendingCounts} from "@/hooks/usePendingCounts";

const timeAgo = (iso: string) => {
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

const HeaderTab: React.FC<iHeaderTabProps> = ({counts}) => {
	const profile = useAppSelector((state) => {
		return state.userReducer.profile;
	});

	/**
	 * The real signed-in user. This was hardcoded to "AD" / "Admin", so a
	 * vendor never saw whose account they were in - and neither did anyone
	 * looking at a support screenshot.
	 */
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

	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const [showMobileMenu, setShowMobileMenu] = useState(false);
	const [showProfileDropdown, setShowProfileDropdown] = useState(false);
	const [showNotifications, setShowNotifications] = useState(false);

	const {items: notifications, unreadCount} = useAppSelector(
		(state: RootState) => state.notificationReducer,
	);

	const handleLogout = () => {
		localStorage.clear();
		navigate("/login");
	};

	const handleNavigation = (path: string) => {
		navigate(path);
		setShowMobileMenu(false);
		setShowProfileDropdown(false);
	};

	return (
		<>
			<header className="h-16 bg-white/70 backdrop-blur-xl border-b border-brand-100/70 fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 lg:px-8">
				<div className="flex items-center gap-4">
					{/* Mobile Menu Toggle */}
					<button
						className="lg:hidden p-2 text-gray-500 hover:bg-brand-50 rounded-xl transition-all"
						onClick={() => setShowMobileMenu(true)}
					>
						<Menu className="w-6 h-6" />
					</button>

					{/* Logo (Visible on mobile only since it's in sidebar on desktop) */}
					<Link
						to="/dashboard"
						className="flex lg:hidden items-center gap-2 group"
					>
						<div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-200/50">
							<Sparkles className="w-5 h-5" />
						</div>
					</Link>

					{/* Page Title or Search could go here */}
					<h2 className="hidden sm:block text-sm font-bold text-gray-400 uppercase tracking-widest ml-2">
						{profile?.role ? `${profile.role} console` : "Console"}
					</h2>
				</div>

				<nav className="flex items-center gap-2 sm:gap-4">
					<div className="relative">
						<button
							onClick={() => setShowNotifications(!showNotifications)}
							className="p-2 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all relative"
						>
							<Bell className="w-5 h-5" />
							{unreadCount > 0 && (
								<span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 flex items-center justify-center text-[10px] font-black bg-red-500 text-white rounded-full border-2 border-white">
									{unreadCount > 9 ? "9+" : unreadCount}
								</span>
							)}
						</button>

						{showNotifications && (
							<>
								<div
									className="fixed inset-0 z-10"
									onClick={() => setShowNotifications(false)}
								/>
								<div className="absolute right-0 mt-3 w-80 max-h-96 flex flex-col bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-brand-100/70 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
									<div className="flex items-center justify-between px-4 py-3 border-b border-brand-100/50">
										<p className="text-sm font-black text-[#2B2129]">
											Notifications
										</p>
										{unreadCount > 0 && (
											<button
												onClick={() => {
													dispatch(markAllAsRead());
													dispatch(markAllNotificationsRead());
												}}
												className="flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700"
											>
												<CheckCheck className="w-3.5 h-3.5" />
												Mark all read
											</button>
										)}
									</div>
									<div className="overflow-y-auto flex-1">
										{notifications.length === 0 ? (
											<div className="flex flex-col items-center justify-center py-10 px-4 text-center">
												<Inbox className="w-8 h-8 text-brand-200 mb-2" />
												<p className="text-xs text-gray-400 font-bold">
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
													className={`w-full text-left px-4 py-3 border-b border-brand-100/40 hover:bg-brand-50 transition-colors ${
														!n.isRead ? "bg-brand-50/60" : ""
													}`}
												>
													<div className="flex items-start gap-2">
														{!n.isRead && (
															<span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
														)}
														<div className="min-w-0">
															<p className="text-xs font-black text-[#2B2129] truncate">
																{n.title}
															</p>
															<p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
																{n.message}
															</p>
															<p className="text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-wide">
																{timeAgo(n.createdAt)}
															</p>
														</div>
													</div>
												</button>
											))
										)}
									</div>
								</div>
							</>
						)}
					</div>

					<div className="relative">
						<button
							onClick={() => setShowProfileDropdown(!showProfileDropdown)}
							className={`flex items-center gap-2 pl-2 pr-2 sm:pr-3 py-1.5 rounded-2xl transition-all ${
								showProfileDropdown
									? "bg-brand-50 text-brand-600 ring-1 ring-brand-100"
									: "hover:bg-brand-50 text-gray-600"
							}`}
						>
							<div className="w-8 h-8 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center font-black text-xs shrink-0">
								{initials}
							</div>
							<span className="hidden sm:block text-sm font-bold">
								{displayName}
							</span>
						</button>

						{showProfileDropdown && (
							<>
								<div
									className="fixed inset-0 z-10"
									onClick={() => setShowProfileDropdown(false)}
								/>
								<div className="absolute right-0 mt-3 w-56 bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl border border-brand-100/70 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
									<div className="px-4 py-3 border-b border-brand-100/50 mb-1">
										<p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
											Signed in as
										</p>
										<p className="text-sm font-black text-[#2B2129] truncate">
											admin@sainievents.com
										</p>
									</div>
									<button
										onClick={() => handleNavigation("/profile")}
										className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 hover:text-brand-600 hover:bg-brand-50 transition-colors"
									>
										<Settings className="w-4 h-4" />
										Account Settings
									</button>
									<button
										onClick={handleLogout}
										className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
									>
										<LogOut className="w-4 h-4" />
										Logout
									</button>
								</div>
							</>
						)}
					</div>
				</nav>
			</header>

			{/* Mobile Drawer */}
			{/* One navigation list, shared with the desktop sidebar. This used
			    to be a second hardcoded copy, so new screens appeared on
			    desktop and silently not on mobile. */}
			<MobileNav
				isOpen={showMobileMenu}
				onClose={() => setShowMobileMenu(false)}
				counts={counts}
			/>
		</>
	);
};

export default HeaderTab;
