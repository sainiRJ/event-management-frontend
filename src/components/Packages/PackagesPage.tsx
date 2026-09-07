import React, {useCallback, useEffect, useState} from "react";
import {toast} from "sonner";
import {Edit2, Package as PackageIcon, Plus, Trash2} from "lucide-react";

import {useAppDispatch, useAppSelector} from "@/store/Hooks";
import {fetchServices} from "@/store/services/ThunkActions";
import {RootState} from "@/store";
import {operationsService} from "@/services/api/eventManagementServer";
import {
	iPackage,
	iPackageInput,
} from "@/customTypes/appDataTypes/operationsTypes";
import {httpStatusCodes} from "@/customTypes/NetworkTypes";
import {formatCurrency} from "@/utils/currencyUtils";
import PageHeader from "../common/PageHeader";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import {Stagger, StaggerItem} from "@/components/motion";

/** Customer site origin, for "open on the site" links. */
const CLIENT_SITE_URL =
	import.meta.env.VITE_CLIENT_SITE_URL || "https://sainievents.in";

interface iForm {
	name: string;
	description: string;
	price: string;
	isActive: boolean;
	serviceIds: string[];
}

const emptyForm = (): iForm => {
	return {name: "", description: "", price: "", isActive: true, serviceIds: []};
};

/**
 * Packages: named bundles of services at one price. Shown on the customer
 * site's homepage and in the booking wizard; a package request arrives as
 * one booking per service on the same event.
 */
