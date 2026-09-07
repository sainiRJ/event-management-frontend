import React, {useCallback, useEffect, useState} from "react";
import {toast} from "sonner";
import {Plus, Receipt, Trash2} from "lucide-react";

import {operationsService} from "@/services/api/eventManagementServer";
import {
	EXPENSE_CATEGORIES,
	iExpense,
	iExpenseSummary,
} from "@/customTypes/appDataTypes/operationsTypes";
import {httpStatusCodes} from "@/customTypes/NetworkTypes";
import {formatCurrency} from "@/utils/currencyUtils";
import {useAppSelector} from "@/store/Hooks";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Modal from "../ui/Modal";
import Pagination from "../common/Pagination";

const toIso = (date: Date): string => {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
};

const categoryLabel = (category: string): string => {
	return category.charAt(0).toUpperCase() + category.slice(1);
};

interface iProps {
	/** YYYY-MM-DD window, shared with the finance filters above. */
	fromDate?: string;
	toDate?: string;
	/** Called after an add or delete so the summary cards can refresh. */
	onChange?: () => void;
}

interface iForm {
	category: string;
	amount: string;
	spentOn: string;
	note: string;
	bookingId: string;
}

const emptyForm = (): iForm => {
	return {
		category: "flowers",
		amount: "",
		spentOn: toIso(new Date()),
		note: "",
		bookingId: "",
	};
};

/**
 * Money going out, beside the money coming in. Each line can be tied to a
 * booking so a single wedding's profit is readable, but most entries are
 * just "flowers, 1200, Tuesday".
 */
