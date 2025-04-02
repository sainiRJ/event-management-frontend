import React, { useState, useEffect } from "react";
import {Form, Grid, Row, Col, Schema} from "rsuite";
import InputField from "../common/InputField";
import SelectField from "../common/Select";
import DatePickerField from "../common/DatePicker";
import {bookingValidationSchema} from "../../validations/BookingValidationSchema";
import {iCreateBookingDTO} from "../../customTypes/appDataTypes/bookingTypes";

interface BookingFormProps {
	formValue: iCreateBookingDTO;
	setFormValue: (value: any) => void;
	serviceList: {label: string; value: string}[];
	decorationThemes: {label: string; value: string}[];
	bookingStatuses: {label: string; value: string}[];
	paymentStatuses: {label: string; value: string}[];
	onSubmit: () => void;
	showValidation: boolean;
}

interface FormErrors {
	customerName?: string;
	phoneNumber?: string;
	eventName?: string;
	eventDate?: string;
	venueAddress?: string;
	decorationTheme?: string;
	budget?: string;
	advancePayment?: string;
	bookingStatusId?: string;
	paymentStatusId?: string;
	additionalNotes?: string;
	serviceId?: string;
}

type SchemaCheckResult = {
	[key in keyof FormErrors]: {
		hasError: boolean;
		errorMessage?: string;
	};
};

const BookingForm: React.FC<BookingFormProps> = ({
	formValue,
	setFormValue,
	serviceList,
	decorationThemes,
	bookingStatuses,
	paymentStatuses,
	onSubmit,
	showValidation,
}) => {
	const [formErrors, setFormErrors] = useState<FormErrors>({});

	const validateForm = () => {
		// Convert Date object to string for validation
		const validationValue = {
			...formValue,
			eventDate: formValue.eventDate ? new Date(formValue.eventDate).toISOString() : null,
			budget: formValue.budget ? Number(formValue.budget) : null,
			advancePayment: formValue.advancePayment ? Number(formValue.advancePayment) : null,
		};
		
		const checkResult = bookingValidationSchema.check(validationValue) as SchemaCheckResult;
		const errors: FormErrors = {};
		
		(Object.keys(checkResult) as Array<keyof FormErrors>).forEach((key) => {
			const fieldResult = checkResult[key];
			if (fieldResult?.hasError && fieldResult?.errorMessage) {
				errors[key] = fieldResult.errorMessage;
			}
		});
		
		setFormErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleSubmit = () => {
		if (validateForm()) {
			onSubmit();
		}
	};

	useEffect(() => {
		if (showValidation) {
			validateForm();
		}
	}, [formValue, showValidation]);

	const hasErrors = Object.keys(formErrors).length > 0;

	return (
		<Form
			fluid
			style={{maxWidth: "100%", overflowX: "hidden"}}
			model={bookingValidationSchema}
			formValue={formValue}
			onChange={setFormValue}
			onSubmit={handleSubmit}
		>
			<Grid fluid>
				<Row gutter={16}>
					<Col xs={12}>
						<InputField
							name="customerName"
							label="Customer Name"
							value={formValue.customerName}
							error={showValidation ? formErrors.customerName : undefined}
							onChange={(value) =>
								setFormValue({...formValue, customerName: value})
							}
						/>
					</Col>
					<Col xs={12}>
						<InputField
							name="phoneNumber"
							label="Phone Number"
							type="tel"
							value={formValue.phoneNumber}
							error={showValidation ? formErrors.phoneNumber : undefined}
							onChange={(value) =>
								setFormValue({...formValue, phoneNumber: value})
							}
						/>
					</Col>
				</Row>

				<Row gutter={16}>
					<Col xs={12}>
						<InputField
							name="eventName"
							label="Event Name"
							value={formValue.eventName}
							error={showValidation ? formErrors.eventName : undefined}
							onChange={(value) =>
								setFormValue({...formValue, eventName: value})
							}
						/>
					</Col>
					<Col xs={12}>
						<SelectField
							name="serviceId"
							label="Service"
							data={serviceList}
							value={formValue.serviceId}
							error={showValidation ? formErrors.serviceId : undefined}
							placeholder="Select a service"
							onChange={(value) =>
								setFormValue({...formValue, serviceId: value})
							}
						/>
					</Col>
				</Row>

				<Row gutter={16}>
					<Col xs={12}>
						<DatePickerField
							name="eventDate"
							label="Event Date & Time"
							value={formValue.eventDate ? new Date(formValue.eventDate) : null}
							error={showValidation ? formErrors.eventDate : undefined}
							onChange={(value) =>
								setFormValue({...formValue, eventDate: value ? value.toISOString() : null})
							}
						/>
					</Col>
					<Col xs={12}>
						<InputField
							name="venueAddress"
							label="Venue Address"
							value={formValue.venueAddress}
							error={showValidation ? formErrors.venueAddress : undefined}
							onChange={(value) =>
								setFormValue({...formValue, venueAddress: value})
							}
						/>
					</Col>
				</Row>

				<Row gutter={16}>
					<Col xs={12}>
						<SelectField
							name="decorationTheme"
							label="Decoration Theme"
							data={decorationThemes}
							value={formValue.decorationTheme}
							error={showValidation ? formErrors.decorationTheme : undefined}
							placeholder="Select a theme"
							onChange={(value) =>
								setFormValue({...formValue, decorationTheme: value})
							}
						/>
					</Col>
					<Col xs={12}>
						<InputField
							name="budget"
							label="Budget"
							type="number"
							value={formValue.budget}
							error={showValidation ? formErrors.budget : undefined}
							placeholder="Enter budget amount"
							onChange={(value) => setFormValue({...formValue, budget: value})}
						/>
					</Col>
				</Row>

				<Row gutter={16}>
					<Col xs={12}>
						<InputField
							name="advancePayment"
							label="Advance Payment"
							type="number"
							value={formValue.advancePayment}
							error={showValidation ? formErrors.advancePayment : undefined}
							placeholder="Enter advance payment amount"
							onChange={(value) =>
								setFormValue({...formValue, advancePayment: value})
							}
						/>
					</Col>
				</Row>

				<Row gutter={16}>
					<Col xs={12}>
						<SelectField
							name="bookingStatusId"
							label="Booking Status"
							data={bookingStatuses}
							value={formValue.bookingStatusId}
							error={showValidation ? formErrors.bookingStatusId : undefined}
							placeholder="Select booking status"
							onChange={(value) =>
								setFormValue({...formValue, bookingStatusId: value})
							}
						/>
					</Col>
					<Col xs={12}>
						<SelectField
							name="paymentStatusId"
							label="Payment Status"
							data={paymentStatuses}
							value={formValue.paymentStatusId}
							error={showValidation ? formErrors.paymentStatusId : undefined}
							placeholder="Select payment status"
							onChange={(value) =>
								setFormValue({...formValue, paymentStatusId: value})
							}
						/>
					</Col>
				</Row>

				<Row>
					<Col xs={24}>
						<InputField
							name="additionalNotes"
							label="Additional Notes"
							value={formValue.additionalNotes}
							error={showValidation ? formErrors.additionalNotes : undefined}
							onChange={(value) => setFormValue({...formValue, additionalNotes: value})}
						/>
					</Col>
				</Row>
			</Grid>
		</Form>
	);
};

export default BookingForm;
