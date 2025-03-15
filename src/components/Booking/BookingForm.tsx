import React from "react";
import {Form, Grid, Row, Col} from "rsuite";
import InputField from "../../common/InputField";
import SelectField from "../../common/Select";
import DatePickerField from "../../common/DatePicker";
import {bookingValidationSchema} from "../../validations/BookingValidationSchema";
import {iCreateBookingDTO} from "../../customTypes/appDataTypes/bookingTypes";

interface BookingFormProps {
	formValue: iCreateBookingDTO;
	setFormValue: (value: any) => void;
	serviceList: {label: string; value: string}[];
	decorationThemes: {label: string; value: string}[];
	bookingStatuses: {label: string; value: string}[];
	paymentStatuses: {label: string; value: string}[];
}

const BookingForm: React.FC<BookingFormProps> = ({
	formValue,
	setFormValue,
	serviceList,
	decorationThemes,
	bookingStatuses,
	paymentStatuses,
}) => {
	return (
		<Form
			fluid
			style={{maxWidth: "100%", overflowX: "hidden"}}
			model={bookingValidationSchema}
			formValue={formValue}
			onChange={setFormValue}
		>
			<Grid fluid>
				<Row gutter={16}>
					<Col xs={12}>
						<InputField
							name="customerName"
							label="Customer Name"
							value={formValue.customerName}
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
							onChange={(value) =>
								setFormValue({...formValue, eventName: value})
							}
						/>
					</Col>
					<Col xs={12}>
						<SelectField
							name="service"
							label="Service"
							data={serviceList}
							value={formValue.serviceId}
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
							value={formValue.eventDate}
							onChange={(value) =>
								setFormValue({...formValue, eventDate: value})
							}
						/>
					</Col>
					<Col xs={12}>
						<InputField
							name="venueAddress"
							label="Venue Address"
							value={formValue.venueAddress}
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
							onChange={(value) =>
								setFormValue({...formValue, advancePayment: value})
							}
						/>
					</Col>
				</Row>

				<Row gutter={16}>
					<Col xs={12}>
						<SelectField
							name="Booking Status"
							label="Booking Status"
							data={bookingStatuses}
							value={formValue.bookingStatusId}
							onChange={(value) =>
								setFormValue({...formValue, bookingStatusId: value})
							}
						/>
					</Col>
					<Col xs={12}>
						<SelectField
							name="Payment Status"
							label="Payment Status"
							data={paymentStatuses}
							value={formValue.paymentStatusId}
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
							onChange={(value) =>
								setFormValue({...formValue, additionalNotes: value})
							}
						/>
					</Col>
				</Row>
			</Grid>
		</Form>
	);
};

export default BookingForm;
