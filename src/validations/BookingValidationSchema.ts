import {Schema} from "rsuite";

const {StringType, NumberType} = Schema.Types;

export const bookingValidationSchema = Schema.Model({
	customerName: StringType().isRequired("Customer name is required."),
	phoneNumber: StringType()
		.isRequired("Phone number is required.")
		.pattern(/^\d{10}$/, "Please enter a valid 10-digit phone number."),
	eventName: StringType().isRequired("Event name is required."),
	eventDate: StringType().isRequired("Event date and time is required."),
	venueAddress: StringType().isRequired("Venue address is required."),
	budget: NumberType()
		.isRequired("Budget is required.")
		.min(0, "Budget must be a positive number."),
	serviceId: StringType().isRequired("Service is required."),
	bookingStatusId: StringType().isRequired("Booking status is required."),
	paymentStatusId: StringType().isRequired("Payment status is required."),
	advancePayment: NumberType()
		.isRequired("Advance payment is required.")
		.min(0, "Advance payment must be a positive number."),
});
