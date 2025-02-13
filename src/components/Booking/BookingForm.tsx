import React from "react";
import {Form, Grid, Row, Col} from "rsuite";
import InputField from "../../common/InputField";
import SelectField from "../../common/Select";
import DatePickerField from "../../common/DatePicker";
import {bookingValidationSchema} from "../../validations/BookingValidationSchema";

interface BookingFormProps {
	formValue: any;
	setFormValue: (value: any) => void;
	serviceList: {label: string; value: string}[];
	decorationThemes: {label: string; value: string}[];
}

const BookingForm: React.FC<BookingFormProps> = ({
	formValue,
	setFormValue,
	serviceList,
	decorationThemes,
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
							name="email"
							label="Email Address"
							type="email"
							value={formValue.email}
							onChange={(value) => setFormValue({...formValue, email: value})}
						/>
					</Col>
					<Col xs={12}>
						<SelectField
							name="service"
							label="Service"
							data={serviceList}
							value={formValue.service}
							onChange={(value) => setFormValue({...formValue, service: value})}
						/>
					</Col>
				</Row>

				<Row gutter={16}>
					<Col xs={12}>
						<DatePickerField
							name="eventDateTime"
							label="Event Date & Time"
							value={formValue.eventDateTime}
							onChange={(value) =>
								setFormValue({...formValue, eventDateTime: value})
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
