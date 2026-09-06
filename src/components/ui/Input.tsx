import React from "react";

interface InputProps
	extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
	label?: string;
	error?: string;
	as?: "input" | "textarea";
	rows?: number;
	icon?: React.ReactNode;
}

const Input = React.forwardRef<
	HTMLInputElement | HTMLTextAreaElement,
	InputProps
>(
	(
		{label, error, as = "input", rows = 3, className = "", id, icon, ...props},
		ref,
	) => {
		const baseStyles =
			"block w-full h-11 rounded-xl border-ink-200 bg-white px-4 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-600 focus:ring-4 focus:ring-brand-600/10 transition-all duration-200 border outline-none";
		const errorStyles = error
			? "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-50 animate-shake"
			: "";

		const inputId = id || props.name;

		return (
			<div className="w-full">
				{label && (
					<label
						htmlFor={inputId}
						className="mb-1.5 block text-sm font-medium text-ink-700"
					>
						{label}
					</label>
				)}
				<div className="relative">
					{icon && (
						<div className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none transition-colors group-focus-within:text-brand-500">
							{icon}
						</div>
					)}
					{as === "textarea" ? (
						<textarea
							id={inputId}
							ref={ref as React.Ref<HTMLTextAreaElement>}
							rows={rows}
							className={`${baseStyles} !h-auto py-3 ${errorStyles} ${
								icon ? "pl-11" : ""
							} ${className}`}
							{...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
						/>
					) : (
						<input
							id={inputId}
							ref={ref as React.Ref<HTMLInputElement>}
							className={`${baseStyles} ${errorStyles} ${
								icon ? "pl-11" : ""
							} ${className}`}
							{...(props as React.InputHTMLAttributes<HTMLInputElement>)}
						/>
					)}
				</div>
				{error && (
					<p
						role="alert"
						className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600 animate-in fade-in slide-in-from-top-1 duration-200"
					>
						<span className="w-1 h-1 bg-red-600 rounded-full flex-shrink-0" />
						{error}
					</p>
				)}
			</div>
		);
	},
);

Input.displayName = "Input";

export default Input;
