import React from "react";
import {CalendarCheck, CalendarX, CalendarDays, Sparkles} from "lucide-react";
import DashboardCard from "../common/DashboardCard";
import {Stagger, StaggerItem} from "@/components/motion";

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
		<Stagger className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
			<StaggerItem>
				<DashboardCard
					title="All bookings"
					value={total}
					icon={<Sparkles className="h-5 w-5" />}
					color="gold"
					hint="Everything on the books"
				/>
			</StaggerItem>
			<StaggerItem>
				<DashboardCard
					title="Upcoming"
					value={upcoming}
					icon={<CalendarDays className="h-5 w-5" />}
					color="indigo"
					hint="Confirmed, dates still ahead"
				/>
			</StaggerItem>
			<StaggerItem>
				<DashboardCard
					title="Completed"
					value={completed}
					icon={<CalendarCheck className="h-5 w-5" />}
					color="emerald"
					hint="Booked events already held"
				/>
			</StaggerItem>
			<StaggerItem>
				<DashboardCard
					title="Cancelled"
					value={cancelled}
					icon={<CalendarX className="h-5 w-5" />}
					color="rose"
					hint="Dates released again"
				/>
			</StaggerItem>
		</Stagger>
	);
};

export default BookingStats;
