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

	const sizes = {
		sm: "max-w-sm",
		md: "max-w-md",
		lg: "max-w-lg",
		xl: "max-w-xl",
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
				onClick={onClose}
			/>

			{/* Modal content */}
			<div
				className={`relative w-full ${sizes[size]} bg-white rounded-xl shadow-2xl transform transition-all flex flex-col max-h-[90vh]`}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
					<h3 className="text-lg font-semibold text-gray-900">{title}</h3>
					<button
						onClick={onClose}
						className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				{/* Body */}
				<div className="px-6 py-4 overflow-y-auto flex-1">{children}</div>

				{/* Footer */}
				{footer && (
					<div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
						{footer}
					</div>
				)}
			</div>
		</div>
	);
};

export default Modal;
