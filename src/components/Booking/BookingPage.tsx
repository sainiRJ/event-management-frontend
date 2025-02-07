import React from "react";
import {useState, useEffect} from "react";
import AddNewBooking from "./AddNewBooking/AddNewBooking";
import BookingTable from "./BookingTable";
import {useThemeAwareObject} from "../../styles/theme/ThemingHelper";
import {useAppDispatch, useAppSelector} from "../../store/Hooks";
import {fetchServices} from "@/store/services/ThunkActions";
import {fetchStatus} from "@/store/status/ThunkActions";

import {RootState} from "@store/index";

import Styles from "./Styles";

const BookingPage = () => {
	const styles = useThemeAwareObject(Styles);
	const dispatch = useAppDispatch();
	useEffect(() => {
		dispatch(fetchServices());
		dispatch(fetchStatus());
	}, []);

	const {statusList} = useAppSelector(
		(state: RootState) => state.statusReducer,
	);

	const {serviceList} = useAppSelector(
		(state: RootState) => state.serviceReducer,
	);
	console.log("statusList", statusList);
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
