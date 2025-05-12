// import React from "react";
// import {Panel, Progress} from "rsuite";
// import {FaCalendarCheck, FaCalendarTimes, FaCalendarDay} from "react-icons/fa";
// import "./BookingStats.css";

// interface BookingStatsProps {
// 	upcoming: number;
// 	completed: number;
// 	cancelled: number;
// }

// const BookingStats: React.FC<BookingStatsProps> = ({
// 	upcoming,
// 	completed,
// 	cancelled,
// }) => {
// 	const total = upcoming + completed + cancelled;

// 	const calculatePercentage = (value: number) => {
// 		return total === 0 ? 0 : Math.round((value / total) * 100);
// 	};

// 	const stats = [
// 		{
// 			label: "Upcoming",
// 			value: upcoming,
// 			icon: <FaCalendarDay />,
// 			color: "#1675e0",
// 			percentage: calculatePercentage(upcoming),
// 		},
// 		{
// 			label: "Completed",
// 			value: completed,
// 			icon: <FaCalendarCheck />,
// 			color: "#52c41a",
// 			percentage: calculatePercentage(completed),
// 		},
// 		{
// 			label: "Cancelled",
// 			value: cancelled,
// 			icon: <FaCalendarTimes />,
// 			color: "#ff4d4f",
// 			percentage: calculatePercentage(cancelled),
// 		},
// 	];

// 	return (
// 		<Panel className="booking-stats-card" bordered>
// 			<h3 className="stats-title">Total Bookings</h3>
// 			<div className="total-count">{total}</div>

// 			<div className="stats-grid">
// 				{stats.map((stat, index) => (
// 					<div key={index} className="stat-item">
// 						<div className="stat-header">
// 							<div
// 								className="stat-icon"
// 								style={{backgroundColor: `${stat.color}20`, color: stat.color}}
// 							>
// 								{stat.icon}
// 							</div>
// 							<div className="stat-info">
// 								<div className="stat-label">{stat.label}</div>
// 								<div className="stat-value" style={{color: stat.color}}>
// 									{stat.value}
// 								</div>
// 							</div>
// 						</div>
// 						<Progress.Line
// 							percent={stat.percentage}
// 							strokeColor={stat.color}
// 							showInfo={false}
// 							className="stat-progress"
// 						/>
// 						<div className="stat-percentage" style={{color: stat.color}}>
// 							{stat.percentage}%
// 						</div>
// 					</div>
// 				))}
// 			</div>
// 		</Panel>
// 	);
// };

// export default BookingStats;
import React from "react";
import { FaCalendarCheck, FaCalendarTimes, FaCalendarDay } from "react-icons/fa";

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

	const calculatePercentage = (value: number) =>
		total === 0 ? 0 : Math.round((value / total) * 100);

	const stats = [
		{
			label: "Upcoming",
			value: upcoming,
			icon: <FaCalendarDay />,
			color: "from-blue-400 to-blue-600",
			bg: "bg-blue-100/50",
			percentage: calculatePercentage(upcoming),
		},
		{
			label: "Completed",
			value: completed,
			icon: <FaCalendarCheck />,
			color: "from-green-400 to-green-600",
			bg: "bg-green-100/50",
			percentage: calculatePercentage(completed),
		},
		{
			label: "Cancelled",
			value: cancelled,
			icon: <FaCalendarTimes />,
			color: "from-rose-400 to-rose-600",
			bg: "bg-rose-100/50",
			percentage: calculatePercentage(cancelled),
		},
	];

	return (
		<div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-xl p-6 w-full h-full transition-all duration-500">
			<h3 className="text-gray-700 text-xl font-semibold mb-2">Total Bookings</h3>
			<div className="text-4xl font-bold text-gray-900 mb-6">{total}</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{stats.map((stat, index) => (
					<div
						key={index}
						className="bg-white/60 backdrop-blur-md border border-gray-200 p-5 rounded-2xl hover:shadow-2xl transition-transform transform hover:-translate-y-1"
					>
						<div className="flex items-center gap-4 mb-4">
							<div
								className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${stat.color} text-white text-2xl shadow-lg`}
							>
								{stat.icon}
							</div>
							<div>
								<div className="text-sm text-gray-500">{stat.label}</div>
								<div className="text-lg font-bold text-gray-800">{stat.value}</div>
							</div>
						</div>

						<div className="relative h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
							<div
								className={`absolute left-0 top-0 h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-500`}
								style={{ width: `${stat.percentage}%` }}
							></div>
						</div>

						<div className="text-sm font-medium text-right text-gray-600">
							{stat.percentage}%
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default BookingStats;
