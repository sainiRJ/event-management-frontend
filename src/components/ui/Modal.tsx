import React, {useEffect} from "react";
import {createPortal} from "react-dom";
import {AnimatePresence, motion, useReducedMotion} from "framer-motion";
import {X} from "lucide-react";
import {EASE} from "@/components/motion";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
	size?: "sm" | "md" | "lg" | "xl";
}

/**
 * Dialog. Centred on desktop; on a phone it rises from the bottom as a
 * sheet, which is where thumbs are.
 */
const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	children,
	footer,
	size = "md",
}) => {
	const prefersReduced = useReducedMotion();

	useEffect(() => {
		if (!isOpen) return;

		const handleEscape = (e: KeyboardEvent): void => {
			if (e.key === "Escape") onClose();
		};

		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		window.addEventListener("keydown", handleEscape);

		return () => {
			document.body.style.overflow = previous;
			window.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen, onClose]);

	// "lg" is wider than a plain max-w-lg: two-column forms need the room.
	const sizes = {
		sm: "sm:max-w-sm",
		md: "sm:max-w-md",
		lg: "sm:max-w-2xl",
		xl: "sm:max-w-3xl",
	};

	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
					<motion.div
						className="fixed inset-0 bg-ink-900/40 backdrop-blur-sm"
						onClick={onClose}
						initial={{opacity: 0}}
						animate={{opacity: 1}}
						exit={{opacity: 0}}
						transition={{duration: 0.2}}
					/>

					<motion.div
						role="dialog"
						aria-modal="true"
						aria-label={title}
						className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-ink-200/70 bg-white shadow-lift sm:rounded-3xl ${sizes[size]}`}
						initial={
							prefersReduced ? {opacity: 0} : {opacity: 0, y: 24, scale: 0.98}
						}
						animate={{opacity: 1, y: 0, scale: 1}}
						exit={
							prefersReduced ? {opacity: 0} : {opacity: 0, y: 24, scale: 0.98}
						}
						transition={{duration: 0.28, ease: EASE}}
					>
						<div className="flex items-center justify-between border-b border-ink-100 px-5 py-4 sm:px-6">
							<h3 className="font-display text-lg text-ink-900">{title}</h3>
							<button
								onClick={onClose}
								aria-label="Close"
								className="rounded-full p-2 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-800"
							>
								<X className="h-5 w-5" />
							</button>
						</div>

						<div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">
							{children}
						</div>

						{footer && (
							<div className="flex flex-col-reverse gap-2 border-t border-ink-100 bg-cream-100/70 px-5 py-4 pb-safe sm:flex-row sm:justify-end sm:px-6">
								{footer}
							</div>
						)}
					</motion.div>
				</div>
			)}
		</AnimatePresence>,
		document.body,
	);
};

export default Modal;
