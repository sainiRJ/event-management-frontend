import React from "react";
import {Form, Grid, Row, Col} from "rsuite";
import InputField from "./InputField";
import SelectField from "./SelectField";
import DatePickerField from "./DatePickerField";

export interface FormField {
	name: string;
	label: string;
	type: "text" | "tel" | "number" | "select" | "date" | "textarea";
	options?: {label: string; value: string | number}[];
	colSpan?: number;
}

export interface CustomFormProps {
	formValue: any;
	setFormValue: (value: any) => void;
	fields: FormField[];
	validationModel?: any;
	onSubmit: (value: any) => void;
	errors?: Record<string, string>;
	formId?: string;
}

const CustomForm: React.FC<CustomFormProps> = ({
	formValue,
	setFormValue,
	fields,
	validationModel,
	onSubmit,
	errors = {},
	formId,
}) => {
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSubmit(formValue);
	};

	const renderField = (field: FormField) => {
		const handleChange = (value: any) => {
			setFormValue({...formValue, [field.name]: value});
		};

		switch (field.type) {
			case "select":
				return (
					<SelectField
						name={field.name}
						label={field.label}
						data={field.options || []}
						value={formValue[field.name]}
						onChange={handleChange}
					/>
				);
			case "date":
				return (
					<DatePickerField
						name={field.name}
						label={field.label}
						value={formValue[field.name]}
						onChange={handleChange}
					/>
				);
			case "textarea":
				return (
					<InputField
						name={field.name}
						label={field.label}
						value={formValue[field.name]}
						onChange={handleChange}
						as="textarea"
						rows={3}
					/>
				);
			default:
				return (
					<InputField
						name={field.name}
						label={field.label}
						type={field.type}
						value={formValue[field.name]}
						onChange={handleChange}
					/>
				);
		}
	};

	const renderFormFields = () => {
		const rows: React.ReactElement[] = [];

		for (let i = 0; i < fields.length; i += 2) {
			const field1 = fields[i];
			const field2 = fields[i + 1];

			rows.push(
				<Row key={i} gutter={16}>
					<Col xs={field1.colSpan || 12}>{renderField(field1)}</Col>
					{field2 && <Col xs={field2.colSpan || 12}>{renderField(field2)}</Col>}
				</Row>,
			);
		}

		return rows;
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6" id={formId}>
			<div className="grid grid-cols-24 gap-4">
				{fields.map((field) => (
					<div key={field.name} className={`col-span-${field.colSpan}`}>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							{field.label}
						</label>
						{field.type === "select" ? (
							<>
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
								{errors[field.name] && (
									<span className="text-xs text-red-600 mt-1">
										{errors[field.name]}
									</span>
								)}
							</>
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

export default CustomForm;
