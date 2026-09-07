import React, {useCallback, useEffect, useState} from "react";
import {toast} from "sonner";
import {CalendarCheck, ChevronLeft, ChevronRight, Save} from "lucide-react";

import {operationsService} from "@/services/api/eventManagementServer";
import {
	AttendanceStatus,
	iAttendanceDay,
	iAttendanceMonth,
} from "@/customTypes/appDataTypes/operationsTypes";
import {httpStatusCodes} from "@/customTypes/NetworkTypes";
import PageHeader from "../common/PageHeader";
import Button from "../ui/Button";
import {Reveal} from "@/components/motion";

const toIso = (date: Date): string => {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
};

const shiftDay = (iso: string, days: number): string => {
	const date = new Date(`${iso}T00:00:00`);
	date.setDate(date.getDate() + days);
	return toIso(date);
};

const STATUS_OPTIONS: {value: AttendanceStatus; label: string; tone: string}[] =
	[
		{value: "present", label: "Present", tone: "bg-emerald-600 text-white"},
		{value: "half", label: "Half day", tone: "bg-amber-500 text-white"},
		{value: "absent", label: "Absent", tone: "bg-rose-600 text-white"},
	];

/**
 * Mark who turned up, one day at a time, and read the month's totals for
 * wages. Marks are saved in one go so a slow connection on site does not
 * turn ten taps into ten spinners.
 */
