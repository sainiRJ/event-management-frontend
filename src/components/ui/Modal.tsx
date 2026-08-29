import React, {useEffect} from "react";
import {X} from "lucide-react";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
	size?: "sm" | "md" | "lg" | "xl";
}

const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	children,
	footer,
	size = "md",
}) => {
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		if (isOpen) {
			document.body.style.overflow = "hidden";
			window.addEventListener("keydown", handleEscape);
		}

		return () => {
			document.body.style.overflow = "unset";
			window.removeEventListener("keydown", handleEscape);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	// Note: "lg" is intentionally wider than a plain max-w-lg (512px) — forms with
	// a 2-column grid (e.g. Booking) were cramped at that width.
	const sizes = {
		sm: "max-w-sm",
		md: "max-w-md",
		lg: "max-w-2xl",
		xl: "max-w-3xl",
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-[#2B2129]/30 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
				onClick={onClose}
			/>

			{/* Modal content */}
			<div
				className={`relative w-full ${sizes[size]} bg-white/85 backdrop-blur-xl border border-brand-100 rounded-3xl shadow-glass-lg transform transition-all flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200`}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-brand-100/70">
					<h3 className="text-lg font-semibold font-display text-[#2B2129]">
						{title}
					</h3>
					<button
						onClick={onClose}
						aria-label="Close"
						className="p-1 rounded-full text-gray-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Body */}
				<div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>

				{/* Footer */}
				{footer && (
					<div className="px-6 py-4 border-t border-brand-100/70 bg-cream-100/60 rounded-b-3xl flex justify-end gap-3">
						{footer}
					</div>
				)}
			</div>
		</div>
	);
};

export default Modal;
