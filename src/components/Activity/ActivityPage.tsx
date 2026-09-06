import React, {useCallback, useEffect, useState} from "react";
import {History, Loader2, RefreshCw} from "lucide-react";

import PageHeader from "../common/PageHeader";
import Pagination from "../common/Pagination";
import Button from "../ui/Button";
import {insightService} from "@/services/api/eventManagementServer";
import {iActivityEntry} from "@/services/api/eventManagementServer/InsightService";
import {httpStatusCodes, iPagination} from "@/customTypes/NetworkTypes";

/**
 * Who changed what.
 *
 * Nothing recorded this: a booking's price or date could change and there was
 * no way to find out who did it. That is survivable while one person has a
 * login and becomes a problem the moment a second one does.
 *
 * Only actions are recorded, never payloads - an entity and an actor answer
 * "who touched this" without copying customer phone numbers into a second
 * table.
 */

/** Plain-English labels; the stored values are dotted machine names. */
const ACTION_LABELS: Record<string, string> = {
	"booking.created": "created a booking",
	"booking.updated": "edited a booking",
	"booking.deleted": "deleted a booking",
	"booking.approved": "approved a request",
	"booking.rejected": "rejected a request",
	"payment.recorded": "recorded a payment",
	"payment.deleted": "removed a payment",
	"service.updated": "edited a service",
	"service.deleted": "deleted a service",
	"employee.updated": "edited an employee",
	"employee.deleted": "removed an employee",
	"photo.deleted": "deleted a photo",
};

/** Money and deletions are the entries worth spotting in a long list. */
function toneFor(action: string): string {
	if (action.startsWith("payment.")) {
		return "bg-emerald-50 text-emerald-700";
	}

	if (action.endsWith(".deleted") || action.endsWith(".rejected")) {
		return "bg-rose-50 text-rose-700";
	}

	return "bg-gray-100 text-ink-600";
}

function formatWhen(iso: string): string {
	const date = new Date(iso);

	return date.toLocaleString("en-IN", {
		day: "numeric",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	});
}

const ActivityPage: React.FC = () => {
	const [entries, setEntries] = useState<iActivityEntry[]>([]);
	const [pagination, setPagination] = useState<iPagination | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [hasFailed, setHasFailed] = useState(false);

	const load = useCallback(async (page: number): Promise<void> => {
		setIsLoading(true);
		setHasFailed(false);

		try {
			const response = await insightService.getActivity({page, limit: 25});

			if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
				setEntries(response.data?.data?.items ?? []);
				setPagination(response.data?.data?.pagination ?? null);
				return;
			}

			setHasFailed(true);
		} catch {
			setHasFailed(true);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		void load(1);
	}, [load]);

	return (
		<div className="space-y-6 animate-in fade-in duration-500">
			<PageHeader
				title="Activity"
				subtitle="Changes to bookings and payments, and who made them"
			/>

			{hasFailed ? (
				<div className="glass-card p-12 text-center">
					<p className="text-ink-600">
						The activity trail could not be loaded.
					</p>
					<p className="mx-auto mt-2 max-w-md text-sm text-ink-400">
						If this service was deployed recently, the trail starts once the
						database migration has been applied.
					</p>
					<Button
						variant="secondary"
						className="mt-4"
						onClick={() => {
							void load(1);
						}}
					>
						<RefreshCw className="mr-2 h-4 w-4" />
						Try again
					</Button>
				</div>
			) : isLoading && entries.length === 0 ? (
				<div className="glass-card flex items-center justify-center gap-3 p-16 text-ink-500">
					<Loader2 className="h-5 w-5 animate-spin" />
					Loading activity…
				</div>
			) : entries.length === 0 ? (
				<div className="glass-card p-12 text-center">
					<History className="mx-auto mb-3 h-10 w-10 text-brand-200" />
					<p className="font-semibold text-ink-900">Nothing recorded yet</p>
					<p className="mx-auto mt-1 max-w-sm text-sm text-ink-500">
						Edits to bookings and payment entries will appear here as they
						happen.
					</p>
				</div>
			) : (
				<div className="glass-card p-4 sm:p-6">
					<ol className="divide-y divide-brand-50">
						{entries.map((entry) => (
							<li
								key={entry.id}
								className="flex flex-wrap items-baseline gap-x-2 gap-y-1 py-3"
							>
								<span
									className={`rounded-full px-2.5 py-1 text-xs font-semibold ${toneFor(
										entry.action,
									)}`}
								>
									{ACTION_LABELS[entry.action] ?? entry.action}
								</span>

								<span className="font-semibold text-ink-900">
									{entry.actorName ?? "Someone"}
								</span>

								{entry.summary && (
									<span className="text-sm text-ink-500">
										— {entry.summary}
									</span>
								)}

								<span className="ml-auto text-xs tabular-nums text-ink-400">
									{formatWhen(entry.createdAt)}
								</span>
							</li>
						))}
					</ol>

					{pagination && (
						<Pagination
							page={pagination.page}
							totalPages={pagination.totalPages}
							total={pagination.total}
							limit={pagination.limit}
							isLoading={isLoading}
							onPageChange={(nextPage) => {
								void load(nextPage);
							}}
						/>
					)}
				</div>
			)}
		</div>
	);
};

export default ActivityPage;
