import React, {useEffect, useState} from "react";
import {Grid, Row, Col, Button, IconButton} from "rsuite";
import CameraRetroIcon from "@rsuite/icons/legacy/CameraRetro";
import {useAppDispatch, useAppSelector} from "../../store/Hooks";
import {getAllBookings} from "@/store/booking/ThunkActions";
import {fetchServices} from "@/store/services/ThunkActions";
import WeatherCard from "./WeatherCard";
import BookingStats from "./BookingStats";
import PhotoUploadModal from "../Modal/PhotoUploadModal";
// import "./DashboardPage.css";

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
			.filter((booking) => booking.eventDate !== null) // Ensure eventDate is not null
			.filter((booking) => new Date(booking.eventDate!) > now)
			.sort(
				(a, b) =>
					new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime(),
			)[0];
	};
	const nextEvent = getNextEvent();

	return (
		<div className="px-4 py-6 max-w-screen-xl mx-auto bg-[#f5f8fa] min-h-screen">
			<PhotoUploadModal
				open={showPhotoUpload}
				onClose={() => setShowPhotoUpload(false)}
			/>
			<div className="mb-8">
				<div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-4">
					<div>
						<h1 className="m-0 text-2xl font-bold text-gray-800">Dashboard</h1>
						<p className="text-gray-600 mt-2 text-base md:text-lg">
							{"Welcome back! Here's your event overview"}
						</p>
					</div>
					<IconButton
						icon={<CameraRetroIcon />}
						appearance="primary"
						onClick={() => setShowPhotoUpload(true)}
					>
						Upload Photo
					</IconButton>
				</div>
			</div>

			<div className="mb-6">
				<BookingStats
					upcoming={stats.upcoming}
					completed={stats.completed}
					cancelled={stats.cancelled}
				/>
			</div>

			{nextEvent && (
				<div className="flex flex-col md:flex-row gap-6 mb-6">
					<div className="w-full md:w-1/2">
						<WeatherCard
							location={nextEvent.venueAddress}
							eventDate={nextEvent.eventDate ?? ""}
						/>
					</div>
					<div className="w-full md:w-1/2">
						<div className="bg-white rounded-lg p-6 h-full shadow">
							<h3 className="text-[#722ed1] text-xl font-semibold mb-5">
								Next Event
							</h3>
							<div className="bg-[#f9f0ff] rounded-lg p-5">
								<div className="text-lg font-bold text-gray-800 mb-4">
									{nextEvent.eventName}
								</div>
								<div className="grid gap-3">
									<div className="flex items-center">
										<span className="text-gray-500 w-24 text-sm">
											Customer:
										</span>
										<span className="text-gray-800 font-medium">
											{nextEvent.customerName}
										</span>
									</div>
									<div className="flex items-center">
										<span className="text-gray-500 w-24 text-sm">Date:</span>
										<span className="text-gray-800 font-medium">
											{nextEvent.eventDate
												? new Date(nextEvent.eventDate).toLocaleDateString()
												: "N/A"}
										</span>
									</div>
									<div className="flex items-center">
										<span className="text-gray-500 w-24 text-sm">
											Location:
										</span>
										<span className="text-gray-800 font-medium">
											{nextEvent.venueAddress}
										</span>
									</div>
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
