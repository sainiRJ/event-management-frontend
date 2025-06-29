import React, {useState, useEffect, useRef} from "react";
import {useParams} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "@/store/Hooks";
import {
	getAssignedServices,
	getEmployeeServiceHistory,
	updateEmployeePayment,
} from "@/store/employee/ThunkActions";
import {
	iAssignedService,
	iEmployeePaymentUpdate,
	iEmployeeStat,
} from "@/customTypes/appDataTypes/employeeTypes";
import {DatePicker, SelectPicker} from "rsuite";

const formatDate = (dateString: string | Date) => {
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

const EmployeeServiceHistory: React.FC = () => {
	const {employeeId} = useParams<{employeeId: string}>();
	const dispatch = useAppDispatch();
	const {serviceHistory, loading} = useAppSelector(
		(state) => state.employeeReducer,
	);
	const [showEditModal, setShowEditModal] = useState(false);
	const hasFetchedServices = useRef(false);
	const [selectedEmployee, setSelectedEmployee] =
		useState<iAssignedService | null>(null);
	const [formData, setFormData] = useState<iEmployeePaymentUpdate>({
		employeeId: "",
		amount: 0,
		paidAt: new Date().toISOString(),
		autoPaid: false,
		assignedEmployeeIds: [],
	});
	const [filters, setFilters] = useState({
		serviceName: "",
		startDate: null as Date | null,
		endDate: null as Date | null,
		isPaid: null as boolean | null,
	});

	useEffect(() => {
		if (employeeId) {
			dispatch(getEmployeeServiceHistory(employeeId));
		}
	}, [dispatch, employeeId]);

	useEffect(() => {
		if (showEditModal && !hasFetchedServices.current) {
			dispatch(getAssignedServices());
			hasFetchedServices.current = true;
		}
	}, [showEditModal, dispatch]);

	useEffect(() => {
		if (!showEditModal) {
			hasFetchedServices.current = false;
		}
	}, [showEditModal]);

	const handleEdit = (service: iAssignedService) => {
		setSelectedEmployee(service);
		setFormData({
			employeeId: employeeId || "",
			amount: service.amount,
			paidAt: new Date().toISOString(),
			autoPaid: false,
			assignedEmployeeIds: [service.assignedEmployeeId],
		});
		setShowEditModal(true);
	};

	const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = parseFloat(e.target.value);
		setFormData((prev) => ({
			...prev,
			amount: isNaN(value) ? 0 : value,
		}));
	};

	const getSelectedEmployeeServices = () => {
		return (
			serviceHistory?.assignedServices.filter(
				(service) => service.isPaid === false,
			) || []
		);
	};

	const handleServiceSelection = (assignedEmployeeId: string) => {
		setFormData((prev) => {
			const alreadySelected =
				prev.assignedEmployeeIds?.includes(assignedEmployeeId);
			return {
				...prev,
				assignedEmployeeIds: alreadySelected
					? prev.assignedEmployeeIds?.filter((id) => id !== assignedEmployeeId)
					: [...(prev.assignedEmployeeIds || []), assignedEmployeeId],
			};
		});
	};

	const formatServiceLabel = (service: iAssignedService) => {
		return `${service.serviceName} (${formatDate(
			service.eventDate,
		)}) - ${formatCurrency(service.amount)}`;
	};

	const handleSubmit = async () => {
		try {
			let assignedEmployeeIdsToSend = formData.assignedEmployeeIds;
			if (formData.autoPaid) {
				// If autoPaid is true, send all unpaid assignedEmployeeIds
				assignedEmployeeIdsToSend = getSelectedEmployeeServices().map(
					(service) => service.assignedEmployeeId,
				);
			} else {
				// If autoPaid is false, send only selected ids (already in formData.assignedEmployeeIds)
				assignedEmployeeIdsToSend = formData.assignedEmployeeIds;
			}
			await dispatch(
				updateEmployeePayment({
					...formData,
					assignedEmployeeIds: assignedEmployeeIdsToSend,
				}),
			);
			alert("Payment updated successfully");
			setShowEditModal(false);
			// onRefresh();
		} catch (error) {
			alert("Failed to update payment");
		}
	};

	const filteredServices =
		serviceHistory?.assignedServices.filter((service) => {
			const matchesService =
				!filters.serviceName || service.serviceName === filters.serviceName;

			const serviceDate = new Date(service.eventDate);
			const matchesDate =
				(!filters.startDate || serviceDate >= filters.startDate) &&
				(!filters.endDate || serviceDate <= filters.endDate);

			const matchesPayment =
				filters.isPaid === null || service.isPaid === filters.isPaid;

			return matchesService && matchesDate && matchesPayment;
		}) || [];

	const totalServices = filteredServices.length;
	const totalAmount = filteredServices.reduce(
		(sum, service) => sum + service.amount,
		0,
	);
	const totalPaid = filteredServices
		.filter((service) => service.isPaid)
		.reduce((sum, service) => sum + service.amount, 0);
	const totalUnpaid = totalAmount - totalPaid;

	const uniqueServiceNames = Array.from(
		new Set(serviceHistory?.assignedServices.map((s) => s.serviceName) || []),
	).map((name) => ({label: name, value: name}));

	const handleDateSelect = (date: Date | null) => {
		if (!date) return;

		if (!filters.startDate) {
			setFilters((prev) => ({...prev, startDate: date}));
		} else if (!filters.endDate) {
			if (date < filters.startDate) {
				// If selected date is before start date, swap them
				setFilters((prev) => ({
					...prev,
					startDate: date,
					endDate: prev.startDate,
				}));
			} else {
				setFilters((prev) => ({...prev, endDate: date}));
			}
		} else {
			// Reset and start new selection
			setFilters((prev) => ({
				...prev,
				startDate: date,
				endDate: null,
			}));
		}
	};

	const clearDateRange = () => {
		setFilters((prev) => ({
			...prev,
			startDate: null,
			endDate: null,
		}));
	};

	return (
		<div className="min-h-screen bg-gray-50 space-y-10 py-8 px-4 mt-10">
			<div className="max-w-7xl mx-auto">
				<div className="bg-white rounded-lg shadow p-8">
					<h1 className="text-3xl font-bold mb-2">
						Service History - {serviceHistory?.employeeName}
					</h1>

					{/* Summary Cards */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
						<div className="bg-blue-50 p-4 rounded-lg">
							<h3 className="text-sm font-medium text-blue-600">
								Total Services
							</h3>
							<p className="text-2xl font-bold text-blue-700">
								{totalServices}
							</p>
						</div>
						<div className="bg-green-50 p-4 rounded-lg">
							<h3 className="text-sm font-medium text-green-600">
								Total Amount
							</h3>
							<p className="text-2xl font-bold text-green-700">
								{formatCurrency(totalAmount)}
							</p>
						</div>
						<div className="bg-purple-50 p-4 rounded-lg">
							<h3 className="text-sm font-medium text-purple-600">
								Total Paid
							</h3>
							<p className="text-2xl font-bold text-purple-700">
								{formatCurrency(totalPaid)}
							</p>
						</div>
						<div className="bg-red-50 p-4 rounded-lg">
							<h3 className="text-sm font-medium text-red-600">Total Unpaid</h3>
							<p className="text-2xl font-bold text-red-700">
								{formatCurrency(totalUnpaid)}
							</p>
						</div>
						<div className="bg-yellow-50 p-4 rounded-lg">
							<h3 className="text-sm font-medium text-yellow-600">
								Extra Amount
							</h3>
							<p className="text-2xl font-bold text-yellow-700">
								{formatCurrency(serviceHistory?.extraAmount || 0)}
							</p>
						</div>
					</div>

					{/* Filters */}
					<div className="flex flex-col md:flex-row gap-4 mb-6">
						<SelectPicker
							placeholder="Filter by service"
							data={[{label: "All Services", value: ""}, ...uniqueServiceNames]}
							value={filters.serviceName}
							onChange={(value) =>
								setFilters((f) => ({...f, serviceName: value || ""}))
							}
							className="w-full md:w-48"
						/>
						<div className="flex items-center gap-2 w-full md:w-64">
							<DatePicker
								placeholder="Select date range"
								value={filters.startDate}
								onChange={handleDateSelect}
								className="flex-1"
								format="yyyy-MM-dd"
							/>
							{filters.startDate && (
								<button
									onClick={clearDateRange}
									className="px-2 py-1 text-sm text-gray-600 hover:text-gray-800"
								>
									Clear
								</button>
							)}
						</div>
						{filters.startDate && (
							<div className="text-sm text-gray-600">
								{filters.endDate ? (
									<span>
										{formatDate(filters.startDate)} -{" "}
										{formatDate(filters.endDate)}
									</span>
								) : (
									<span>Select end date</span>
								)}
							</div>
						)}
						<SelectPicker
							placeholder="Payment Status"
							data={[
								{label: "All", value: null},
								{label: "Paid", value: true},
								{label: "Unpaid", value: false},
							]}
							value={filters.isPaid}
							onChange={(value) => setFilters((f) => ({...f, isPaid: value}))}
							className="w-full md:w-48"
						/>
					</div>

					{/* Service History Table */}
					{loading ? (
						<div className="text-center py-4">Loading...</div>
					) : (
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Service Name
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Event Date
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Customer
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Location
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Event Name
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Amount
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Payment Status
										</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
											Action
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{filteredServices.map((service) => (
										<tr key={service.assignedEmployeeId}>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{service.serviceName}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{formatDate(service.eventDate)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{service.customerName}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{service.location}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{service.eventName}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
												{formatCurrency(service.amount)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm">
												<span
													className={`px-2 py-1 rounded text-xs font-semibold ${
														service.isPaid
															? "bg-green-100 text-green-700"
															: "bg-red-100 text-red-700"
													}`}
												>
													{service.isPaid ? "Paid" : "Unpaid"}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm">
												<button
													onClick={() => handleEdit(service)}
													className="px-2 py-1 bg-blue-500 text-gray-50 rounded mr-2"
												>
													Edit
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
				{showEditModal && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
						<div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-lg font-semibold">
									Update Employee Payment
								</h3>
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
										value={formData.amount || ""}
										onChange={handleAmountChange}
										className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
										min="0"
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
									<div className="relative">
										<div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md bg-white">
											{getSelectedEmployeeServices().length > 0 ? (
												getSelectedEmployeeServices().map((service) => (
													<div
														key={service.assignedEmployeeId}
														onClick={() =>
															handleServiceSelection(service.assignedEmployeeId)
														}
														className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
															formData.assignedEmployeeIds?.includes(
																service.assignedEmployeeId,
															)
																? "bg-indigo-50 text-indigo-700"
																: "text-gray-700"
														}`}
													>
														{formatServiceLabel(service)}
													</div>
												))
											) : (
												<div className="px-3 py-2 text-gray-500">
													No services assigned
												</div>
											)}
										</div>
									</div>
									<p className="text-xs text-gray-500 mt-1">
										Click to select/deselect services
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
		</div>
	);
};

export default EmployeeServiceHistory;
