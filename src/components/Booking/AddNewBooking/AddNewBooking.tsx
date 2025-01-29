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
import {iService} from "@/customTypes/appDataTypes/serviceTypes";
import {createBooking} from "../../../store/booking/ThunkActions";
import {useAppDispatch} from "../../../store/Hooks";
import {iCreateBookingDTO} from "../../../customTypes/appDataTypes/bookingTypes";

interface AddNewBookingProps {
	serviceList: iService[];
}

const AddNewBooking: React.FC<AddNewBookingProps> = ({serviceList}) => {
	const [open, setOpen] = React.useState(false);
	const [formValue, setFormValue] = React.useState<Partial<iCreateBookingDTO>>(
		{},
	);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);
	const dispatch = useAppDispatch();

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
		eventDateTime: StringType().isRequired("Event date and time is required."),
		venueAddress: StringType().isRequired("Venue address is required."),
		budget: NumberType().min(0, "Budget must be a positive number."),
	});

	const handleSubmit = async () => {
		console.log("formValue", formValue);
		const payload: iCreateBookingDTO = {
			customerName: formValue.customerName || "",
			phoneNumber: formValue.phoneNumber || "",
			email: formValue.email || "",
			eventDateTime: formValue.eventDateTime ?? "", // Ensure it's included in the correct format
			service: formValue.service || "", // Replace eventType with services
			venueAddress: formValue.venueAddress || "",
			decorationTheme: formValue.decorationTheme || "",
			budget: formValue.budget || "0",
			additionalNotes: formValue.additionalNotes || "",
		};

		try {
			const response = await dispatch(createBooking(payload));
			if (response.meta.requestStatus === "fulfilled") {
				console.log("response data ", response);
			} else {
				console.error("errorMessage", response.payload);
			}
		} catch (error) {
			console.error("An unexpected error occurred.");
		}
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
						<Form.Group controlId="service">
							<Form.ControlLabel>Service</Form.ControlLabel>
							<SelectPicker
								data={serviceList.map((service) => ({
									label: service.service_name,
									value: service.id,
								}))}
								name="service"
								block
								placeholder="Select a Service"
								value={formValue.service}
								onChange={(value) =>
									setFormValue((prev) => ({
										...prev,
										service: value ?? undefined,
									}))
								}
							/>
						</Form.Group>
						<Form.Group controlId="eventDateTime">
							<Form.ControlLabel>Event Date & Time</Form.ControlLabel>
							<DatePicker
								name="eventDateTime"
								block
								format="yyyy-MM-dd HH:mm"
								value={
									formValue.eventDateTime
										? new Date(formValue.eventDateTime)
										: null
								}
								onChange={(value) =>
									setFormValue((prev) => ({
										...prev,
										eventDateTime: value ? value.toISOString() : "",
									}))
								}
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
								value={formValue.decorationTheme}
								onChange={(value) =>
									setFormValue((prev) => ({
										...prev,
										decorationTheme: value ?? undefined,
									}))
								}
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
