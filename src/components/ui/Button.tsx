import React from "react";
import {Loader2} from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?:
		| "primary"
		| "secondary"
		| "danger"
		| "ghost"
		| "outline"
		| "white"
		| "gold";
	size?: "sm" | "md" | "lg";
	isLoading?: boolean;
	icon?: React.ReactNode;
}

/**
 * The one button. Solid maroon by default, gold for the single most
 * important action on a screen, and quiet variants for everything else.
 */
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
		"inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 ease-premium focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-600/20 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] whitespace-nowrap";

	const variants = {
		primary:
			"bg-brand-600 text-white shadow-soft hover:bg-brand-700 hover:shadow-lift",
		gold: "bg-gold-500 text-ink-900 shadow-soft hover:bg-gold-400 hover:shadow-lift",
		secondary: "bg-brand-50 text-brand-700 hover:bg-brand-100",
		danger: "bg-rose-50 text-rose-700 hover:bg-rose-100",
		outline:
			"border border-ink-200 bg-white text-ink-700 hover:border-brand-300 hover:text-brand-700",
		ghost: "bg-transparent text-ink-600 hover:bg-ink-100 hover:text-ink-900",
		white:
			"border border-ink-200 bg-white text-ink-800 shadow-soft hover:bg-ink-50",
	};

	const sizes = {
		sm: "h-9 px-3.5 text-xs gap-1.5",
		md: "h-11 px-5 text-sm gap-2",
		lg: "h-12 px-7 text-base gap-2.5",
	};

	return (
		<button
			className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
			disabled={disabled || isLoading}
			{...props}
		>
			{isLoading ? (
				<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
			) : (
				icon && <span className="shrink-0">{icon}</span>
			)}
			{children}
		</button>
	);
};

export default Button;
