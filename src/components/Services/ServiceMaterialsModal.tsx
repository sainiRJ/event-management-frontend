import React, {useEffect, useState} from "react";
import {toast} from "sonner";
import {Plus, Trash2} from "lucide-react";

import {operationsService} from "@/services/api/eventManagementServer";
import {httpStatusCodes} from "@/customTypes/NetworkTypes";
import {iService} from "@/store/services/Types";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

interface iRow {
	name: string;
	quantity: string;
	unit: string;
}

const EMPTY_ROW: iRow = {name: "", quantity: "1", unit: ""};

const inputClass =
	"h-10 rounded-lg border border-ink-200 px-3 text-sm outline-none focus:border-brand-600";

interface iProps {
	service: iService | null;
	onClose: () => void;
}

/**
 * The default material list for a service. Every new booking of this
 * service starts its checklist from here.
 */
const ServiceMaterialsModal: React.FC<iProps> = ({service, onClose}) => {
	const [rows, setRows] = useState<iRow[]>([EMPTY_ROW]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		if (!service) return undefined;
		let isStale = false;
		setIsLoading(true);
		(async () => {
			const response = await operationsService.getServiceMaterials(service.id);
			if (isStale) return;
			if (
				response?.httpStatusCode === httpStatusCodes.SUCCESS_OK &&
				response.data?.data &&
				response.data.data.length > 0
			) {
				setRows(
					response.data.data.map((item) => {
						return {
							name: item.name,
							quantity: String(item.quantity),
							unit: item.unit ?? "",
						};
					}),
				);
			} else {
				setRows([EMPTY_ROW]);
			}
			setIsLoading(false);
		})();
		return () => {
			isStale = true;
		};
	}, [service]);

	const update = (index: number, patch: Partial<iRow>) => {
		setRows((current) =>
			current.map((row, i) => (i === index ? {...row, ...patch} : row)),
		);
	};

	const save = async () => {
		if (!service) return;
		setIsSaving(true);
		const response = await operationsService.saveServiceMaterials(
			service.id,
			rows
				.filter((row) => row.name.trim())
				.map((row) => {
					return {
						name: row.name.trim(),
						quantity: Number(row.quantity) || 1,
						unit: row.unit.trim() || null,
					};
				}),
		);
		setIsSaving(false);
		if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
			toast.success(`Default materials saved for ${service.serviceName}`);
			onClose();
			return;
		}
		toast.error(response?.data?.error?.message ?? "Couldn't save the list");
	};

	return (
		<Modal
			isOpen={Boolean(service)}
			onClose={onClose}
			title={service ? `${service.serviceName} · default materials` : ""}
			size="md"
			footer={
				<>
					<Button variant="ghost" onClick={onClose} disabled={isSaving}>
						Cancel
					</Button>
					<Button onClick={() => void save()} isLoading={isSaving}>
						Save
					</Button>
				</>
			}
		>
			<p className="mb-4 text-sm text-ink-500">
				What the team normally carries for this service. Each new booking copies
				this list, so it can be adjusted per event without changing the default.
			</p>

			{isLoading ? (
				<div className="skeleton h-32" />
			) : (
				<div className="space-y-2">
					<div className="grid grid-cols-[1fr_70px_90px_32px] gap-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-ink-400">
						<span>Item</span>
						<span>Qty</span>
						<span>Unit</span>
						<span />
					</div>
					{rows.map((row, index) => (
						<div
							key={index}
							className="grid grid-cols-[1fr_70px_90px_32px] gap-2"
						>
							<input
								value={row.name}
								onChange={(e) => update(index, {name: e.target.value})}
								placeholder="e.g. Marigold garlands"
								className={inputClass}
							/>
							<input
								value={row.quantity}
								inputMode="decimal"
								onChange={(e) => update(index, {quantity: e.target.value})}
								className={inputClass}
							/>
							<input
								value={row.unit}
								onChange={(e) => update(index, {unit: e.target.value})}
								placeholder="kg / pcs"
								className={inputClass}
							/>
							<button
								type="button"
								aria-label="Remove"
								onClick={() =>
									setRows((current) =>
										current.length === 1
											? [EMPTY_ROW]
											: current.filter((_, i) => i !== index),
									)
								}
								className="flex h-10 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-rose-50 hover:text-rose-600"
							>
								<Trash2 className="h-4 w-4" />
							</button>
						</div>
					))}
					<button
						type="button"
						onClick={() => setRows((current) => [...current, EMPTY_ROW])}
						className="inline-flex items-center gap-1.5 pt-1 text-xs font-semibold text-brand-600 hover:underline"
					>
						<Plus className="h-3.5 w-3.5" />
						Add item
					</button>
				</div>
			)}
		</Modal>
	);
};

export default ServiceMaterialsModal;
