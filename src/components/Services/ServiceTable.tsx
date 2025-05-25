import React, {useState, useEffect} from "react";
import {useAppDispatch, useAppSelector} from "../../store/Hooks";
import {
	Stack,
	Button,
	IconButton,
	ButtonGroup,
	Modal,
	toaster,
	Message,
	Input,
	SelectPicker,
	Divider,
} from "rsuite";
import {fetchServices} from "@/store/services/ThunkActions";
import {RootState} from "@/store";
import RefreshIcon from "@rsuite/icons/Reload";
import CustomTable from "../common/CustomTable";
import CustomForm from "../common/CustomForm";
import Joi from "joi";
import DetailsModal from "../common/DetailsModal";
import {iService} from "@/store/services/Types";
import {iCreateServiceDTO} from "@/customTypes/appDataTypes/serviceTypes";
import {createService, updateService} from "@/store/services/ThunkActions";

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(date);
};

const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
	}).format(amount);
};

const StatusBadge = ({status}: {status: string}) => {
	let color = "bg-gray-200 text-gray-700";
	if (status?.toLowerCase() === "active") color = "bg-green-100 text-green-700";
	if (status?.toLowerCase() === "inactive")
		color = "bg-yellow-100 text-yellow-700";
	if (status?.toLowerCase() === "terminated") color = "bg-red-100 text-red-700";
	return (
		<span className={`px-2 py-1 rounded text-xs font-semibold ${color}`}>
			{status}
		</span>
	);
};

// Types for DetailsModal (no checkbox)
type DetailsFormFieldType = "text" | "textarea" | "number" | "select" | "date";
interface DetailsFormField {
	name: keyof iCreateServiceDTO;
	label: string;
	type: DetailsFormFieldType;
	options?: {label: string; value: string}[];
}

// Types for Add/Edit modals (can use checkbox)
type ModalFormFieldType = DetailsFormFieldType | "checkbox";
interface ModalFormField {
	name: keyof iCreateServiceDTO;
	label: string;
	type: ModalFormFieldType;
	options?: {label: string; value: string}[];
}

