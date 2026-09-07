import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {
	ArrowRight,
	CalendarDays,
	Camera,
	Inbox,
	MapPin,
	Sunrise,
	User,
} from "lucide-react";
import {useAppDispatch, useAppSelector} from "../../store/Hooks";
import {getAllBookings} from "@/store/booking/ThunkActions";
import {fetchServices} from "@/store/services/ThunkActions";
import WeatherCard from "./WeatherCard";
import MoneyCard from "./MoneyCard";
import BookingStats from "./BookingStats";
import PhotoUploadModal from "../Modal/PhotoUploadModal";
import PageHeader from "../common/PageHeader";
import Button from "../ui/Button";
import {Reveal} from "@/components/motion";

const greeting = (): string => {
	const hour = new Date().getHours();
	if (hour < 12) return "Good morning";
	if (hour < 17) return "Good afternoon";
	return "Good evening";
};

const DashboardPage: React.FC = () => {
	const dispatch = useAppDispatch();
	const {bookingList} = useAppSelector((state) => state.bookingReducer);
	const profile = useAppSelector((state) => state.userReducer.profile);
	const [showPhotoUpload, setShowPhotoUpload] = useState(false);

	useEffect(() => {
		dispatch(getAllBookings());
		dispatch(fetchServices());
	}, [dispatch]);

	const now = new Date();

	const upcoming = bookingList.filter(
		(booking) =>
			booking.eventDate !== null &&
			new Date(booking.eventDate) > now &&
			booking.bookingStatus !== "cancelled",
	).length;

	/**
	 * There is no "completed" status - a booking is pending, booked or
	 * cancelled - so a completed event is a confirmed booking whose date
	 * has passed.
	 */
	const completed = bookingList.filter(
		(booking) =>
			booking.eventDate !== null &&
			new Date(booking.eventDate) < now &&
			booking.bookingStatus === "booked",
	).length;

	const cancelled = bookingList.filter(
		(booking) => booking.bookingStatus === "cancelled",
	).length;

	const nextEvents = bookingList
		.filter((booking) => booking.eventDate !== null)
		.filter((booking) => booking.bookingStatus !== "cancelled")
		.filter((booking) => new Date(booking.eventDate!) > now)
		.sort(
			(a, b) =>
				new Date(a.eventDate!).getTime() - new Date(b.eventDate!).getTime(),
		)
		.slice(0, 4);
	const nextEvent = nextEvents[0];

	const firstName = profile?.name?.trim().split(/\s+/)[0];

	return (
		<div className="space-y-6 sm:space-y-8">
			<PhotoUploadModal
				open={showPhotoUpload}
				onClose={() => setShowPhotoUpload(false)}
			/>

			<PageHeader
				eyebrow={new Date().toLocaleDateString("en-IN", {
					weekday: "long",
					day: "numeric",
					month: "long",
				})}
				title={firstName ? `${greeting()}, ${firstName}` : greeting()}
				subtitle="Here's where the business stands today."
				actions={
					<>
						<Button
							variant="outline"
							icon={<Camera className="h-4 w-4" />}
							onClick={() => setShowPhotoUpload(true)}
						>
							Add photos
						</Button>
						<Link to="/today">
							<Button icon={<Sunrise className="h-4 w-4" />}>Today</Button>
						</Link>
						<Link to="/booking-requests">
							<Button variant="outline" icon={<Inbox className="h-4 w-4" />}>
								Requests
							</Button>
						</Link>
					</>
				}
			/>

			<BookingStats
				upcoming={upcoming}
				completed={completed}
				cancelled={cancelled}
			/>

			{/* Counts answer "how busy am I"; this answers "how am I doing". */}
			<Reveal>
				<MoneyCard />
			</Reveal>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
				{/* What's next */}
				<Reveal className="glass-card p-5 sm:p-6 lg:col-span-3">
					<div className="mb-5 flex items-center justify-between">
						<div>
							<p className="eyebrow">Coming up</p>
							<h3 className="font-display text-xl text-ink-900">Next events</h3>
						</div>
						<Link
							to="/calendar"
							className="group inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
						>
							Calendar
							<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
						</Link>
					</div>

					{nextEvents.length === 0 ? (
						<div className="rounded-2xl border border-dashed border-ink-200 p-8 text-center">
							<CalendarDays className="mx-auto mb-2 h-8 w-8 text-ink-300" />
							<p className="text-sm text-ink-500">
								Nothing booked ahead yet. New requests land in{" "}
								<Link
									to="/booking-requests"
									className="font-semibold text-brand-600"
								>
									Requests
								</Link>
								.
							</p>
						</div>
					) : (
						<ul className="divide-y divide-ink-100">
							{nextEvents.map((booking) => {
								const date = new Date(booking.eventDate!);
								return (
									<li
										key={booking.id}
										className="flex items-center gap-4 py-3.5"
									>
										<div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
											<span className="text-[10px] font-semibold uppercase tracking-wider">
												{date.toLocaleDateString("en-IN", {month: "short"})}
											</span>
											<span className="font-display text-xl leading-none">
												{date.getDate()}
											</span>
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate font-semibold text-ink-900">
												{booking.eventName || booking.serviceName}
											</p>
											<p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-ink-500">
												<span className="inline-flex items-center gap-1">
													<User className="h-3 w-3" />
													{booking.customerName}
												</span>
												<span className="inline-flex items-center gap-1 truncate">
													<MapPin className="h-3 w-3" />
													{booking.venueAddress}
												</span>
											</p>
										</div>
										<span className="hidden rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium capitalize text-ink-600 sm:block">
											{booking.bookingStatus}
										</span>
									</li>
								);
							})}
						</ul>
					)}
				</Reveal>

				{/* Weather for the very next event */}
				<Reveal delay={0.05} className="lg:col-span-2">
					{nextEvent ? (
						<WeatherCard
							location={nextEvent.venueAddress}
							eventDate={nextEvent.eventDate ?? ""}
						/>
					) : (
						<div className="glass-card flex h-full flex-col items-center justify-center p-8 text-center text-sm text-ink-400">
							Weather for the next event shows here once one is booked.
						</div>
					)}
				</Reveal>
			</div>
		</div>
	);
};

export default DashboardPage;
