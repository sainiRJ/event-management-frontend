import React, {useEffect, useState} from "react";
import {Camera} from "lucide-react";
import {useAppDispatch, useAppSelector} from "../../store/Hooks";
import {getAllBookings} from "@/store/booking/ThunkActions";
import {fetchServices} from "@/store/services/ThunkActions";
import WeatherCard from "./WeatherCard";
import MoneyCard from "./MoneyCard";
import BookingStats from "./BookingStats";
import PhotoUploadModal from "../Modal/PhotoUploadModal";
import Button from "../ui/Button";

const DashboardPage: React.FC = () => {
	const dispatch = useAppDispatch();
	const {bookingList} = useAppSelector((state) => state.bookingReducer);
	const [showPhotoUpload, setShowPhotoUpload] = useState(false);

	useEffect(() => {
		dispatch(getAllBookings());
		dispatch(fetchServices());
	}, [dispatch]);

	// Calculate booking statistics
	const getBookingStats = () => {
		const now = new Date();
		const upcoming = bookingList.filter(
			(booking) =>
				booking.eventDate !== null &&
				new Date(booking.eventDate) > now &&
				booking.bookingStatus !== "cancelled",
		).length;

		const completed = bookingList.filter(
			(booking) =>
				booking.eventDate !== null &&
				new Date(booking.eventDate) < now &&
				booking.bookingStatus === "completed",
		).length;

		const cancelled = bookingList.filter(
			(booking) => booking.bookingStatus === "cancelled",
		).length;

		return {upcoming, completed, cancelled};
	};

	const stats = getBookingStats();

	// Get next upcoming event for weather
	const getNextEvent = () => {
		const now = new Date();
		return bookingList
			.filter((booking) => booking.eventDate !== null)
			.filter((booking) => new Date(booking.eventDate!) > now)
			.sort(
				(a, b) =>
					new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime(),
			)[0];
	};
	const nextEvent = getNextEvent();

	return (
		<div className="space-y-8 animate-in fade-in duration-500">
			<PhotoUploadModal
				open={showPhotoUpload}
				onClose={() => setShowPhotoUpload(false)}
			/>

			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-display font-semibold text-[#2B2129] tracking-tight">
						Dashboard
					</h1>
					<p className="text-gray-500 mt-1">
						{"Welcome back! Here's your event overview"}
					</p>
				</div>
				<Button
					icon={<Camera className="w-4 h-4" />}
					onClick={() => setShowPhotoUpload(true)}
				>
					Upload Photo
				</Button>
			</div>

			<BookingStats
				upcoming={stats.upcoming}
				completed={stats.completed}
				cancelled={stats.cancelled}
			/>

			{/* Counts answer "how busy am I"; this answers "how am I doing". */}
			<MoneyCard />

			{nextEvent && (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
					<WeatherCard
						location={nextEvent.venueAddress}
						eventDate={nextEvent.eventDate ?? ""}
					/>

					<div className="glass-card p-8 flex flex-col">
						<h3 className="text-brand-600 font-semibold text-lg mb-6 flex items-center">
							<span className="w-2 h-2 bg-gradient-to-br from-brand-500 to-brand-700 rounded-full mr-2"></span>
							Next Event
						</h3>

						<div className="bg-brand-50/50 rounded-2xl p-6 flex-1">
							<div className="text-xl font-bold text-[#2B2129] mb-6">
								{nextEvent.eventName}
							</div>

							<div className="space-y-4">
								<div className="flex items-center group">
									<span className="text-gray-400 w-28 text-sm font-medium">
										Customer
									</span>
									<span className="text-[#2B2129] font-semibold bg-white px-3 py-1 rounded-lg border border-brand-100/70 shadow-sm group-hover:border-brand-200 transition-colors">
										{nextEvent.customerName}
									</span>
								</div>

								<div className="flex items-center group">
									<span className="text-gray-400 w-28 text-sm font-medium">
										Date
									</span>
									<span className="text-[#2B2129] font-semibold bg-white px-3 py-1 rounded-lg border border-brand-100/70 shadow-sm group-hover:border-brand-200 transition-colors">
										{nextEvent.eventDate
											? new Date(nextEvent.eventDate).toLocaleDateString(
													"en-US",
													{
														weekday: "short",
														year: "numeric",
														month: "short",
														day: "numeric",
													},
											  )
											: "N/A"}
									</span>
								</div>

								<div className="flex items-start group">
									<span className="text-gray-400 w-28 text-sm font-medium mt-1">
										Location
									</span>
									<span className="text-[#2B2129] font-semibold bg-white px-3 py-1 rounded-lg border border-brand-100/70 shadow-sm group-hover:border-brand-200 transition-colors flex-1">
										{nextEvent.venueAddress}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default DashboardPage;
