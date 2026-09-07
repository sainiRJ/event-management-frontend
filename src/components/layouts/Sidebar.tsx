import React from "react";
import {Link} from "react-router-dom";
import {ChevronLeft, ChevronRight, LogOut} from "lucide-react";

import NavLinks from "./NavLinks";
import BrandLogo from "./BrandLogo";
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
	const signOut = (): void => {
		dispatch(logout());
		window.location.href = "/login";
	};

	return (
		<aside
			className={`fixed left-0 top-0 z-50 hidden h-full flex-col border-r border-ink-200/70 bg-white/85 backdrop-blur-xl transition-[width] duration-300 ease-premium lg:flex ${
				isCollapsed ? "w-20" : "w-64"
			}`}
		>
			<div className="flex h-16 items-center overflow-hidden border-b border-ink-200/60 px-5">
				<Link to="/dashboard" className="shrink-0" aria-label="Dashboard">
					<BrandLogo isCompact={isCollapsed} />
				</Link>
			</div>

			<nav className="flex-1 overflow-y-auto px-3 py-5 no-scrollbar">
				<NavLinks groupId="sidebar" counts={counts} isCollapsed={isCollapsed} />
			</nav>

			<div className="border-t border-ink-200/60 p-3">
				<button
					onClick={() => setIsCollapsed(!isCollapsed)}
					aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
					className="mb-1 flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
				>
					{isCollapsed ? (
						<ChevronRight className="h-4 w-4" />
					) : (
						<>
							<ChevronLeft className="h-4 w-4" />
							Collapse
						</>
					)}
				</button>

				<button
					onClick={signOut}
					className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-500 transition-colors hover:bg-brand-50 hover:text-brand-700 ${
						isCollapsed ? "justify-center" : ""
					}`}
					title="Log out"
				>
					<LogOut className="h-4.5 w-4.5 shrink-0" size={18} />
					{!isCollapsed && <span>Log out</span>}
				</button>
			</div>
		</aside>
	);
};

export default Sidebar;