const ServiceTable = () => {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<iService[]>([]);
	const [filteredData, setFilteredData] = useState<iService[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [showEditModal, setShowEditModal] = useState(false);
	const [editingService, setEditingService] =
		useState<iCreateServiceDTO | null>(null);
	const [showAddModal, setShowAddModal] = useState(false);
	const [selectedService, setSelectedService] = useState<iService | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [filter, setFilter] = useState({name: ""});
	const [addFormErrors, setAddFormErrors] = useState<Record<string, string>>(
		{},
	);
	const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>(
		{},
	);

	const {serviceList} = useAppSelector(
		(state: RootState) => state.serviceReducer,
	);
	const dispatch = useAppDispatch();

	const handleRefresh = () => {
		setLoading(true);
		dispatch(fetchServices());
	};

	useEffect(() => {
		dispatch(fetchServices());
	}, [dispatch]);

	const handleEdit = (rowData: iService) => {
		setModalOpen(false);
		setEditingService({
			id: rowData.id ?? "",
			serviceName: rowData.serviceName ?? "",
			description: rowData.description ?? null,
			price: rowData.price ?? "",
			available: rowData.available ?? false,
		});
		setShowEditModal(true);
	};

	const handleDelete = async (rowData: iService) => {
		console.log("Delete service:", rowData);
		toaster.push(
			<Message type="info">Delete functionality not yet implemented</Message>,
		);
	};

	const handleEditSubmit = async (formValue: iCreateServiceDTO) => {
		console.log("Update service:", formValue);
		toaster.push(
			<Message type="info">Update functionality not yet implemented</Message>,
		);
		setShowEditModal(false);
	};

	useEffect(() => {
		handleRefresh();
	}, [dispatch]);

	useEffect(() => {
		if (serviceList) {
			setData(serviceList);
			setLoading(false);
		}
	}, [serviceList]);

	useEffect(() => {
		let filtered = [...data];

		if (searchQuery) {
			filtered = filtered.filter((service) =>
				service.serviceName.toLowerCase().includes(searchQuery.toLowerCase()),
			);
		}

		setFilteredData(filtered);
	}, [data, searchQuery]);

	const columns = [
		{
			key: "serviceName",
			label: "Service Name",
			width: 250,
			resizable: true,
		},
		{
			key: "description",
			label: "Description",
			width: 400,
			resizable: true,
		},
		{
			key: "price",
			label: "Price",
			width: 100,
			resizable: true,
			render: (rowData: iService) => formatCurrency(parseFloat(rowData.price)),
		},
		{
			key: "available",
			label: "Available",
			width: 100,
			resizable: true,
			render: (rowData: iService) => (rowData.available ? "Yes" : "No"),
		},
		{
			key: "actions",
			label: "Actions",
			width: 150,
			render: (rowData: iService) => (
				<Stack divider={<Divider />} spacing={5}>
					<Button
						size="sm"
						onClick={() => handleEdit(rowData)}
						appearance="subtle"
					>
						Edit
					</Button>
					<Button
						size="sm"
						onClick={() => handleDelete(rowData)}
						appearance="subtle"
						color="red"
					>
						Delete
					</Button>
				</Stack>
			),
		},
	];

	// For DetailsModal (display only, no checkbox)
	const serviceDetailsFields: DetailsFormField[] = [
		{name: "serviceName", label: "Service Name", type: "text"},
		{name: "description", label: "Description", type: "textarea"},
		{name: "price", label: "Price", type: "number"},
		{name: "available", label: "Available", type: "text"}, // show as Yes/No
	];

	// For Add/Edit modals (can use checkbox)
	const serviceModalFields: ModalFormField[] = [
		{name: "serviceName", label: "Service Name", type: "text"},
		{name: "description", label: "Description", type: "textarea"},
		{name: "price", label: "Price", type: "number"},
		{name: "available", label: "Available", type: "checkbox"},
	];

	const handleRowClick = (row: iService) => {
		setShowEditModal(false);
		setSelectedService(row);
		setModalOpen(true);
	};
	const handleModalClose = () => {
		setModalOpen(false);
		setSelectedService(null);
	};
	const handleModalSave = async (updated: iService) => {
		console.log("Save service details:", updated);
		try {
			const serviceToUpdate = {
				...updated,
				price: String(updated.price),
				available:
					typeof updated.available === "boolean"
						? updated.available
						: updated.available === "Yes",
			};
			const result = await dispatch(updateService(serviceToUpdate)).unwrap();
			toaster.push(
				<Message type="success">Service updated successfully!</Message>,
			);
			handleRefresh();
			setModalOpen(false);
			setSelectedService(null);
		} catch (error: any) {
			console.error("Failed to update service:", error);
			const errorMessage = getErrorMessage(error);
			toaster.push(
				<Message type="error">
					Failed to update service: {errorMessage}
				</Message>,
			);
		}
	};

	const toDateInputString = (date: Date | string) => {
		if (!date) return "";
		if (typeof date === "string") return date.slice(0, 10);
		return date.toISOString().slice(0, 10);
	};

	const [newService, setNewService] = useState<iCreateServiceDTO>({
		serviceName: "",
		description: null,
		price: "",
		available: false,
	});

	const selectedServiceForModal = selectedService ? {...selectedService} : null;

	const serviceTableColumns = columns;

	const serviceValidationSchema = Joi.object({
		serviceName: Joi.string().required().messages({
			"string.empty": "Service Name is required",
			"any.required": "Service Name is required",
		}),
		description: Joi.string().allow(null, ""),
		price: Joi.number().required().messages({
			"number.base": "Price must be a number",
			"any.required": "Price is required",
		}),
		available: Joi.boolean().required(),
	});

	// Helper to extract error message as string
	function getErrorMessage(error: any): string {
		if (typeof error === "string") {
			return error;
		} else if (error?.message) {
			return error.message;
		} else if (error?.error) {
			return error.error;
		} else if (error?.data?.message) {
			return error.data.message;
		} else if (typeof error === "object") {
			return JSON.stringify(error);
		}
		return "Unknown error";
	}

	const handleAddServiceSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const {error} = serviceValidationSchema.validate(newService, {
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
		setAddFormErrors({});
		console.log("Add new service:", newService);
		try {
			const serviceToAdd = {
				...newService,
				price: String(newService.price),
				available: Boolean(newService.available),
			};
			const result = await dispatch(createService(serviceToAdd)).unwrap();
			toaster.push(
				<Message type="success">Service added successfully!</Message>,
			);
			setShowAddModal(false);
			setNewService({
				serviceName: "",
				description: null,
				price: "",
				available: false,
			});
			handleRefresh();
		} catch (error: any) {
			console.error("Failed to add service:", error);
			const errorMessage = getErrorMessage(error);
			toaster.push(
				<Message type="error">Failed to add service: {errorMessage}</Message>,
			);
		}
	};

	const handleEditServiceSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingService) return;
		const {error} = serviceValidationSchema.validate(editingService, {
			abortEarly: false,
		});
		if (error) {
			const errors: Record<string, string> = {};
			error.details.forEach((detail: Joi.ValidationErrorItem) => {
				errors[detail.path[0] as string] = detail.message;
			});
			setEditFormErrors(errors);
			return;
		}
		setEditFormErrors({});
		console.log("Update service:", editingService);
		try {
			const serviceToUpdate = {
				...editingService,
				price: String(editingService.price),
				available: Boolean(editingService.available),
			};
			const result = await dispatch(updateService(serviceToUpdate)).unwrap();
			toaster.push(
				<Message type="success">Service updated successfully!</Message>,
			);
			setShowEditModal(false);
			setEditingService(null);
			handleRefresh();
		} catch (error: any) {
			console.error("Failed to update service:", error);
			const errorMessage = getErrorMessage(error);
			toaster.push(
				<Message type="error">
					Failed to update service: {errorMessage}
				</Message>,
			);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8 px-4 mt-10">
			<div className="max-w-7xl mx-auto">
				<div className="bg-white rounded-lg shadow p-8 mb-8">
					{/* Filters */}
					<h1 className="text-3xl font-bold mb-2">Services</h1>

					<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4 sticky top-0 z-10 py-2">
						<div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
							<input
								type="text"
								placeholder="Filter by service name"
								className="border rounded px-3 py-2 text-sm w-full md:w-48"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
							/>
						</div>
						<button
							onClick={() => setShowAddModal(true)}
							className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-semibold transition w-full md:w-auto"
						>
							+ Add New Service
						</button>
					</div>
					{/* Table */}
					<CustomTable
						data={filteredData}
						loading={loading}
						columns={serviceTableColumns}
						onRowClick={handleRowClick}
						rowKey="id"
					/>
					{/* Details Modal */}
					{modalOpen && !showEditModal && (
						<DetailsModal
							open={modalOpen}
							onClose={handleModalClose}
							data={
								selectedServiceForModal
									? {
											...selectedServiceForModal,
											available: selectedServiceForModal.available
												? "Yes"
												: "No",
									  }
									: null
							}
							onSave={handleModalSave}
							title="Service Details"
							fields={serviceDetailsFields}
						/>
					)}
				</div>
			</div>
			{/* Add New Service Modal */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
					<div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
						<h2 className="text-xl font-semibold mb-4">Add New Service</h2>
						<form onSubmit={handleAddServiceSubmit} id="add-service-form">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{serviceModalFields.map((field: ModalFormField) => (
									<div key={field.name} className="col-span-1 flex flex-col">
										<label className="block text-sm font-medium text-gray-700 mb-1">
											{field.label}
										</label>
										{field.type === "checkbox" ? (
											<input
												type="checkbox"
												name={field.name}
												checked={!!newService[field.name]}
												onChange={(e) =>
													setNewService({
														...newService,
														[field.name]: e.target.checked,
													})
												}
												className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
											/>
										) : field.type === "select" ? (
											<select
												name={field.name}
												value={(newService[field.name] as string) || ""}
												onChange={(e) =>
													setNewService({
														...newService,
														[field.name]: e.target.value,
													})
												}
												className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
													addFormErrors[field.name] ? "border-red-500" : ""
												}`}
											>
												<option value="">Select {field.label}</option>
												{field.options?.map(
													(option: {label: string; value: string}) => (
														<option key={option.value} value={option.value}>
															{option.label}
														</option>
													),
												)}
											</select>
										) : field.type === "textarea" ? (
											<textarea
												name={field.name}
												value={(newService[field.name] as string) || ""}
												onChange={(e) =>
													setNewService({
														...newService,
														[field.name]: e.target.value,
													})
												}
												className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
													addFormErrors[field.name] ? "border-red-500" : ""
												}`}
											/>
										) : field.type === "number" ? (
											<input
												type="number"
												name={field.name}
												value={(newService[field.name] as string) || ""}
												onChange={(e) =>
													setNewService({
														...newService,
														[field.name]: e.target.value,
													})
												}
												className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
													addFormErrors[field.name] ? "border-red-500" : ""
												}`}
											/>
										) : (
											<input
												type="text"
												name={field.name}
												value={(newService[field.name] as string) || ""}
												onChange={(e) =>
													setNewService({
														...newService,
														[field.name]: e.target.value,
													})
												}
												className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
													addFormErrors[field.name] ? "border-red-500" : ""
												}`}
											/>
										)}
										{addFormErrors[field.name] && (
											<span className="text-xs text-red-600 mt-1">
												{addFormErrors[field.name]}
											</span>
										)}
									</div>
								))}
							</div>
							<div className="flex justify-end gap-2 mt-6">
								<button
									type="button"
									onClick={() => setShowAddModal(false)}
									className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
								>
									Add Service
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Edit Service Modal */}
			{showEditModal && editingService && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
					<div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
						<h2 className="text-xl font-semibold mb-4">Edit Service</h2>
						<form onSubmit={handleEditServiceSubmit} id="edit-service-form">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{serviceModalFields.map((field: ModalFormField) => (
									<div key={field.name} className="col-span-1 flex flex-col">
										<label className="block text-sm font-medium text-gray-700 mb-1">
											{field.label}
										</label>
										{field.type === "checkbox" ? (
											<input
												type="checkbox"
												name={field.name}
												checked={!!editingService[field.name]}
												onChange={(e) =>
													setEditingService((prev) => ({
														...prev!,
														[field.name]: e.target.checked,
													}))
												}
												className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
											/>
										) : field.type === "select" ? (
											<select
												name={field.name}
												value={(editingService[field.name] as string) || ""}
												onChange={(e) =>
													setEditingService((prev) => ({
														...prev!,
														[field.name]: e.target.value,
													}))
												}
												className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
													editFormErrors[field.name] ? "border-red-500" : ""
												}`}
											>
												<option value="">Select {field.label}</option>
												{field.options?.map(
													(option: {label: string; value: string}) => (
														<option key={option.value} value={option.value}>
															{option.label}
														</option>
													),
												)}
											</select>
										) : field.type === "textarea" ? (
											<textarea
												name={field.name}
												value={(editingService[field.name] as string) || ""}
												onChange={(e) =>
													setEditingService((prev) => ({
														...prev!,
														[field.name]: e.target.value,
													}))
												}
												className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
													editFormErrors[field.name] ? "border-red-500" : ""
												}`}
											/>
										) : field.type === "number" ? (
											<input
												type="number"
												name={field.name}
												value={(editingService[field.name] as string) || ""}
												onChange={(e) =>
													setEditingService((prev) => ({
														...prev!,
														[field.name]: e.target.value,
													}))
												}
												className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
													editFormErrors[field.name] ? "border-red-500" : ""
												}`}
											/>
										) : field.type === "text" ? (
											<input
												type="text"
												name={field.name}
												value={(editingService[field.name] as string) || ""}
												onChange={(e) =>
													setEditingService((prev) => ({
														...prev!,
														[field.name]: e.target.value,
													}))
												}
												className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
													editFormErrors[field.name] ? "border-red-500" : ""
												}`}
											/>
										) : null}
										{editFormErrors[field.name] && (
											<span className="text-xs text-red-600 mt-1">
												{editFormErrors[field.name]}
											</span>
										)}
									</div>
								))}
							</div>
							<div className="flex justify-end gap-2 mt-6">
								<button
									type="button"
									onClick={() => setShowEditModal(false)}
									className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded mr-2"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
								>
									Save Changes
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default ServiceTable;
