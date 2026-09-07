import React, {useCallback, useEffect, useState} from "react";
import {toast} from "sonner";
import {
	CalendarDays,
	Check,
	Inbox,
	MapPin,
	Phone,
	RefreshCw,
	X,
	MessageCircle,
} from "lucide-react";

import {operationsService} from "@/services/api/eventManagementServer";
import {iBookingRequest} from "@/customTypes/appDataTypes/operationsTypes";
import {httpStatusCodes, iPagination} from "@/customTypes/NetworkTypes";
import PageHeader from "@/components/common/PageHeader";
import {
	bookingConfirmedMessage,
	bookingDeclinedMessage,
	requestReceivedMessage,
	whatsappLink,
} from "@/utils/whatsapp";
import StatusBadge from "@/components/common/StatusBadge";
import Button from "@/components/ui/Button";
import Pagination from "@/components/common/Pagination";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import AttachmentStrip from "@/components/Booking/AttachmentStrip";

const currency = new Intl.NumberFormat("en-IN", {
	style: "currency",
	currency: "INR",
	maximumFractionDigits: 2,
});

function formatDate(value: string | null): string {
	if (!value) return "—";

	return new Date(value).toLocaleDateString("en-IN", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}

/**
 * Requests that arrived from the public website or the chat assistant.
 *
 * They land as bookings with no price and a pending status. Until this screen
 * existed they simply accumulated in the database with nothing to show them,
 * so a customer who asked to book was never answered.
 */
const BookingRequestsPage: React.FC = () => {
	const [requests, setRequests] = useState<iBookingRequest[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [shouldShowHandled, setShouldShowHandled] = useState(false);

	const [approving, setApproving] = useState<iBookingRequest | null>(null);
	const [totalCost, setTotalCost] = useState("");
	const [advancePayment, setAdvancePayment] = useState("0");
	const [formError, setFormError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [rejectingId, setRejectingId] = useState<string | null>(null);
	const [selectedIds, setSelectedIds] = useState<string[]>([]);
	const [isBulkRejecting, setIsBulkRejecting] = useState(false);
	const [pagination, setPagination] = useState<iPagination | null>(null);

	const load = useCallback(
		async (page = 1) => {
			setIsLoading(true);

			const response = await operationsService.listBookingRequests({
				includeHandled: shouldShowHandled,
				page,
				limit: 25,
			});

			if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
				setRequests(response.data?.data?.items ?? []);
				setPagination(response.data?.data?.pagination ?? null);
			} else {
				toast.error("Couldn't load booking requests");
			}

			setIsLoading(false);
		},
		[shouldShowHandled],
	);

	useEffect(() => {
		load();
	}, [load]);

	const openApprove = (request: iBookingRequest) => {
		setApproving(request);
		setTotalCost("");
		setAdvancePayment("0");
		setFormError(null);
	};

	const confirmApprove = async () => {
		if (!approving) return;

		const cost = Number(totalCost);
		const advance = Number(advancePayment || 0);

		if (!Number.isFinite(cost) || cost <= 0) {
			setFormError("Enter the agreed price for this booking");
			return;
		}

		if (advance > cost) {
			setFormError("Advance cannot be more than the total price");
			return;
		}

		setIsSaving(true);

		const response = await operationsService.approveBookingRequest(
			approving.id,
			{totalCost: cost, advancePayment: advance},
		);

		setIsSaving(false);

		if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
			const confirmed = approving;
			toast.success(`Booking confirmed for ${confirmed.customerName}`, {
				// The customer also gets an email automatically; WhatsApp is
				// the channel they actually read, and this is one tap.
				action: confirmed.phoneNumber
					? {
							label: "Send on WhatsApp",
							onClick: () => {
								window.open(
									whatsappLink(
										confirmed.phoneNumber!,
										bookingConfirmedMessage({
											customerName: confirmed.customerName,
											serviceName: confirmed.serviceName,
											eventDate: confirmed.eventDate,
											totalCost: cost,
											advancePayment: advance,
										}),
									),
									"_blank",
									"noopener",
								);
							},
					  }
					: undefined,
				duration: 12000,
			});
			setApproving(null);
			load();
			return;
		}

		setFormError(
			response?.data?.error?.message ??
				"Couldn't confirm this booking. Please try again.",
		);
	};

	const reject = async (request: iBookingRequest) => {
		if (rejectingId) return;
		setRejectingId(request.id);
		const response = await operationsService
			.rejectBookingRequest(request.id)
			.finally(() => setRejectingId(null));

		if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
			toast.success(`Request from ${request.customerName} declined`);
			load();
			return;
		}

		toast.error("Couldn't decline this request");
	};

	/**
	 * Decline several at once.
	 *
	 * Spam and duplicate submissions arrive in runs, and clearing them one
	 * card at a time is the kind of chore that stops people triaging the
	 * inbox at all. Only rejection is batched: approving sets a price, which
	 * is a per-booking decision and must stay one.
	 */
	const rejectSelected = async (): Promise<void> => {
		const chosen = pendingRequests.filter((request) => {
			return selectedIds.includes(request.id);
		});

		if (chosen.length === 0) {
			return;
		}

		setIsBulkRejecting(true);

		const outcomes = await Promise.all(
			chosen.map(async (request) => {
				const response = await operationsService.rejectBookingRequest(
					request.id,
				);
				return response?.httpStatusCode === httpStatusCodes.SUCCESS_OK;
			}),
		);

		setIsBulkRejecting(false);

		const declined = outcomes.filter(Boolean).length;

		if (declined > 0) {
			toast.success(`${declined} request${declined === 1 ? "" : "s"} declined`);
		}

		if (declined < chosen.length) {
			toast.error(
				`${chosen.length - declined} could not be declined. Try those again.`,
			);
		}

		setSelectedIds([]);
		load();
	};

	const toggleSelected = (id: string): void => {
		setSelectedIds((current) => {
			return current.includes(id)
				? current.filter((value) => {
						return value !== id;
				  })
				: [...current, id];
		});
	};

	const pendingRequests = requests.filter((request) => {
		return request.status?.toLowerCase() === "pending";
	});

	return (
		<div>
			<PageHeader
				title="Booking Requests"
				subtitle="Enquiries that came in from your website and the chat assistant"
				actions={
					<>
						<Button
							variant="secondary"
							onClick={() => setShouldShowHandled((v) => !v)}
						>
							{shouldShowHandled ? "Show only pending" : "Show all"}
						</Button>
						<Button
							variant="secondary"
							onClick={() => {
								void load(pagination?.page ?? 1);
							}}
							disabled={isLoading}
						>
							<RefreshCw
								className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
							/>
							Refresh
						</Button>
					</>
				}
			/>

			{isLoading && requests.length === 0 && (
				<p className="py-12 text-center text-sm text-ink-500">
					Loading requests…
				</p>
			)}

			{!isLoading && requests.length === 0 && (
				<div className="rounded-3xl border border-ink-200/70 bg-white py-16 text-center">
					<Inbox className="mx-auto mb-3 h-10 w-10 text-brand-300" />
					<h2 className="font-display text-lg font-semibold text-ink-900">
						Nothing waiting
					</h2>
					<p className="mt-1 text-sm text-ink-500">
						New requests from your website and chat will appear here.
					</p>
				</div>
			)}

			{selectedIds.length > 0 && (
				<div className="mb-4 flex flex-col gap-3 rounded-2xl border border-brand-200 bg-brand-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-sm font-bold text-brand-700">
						{selectedIds.length} selected
					</p>

					<div className="flex gap-2">
						<Button
							variant="secondary"
							className="flex-1 sm:flex-none"
							onClick={() => setSelectedIds([])}
						>
							Clear
						</Button>
						<Button
							variant="danger"
							className="flex-1 sm:flex-none"
							onClick={rejectSelected}
							disabled={isBulkRejecting}
						>
							{isBulkRejecting ? "Declining…" : `Decline ${selectedIds.length}`}
						</Button>
					</div>
				</div>
			)}

			{/* Cards rather than a table: each request is a decision, and this
			    reads on a phone without horizontal scrolling. */}
			<div className="grid gap-4 lg:grid-cols-2">
				{requests.map((request) => {
					const isPending = request.status?.toLowerCase() === "pending";

					return (
						<article
							key={request.id}
							className="rounded-3xl border border-ink-200/70 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
						>
							<div className="mb-4 flex flex-wrap items-start justify-between gap-3">
								<div className="flex min-w-0 items-start gap-3">
									{/* Only pending requests can be batched - a handled one
									    has nothing left to decide. */}
									{isPending && (
										<input
											type="checkbox"
											checked={selectedIds.includes(request.id)}
											onChange={() => toggleSelected(request.id)}
											aria-label={`Select the request from ${request.customerName}`}
											className="mt-1.5 h-4 w-4 shrink-0 cursor-pointer accent-brand-600"
										/>
									)}

									<div className="min-w-0">
										<h2 className="truncate font-display text-lg font-semibold text-ink-900">
											{request.customerName}
										</h2>
										<p className="mt-0.5 text-sm text-ink-500">
											{request.serviceName} · {request.eventName}
										</p>
									</div>
								</div>
								<div className="flex items-center gap-2">
									{request.source && (
										<span
											className="rounded-full bg-ink-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-500"
											title="Where this request came from"
										>
											{request.source}
										</span>
									)}
									<StatusBadge status={request.status} />
								</div>
							</div>

							<dl className="grid gap-2 text-sm text-ink-600">
								<div className="flex items-center gap-2">
									<CalendarDays className="h-4 w-4 shrink-0 text-brand-400" />
									<dt className="sr-only">Event date</dt>
									<dd>{formatDate(request.eventDate)}</dd>
								</div>
								<div className="flex items-center gap-2">
									<MapPin className="h-4 w-4 shrink-0 text-brand-400" />
									<dt className="sr-only">Location</dt>
									<dd className="truncate">{request.location}</dd>
								</div>
								<div className="flex items-center gap-2">
									<Phone className="h-4 w-4 shrink-0 text-brand-400" />
									<dt className="sr-only">Phone</dt>
									<dd>
										{request.phoneNumber ? (
											<span className="inline-flex flex-wrap items-center gap-2">
												<a
													className="hover:text-brand-600"
													href={`tel:${request.phoneNumber}`}
												>
													{request.phoneNumber}
												</a>
												<a
													href={whatsappLink(
														request.phoneNumber,
														request.status?.toLowerCase() === "booked"
															? bookingConfirmedMessage({
																	customerName: request.customerName,
																	serviceName: request.serviceName,
																	eventDate: request.eventDate,
																	totalCost: 0,
																	advancePayment: 0,
															  })
															: request.status?.toLowerCase() === "cancelled"
															? bookingDeclinedMessage(request)
															: requestReceivedMessage(request),
													)}
													target="_blank"
													rel="noopener noreferrer"
													className="inline-flex items-center gap-1 rounded-full bg-[#25D366]/10 px-2.5 py-0.5 text-xs font-semibold text-[#128C7E] hover:bg-[#25D366]/20"
													title="Open WhatsApp with a ready message"
												>
													<MessageCircle className="h-3.5 w-3.5" />
													WhatsApp
												</a>
											</span>
										) : (
											"—"
										)}
									</dd>
								</div>
							</dl>

							{request.notes && (
								<p className="mt-4 rounded-2xl bg-cream-100 p-3 text-sm text-ink-600">
									{request.notes}
								</p>
							)}

							<div className="mt-3">
								<AttachmentStrip bookingId={request.id} isCompact />
							</div>

							<p className="mt-4 text-xs text-ink-400">
								Requested {formatDate(request.requestedAt)}
							</p>

							{isPending && (
								<div className="mt-5 flex flex-col gap-2 sm:flex-row">
									<Button
										className="w-full sm:w-auto"
										onClick={() => openApprove(request)}
									>
										<Check className="mr-2 h-4 w-4" />
										Confirm &amp; set price
									</Button>
									<Button
										variant="secondary"
										className="w-full sm:w-auto"
										onClick={() => reject(request)}
										isLoading={rejectingId === request.id}
										disabled={rejectingId !== null}
									>
										<X className="mr-2 h-4 w-4" />
										Decline
									</Button>
								</div>
							)}
						</article>
					);
				})}
			</div>

			<Modal
				isOpen={Boolean(approving)}
				onClose={() => setApproving(null)}
				title="Confirm booking"
			>
				{approving && (
					<div className="space-y-4">
						<p className="text-sm text-ink-600">
							{approving.customerName} — {approving.serviceName} on{" "}
							{formatDate(approving.eventDate)}
						</p>

						<Input
							label="Agreed price"
							type="number"
							min="0"
							value={totalCost}
							onChange={(e) => setTotalCost(e.target.value)}
							placeholder="e.g. 15000"
						/>

						<Input
							label="Advance received (optional)"
							type="number"
							min="0"
							value={advancePayment}
							onChange={(e) => setAdvancePayment(e.target.value)}
						/>

						{totalCost && Number(totalCost) > 0 && (
							<p className="text-sm text-ink-500">
								Outstanding after advance:{" "}
								<span className="font-semibold text-ink-900">
									{currency.format(
										Math.max(
											0,
											Number(totalCost) - Number(advancePayment || 0),
										),
									)}
								</span>
							</p>
						)}

						{formError && (
							<p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">
								{formError}
							</p>
						)}

						<div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
							<Button
								variant="secondary"
								className="w-full sm:w-auto"
								onClick={() => setApproving(null)}
							>
								Cancel
							</Button>
							<Button
								className="w-full sm:w-auto"
								onClick={confirmApprove}
								isLoading={isSaving}
							>
								{isSaving ? "Confirming…" : "Confirm booking"}
							</Button>
						</div>
					</div>
				)}
			</Modal>
		</div>
	);
};

export default BookingRequestsPage;
