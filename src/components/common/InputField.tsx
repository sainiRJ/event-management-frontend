import React from "react";
import {Form, Input} from "rsuite";

export interface InputFieldProps {
	name: string;
	label: string;
	value: any;
	onChange: (value: any) => void;
	type?: string;
	as?: "input" | "textarea";
	rows?: number;
}

const InputField: React.FC<InputFieldProps> = ({
	name,
	label,
	value,
	onChange,
	type = "text",
	as = "input",
	rows = 3,
	...rest
}) => {
	return (
		<Form.Group>
			<Form.ControlLabel>{label}</Form.ControlLabel>
			{as === "textarea" ? (
				<Input
					as="textarea"
					rows={rows}
					name={name}
					value={value}
					onChange={onChange}
					{...rest}
				/>
			) : (
				<Input
					type={type}
					name={name}
					value={value}
					onChange={onChange}
					{...rest}
				/>
			)}
		</Form.Group>
	);
};

export default InputField;
