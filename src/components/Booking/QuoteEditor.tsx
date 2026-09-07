import React, {useEffect, useState} from "react";
import {toast} from "sonner";
import {FileText, Plus, Send, Trash2} from "lucide-react";

import {operationsService} from "@/services/api/eventManagementServer";
import {iQuote} from "@/customTypes/appDataTypes/operationsTypes";
import {httpStatusCodes} from "@/customTypes/NetworkTypes";
import {iBooking} from "@/store/booking/Types";
import {formatCurrency} from "@/utils/currencyUtils";
import {quoteMessage, whatsappLink} from "@/utils/whatsapp";
import Button from "../ui/Button";

interface iRow {
	description: string;
	quantity: string;
	unitPrice: string;
}

const EMPTY_ROW: iRow = {description: "", quantity: "1", unitPrice: ""};

/**
 * Itemised quote for one booking. The total becomes the booking's price;
 * "Send" emails a one-time link (and offers WhatsApp) the customer can
 * accept without an account.
 */
const QuoteEditor: React.FC<{booking: iBooking}> = ({booking}) => {
	const [quote, setQuote] = useState<iQuote | null>(null);
	const [rows, setRows] = useState<iRow[]>([EMPTY_ROW]);
	const [notes, setNotes] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isSending, setIsSending] = useState(false);
	const [isDirty, setIsDirty] = useState(false);

	useEffect(() => {
		let isStale = false;
		(async () => {
			const response = await operationsService.getQuote(booking.id);
			if (isStale) return;
			if (
				response?.httpStatusCode === httpStatusCodes.SUCCESS_OK &&
				response.data?.data
			) {
				const loaded = response.data.data;
				setQuote(loaded);
				setNotes(loaded.notes ?? "");
				setRows(
					loaded.items.length > 0
						? loaded.items.map((item) => {
								return {
									description: item.description,
									quantity: String(item.quantity),
									unitPrice: String(item.unitPrice),
								};
						  })
						: [EMPTY_ROW],
				);
			}
			setIsLoading(false);
		})();
		return () => {
			isStale = true;
		};
	}, [booking.id]);

	const isFrozen = quote?.status === "accepted";

	const total = rows.reduce((sum, row) => {
		const qty = Number(row.quantity) || 0;
		const rate = Number(row.unitPrice) || 0;
		return sum + qty * rate;
	}, 0);

	const update = (index: number, patch: Partial<iRow>) => {
		setRows((current) =>
			current.map((row, i) => (i === index ? {...row, ...patch} : row)),
		);
		setIsDirty(true);
	};

	const cleanItems = () => {
		return rows
			.filter((row) => row.description.trim())
			.map((row) => {
				return {
					description: row.description.trim(),
					quantity: Number(row.quantity) || 1,
					unitPrice: Number(row.unitPrice) || 0,
				};
			});
	};

	const save = async (): Promise<boolean> => {
		const items = cleanItems();
		if (items.length === 0) {
			toast.error("Add at least one item with a description");
			return false;
		}
		setIsSaving(true);
		const response = await operationsService.saveQuote(booking.id, {
			items,
			notes,
		});
		setIsSaving(false);
		if (
			response?.httpStatusCode === httpStatusCodes.SUCCESS_OK &&
			response.data?.data
		) {
			setQuote(response.data.data);
			setIsDirty(false);
			toast.success(
				`Quote saved. Booking price is now ${formatCurrency(
					response.data.data.total,
				)}`,
			);
			return true;
		}
		toast.error(response?.data?.error?.message ?? "Couldn't save the quote");
		return false;
	};

	const send = async () => {
		if (isDirty) {
			const isSaved = await save();
			if (!isSaved) return;
		}
		setIsSending(true);
		const response = await operationsService.sendQuote(booking.id);
		setIsSending(false);
		if (
			response?.httpStatusCode === httpStatusCodes.SUCCESS_OK &&
			response.data?.data
		) {
			const {quote: sent, quoteUrl, wasEmailed} = response.data.data;
			setQuote(sent);
			toast.success(
				wasEmailed
					? "Quote emailed to the customer"
					: "Quote link ready - no email on file, send it on WhatsApp",
				{
					duration: 15000,
					action: booking.phoneNumber
						? {
								label: "Send on WhatsApp",
								onClick: () =>
									window.open(
										whatsappLink(
											booking.phoneNumber,
											quoteMessage({
												customerName: booking.customerName,
												serviceName: booking.serviceName,
												eventDate: booking.eventDate ?? new Date(),
												total: sent.total,
												quoteUrl,
											}),
										),
										"_blank",
										"noopener",
									),
						  }
						: undefined,
				},
			);
			return;
		}
		toast.error(response?.data?.error?.message ?? "Couldn't send the quote");
	};

	return (
		<div className="mt-8 space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-brand-600">
					<FileText className="h-4 w-4" />
					Quote
				</h4>
				{quote?.status && (
					<span
						className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider ${
							quote.status === "accepted"
								? "bg-emerald-50 text-emerald-700"
								: quote.status === "sent"
								? "bg-sky-50 text-sky-700"
								: "bg-ink-100 text-ink-500"
						}`}
					>
						{quote.status === "accepted"
							? `Accepted ${
									quote.acceptedAt
										? new Date(quote.acceptedAt).toLocaleDateString("en-IN")
										: ""
							  }`
							: quote.status === "sent"
							? "Sent, waiting for the customer"
							: "Draft"}
					</span>
				)}
			</div>

			{isLoading ? (
				<div className="skeleton h-28" />
			) : (
				<div className="rounded-2xl border border-ink-200/60 bg-gray-50/50 p-4">
					<div className="hidden grid-cols-[1fr_80px_110px_110px_32px] gap-2 px-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400 sm:grid">
						<span>Item</span>
						<span>Qty</span>
						<span>Rate</span>
						<span className="text-right">Amount</span>
						<span />
					</div>

					<div className="space-y-2">
						{rows.map((row, index) => {
							const amount =
								(Number(row.quantity) || 0) * (Number(row.unitPrice) || 0);
							return (
								<div
									key={index}
									className="grid grid-cols-2 gap-2 rounded-xl bg-white p-2 sm:grid-cols-[1fr_80px_110px_110px_32px] sm:items-center sm:bg-transparent sm:p-0"
								>
									<input
										value={row.description}
										onChange={(e) =>
											update(index, {description: e.target.value})
										}
										disabled={isFrozen}
										placeholder="e.g. Marigold garlands"
										className="col-span-2 h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-600 disabled:bg-ink-50 sm:col-span-1"
									/>
									<input
										value={row.quantity}
										onChange={(e) => update(index, {quantity: e.target.value})}
										disabled={isFrozen}
										inputMode="decimal"
										placeholder="Qty"
										className="h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-600 disabled:bg-ink-50"
									/>
									<input
										value={row.unitPrice}
										onChange={(e) => update(index, {unitPrice: e.target.value})}
										disabled={isFrozen}
										inputMode="decimal"
										placeholder="Rate ₹"
										className="h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-600 disabled:bg-ink-50"
									/>
									<span className="flex h-10 items-center justify-end pr-1 text-sm font-medium text-ink-900">
										{formatCurrency(amount)}
									</span>
									{!isFrozen && (
										<button
											type="button"
											onClick={() => {
												setRows((current) =>
													current.length === 1
														? [EMPTY_ROW]
														: current.filter((_, i) => i !== index),
												);
												setIsDirty(true);
											}}
											aria-label="Remove item"
											className="flex h-10 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600"
										>
											<Trash2 className="h-4 w-4" />
										</button>
									)}
								</div>
							);
						})}
					</div>

					{!isFrozen && (
						<button
							type="button"
							onClick={() => {
								setRows((current) => [...current, EMPTY_ROW]);
								setIsDirty(true);
							}}
							className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline"
						>
							<Plus className="h-3.5 w-3.5" />
							Add item
						</button>
					)}

					<textarea
						value={notes}
						onChange={(e) => {
							setNotes(e.target.value);
							setIsDirty(true);
						}}
						disabled={isFrozen}
						rows={2}
						placeholder="Notes for the customer (what's included, timing, terms)…"
						className="mt-3 w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-600 disabled:bg-ink-50"
					/>

					<div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-ink-200/60 pt-3">
						<p className="text-sm text-ink-500">
							Total{" "}
							<span className="font-display text-xl text-ink-900">
								{formatCurrency(total)}
							</span>
						</p>
						{!isFrozen && (
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => void save()}
									isLoading={isSaving}
									disabled={!isDirty && quote?.status !== null}
								>
									Save
								</Button>
								<Button
									size="sm"
									icon={<Send className="h-4 w-4" />}
									onClick={() => void send()}
									isLoading={isSending}
								>
									{quote?.status === "sent" ? "Send again" : "Send to customer"}
								</Button>
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default QuoteEditor;
