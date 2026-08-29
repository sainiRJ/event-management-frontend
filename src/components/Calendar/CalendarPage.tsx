import React, {useCallback, useEffect, useMemo, useState} from "react";
import {toast} from "sonner";
import {ChevronLeft, ChevronRight, Globe} from "lucide-react";

import {operationsService} from "@/services/api/eventManagementServer";
import {
	iCalendarDay,
	iCalendarEntry,
} from "@/customTypes/appDataTypes/operationsTypes";
import {httpStatusCodes} from "@/customTypes/NetworkTypes";
import PageHeader from "@/components/common/PageHeader";
import Button from "@/components/ui/Button";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const currency = new Intl.NumberFormat("en-IN", {
	style: "currency",
	currency: "INR",
	maximumFractionDigits: 0,
});

/** YYYY-MM-DD from local calendar parts — never via toISOString. */
function toKey(date: Date): string {
	const y = date.getFullYear();
	const m = `${date.getMonth() + 1}`.padStart(2, "0");
	const d = `${date.getDate()}`.padStart(2, "0");
	return `${y}-${m}-${d}`;
}

/** Monday-first offset, because that is how a working week reads here. */
function mondayIndex(date: Date): number {
	return (date.getDay() + 6) % 7;
}

function statusTone(status: string): string {
	switch (status?.toLowerCase()) {
		case "cancelled":
			return "bg-gray-100 text-gray-500 line-through";
		case "pending":
			return "bg-amber-100 text-amber-800";
		case "completed":
			return "bg-blue-100 text-blue-800";
		default:
			return "bg-brand-100 text-brand-700";
	}
}

/**
 * Month view of what is booked.
 *
 * This business runs on dates — "is stage free on the 25th?" is the question
 * behind almost every enquiry — and the admin had no way to see a month at a
 * glance, only a flat table to scroll.
 */
