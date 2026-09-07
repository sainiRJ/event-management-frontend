import React from "react";
import {Link, useLocation} from "react-router-dom";
import {LayoutGroup, motion, useReducedMotion} from "framer-motion";

import {navigationForRole} from "@/config/navigation";
import {getCurrentUserRole} from "@/utils/tokenUtils";
import {iPendingCounts} from "@/hooks/usePendingCounts";
import {EASE} from "@/components/motion";

interface iNavLinksProps {
	counts: iPendingCounts;
	/**
	 * Namespace for the sliding active pill. The desktop rail and the mobile
	 * drawer both mount this list, and two elements sharing one `layoutId`
	 * would animate between each other.
	 */
	groupId: string;
	/** Collapsed rail: icons only, labels become hover tooltips. */
	isCollapsed?: boolean;
	onNavigate?: () => void;
}

/**
 * The navigation list itself, shared by the desktop sidebar and the mobile
 * drawer so both always show the same screens. The active pill slides
 * between items rather than snapping.
 */
const NavLinks: React.FC<iNavLinksProps> = ({
	counts,
	groupId,
	isCollapsed = false,
	onNavigate,
}) => {
	const location = useLocation();
	const prefersReduced = useReducedMotion();
	const navigation = navigationForRole(getCurrentUserRole());

	return (
		<LayoutGroup id={groupId}>
			{navigation.map((group, groupIndex) => (
				<div key={group.heading ?? `group-${groupIndex}`} className="mb-3">
					{group.heading && !isCollapsed && (
						<p className="eyebrow px-3 pb-1.5 pt-3">{group.heading}</p>
					)}

					{group.heading && isCollapsed && (
						<div className="mx-3 my-2 border-t border-ink-200/70" />
					)}

					<div className="space-y-0.5">
						{group.items.map((item) => {
							const isActive = location.pathname === item.path;
							const Icon = item.icon;
							const badgeCount = item.badge ? counts[item.badge] : 0;

							return (
								<Link
									key={item.path}
									to={item.path}
									onClick={onNavigate}
									aria-current={isActive ? "page" : undefined}
									className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-200 ${
										isActive
											? "text-brand-700"
											: "text-ink-500 hover:bg-ink-100/80 hover:text-ink-800"
									} ${isCollapsed ? "justify-center" : ""}`}
								>
									{isActive && (
										<motion.span
											layoutId="nav-active"
											className="absolute inset-0 rounded-xl border border-ink-200 bg-brand-50"
											transition={
												prefersReduced
													? {duration: 0}
													: {duration: 0.35, ease: EASE}
											}
										/>
									)}
									{isActive && (
										<span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-gold-500" />
									)}

									<span className="relative shrink-0">
										<Icon
											className={`h-5 w-5 ${
												isActive
													? "text-brand-700"
													: "group-hover:text-brand-600"
											}`}
										/>
										{isCollapsed && badgeCount > 0 && (
											<span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
												{badgeCount > 9 ? "9+" : badgeCount}
											</span>
										)}
									</span>

									{!isCollapsed && (
										<>
											<span className="relative whitespace-nowrap text-sm font-semibold">
												{item.label}
											</span>
											{badgeCount > 0 && (
												<span className="relative ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white">
													{badgeCount > 99 ? "99+" : badgeCount}
												</span>
											)}
										</>
									)}

									{isCollapsed && (
										<span className="pointer-events-none absolute left-full z-50 ml-3 whitespace-nowrap rounded-lg bg-ink-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lift transition-opacity group-hover:opacity-100">
											{item.label}
										</span>
									)}
								</Link>
							);
						})}
					</div>
				</div>
			))}
		</LayoutGroup>
	);
};

export default NavLinks;
