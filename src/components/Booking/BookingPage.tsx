import React from "react";
import {useState, useEffect} from "react";
import AddNewBooking from "./AddNewBooking/AddNewBooking";
import BookingTable from "./BookingTable";
import {useThemeAwareObject} from "../../styles/theme/ThemingHelper";
import {useAppDispatch, useAppSelector} from "../../store/Hooks";
import {fetchServices} from "@/store/services/ThunkActions";
import {RootState} from "@store/index";

import Styles from "./Styles";

const BookingPage = () => {
	const styles = useThemeAwareObject(Styles);
	const dispatch = useAppDispatch();
	useEffect(() => {
		dispatch(fetchServices());
	}, []);

	const {serviceList} = useAppSelector(
		(state: RootState) => state.serviceReducer,
	);
	return (
		<>
			<div>
				<div>
					<AddNewBooking serviceList={serviceList} />
				</div>
				<div>
					<BookingTable />
				</div>
			</div>
		</>
	);
};

export default BookingPage;
