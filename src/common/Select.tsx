import React from "react";
import {Form, SelectPicker} from "rsuite";

interface SelectFieldProps {
	name: string;
	label: string;
	data: {label: string; value: string}[];
	value: any;
	onChange: (value: any) => void;
}

const SelectField: React.FC<SelectFieldProps> = ({
	name,
	label,
	data,
	value,
	onChange,
}) => {
	return (
		<Form.Group controlId={name}>
			<Form.ControlLabel>{label}</Form.ControlLabel>
			<SelectPicker
				data={data}
				name={name}
				block
				placeholder="Select an option"
				value={value}
				onChange={onChange}
			/>
		</Form.Group>
	);
};

export default SelectField;
