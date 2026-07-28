import React, {useState, useRef, useEffect} from "react";
import {Check, ChevronDown, X} from "lucide-react";

interface Option {
	label: string;
	value: string;
}

interface MultiSelectProps {
	label?: string;
	options: Option[];
	value: string[];
	onChange: (value: string[]) => void;
	placeholder?: string;
	error?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
	label,
	options,
	value = [],
	onChange,
	placeholder = "Select options",
	error,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const toggleOption = (optionValue: string) => {
		const newValue = value.includes(optionValue)
			? value.filter((v) => v !== optionValue)
			: [...value, optionValue];
		onChange(newValue);
	};

	const removeOption = (e: React.MouseEvent, optionValue: string) => {
		e.stopPropagation();
		onChange(value.filter((v) => v !== optionValue));
	};

	const selectedOptions = options.filter((opt) => value.includes(opt.value));

	return (
		<div className="w-full" ref={containerRef}>
			{label && (
				<label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
					{label}
				</label>
			)}
			<div className="relative">
				<div
					onClick={() => setIsOpen(!isOpen)}
					className={`min-h-[38px] w-full p-1.5 rounded-md border shadow-sm cursor-pointer flex flex-wrap gap-1 items-center bg-white transition-colors ${
						isOpen
							? "border-indigo-500 ring-1 ring-indigo-500"
							: "border-gray-300"
					} ${error ? "border-red-300 ring-red-500" : ""}`}
				>
					{selectedOptions.length > 0 ? (
						selectedOptions.map((opt) => (
							<span
								key={opt.value}
								className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 text-brand-700 border border-brand-100"
							>
								{opt.label}
								<button
									type="button"
									onClick={(e) => removeOption(e, opt.value)}
									className="ml-1 hover:text-brand-900 focus:outline-none"
								>
									<X className="h-3 w-3" />
								</button>
							</span>
						))
					) : (
						<span className="text-gray-400 text-sm ml-1">{placeholder}</span>
					)}
					<div className="ml-auto pr-1">
						<ChevronDown
							className={`h-4 w-4 text-gray-400 transition-transform ${
								isOpen ? "rotate-180" : ""
							}`}
						/>
					</div>
				</div>

				{isOpen && (
					<div className="absolute z-50 w-full mt-2 bg-white/95 backdrop-blur-xl rounded-2xl shadow-glass-lg border border-brand-100 max-h-60 overflow-auto py-1.5 animate-in fade-in slide-in-from-top-1 duration-150">
						{options.length > 0 ? (
							options.map((opt) => (
								<div
									key={opt.value}
									onClick={() => toggleOption(opt.value)}
									className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between hover:bg-gray-50 ${
										value.includes(opt.value)
											? "bg-indigo-50 text-indigo-700 font-medium"
											: "text-gray-700"
									}`}
								>
									{opt.label}
									{value.includes(opt.value) && <Check className="h-4 w-4" />}
								</div>
							))
						) : (
							<div className="px-3 py-2 text-sm text-gray-500 text-center">
								No options available
							</div>
						)}
					</div>
				)}
			</div>
			{error && (
				<p
					role="alert"
					className="mt-2 text-xs font-bold text-red-600 flex items-center gap-1.5 ml-1 animate-in fade-in slide-in-from-top-1 duration-200"
				>
					<span className="w-1 h-1 bg-red-600 rounded-full flex-shrink-0" />
					{error}
				</p>
			)}
		</div>
	);
};

export default MultiSelect;
