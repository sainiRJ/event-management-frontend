import React, {useCallback, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {
	AlertCircle,
	CalendarClock,
	CheckSquare,
	Clock,
	FileText,
	IndianRupee,
	MapPin,
	MessageCircle,
	Phone,
	RefreshCw,
	Users,
} from "lucide-react";

import {operationsService} from "@/services/api/eventManagementServer";
import {
	iTodayEvent,
	iTodayView,
} from "@/customTypes/appDataTypes/operationsTypes";
import {httpStatusCodes} from "@/customTypes/NetworkTypes";
import {formatCurrency} from "@/utils/currencyUtils";
import {paymentReminderMessage, whatsappLink} from "@/utils/whatsapp";
import PageHeader from "../common/PageHeader";
import Button from "../ui/Button";
import {Reveal, Stagger, StaggerItem} from "@/components/motion";

const formatDay = (iso: string): string => {
	return new Date(`${iso}T00:00:00`).toLocaleDateString("en-IN", {
		weekday: "short",
		day: "numeric",
		month: "short",
	});
};

const pillClass =
	"inline-flex h-9 items-center gap-1.5 rounded-full border border-ink-200 px-3 text-xs font-semibold text-ink-700 hover:bg-ink-50";
const primaryPillClass =
	"inline-flex h-9 items-center rounded-full bg-brand-600 px-3 text-xs font-semibold text-white hover:bg-brand-700";

const EventCard: React.FC<{event: iTodayEvent}> = ({event}) => {
	const isDue = Number(event.amountDue) > 0;
	const isPacked =
		event.materialsTotal > 0 && event.materialsDone === event.materialsTotal;
	let checklistLabel = "No checklist yet";
	if (event.materialsTotal > 0) {
		checklistLabel = `${event.materialsDone}/${event.materialsTotal} packed`;
	}

	return (
		<div className="rounded-3xl border border-ink-200/70 bg-white p-5 shadow-sm">
			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="min-w-0">
					<p className="eyebrow">{event.eventName}</p>
					<h3 className="mt-1 font-display text-xl text-ink-900">
						{event.serviceName}
					</h3>
					<p className="text-sm text-ink-600">{event.customerName}</p>
				</div>
				<span className="rounded-full bg-brand-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-brand-700">
					{event.status}
				</span>
			</div>

			<p className="mt-3 flex items-start gap-2 text-sm text-ink-600">
				<MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
				{event.location}
			</p>

			<div className="mt-4 flex flex-wrap gap-2 text-xs">
				<span
					className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${
						isPacked
							? "bg-emerald-50 text-emerald-700"
							: "bg-ink-100 text-ink-600"
					}`}
				>
					<CheckSquare className="h-3.5 w-3.5" />
					{checklistLabel}
				</span>
				<span
					className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-semibold ${
						isDue
							? "bg-amber-50 text-amber-700"
							: "bg-emerald-50 text-emerald-700"
					}`}
				>
					<IndianRupee className="h-3.5 w-3.5" />
					{isDue
						? `${formatCurrency(Number(event.amountDue))} due`
						: "Fully paid"}
				</span>
			</div>

			<div className="mt-4 border-t border-ink-100 pt-3">
				<p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-400">
					<Users className="h-3.5 w-3.5" />
					Crew
				</p>
				{event.crew.length === 0 ? (
					<p className="text-sm text-amber-700">Nobody assigned yet</p>
				) : (
					<div className="flex flex-wrap gap-1.5">
						{event.crew.map((member) => (
							<span
								key={member.employeeId}
								className="rounded-full border border-ink-200 px-2.5 py-0.5 text-xs text-ink-700"
							>
								{member.name}
							</span>
						))}
					</div>
				)}
			</div>

			<div className="mt-4 flex flex-wrap gap-2">
				{event.phoneNumber && (
					<>
						<a href={`tel:${event.phoneNumber}`} className={pillClass}>
							<Phone className="h-3.5 w-3.5" />
							Call
						</a>
						<a
							href={whatsappLink(
								event.phoneNumber,
								`Namaste ${event.customerName} ji, Saini Events here. Our team is on the way for the ${event.serviceName} today.`,
							)}
							target="_blank"
							rel="noopener noreferrer"
							className={pillClass}
						>
							<MessageCircle className="h-3.5 w-3.5" />
							WhatsApp
						</a>
					</>
				)}
				<Link
					to={`/booking?open=${event.bookingId}`}
					className={primaryPillClass}
				>
					Open booking
				</Link>
			</div>
		</div>
	);
};

