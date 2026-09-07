import React, {useEffect} from "react";
import {AnimatePresence, motion, useReducedMotion} from "framer-motion";
import {LogOut, X} from "lucide-react";

import NavLinks from "./NavLinks";
import BrandLogo from "./BrandLogo";
import {iPendingCounts} from "@/hooks/usePendingCounts";
import {useAppDispatch} from "@/store/Hooks";
import {logout} from "@/store/auth/authSlice";
import {EASE} from "@/components/motion";

interface iMobileNavProps {
	isOpen: boolean;
	onClose: () => void;
	counts: iPendingCounts;
}

/**
 * Navigation drawer for phones and tablets. Same list as the desktop rail.
 */
const MobileNav: React.FC<iMobileNavProps> = ({isOpen, onClose, counts}) => {
	const dispatch = useAppDispatch();
	const prefersReduced = useReducedMotion();

	useEffect(() => {
		if (!isOpen) return;

		const onKeyDown = (event: KeyboardEvent): void => {
			if (event.key === "Escape") onClose();
		};

		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		window.addEventListener("keydown", onKeyDown);

		return () => {
			document.body.style.overflow = previousOverflow;
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [isOpen, onClose]);

	const signOut = (): void => {
		dispatch(logout());
		window.location.href = "/login";
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-[60] lg:hidden">
					<motion.button
						type="button"
						aria-label="Close navigation"
						onClick={onClose}
						className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
						initial={{opacity: 0}}
						animate={{opacity: 1}}
						exit={{opacity: 0}}
						transition={{duration: 0.2}}
					/>

					<motion.div
						role="dialog"
						aria-modal="true"
						aria-label="Main navigation"
						className="absolute inset-y-0 left-0 flex w-[82%] max-w-xs flex-col bg-white shadow-lift"
						initial={prefersReduced ? {x: 0} : {x: "-100%"}}
						animate={{x: 0}}
						exit={prefersReduced ? {x: 0, opacity: 0} : {x: "-100%"}}
						transition={{duration: 0.32, ease: EASE}}
					>
						<div className="flex h-16 items-center justify-between border-b border-ink-200/60 px-4">
							<BrandLogo />
							<button
								type="button"
								onClick={onClose}
								aria-label="Close navigation"
								className="rounded-xl p-2 text-ink-500 hover:bg-ink-100"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<nav className="flex-1 overflow-y-auto px-3 py-4">
							<NavLinks
								groupId="mobile-nav"
								counts={counts}
								onNavigate={onClose}
							/>
						</nav>

						<div className="border-t border-ink-200/60 p-3 pb-safe">
							<button
								onClick={signOut}
								className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50"
							>
								<LogOut className="h-5 w-5 shrink-0" />
								Log out
							</button>
						</div>
					</motion.div>
				</div>
			)}
		</AnimatePresence>
	);
};

export default MobileNav;
