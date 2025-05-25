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
	DatePicker,
} from "rsuite";
import {
	getAllEmployees,
	deleteEmployee,
	updateEmployee,
	createEmployee,
} from "@/store/employee/ThunkActions";
import {fetchServices} from "@/store/services/ThunkActions";
import {fetchStatus} from "@/store/status/ThunkActions";
import {RootState} from "@/store";
import RefreshIcon from "@rsuite/icons/Reload";
import CustomTable from "../common/CustomTable";
import CustomForm from "../common/CustomForm";
import {iCreateEmployeeDTO} from "../../customTypes/appDataTypes/employeeTypes";
import {employeeValidationSchema} from "../../validations/EmployeeValidationSchema";
import Joi from "joi";
import DetailsModal from "../common/DetailsModal";

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(date);
};

const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
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

const EmployeeTable = () => {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<any[]>([]);
	const [filteredData, setFilteredData] = useState<any[]>([]);
	const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
	const [selectedDesignation, setSelectedDesignation] = useState<string | null>(
		null,
	);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editingEmployee, setEditingEmployee] =
		useState<iCreateEmployeeDTO | null>(null);
	const [showAddModal, setShowAddModal] = useState(false);
	const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
	const [modalOpen, setModalOpen] = useState(false);
	const [filter, setFilter] = useState({name: "", designation: "", status: ""});
	const [addFormErrors, setAddFormErrors] = useState<Record<string, string>>(
		{},
	);
	const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>(
		{},
	);

	const {employeeList} = useAppSelector(
		(state: RootState) => state.employeeReducer,
	);
	const dispatch = useAppDispatch();

	const handleRefresh = () => {
		setLoading(true);
		dispatch(getAllEmployees());
	};

	useEffect(() => {
		dispatch(fetchServices());
		dispatch(fetchStatus());
	}, [dispatch]);

	const handleEdit = (rowData: any) => {
		setEditingEmployee({
			id: rowData.id ?? "",
			name: rowData.name ?? "",
			email: rowData.email ?? "",
			phoneNumber: rowData.phoneNumber ?? "",
			designation: rowData.designation ?? "",
			statusId: rowData.statusId ?? "",
			joinedDate: rowData.joinedDate ?? "",
		});
		setShowEditModal(true);
	};

	const handleDelete = async (rowData: any) => {
		try {
			await dispatch(deleteEmployee(rowData.id));
			toaster.push(
				<Message type="success">Employee deleted successfully</Message>,
			);
			handleRefresh();
		} catch (error) {
			toaster.push(<Message type="error">Failed to delete employee</Message>);
		}
	};

	const handleBulkDelete = async () => {
		if (selectedKeys.length === 0) {
			toaster.push(
				<Message type="warning">Please select employees to delete</Message>,
			);
			return;
		}

		try {
			await dispatch(deleteEmployee(selectedKeys));
			toaster.push(
				<Message type="success">
					Selected employees deleted successfully
				</Message>,
			);
			setSelectedKeys([]);
			handleRefresh();
		} catch (error) {
			toaster.push(<Message type="error">Failed to delete employees</Message>);
		}
	};

	const handleEditSubmit = async (formValue: iCreateEmployeeDTO) => {
		try {
			await dispatch(updateEmployee(formValue));
			toaster.push(
				<Message type="success">Employee updated successfully</Message>,
			);
			setShowEditModal(false);
			handleRefresh();
		} catch (error) {
			toaster.push(<Message type="error">Failed to update employee</Message>);
		}
	};

	useEffect(() => {
		dispatch(getAllEmployees());
	}, [dispatch]);

	useEffect(() => {
		if (employeeList) {
			setData(employeeList);
			setLoading(false);
		}
	}, [employeeList]);

	useEffect(() => {
		let filtered = [...data];

		if (searchQuery) {
			filtered = filtered.filter((employee) =>
				employee.name.toLowerCase().includes(searchQuery.toLowerCase()),
			);
		}

		if (selectedStatus) {
			filtered = filtered.filter(
				(employee) =>
					employee.status.toLowerCase() === selectedStatus.toLowerCase(),
			);
		}

		if (selectedDesignation) {
			filtered = filtered.filter(
				(employee) => employee.designation === selectedDesignation,
			);
		}

		setFilteredData(filtered);
	}, [data, searchQuery, selectedStatus, selectedDesignation]);

	const columns = [
		{
			key: "name",
			label: "Name",
			width: 200,
			resizable: true,
		},
		{
			key: "email",
			label: "Email",
			width: 250,
			resizable: true,
		},
		{
			key: "phoneNumber",
			label: "Phone Number",
			width: 150,
			resizable: true,
		},
		{
			key: "designation",
			label: "Designation",
			width: 200,
			resizable: true,
		},
		{
			key: "status",
			label: "Status",
			width: 120,
			resizable: true,
		},
		{
			key: "joinedDate",
			label: "Joined Date",
			width: 150,
			resizable: true,
			render: (rowData: any) => formatDate(rowData.joinedDate),
		},
		{
			key: "actions",
			label: "Actions",
			width: 120,
			render: (rowData: any) => (
				<Button
					size="sm"
					onClick={() => handleEdit(rowData)}
					appearance="subtle"
				>
					Edit
				</Button>
			),
		},
	];

	const {statusList} = useAppSelector(
		(state: RootState) => state.statusReducer,
	);

	const employeeStatuses = statusList
		.filter((status: any) => status.context === "employee")
		.map((status) => ({label: status.name, value: status.id}));

	const employeeFields = [
		{
			name: "name",
			label: "Name",
			type: "text" as const,
		},
		{
			name: "email",
			label: "Email",
			type: "text" as const,
		},
		{
			name: "phoneNumber",
			label: "Phone Number",
			type: "text" as const,
		},
		{
			name: "designation",
			label: "Designation",
			type: "text" as const,
		},
		{
			name: "status",
			label: "Status",
			type: "select" as const,
			options: employeeStatuses.map((s) => ({label: s.label, value: s.value})),
		},
		{
			name: "joinedDate",
			label: "Joined Date",
			type: "date" as const,
		},
	];

	// Filter logic
	const filtered = data.filter(
		(row) =>
			(filter.name === "" ||
				row.name?.toLowerCase().includes(filter.name.toLowerCase())) &&
			(filter.designation === "" ||
				row.designation
					?.toLowerCase()
					.includes(filter.designation.toLowerCase())) &&
			(filter.status === "" || row.status === filter.status),
	);

	// Modal handlers
	const handleRowClick = (row: any) => {
		setSelectedEmployee(row);
		setModalOpen(true);
	};
	const handleModalClose = () => {
		setModalOpen(false);
		setSelectedEmployee(null);
	};
	const handleModalSave = async (updated: any) => {
		await dispatch(updateEmployee(updated));
		setModalOpen(false);
		setSelectedEmployee(null);
		dispatch(getAllEmployees());
	};

	// Get unique designations and statuses for filter dropdowns
	const designations = Array.from(
		new Set(data.map((emp) => emp.designation)),
	).filter(Boolean);
	const statuses = Array.from(new Set(data.map((emp) => emp.status))).filter(
		Boolean,
	);

	// Helper to format date as YYYY-MM-DD
	const toDateInputString = (date: Date | string) => {
		if (!date) return "";
		if (typeof date === "string") return date.slice(0, 10);
		return date.toISOString().slice(0, 10);
	};

	const [newEmployee, setNewEmployee] = useState<iCreateEmployeeDTO>({
		name: "",
		email: "",
		phoneNumber: "",
		designation: "",
		statusId: "",
		joinedDate: new Date().toISOString(),
	});

	// For DetailsModal, always pass joinedDate as string
	const selectedEmployeeForModal = selectedEmployee
		? {
				...selectedEmployee,
				joinedDate: toDateInputString(selectedEmployee.joinedDate),
		  }
		: null;

	const employeeTableColumns = [
		{
			key: "name",
			label: "Name",
		},
		{
			key: "designation",
			label: "Designation",
		},
		{
			key: "phoneNumber",
			label: "Phone Number",
		},
		{
			key: "status",
			label: "Status",
			render: (row: any) => <StatusBadge status={row.status || "-"} />,
		},
	];

	// Add/Edit Employee Form fields
	const employeeFormFields: {
		name: keyof iCreateEmployeeDTO;
		label: string;
		type: "text" | "date" | "select";
		options?: {label: string; value: string}[];
	}[] = [
		{
			name: "name",
			label: "Name",
			type: "text",
		},
		{
			name: "email",
			label: "Email",
			type: "text",
		},
		{
			name: "phoneNumber",
			label: "Phone Number",
			type: "text",
		},
		{
			name: "designation",
			label: "Designation",
			type: "text",
		},
		{
			name: "statusId",
			label: "Status",
			type: "select",
			options: employeeStatuses.map((s) => ({label: s.label, value: s.value})),
		},
		{
			name: "joinedDate",
			label: "Joined Date",
			type: "date",
		},
	];

	// Use real status options from Redux
	const statusOptions = statusList
		.filter((status) => status.context === "employee")
		.map((status) => ({label: status.name, value: status.id}));

	// Add Employee Modal Handlers
	const handleAddEmployeeSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const {error} = employeeValidationSchema.validate(newEmployee, {
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
		await dispatch(createEmployee(newEmployee));
		setShowAddModal(false);
		setNewEmployee({
			name: "",
			email: "",
			phoneNumber: "",
			designation: "",
			statusId: "",
			joinedDate: new Date().toISOString(),
		});
		handleRefresh();
	};

	// Edit Employee Modal Handlers
	const handleEditEmployeeSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editingEmployee) return;
		const {error} = employeeValidationSchema.validate(editingEmployee, {
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
		await dispatch(updateEmployee(editingEmployee));
		setShowEditModal(false);
		setEditingEmployee(null);
		handleRefresh();
	};

	const initialFormValue: iCreateEmployeeDTO = {
		name: "",
		email: "",
		phoneNumber: "",
		designation: "",
		statusId: "",
		joinedDate: new Date().toISOString(),
	};

	const [formData, setFormData] =
		useState<iCreateEmployeeDTO>(initialFormValue);

	const handleFormChange = (field: keyof iCreateEmployeeDTO, value: any) => {
		setFormData((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const renderFormField = (field: {
		name: keyof iCreateEmployeeDTO;
		label: string;
		type: "text" | "date" | "select";
		options?: {label: string; value: string}[];
	}) => {
		switch (field.type) {
			case "text":
				return (
					<Input
						key={field.name}
						value={formData[field.name] as string}
						onChange={(value) => handleFormChange(field.name, value)}
						placeholder={`Enter ${field.label.toLowerCase()}`}
					/>
				);
			case "date":
				return (
					<DatePicker
						key={field.name}
						value={
							formData[field.name]
								? new Date(formData[field.name] as string)
								: null
						}
						onChange={(value) =>
							handleFormChange(field.name, value?.toISOString())
						}
						placeholder={`Select ${field.label.toLowerCase()}`}
					/>
				);
			case "select":
				return (
					<SelectPicker
						key={field.name}
						value={formData[field.name] as string}
						onChange={(value) => handleFormChange(field.name, value)}
						data={field.options || []}
						placeholder={`Select ${field.label.toLowerCase()}`}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen bg-gray-50 py-8 px-4 mt-10">
			<div className="max-w-7xl mx-auto">
				<div className="bg-white rounded-lg shadow p-8 mb-8">
					{/* Filters */}
					<h1 className="text-3xl font-bold mb-2">Employees</h1>

					<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4 sticky top-0 z-10 py-2">
						<div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
							<input
								type="text"
								placeholder="Filter by name"
								className="border rounded px-3 py-2 text-sm w-full md:w-48"
								value={filter.name}
								onChange={(e) =>
									setFilter((f) => ({...f, name: e.target.value}))
								}
							/>
							<select
								className="border rounded px-3 py-2 text-sm w-full md:w-40"
								value={filter.designation}
								onChange={(e) =>
									setFilter((f) => ({...f, designation: e.target.value}))
								}
							>
								<option value="">All Designations</option>
								{designations.map((d) => (
									<option key={d} value={d}>
										{d}
									</option>
								))}
							</select>
							<select
								className="border rounded px-3 py-2 text-sm w-full md:w-40"
								value={filter.status}
								onChange={(e) =>
									setFilter((f) => ({...f, status: e.target.value}))
								}
							>
								<option value="">All Statuses</option>
								{statuses.map((s) => (
									<option key={s} value={s}>
										{s}
									</option>
								))}
							</select>
						</div>
						<button
							onClick={() => setShowAddModal(true)}
							className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-semibold transition w-full md:w-auto"
						>
							+ Add New Employee
						</button>
					</div>
					{/* Table */}
					<CustomTable
						data={filtered}
						loading={loading}
						columns={employeeTableColumns}
						onRowClick={handleRowClick}
						rowKey="id"
					/>
					{/* Details Modal */}
					<DetailsModal
						open={modalOpen}
						onClose={handleModalClose}
						data={selectedEmployeeForModal}
						onSave={handleModalSave}
						title="Employee Details"
						fields={employeeFields}
					/>
				</div>
			</div>
			{/* Add New Employee Modal */}
			{showAddModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
					<div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
						<h2 className="text-xl font-semibold mb-4">Add New Employee</h2>
						<form onSubmit={handleAddEmployeeSubmit} id="add-employee-form">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{employeeFormFields.map((field) => (
									<div key={field.name} className="col-span-1 flex flex-col">
										<label className="block text-sm font-medium text-gray-700 mb-1">
											{field.label}
										</label>
										{renderFormField(field)}
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
									Add Employee
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Edit Employee Modal */}
			{showEditModal && editingEmployee && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
					<div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
						<h2 className="text-xl font-semibold mb-4">Edit Employee</h2>
						<form onSubmit={handleEditEmployeeSubmit} id="edit-employee-form">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{employeeFormFields.map((field) => (
									<div key={field.name} className="col-span-1 flex flex-col">
										<label className="block text-sm font-medium text-gray-700 mb-1">
											{field.label}
										</label>
										{renderFormField(field)}
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

export default EmployeeTable;
