import React from "react";
import {Form, DatePicker} from "rsuite";

interface DatePickerFieldProps {
	name: string;
	label: string;
	value: any;
	onChange: (value: any) => void;
	error?: string;
}

const CustomDatePicker = React.forwardRef((props: any, ref) => {
	return <DatePicker ref={ref} {...props} />;
});

CustomDatePicker.displayName = "CustomDatePicker";

const DatePickerField: React.FC<DatePickerFieldProps> = ({
	name,
	label,
	value,
	onChange,
	error,
}) => {
	return (
		<Form.Group controlId={name}>
			<Form.ControlLabel>{label}</Form.ControlLabel>
			<Form.Control
				name={name}
				errorMessage={error}
				accepter={CustomDatePicker}
				block
				format="yyyy-MM-dd HH:mm"
				value={value}
				onChange={onChange}
			/>
		</Form.Group>
	);
};

export default DatePickerField;
