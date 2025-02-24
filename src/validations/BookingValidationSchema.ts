import {Schema} from "rsuite";

const {StringType, NumberType} = Schema.Types;

export const bookingValidationSchema = Schema.Model({
	customerName: StringType().isRequired("Customer name is required."),
	phoneNumber: StringType()
		.isRequired("Phone number is required.")
		.pattern(/^\d{10}$/, "Please enter a valid 10-digit phone number."),
	eventName: StringType().isRequired("event name is required."),
	eventDateTime: StringType().isRequired("Event date and time is required."),
	venueAddress: StringType().isRequired("Venue address is required."),
	budget: NumberType().min(0, "Budget must be a positive number."),
});
