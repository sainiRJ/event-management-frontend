import React, {useCallback, useEffect, useState} from "react";
import {toast} from "sonner";
import {Check, Clock, EyeOff, MessageSquareQuote, Star, X} from "lucide-react";

import {operationsService} from "@/services/api/eventManagementServer";
import {iReview} from "@/customTypes/appDataTypes/operationsTypes";
import {httpStatusCodes, iPagination} from "@/customTypes/NetworkTypes";
import PageHeader from "@/components/common/PageHeader";
import Pagination from "@/components/common/Pagination";
import Button from "@/components/ui/Button";
import {Stagger, StaggerItem} from "@/components/motion";

type Filter = "all" | "pending" | "approved" | "rejected";

const FILTERS: {key: Filter; label: string}[] = [
	{key: "pending", label: "Waiting for approval"},
	{key: "approved", label: "On the site"},
	{key: "rejected", label: "Hidden"},
	{key: "all", label: "All"},
];

function Stars({value}: {value: number}): React.ReactElement {
	return (
		<span className="inline-flex gap-0.5" aria-label={`${value} out of 5`}>
			{[1, 2, 3, 4, 5].map((n) => (
				<Star
					key={n}
					className={`h-4 w-4 ${
						n <= value ? "fill-gold-500 text-gold-500" : "text-ink-200"
					}`}
				/>
			))}
		</span>
	);
}

/**
 * Reviews inbox. A review reaches the customer site only after it is
 * approved here; unanswered invites show too, so the vendor can see who
 * was asked and hasn't replied.
 */
const ReviewsPage: React.FC = () => {
	const [reviews, setReviews] = useState<iReview[]>([]);
	const [pagination, setPagination] = useState<iPagination | null>(null);
	const [filter, setFilter] = useState<Filter>("pending");
	const [isLoading, setIsLoading] = useState(true);
	const [busyId, setBusyId] = useState<string | null>(null);

	const load = useCallback(
		async (page = 1) => {
			setIsLoading(true);
			const response = await operationsService.listReviews({
				page,
				limit: 20,
				status: filter === "all" ? undefined : filter,
			});
			if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
				setReviews(response.data?.data?.items ?? []);
				setPagination(response.data?.data?.pagination ?? null);
			} else {
				toast.error("Couldn't load reviews");
			}
			setIsLoading(false);
		},
		[filter],
	);

	useEffect(() => {
		void load();
	}, [load]);

	const setStatus = async (
		review: iReview,
		status: "approved" | "rejected",
	) => {
		setBusyId(review.id);
		const response = await operationsService.setReviewStatus(review.id, status);
		setBusyId(null);
		if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
			toast.success(
				status === "approved"
					? `${review.customerName}'s review is now on the site`
					: `${review.customerName}'s review is hidden`,
			);
			void load(pagination?.page ?? 1);
			return;
		}
		toast.error(
			response?.data?.error?.message ?? "Couldn't update that review",
		);
	};

	return (
		<div>
			<PageHeader
				eyebrow="Your business"
				title="Reviews"
				subtitle="Ask for a review from any confirmed booking. What customers write appears on the site once you approve it."
			/>

			<div className="mb-6 flex gap-2 overflow-x-auto no-scrollbar">
				{FILTERS.map((f) => (
					<button
						key={f.key}
						onClick={() => setFilter(f.key)}
						className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
							filter === f.key
								? "border-brand-600 bg-brand-600 text-white"
								: "border-ink-200 bg-white text-ink-700 hover:border-brand-300"
						}`}
					>
						{f.label}
					</button>
				))}
			</div>

			{isLoading && reviews.length === 0 && (
				<div className="space-y-3">
					{[0, 1, 2].map((i) => (
						<div key={i} className="skeleton h-28" />
					))}
				</div>
			)}

			{!isLoading && reviews.length === 0 && (
				<div className="glass-card py-16 text-center">
					<MessageSquareQuote className="mx-auto mb-3 h-10 w-10 text-ink-300" />
					<h2 className="font-display text-lg text-ink-900">
						Nothing here yet
					</h2>
					<p className="mx-auto mt-1 max-w-sm text-sm text-ink-500">
						Open a confirmed booking and press &quot;Ask for a review&quot;. The
						customer gets a one-time link by email, and you can send it on
						WhatsApp too.
					</p>
				</div>
			)}

			{reviews.length > 0 && (
				<Stagger as="ul" className="space-y-3">
					{reviews.map((review) => (
						<StaggerItem key={review.id} as="li" className="glass-card p-5">
							<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
								<div className="min-w-0 flex-1">
									<div className="flex flex-wrap items-center gap-2">
										<p className="font-semibold text-ink-900">
											{review.customerName}
										</p>
										<span className="text-xs text-ink-400">
											{review.serviceName} ·{" "}
											{new Date(review.eventDate).toLocaleDateString("en-IN", {
												day: "numeric",
												month: "short",
												year: "numeric",
											})}
										</span>
										{review.isSubmitted ? (
											<span
												className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
													review.status === "approved"
														? "bg-emerald-50 text-emerald-700"
														: review.status === "rejected"
														? "bg-ink-100 text-ink-500"
														: "bg-amber-50 text-amber-700"
												}`}
											>
												{review.status === "approved"
													? "On the site"
													: review.status === "rejected"
													? "Hidden"
													: "Waiting for you"}
											</span>
										) : (
											<span className="inline-flex items-center gap-1 rounded-full bg-ink-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-ink-500">
												<Clock className="h-3 w-3" />
												Link sent, no reply yet
											</span>
										)}
									</div>

									{review.isSubmitted && (
										<>
											<div className="mt-2">
												<Stars value={review.rating ?? 0} />
											</div>
											<p className="mt-2 text-sm leading-relaxed text-ink-700">
												{review.text}
											</p>
											{review.photoUrl && (
												<img
													src={review.photoUrl}
													alt=""
													className="mt-3 h-28 w-40 rounded-xl object-cover"
													loading="lazy"
												/>
											)}
										</>
									)}
								</div>

								{review.isSubmitted && (
									<div className="flex shrink-0 gap-2">
										{review.status !== "approved" && (
											<Button
												size="sm"
												icon={<Check className="h-4 w-4" />}
												onClick={() => setStatus(review, "approved")}
												isLoading={busyId === review.id}
												disabled={busyId !== null}
											>
												Show on site
											</Button>
										)}
										{review.status !== "rejected" && (
											<Button
												size="sm"
												variant="ghost"
												icon={
													review.status === "approved" ? (
														<EyeOff className="h-4 w-4" />
													) : (
														<X className="h-4 w-4" />
													)
												}
												onClick={() => setStatus(review, "rejected")}
												isLoading={busyId === review.id}
												disabled={busyId !== null}
											>
												{review.status === "approved" ? "Hide" : "Don't show"}
											</Button>
										)}
									</div>
								)}
							</div>
						</StaggerItem>
					))}
				</Stagger>
			)}

			{pagination && (
				<Pagination
					page={pagination.page}
					totalPages={pagination.totalPages}
					total={pagination.total}
					limit={pagination.limit}
					isLoading={isLoading}
					onPageChange={(next) => void load(next)}
				/>
			)}
		</div>
	);
};

export default ReviewsPage;
