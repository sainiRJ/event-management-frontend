import React from "react";
import {TrendingUp, TrendingDown} from "lucide-react";

interface DashboardCardProps {
	title: string;
	value: string | number;
	icon?: React.ReactNode;
	trend?: {
		value: number;
		isPositive: boolean;
	};
	color?: "indigo" | "rose" | "emerald" | "amber" | "blue";
	children?: React.ReactNode;
	className?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
	title,
	value,
	icon,
	trend,
	color = "indigo",
	children,
	className = "",
}) => {
	const colorClasses = {
		indigo: {
			bg: "bg-brand-50",
			text: "text-brand-600",
			shadow: "shadow-brand-200/50",
			iconBg: "bg-gradient-to-br from-brand-500 to-brand-700",
		},
		rose: {
			bg: "bg-rose-50",
			text: "text-rose-600",
			shadow: "shadow-rose-100",
			iconBg: "bg-rose-600",
		},
		emerald: {
			bg: "bg-emerald-50",
			text: "text-emerald-600",
			shadow: "shadow-emerald-100",
			iconBg: "bg-emerald-600",
		},
		amber: {
			bg: "bg-amber-50",
			text: "text-amber-600",
			shadow: "shadow-amber-100",
			iconBg: "bg-amber-600",
		},
		blue: {
			bg: "bg-blue-50",
			text: "text-blue-600",
			shadow: "shadow-blue-100",
			iconBg: "bg-blue-600",
		},
	};

	const selectedColor =
		colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo;

	return (
		<div
			className={`group relative bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-brand-100/70 shadow-glass hover:shadow-glass-lg transition-all duration-300 hover:-translate-y-1 ${className}`}
		>
			<div className="flex items-start justify-between mb-4">
				<div
					className={`p-3 rounded-2xl ${selectedColor.bg} ${selectedColor.text} transition-colors group-hover:${selectedColor.iconBg} group-hover:text-white`}
				>
					{icon}
				</div>
				{trend && (
					<div
						className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${
							trend.isPositive
								? "bg-emerald-50 text-emerald-600"
								: "bg-rose-50 text-rose-600"
						}`}
					>
						{trend.isPositive ? (
							<TrendingUp className="w-3 h-3" />
						) : (
							<TrendingDown className="w-3 h-3" />
						)}
						{trend.value}%
					</div>
				)}
			</div>

			<div className="space-y-1">
				<h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
					{title}
				</h3>
				<div className="flex items-baseline gap-2">
					<span className="text-3xl font-black text-[#2B2129] tracking-tight">
						{value}
					</span>
				</div>
			</div>

			{children && (
				<div className="mt-4 pt-4 border-t border-brand-100/50">{children}</div>
			)}
		</div>
	);
};

export default DashboardCard;