const CalendarPage: React.FC = () => {
	const [cursor, setCursor] = useState(() => {
		const now = new Date();
		return new Date(now.getFullYear(), now.getMonth(), 1);
	});
	const [days, setDays] = useState<iCalendarDay[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [selected, setSelected] = useState<string | null>(null);

	const monthStart = useMemo(() => {
		return new Date(cursor.getFullYear(), cursor.getMonth(), 1);
	}, [cursor]);

	const monthEnd = useMemo(() => {
		return new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
	}, [cursor]);

	const load = useCallback(async () => {
		setIsLoading(true);

		const response = await operationsService.getCalendar(
			toKey(monthStart),
			toKey(monthEnd),
		);

		if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
			setDays(response.data?.data ?? []);
		} else {
			toast.error("Couldn't load the calendar");
		}

		setIsLoading(false);
	}, [monthStart, monthEnd]);

	useEffect(() => {
		load();
	}, [load]);

	const entriesByDate = useMemo(() => {
		const map = new Map<string, iCalendarEntry[]>();
		days.forEach((day) => map.set(day.date, day.entries));
		return map;
	}, [days]);

	const cells = useMemo(() => {
		const lead = mondayIndex(monthStart);
		const total = monthEnd.getDate();
		const out: (Date | null)[] = Array.from({length: lead}, () => null);

		for (let d = 1; d <= total; d++) {
			out.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
		}

		return out;
	}, [monthStart, monthEnd, cursor]);

	const todayKey = toKey(new Date());
	const selectedEntries = selected ? entriesByDate.get(selected) ?? [] : [];

	const monthLabel = cursor.toLocaleDateString("en-IN", {
		month: "long",
		year: "numeric",
	});

	const bookedCount = days.reduce((sum, d) => {
		return (
			sum +
			d.entries.filter((e) => e.status?.toLowerCase() !== "cancelled").length
		);
	}, 0);

	return (
		<div>
			<PageHeader
				title="Calendar"
				subtitle={`${bookedCount} booking${
					bookedCount === 1 ? "" : "s"
				} in ${monthLabel}`}
				actions={
					<div className="flex w-full items-center gap-2 sm:w-auto">
						<Button
							variant="secondary"
							aria-label="Previous month"
							onClick={() =>
								setCursor(
									new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1),
								)
							}
						>
							<ChevronLeft className="h-4 w-4" />
						</Button>
						<span className="flex-1 whitespace-nowrap text-center text-sm font-bold text-[#2B2129] sm:flex-none sm:px-2">
							{monthLabel}
						</span>
						<Button
							variant="secondary"
							aria-label="Next month"
							onClick={() =>
								setCursor(
									new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1),
								)
							}
						>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				}
			/>

			<div className="overflow-hidden rounded-3xl border border-brand-100/70 bg-white shadow-sm">
				<div className="grid grid-cols-7 border-b border-brand-100/70 bg-cream-100">
					{WEEKDAYS.map((day) => (
						<div
							key={day}
							className="px-1 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-gray-400 sm:px-2 sm:text-xs"
						>
							<span className="sm:hidden">{day[0]}</span>
							<span className="hidden sm:inline">{day}</span>
						</div>
					))}
				</div>

				<div className="grid grid-cols-7">
					{cells.map((date, index) => {
						if (!date) {
							return (
								<div
									key={`pad-${index}`}
									className="min-h-[72px] border-b border-r border-brand-100/40 bg-cream-50/40 sm:min-h-[104px]"
								/>
							);
						}

						const key = toKey(date);
						const entries = entriesByDate.get(key) ?? [];
						const live = entries.filter(
							(e) => e.status?.toLowerCase() !== "cancelled",
						);
						const isToday = key === todayKey;

						return (
							<button
								key={key}
								type="button"
								onClick={() => setSelected(key)}
								className={`min-h-[72px] border-b border-r border-brand-100/40 p-1.5 text-left transition-colors hover:bg-brand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 sm:min-h-[104px] sm:p-2 ${
									selected === key ? "bg-brand-50" : ""
								}`}
							>
								<span
									className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
										isToday
											? "bg-brand-500 text-white"
											: live.length > 0
											? "text-[#2B2129]"
											: "text-gray-400"
									}`}
								>
									{date.getDate()}
								</span>

								<div className="mt-1 space-y-1">
									{live.slice(0, 2).map((entry) => (
										<span
											key={entry.bookingId}
											className={`block truncate rounded px-1 py-0.5 text-[10px] font-semibold sm:text-[11px] ${statusTone(
												entry.status,
											)}`}
										>
											{entry.serviceName}
										</span>
									))}
									{live.length > 2 && (
										<span className="block text-[10px] font-semibold text-gray-400">
											+{live.length - 2} more
										</span>
									)}
								</div>
							</button>
						);
					})}
				</div>
			</div>

			{isLoading && (
				<p className="py-6 text-center text-sm text-gray-500">
					Loading calendar…
				</p>
			)}

			{selected && (
				<section className="mt-6 rounded-3xl border border-brand-100/70 bg-white p-5 shadow-sm sm:p-6">
					<h2 className="mb-4 font-display text-lg font-semibold text-[#2B2129]">
						{new Date(`${selected}T00:00:00`).toLocaleDateString("en-IN", {
							weekday: "long",
							day: "numeric",
							month: "long",
							year: "numeric",
						})}
					</h2>

					{selectedEntries.length === 0 ? (
						<p className="text-sm text-gray-500">
							Nothing booked — this date is free.
						</p>
					) : (
						<ul className="space-y-3">
							{selectedEntries.map((entry) => (
								<li
									key={entry.bookingId}
									className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-cream-100 p-3"
								>
									<div className="min-w-0">
										<p className="flex items-center gap-2 font-semibold text-[#2B2129]">
											<span className="truncate">{entry.serviceName}</span>
											{entry.isOnlineBooking && (
												<Globe
													className="h-3.5 w-3.5 shrink-0 text-brand-400"
													aria-label="Booked online"
												/>
											)}
										</p>
										<p className="truncate text-sm text-gray-500">
											{entry.customerName} · {entry.eventName}
										</p>
									</div>
									<div className="flex items-center gap-3">
										<span
											className={`rounded-lg px-2 py-1 text-xs font-bold ${statusTone(
												entry.status,
											)}`}
										>
											{entry.status}
										</span>
										<span className="text-sm font-bold text-[#2B2129]">
											{currency.format(Number(entry.totalCost))}
										</span>
									</div>
								</li>
							))}
						</ul>
					)}
				</section>
			)}
		</div>
	);
};

export default CalendarPage;
