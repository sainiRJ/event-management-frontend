import React from "react";
import {Panel, Progress} from "rsuite";
import {FaCalendarCheck, FaCalendarTimes, FaCalendarDay} from "react-icons/fa";
import "./BookingStats.css";

interface BookingStatsProps {
	upcoming: number;
	completed: number;
	cancelled: number;
}

const BookingStats: React.FC<BookingStatsProps> = ({
	upcoming,
	completed,
	cancelled,
}) => {
	const total = upcoming + completed + cancelled;

	const calculatePercentage = (value: number) => {
		return total === 0 ? 0 : Math.round((value / total) * 100);
	};

	const stats = [
		{
			label: "Upcoming",
			value: upcoming,
			icon: <FaCalendarDay />,
			color: "#1675e0",
			percentage: calculatePercentage(upcoming),
		},
		{
			label: "Completed",
			value: completed,
			icon: <FaCalendarCheck />,
			color: "#52c41a",
			percentage: calculatePercentage(completed),
		},
		{
			label: "Cancelled",
			value: cancelled,
			icon: <FaCalendarTimes />,
			color: "#ff4d4f",
			percentage: calculatePercentage(cancelled),
		},
	];

	return (
		<Panel className="booking-stats-card" bordered>
			<h3 className="stats-title">Total Bookings</h3>
			<div className="total-count">{total}</div>

			<div className="stats-grid">
				{stats.map((stat, index) => (
					<div key={index} className="stat-item">
						<div className="stat-header">
							<div
								className="stat-icon"
								style={{backgroundColor: `${stat.color}20`, color: stat.color}}
							>
								{stat.icon}
							</div>
							<div className="stat-info">
								<div className="stat-label">{stat.label}</div>
								<div className="stat-value" style={{color: stat.color}}>
									{stat.value}
								</div>
							</div>
						</div>
						<Progress.Line
							percent={stat.percentage}
							strokeColor={stat.color}
							showInfo={false}
							className="stat-progress"
						/>
						<div className="stat-percentage" style={{color: stat.color}}>
							{stat.percentage}%
						</div>
					</div>
				))}
			</div>
		</Panel>
	);
};

export default BookingStats;
