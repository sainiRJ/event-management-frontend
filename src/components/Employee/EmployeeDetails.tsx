import React, {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "@/store/Hooks";
import {
	getAllEmployees,
	getEmployeeServiceHistory,
} from "@/store/employee/ThunkActions";
import {iCreateEmployeeDTO} from "@/customTypes/appDataTypes/employeeTypes";
import {
	ArrowLeft,
	User,
	Clock,
	CreditCard,
	Pencil as Edit3,
} from "lucide-react";
import {fetchStatus} from "@/store/status/ThunkActions";

const EmployeeDetails: React.FC = () => {
	const {employeeId} = useParams<{employeeId: string}>();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const {employeeList, serviceHistory, loading} = useAppSelector(
		(state) => state.employeeReducer,
	);

	const [activeTab, setActiveTab] = useState("profile");
	const [employee, setEmployee] = useState<iCreateEmployeeDTO | null>(null);

	useEffect(() => {
		if (employeeId) {
			dispatch(getAllEmployees());
			dispatch(getEmployeeServiceHistory(employeeId));
		}
		// Always fetch status list on mount
		dispatch(fetchStatus());
	}, [dispatch, employeeId]);

	useEffect(() => {
		if (employeeList && employeeId) {
			const foundEmployee = employeeList.find((emp) => emp.id === employeeId);
			setEmployee(foundEmployee || null);
		}
	}, [employeeList, employeeId]);

	const tabs = [
		{id: "profile", label: "Profile", icon: User},
		{id: "service-history", label: "Service History", icon: Clock},
		{id: "payment-history", label: "Payment History", icon: CreditCard},
	];

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

	const getStatusColor = (status: string) => {
		switch (status?.toLowerCase()) {
			case "active":
				return "bg-green-100 text-green-700";
			case "inactive":
				return "bg-yellow-100 text-yellow-700";
			case "terminated":
				return "bg-red-100 text-red-700";
			default:
				return "bg-gray-100 text-gray-700";
		}
	};

	// If loading but employeeList is loaded and employee is not found, show not found
	if (loading && (!employeeList || employeeList.length === 0)) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
					<p className="mt-4 text-gray-600">Loading employee details...</p>
				</div>
			</div>
		);
	}

	if (!employee) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<p className="text-gray-600">Employee not found</p>
					<button
						onClick={() => navigate("/employees")}
						className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
					>
						Back to Employees
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8 px-4 mt-10">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="bg-white rounded-lg shadow-sm p-6 mb-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<button
								onClick={() => navigate("/employees")}
								className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
							>
								<ArrowLeft size={20} />
							</button>
							<div>
								<h1 className="text-3xl font-bold text-gray-900">
									{employee.name}
								</h1>
								<p className="text-gray-600">{employee.designation}</p>
							</div>
						</div>
						<div className="flex items-center space-x-3">
							<span
								className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
									(employee as any).status || "",
								)}`}
							>
								{(employee as any).status || "Unknown"}
							</span>
							<button className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors">
								<Edit3 size={18} />
							</button>
						</div>
					</div>
				</div>

				{/* Tabs */}
				<div className="bg-white rounded-lg shadow-sm mb-6">
					<div className="border-b border-gray-200">
						<nav className="flex space-x-8 px-6">
							{tabs.map((tab) => {
								const Icon = tab.icon;
								return (
									<button
										key={tab.id}
										onClick={() => setActiveTab(tab.id)}
										className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
											activeTab === tab.id
												? "border-indigo-500 text-indigo-600"
												: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
										}`}
									>
										<Icon size={16} />
										<span>{tab.label}</span>
									</button>
								);
							})}
						</nav>
					</div>

					{/* Tab Content */}
					<div className="p-6">
						{activeTab === "profile" && <EmployeeProfile employee={employee} />}
						{activeTab === "service-history" && (
							<EmployeeServiceHistoryTab serviceHistory={serviceHistory} />
						)}
						{activeTab === "payment-history" && (
							<EmployeePaymentHistoryTab serviceHistory={serviceHistory} />
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

// Profile Tab Component
const EmployeeProfile: React.FC<{employee: iCreateEmployeeDTO}> = ({
	employee,
}) => {
	const [isEditing, setIsEditing] = useState(false);
	const [formData, setFormData] = useState(employee);

	const handleSave = () => {
		// TODO: Implement save functionality
		setIsEditing(false);
	};

	const formatDate = (dateString: string | Date) => {
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		}).format(date);
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold text-gray-900">
					Employee Profile
				</h2>
				<button
					onClick={() => setIsEditing(!isEditing)}
					className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
				>
					{isEditing ? "Cancel" : "Edit Profile"}
				</button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{/* Profile Picture */}
				<div className="md:col-span-2">
					<div className="flex items-center space-x-4">
						<div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
							<User size={32} className="text-indigo-600" />
						</div>
						<div>
							<h3 className="text-lg font-medium text-gray-900">
								{employee.name}
							</h3>
							<p className="text-gray-600">{employee.designation}</p>
						</div>
					</div>
				</div>

				{/* Personal Information */}
				<div className="space-y-4">
					<h3 className="text-lg font-medium text-gray-900">
						Personal Information
					</h3>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Full Name
						</label>
						{isEditing ? (
							<input
								type="text"
								value={formData.name}
								onChange={(e) =>
									setFormData({...formData, name: e.target.value})
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
							/>
						) : (
							<p className="text-gray-900">{employee.name}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Email Address
						</label>
						{isEditing ? (
							<input
								type="email"
								value={formData.email}
								onChange={(e) =>
									setFormData({...formData, email: e.target.value})
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
							/>
						) : (
							<p className="text-gray-900">{employee.email}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Phone Number
						</label>
						{isEditing ? (
							<input
								type="tel"
								value={formData.phoneNumber}
								onChange={(e) =>
									setFormData({...formData, phoneNumber: e.target.value})
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
							/>
						) : (
							<p className="text-gray-900">{employee.phoneNumber}</p>
						)}
					</div>
				</div>

				{/* Work Information */}
				<div className="space-y-4">
					<h3 className="text-lg font-medium text-gray-900">
						Work Information
					</h3>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Designation
						</label>
						{isEditing ? (
							<input
								type="text"
								value={formData.designation}
								onChange={(e) =>
									setFormData({...formData, designation: e.target.value})
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
							/>
						) : (
							<p className="text-gray-900">{employee.designation}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Joined Date
						</label>
						{isEditing ? (
							<input
								type="date"
								value={
									formData.joinedDate
										? new Date(formData.joinedDate).toISOString().split("T")[0]
										: ""
								}
								onChange={(e) =>
									setFormData({...formData, joinedDate: e.target.value})
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
							/>
						) : (
							<p className="text-gray-900">{formatDate(employee.joinedDate)}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Status
						</label>
						<p className="text-gray-900">
							{(employee as any).status || "Unknown"}
						</p>
					</div>
				</div>
			</div>

			{isEditing && (
				<div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
					<button
						onClick={() => setIsEditing(false)}
						className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
					>
						Cancel
					</button>
					<button
						onClick={handleSave}
						className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
					>
						Save Changes
					</button>
				</div>
			)}
		</div>
	);
};

// Service History Tab Component
const EmployeeServiceHistoryTab: React.FC<{serviceHistory: any}> = ({
	serviceHistory,
}) => {
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

	if (!serviceHistory) {
		return (
			<div className="text-center py-8">
				<Clock size={48} className="mx-auto text-gray-400 mb-4" />
				<p className="text-gray-600">No service history available</p>
			</div>
		);
	}

	const services = serviceHistory.assignedServices || [];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold text-gray-900">Service History</h2>
				<div className="text-sm text-gray-600">
					{services.length} services completed
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-blue-50 p-4 rounded-lg">
					<h3 className="text-sm font-medium text-blue-600">Total Services</h3>
					<p className="text-2xl font-bold text-blue-700">{services.length}</p>
				</div>
				<div className="bg-green-50 p-4 rounded-lg">
					<h3 className="text-sm font-medium text-green-600">Total Amount</h3>
					<p className="text-2xl font-bold text-green-700">
						{formatCurrency(
							services.reduce(
								(sum: number, service: any) => sum + service.amount,
								0,
							),
						)}
					</p>
				</div>
				<div className="bg-purple-50 p-4 rounded-lg">
					<h3 className="text-sm font-medium text-purple-600">Paid Services</h3>
					<p className="text-2xl font-bold text-purple-700">
						{services.filter((service: any) => service.isPaid).length}
					</p>
				</div>
				<div className="bg-red-50 p-4 rounded-lg">
					<h3 className="text-sm font-medium text-red-600">Unpaid Services</h3>
					<p className="text-2xl font-bold text-red-700">
						{services.filter((service: any) => !service.isPaid).length}
					</p>
				</div>
			</div>

			{/* Services Table */}
			<div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
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
									Amount
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{services.map((service: any) => (
								<tr
									key={service.assignedEmployeeId}
									className="hover:bg-gray-50"
								>
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
										{formatCurrency(service.amount)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
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
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

// Payment History Tab Component
const EmployeePaymentHistoryTab: React.FC<{serviceHistory: any}> = ({
	serviceHistory,
}) => {
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

	if (!serviceHistory) {
		return (
			<div className="text-center py-8">
				<CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
				<p className="text-gray-600">No payment history available</p>
			</div>
		);
	}

	// Extract payment history from service history
	const paymentHistory = serviceHistory.paymentHistory || [];
	const services = serviceHistory.assignedServices || [];

	// Calculate payment statistics
	const totalEarned = services.reduce(
		(sum: number, service: any) => sum + service.amount,
		0,
	);
	const totalPaid = services
		.filter((service: any) => service.isPaid)
		.reduce((sum: number, service: any) => sum + service.amount, 0);
	const totalUnpaid = totalEarned - totalPaid;

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
				<div className="text-sm text-gray-600">
					{paymentHistory.length} payments made
				</div>
			</div>

			{/* Payment Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-blue-50 p-4 rounded-lg">
					<h3 className="text-sm font-medium text-blue-600">Total Earned</h3>
					<p className="text-2xl font-bold text-blue-700">
						{formatCurrency(totalEarned)}
					</p>
				</div>
				<div className="bg-green-50 p-4 rounded-lg">
					<h3 className="text-sm font-medium text-green-600">Total Paid</h3>
					<p className="text-2xl font-bold text-green-700">
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
					<h3 className="text-sm font-medium text-yellow-600">Extra Amount</h3>
					<p className="text-2xl font-bold text-yellow-700">
						{formatCurrency(serviceHistory.extraAmount || 0)}
					</p>
				</div>
			</div>

			{/* Payment History Table */}
			<div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Payment ID
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Amount
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Payment Date
								</th>
								<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
									Status
								</th>
							</tr>
						</thead>
						<tbody className="bg-white divide-y divide-gray-200">
							{paymentHistory.length > 0 ? (
								paymentHistory.map((payment: any) => (
									<tr key={payment.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{payment.id}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{formatCurrency(parseFloat(payment.amount))}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{formatDate(payment.paidAt)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
												Completed
											</span>
										</td>
									</tr>
								))
							) : (
								<tr>
									<td
										colSpan={4}
										className="px-6 py-8 text-center text-gray-500"
									>
										<CreditCard
											size={32}
											className="mx-auto mb-2 text-gray-400"
										/>
										No payment history available
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default EmployeeDetails;