const SectionTitle: React.FC<{
	icon: React.ReactNode;
	title: string;
	count?: number;
}> = ({icon, title, count}) => (
	<h2 className="flex items-center gap-2 font-display text-lg text-ink-900">
		<span className="text-brand-600">{icon}</span>
		{title}
		{typeof count === "number" && (
			<span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-semibold text-ink-600">
				{count}
			</span>
		)}
	</h2>
);

const waitingLabel = (hours: number): string => {
	if (hours >= 48) return `${Math.floor(hours / 24)} days`;
	return `${hours} h`;
};

/**
 * The morning screen. Everything that needs a decision today, and nothing
 * that does not: events on now and tomorrow with crew and checklist
 * progress, requests waiting over a day, money overdue, quotes unanswered.
 */
const TodayPage: React.FC = () => {
	const [view, setView] = useState<iTodayView | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const load = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		const response = await operationsService.getToday();
		if (
			response?.httpStatusCode === httpStatusCodes.SUCCESS_OK &&
			response.data?.data
		) {
			setView(response.data.data);
		} else {
			setError(
				response?.data?.error?.message ?? "Couldn't load today's overview",
			);
		}
		setIsLoading(false);
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const isQuiet =
		view !== null &&
		view.today.length === 0 &&
		view.tomorrow.length === 0 &&
		view.followUps.length === 0 &&
		view.overdue.length === 0 &&
		view.quotesAwaiting.length === 0;

	return (
		<div className="space-y-8">
			<PageHeader
				eyebrow={new Date().toLocaleDateString("en-IN", {
					weekday: "long",
					day: "numeric",
					month: "long",
				})}
				title="Today"
				subtitle="What needs you this morning: events, replies and money."
				actions={
					<Button
						variant="outline"
						icon={
							<RefreshCw
								className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
							/>
						}
						onClick={() => void load()}
						disabled={isLoading}
					>
						Refresh
					</Button>
				}
			/>

			{isLoading && !view && (
				<div className="grid gap-4 md:grid-cols-2">
					{[0, 1, 2, 3].map((i) => (
						<div key={i} className="skeleton h-48 rounded-3xl" />
					))}
				</div>
			)}

			{error && (
				<div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
					{error}
				</div>
			)}

			{view && (
				<>
					<Reveal>
						<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
							{[
								{label: "Today", value: view.today.length},
								{label: "Tomorrow", value: view.tomorrow.length},
								{label: "This week", value: view.thisWeekCount},
								{label: "Unread enquiries", value: view.unreadMessages},
							].map((stat) => (
								<div
									key={stat.label}
									className="rounded-2xl border border-ink-200/70 bg-white p-4"
								>
									<p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">
										{stat.label}
									</p>
									<p className="mt-1 font-display text-3xl text-ink-900">
										{stat.value}
									</p>
								</div>
							))}
						</div>
					</Reveal>

					{isQuiet && (
						<div className="rounded-3xl border border-ink-200/70 bg-white p-12 text-center">
							<CalendarClock className="mx-auto h-10 w-10 text-ink-300" />
							<h2 className="mt-4 font-display text-xl text-ink-900">
								A quiet day
							</h2>
							<p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
								Nothing on today or tomorrow, no requests waiting and nobody
								overdue. Good time to upload photos or plan the week.
							</p>
						</div>
					)}

					{view.today.length > 0 && (
						<section className="space-y-4">
							<SectionTitle
								icon={<CalendarClock className="h-5 w-5" />}
								title="On today"
								count={view.today.length}
							/>
							<Stagger className="grid gap-4 md:grid-cols-2">
								{view.today.map((event) => (
									<StaggerItem key={event.bookingId}>
										<EventCard event={event} />
									</StaggerItem>
								))}
							</Stagger>
						</section>
					)}

					{view.tomorrow.length > 0 && (
						<section className="space-y-4">
							<SectionTitle
								icon={<Clock className="h-5 w-5" />}
								title="Tomorrow"
								count={view.tomorrow.length}
							/>
							<Stagger className="grid gap-4 md:grid-cols-2">
								{view.tomorrow.map((event) => (
									<StaggerItem key={event.bookingId}>
										<EventCard event={event} />
									</StaggerItem>
								))}
							</Stagger>
						</section>
					)}

					{view.followUps.length > 0 && (
						<section className="space-y-4">
							<SectionTitle
								icon={<AlertCircle className="h-5 w-5" />}
								title="Requests waiting for a reply"
								count={view.followUps.length}
							/>
							<div className="overflow-hidden rounded-3xl border border-ink-200/70 bg-white">
								<ul className="divide-y divide-ink-100">
									{view.followUps.map((item) => (
										<li
											key={item.bookingId}
											className="flex flex-wrap items-center justify-between gap-3 p-4"
										>
											<div className="min-w-0">
												<p className="font-semibold text-ink-900">
													{item.customerName}
												</p>
												<p className="text-sm text-ink-500">
													{item.serviceName} · {formatDay(item.eventDate)} ·
													waiting {waitingLabel(item.waitingHours)}
												</p>
											</div>
											<div className="flex gap-2">
												{item.phoneNumber && (
													<a
														href={`tel:${item.phoneNumber}`}
														className={pillClass}
													>
														<Phone className="h-3.5 w-3.5" />
														Call
													</a>
												)}
												<Link
													to="/booking-requests"
													className={primaryPillClass}
												>
													Review
												</Link>
											</div>
										</li>
									))}
								</ul>
							</div>
						</section>
					)}

					{view.overdue.length > 0 && (
						<section className="space-y-4">
							<SectionTitle
								icon={<IndianRupee className="h-5 w-5" />}
								title="Payments overdue"
								count={view.overdue.length}
							/>
							<div className="overflow-hidden rounded-3xl border border-ink-200/70 bg-white">
								<ul className="divide-y divide-ink-100">
									{view.overdue.map((item) => (
										<li
											key={item.bookingId}
											className="flex flex-wrap items-center justify-between gap-3 p-4"
										>
											<div className="min-w-0">
												<p className="font-semibold text-ink-900">
													{item.customerName}
													<span className="ml-2 text-amber-700">
														{formatCurrency(Number(item.amountDue))}
													</span>
												</p>
												<p className="text-sm text-ink-500">
													{item.serviceName} · {formatDay(item.eventDate)} ·{" "}
													{item.daysOverdue} days ago
												</p>
											</div>
											{item.phoneNumber && (
												<a
													href={whatsappLink(
														item.phoneNumber,
														paymentReminderMessage({
															customerName: item.customerName,
															serviceName: item.serviceName,
															eventDate: item.eventDate,
															amountDue: Number(item.amountDue),
														}),
													)}
													target="_blank"
													rel="noopener noreferrer"
													className={pillClass}
												>
													<MessageCircle className="h-3.5 w-3.5" />
													Remind on WhatsApp
												</a>
											)}
										</li>
									))}
								</ul>
							</div>
						</section>
					)}

					{view.quotesAwaiting.length > 0 && (
						<section className="space-y-4">
							<SectionTitle
								icon={<FileText className="h-5 w-5" />}
								title="Quotes waiting on the customer"
								count={view.quotesAwaiting.length}
							/>
							<div className="overflow-hidden rounded-3xl border border-ink-200/70 bg-white">
								<ul className="divide-y divide-ink-100">
									{view.quotesAwaiting.map((item) => (
										<li
											key={item.bookingId}
											className="flex flex-wrap items-center justify-between gap-3 p-4"
										>
											<div className="min-w-0">
												<p className="font-semibold text-ink-900">
													{item.customerName}
													<span className="ml-2 text-ink-500">
														{formatCurrency(Number(item.total))}
													</span>
												</p>
												<p className="text-sm text-ink-500">
													{item.serviceName} · {formatDay(item.eventDate)} ·
													sent{" "}
													{new Date(item.sentAt).toLocaleDateString("en-IN")}
												</p>
											</div>
											<div className="flex gap-2">
												{item.phoneNumber && (
													<a
														href={whatsappLink(
															item.phoneNumber,
															`Namaste ${item.customerName} ji, Saini Events here. Did you get a chance to look at the quote for the ${item.serviceName}? Happy to answer any questions.`,
														)}
														target="_blank"
														rel="noopener noreferrer"
														className={pillClass}
													>
														<MessageCircle className="h-3.5 w-3.5" />
														Nudge
													</a>
												)}
												<Link
													to={`/booking?open=${item.bookingId}`}
													className={primaryPillClass}
												>
													Open
												</Link>
											</div>
										</li>
									))}
								</ul>
							</div>
						</section>
					)}
				</>
			)}
		</div>
	);
};

export default TodayPage;
