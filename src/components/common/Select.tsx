import React from "react";
import {Form, SelectPicker, PickerHandle} from "rsuite";

interface SelectFieldProps {
	name: string;
	label: string;
	data: {label: string; value: string}[];
	value: any;
	onChange: (value: any) => void;
	error?: string;
	placeholder?: string;
}

interface CustomSelectProps extends React.ComponentProps<typeof SelectPicker> {
	error?: string;
}

const CustomSelect = React.forwardRef<PickerHandle, CustomSelectProps>((props, ref) => {
	const { error, ...rest } = props;
	return <SelectPicker ref={ref} {...rest} />;
});

CustomSelect.displayName = "CustomSelect";

const SelectField: React.FC<SelectFieldProps> = ({
	name,
	label,
	data,
	value,
	onChange,
	error,
	placeholder = "Select an option",
}) => {
	return (
		<Form.Group controlId={name}>
			<Form.ControlLabel>{label}</Form.ControlLabel>
			<Form.Control
				name={name}
				errorMessage={error}
				accepter={CustomSelect}
				data={data}
				block
				placeholder={placeholder}
				value={value}
				onChange={onChange}
			/>
		</Form.Group>
	);
};

export default SelectField;
