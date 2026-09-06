import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {AlertTriangle, IndianRupee, Loader2, TrendingUp} from "lucide-react";

import {insightService} from "@/services/api/eventManagementServer";
import {iMoneySummary} from "@/services/api/eventManagementServer/InsightService";
import {httpStatusCodes} from "@/customTypes/NetworkTypes";
import {formatCurrency} from "@/utils/currencyUtils";

/**
 * Money, on the screen the vendor opens every morning.
 *
 * The dashboard showed booking counts, the next event and the weather — and
 * not one figure about money. "How much is owed to me?" was answerable only
 * by opening Finance and reading a chart, so in practice nobody asked it
 * until a customer had already left without paying.
 *
 * Defaults to the current calendar month, which is the window the question is
 * really about.
 */
const MoneyCard: React.FC = () => {
	const [summary, setSummary] = useState<iMoneySummary | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [hasFailed, setHasFailed] = useState(false);

	useEffect(() => {
		let isStale = false;

		const load = async (): Promise<void> => {
			try {
				const response = await insightService.getMoneySummary();

				if (isStale) {
					return;
				}

				if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
					setSummary(response.data?.data ?? null);
					return;
				}

				setHasFailed(true);
			} catch {
				if (!isStale) {
					setHasFailed(true);
				}
			} finally {
				if (!isStale) {
					setIsLoading(false);
				}
			}
		};

		void load();

		return () => {
			isStale = true;
		};
	}, []);

	if (isLoading) {
		return (
			<div className="glass-card flex items-center justify-center gap-3 p-8 text-ink-500">
				<Loader2 className="h-5 w-5 animate-spin" />
				Working out this month&apos;s figures…
			</div>
		);
	}

	if (hasFailed || !summary) {
		return (
			<div className="glass-card p-8 text-sm text-ink-500">
				This month&apos;s figures could not be loaded. The{" "}
				<Link to="/finance" className="font-semibold text-brand-600">
					Finance page
				</Link>{" "}
				still has the full breakdown.
			</div>
		);
	}

	const hasOverdue = summary.overdueCount > 0;

	return (
		<div className="glass-card p-8">
			<div className="mb-6 flex items-center justify-between">
				<h3 className="flex items-center text-lg font-semibold text-brand-600">
					<span className="mr-2 h-2 w-2 rounded-full bg-brand-600" />
					This month
				</h3>

				<Link
					to="/finance"
					className="text-sm font-semibold text-ink-400 transition-colors hover:text-brand-600"
				>
					Full breakdown
				</Link>
			</div>

			<div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
				<div className="rounded-2xl bg-brand-50/50 p-5">
					<p className="text-xs font-medium uppercase tracking-wide text-ink-400">
						Booked
					</p>
					<p className="mt-1 flex items-center text-2xl font-bold text-ink-900">
						<IndianRupee className="mr-0.5 h-5 w-5" />
						{formatCurrency(Number(summary.totalBooked)).replace("₹", "")}
					</p>
					<p className="mt-1 text-xs text-ink-400">
						{summary.upcomingCount} still to come
					</p>
				</div>

				<div className="rounded-2xl bg-emerald-50/60 p-5">
					<p className="text-xs font-medium uppercase tracking-wide text-ink-400">
						Received
					</p>
					<p className="mt-1 flex items-center text-2xl font-bold text-emerald-700">
						<IndianRupee className="mr-0.5 h-5 w-5" />
						{formatCurrency(Number(summary.totalReceived)).replace("₹", "")}
					</p>
					<p className="mt-1 flex items-center gap-1 text-xs text-ink-400">
						<TrendingUp className="h-3 w-3" />
						From the payment ledger
					</p>
				</div>

				<div
					className={`rounded-2xl p-5 ${
						hasOverdue ? "bg-rose-50/70" : "bg-amber-50/60"
					}`}
				>
					<p className="text-xs font-medium uppercase tracking-wide text-ink-400">
						Outstanding
					</p>
					<p
						className={`mt-1 flex items-center text-2xl font-bold ${
							hasOverdue ? "text-rose-700" : "text-amber-700"
						}`}
					>
						<IndianRupee className="mr-0.5 h-5 w-5" />
						{formatCurrency(Number(summary.totalOutstanding)).replace("₹", "")}
					</p>

					{/*
						Money owed on an event that has already happened is the
						number worth acting on, so it is called out separately
						rather than buried in the total.
					*/}
					{hasOverdue ? (
						<p className="mt-1 flex items-center gap-1 text-xs font-semibold text-rose-600">
							<AlertTriangle className="h-3 w-3" />
							{formatCurrency(Number(summary.overdueAmount))} overdue across{" "}
							{summary.overdueCount} past{" "}
							{summary.overdueCount === 1 ? "event" : "events"}
						</p>
					) : (
						<p className="mt-1 text-xs text-ink-400">
							Nothing overdue — all past events are settled
						</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default MoneyCard;