const PackagesPage: React.FC = () => {
	const dispatch = useAppDispatch();
	const {serviceList} = useAppSelector((state: RootState) => {
		return state.serviceReducer;
	});
	const [packages, setPackages] = useState<iPackage[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [editing, setEditing] = useState<iPackage | null>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [form, setForm] = useState<iForm>(emptyForm);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSaving, setIsSaving] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const load = useCallback(async () => {
		setIsLoading(true);
		const response = await operationsService.listPackages();
		if (
			response?.httpStatusCode === httpStatusCodes.SUCCESS_OK &&
			response.data?.data
		) {
			setPackages(response.data.data);
		} else {
			toast.error(response?.data?.error?.message ?? "Couldn't load packages");
		}
		setIsLoading(false);
	}, []);

	useEffect(() => {
		dispatch(fetchServices());
		void load();
	}, [dispatch, load]);

	const openCreate = () => {
		setEditing(null);
		setForm(emptyForm());
		setErrors({});
		setIsFormOpen(true);
	};

	const openEdit = (pkg: iPackage) => {
		setEditing(pkg);
		setForm({
			name: pkg.name,
			description: pkg.description ?? "",
			price: String(pkg.price),
			isActive: pkg.isActive,
			serviceIds: pkg.services.map((service) => {
				return service.id;
			}),
		});
		setErrors({});
		setIsFormOpen(true);
	};

	const toggleService = (serviceId: string) => {
		setForm((current) => {
			const has = current.serviceIds.includes(serviceId);
			return {
				...current,
				serviceIds: has
					? current.serviceIds.filter((id) => {
							return id !== serviceId;
					  })
					: [...current.serviceIds, serviceId],
			};
		});
	};

	const validate = (): boolean => {
		const next: Record<string, string> = {};
		if (form.name.trim().length < 2) next.name = "Give the package a name";
		if (!form.price || Number(form.price) < 0) next.price = "Enter the price";
		if (form.serviceIds.length < 2)
			next.serviceIds = "Pick at least two services";
		setErrors(next);
		return Object.keys(next).length === 0;
	};

	const save = async () => {
		if (!validate()) return;
		const body: iPackageInput = {
			name: form.name.trim(),
			description: form.description.trim() || null,
			price: Number(form.price),
			isActive: form.isActive,
			serviceIds: form.serviceIds,
		};
		setIsSaving(true);
		const response = editing
			? await operationsService.updatePackage(editing.id, body)
			: await operationsService.createPackage(body);
		setIsSaving(false);
		if (
			response?.httpStatusCode === httpStatusCodes.SUCCESS_OK ||
			response?.httpStatusCode === httpStatusCodes.SUCCESS_CREATED
		) {
			toast.success(editing ? "Package updated" : "Package created");
			setIsFormOpen(false);
			void load();
			return;
		}
		toast.error(response?.data?.error?.message ?? "Couldn't save the package");
	};

	const remove = async (pkg: iPackage) => {
		setDeletingId(pkg.id);
		const response = await operationsService.deletePackage(pkg.id);
		setDeletingId(null);
		if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
			toast.success("Package removed");
			void load();
			return;
		}
		toast.error(response?.data?.error?.message ?? "Couldn't remove that");
	};

	const setActive = async (pkg: iPackage, isActive: boolean) => {
		const response = await operationsService.updatePackage(pkg.id, {isActive});
		if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
			setPackages((current) => {
				return current.map((item) => {
					return item.id === pkg.id ? {...item, isActive} : item;
				});
			});
			return;
		}
		toast.error(response?.data?.error?.message ?? "Couldn't update that");
	};

	const separatePriceLabel = (pkg: iPackage): string | null => {
		const saving = pkg.separatePrice - pkg.price;
		if (saving <= 0) return null;
		return `Customer saves ${formatCurrency(saving)} against ${formatCurrency(
			pkg.separatePrice,
		)} separately`;
	};

	return (
		<div className="space-y-8">
			<PageHeader
				eyebrow="Your business"
				title="Packages"
				subtitle="Bundle services at one price. Packages show on the website and in the booking form."
				actions={
					<Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
						New package
					</Button>
				}
			/>

			{isLoading && packages.length === 0 && (
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{[0, 1, 2].map((i) => (
						<div key={i} className="skeleton h-48 rounded-3xl" />
					))}
				</div>
			)}

			{!isLoading && packages.length === 0 && (
				<div className="rounded-3xl border border-ink-200/70 bg-white p-12 text-center">
					<PackageIcon className="mx-auto h-10 w-10 text-ink-300" />
					<h2 className="mt-4 font-display text-xl text-ink-900">
						No packages yet
					</h2>
					<p className="mx-auto mt-2 max-w-sm text-sm text-ink-500">
						A package is your most-booked combination at one price, for example
						mandap + stage + car. Customers book it in one go.
					</p>
					<Button className="mt-6" onClick={openCreate}>
						Create the first one
					</Button>
				</div>
			)}

			{packages.length > 0 && (
				<Stagger className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{packages.map((pkg) => (
						<StaggerItem
							key={pkg.id}
							className="flex flex-col rounded-3xl border border-ink-200/70 bg-white p-5 shadow-sm"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="min-w-0">
									<h3 className="font-display text-xl text-ink-900">
										{pkg.name}
									</h3>
									<a
										href={`${CLIENT_SITE_URL}/#packages`}
										target="_blank"
										rel="noopener noreferrer"
										className="text-xs text-ink-400 hover:text-brand-600"
									>
										/{pkg.slug}
									</a>
								</div>
								<label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-ink-600">
									<input
										type="checkbox"
										checked={pkg.isActive}
										onChange={(e) => void setActive(pkg, e.target.checked)}
										className="h-4 w-4 rounded border-ink-300 text-brand-600"
									/>
									{pkg.isActive ? "Live" : "Hidden"}
								</label>
							</div>

							{pkg.description && (
								<p className="mt-2 text-sm text-ink-500">{pkg.description}</p>
							)}

							<div className="mt-4 flex flex-wrap gap-1.5">
								{pkg.services.map((service) => (
									<span
										key={service.id}
										className="rounded-full bg-ink-100 px-2.5 py-0.5 text-xs font-medium text-ink-700"
									>
										{service.serviceName}
									</span>
								))}
							</div>

							<div className="mt-4 flex-1">
								<p className="font-display text-2xl text-ink-900">
									{formatCurrency(pkg.price)}
								</p>
								{separatePriceLabel(pkg) && (
									<p className="text-xs text-ink-500">
										{separatePriceLabel(pkg)}
									</p>
								)}
							</div>

							<div className="mt-4 flex gap-2 border-t border-ink-100 pt-3">
								<Button
									variant="ghost"
									size="sm"
									icon={<Edit2 className="h-3.5 w-3.5" />}
									onClick={() => openEdit(pkg)}
								>
									Edit
								</Button>
								<Button
									variant="ghost"
									size="sm"
									className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
									icon={<Trash2 className="h-3.5 w-3.5" />}
									onClick={() => void remove(pkg)}
									isLoading={deletingId === pkg.id}
									disabled={deletingId !== null}
								>
									Delete
								</Button>
							</div>
						</StaggerItem>
					))}
				</Stagger>
			)}

			<Modal
				isOpen={isFormOpen}
				onClose={() => setIsFormOpen(false)}
				title={editing ? "Edit package" : "New package"}
				size="md"
				footer={
					<>
						<Button
							variant="ghost"
							onClick={() => setIsFormOpen(false)}
							disabled={isSaving}
						>
							Cancel
						</Button>
						<Button onClick={() => void save()} isLoading={isSaving}>
							{editing ? "Save changes" : "Create package"}
						</Button>
					</>
				}
			>
				<div className="space-y-4">
					<Input
						label="Name"
						value={form.name}
						onChange={(e) => setForm({...form, name: e.target.value})}
						placeholder="Wedding Complete"
						error={errors.name}
						maxLength={100}
					/>
					<Input
						label="Description (optional)"
						as="textarea"
						rows={2}
						value={form.description}
						onChange={(e) => setForm({...form, description: e.target.value})}
						placeholder="Mandap, stage and car, one team, one price."
						maxLength={2000}
					/>
					<Input
						label="Package price (₹)"
						type="number"
						inputMode="decimal"
						min={0}
						value={form.price}
						onChange={(e) => setForm({...form, price: e.target.value})}
						placeholder="50000"
						error={errors.price}
					/>

					<div>
						<p className="mb-2 text-sm font-medium text-ink-700">
							Services included
						</p>
						<div className="grid gap-2 sm:grid-cols-2">
							{serviceList.map((service) => {
								const isChecked = form.serviceIds.includes(service.id);
								return (
									<label
										key={service.id}
										className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
											isChecked
												? "border-brand-600 bg-brand-50 text-brand-800"
												: "border-ink-200 text-ink-700 hover:bg-ink-50"
										}`}
									>
										<span className="flex items-center gap-2">
											<input
												type="checkbox"
												checked={isChecked}
												onChange={() => toggleService(service.id)}
												className="h-4 w-4 rounded border-ink-300 text-brand-600"
											/>
											{service.serviceName}
										</span>
										<span className="text-xs text-ink-400">
											{formatCurrency(Number(service.price))}
										</span>
									</label>
								);
							})}
						</div>
						{errors.serviceIds && (
							<p className="mt-2 text-xs text-rose-600">{errors.serviceIds}</p>
						)}
						{form.serviceIds.length >= 2 && (
							<p className="mt-2 text-xs text-ink-500">
								Booked separately these come to{" "}
								{formatCurrency(
									serviceList
										.filter((service) => {
											return form.serviceIds.includes(service.id);
										})
										.reduce((sum, service) => {
											return sum + Number(service.price);
										}, 0),
								)}
								.
							</p>
						)}
					</div>

					<label className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 text-sm font-medium text-ink-700">
						<input
							type="checkbox"
							checked={form.isActive}
							onChange={(e) => setForm({...form, isActive: e.target.checked})}
							className="h-4 w-4 rounded border-ink-300 text-brand-600"
						/>
						Show on the website
					</label>
				</div>
			</Modal>
		</div>
	);
};

export default PackagesPage;
