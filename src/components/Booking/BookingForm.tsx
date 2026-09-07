import React from "react";
import {useAppSelector} from "@/store/Hooks";
import {RootState} from "@/store";
import {iService} from "@/customTypes/appDataTypes/serviceTypes";
import Input from "../ui/Input";
import Select from "../ui/Select";
import MultiSelect from "../ui/MultiSelect";

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

	const activeEmployees = employeeList
		.filter((emp: any) => emp.status === "Working")
		.map((emp) => ({
			label: emp.name,
			value: emp.id || "",
		}));

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const {name, value} = e.target;
		setFormValue({...formValue, [name]: value});
	};

	const handleMultiSelectChange = (name: string, value: string[]) => {
		setFormValue({...formValue, [name]: value});
	};

	return (
		<div className="space-y-6 animate-in fade-in duration-300">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				<Input
					name="customerName"
					label="Customer Name"
					value={formValue.customerName || ""}
					onChange={handleChange}
					error={errors.customerName}
					placeholder="Enter customer name"
				/>

				<Input
					name="phoneNumber"
					label="Phone Number"
					type="tel"
					value={formValue.phoneNumber || ""}
					onChange={handleChange}
					error={errors.phoneNumber}
					placeholder="Enter 10-digit number"
				/>

				<Input
					name="eventName"
					label="Event Name"
					value={formValue.eventName || ""}
					onChange={handleChange}
					error={errors.eventName}
					placeholder="e.g. Wedding, Birthday"
				/>

				<Input
					name="eventDate"
					label="Event Date"
					type="date"
					value={formValue.eventDate || ""}
					onChange={handleChange}
					error={errors.eventDate}
				/>

				<Input
					name="venueAddress"
					label="Venue Address"
					value={formValue.venueAddress || ""}
					onChange={handleChange}
					error={errors.venueAddress}
					placeholder="Full venue address"
				/>

				<Select
					name="serviceId"
					label="Service"
					options={services}
					value={formValue.serviceId || ""}
					onChange={handleChange}
					error={errors.serviceId}
				/>

				{/* Where the booking came from: only asked when the vendor is
				    entering one by hand - website and chat stamp themselves. */}
				{!isEdit && (
					<Select
						name="source"
						label="How did it come in?"
						options={[
							{label: "Phone call / WhatsApp", value: "phone"},
							{label: "Walk-in / entered by me", value: "admin"},
						]}
						value={formValue.source || "phone"}
						onChange={handleChange}
					/>
				)}

				<Select
					name="bookingStatusId"
					label="Booking Status"
					options={bookingStatuses}
					value={formValue.bookingStatusId || ""}
					onChange={handleChange}
					error={errors.bookingStatusId}
				/>

				<Input
					name="budget"
					label="Total Amount"
					type="number"
					value={formValue.budget || ""}
					onChange={handleChange}
					error={errors.budget}
					placeholder="0.00"
				/>

				<Input
					name="advancePayment"
					label="Advance Amount"
					type="number"
					value={formValue.advancePayment || ""}
					onChange={handleChange}
					error={errors.advancePayment}
					placeholder="0.00"
				/>

				<Select
					name="paymentStatusId"
					label="Payment Status"
					options={paymentStatuses}
					value={formValue.paymentStatusId || ""}
					onChange={handleChange}
					error={errors.paymentStatusId}
				/>

				<div className="md:col-span-2">
					<MultiSelect
						label="Assigned Employees (Optional)"
						options={activeEmployees}
						value={formValue.assignedEmployeeIds || []}
						onChange={(val) =>
							handleMultiSelectChange("assignedEmployeeIds", val)
						}
						error={errors.assignedEmployeeIds}
						placeholder="Select employees to assign"
					/>
				</div>

				<div className="md:col-span-2">
					<Input
						name="notes"
						label="Notes"
						as="textarea"
						rows={3}
						value={formValue.notes || ""}
						onChange={handleChange}
						error={errors.notes}
						placeholder="Additional requirements or details..."
					/>
				</div>
			</div>
		</div>
	);
};

export default BookingForm;
