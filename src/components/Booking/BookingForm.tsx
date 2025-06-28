import React, {useState, useRef, useEffect} from "react";
import {useAppSelector} from "@/store/Hooks";
import {RootState} from "@/store";
import CustomForm from "../common/CustomForm";
import {bookingValidationSchema} from "@/validations/BookingValidationSchema";
import {iService} from "@/customTypes/appDataTypes/serviceTypes";

interface BookingFormProps {
	formValue: any;
	setFormValue: (value: any) => void;
	onSubmit: (value: any) => void;
	isEdit?: boolean;
	showFooter?: boolean;
	errors?: Record<string, string>;
}

const BookingForm: React.FC<BookingFormProps> = ({
	formValue,
	setFormValue,
	onSubmit,
	isEdit = false,
	showFooter = false,
	errors = {},
}) => {
	const {statusList} = useAppSelector(
		(state: RootState) => state.statusReducer,
	);
	const {serviceList} = useAppSelector(
		(state: RootState) => state.serviceReducer,
	);
	const {employeeList} = useAppSelector(
		(state: RootState) => state.employeeReducer,
	);

	const bookingStatuses = statusList
		.filter((status) => status.context === "booking")
		.map((status) => ({label: status.name, value: status.id}));

	const paymentStatuses = statusList
		.filter((status) => status.context === "payment")
		.map((status) => ({label: status.name, value: status.id}));

	const services = serviceList.map((service: iService) => ({
		label: service.serviceName,
		value: service.id,
	}));

	// Filter active employees
	const activeEmployees = employeeList
		.filter((emp: any) => {
			// Check for the 'status' property and if it is 'Working'
			return emp.status === "Working";
		})
		.map((emp) => ({
			label: emp.name,
			value: emp.id,
		}));

	const [dropdownOpen, setDropdownOpen] = useState(false);

	const formFields = [
		{
			name: "customerName",
			label: "Customer Name",
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
			name: "eventName",
			label: "Event Name",
			type: "text" as const,
			colSpan: 12,
		},
		{
			name: "eventDate",
			label: "Event Date",
			type: "date" as const,
			colSpan: 12,
		},
		{
			name: "venueAddress",
			label: "Venue Address",
			type: "text" as const,
			colSpan: 12,
		},
		{
			name: "serviceId",
			label: "Service",
			type: "select" as const,
			options: services,
			colSpan: 12,
		},
		{
			name: "bookingStatusId",
			label: "Booking Status",
			type: "select" as const,
			options: bookingStatuses,
			colSpan: 12,
		},
		{
			name: "budget",
			label: "Total Amount",
			type: "number" as const,
			colSpan: 12,
		},
		{
			name: "advancePayment",
			label: "Advance Amount",
			type: "number" as const,
			colSpan: 12,
		},
		{
			name: "paymentStatusId",
			label: "Payment Status",
			type: "select" as const,
			options: paymentStatuses,
			colSpan: 12,
		},
		{
			name: "assignedEmployeeIds",
			label: "Assigned Employees",
			type: "multiselect" as const,
			options: activeEmployees,
			colSpan: 24,
		},
		{
			name: "notes",
			label: "Notes",
			type: "textarea" as const,
			colSpan: 24,
		},
	];

	return (
		<form onSubmit={onSubmit} className="space-y-6 w-full relative">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{formFields.map((field) => (
					<div
						key={field.name}
						className={`col-span-${field.colSpan} flex flex-col`}
					>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							{field.label}
						</label>
						{field.type === "select" ? (
							<select
								name={field.name}
								value={formValue[field.name] || ""}
								onChange={(e) =>
									setFormValue({...formValue, [field.name]: e.target.value})
								}
								className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
									errors[field.name] ? "border-red-500" : ""
								}`}
							>
								<option value="">Select {field.label}</option>
								{field.options?.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						) : field.type === "multiselect" ? (
							<div className="relative">
								{/* Custom Dropdown Header */}
								<div
									className={`mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm cursor-pointer p-2.5 flex justify-between items-center ${
										dropdownOpen ? "rounded-b-none" : ""
									} ${errors[field.name] ? "border-red-500" : ""}`}
									onClick={() => setDropdownOpen(!dropdownOpen)}
								>
									{(formValue.assignedEmployeeIds || []).length > 0
										? (formValue.assignedEmployeeIds || [])
												.map((employeeId: string) => {
													const employee = activeEmployees.find(
														(emp) => emp.value === employeeId,
													);
													return employee ? employee.label : null;
												})
												.filter(Boolean)
												.join(", ")
										: `Select ${field.label}`}
									<svg
										className={`w-4 h-4 transition-transform ${
											dropdownOpen ? "rotate-180" : ""
										}`}
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										xmlns="http://www.w3.org/2000/svg"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="M19 9l-7 7-7-7"
										></path>
									</svg>
								</div>

								{/* Custom Dropdown Options */}
								{dropdownOpen && (
									<div
										className="absolute z-10 w-full rounded-md rounded-t-none border border-gray-300 bg-white shadow-lg max-h-60 overflow-auto"
										style={{top: "calc(100% + 0px)"}} // Position right below the header
									>
										{(field.options || []).map((option) => (
											<div
												key={option.value}
												className={`cursor-pointer select-none relative py-2 pl-3 pr-9 text-gray-900 hover:bg-gray-100 ${
													(formValue.assignedEmployeeIds || []).includes(
														option.value,
													)
														? "font-semibold bg-gray-100"
														: "font-normal"
												}`}
												onClick={() => {
													const currentValue =
														formValue.assignedEmployeeIds || [];
													const newValue = currentValue.includes(option.value)
														? currentValue.filter(
																(item: string) => item !== option.value,
														  )
														: [...currentValue, option.value];
													// Ensure the array doesn't contain any undefined/null values
													const cleanValue = newValue.filter(
														(id: string) => id !== null && id !== undefined && id !== ""
													);
													setFormValue({
														...formValue,
														assignedEmployeeIds: cleanValue,
													});
												}}
											>
												{option.label}
											</div>
										))}
									</div>
								)}

								{/* Error message */}
								{errors[field.name] && (
									<span className="text-xs text-red-600 mt-1">
										{errors[field.name]}
									</span>
								)}
							</div>
						) : field.type === "textarea" ? (
							<>
								<textarea
									name={field.name}
									value={formValue[field.name] || ""}
									onChange={(e) =>
										setFormValue({...formValue, [field.name]: e.target.value})
									}
									rows={4}
									className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
										errors[field.name] ? "border-red-500" : ""
									}`}
								/>
								{errors[field.name] && (
									<span className="text-xs text-red-600 mt-1">
										{errors[field.name]}
									</span>
								)}
							</>
						) : (
							<>
								<input
									type={field.type}
									name={field.name}
									value={formValue[field.name] || ""}
									onChange={(e) =>
										setFormValue({...formValue, [field.name]: e.target.value})
									}
									className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
										errors[field.name] ? "border-red-500" : ""
									}`}
								/>
								{errors[field.name] && (
									<span className="text-xs text-red-600 mt-1">
										{errors[field.name]}
									</span>
								)}
							</>
						)}
					</div>
				))}
			</div>
		</form>
	);
};

export default BookingForm;
