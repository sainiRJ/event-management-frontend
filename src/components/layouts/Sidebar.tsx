import React from "react";
import {Link} from "react-router-dom";
import {ChevronLeft, ChevronRight, LogOut, Sparkles} from "lucide-react";

import NavLinks from "./NavLinks";
import {iPendingCounts} from "@/hooks/usePendingCounts";
import {useAppDispatch} from "@/store/Hooks";
import {logout} from "@/store/auth/authSlice";

interface iSidebarProps {
	isCollapsed: boolean;
	setIsCollapsed: (value: boolean) => void;
	counts: iPendingCounts;
}

/**
 * Desktop navigation rail. Hidden below `lg`, where MobileNav takes over.
 */
const Sidebar: React.FC<iSidebarProps> = ({
	isCollapsed,
	setIsCollapsed,
	counts,
}) => {
	const dispatch = useAppDispatch();

	/**
	 * Goes through the auth slice so the refresh token is revoked
	 * server-side. Clearing localStorage alone left the session valid for
	 * another seven days.
	 */
	const signOut = () => {
		dispatch(logout());
		window.location.href = "/login";
	};

	return (
		<aside
			className={`fixed left-0 top-0 z-50 hidden h-full flex-col border-r border-brand-100/70 bg-white/70 backdrop-blur-xl transition-all duration-300 ease-in-out lg:flex ${
				isCollapsed ? "w-20" : "w-64"
			}`}
		>
			<div className="flex h-16 items-center overflow-hidden border-b border-brand-100/50 px-6">
				<Link
					to="/dashboard"
					className="group flex shrink-0 items-center gap-3"
				>
					<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-200/50 transition-transform group-hover:scale-110">
						<Sparkles className="h-5 w-5" />
					</div>
					{!isCollapsed && (
						<span className="whitespace-nowrap font-display text-xl font-semibold text-[#2B2129] duration-500 animate-in fade-in">
							Saini <span className="text-brand-600">Events</span>
						</span>
					)}
				</Link>
			</div>

			<nav className="flex-1 overflow-y-auto px-3 py-6">
				<NavLinks counts={counts} isCollapsed={isCollapsed} />
			</nav>

			<div className="border-t border-brand-100/50 p-4">
				<button
					onClick={() => setIsCollapsed(!isCollapsed)}
					aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
					className="mb-2 flex w-full items-center justify-center rounded-xl bg-gray-50 p-2 text-gray-400 transition-all hover:bg-brand-50 hover:text-brand-600"
				>
					{isCollapsed ? (
						<ChevronRight className="h-5 w-5" />
					) : (
						<ChevronLeft className="h-5 w-5" />
					)}
				</button>

				<button
					onClick={signOut}
					className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-red-500 transition-all hover:bg-red-50 ${
						isCollapsed ? "justify-center" : ""
					}`}
				>
					<LogOut className="h-5 w-5 shrink-0" />
					{!isCollapsed && <span className="text-sm font-bold">Logout</span>}
				</button>
			</div>
		</aside>
	);
};

export default Sidebar;
