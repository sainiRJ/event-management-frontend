import React, {useCallback, useEffect, useState} from "react";
import {toast} from "sonner";
import {IndianRupee, Plus, Trash2} from "lucide-react";

import {operationsService} from "@/services/api/eventManagementServer";
import {iBookingLedger} from "@/customTypes/appDataTypes/operationsTypes";
import {httpStatusCodes} from "@/customTypes/NetworkTypes";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

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

interface iPaymentLedgerProps {
	bookingId: string;
	/** Called after any change, so the parent can refresh its totals. */
	onChange?: () => void;
}

/**
 * Payments received against one booking.
 *
 * The `payments` table existed but nothing ever wrote to it — a booking
 * carried a single "advance" number with no record of when money arrived or
 * in how many instalments. Every row here is one real receipt, and the
 * booking's advance is derived from them rather than typed in.
 */
const PaymentLedger: React.FC<iPaymentLedgerProps> = ({
	bookingId,
	onChange,
}) => {
	const [ledger, setLedger] = useState<iBookingLedger | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [amount, setAmount] = useState("");
	const [paymentDate, setPaymentDate] = useState("");
	const [formError, setFormError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const load = useCallback(async () => {
		setIsLoading(true);

		const response = await operationsService.getLedger(bookingId);

		if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
			setLedger(response.data?.data ?? null);
		} else {
			toast.error("Couldn't load payments for this booking");
		}

		setIsLoading(false);
	}, [bookingId]);

	useEffect(() => {
		load();
	}, [load]);

	const record = async () => {
		const value = Number(amount);

		if (!Number.isFinite(value) || value <= 0) {
			setFormError("Enter the amount received");
			return;
		}

		setIsSaving(true);
		setFormError(null);

		const response = await operationsService.recordPayment(bookingId, {
			amount: value,
			paymentDate: paymentDate || undefined,
		});

		setIsSaving(false);

		if (
			response?.httpStatusCode === httpStatusCodes.SUCCESS_CREATED ||
			response?.httpStatusCode === httpStatusCodes.SUCCESS_OK
		) {
			setLedger(response.data?.data ?? null);
			setAmount("");
			setPaymentDate("");
			toast.success("Payment recorded");
			onChange?.();
			return;
		}

		setFormError(
			response?.data?.error?.message ?? "Couldn't record that payment",
		);
	};

	const remove = async (paymentId: string) => {
		const response = await operationsService.deletePayment(paymentId);

		if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
			setLedger(response.data?.data ?? null);
			toast.success("Payment removed");
			onChange?.();
			return;
		}

		toast.error("Couldn't remove that payment");
	};

	if (isLoading && !ledger) {
		return (
			<p className="py-6 text-center text-sm text-ink-500">Loading payments…</p>
		);
	}

	const outstanding = Number(ledger?.outstanding ?? 0);

	return (
		<div className="space-y-5">
			<div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
				{[
					{
						label: "Agreed price",
						value: ledger?.totalCost,
						tone: "text-ink-900",
					},
					{
						label: "Received",
						value: ledger?.totalPaid,
						tone: "text-emerald-600",
					},
					{
						label: "Outstanding",
						value: ledger?.outstanding,
						tone: outstanding > 0 ? "text-amber-600" : "text-emerald-600",
					},
				].map((stat) => (
					<div key={stat.label} className="rounded-2xl bg-cream-100 p-4">
						<p className="text-xs font-bold uppercase tracking-wider text-ink-400">
							{stat.label}
						</p>
						<p className={`mt-1 text-xl font-semibold ${stat.tone}`}>
							{currency.format(Number(stat.value ?? 0))}
						</p>
					</div>
				))}
			</div>

			<div className="rounded-2xl border border-ink-200/70 p-4">
				<h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink-900">
					<IndianRupee className="h-4 w-4 text-brand-500" />
					Record a payment
				</h4>

				<div className="flex flex-col gap-3 sm:flex-row sm:items-end">
					<div className="flex-1">
						<Input
							label="Amount received"
							type="number"
							min="0"
							value={amount}
							onChange={(e) => setAmount(e.target.value)}
							placeholder="e.g. 5000"
						/>
					</div>
					<div className="flex-1">
						<Input
							label="Date (optional)"
							type="date"
							value={paymentDate}
							onChange={(e) => setPaymentDate(e.target.value)}
						/>
					</div>
					<Button
						className="w-full sm:w-auto"
						onClick={record}
						disabled={isSaving}
					>
						<Plus className="mr-2 h-4 w-4" />
						{isSaving ? "Saving…" : "Add"}
					</Button>
				</div>

				{formError && (
					<p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-600">
						{formError}
					</p>
				)}
			</div>

			{ledger?.payments.length === 0 ? (
				<p className="py-4 text-center text-sm text-ink-500">
					No payments recorded yet.
				</p>
			) : (
				<ul className="divide-y divide-brand-100/70 rounded-2xl border border-ink-200/70">
					{ledger?.payments.map((payment) => (
						<li
							key={payment.id}
							className="flex items-center justify-between gap-3 p-4"
						>
							<div className="min-w-0">
								<p className="font-bold text-ink-900">
									{currency.format(Number(payment.amount))}
								</p>
								<p className="text-sm text-ink-500">
									{formatDate(payment.paymentDate)}
								</p>
							</div>

							<button
								type="button"
								onClick={() => remove(payment.id)}
								aria-label={`Remove the ${currency.format(
									Number(payment.amount),
								)} payment`}
								className="rounded-xl p-2 text-rose-600 transition-colors hover:bg-rose-50"
							>
								<Trash2 className="h-4 w-4" />
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
};

export default PaymentLedger;
