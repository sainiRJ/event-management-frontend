import React from "react";
import AddNewBooking from "./AddNewBooking/AddNewBooking";
import BookingTable from "./BookingTable";
import {useThemeAwareObject} from "../../styles/theme/ThemingHelper";

import Styles from "./Styles";

const BookingPage = () => {
	const styles = useThemeAwareObject(Styles);

	return (
		<>
			<div>
				<div>
					<AddNewBooking />
				</div>
				<div>
					<BookingTable />
				</div>
			</div>
		</>
	);
};

export default BookingPage;
