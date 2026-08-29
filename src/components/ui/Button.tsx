import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "white";
	size?: "sm" | "md" | "lg";
	isLoading?: boolean;
	icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
	children,
	variant = "primary",
	size = "md",
	isLoading = false,
	icon,
	className = "",
	disabled,
	...props
}) => {
	const baseStyles =
		"inline-flex items-center justify-center font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl active:scale-95";

	const variants = {
		primary:
			"bg-gradient-to-br from-brand-500 to-brand-700 text-white hover:from-brand-600 hover:to-brand-800 focus:ring-brand-400 shadow-lg shadow-brand-200/60",
		secondary:
			"bg-brand-50 text-brand-700 hover:bg-brand-100 focus:ring-brand-400",
		danger: "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-400",
		outline:
			"border-2 border-brand-100 bg-transparent hover:border-brand-400 hover:text-brand-600 focus:ring-brand-400 text-gray-600",
		ghost: "bg-transparent hover:bg-brand-50 focus:ring-gray-500 text-gray-600",
		white:
			"bg-white text-gray-900 hover:bg-brand-50 focus:ring-gray-200 shadow-sm border border-brand-100",
	};

	const sizes = {
		sm: "px-3.5 py-1.5 text-xs gap-1.5",
		md: "px-5 py-2.5 text-sm gap-2",
		lg: "px-7 py-3.5 text-base gap-2.5",
	};

	return (
		<button
			className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
			disabled={disabled || isLoading}
			{...props}
		>
			{isLoading && (
				<svg
					className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle
						className="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						strokeWidth="4"
					></circle>
					<path
						className="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					></path>
				</svg>
			)}
			{!isLoading && icon && <span className="shrink-0">{icon}</span>}
			{children}
		</button>
	);
};

export default Button;
