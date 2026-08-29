import React, {useEffect} from "react";
import {LogOut, Sparkles, X} from "lucide-react";

import NavLinks from "./NavLinks";
import {iPendingCounts} from "@/hooks/usePendingCounts";
import {useAppDispatch} from "@/store/Hooks";
import {logout} from "@/store/auth/authSlice";

interface iMobileNavProps {
	isOpen: boolean;
	onClose: () => void;
	counts: iPendingCounts;
}

/**
 * Navigation drawer for phones and tablets.
 *
 * The sidebar is `hidden lg:flex`, so below that breakpoint the admin had no
 * navigation at all — every screen was reachable only by typing a URL.
 */
const MobileNav: React.FC<iMobileNavProps> = ({isOpen, onClose, counts}) => {
	const dispatch = useAppDispatch();

	// Escape closes, and the page behind must not scroll while it is open.
	useEffect(() => {
		if (!isOpen) return;

		const onKeyDown = (event: KeyboardEvent) => {
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

	if (!isOpen) {
		return null;
	}

	const signOut = () => {
		dispatch(logout());
		window.location.href = "/login";
	};

	return (
		<div className="fixed inset-0 z-[60] lg:hidden">
			<button
				type="button"
				aria-label="Close navigation"
				onClick={onClose}
				className="absolute inset-0 bg-[#2B2129]/40 backdrop-blur-sm"
			/>

			<div
				role="dialog"
				aria-modal="true"
				aria-label="Main navigation"
				className="absolute inset-y-0 left-0 flex w-[80%] max-w-xs flex-col border-r border-brand-100/70 bg-white shadow-2xl duration-200 animate-in slide-in-from-left"
			>
				<div className="flex h-16 items-center justify-between border-b border-brand-100/50 px-4">
					<span className="flex items-center gap-2.5">
						<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white">
							<Sparkles className="h-5 w-5" />
						</span>
						<span className="font-display text-lg font-semibold text-[#2B2129]">
							Saini <span className="text-brand-600">Events</span>
						</span>
					</span>

					<button
						type="button"
						onClick={onClose}
						aria-label="Close navigation"
						className="rounded-xl p-2 text-gray-400 hover:bg-brand-50 hover:text-brand-600"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<nav className="flex-1 overflow-y-auto px-3 py-5">
					<NavLinks counts={counts} onNavigate={onClose} />
				</nav>

				<div className="border-t border-brand-100/50 p-4">
					<button
						onClick={signOut}
						className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-red-500 transition-all hover:bg-red-50"
					>
						<LogOut className="h-5 w-5 shrink-0" />
						<span className="text-sm font-bold">Logout</span>
					</button>
				</div>
			</div>
		</div>
	);
};

export default MobileNav;
