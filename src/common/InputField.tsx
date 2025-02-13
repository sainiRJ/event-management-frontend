import React from "react";
import {Form, Input} from "rsuite";

interface InputFieldProps {
	name: string;
	label: string;
	type?: string;
	value: any;
	onChange?: (value: any) => void;
}

const InputField: React.FC<InputFieldProps> = ({
	name,
	label,
	type = "text",
	value,
	onChange,
}) => {
	return (
		<Form.Group controlId={name}>
			<Form.ControlLabel>{label}</Form.ControlLabel>
			<Form.Control name={name} type={type} value={value} onChange={onChange} />
		</Form.Group>
	);
};

export default InputField;
