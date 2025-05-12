import React from "react";
import {employeeValidationSchema} from "@/validations/EmployeeValidationSchema";

interface EmployeeFormProps {
	formValue: any;
	setFormValue: (value: any) => void;
	onSubmit: (value: any) => void;
	errors?: Record<string, string>;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
	formValue,
	setFormValue,
	onSubmit,
	errors = {},
}) => {
	const formFields = [
		{name: "name", label: "Name", type: "text"},
		{name: "email", label: "Email", type: "email"},
		{name: "phoneNumber", label: "Phone Number", type: "tel"},
		{name: "designation", label: "Designation", type: "text"},
		{name: "salary", label: "Salary", type: "number"},
		{name: "statusId", label: "Status", type: "select"},
		{name: "joinedDate", label: "Joined Date", type: "date"},
	];

	// Example status options, replace with real data as needed
	const statusOptions = [
		{label: "Active", value: "active"},
		{label: "Inactive", value: "inactive"},
	];

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const {name, value, type} = e.target;
		setFormValue({
			...formValue,
			[name]: type === "number" ? Number(value) : value,
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formValue);
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="space-y-6 w-full"
			id="employee-form"
		>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
				{formFields.map((field) => (
					<div key={field.name} className="col-span-1 flex flex-col">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							{field.label}
						</label>
						{field.type === "select" ? (
							<select
								name={field.name}
								value={formValue[field.name] || ""}
								onChange={handleChange}
								className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
									errors[field.name] ? "border-red-500" : ""
								}`}
							>
								<option value="">Select {field.label}</option>
								{statusOptions.map((option) => (
									<option key={option.value} value={option.value}>
										{option.label}
									</option>
								))}
							</select>
						) : (
							<input
								type={field.type}
								name={field.name}
								value={formValue[field.name] || ""}
								onChange={handleChange}
								className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
									errors[field.name] ? "border-red-500" : ""
								}`}
							/>
						)}
						{errors[field.name] && (
							<span className="text-xs text-red-600 mt-1">
								{errors[field.name]}
							</span>
						)}
					</div>
				))}
			</div>
		</form>
	);
};

export default EmployeeForm;
