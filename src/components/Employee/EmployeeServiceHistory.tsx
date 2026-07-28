import React, {useState, useEffect, useRef} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {useAppDispatch, useAppSelector} from "../../store/Hooks";
import {
	getAssignedServices,
	getEmployeeServiceHistory,
	updateEmployeePayment,
} from "../../store/employee/ThunkActions";
import {
	iAssignedService,
	iEmployeePaymentUpdate,
} from "../../customTypes/appDataTypes/employeeTypes";
import {
	ArrowLeft,
	Clock,
	DollarSign,
	Filter,
	Search,
	RefreshCw,
	ChevronRight,
	History,
	Loader2,
} from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Modal from "../ui/Modal";
import {toast} from "sonner";
import {formatCurrency} from "../../utils/currencyUtils";

const EmployeeServiceHistory: React.FC = () => {
	const {employeeId} = useParams<{employeeId: string}>();
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const {serviceHistory, loading} = useAppSelector(
		(state) => state.employeeReducer,
	);
	const [showEditModal, setShowEditModal] = useState(false);
	const hasFetchedServices = useRef(false);
	const [formData, setFormData] = useState<iEmployeePaymentUpdate>({
		employeeId: "",
		amount: 0,
		paidAt: new Date().toISOString(),
		autoPaid: false,
		assignedEmployeeIds: [],
	});
	const [filters, setFilters] = useState({
		serviceName: "",
		isPaid: null as boolean | null,
	});
	const [isRefreshing, setIsRefreshing] = useState(false);

	const handleRefresh = async () => {
		if (employeeId) {
			setIsRefreshing(true);
			await dispatch(getEmployeeServiceHistory(employeeId));
			setIsRefreshing(false);
		}
	};

	useEffect(() => {
		handleRefresh();
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
		setFormData({
			employeeId: employeeId || "",
			amount: service.amount,
			paidAt: new Date().toISOString(),
			autoPaid: false,
			assignedEmployeeIds: [service.assignedEmployeeId],
		});
		setShowEditModal(true);
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

	const handleSubmit = async () => {
		try {
			const response: any = await dispatch(updateEmployeePayment(formData));
			if (response?.meta?.requestStatus === "fulfilled") {
				toast.success("Payment updated successfully");
				setShowEditModal(false);
				handleRefresh();
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

	const filteredServices =
		serviceHistory?.assignedServices.filter((service) => {
			const matchesService =
				!filters.serviceName || service.serviceName === filters.serviceName;
			const matchesPayment =
				filters.isPaid === null || service.isPaid === filters.isPaid;
			return matchesService && matchesPayment;
		}) || [];

	const uniqueServiceNames = Array.from(
		new Set(serviceHistory?.assignedServices.map((s) => s.serviceName) || []),
	).map((name) => ({label: name, value: name}));

	return (
		<div className="space-y-8 animate-in fade-in duration-500">
			<div className="bg-white rounded-[2rem] shadow-sm border border-brand-100/70 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
				<div className="flex items-center gap-6">
					<button
						onClick={() => navigate(-1)}
						className="p-3 bg-gray-50 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded-2xl transition-all"
					>
						<ArrowLeft className="w-6 h-6" />
					</button>
					<div>
						<h1 className="text-3xl font-black text-[#2B2129] tracking-tight flex items-center gap-3">
							<History className="w-8 h-8 text-brand-600" />
							Service History
						</h1>
						<p className="text-gray-500 font-bold mt-1">
							{serviceHistory?.employeeName || "Employee Record"}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-3">
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
				</div>
			</div>

			<div className="bg-white rounded-[2rem] shadow-sm border border-brand-100/70 p-8">
				<div className="flex flex-wrap gap-4 items-center mb-8">
					<div className="relative flex-1 max-w-xs">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
						<input
							type="text"
							placeholder="Search services..."
							className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-400 transition-all"
						/>
					</div>

					<Select
						options={uniqueServiceNames}
						value={filters.serviceName}
						onChange={(e) =>
							setFilters({...filters, serviceName: e.target.value})
						}
						className="max-w-[200px]"
					/>

					<div className="flex items-center gap-2 p-1 bg-gray-50 rounded-xl">
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

				<div className="overflow-x-auto rounded-2xl border border-brand-100/70">
					<table className="min-w-full">
						<thead className="bg-gray-50/50">
							<tr>
								<th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">
									Service Info
								</th>
								<th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">
									Customer & Date
								</th>
								<th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">
									Earnings
								</th>
								<th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-widest">
									Status
								</th>
								<th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-widest">
									Action
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-50">
							{loading ? (
								<tr>
									<td colSpan={5} className="px-6 py-20 text-center">
										<Loader2 className="w-8 h-8 text-brand-600 animate-spin mx-auto mb-4" />
										<p className="text-gray-500 font-medium">
											Loading history...
										</p>
									</td>
								</tr>
							) : filteredServices.length > 0 ? (
								filteredServices.map((service) => (
									<tr
										key={service.assignedEmployeeId}
										className="group hover:bg-gray-50/50 transition-colors"
									>
										<td className="px-6 py-4">
											<div className="font-bold text-[#2B2129]">
												{service.serviceName}
											</div>
											<div className="text-xs text-gray-500 font-medium">
												{service.location}
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="text-sm font-bold text-gray-700">
												{service.customerName}
											</div>
											<div className="text-xs text-gray-400 font-bold">
												{new Date(service.eventDate).toLocaleDateString()}
											</div>
										</td>
										<td className="px-6 py-4">
											<div className="text-sm font-black text-brand-600">
												{formatCurrency(service.amount)}
											</div>
										</td>
										<td className="px-6 py-4">
											<span
												className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
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
								))
							) : (
								<tr>
									<td
										colSpan={5}
										className="px-6 py-20 text-center text-gray-500"
									>
										<Clock className="w-12 h-12 text-gray-200 mx-auto mb-4" />
										No service records found.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
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
				<div className="space-y-6">
					<div className="bg-brand-50 rounded-2xl p-4 flex justify-between items-center">
						<span className="text-sm font-bold text-brand-600">Total Due:</span>
						<span className="text-lg font-black text-indigo-900">
							{formatCurrency(formData.amount)}
						</span>
					</div>

					<Input
						label="Confirm Amount"
						type="number"
						value={formData.amount}
						onChange={(e) =>
							setFormData({...formData, amount: Number(e.target.value)})
						}
					/>

					<Input
						label="Payment Date"
						type="date"
						value={formData.paidAt?.split("T")[0]}
						onChange={(e) =>
							setFormData({
								...formData,
								paidAt: new Date(e.target.value).toISOString(),
							})
						}
					/>

					<div>
						<label className="block text-sm font-bold text-gray-700 mb-2">
							Selected Services
						</label>
						<div className="max-h-48 overflow-y-auto border border-brand-100/70 rounded-2xl bg-gray-50/50 p-2">
							{getSelectedEmployeeServices().map((service) => (
								<div
									key={service.assignedEmployeeId}
									onClick={() =>
										handleServiceSelection(service.assignedEmployeeId)
									}
									className={`px-4 py-3 rounded-xl cursor-pointer flex items-center justify-between mb-1 last:mb-0 transition-all ${
										formData.assignedEmployeeIds?.includes(
											service.assignedEmployeeId,
										)
											? "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-indigo-200"
											: "bg-white text-gray-600 hover:bg-gray-100"
									}`}
								>
									<span className="text-xs font-bold">
										{service.serviceName}
									</span>
									<ChevronRight className="w-4 h-4" />
								</div>
							))}
						</div>
					</div>

					<label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl cursor-pointer hover:bg-gray-100 transition-colors border border-brand-100/70">
						<input
							type="checkbox"
							checked={formData.autoPaid}
							onChange={(e) =>
								setFormData({...formData, autoPaid: e.target.checked})
							}
							className="w-5 h-5 text-brand-600 rounded-lg border-gray-300 focus:ring-brand-400"
						/>
						<div>
							<p className="text-sm font-bold text-[#2B2129]">
								Auto-calculate total
							</p>
							<p className="text-[10px] text-gray-500 font-medium">
								Includes all unpaid services automatically
							</p>
						</div>
					</label>
				</div>
			</Modal>
		</div>
	);
};

export default EmployeeServiceHistory;