const AttendancePage: React.FC = () => {
	const [date, setDate] = useState(toIso(new Date()));
	const [day, setDay] = useState<iAttendanceDay | null>(null);
	const [draft, setDraft] = useState<Record<string, AttendanceStatus | null>>(
		{},
	);
	const [month, setMonth] = useState<iAttendanceMonth | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);

	const load = useCallback(async () => {
		setIsLoading(true);
		const monthStart = `${date.slice(0, 7)}-01`;
		const monthEndDate = new Date(`${monthStart}T00:00:00`);
		monthEndDate.setMonth(monthEndDate.getMonth() + 1);
		monthEndDate.setDate(0);

		const [dayResponse, monthResponse] = await Promise.all([
			operationsService.getAttendanceDay(date),
			operationsService.getAttendanceMonth({
				fromDate: monthStart,
				toDate: toIso(monthEndDate),
			}),
		]);

		if (
			dayResponse?.httpStatusCode === httpStatusCodes.SUCCESS_OK &&
			dayResponse.data?.data
		) {
			const loaded = dayResponse.data.data;
			setDay(loaded);
			setDraft(
				Object.fromEntries(
					loaded.employees.map((employee) => {
						return [employee.employeeId, employee.status];
					}),
				),
			);
		} else {
			toast.error(
				dayResponse?.data?.error?.message ?? "Couldn't load attendance",
			);
		}

		if (
			monthResponse?.httpStatusCode === httpStatusCodes.SUCCESS_OK &&
			monthResponse.data?.data
		) {
			setMonth(monthResponse.data.data);
		}
		setIsLoading(false);
	}, [date]);

	useEffect(() => {
		void load();
	}, [load]);

	const isDirty =
		day?.employees.some((employee) => {
			return draft[employee.employeeId] !== employee.status;
		}) ?? false;

	const save = async () => {
		const marks = Object.entries(draft)
			.filter((entry): entry is [string, AttendanceStatus] => {
				return entry[1] !== null;
			})
			.map(([employeeId, status]) => {
				return {employeeId, date, status};
			});

		if (marks.length === 0) {
			toast.error("Mark at least one person first");
			return;
		}

		setIsSaving(true);
		const response = await operationsService.markAttendance(marks);
		setIsSaving(false);
		if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
			toast.success("Attendance saved");
			void load();
			return;
		}
		toast.error(response?.data?.error?.message ?? "Couldn't save attendance");
	};

	const markAll = (status: AttendanceStatus) => {
		if (!day) return;
		setDraft(
			Object.fromEntries(
				day.employees.map((employee) => {
					return [employee.employeeId, status];
				}),
			),
		);
	};

	const dateLabel = new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
		weekday: "long",
		day: "numeric",
		month: "long",
	});

	return (
		<div className="space-y-8">
			<PageHeader
				eyebrow="Team"
				title="Attendance"
				subtitle="Who came in today, and the month's totals for wages."
				actions={
					<Button
						icon={<Save className="h-4 w-4" />}
						onClick={() => void save()}
						isLoading={isSaving}
						disabled={!isDirty || isLoading}
					>
						Save
					</Button>
				}
			/>

			<Reveal>
				<div className="rounded-3xl border border-ink-200/70 bg-white shadow-sm">
					<div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 p-4 sm:p-5">
						<div className="flex items-center gap-2">
							<button
								type="button"
								aria-label="Previous day"
								onClick={() => setDate((d) => shiftDay(d, -1))}
								className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 text-ink-600 hover:bg-ink-50"
							>
								<ChevronLeft className="h-4 w-4" />
							</button>
							<input
								type="date"
								value={date}
								max={toIso(new Date())}
								onChange={(e) => {
									if (e.target.value) setDate(e.target.value);
								}}
								className="h-9 rounded-lg border border-ink-200 px-3 text-sm outline-none focus:border-brand-600"
							/>
							<button
								type="button"
								aria-label="Next day"
								onClick={() => setDate((d) => shiftDay(d, 1))}
								disabled={date >= toIso(new Date())}
								className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 text-ink-600 hover:bg-ink-50 disabled:opacity-40"
							>
								<ChevronRight className="h-4 w-4" />
							</button>
						</div>
						<p className="text-sm font-semibold text-ink-700">{dateLabel}</p>
						<Button
							variant="outline"
							size="sm"
							onClick={() => markAll("present")}
							disabled={isLoading}
						>
							All present
						</Button>
					</div>

					{isLoading && !day && (
						<div className="space-y-3 p-5">
							{[0, 1, 2].map((i) => (
								<div key={i} className="skeleton h-14" />
							))}
						</div>
					)}

					{day && day.employees.length === 0 && (
						<p className="p-10 text-center text-sm text-ink-500">
							No employees yet. Add your team under Employees first.
						</p>
					)}

					{day && day.employees.length > 0 && (
						<ul className="divide-y divide-ink-100">
							{day.employees.map((employee) => {
								const current = draft[employee.employeeId] ?? null;
								return (
									<li
										key={employee.employeeId}
										className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-5"
									>
										<div className="min-w-0">
											<p className="font-semibold text-ink-900">
												{employee.name}
											</p>
											<p className="text-xs text-ink-500">
												{employee.designation}
											</p>
										</div>
										<div className="flex gap-1.5">
											{STATUS_OPTIONS.map((option) => {
												const isSelected = current === option.value;
												return (
													<button
														key={option.value}
														type="button"
														onClick={() =>
															setDraft((d) => {
																return {
																	...d,
																	[employee.employeeId]: isSelected
																		? null
																		: option.value,
																};
															})
														}
														className={`h-9 rounded-full px-3 text-xs font-semibold transition-colors ${
															isSelected
																? option.tone
																: "border border-ink-200 text-ink-600 hover:bg-ink-50"
														}`}
													>
														{option.label}
													</button>
												);
											})}
										</div>
									</li>
								);
							})}
						</ul>
					)}
				</div>
			</Reveal>

			{month && month.employees.length > 0 && (
				<Reveal>
					<div className="rounded-3xl border border-ink-200/70 bg-white shadow-sm">
						<div className="flex items-center gap-2 border-b border-ink-100 p-4 sm:p-5">
							<CalendarCheck className="h-5 w-5 text-brand-600" />
							<h2 className="font-display text-lg text-ink-900">
								{new Date(`${month.from}T00:00:00`).toLocaleDateString(
									"en-IN",
									{month: "long", year: "numeric"},
								)}
							</h2>
						</div>
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-ink-400">
										<th className="px-5 py-3">Employee</th>
										<th className="px-3 py-3 text-right">Present</th>
										<th className="px-3 py-3 text-right">Half</th>
										<th className="px-3 py-3 text-right">Absent</th>
										<th className="px-5 py-3 text-right">Payable days</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-ink-100">
									{month.employees.map((employee) => (
										<tr key={employee.employeeId}>
											<td className="px-5 py-3">
												<p className="font-semibold text-ink-900">
													{employee.name}
												</p>
												<p className="text-xs text-ink-500">
													{employee.designation}
												</p>
											</td>
											<td className="px-3 py-3 text-right text-emerald-700">
												{employee.present}
											</td>
											<td className="px-3 py-3 text-right text-amber-700">
												{employee.half}
											</td>
											<td className="px-3 py-3 text-right text-rose-700">
												{employee.absent}
											</td>
											<td className="px-5 py-3 text-right font-display text-lg text-ink-900">
												{employee.payableDays}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</Reveal>
			)}
		</div>
	);
};

export default AttendancePage;
