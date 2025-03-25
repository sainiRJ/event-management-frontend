import React from "react";
import {Form, Grid, Row, Col} from "rsuite";
import InputField from "./InputField";
import SelectField from "./SelectField";
import DatePickerField from "./DatePickerField";

interface FormField {
	name: string;
	label: string;
	type: "text" | "tel" | "number" | "select" | "date" | "textarea";
	options?: {label: string; value: string | number}[];
	colSpan?: number;
}

interface CustomFormProps {
	formValue: any;
	setFormValue: (value: any) => void;
	fields: FormField[];
	validationModel?: any;
}

const CustomForm: React.FC<CustomFormProps> = ({
	formValue,
	setFormValue,
	fields,
	validationModel,
}) => {
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
		<Form
			fluid
			style={{maxWidth: "100%", overflowX: "hidden"}}
			model={validationModel}
			formValue={formValue}
			onChange={setFormValue}
		>
			<Grid fluid>{renderFormFields()}</Grid>
		</Form>
	);
};

export default CustomForm;
