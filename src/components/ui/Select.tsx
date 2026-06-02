import React from "react";

interface Option {
	label: string;
	value: string | number;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
	label?: string;
	error?: string;
	options: Option[];
	placeholder?: string;
	icon?: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
	(
		{
			label,
			error,
			options,
			placeholder = "Select an option",
			className = "",
			id,
			icon,
			...props
		},
		ref,
	) => {
		const baseStyles =
			"block w-full rounded-2xl border-gray-100 bg-white px-4 py-3 text-sm font-medium text-gray-900 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 transition-all duration-200 shadow-sm border appearance-none cursor-pointer";
		const errorStyles = error
			? "border-rose-300 text-rose-900 focus:border-rose-500 focus:ring-rose-50/50"
			: "";

		const selectId = id || props.name;

		return (
			<div className="w-full group">
				{label && (
					<label
						htmlFor={selectId}
						className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1"
					>
						{label}
					</label>
				)}
				<div className="relative">
					{icon && (
						<div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none transition-colors group-focus-within:text-indigo-600">
							{icon}
						</div>
					)}
					<select
						id={selectId}
						ref={ref}
						className={`${baseStyles} ${errorStyles} ${
							icon ? "pl-11" : ""
						} ${className}`}
						{...props}
					>
						<option value="" disabled>
							{placeholder}
						</option>
						{options.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
					<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
						<svg
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</div>
				</div>
				{error && (
					<p className="mt-2 text-xs font-bold text-rose-600 flex items-center gap-1.5 ml-1 animate-in fade-in slide-in-from-top-1">
						<span className="w-1 h-1 bg-rose-600 rounded-full" />
						{error}
					</p>
				)}
			</div>
		);
	},
);

Select.displayName = "Select";

export default Select;
