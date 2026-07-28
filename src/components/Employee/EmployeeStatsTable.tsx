import React, {useState, useEffect, useRef} from "react";
import {useAppDispatch, useAppSelector} from "../../store/Hooks";
import {
	iEmployeeStat,
	iEmployeePaymentUpdate,
	iAssignedService,
} from "../../customTypes/appDataTypes/employeeTypes";
import {RootState} from "../../store";
import {
	updateEmployeePayment,
	getAssignedServices,
} from "../../store/employee/ThunkActions";
import {formatCurrency} from "../../utils/currencyUtils";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import {toast} from "sonner";
import {Loader2, DollarSign, ChevronRight} from "lucide-react";

interface EmployeeStatsTableProps {
	stats: Record<string, iEmployeeStat>;
	onRefresh: () => void;
}

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
	const {loading} = useAppSelector((state: RootState) => state.employeeReducer);
	const assignedServices = useAppSelector(
		(state: RootState) => state.employeeReducer.assignedServices,
	);
	const hasFetchedServices = useRef(false);

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

	const handleEdit = (employee: iEmployeeStat) => {
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
			const response: any = await dispatch(updateEmployeePayment(formData));
			if (response?.meta?.requestStatus === "fulfilled") {
				toast.success("Payment updated successfully");
				setShowEditModal(false);
				onRefresh();
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

	const formatServiceLabel = (service: iAssignedService) => {
		const date = new Date(service.eventDate).toLocaleDateString();
		return `${date} - ${service.serviceName} - ${service.location}`;
	};

	const getSelectedEmployeeServices = () => {
		if (!selectedEmployee || !assignedServices) return [];
		const employeeServices = assignedServices.find(
			(emp) => emp.employeeId === selectedEmployee.employeeId,
		);
		return employeeServices?.assignedServices || [];
	};

	const serviceNames = Array.from(
		new Set(
			Object.values(stats).flatMap((emp) =>
				emp.serviceStats.map((s) => s.serviceName),
			),
		),
	);

	if (loading && !Object.keys(stats).length) {
		return (
			<div className="flex flex-col items-center justify-center py-12">
				<Loader2 className="w-8 h-8 text-brand-600 animate-spin mb-4" />
				<p className="text-gray-500 font-medium">Loading statistics...</p>
			</div>
		);
	}

	if (!stats || Object.keys(stats).length === 0) {
		return (
			<div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
				<p className="text-gray-500">
					No employee statistics available for this period.
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-x-auto">
			<table className="min-w-full">
				<thead>
					<tr className="border-b border-brand-100/70">
						<th className="px-4 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
							Employee
						</th>
						{serviceNames.map((name) => (
							<th
								key={name}
								className="px-4 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider"
							>
								{name}
							</th>
						))}
						<th className="px-4 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
							Total
						</th>
						<th className="px-4 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
							Earnings
						</th>
						<th className="px-4 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
							Paid
						</th>
						<th className="px-4 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
							Remaining
						</th>
						<th className="px-4 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">
							Action
						</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-50">
					{Object.values(stats).map((employee) => (
						<tr
							key={employee.employeeId}
							className="group hover:bg-gray-50/50 transition-colors"
						>
							<td className="px-4 py-4 whitespace-nowrap">
								<div className="font-semibold text-[#2B2129]">
									{employee.name}
								</div>
							</td>
							{serviceNames.map((name) => {
								const stat = employee.serviceStats.find(
									(s) => s.serviceName === name,
								);
								return (
									<td key={name} className="px-4 py-4 whitespace-nowrap">
										<span
											className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold ${
												stat && stat.count > 0
													? "bg-brand-50 text-brand-600"
													: "bg-gray-50 text-gray-300"
											}`}
										>
											{stat ? stat.count : 0}
										</span>
									</td>
								);
							})}
							<td className="px-4 py-4 whitespace-nowrap">
								<span className="font-bold text-gray-700">
									{employee.totalServices}
								</span>
							</td>
							<td className="px-4 py-4 whitespace-nowrap font-medium text-[#2B2129]">
								{formatCurrency(employee.totalAmount)}
							</td>
							<td className="px-4 py-4 whitespace-nowrap text-emerald-600 font-medium">
								{formatCurrency(employee.totalPaid)}
							</td>
							<td className="px-4 py-4 whitespace-nowrap">
								<span
									className={`font-bold ${
										employee.totalRemaining > 0
											? "text-rose-600"
											: "text-emerald-600"
									}`}
								>
									{formatCurrency(employee.totalRemaining)}
								</span>
							</td>
							<td className="px-4 py-4 whitespace-nowrap text-right">
								<Button
									variant="ghost"
									size="sm"
									icon={<DollarSign className="w-3.5 h-3.5" />}
									onClick={() => handleEdit(employee)}
								>
									Pay
								</Button>
							</td>
						</tr>
					))}
				</tbody>
			</table>

			<Modal
				isOpen={showEditModal}
				onClose={() => setShowEditModal(false)}
				title="Update Employee Payment"
				footer={
					<>
						<Button variant="ghost" onClick={() => setShowEditModal(false)}>
							Cancel
						</Button>
						<Button onClick={handleSubmit}>Update Payment</Button>
					</>
				}
			>
				<div className="space-y-4">
					<div className="bg-brand-50 rounded-xl p-4 mb-4">
						<div className="text-sm text-brand-600 font-medium mb-1">
							Paying To
						</div>
						<div className="text-lg font-bold text-indigo-900">
							{selectedEmployee?.name}
						</div>
						<div className="flex justify-between mt-2 text-sm">
							<span className="text-brand-600/70">Remaining Balance:</span>
							<span className="font-bold text-indigo-900">
								{formatCurrency(selectedEmployee?.totalRemaining || 0)}
							</span>
						</div>
					</div>

					<Input
						label="Amount to Pay"
						type="number"
						value={formData.amount || ""}
						onChange={(e) =>
							setFormData((prev) => ({...prev, amount: Number(e.target.value)}))
						}
						placeholder="Enter amount"
					/>

					<Input
						label="Payment Date"
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
					/>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Assign to Specific Services (Optional)
						</label>
						<div className="max-h-48 overflow-y-auto border border-brand-100/70 rounded-xl bg-gray-50/50">
							{getSelectedEmployeeServices().length > 0 ? (
								getSelectedEmployeeServices().map((service) => {
									const isSelected = formData.assignedEmployeeIds?.includes(
										service.assignedEmployeeId,
									);
									return (
										<div
											key={service.assignedEmployeeId}
											onClick={() => {
												const currentIds = formData.assignedEmployeeIds || [];
												const newIds = isSelected
													? currentIds.filter(
															(id) => id !== service.assignedEmployeeId,
													  )
													: [...currentIds, service.assignedEmployeeId];
												setFormData((prev) => ({
													...prev,
													assignedEmployeeIds: newIds,
												}));
											}}
											className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors border-b border-white last:border-0 ${
												isSelected
													? "bg-brand-100/50 text-brand-700"
													: "text-gray-600 hover:bg-white"
											}`}
										>
											<span className="text-sm font-medium">
												{formatServiceLabel(service)}
											</span>
											{isSelected && <ChevronRight className="w-4 h-4" />}
										</div>
									);
								})
							) : (
								<div className="px-4 py-6 text-center text-gray-400 text-sm italic">
									No outstanding services found
								</div>
							)}
						</div>
					</div>

					<label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
						<input
							type="checkbox"
							checked={formData.autoPaid}
							onChange={(e) =>
								setFormData((prev) => ({...prev, autoPaid: e.target.checked}))
							}
							className="w-4 h-4 text-brand-600 rounded border-gray-300 focus:ring-brand-400"
						/>
						<span className="text-sm font-medium text-gray-700">
							Auto-calculate from services
						</span>
					</label>
				</div>
			</Modal>
		</div>
	);
};

export default EmployeeStatsTable;
