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

const timeAgo = (iso: string) => {
	const diffMs = Date.now() - new Date(iso).getTime();
	const mins = Math.floor(diffMs / 60000);
	if (mins < 1) return "just now";
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	return `${Math.floor(hours / 24)}d ago`;
};

const HeaderTab = () => {
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

	const navItems = [
		{label: "Dashboard", icon: LayoutDashboard, path: "/dashboard"},
		{label: "Services", icon: Settings, path: "/services"},
		{label: "Employees", icon: Users, path: "/employees"},
		{label: "Booking", icon: ClipboardList, path: "/booking"},
		{label: "Finance", icon: TrendingUp, path: "/finance"},
	];

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
						Admin Console
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
												onClick={() => dispatch(markAllAsRead())}
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
													onClick={() => dispatch(markAsRead(n.id))}
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
								AD
							</div>
							<span className="hidden sm:block text-sm font-bold">Admin</span>
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
			{showMobileMenu && (
				<div className="fixed inset-0 z-[60] lg:hidden">
					{/* Backdrop */}
					<div
						className="fixed inset-0 bg-[#2B2129]/40 backdrop-blur-sm transition-opacity"
						onClick={() => setShowMobileMenu(false)}
					/>

					{/* Drawer Content */}
					<div className="fixed top-0 left-0 h-full w-72 bg-white/70 backdrop-blur-xl shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
						<div className="p-6 flex items-center justify-between border-b border-brand-100/50">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-700 rounded-lg flex items-center justify-center text-white">
									<Sparkles className="w-5 h-5" />
								</div>
								<span className="text-xl font-display font-semibold text-[#2B2129]">
									Saini <span className="text-brand-600">Events</span>
								</span>
							</div>
							<button
								onClick={() => setShowMobileMenu(false)}
								className="p-2 text-gray-400 hover:text-[#2B2129] hover:bg-brand-50 rounded-xl transition-all"
							>
								<X className="w-6 h-6" />
							</button>
						</div>

						<nav className="flex-1 p-4 space-y-1 overflow-y-auto">
							{navItems.map((item) => (
								<button
									key={item.path}
									onClick={() => handleNavigation(item.path)}
									className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all ${
										window.location.pathname === item.path
											? "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-200/50"
											: "text-gray-600 hover:text-brand-600 hover:bg-brand-50"
									}`}
								>
									<item.icon className="w-5 h-5" />
									{item.label}
								</button>
							))}

							<div className="my-4 border-t border-brand-100/50 pt-4">
								<button
									onClick={() => {
										setShowMobileMenu(false);
										setShowNotifications(true);
									}}
									className="w-full flex items-center gap-4 px-4 py-3.5 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-2xl font-bold transition-all relative"
								>
									<Bell className="w-5 h-5" />
									Notifications
									{unreadCount > 0 && (
										<span className="ml-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[10px] font-black bg-red-500 text-white rounded-full">
											{unreadCount > 9 ? "9+" : unreadCount}
										</span>
									)}
								</button>
								<button
									onClick={() => handleNavigation("/profile")}
									className="w-full flex items-center gap-4 px-4 py-3.5 text-gray-600 hover:text-brand-600 hover:bg-brand-50 rounded-2xl font-bold transition-all"
								>
									<Settings className="w-5 h-5" />
									Account Settings
								</button>
							</div>
						</nav>

						<div className="p-4 border-t border-brand-100/50">
							<button
								onClick={handleLogout}
								className="w-full flex items-center gap-4 px-4 py-3.5 text-red-600 hover:bg-red-50 rounded-2xl font-black transition-all"
							>
								<LogOut className="w-5 h-5" />
								Sign Out
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
};

export default HeaderTab;
