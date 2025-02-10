import React, {useState, useEffect} from "react";
import {useAppDispatch, useAppSelector} from "../../store/Hooks";
import {fetchServices} from "@/store/services/ThunkActions";
import {fetchStatus} from "@/store/status/ThunkActions";
import {RootState} from "@store/index";
import BookingTable from "./BookingTable";
import Modal from "../Modal/Modal";
import BookingForm from "./BookingForm";
import Styles from "./Styles";
import {useThemeAwareObject} from "../../styles/theme/ThemingHelper";
import {ButtonToolbar, Button} from "rsuite";
import "./BookingPage.css";
const BookingPage = () => {
	const styles = useThemeAwareObject(Styles);
	const dispatch = useAppDispatch();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [formValue, setFormValue] = useState({
		customerName: "",
		phoneNumber: "",
		email: "",
		service: null,
		eventDateTime: null,
		venueAddress: "",
		decorationTheme: null,
		budget: "",
		additionalNotes: "",
	});

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

	const handleSubmit = () => {
		console.log("Submitting Form:", formValue);
		setIsModalOpen(false);
	};

	return (
		<div css={styles.container}>
			<ButtonToolbar>
				<Button
					className="add-new-booking"
					onClick={() => setIsModalOpen(true)}
				>
					Add New Booking
				</Button>
			</ButtonToolbar>
			<BookingTable />
			<Modal
				open={isModalOpen}
				onClose={() => setIsModalOpen(false)}
				onSubmit={handleSubmit}
				title="Add New Booking"
			>
				<BookingForm
					formValue={formValue}
					setFormValue={setFormValue}
					serviceList={serviceList.map((service) => ({
						label: service.service_name,
						value: service.id,
					}))}
					decorationThemes={decorationThemes}
				/>
				<button onClick={handleSubmit}>Submit</button>
			</Modal>
		</div>
	);
};

export default BookingPage;
