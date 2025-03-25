import {Schema} from "rsuite";

const {StringType, NumberType} = Schema.Types;

export const employeeValidationSchema = Schema.Model({
	name: StringType().isRequired("Name is required."),
	email: StringType()
		.isRequired("Email is required.")
		.isEmail("Please enter a valid email."),
	phoneNumber: StringType()
		.isRequired("Phone number is required.")
		.pattern(/^\d{10}$/, "Please enter a valid 10-digit phone number."),
	designation: StringType().isRequired("Designation is required."),
	salary: NumberType()
		.isRequired("Salary is required.")
		.min(0, "Salary must be a positive number."),
	status: StringType().isRequired("Status is required."),
	joinedDate: StringType().isRequired("Joined date is required."),
});
