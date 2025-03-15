import React from "react";
import {Panel} from "rsuite";
import "./DashboardCard.css";

interface DashboardCardProps {
	title: string;
	value: string | number;
	icon?: React.ReactNode;
	trend?: {
		value: number;
		isPositive: boolean;
	};
	color?: string;
	children?: React.ReactNode;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
	title,
	value,
	icon,
	trend,
	color = "#1675e0",
	children,
}) => {
	return (
		<Panel className="dashboard-card" bordered>
			<div className="card-header" style={{color}}>
				{icon && <div className="card-icon">{icon}</div>}
				<h3>{title}</h3>
			</div>
			<div className="card-content">
				<div className="card-value" style={{color}}>
					{value}
					{trend && (
						<span
							className={`trend ${trend.isPositive ? "positive" : "negative"}`}
						>
							{trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
						</span>
					)}
				</div>
				{children}
			</div>
		</Panel>
	);
};

export default DashboardCard;
