import React from "react";
import { CalendarCheck, CalendarX, CalendarDays, TrendingUp, Sparkles } from "lucide-react";
import DashboardCard from "../common/DashboardCard";

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

	return (
		<div className="space-y-6">
			{/* Overview Header */}
			<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
				<DashboardCard
					title="Total Bookings"
					value={total}
					icon={<Sparkles className="w-6 h-6" />}
					color="indigo"
					trend={{ value: 12, isPositive: true }}
					className="lg:col-span-1"
				/>
				
				<DashboardCard
					title="Upcoming"
					value={upcoming}
					icon={<CalendarDays className="w-6 h-6" />}
					color="blue"
					className="lg:col-span-1"
				/>

				<DashboardCard
					title="Completed"
					value={completed}
					icon={<CalendarCheck className="w-6 h-6" />}
					color="emerald"
					className="lg:col-span-1"
				/>

				<DashboardCard
					title="Cancelled"
					value={cancelled}
					icon={<CalendarX className="w-6 h-6" />}
					color="rose"
					className="lg:col-span-1"
				/>
			</div>

			{/* Detailed Stats could go here */}
		</div>
	);
};

export default BookingStats;
