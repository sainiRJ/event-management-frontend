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
} from "rsuite";
import "./EmployeeTable.css";
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
import EmployeeForm from "./EmployeeForm";
import {iCreateEmployeeDTO} from "../../customTypes/appDataTypes/employeeTypes";
import {employeeValidationSchema} from "../../validations/EmployeeValidationSchema";
import {ValidationError} from "joi";

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
	const [newEmployee, setNewEmployee] = useState<iCreateEmployeeDTO>({
		name: "",
		email: "",
		phoneNumber: "",
		designation: "",
		salary: 0,
		statusId: "",
		joinedDate: new Date(),
	});
	const [addFormErrors, setAddFormErrors] = useState<any>({});
	const [editFormErrors, setEditFormErrors] = useState<any>({});

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
		setEditingEmployee(rowData);
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
		const {error} = employeeValidationSchema.validate(formValue, {
			abortEarly: false,
		});
		if (error) {
			const errors: Record<string, string> = {};
			error.details.forEach((detail) => {
				errors[detail.path[0]] = detail.message;
			});
			setEditFormErrors(errors);
			return;
		}
		setEditFormErrors({});
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

	const handleAddEmployee = async (formValue: iCreateEmployeeDTO) => {
		const {error} = employeeValidationSchema.validate(formValue, {
			abortEarly: false,
		});
		if (error) {
			const errors: Record<string, string> = {};
			error.details.forEach((detail) => {
				errors[detail.path[0]] = detail.message;
			});
			setAddFormErrors(errors);
			return;
		}
		setAddFormErrors({});
		try {
			await dispatch(createEmployee(formValue));
			toaster.push(
				<Message type="success">Employee added successfully</Message>,
			);
			setShowAddModal(false);
			handleRefresh();
		} catch (error) {
			toaster.push(<Message type="error">Failed to add employee</Message>);
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
			key: "salary",
			label: "Salary",
			width: 150,
			resizable: true,
			render: (rowData: any) => formatCurrency(rowData.salary),
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
		.filter((status) => status.context === "employee")
		.map((status) => ({label: status.name, value: status.id}));

	const employeeFormFields = [
		{
			name: "name",
			label: "Name",
			type: "text" as const,
			colSpan: 12,
		},
		{
			name: "email",
			label: "Email",
			type: "text" as const,
			colSpan: 12,
		},
		{
			name: "phoneNumber",
			label: "Phone Number",
			type: "tel" as const,
			colSpan: 12,
		},
		{
			name: "designation",
			label: "Designation",
			type: "text" as const,
			colSpan: 12,
		},
		{
			name: "salary",
			label: "Salary",
			type: "number" as const,
			colSpan: 12,
		},
		{
			name: "statusId",
			label: "Status",
			type: "select" as const,
			options: employeeStatuses,
			colSpan: 12,
		},
		{
			name: "joinedDate",
			label: "Joined Date",
			type: "date" as const,
			colSpan: 12,
		},
	];

	return (
		<div className="employee-page">
			<div className="page-header">
				<h1>Employees</h1>
				<p className="page-description">
					Manage and track all your employees in one place
				</p>
			</div>

			<div className="employee-table-wrapper">
				<div className="table-actions">
					<Stack
						spacing={10}
						justifyContent="space-between"
						alignItems="center"
					>
						<Stack spacing={10}>
							<Input
								placeholder="Search by name..."
								value={searchQuery}
								onChange={setSearchQuery}
								size="sm"
							/>
							<SelectPicker
								data={employeeStatuses}
								placeholder="Filter by status"
								value={selectedStatus}
								onChange={setSelectedStatus}
								size="sm"
								cleanable
							/>
							<SelectPicker
								data={Array.from(
									new Set(data.map((emp) => emp.designation)),
								).map((designation) => ({
									label: designation,
									value: designation,
								}))}
								placeholder="Filter by designation"
								value={selectedDesignation}
								onChange={setSelectedDesignation}
								size="sm"
								cleanable
							/>
						</Stack>
						<div>
							<h4 style={{margin: 0}}>
								{filteredData.length}{" "}
								{filteredData.length === 1 ? "Employee" : "Employees"} Found
							</h4>
						</div>
						<Stack spacing={10}>
							{selectedKeys.length > 0 && (
								<Button
									appearance="subtle"
									color="red"
									onClick={handleBulkDelete}
								>
									Delete Selected ({selectedKeys.length})
								</Button>
							)}
							<ButtonGroup>
								<Button
									appearance="primary"
									onClick={() => setShowAddModal(true)}
								>
									Add Employee
								</Button>
								<IconButton icon={<RefreshIcon />} onClick={handleRefresh}>
									Refresh
								</IconButton>
							</ButtonGroup>
						</Stack>
					</Stack>
				</div>

				<CustomTable
					data={filteredData}
					loading={loading}
					columns={columns}
					selectable
					selectedKeys={selectedKeys}
					onSelectChange={setSelectedKeys}
				/>
			</div>

			<Modal
				size="md"
				open={showEditModal}
				onClose={() => setShowEditModal(false)}
			>
				<Modal.Header>
					<Modal.Title>Edit Employee</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{editingEmployee && (
						<EmployeeForm
							formValue={editingEmployee}
							setFormValue={setEditingEmployee}
							onSubmit={handleEditSubmit}
							errors={editFormErrors}
						/>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={() => setShowEditModal(false)} appearance="subtle">
						Cancel
					</Button>
					<Button type="submit" form="employee-form" appearance="primary">
						Save Changes
					</Button>
				</Modal.Footer>
			</Modal>

			<Modal
				size="md"
				open={showAddModal}
				onClose={() => setShowAddModal(false)}
			>
				<Modal.Header>
					<Modal.Title>Add New Employee</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<EmployeeForm
						formValue={newEmployee}
						setFormValue={setNewEmployee}
						onSubmit={handleAddEmployee}
						errors={addFormErrors}
					/>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={() => setShowAddModal(false)} appearance="subtle">
						Cancel
					</Button>
					<Button type="submit" form="employee-form" appearance="primary">
						Add Employee
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default EmployeeTable;
