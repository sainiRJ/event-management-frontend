import React, {useState, useEffect} from "react";
import {useAppDispatch, useAppSelector} from "../../store/Hooks";
import {fetchServices} from "@/store/services/ThunkActions";
import {fetchStatus} from "@/store/status/ThunkActions";
import {createBooking} from "@/store/booking/ThunkActions";
import {RootState} from "@store/index";
import BookingTable from "./BookingTable";
import Modal from "../Modal/Modal";
import BookingForm from "./BookingForm";
import BookingFilter from "./BookingFilter";
import Styles from "./Styles";
import {useThemeAwareObject} from "../../styles/theme/ThemingHelper";
import {bookingValidationSchema} from "../../validations/BookingValidationSchema";
import "./BookingPage.css";

const initialFormValue = {
	customerName: "",
	phoneNumber: "",
	serviceId: null,
	eventDate: null,
	venueAddress: "",
	decorationTheme: null,
	budget: "",
	advancePayment: "",
	eventName: "",
	additionalNotes: "",
	paymentStatusId: "",
	bookingStatusId: "",
};

const BookingPage = () => {
	const styles = useThemeAwareObject(Styles);
	const dispatch = useAppDispatch();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [formValue, setFormValue] = useState(initialFormValue);
	const [showValidation, setShowValidation] = useState(false);

	useEffect(() => {
		dispatch(fetchServices());
		dispatch(fetchStatus());
	}, [dispatch]);

	const decorationThemes = [
		{label: "Floral Elegance", value: "floral"},
		{label: "Royal Palace", value: "royal"},
		{label: "Modern Minimalist", value: "modern"},
	];
	const {statusList} = useAppSelector(
		(state: RootState) => state.statusReducer,
	);
	const {serviceList} = useAppSelector(
		(state: RootState) => state.serviceReducer,
	);

	const bookingStatuses = statusList
		.filter((status) => status.context === "booking")
		.map((status) => ({label: status.name, value: status.id}));

	const paymentStatuses = statusList
		.filter((status) => status.context === "payment")
		.map((status) => ({label: status.name, value: status.id}));

	const handleSubmit = async () => {
		setShowValidation(true);
		const checkResult = bookingValidationSchema.check(formValue);
		const hasErrors = Object.values(checkResult).some((field) => field.hasError);

		if (hasErrors) {
			return;
		}

		try {
			await dispatch(createBooking(formValue));
			setFormValue(initialFormValue);
			setIsModalOpen(false);
			setShowValidation(false);
			// Trigger table reload
			dispatch(fetchServices());
			dispatch(fetchStatus());
		} catch (error) {
			console.error("Failed to create booking:", error);
		}
	};

	const handleModalClose = () => {
		setIsModalOpen(false);
		setFormValue(initialFormValue);
		setShowValidation(false);
	};

	return (
		<div css={styles.container}>
			<BookingTable onAddNewBooking={() => setIsModalOpen(true)} bookingStatuses={bookingStatuses} paymentStatuses={paymentStatuses} />
			<Modal
				open={isModalOpen}
				onClose={handleModalClose}
				onSubmit={handleSubmit}
				title="Add New Booking"
				size="lg"
			>
				<BookingForm
					formValue={formValue}
					setFormValue={setFormValue}
					serviceList={serviceList.map((service) => ({
						label: service.serviceName,
						value: service.id,
					}))}
					decorationThemes={decorationThemes}
					bookingStatuses={bookingStatuses}
					paymentStatuses={paymentStatuses}
					onSubmit={handleSubmit}
					showValidation={showValidation}
				/>
			</Modal>
		</div>
	);
};

export default BookingPage;
