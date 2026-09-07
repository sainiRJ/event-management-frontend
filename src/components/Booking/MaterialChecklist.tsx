import React, {useEffect, useState} from "react";
import {toast} from "sonner";
import {Check, CheckSquare, Plus, Trash2} from "lucide-react";

import {operationsService} from "@/services/api/eventManagementServer";
import {
	iBookingChecklist,
	iMaterialInput,
} from "@/customTypes/appDataTypes/operationsTypes";
import {httpStatusCodes} from "@/customTypes/NetworkTypes";
import Button from "../ui/Button";

interface iRow {
	id?: string;
	name: string;
	quantity: string;
	unit: string;
	isDone: boolean;
}

const EMPTY_ROW: iRow = {name: "", quantity: "1", unit: "", isDone: false};

const inputClass =
	"h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm outline-none focus:border-brand-600";

/**
 * What to load in the van for this booking. Starts from the service's
 * default list, then belongs to the booking: edit quantities, add the
 * extra the customer asked for, tick things off as they are packed.
 */
const MaterialChecklist: React.FC<{bookingId: string}> = ({bookingId}) => {
	const [rows, setRows] = useState<iRow[]>([]);
	const [editRows, setEditRows] = useState<iRow[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [togglingId, setTogglingId] = useState<string | null>(null);

	const apply = (checklist: iBookingChecklist) => {
		setRows(
			checklist.items.map((item) => {
				return {
					id: item.id,
					name: item.name,
					quantity: String(item.quantity),
					unit: item.unit ?? "",
					isDone: item.isDone,
				};
			}),
		);
	};

	useEffect(() => {
		let isStale = false;
		(async () => {
			const response = await operationsService.getBookingChecklist(bookingId);
			if (isStale) return;
			if (
				response?.httpStatusCode === httpStatusCodes.SUCCESS_OK &&
				response.data?.data
			) {
				apply(response.data.data);
			}
			setIsLoading(false);
		})();
		return () => {
			isStale = true;
		};
	}, [bookingId]);

	const startEditing = () => {
		setEditRows(rows.length > 0 ? rows : [EMPTY_ROW]);
		setIsEditing(true);
	};

	const updateRow = (index: number, patch: Partial<iRow>) => {
		setEditRows((current) =>
			current.map((row, i) => (i === index ? {...row, ...patch} : row)),
		);
	};

	const toggle = async (row: iRow) => {
		if (!row.id) return;
		setTogglingId(row.id);
		const response = await operationsService.setChecklistItemDone(
			bookingId,
			row.id,
			!row.isDone,
		);
		setTogglingId(null);
		if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
			setRows((current) =>
				current.map((r) => (r.id === row.id ? {...r, isDone: !r.isDone} : r)),
			);
			return;
		}
		toast.error(response?.data?.error?.message ?? "Couldn't update that item");
	};

	const save = async () => {
		const items: iMaterialInput[] = editRows
			.filter((row) => row.name.trim())
			.map((row) => {
				return {
					id: row.id,
					name: row.name.trim(),
					quantity: Number(row.quantity) || 1,
					unit: row.unit.trim() || null,
					isDone: row.isDone,
				};
			});
		setIsSaving(true);
		const response = await operationsService.saveBookingChecklist(
			bookingId,
			items,
		);
		setIsSaving(false);
		if (
			response?.httpStatusCode === httpStatusCodes.SUCCESS_OK &&
			response.data?.data
		) {
			apply(response.data.data);
			setIsEditing(false);
			toast.success("Checklist saved");
			return;
		}
		toast.error(
			response?.data?.error?.message ?? "Couldn't save the checklist",
		);
	};

	const doneCount = rows.filter((row) => row.isDone).length;

	return (
		<section className="mt-8 border-t border-ink-200/60 pt-6">
			<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
				<h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-brand-600">
					<CheckSquare className="h-4 w-4" />
					Materials
					{rows.length > 0 && (
						<span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-semibold tracking-normal text-ink-600">
							{doneCount}/{rows.length} packed
						</span>
					)}
				</h4>
				{!isLoading && !isEditing && (
					<Button variant="ghost" size="sm" onClick={startEditing}>
						{rows.length > 0 ? "Edit list" : "Add materials"}
					</Button>
				)}
			</div>

			{isLoading && <div className="skeleton h-24" />}

			{!isLoading && !isEditing && rows.length === 0 && (
				<p className="rounded-2xl border border-dashed border-ink-200 p-5 text-center text-sm text-ink-500">
					No checklist yet. Add a default list on the service, or build one here
					for this booking.
				</p>
			)}

			{!isLoading && !isEditing && rows.length > 0 && (
				<ul className="grid gap-2 sm:grid-cols-2">
					{rows.map((row) => (
						<li key={row.id}>
							<button
								type="button"
								onClick={() => void toggle(row)}
								disabled={togglingId === row.id}
								className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${
									row.isDone
										? "border-emerald-200 bg-emerald-50 text-emerald-800"
										: "border-ink-200 bg-white text-ink-800 hover:bg-ink-50"
								}`}
							>
								<span
									className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
										row.isDone
											? "border-emerald-600 bg-emerald-600 text-white"
											: "border-ink-300"
									}`}
								>
									{row.isDone && <Check className="h-3.5 w-3.5" />}
								</span>
								<span className={`flex-1 ${row.isDone ? "line-through" : ""}`}>
									{row.name}
								</span>
								<span className="text-xs text-ink-500">
									{row.quantity} {row.unit}
								</span>
							</button>
						</li>
					))}
				</ul>
			)}

			{isEditing && (
				<div className="rounded-2xl border border-ink-200/60 bg-gray-50/50 p-4">
					<div className="space-y-2">
						{editRows.map((row, index) => (
							<div
								key={row.id ?? `new-${index}`}
								className="grid grid-cols-[1fr_70px_80px_32px] gap-2"
							>
								<input
									value={row.name}
									onChange={(e) => updateRow(index, {name: e.target.value})}
									placeholder="e.g. Marigold"
									className={inputClass}
								/>
								<input
									value={row.quantity}
									inputMode="decimal"
									onChange={(e) => updateRow(index, {quantity: e.target.value})}
									placeholder="Qty"
									className={inputClass}
								/>
								<input
									value={row.unit}
									onChange={(e) => updateRow(index, {unit: e.target.value})}
									placeholder="kg / pcs"
									className={inputClass}
								/>
								<button
									type="button"
									aria-label="Remove"
									onClick={() =>
										setEditRows((current) =>
											current.filter((_, i) => i !== index),
										)
									}
									className="flex h-10 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600"
								>
									<Trash2 className="h-4 w-4" />
								</button>
							</div>
						))}
					</div>
					<button
						type="button"
						onClick={() => setEditRows((current) => [...current, EMPTY_ROW])}
						className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline"
					>
						<Plus className="h-3.5 w-3.5" />
						Add item
					</button>
					<div className="mt-3 flex justify-end gap-2 border-t border-ink-200/60 pt-3">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setIsEditing(false)}
							disabled={isSaving}
						>
							Cancel
						</Button>
						<Button size="sm" onClick={() => void save()} isLoading={isSaving}>
							Save list
						</Button>
					</div>
				</div>
			)}
		</section>
	);
};

export default MaterialChecklist;
