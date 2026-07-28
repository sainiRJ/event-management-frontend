import React, {useState, useEffect} from "react";
import {useAppDispatch, useAppSelector} from "../../store/Hooks";
import {useNavigate} from "react-router-dom";
import {
	getAllEmployees,
	deleteEmployee,
	updateEmployee,
	createEmployee,
	getEmployeeStats,
} from "@/store/employee/ThunkActions";
import {fetchServices} from "@/store/services/ThunkActions";
import {fetchStatus} from "@/store/status/ThunkActions";
import {RootState} from "@/store";
import {Plus, RefreshCw, Search, Filter, Edit2, Trash2} from "lucide-react";
import CustomTable from "../common/CustomTable";
import {iCreateEmployeeDTO} from "../../customTypes/appDataTypes/employeeTypes";
import {employeeValidationSchema} from "../../validations/EmployeeValidationSchema";
import Joi from "joi";
import EmployeeStatsTable from "./EmployeeStatsTable";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Modal from "../ui/Modal";
import {toast} from "sonner";

const formatDate = (dateString: string) => {
	if (!dateString) return "-";
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	}).format(date);
};

const StatusBadge = ({status}: {status: string}) => {
	let color = "bg-gray-100 text-gray-700";
	if (status?.toLowerCase() === "active" || status?.toLowerCase() === "working")
		color = "bg-emerald-100 text-emerald-700";
	if (status?.toLowerCase() === "inactive")
		color = "bg-amber-100 text-amber-700";
	if (status?.toLowerCase() === "terminated") color = "bg-red-100 text-red-700";

	return (
		<span
			className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${color} border border-white shadow-sm`}
		>
			{status}
		</span>
	);
};

const EmployeeTable = () => {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<any[]>([]);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState<string>("");
	const [selectedDesignation, setSelectedDesignation] = useState<string>("");
	const [showEditModal, setShowEditModal] = useState(false);
	const [editingEmployee, setEditingEmployee] =
		useState<iCreateEmployeeDTO | null>(null);
	const [showAddModal, setShowAddModal] = useState(false);
	const [editFormErrors, setEditFormErrors] = useState<Record<string, string>>(
		{},
	);
	const [addFormErrors, setAddFormErrors] = useState<Record<string, string>>(
		{},
	);
	const [isRefreshing, setIsRefreshing] = useState(false);

	const {employeeList} = useAppSelector(
		(state: RootState) => state.employeeReducer,
	);
	const employeeStats = useAppSelector(
		(state: RootState) => state.employeeReducer.stats?.employeeStats || {},
	);
	const {statusList} = useAppSelector(
		(state: RootState) => state.statusReducer,
	);

	const dispatch = useAppDispatch();
	const navigate = useNavigate();

	const handleRefresh = async () => {
		setIsRefreshing(true);
		setLoading(true);
		await Promise.all([
			dispatch(getAllEmployees()),
			dispatch(getEmployeeStats()),
			dispatch(fetchServices()),
			dispatch(fetchStatus()),
		]);
		setLoading(false);
		setIsRefreshing(false);
	};

	useEffect(() => {
		handleRefresh();
	}, [dispatch]);

	useEffect(() => {
		if (employeeList) {
			setData(employeeList);
			setLoading(false);
		}
	}, [employeeList]);

	const employeeStatuses = statusList
		.filter((status: any) => status.context === "employee")
		.map((status) => ({label: status.name, value: status.id}));

	const designations = Array.from(
		new Set(data.map((emp) => emp.designation)),
	).filter(Boolean);

	const handleEdit = (rowData: any) => {
		const statusOption = employeeStatuses.find(
			(status) => status.label === rowData.status,
		);

		const employeeData: iCreateEmployeeDTO = {
			id: rowData.id ?? "",
			name: rowData.name ?? "",
			email: rowData.email ?? "",
			phoneNumber: rowData.phoneNumber ?? "",
			designation: rowData.designation ?? "",
			statusId: statusOption?.value ?? "",
			joinedDate: rowData.joinedDate ?? new Date().toISOString(),
		};

		setEditingEmployee(employeeData);
		setShowEditModal(true);
	};

	const handleDelete = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this employee?")) {
			try {
				const response: any = await dispatch(deleteEmployee(id));
				if (response?.meta?.requestStatus === "fulfilled") {
					toast.success("Employee deleted successfully");
					handleRefresh();
				} else {
					toast.error(
						response?.payload?.message?.error?.message ||
							"Failed to delete employee",
					);
				}
			} catch (error) {
				toast.error("Failed to delete employee");
			}
		}
	};

	const handleAddEmployeeSubmit = async () => {
		const {error} = employeeValidationSchema.validate(formData, {
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
		try {
			const response: any = await dispatch(createEmployee(formData));
			if (response?.meta?.requestStatus === "fulfilled") {
				toast.success("Employee added successfully");
				setShowAddModal(false);
				setFormData(initialFormValue);
				handleRefresh();
			} else {
				toast.error(
					response?.payload?.message?.error?.message ||
						"Failed to add employee",
				);
			}
		} catch (error) {
			toast.error("Failed to add employee");
		}
	};

	const handleEditEmployeeSubmit = async () => {
		if (!editingEmployee) return;

		const {error} = employeeValidationSchema.validate(editingEmployee, {
			abortEarly: false,
			allowUnknown: true,
		});

		if (error) {
			const errors: Record<string, string> = {};
			error.details.forEach((detail: Joi.ValidationErrorItem) => {
				errors[detail.path[0] as string] = detail.message;
			});
			setEditFormErrors(errors);
			return;
		}

		try {
			setEditFormErrors({});
			const response: any = await dispatch(updateEmployee(editingEmployee));
			if (response?.meta?.requestStatus === "fulfilled") {
				toast.success("Employee updated successfully");
				setShowEditModal(false);
				setEditingEmployee(null);
				handleRefresh();
			} else {
				toast.error(
					response?.payload?.message?.error?.message ||
						"Failed to update employee",
				);
			}
		} catch (error) {
			toast.error("Failed to update employee");
		}
	};

	const initialFormValue: iCreateEmployeeDTO = {
		name: "",
		email: "",
		phoneNumber: "",
		designation: "",
		statusId: "",
		joinedDate: new Date().toISOString().split("T")[0],
	};

	const [formData, setFormData] =
		useState<iCreateEmployeeDTO>(initialFormValue);

	const handleFormChange = (
		field: keyof iCreateEmployeeDTO,
		value: any,
		isEdit = false,
	) => {
		if (field === "phoneNumber") {
			value = value.replace(/\D/g, "").slice(0, 10);
		}

		if (isEdit) {
			setEditingEmployee((prev) => (prev ? {...prev, [field]: value} : null));
			if (editFormErrors[field]) {
				setEditFormErrors((prev) => {
					const newErrors = {...prev};
					delete newErrors[field];
					return newErrors;
				});
			}
		} else {
			setFormData((prev) => ({...prev, [field]: value}));
			if (addFormErrors[field]) {
				setAddFormErrors((prev) => {
					const newErrors = {...prev};
					delete newErrors[field];
					return newErrors;
				});
			}
		}
	};

	const filteredData = data.filter(
		(row) =>
			(searchQuery === "" ||
				row.name?.toLowerCase().includes(searchQuery.toLowerCase())) &&
			(selectedDesignation === "" || row.designation === selectedDesignation) &&
			(selectedStatus === "" || row.status === selectedStatus),
	);

	const columns = [
		{key: "name", label: "Name"},
		{key: "designation", label: "Designation"},
		{key: "phoneNumber", label: "Phone"},
		{
			key: "status",
			label: "Status",
			render: (row: any) => <StatusBadge status={row.status || "-"} />,
		},
		{
			key: "joinedDate",
			label: "Joined Date",
			render: (row: any) => formatDate(row.joinedDate),
		},
		{
			key: "actions",
			label: "Actions",
			render: (row: any) => (
				<div className="flex gap-2">
					<Button
						variant="ghost"
						size="sm"
						icon={<Edit2 className="w-3.5 h-3.5" />}
						onClick={(e) => {
							e.stopPropagation();
							handleEdit(row);
						}}
					>
						Edit
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
						icon={<Trash2 className="w-3.5 h-3.5" />}
						onClick={(e) => {
							e.stopPropagation();
							handleDelete(row.id);
						}}
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
					<h1 className="text-3xl font-display font-semibold text-[#2B2129]">
						Employees
					</h1>
					<p className="text-gray-500 font-medium mt-1">
						Manage your workforce and monitor performance
					</p>
				</div>
				<div className="flex items-center gap-3">
					<Button
						variant="white"
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
						variant="primary"
						icon={<Plus className="w-4 h-4" />}
						onClick={() => {
							setFormData(initialFormValue);
							setShowAddModal(true);
						}}
					>
						Add Employee
					</Button>
				</div>
			</div>

			{/* Filters Section */}
			<div className="bg-white rounded-3xl p-6 border border-brand-100/70 shadow-sm space-y-6">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<Input
						placeholder="Search by name..."
						icon={<Search className="w-4 h-4" />}
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
					/>
					<Select
						placeholder="All Designations"
						icon={<Filter className="w-4 h-4" />}
						options={designations.map((d) => ({label: d, value: d}))}
						value={selectedDesignation}
						onChange={(e) => setSelectedDesignation(e.target.value)}
					/>
					<Select
						placeholder="All Statuses"
						icon={<Filter className="w-4 h-4" />}
						options={Array.from(new Set(data.map((emp) => emp.status)))
							.filter(Boolean)
							.map((s) => ({label: s, value: s}))}
						value={selectedStatus}
						onChange={(e) => setSelectedStatus(e.target.value)}
					/>
				</div>
			</div>

			<div className="rounded-2xl overflow-hidden border border-brand-100/50">
				<CustomTable
					data={filteredData}
					loading={loading}
					columns={columns}
					onRowClick={(row) => navigate(`/employee/${row.id}/details`)}
					rowKey="id"
				/>
			</div>

			{Object.keys(employeeStats).length > 0 && (
				<div className="bg-white rounded-3xl shadow-sm border border-brand-100/70 p-8">
					<h2 className="text-xl font-bold text-[#2B2129] mb-6">
						Employee Statistics
					</h2>
					<EmployeeStatsTable stats={employeeStats} onRefresh={handleRefresh} />
				</div>
			)}

			{/* Add Modal */}
			<Modal
				isOpen={showAddModal}
				onClose={() => setShowAddModal(false)}
				title="Add New Employee"
				footer={
					<>
						<Button variant="ghost" onClick={() => setShowAddModal(false)}>
							Cancel
						</Button>
						<Button onClick={handleAddEmployeeSubmit}>Add Employee</Button>
					</>
				}
			>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<Input
						label="Full Name"
						value={formData.name}
						onChange={(e) => handleFormChange("name", e.target.value)}
						error={addFormErrors.name}
						placeholder="John Doe"
					/>
					<Input
						label="Email Address"
						type="email"
						value={formData.email}
						onChange={(e) => handleFormChange("email", e.target.value)}
						error={addFormErrors.email}
						placeholder="john@example.com"
					/>
					<Input
						label="Phone Number"
						type="tel"
						value={formData.phoneNumber}
						onChange={(e) => handleFormChange("phoneNumber", e.target.value)}
						error={addFormErrors.phoneNumber}
						placeholder="10-digit number"
					/>
					<Input
						label="Designation"
						value={formData.designation}
						onChange={(e) => handleFormChange("designation", e.target.value)}
						error={addFormErrors.designation}
						placeholder="e.g. Lead Decorator"
					/>
					<Select
						label="Status"
						options={employeeStatuses}
						value={formData.statusId}
						onChange={(e) => handleFormChange("statusId", e.target.value)}
						error={addFormErrors.statusId}
					/>
					<Input
						label="Joined Date"
						type="date"
						value={
							typeof formData.joinedDate === "string"
								? formData.joinedDate.split("T")[0]
								: ""
						}
						onChange={(e) => handleFormChange("joinedDate", e.target.value)}
						error={addFormErrors.joinedDate}
					/>
				</div>
			</Modal>

			{/* Edit Modal */}
			<Modal
				isOpen={showEditModal}
				onClose={() => {
					setShowEditModal(false);
					setEditingEmployee(null);
				}}
				title="Edit Employee"
				footer={
					<>
						<Button variant="ghost" onClick={() => setShowEditModal(false)}>
							Cancel
						</Button>
						<Button onClick={handleEditEmployeeSubmit}>Save Changes</Button>
					</>
				}
			>
				{editingEmployee && (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Input
							label="Full Name"
							value={editingEmployee.name}
							onChange={(e) => handleFormChange("name", e.target.value, true)}
							error={editFormErrors.name}
						/>
						<Input
							label="Email Address"
							type="email"
							value={editingEmployee.email}
							onChange={(e) => handleFormChange("email", e.target.value, true)}
							error={editFormErrors.email}
						/>
						<Input
							label="Phone Number"
							type="tel"
							value={editingEmployee.phoneNumber}
							onChange={(e) =>
								handleFormChange("phoneNumber", e.target.value, true)
							}
							error={editFormErrors.phoneNumber}
						/>
						<Input
							label="Designation"
							value={editingEmployee.designation}
							onChange={(e) =>
								handleFormChange("designation", e.target.value, true)
							}
							error={editFormErrors.designation}
						/>
						<Select
							label="Status"
							options={employeeStatuses}
							value={editingEmployee.statusId}
							onChange={(e) =>
								handleFormChange("statusId", e.target.value, true)
							}
							error={editFormErrors.statusId}
						/>
						<Input
							label="Joined Date"
							type="date"
							value={
								typeof editingEmployee.joinedDate === "string"
									? editingEmployee.joinedDate.split("T")[0]
									: ""
							}
							onChange={(e) =>
								handleFormChange("joinedDate", e.target.value, true)
							}
							error={editFormErrors.joinedDate}
						/>
					</div>
				)}
			</Modal>
		</div>
	);
};

export default EmployeeTable;
