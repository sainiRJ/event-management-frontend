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
	TrendingUp
} from "lucide-react";

const HeaderTab = () => {
	const navigate = useNavigate();
	const [showMobileMenu, setShowMobileMenu] = useState(false);
	const [showProfileDropdown, setShowProfileDropdown] = useState(false);

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
		{ label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
		{ label: "Services", icon: Settings, path: "/services" },
		{ label: "Employees", icon: Users, path: "/employees" },
		{ label: "Booking", icon: ClipboardList, path: "/booking" },
		{ label: "Finance", icon: TrendingUp, path: "/finance" },
	];

	return (
		<>
			<header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 lg:px-8">
				<div className="flex items-center gap-4">
					{/* Mobile Menu Toggle */}
					<button
						className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
						onClick={() => setShowMobileMenu(true)}
					>
						<Menu className="w-6 h-6" />
					</button>

					{/* Logo (Visible on mobile only since it's in sidebar on desktop) */}
					<Link to="/dashboard" className="flex lg:hidden items-center gap-2 group">
						<div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
							<Sparkles className="w-5 h-5" />
						</div>
					</Link>
					
					{/* Page Title or Search could go here */}
					<h2 className="hidden sm:block text-sm font-bold text-gray-400 uppercase tracking-widest ml-2">
						Admin Console
					</h2>
				</div>

				<nav className="flex items-center gap-2 sm:gap-4">
					<button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative">
						<Bell className="w-5 h-5" />
						<span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
					</button>
					
					<div className="relative">
						<button 
							onClick={() => setShowProfileDropdown(!showProfileDropdown)}
							className={`flex items-center gap-2 pl-2 pr-2 sm:pr-3 py-1.5 rounded-2xl transition-all ${
								showProfileDropdown ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100" : "hover:bg-gray-50 text-gray-600"
							}`}
						>
							<div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-xs shrink-0">
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
								<div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
									<div className="px-4 py-3 border-b border-gray-50 mb-1">
										<p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Signed in as</p>
										<p className="text-sm font-black text-gray-900 truncate">admin@sainievents.com</p>
									</div>
									<button
										onClick={() => handleNavigation("/profile")}
										className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
									>
										<Settings className="w-4 h-4" />
										Account Settings
									</button>
									<button
										onClick={handleLogout}
										className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
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
						className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" 
						onClick={() => setShowMobileMenu(false)}
					/>
					
					{/* Drawer Content */}
					<div className="fixed top-0 left-0 h-full w-72 bg-white shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
						<div className="p-6 flex items-center justify-between border-b border-gray-50">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
									<Sparkles className="w-5 h-5" />
								</div>
								<span className="text-xl font-black text-gray-900 tracking-tighter">Saini Events</span>
							</div>
							<button 
								onClick={() => setShowMobileMenu(false)}
								className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
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
											? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
											: "text-gray-600 hover:text-indigo-600 hover:bg-indigo-50"
									}`}
								>
									<item.icon className="w-5 h-5" />
									{item.label}
								</button>
							))}
							
							<div className="my-4 border-t border-gray-50 pt-4">
								<button className="w-full flex items-center gap-4 px-4 py-3.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl font-bold transition-all">
									<Bell className="w-5 h-5" />
									Notifications
								</button>
								<button
									onClick={() => handleNavigation("/profile")}
									className="w-full flex items-center gap-4 px-4 py-3.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl font-bold transition-all"
								>
									<Settings className="w-5 h-5" />
									Account Settings
								</button>
							</div>
						</nav>

						<div className="p-4 border-t border-gray-50">
							<button
								onClick={handleLogout}
								className="w-full flex items-center gap-4 px-4 py-3.5 text-rose-600 hover:bg-rose-50 rounded-2xl font-black transition-all"
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
