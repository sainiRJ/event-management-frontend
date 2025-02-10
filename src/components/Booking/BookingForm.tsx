import React from "react";
import {Form, SelectPicker, Input, DatePicker} from "rsuite";
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
			model={bookingValidationSchema}
			formValue={formValue}
			onChange={setFormValue}
		>
			<Form.Group controlId="customerName">
				<Form.ControlLabel>Customer Name</Form.ControlLabel>
				<Form.Control name="customerName" value={formValue.customerName} />
			</Form.Group>
			<Form.Group controlId="phoneNumber">
				<Form.ControlLabel>Phone Number</Form.ControlLabel>
				<Form.Control
					name="phoneNumber"
					type="tel"
					value={formValue.phoneNumber}
				/>
			</Form.Group>
			<Form.Group controlId="email">
				<Form.ControlLabel>Email Address</Form.ControlLabel>
				<Form.Control name="email" type="email" value={formValue.email} />
			</Form.Group>
			<Form.Group controlId="service">
				<Form.ControlLabel>Service</Form.ControlLabel>
				<SelectPicker
					data={serviceList}
					name="service"
					block
					placeholder="Select a Service"
					value={formValue.service}
					onChange={(value) => setFormValue({...formValue, service: value})}
				/>
			</Form.Group>
			<Form.Group controlId="eventDateTime">
				<Form.ControlLabel>Event Date & Time</Form.ControlLabel>
				<DatePicker
					name="eventDateTime"
					block
					format="yyyy-MM-dd HH:mm"
					value={formValue.eventDateTime}
					onChange={(value) =>
						setFormValue({...formValue, eventDateTime: value})
					}
				/>
			</Form.Group>
			<Form.Group controlId="venueAddress">
				<Form.ControlLabel>Venue Address</Form.ControlLabel>
				<Form.Control
					name="venueAddress"
					componentClass="textarea"
					rows={3}
					value={formValue.venueAddress}
				/>
			</Form.Group>
			<Form.Group controlId="decorationTheme">
				<Form.ControlLabel>Decoration Theme</Form.ControlLabel>
				<SelectPicker
					data={decorationThemes}
					name="decorationTheme"
					block
					placeholder="Select Theme"
					value={formValue.decorationTheme}
					onChange={(value) =>
						setFormValue({...formValue, decorationTheme: value})
					}
				/>
			</Form.Group>
			<Form.Group controlId="budget">
				<Form.ControlLabel>Budget</Form.ControlLabel>
				<Form.Control name="budget" type="number" value={formValue.budget} />
			</Form.Group>
			<Form.Group controlId="additionalNotes">
				<Form.ControlLabel>Additional Notes</Form.ControlLabel>
				<Form.Control
					name="additionalNotes"
					componentClass="textarea"
					rows={5}
					value={formValue.additionalNotes}
				/>
			</Form.Group>
		</Form>
	);
};

export default BookingForm;
