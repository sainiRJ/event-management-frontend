import React from "react";
import { Form, Input } from "rsuite";

export interface InputFieldProps {
  name: string;
  label: string;
  value: any;
  onChange: (value: any) => void;
  type?: string;
  as?: "input" | "textarea";
  rows?: number;
  error?: string;
  placeholder?: string;
}

interface CustomInputProps extends React.ComponentProps<typeof Input> {
  error?: string;
  as?: "input" | "textarea";
  rows?: number;
}

const CustomInput = React.forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  CustomInputProps
>(({ as, rows, type, ...rest }, ref) => {
  return (
    <Input
      {...rest}
      as={as === "textarea" ? "textarea" : undefined} // Ensure 'as' is only set for textarea
      rows={as === "textarea" ? rows : undefined} // Only pass rows for textarea
      inputRef={ref as any} // Avoid TypeScript error
      type={as === "textarea" ? undefined : type} // Ensure type is only set for input
    />
  );
});

CustomInput.displayName = "CustomInput";

const InputField: React.FC<InputFieldProps> = ({
  name,
  label,
  value,
  onChange,
  type = "text",
  as = "input",
  rows = 3,
  error,
  placeholder,
}) => {
  return (
    <Form.Group controlId={name}>
      <Form.ControlLabel>{label}</Form.ControlLabel>
      <Form.Control
        name={name}
        errorMessage={error}
        accepter={CustomInput}
        as={as === "textarea" ? "textarea" : undefined} // Ensure it's only passed for textarea
        rows={as === "textarea" ? rows : undefined} // Pass rows only for textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </Form.Group>
  );
};

export default InputField;
