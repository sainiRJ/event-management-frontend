import React from "react";
import {Form, DatePicker} from "rsuite";

interface DatePickerFieldProps {
	name: string;
	label: string;
	value: Date | null;
	onChange: (value: Date | null) => void;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
	name,
	label,
	value,
	onChange,
	...rest
}) => {
	return (
		<Form.Group>
			<Form.ControlLabel>{label}</Form.ControlLabel>
			<DatePicker
				name={name}
				value={value}
				onChange={onChange}
				format="yyyy-MM-dd HH:mm"
				style={{width: "100%"}}
				{...rest}
			/>
		</Form.Group>
	);
};

export default DatePickerField; 