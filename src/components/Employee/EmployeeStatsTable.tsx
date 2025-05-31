import React, {useState, useEffect} from "react";
import {useAppDispatch, useAppSelector} from "../../store/Hooks";
import {
	iEmployeeStat,
	iEmployeePaymentUpdate,
	iAssignedService,
} from "../../customTypes/appDataTypes/employeeTypes";
import {RootState} from "@/store";
import {
	updateEmployeePayment,
	getAssignedServices,
} from "@/store/employee/ThunkActions";

interface EmployeeStatsTableProps {
	stats: Record<string, iEmployeeStat>;
	onRefresh: () => void;
}

interface Column {
	key: string;
	label: string;
	width: number;
	render?: (row: iEmployeeStat) => React.ReactNode;
}

const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
	}).format(amount);
};

const EmployeeStatsTable: React.FC<EmployeeStatsTableProps> = ({
	stats,
	onRefresh,
}) => {
	const [showEditModal, setShowEditModal] = useState(false);
	const [selectedEmployee, setSelectedEmployee] =
		useState<iEmployeeStat | null>(null);
	const [formData, setFormData] = useState<iEmployeePaymentUpdate>({
		employeeId: "",
		amount: 0,
		paidAt: new Date().toISOString(),
		autoPaid: false,
		assignedEmployeeIds: [],
	});

	const dispatch = useAppDispatch();
	const {bookingList} = useAppSelector(
		(state: RootState) => state.bookingReducer,
	);
	const {loading} = useAppSelector((state: RootState) => state.employeeReducer);
	const assignedServices = useAppSelector(
		(state: RootState) => state.employeeReducer.assignedServices,
	);

	useEffect(() => {
		dispatch(getAssignedServices());
	}, [dispatch]);

	// Debug logs
	useEffect(() => {
		console.log("Assigned Services:", assignedServices);
		console.log("Selected Employee:", selectedEmployee);
	}, [assignedServices, selectedEmployee]);

	console.log("Stats received in EmployeeStatsTable:", stats); // Debug log
	console.log("Stats type:", typeof stats); // Debug log
	console.log("Stats keys:", Object.keys(stats)); // Debug log

	const handleEdit = (employee: iEmployeeStat) => {
		console.log("Editing employee:", employee);
		setSelectedEmployee(employee);
		setFormData({
			employeeId: employee.employeeId,
			amount: 0,
			paidAt: new Date().toISOString(),
			autoPaid: false,
			assignedEmployeeIds: [],
		});
		setShowEditModal(true);
	};

	const handleSubmit = async () => {
		try {
			await dispatch(updateEmployeePayment(formData));
			alert("Payment updated successfully");
			setShowEditModal(false);
			onRefresh();
		} catch (error) {
			alert("Failed to update payment");
		}
	};

	const formatServiceLabel = (service: iAssignedService) => {
		const date = new Date(service.eventDate).toLocaleDateString();
		return `${date} - ${service.serviceName} - ${service.location}`;
	};

	// Get assigned services for the selected employee
	const getSelectedEmployeeServices = () => {
		if (!selectedEmployee || !assignedServices) return [];
		const employeeServices = assignedServices.find(
			(emp) => emp.employeeId === selectedEmployee.employeeId,
		);
		console.log("Found employee services:", employeeServices);
		return employeeServices?.assignedServices || [];
	};

	// Get unique service names from all employees
	const serviceColumns = Object.values(stats).reduce(
		(acc: string[], employee) => {
			employee.serviceStats.forEach((stat) => {
				if (!acc.includes(stat.serviceName)) {
					acc.push(stat.serviceName);
				}
			});
			return acc;
		},
		[],
	);

	const columns: Column[] = [
		{
			key: "name",
			label: "Employee Name",
			width: 150,
		},
		...serviceColumns.map((serviceName) => ({
			key: serviceName,
			label: serviceName,
			width: 120,
			render: (row: iEmployeeStat) => {
				const serviceStat = row.serviceStats.find(
					(s) => s.serviceName === serviceName,
				);
				return serviceStat ? serviceStat.count : 0;
			},
		})),
		{
			key: "totalServices",
			label: "Total Services",
			width: 120,
		},
		{
			key: "totalAmount",
			label: "Total Amount",
			width: 120,
			render: (row: iEmployeeStat) => formatCurrency(row.totalAmount),
		},
		{
			key: "totalPaid",
			label: "Total Paid",
			width: 120,
			render: (row: iEmployeeStat) => formatCurrency(row.totalPaid),
		},
		{
			key: "totalRemaining",
			label: "Total Remaining",
			width: 120,
			render: (row: iEmployeeStat) => formatCurrency(row.totalRemaining),
		},
		{
			key: "extraAmount",
			label: "Extra Amount",
			width: 120,
			render: (row: iEmployeeStat) => formatCurrency(row.extraAmount),
		},
		{
			key: "actions",
			label: "Actions",
			width: 100,
			render: (row: iEmployeeStat) => (
				<button
					onClick={() => handleEdit(row)}
					className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
				>
					Edit
				</button>
			),
		},
	];

	return (
		<div className="mt-8">
			<h2 className="text-2xl font-bold mb-4">Employee Statistics</h2>
			<div className="bg-white rounded-lg shadow overflow-x-auto">
				{loading ? (
					<div className="p-4 text-center">Loading...</div>
				) : !stats || Object.keys(stats).length === 0 ? (
					<div className="p-4 text-center">
						No employee statistics available
						{/* Debug info */}
						<div className="text-xs text-gray-500 mt-2">
							Stats object: {JSON.stringify(stats)}
						</div>
					</div>
				) : (
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								{columns.map((column) => (
									<th
										key={column.key}
										className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										style={{width: column.width}}
									>
										{column.label}
									</th>
								))}
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{Object.values(stats).map((employee) => (
								<tr key={employee.employeeId}>
									{columns.map((column) => (
										<td
											key={column.key}
											className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
										>
											{column.render
												? column.render(employee)
												: String(employee[column.key as keyof iEmployeeStat])}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>

			{/* Edit Modal */}
			{showEditModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
					<div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-lg font-semibold">Update Employee Payment</h3>
							<button
								onClick={() => setShowEditModal(false)}
								className="text-gray-500 hover:text-gray-700"
							>
								×
							</button>
						</div>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								handleSubmit();
							}}
							className="space-y-4"
						>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Amount
								</label>
								<input
									type="number"
									value={formData.amount}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											amount: Number(e.target.value),
										}))
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Payment Date
								</label>
								<input
									type="date"
									value={
										formData.paidAt
											? new Date(formData.paidAt).toISOString().split("T")[0]
											: ""
									}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											paidAt: new Date(e.target.value).toISOString(),
										}))
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Assigned Services
								</label>
								<select
									multiple
									value={formData.assignedEmployeeIds}
									onChange={(e) => {
										const values = Array.from(
											e.target.selectedOptions,
											(option) => option.value,
										);
										setFormData((prev) => ({
											...prev,
											assignedEmployeeIds: values,
										}));
									}}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
									size={5}
								>
									{getSelectedEmployeeServices().map((service) => (
										<option
											key={service.assignedEmployeeId}
											value={service.assignedEmployeeId}
										>
											{formatServiceLabel(service)}
										</option>
									))}
								</select>
								<p className="text-xs text-gray-500 mt-1">
									Hold Ctrl/Cmd to select multiple services
								</p>
							</div>
							<div className="flex items-center">
								<input
									type="checkbox"
									id="autoPay"
									checked={formData.autoPaid}
									onChange={(e) =>
										setFormData((prev) => ({
											...prev,
											autoPaid: e.target.checked,
										}))
									}
									className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
								/>
								<label
									htmlFor="autoPay"
									className="ml-2 block text-sm text-gray-700"
								>
									Auto Pay
								</label>
							</div>
							<div className="flex justify-end space-x-3 mt-6">
								<button
									type="button"
									onClick={() => setShowEditModal(false)}
									className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
								>
									Cancel
								</button>
								<button
									type="submit"
									className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
								>
									Update
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default EmployeeStatsTable;
