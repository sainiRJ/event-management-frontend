import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
	LayoutDashboard, 
	Settings, 
	Users, 
	ClipboardList, 
	TrendingUp,
	ChevronLeft,
	ChevronRight,
	LogOut,
	Sparkles
} from "lucide-react";

interface SidebarProps {
	isCollapsed: boolean;
	setIsCollapsed: (value: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
	const location = useLocation();

	const navItems = [
		{ label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
		{ label: "Services", icon: Settings, path: "/services" },
		{ label: "Employees", icon: Users, path: "/employees" },
		{ label: "Booking", icon: ClipboardList, path: "/booking" },
		{ label: "Finance", icon: TrendingUp, path: "/finance" },
	];

	return (
		<aside 
			className={`fixed left-0 top-0 h-full bg-white border-r border-gray-100 z-50 transition-all duration-300 ease-in-out ${
				isCollapsed ? "w-20" : "w-64"
			} hidden lg:flex flex-col`}
		>
			{/* Logo Section */}
			<div className="h-16 flex items-center px-6 border-b border-gray-50 overflow-hidden">
				<Link to="/dashboard" className="flex items-center gap-3 group shrink-0">
					<div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform shrink-0">
						<Sparkles className="w-5 h-5" />
					</div>
					{!isCollapsed && (
						<span className="text-xl font-black text-gray-900 tracking-tighter whitespace-nowrap animate-in fade-in duration-500">
							Saini Events
						</span>
					)}
				</Link>
			</div>

			{/* Navigation Items */}
			<nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
				{navItems.map((item) => {
					const isActive = location.pathname === item.path;
					const Icon = item.icon;
					
					return (
						<Link
							key={item.path}
							to={item.path}
							className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
								isActive 
									? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" 
									: "text-gray-500 hover:bg-gray-50 hover:text-indigo-600"
							}`}
						>
							<Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-white" : "group-hover:text-indigo-600"}`} />
							{!isCollapsed && (
								<span className="text-sm font-bold whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
									{item.label}
								</span>
							)}
							
							{/* Tooltip for collapsed state */}
							{isCollapsed && (
								<div className="absolute left-full ml-4 px-2 py-1 rounded bg-gray-900 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
									{item.label}
								</div>
							)}
						</Link>
					);
				})}
			</nav>

			{/* Footer Section */}
			<div className="p-4 border-t border-gray-50">
				<button 
					onClick={() => setIsCollapsed(!isCollapsed)}
					className="w-full flex items-center justify-center p-2 rounded-xl bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all mb-2"
				>
					{isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
				</button>
				
				<button
					onClick={() => {
						localStorage.clear();
						window.location.href = "/login";
					}}
					className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-rose-500 hover:bg-rose-50 transition-all w-full ${
						isCollapsed ? "justify-center" : ""
					}`}
				>
					<LogOut className="w-5 h-5 shrink-0" />
					{!isCollapsed && <span className="text-sm font-bold">Logout</span>}
				</button>
			</div>
		</aside>
	);
};

export default Sidebar;
