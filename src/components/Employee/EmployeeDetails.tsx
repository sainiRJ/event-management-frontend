import React, {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../store/Hooks";
import {
	getAllEmployees,
	getEmployeeServiceHistory,
	updateEmployeePayment,
} from "../../store/employee/ThunkActions";
import {iCreateEmployeeDTO} from "../../customTypes/appDataTypes/employeeTypes";
import {
	ArrowLeft,
	User,
	Clock,
	CreditCard,
	Edit2,
	Mail,
	Phone,
	Calendar,
	Briefcase,
	CheckCircle2,
	AlertCircle,
	DollarSign,
	Search,
	Filter,
	X,
	Wallet,
} from "lucide-react";
import {fetchStatus} from "../../store/status/ThunkActions";
import {
	iAssignedService,
	iEmployeePaymentUpdate,
} from "../../customTypes/appDataTypes/employeeTypes";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import Select from "../ui/Select";
import {toast} from "sonner";
import {formatCurrency} from "../../utils/currencyUtils";

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
		if (!dateString) return "N/A";
		const date = new Date(dateString);
		return new Intl.DateTimeFormat("en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		}).format(date);
	};

	const getStatusBadge = (status: string) => {
		let color = "bg-gray-100 text-ink-700";
		if (
			status?.toLowerCase() === "active" ||
			status?.toLowerCase() === "working"
		)
			color = "bg-emerald-100 text-emerald-700";
		if (status?.toLowerCase() === "inactive")
			color = "bg-amber-100 text-yellow-700";
		if (status?.toLowerCase() === "terminated")
			color = "bg-rose-100 text-red-700";

		return (
			<span
				className={`px-3 py-1 rounded-full text-xs font-bold ${color} border border-white shadow-sm`}
			>
				{status || "Unknown"}
			</span>
		);
	};

	if (loading && (!employeeList || employeeList.length === 0)) {
		return (
			<div className="flex flex-col items-center justify-center py-20">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
				<p className="mt-4 text-ink-500 font-medium">
					Loading employee records...
				</p>
			</div>
		);
	}

	if (!employee) {
		return (
			<div className="flex flex-col items-center justify-center py-20 text-center">
				<AlertCircle className="w-16 h-16 text-ink-300 mb-4" />
				<h3 className="text-xl font-bold text-ink-900">Employee Not Found</h3>
				<p className="text-ink-500 mt-1 mb-6">
					We couldn&apos;t find the employee you&apos;re looking for.
				</p>
				<Button onClick={() => navigate("/employees")}>
					Back to Directory
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-8 animate-in fade-in duration-500">
			{/* Header Card */}
			<div className="bg-white rounded-[2rem] shadow-sm border border-ink-200/70 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
				<div className="flex items-center gap-6">
					<button
						onClick={() => navigate("/employees")}
						className="p-3 bg-gray-50 text-ink-400 hover:text-brand-600 hover:bg-brand-50 rounded-2xl transition-all"
					>
						<ArrowLeft className="w-6 h-6" />
					</button>
					<div className="flex items-center gap-5">
						<div className="w-20 h-20 bg-brand-50 rounded-3xl flex items-center justify-center text-brand-600 border border-ink-200 shadow-inner">
							<User className="w-10 h-10" />
						</div>
						<div>
							<div className="flex items-center gap-3 mb-1">
								<h1 className="text-3xl font-semibold text-ink-900 tracking-tight">
									{employee.name}
								</h1>
								{getStatusBadge((employee as any).status)}
							</div>
							<p className="text-ink-500 font-bold flex items-center gap-2">
								<Briefcase className="w-4 h-4 text-indigo-400" />
								{employee.designation}
							</p>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<Button variant="outline" icon={<Edit2 className="w-4 h-4" />}>
						Edit Profile
					</Button>
				</div>
			</div>

			{/* Tabs Navigation */}
			<div className="flex flex-wrap gap-2 p-1 bg-gray-100/50 rounded-2xl w-fit">
				{tabs.map((tab) => {
					const Icon = tab.icon;
					const isActive = activeTab === tab.id;
					return (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
								isActive
									? "bg-white text-brand-600 shadow-sm ring-1 ring-black/5"
									: "text-ink-500 hover:text-ink-900 hover:bg-white/50"
							}`}
						>
							<Icon
								className={`w-4 h-4 ${
									isActive ? "text-brand-600" : "text-ink-400"
								}`}
							/>
							{tab.label}
						</button>
					);
				})}
			</div>

			{/* Tab Content */}
			<div className="bg-white rounded-[2rem] shadow-sm border border-ink-200/70 p-8 min-h-[400px]">
				{activeTab === "profile" && (
					<EmployeeProfileTab employee={employee} formatDate={formatDate} />
				)}
				{activeTab === "service-history" && (
					<EmployeeServiceHistoryTab serviceHistory={serviceHistory} />
				)}
				{activeTab === "payment-history" && (
					<EmployeePaymentHistoryTab serviceHistory={serviceHistory} />
				)}
			</div>
		</div>
	);
};

const EmployeeProfileTab: React.FC<{
	employee: iCreateEmployeeDTO;
	formatDate: (d: any) => string;
}> = ({employee, formatDate}) => {
	const infoItems = [
		{label: "Email Address", value: employee.email, icon: Mail, type: "email"},
		{
			label: "Phone Number",
			value: employee.phoneNumber,
			icon: Phone,
			type: "tel",
		},
		{
			label: "Designation",
			value: employee.designation,
			icon: Briefcase,
			type: "text",
		},
		{
			label: "Joined Date",
			value: formatDate(employee.joinedDate),
			icon: Calendar,
			type: "text",
		},
	];

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-in slide-in-from-bottom-4 duration-500">
			<div className="space-y-8">
				<h3 className="text-xl font-semibold text-ink-900 flex items-center gap-3">
					<div className="w-1 h-6 bg-brand-600 rounded-full"></div>
					Basic Information
				</h3>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
					{infoItems.map((item, idx) => (
						<div
							key={idx}
							className="group p-6 bg-gray-50/50 rounded-3xl border border-ink-200/60 hover:bg-white hover:border-ink-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300"
						>
							<div className="p-2.5 bg-white rounded-xl text-brand-600 w-fit mb-4 shadow-sm group-hover:scale-110 transition-transform">
								<item.icon className="w-5 h-5" />
							</div>
							<p className="text-[10px] font-bold text-ink-400 uppercase tracking-widest mb-1">
								{item.label}
							</p>
							<p className="text-sm font-bold text-ink-900 truncate">
								{item.value || "Not provided"}
							</p>
						</div>
					))}
				</div>
			</div>

			<div className="space-y-8">
				<h3 className="text-xl font-semibold text-ink-900 flex items-center gap-3">
					<div className="w-1 h-6 bg-emerald-600 rounded-full"></div>
					Activity Summary
				</h3>

				<div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
					{/* Background Decorations */}
					<div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
					<div className="absolute -bottom-12 -left-12 w-48 h-48 bg-black/10 rounded-full blur-3xl"></div>

					<div className="relative z-10 space-y-6">
						<div>
							<p className="text-indigo-100 text-xs font-bold uppercase tracking-[0.2em] mb-2 opacity-80">
								Performance Score
							</p>
							<div className="flex items-end gap-3">
								<span className="text-6xl font-semibold leading-none">94</span>
								<span className="text-indigo-200 font-bold mb-2">/ 100</span>
							</div>
						</div>

						<div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
							<div className="h-full bg-white rounded-full w-[94%]"></div>
						</div>

						<div className="grid grid-cols-2 gap-4 pt-4">
							<div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
								<p className="text-[10px] font-bold text-indigo-100 uppercase mb-1">
									Reliability
								</p>
								<p className="text-lg font-semibold text-white">Excellent</p>
							</div>
							<div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
								<p className="text-[10px] font-bold text-indigo-100 uppercase mb-1">
									Satisfaction
								</p>
								<p className="text-lg font-semibold text-white">4.8 / 5</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

const EmployeeServiceHistoryTab: React.FC<{serviceHistory: any}> = ({
	serviceHistory,
}) => {
	const {employeeId} = useParams<{employeeId: string}>();
	const dispatch = useAppDispatch();
	const [showEditModal, setShowEditModal] = useState(false);
	const [formData, setFormData] = useState<iEmployeePaymentUpdate>({
		employeeId: employeeId || "",
		amount: 0,
		paidAt: new Date().toISOString(),
		autoPaid: false,
		assignedEmployeeIds: [],
	});
	const [filters, setFilters] = useState({
		serviceName: "",
		isPaid: null as boolean | null,
	});

	const handleEdit = (service: iAssignedService) => {
		setFormData({
			employeeId: employeeId || "",
			amount: service.amount,
			paidAt: new Date().toISOString(),
			autoPaid: false,
			assignedEmployeeIds: [service.assignedEmployeeId],
		});
		setShowEditModal(true);
	};

	const handleSubmit = async () => {
		try {
			const response: any = await dispatch(updateEmployeePayment(formData));
			if (response?.meta?.requestStatus === "fulfilled") {
				toast.success("Payment updated successfully");
				setShowEditModal(false);
				dispatch(getEmployeeServiceHistory(employeeId || ""));
			} else {
				toast.error(
					response?.payload?.message?.error?.message ||
						"Failed to update payment",
				);
			}
		} catch (error) {
			toast.error("Failed to update payment");
		}
	};

	if (!serviceHistory) {
		return (
			<div className="flex flex-col items-center justify-center py-20 text-center">
				<Clock className="w-12 h-12 text-ink-300 mb-4" />
				<p className="text-ink-500 font-medium">
					No service history records found.
				</p>
			</div>
		);
	}

	const services = serviceHistory.assignedServices || [];
	const filteredServices = services.filter((service: any) => {
		const matchesService =
			!filters.serviceName || service.serviceName === filters.serviceName;
		const matchesPayment =
			filters.isPaid === null || service.isPaid === filters.isPaid;
		return matchesService && matchesPayment;
	});

	const stats = [
		{
			label: "Total Completed",
			value: services.length,
			color: "text-brand-600",
			bgColor: "bg-brand-50",
		},
		{
			label: "Paid Services",
			value: services.filter((s: any) => s.isPaid).length,
			color: "text-emerald-600",
			bgColor: "bg-emerald-50",
		},
		{
			label: "Unpaid Services",
			value: services.filter((s: any) => !s.isPaid).length,
			color: "text-rose-600",
			bgColor: "bg-rose-50",
		},
	];

	return (
		<div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{stats.map((stat, idx) => (
					<div
						key={idx}
						className={`p-6 rounded-3xl border border-ink-200/60 ${stat.bgColor} flex items-center justify-between`}
					>
						<div>
							<p className="text-[10px] font-semibold text-ink-400 uppercase tracking-widest mb-1">
								{stat.label}
							</p>
							<p className={`text-2xl font-semibold ${stat.color}`}>
								{stat.value}
							</p>
						</div>
						<div
							className={`p-3 rounded-2xl bg-white/80 shadow-sm ${stat.color}`}
						>
							<CheckCircle2 className="w-6 h-6" />
						</div>
					</div>
				))}
			</div>

			<div className="flex flex-wrap gap-4 items-center">
				<div className="relative flex-1 max-w-xs">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
					<input
						type="text"
						placeholder="Search services..."
						className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-400"
					/>
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant={filters.isPaid === null ? "primary" : "ghost"}
						size="sm"
						onClick={() => setFilters({...filters, isPaid: null})}
					>
						All
					</Button>
					<Button
						variant={filters.isPaid === true ? "primary" : "ghost"}
						size="sm"
						onClick={() => setFilters({...filters, isPaid: true})}
					>
						Paid
					</Button>
					<Button
						variant={filters.isPaid === false ? "primary" : "ghost"}
						size="sm"
						onClick={() => setFilters({...filters, isPaid: false})}
					>
						Unpaid
					</Button>
				</div>
			</div>

			<div className="overflow-x-auto rounded-2xl border border-ink-200/70">
				<table className="min-w-full">
					<thead className="bg-gray-50/50">
						<tr>
							<th className="px-6 py-4 text-left text-[11px] font-bold text-ink-400 uppercase tracking-widest">
								Service Details
							</th>
							<th className="px-6 py-4 text-left text-[11px] font-bold text-ink-400 uppercase tracking-widest">
								Customer & Date
							</th>
							<th className="px-6 py-4 text-left text-[11px] font-bold text-ink-400 uppercase tracking-widest">
								Earnings
							</th>
							<th className="px-6 py-4 text-left text-[11px] font-bold text-ink-400 uppercase tracking-widest">
								Status
							</th>
							<th className="px-6 py-4 text-right text-[11px] font-bold text-ink-400 uppercase tracking-widest">
								Action
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50">
						{filteredServices.map((service: any) => (
							<tr
								key={service.assignedEmployeeId}
								className="group hover:bg-gray-50/50 transition-colors"
							>
								<td className="px-6 py-4">
									<div className="font-bold text-ink-900">
										{service.serviceName}
									</div>
									<div className="text-xs text-ink-500 font-medium">
										{service.location}
									</div>
								</td>
								<td className="px-6 py-4">
									<div className="text-sm font-bold text-ink-700">
										{service.customerName}
									</div>
									<div className="text-xs text-ink-400 font-bold">
										{new Date(service.eventDate).toLocaleDateString()}
									</div>
								</td>
								<td className="px-6 py-4">
									<div className="text-sm font-semibold text-brand-600">
										{formatCurrency(service.amount)}
									</div>
								</td>
								<td className="px-6 py-4">
									<span
										className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
											service.isPaid
												? "bg-emerald-50 text-emerald-600"
												: "bg-rose-50 text-rose-600"
										}`}
									>
										{service.isPaid ? "Paid" : "Unpaid"}
									</span>
								</td>
								<td className="px-6 py-4 text-right">
									{!service.isPaid && (
										<Button
											variant="ghost"
											size="sm"
											icon={<DollarSign className="w-3.5 h-3.5" />}
											onClick={() => handleEdit(service)}
										>
											Pay Now
										</Button>
									)}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			<Modal
				isOpen={showEditModal}
				onClose={() => setShowEditModal(false)}
				title="Process Payment"
				footer={
					<>
						<Button variant="ghost" onClick={() => setShowEditModal(false)}>
							Cancel
						</Button>
						<Button onClick={handleSubmit}>Confirm Payment</Button>
					</>
				}
			>
				<div className="space-y-4">
					<Input
						label="Amount"
						type="number"
						value={formData.amount}
						onChange={(e) =>
							setFormData({...formData, amount: Number(e.target.value)})
						}
					/>
					<Input
						label="Date"
						type="date"
						value={formData.paidAt?.split("T")[0]}
						onChange={(e) =>
							setFormData({
								...formData,
								paidAt: new Date(e.target.value).toISOString(),
							})
						}
					/>
				</div>
			</Modal>
		</div>
	);
};

const EmployeePaymentHistoryTab: React.FC<{serviceHistory: any}> = ({
	serviceHistory,
}) => {
	if (!serviceHistory?.paymentHistory?.length) {
		return (
			<div className="flex flex-col items-center justify-center py-20 text-center">
				<CreditCard className="w-12 h-12 text-ink-300 mb-4" />
				<p className="text-ink-500 font-medium">
					No payment history records found.
				</p>
			</div>
		);
	}

	const totalPaid = serviceHistory.paymentHistory.reduce(
		(sum: number, p: any) => sum + parseFloat(p.amount),
		0,
	);

	return (
		<div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
			<div className="bg-brand-600 rounded-[2rem] p-8 text-white flex items-center justify-between shadow-xl shadow-indigo-200">
				<div>
					<p className="text-indigo-100 text-xs font-bold uppercase tracking-[0.2em] mb-1">
						Lifetime Total Paid
					</p>
					<p className="text-4xl font-semibold">{formatCurrency(totalPaid)}</p>
				</div>
				<div className="p-4 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10">
					<Wallet className="w-10 h-10 text-white" />
				</div>
			</div>

			<div className="overflow-x-auto rounded-2xl border border-ink-200/70">
				<table className="min-w-full">
					<thead className="bg-gray-50/50">
						<tr>
							<th className="px-6 py-4 text-left text-[11px] font-bold text-ink-400 uppercase tracking-widest">
								Transaction ID
							</th>
							<th className="px-6 py-4 text-left text-[11px] font-bold text-ink-400 uppercase tracking-widest">
								Amount
							</th>
							<th className="px-6 py-4 text-left text-[11px] font-bold text-ink-400 uppercase tracking-widest">
								Date
							</th>
							<th className="px-6 py-4 text-right text-[11px] font-bold text-ink-400 uppercase tracking-widest">
								Status
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50">
						{serviceHistory.paymentHistory.map((payment: any) => (
							<tr
								key={payment.id}
								className="hover:bg-gray-50/50 transition-colors"
							>
								<td className="px-6 py-4">
									<div className="text-xs font-bold text-ink-400 font-mono">
										#{payment.id.slice(-8).toUpperCase()}
									</div>
								</td>
								<td className="px-6 py-4">
									<div className="text-sm font-semibold text-ink-900">
										{formatCurrency(parseFloat(payment.amount))}
									</div>
								</td>
								<td className="px-6 py-4">
									<div className="text-sm font-bold text-ink-600">
										{new Date(payment.paidAt).toLocaleDateString()}
									</div>
								</td>
								<td className="px-6 py-4 text-right">
									<span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-emerald-50 text-emerald-600">
										<CheckCircle2 className="w-3 h-3" />
										Successful
									</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default EmployeeDetails;