const ExpensesPanel: React.FC<iProps> = ({fromDate, toDate, onChange}) => {
	const bookings = useAppSelector((state) => state.bookingReducer.bookingList);
	const [items, setItems] = useState<iExpense[]>([]);
	const [summary, setSummary] = useState<iExpenseSummary | null>(null);
	const [page, setPage] = useState(1);
	const [pagination, setPagination] = useState({
		totalPages: 1,
		total: 0,
		limit: 25,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [isAdding, setIsAdding] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);
	const [form, setForm] = useState<iForm>(emptyForm);

	const load = useCallback(async () => {
		setIsLoading(true);
		const response = await operationsService.listExpenses({
			page,
			limit: 25,
			fromDate,
			toDate,
		});
		if (
			response?.httpStatusCode === httpStatusCodes.SUCCESS_OK &&
			response.data?.data
		) {
			const data = response.data.data;
			setItems(data.items);
			setSummary(data.summary);
			setPagination({
				totalPages: data.pagination.totalPages,
				total: data.pagination.total,
				limit: data.pagination.limit,
			});
		} else {
			toast.error(response?.data?.error?.message ?? "Couldn't load expenses");
		}
		setIsLoading(false);
	}, [page, fromDate, toDate]);

	useEffect(() => {
		void load();
	}, [load]);

	useEffect(() => {
		setPage(1);
	}, [fromDate, toDate]);

	const save = async () => {
		const amount = Number(form.amount);
		if (!amount || amount <= 0) {
			toast.error("Enter the amount");
			return;
		}
		setIsSaving(true);
		const response = await operationsService.createExpense({
			category: form.category,
			amount,
			spentOn: form.spentOn,
			note: form.note.trim() || undefined,
			bookingId: form.bookingId || null,
		});
		setIsSaving(false);
		if (response?.httpStatusCode === httpStatusCodes.SUCCESS_CREATED) {
			toast.success("Expense recorded");
			setIsAdding(false);
			setForm(emptyForm());
			void load();
			onChange?.();
			return;
		}
		toast.error(response?.data?.error?.message ?? "Couldn't save the expense");
	};

	const remove = async (expense: iExpense) => {
		setDeletingId(expense.id);
		const response = await operationsService.deleteExpense(expense.id);
		setDeletingId(null);
		if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
			toast.success("Expense removed");
			void load();
			onChange?.();
			return;
		}
		toast.error(response?.data?.error?.message ?? "Couldn't remove that");
	};

	const bookingOptions = [
		{label: "Not tied to a booking", value: ""},
		...bookings.map((booking) => {
			return {
				label: `${booking.serviceName} · ${booking.customerName}`,
				value: booking.id,
			};
		}),
	];

	return (
		<div className="rounded-3xl border border-ink-200/70 bg-white shadow-sm">
			<div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-100 p-5 sm:p-6">
				<div>
					<h2 className="flex items-center gap-2 font-display text-lg text-ink-900">
						<Receipt className="h-5 w-5 text-brand-600" />
						Expenses
					</h2>
					{summary && (
						<p className="mt-0.5 text-sm text-ink-500">
							{formatCurrency(summary.total)} in this window
						</p>
					)}
				</div>
				<Button
					size="sm"
					icon={<Plus className="h-4 w-4" />}
					onClick={() => setIsAdding(true)}
				>
					Add expense
				</Button>
			</div>

			{summary && summary.byCategory.length > 0 && (
				<div className="flex flex-wrap gap-2 border-b border-ink-100 px-5 py-3 sm:px-6">
					{summary.byCategory.map((entry) => (
						<span
							key={entry.category}
							className="rounded-full bg-ink-100 px-3 py-1 text-xs font-semibold text-ink-700"
						>
							{categoryLabel(entry.category)} · {formatCurrency(entry.total)}
						</span>
					))}
				</div>
			)}

			{isLoading && items.length === 0 && (
				<div className="space-y-3 p-5">
					{[0, 1, 2].map((i) => (
						<div key={i} className="skeleton h-12" />
					))}
				</div>
			)}

			{!isLoading && items.length === 0 && (
				<p className="p-10 text-center text-sm text-ink-500">
					No expenses recorded in this window yet.
				</p>
			)}

			{items.length > 0 && (
				<ul className="divide-y divide-ink-100">
					{items.map((expense) => (
						<li
							key={expense.id}
							className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-6"
						>
							<div className="min-w-0">
								<p className="font-semibold text-ink-900">
									{categoryLabel(expense.category)}
									{expense.note && (
										<span className="ml-2 font-normal text-ink-500">
											{expense.note}
										</span>
									)}
								</p>
								<p className="text-xs text-ink-500">
									{new Date(`${expense.spentOn}T00:00:00`).toLocaleDateString(
										"en-IN",
										{day: "numeric", month: "short", year: "numeric"},
									)}
									{expense.bookingLabel && ` · ${expense.bookingLabel}`}
								</p>
							</div>
							<div className="flex items-center gap-3">
								<span className="font-display text-lg text-ink-900">
									{formatCurrency(expense.amount)}
								</span>
								<Button
									variant="ghost"
									size="sm"
									aria-label="Remove expense"
									className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
									onClick={() => void remove(expense)}
									isLoading={deletingId === expense.id}
									disabled={deletingId !== null}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</div>
						</li>
					))}
				</ul>
			)}

			{pagination.totalPages > 1 && (
				<div className="border-t border-ink-100 px-5 py-3 sm:px-6">
					<Pagination
						page={page}
						totalPages={pagination.totalPages}
						total={pagination.total}
						limit={pagination.limit}
						onPageChange={setPage}
						isLoading={isLoading}
					/>
				</div>
			)}

			<Modal
				isOpen={isAdding}
				onClose={() => setIsAdding(false)}
				title="Add expense"
				size="sm"
				footer={
					<>
						<Button
							variant="ghost"
							onClick={() => setIsAdding(false)}
							disabled={isSaving}
						>
							Cancel
						</Button>
						<Button onClick={() => void save()} isLoading={isSaving}>
							Save
						</Button>
					</>
				}
			>
				<div className="space-y-4">
					<Select
						label="Category"
						value={form.category}
						onChange={(e) => setForm({...form, category: e.target.value})}
						options={EXPENSE_CATEGORIES.map((category) => {
							return {label: categoryLabel(category), value: category};
						})}
					/>
					<Input
						label="Amount (₹)"
						type="number"
						inputMode="decimal"
						min={1}
						value={form.amount}
						onChange={(e) => setForm({...form, amount: e.target.value})}
						placeholder="1200"
					/>
					<Input
						label="Date"
						type="date"
						value={form.spentOn}
						max={toIso(new Date())}
						onChange={(e) => setForm({...form, spentOn: e.target.value})}
					/>
					<Select
						label="Booking (optional)"
						value={form.bookingId}
						onChange={(e) => setForm({...form, bookingId: e.target.value})}
						options={bookingOptions}
					/>
					<Input
						label="Note (optional)"
						value={form.note}
						onChange={(e) => setForm({...form, note: e.target.value})}
						placeholder="Marigold from Lucknow mandi"
						maxLength={255}
					/>
				</div>
			</Modal>
		</div>
	);
};

export default ExpensesPanel;
