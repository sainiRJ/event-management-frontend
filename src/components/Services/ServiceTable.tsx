import React, {useState, useEffect} from "react";
import {useAppDispatch, useAppSelector} from "../../store/Hooks";
import {
	fetchServices,
	createService,
	updateService,
	deleteService,
} from "../../store/services/ThunkActions";
import {RootState} from "../../store";
import {Plus, Search, Edit2, Trash2, Settings2, RefreshCw} from "lucide-react";
import CustomTable from "../common/CustomTable";
import {iService} from "../../customTypes/appDataTypes/serviceTypes";
import {serviceValidationSchema} from "@/validations/ServiceValidationSchema";
import Joi from "joi";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import {toast} from "sonner";

const ServiceTable = () => {
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");
	const [showAddModal, setShowAddModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editingService, setEditingService] = useState<iService | null>(null);
	const [formData, setFormData] = useState({
		serviceName: "",
		description: "",
		price: "0",
		available: true,
	});
	const [addFormErrors, setAddFormErrors] = useState<Record<string, string>>(
		{},
	);
	const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>(
		{},
	);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	const dispatch = useAppDispatch();
	const {serviceList} = useAppSelector(
		(state: RootState) => state.serviceReducer,
	);

	const handleRefresh = async () => {
		setIsRefreshing(true);
		setLoading(true);
		await dispatch(fetchServices());
		setLoading(false);
		setIsRefreshing(false);
	};

	useEffect(() => {
		handleRefresh();
	}, [dispatch]);

	const handleAddService = async () => {
		const {error} = serviceValidationSchema.validate(formData, {
			abortEarly: false,
		});
		if (error) {
			const errors: Record<string, string> = {};
			error.details.forEach((detail: Joi.ValidationErrorItem) => {
				errors[detail.path[0] as string] = detail.message;
			});
			setAddFormErrors(errors);
			return;
		}

		try {
			setIsSubmitting(true);
			const response: any = await dispatch(createService(formData)).finally(
				() => setIsSubmitting(false),
			);
			if (response?.meta?.requestStatus === "fulfilled") {
				toast.success("Service created successfully");
				setShowAddModal(false);
				setFormData({
					serviceName: "",
					description: "",
					price: "0",
					available: true,
				});
				setAddFormErrors({});
				handleRefresh();
			} else {
				toast.error(
					response?.payload?.message?.error?.message ||
						"Failed to create service",
				);
			}
		} catch (err) {
			toast.error("Failed to create service");
		}
	};

	const handleEditService = (service: iService) => {
		setEditingService(service);
		setShowEditModal(true);
	};

	const handleUpdateService = async () => {
		if (!editingService) return;

		const {error} = serviceValidationSchema.validate(
			{
				serviceName: editingService.serviceName,
				description: editingService.description,
				price: editingService.price,
				available: editingService.available,
			},
			{abortEarly: false},
		);

		if (error) {
			const errors: Record<string, string> = {};
			error.details.forEach((detail: Joi.ValidationErrorItem) => {
				errors[detail.path[0] as string] = detail.message;
			});
			setEditFormErrors(errors);
			return;
		}

		try {
			setIsSubmitting(true);
			const response: any = await dispatch(
				updateService(editingService),
			).finally(() => setIsSubmitting(false));
			if (response?.meta?.requestStatus === "fulfilled") {
				toast.success("Service updated successfully");
				setShowEditModal(false);
				setEditingService(null);
				setEditFormErrors({});
				handleRefresh();
			} else {
				toast.error(
					response?.payload?.message?.error?.message ||
						"Failed to update service",
				);
			}
		} catch (err) {
			toast.error("Failed to update service");
		}
	};

	const handleDeleteService = async (id: string) => {
		if (deletingId) return;
		if (window.confirm("Are you sure you want to delete this service?")) {
			try {
				setDeletingId(id);
				const response: any = await dispatch(deleteService(id)).finally(() =>
					setDeletingId(null),
				);
				if (response?.meta?.requestStatus === "fulfilled") {
					toast.success("Service deleted successfully");
					handleRefresh();
				} else {
					toast.error(
						response?.payload?.message?.error?.message ||
							"Failed to delete service",
					);
				}
			} catch (err) {
				toast.error("Failed to delete service");
			}
		}
	};

	const filteredData = serviceList.filter((service) =>
		service.serviceName.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	const columns = [
		{
			key: "serviceName",
			label: "Service Name",
			render: (row: iService) => (
				<div className="font-semibold text-ink-900">{row.serviceName}</div>
			),
		},
		{
			key: "description",
			label: "Description",
			render: (row: iService) => (
				<div className="text-ink-500 max-w-md truncate">
					{row.description || "-"}
				</div>
			),
		},
		{
			key: "actions",
			label: "Actions",
			render: (row: iService) => (
				<div className="flex gap-2">
					<Button
						variant="ghost"
						size="sm"
						icon={<Edit2 className="w-3.5 h-3.5" />}
						onClick={() => handleEditService(row)}
					>
						Edit
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
						icon={<Trash2 className="w-3.5 h-3.5" />}
						onClick={() => handleDeleteService(row.id)}
						isLoading={deletingId === row.id}
						disabled={deletingId !== null}
					>
						Delete
					</Button>
				</div>
			),
		},
	];

	return (
		<div className="space-y-8 animate-in fade-in duration-500">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
				<div>
					<h1 className="text-3xl font-display font-semibold text-ink-900 tracking-tight flex items-center gap-3">
						<Settings2 className="w-8 h-8 text-brand-600" />
						Services
					</h1>
					<p className="text-ink-500 mt-1">
						Manage the decoration services you offer to clients
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-2 sm:gap-3">
					<Button
						variant="outline"
						icon={
							<RefreshCw
								className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
							/>
						}
						onClick={handleRefresh}
						disabled={isRefreshing}
					>
						Refresh
					</Button>
					<Button
						icon={<Plus className="w-4 h-4" />}
						onClick={() => setShowAddModal(true)}
					>
						Add Service
					</Button>
				</div>
			</div>

			<div className="bg-white rounded-3xl shadow-sm border border-ink-200/70 p-8">
				<div className="relative max-w-md mb-8">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
					<input
						type="text"
						placeholder="Search services..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-400 transition-all"
					/>
				</div>

				<div className="rounded-2xl overflow-hidden border border-ink-200/60">
					<CustomTable
						data={filteredData}
						loading={loading}
						columns={columns}
						rowKey="id"
					/>
				</div>
			</div>

			{/* Add Modal */}
			<Modal
				isOpen={showAddModal}
				onClose={() => setShowAddModal(false)}
				title="Add New Service"
				footer={
					<>
						<Button variant="ghost" onClick={() => setShowAddModal(false)}>
							Cancel
						</Button>
						<Button onClick={handleAddService} isLoading={isSubmitting}>
							Create Service
						</Button>
					</>
				}
			>
				<div className="space-y-4">
					<Input
						label="Service Name"
						value={formData.serviceName}
						onChange={(e) =>
							setFormData({...formData, serviceName: e.target.value})
						}
						error={addFormErrors.serviceName}
						placeholder="e.g. Wedding Decoration"
					/>
					<Input
						label="Description"
						as="textarea"
						rows={4}
						value={formData.description}
						onChange={(e) =>
							setFormData({...formData, description: e.target.value})
						}
						error={addFormErrors.description}
						placeholder="Briefly describe what this service includes..."
					/>
					<Input
						label="Price"
						type="number"
						value={formData.price}
						onChange={(e) => setFormData({...formData, price: e.target.value})}
						error={addFormErrors.price}
						placeholder="0.00"
					/>
					<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
						<input
							type="checkbox"
							id="available-add"
							checked={formData.available}
							onChange={(e) =>
								setFormData({...formData, available: e.target.checked})
							}
							className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-400"
						/>
						<label
							htmlFor="available-add"
							className="text-sm font-medium text-ink-700"
						>
							Available for Booking
						</label>
					</div>
				</div>
			</Modal>

			{/* Edit Modal */}
			<Modal
				isOpen={showEditModal}
				onClose={() => {
					setShowEditModal(false);
					setEditingService(null);
				}}
				title="Edit Service"
				footer={
					<>
						<Button variant="ghost" onClick={() => setShowEditModal(false)}>
							Cancel
						</Button>
						<Button onClick={handleUpdateService} isLoading={isSubmitting}>
							Save Changes
						</Button>
					</>
				}
			>
				{editingService && (
					<div className="space-y-4">
						<Input
							label="Service Name"
							value={editingService.serviceName}
							onChange={(e) =>
								setEditingService({
									...editingService,
									serviceName: e.target.value,
								})
							}
							error={editFormErrors.serviceName}
						/>
						<Input
							label="Description"
							as="textarea"
							rows={4}
							value={editingService.description || ""}
							onChange={(e) =>
								setEditingService({
									...editingService,
									description: e.target.value,
								})
							}
							error={editFormErrors.description}
						/>
						<Input
							label="Price"
							type="number"
							value={editingService.price}
							onChange={(e) =>
								setEditingService({...editingService, price: e.target.value})
							}
							error={editFormErrors.price}
						/>
						<div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
							<input
								type="checkbox"
								id="available-edit"
								checked={editingService.available}
								onChange={(e) =>
									setEditingService({
										...editingService,
										available: e.target.checked,
									})
								}
								className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-400"
							/>
							<label
								htmlFor="available-edit"
								className="text-sm font-medium text-ink-700"
							>
								Available for Booking
							</label>
						</div>
					</div>
				)}
			</Modal>
		</div>
	);
};

export default ServiceTable;
