import React from "react";
import {Form, SelectPicker} from "rsuite";

interface SelectFieldProps {
	name: string;
	label: string;
	value: any;
	onChange: (value: any) => void;
	data: {label: string; value: string | number}[];
}

const SelectField: React.FC<SelectFieldProps> = ({
	name,
	label,
	value,
	onChange,
	data,
	...rest
}) => {
	return (
		<Form.Group>
			<Form.ControlLabel>{label}</Form.ControlLabel>
			<SelectPicker
				name={name}
				value={value}
				onChange={onChange}
				data={data}
				style={{width: "100%"}}
				{...rest}
			/>
		</Form.Group>
	);
};

export default SelectField; 