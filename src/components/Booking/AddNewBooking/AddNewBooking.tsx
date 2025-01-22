import React from "react";
import {
	Modal,
	Button,
	ButtonToolbar,
	Form,
	Schema,
	SelectPicker,
	Input,
	DatePicker,
} from "rsuite";

const AddNewBooking = () => {
	const [open, setOpen] = React.useState(false);
	const [formValue, setFormValue] = React.useState({});
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const eventTypes = [
		{label: "Wedding", value: "wedding"},
		{label: "Birthday", value: "birthday"},
		{label: "Corporate Event", value: "corporate"},
		{label: "Other", value: "other"},
	];

	const decorationThemes = [
		{label: "Floral", value: "floral"},
		{label: "Modern", value: "modern"},
		{label: "Traditional", value: "traditional"},
	];

	const {StringType, NumberType} = Schema.Types;

	const model = Schema.Model({
		customerName: StringType().isRequired("Customer name is required."),
		phoneNumber: StringType().isRequired("Phone number is required."),
		email: StringType()
			.isEmail("Please enter a valid email address.")
			.isRequired("Email is required."),
		eventDate: StringType().isRequired("Event date is required."),
		venueAddress: StringType().isRequired("Venue address is required."),
		budget: NumberType().min(0, "Budget must be a positive number."),
	});

	const handleSubmit = () => {
		console.log("Form Value:", formValue);
		handleClose();
	};

	return (
		<>
			<ButtonToolbar>
				<Button onClick={handleOpen}>Add New Booking</Button>
			</ButtonToolbar>

			<Modal open={open} onClose={handleClose}>
				<Modal.Header>
					<Modal.Title>Add New Booking</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form
						fluid
						model={model}
						formValue={formValue}
						onChange={setFormValue}
					>
						<Form.Group controlId="customerName">
							<Form.ControlLabel>Customer Name</Form.ControlLabel>
							<Form.Control name="customerName" />
						</Form.Group>
						<Form.Group controlId="phoneNumber">
							<Form.ControlLabel>Phone Number</Form.ControlLabel>
							<Form.Control name="phoneNumber" type="tel" />
						</Form.Group>
						<Form.Group controlId="email">
							<Form.ControlLabel>Email Address</Form.ControlLabel>
							<Form.Control name="email" type="email" />
						</Form.Group>
						<Form.Group controlId="eventDate">
							<Form.ControlLabel>Event Date</Form.ControlLabel>
							<DatePicker name="eventDate" block />
						</Form.Group>
						<Form.Group controlId="eventTime">
							<Form.ControlLabel>Event Time</Form.ControlLabel>
							<Form.Control name="eventTime" type="time" />
						</Form.Group>
						<Form.Group controlId="eventType">
							<Form.ControlLabel>Event Type</Form.ControlLabel>
							<SelectPicker
								data={eventTypes}
								name="eventType"
								block
								placeholder="Select Event Type"
							/>
						</Form.Group>
						<Form.Group controlId="venueAddress">
							<Form.ControlLabel>Venue Address</Form.ControlLabel>
							<Form.Control
								name="venueAddress"
								componentClass="textarea"
								rows={3}
							/>
						</Form.Group>
						<Form.Group controlId="decorationTheme">
							<Form.ControlLabel>Decoration Theme</Form.ControlLabel>
							<SelectPicker
								data={decorationThemes}
								name="decorationTheme"
								block
								placeholder="Select Theme"
							/>
						</Form.Group>
						<Form.Group controlId="additionalNotes">
							<Form.ControlLabel>Additional Notes</Form.ControlLabel>
							<Form.Control
								name="additionalNotes"
								componentClass="textarea"
								rows={5}
							/>
						</Form.Group>
						<Form.Group controlId="budget">
							<Form.ControlLabel>Budget</Form.ControlLabel>
							<Form.Control name="budget" type="number" />
						</Form.Group>
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={handleSubmit} appearance="primary">
						Submit
					</Button>
					<Button onClick={handleClose} appearance="subtle">
						Cancel
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
};

export default AddNewBooking;
