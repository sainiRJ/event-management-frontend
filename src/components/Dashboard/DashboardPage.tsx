import React, {useEffect} from "react";
import {Grid, Row, Col} from "rsuite";
import {useAppDispatch, useAppSelector} from "../../store/Hooks";
import {getAllBookings} from "@/store/booking/ThunkActions";
import WeatherCard from "./WeatherCard";
import BookingStats from "./BookingStats";
import "./DashboardPage.css";

const DashboardPage: React.FC = () => {
	const dispatch = useAppDispatch();
	const {bookingList} = useAppSelector((state) => state.bookingReducer);

	useEffect(() => {
		dispatch(getAllBookings());
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
		<div className="dashboard-container">
			<div className="dashboard-header">
				<h1>Dashboard</h1>
				<p className="welcome-text">
					{"Welcome back! Here's your event overview"}
				</p>
			</div>

			<Grid fluid>
				<Row className="dashboard-row">
					<Col xs={24}>
						<BookingStats
							upcoming={stats.upcoming}
							completed={stats.completed}
							cancelled={stats.cancelled}
						/>
					</Col>
				</Row>

				{nextEvent && (
					<Row className="dashboard-row">
						<Col xs={24} md={12}>
							<WeatherCard
								location={nextEvent.venueAddress}
								eventDate={nextEvent.eventDate ?? ""}
							/>
						</Col>
						<Col xs={24} md={12}>
							<div className="next-event-card">
								<h3>Next Event</h3>
								<div className="event-details">
									<div className="event-name">{nextEvent.eventName}</div>
									<div className="event-info">
										<div className="info-item">
											<span className="label">Customer:</span>
											<span className="value">{nextEvent.customerName}</span>
										</div>
										<div className="info-item">
											<span className="label">Date:</span>
											<span className="value">
												{nextEvent.eventDate
													? new Date(nextEvent.eventDate).toLocaleDateString()
													: "N/A"}
											</span>
										</div>
										<div className="info-item">
											<span className="label">Location:</span>
											<span className="value">{nextEvent.venueAddress}</span>
										</div>
									</div>
								</div>
							</div>
						</Col>
					</Row>
				)}
			</Grid>
		</div>
	);
};

export default DashboardPage;
