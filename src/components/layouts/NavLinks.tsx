import React from "react";
import {Link, useLocation} from "react-router-dom";

import {navigation} from "@/config/navigation";
import {iPendingCounts} from "@/hooks/usePendingCounts";

interface iNavLinksProps {
	counts: iPendingCounts;
	/** Collapsed rail: icons only, labels become hover tooltips. */
	isCollapsed?: boolean;
	onNavigate?: () => void;
}

/**
 * The navigation list itself, shared by the desktop sidebar and the mobile
 * drawer so both always show the same screens.
 */
const NavLinks: React.FC<iNavLinksProps> = ({
	counts,
	isCollapsed = false,
	onNavigate,
}) => {
	const location = useLocation();

	return (
		<>
			{navigation.map((group, groupIndex) => (
				<div key={group.heading ?? `group-${groupIndex}`} className="mb-4">
					{group.heading && !isCollapsed && (
						<p className="px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
							{group.heading}
						</p>
					)}

					{group.heading && isCollapsed && (
						<div className="mx-3 my-2 border-t border-brand-100/70" />
					)}

					<div className="space-y-1">
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
									className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200 ${
										isActive
											? "border border-brand-200 bg-gradient-to-b from-brand-50 to-brand-50/40 text-brand-700 shadow-sm"
											: "border border-transparent text-gray-500 hover:bg-brand-50/60 hover:text-brand-600"
									}`}
								>
									{isActive && (
										<span className="absolute -left-3 top-1/2 h-4 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b from-brand-400 to-brand-600" />
									)}

									<span className="relative shrink-0">
										<Icon
											className={`h-5 w-5 ${
												isActive
													? "text-brand-600"
													: "group-hover:text-brand-600"
											}`}
										/>
										{/* On the collapsed rail the label is hidden, so the count
										    rides on the icon instead of sitting beside it. */}
										{isCollapsed && badgeCount > 0 && (
											<span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-500 px-1 text-[10px] font-bold text-white">
												{badgeCount > 9 ? "9+" : badgeCount}
											</span>
										)}
									</span>

									{!isCollapsed && (
										<>
											<span className="whitespace-nowrap text-sm font-bold">
												{item.label}
											</span>
											{badgeCount > 0 && (
												<span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[11px] font-bold text-white">
													{badgeCount > 99 ? "99+" : badgeCount}
												</span>
											)}
										</>
									)}

									{isCollapsed && (
										<span className="pointer-events-none absolute left-full z-50 ml-4 whitespace-nowrap rounded bg-[#2B2129] px-2 py-1 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
											{item.label}
										</span>
									)}
								</Link>
							);
						})}
					</div>
				</div>
			))}
		</>
	);
};

export default NavLinks;
