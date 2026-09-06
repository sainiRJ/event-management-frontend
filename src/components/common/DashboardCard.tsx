import React from "react";
import {TrendingUp, TrendingDown} from "lucide-react";
import {CountUp} from "@/components/motion";

interface DashboardCardProps {
	title: string;
	value: string | number;
	icon?: React.ReactNode;
	trend?: {
		value: number;
		isPositive: boolean;
	};
	color?: "indigo" | "rose" | "emerald" | "amber" | "blue" | "gold";
	/** One line under the number: what it means, or what to do about it. */
	hint?: string;
	children?: React.ReactNode;
	className?: string;
}

/**
 * A stat tile. Numbers count up on first paint; strings render as they are.
 */
const DashboardCard: React.FC<DashboardCardProps> = ({
	title,
	value,
	icon,
	trend,
	color = "indigo",
	hint,
	children,
	className = "",
}) => {
	const colorClasses = {
		indigo: "bg-brand-50 text-brand-700",
		gold: "bg-gold-100 text-gold-700",
		rose: "bg-rose-50 text-rose-600",
		emerald: "bg-emerald-50 text-emerald-600",
		amber: "bg-amber-50 text-amber-600",
		blue: "bg-sky-50 text-sky-600",
	};

	const iconClass = colorClasses[color] ?? colorClasses.indigo;

	return (
		<div
			className={`glass-card card-hover group relative overflow-hidden p-5 sm:p-6 ${className}`}
		>
			<div className="mb-4 flex items-start justify-between">
				<div className={`rounded-2xl p-3 ${iconClass}`}>{icon}</div>
				{trend && (
					<div
						className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
							trend.isPositive
								? "bg-emerald-50 text-emerald-600"
								: "bg-rose-50 text-rose-600"
						}`}
					>
						{trend.isPositive ? (
							<TrendingUp className="h-3 w-3" />
						) : (
							<TrendingDown className="h-3 w-3" />
						)}
						{trend.value}%
					</div>
				)}
			</div>

			<p className="eyebrow">{title}</p>
			<p className="mt-1 font-display text-[2rem] leading-none tracking-tight text-ink-900">
				{typeof value === "number" ? <CountUp value={value} /> : value}
			</p>
			{hint && <p className="mt-2 text-xs text-ink-400">{hint}</p>}

			{children && (
				<div className="mt-4 border-t border-ink-100 pt-4">{children}</div>
			)}
		</div>
	);
};

export default DashboardCard;
