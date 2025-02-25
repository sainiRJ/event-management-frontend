import React, {useState, useEffect} from "react";
import {useAppDispatch, useAppSelector} from "../../store/Hooks";
import {Table, Placeholder} from "rsuite";
import {mockUsers, User} from "./mock";
import {getAllBookings} from "@/store/booking/ThunkActions";
import {RootState} from "@/store";

const {Column, HeaderCell, Cell} = Table;

const BookingTableWrapper = ({children}: {children: React.ReactNode}) => {
	return (
		<div
			style={{
				backgroundColor: "var(--rs-bg-card)", // Distinct background color
				padding: "16px",
				borderRadius: "8px",
				boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Subtle shadow for differentiation
				margin: "0 36px", // Add margin to the left and right
			}}
		>
			{children}
		</div>
	);
};

const formatDate = (dateString: string) => {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hour12: true,
	}).format(date);
};

const BookingTable = () => {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<any[]>([]);
	const {bookingList} = useAppSelector(
		(state: RootState) => state.bookingReducer,
	);
	const dispatch = useAppDispatch();

	useEffect(() => {
		dispatch(getAllBookings());
	}, [dispatch]);

	useEffect(() => {
		console.log("bookingList", bookingList);
		const fetchedData = bookingList; // Simulate fetching mock data
		setTimeout(() => {
			if (fetchedData && Array.isArray(fetchedData) && fetchedData.length > 0) {
				setData(fetchedData);
				setLoading(false);
			} else {
				setData([]); // Ensure data is always an array
				setLoading(false); // Stop loading when no data
			}
		}, 1000); // Simulate loading delay
	}, [bookingList]);

	console.log("data of bookings ", bookingList);

	const renderLoading = () => (
		<div
			style={{
				position: "absolute",
				width: "100%",
				height: "100%",
				background: "var(--rs-bg-card)",
				padding: 20,
			}}
		>
			<Placeholder.Grid rows={9} columns={4} active />
		</div>
	);

	const renderNoDataMessage = () => (
		<div
			style={{
				textAlign: "center",
				padding: "20px",
				color: "var(--rs-text-secondary)",
				fontSize: "16px",
			}}
		>
			No Data Found
		</div>
	);

	return (
		<>
			<BookingTableWrapper>
				{loading ? (
					renderLoading()
				) : (
					<Table
						cellBordered
						autoHeight={false} // Fixed autoHeight to false
						height={400} // Fixed height
						data={data}
					>
						<Column width={200} resizable>
							<HeaderCell>DATE & TIME</HeaderCell>
							<Cell>
								{(rowData) =>
									rowData.eventDate ? formatDate(rowData.eventDate) : "No Date"
								}
							</Cell>
						</Column>
						<Column width={200} resizable>
							<HeaderCell>Event Name</HeaderCell>
							<Cell>
								{(rowData) =>
									rowData ? rowData.eventName : renderNoDataMessage()
								}
							</Cell>
						</Column>
						<Column width={200} resizable>
							<HeaderCell>Customer Name</HeaderCell>
							<Cell>
								{(rowData) =>
									rowData ? rowData.customerName : renderNoDataMessage()
								}
							</Cell>
						</Column>
						<Column width={300} resizable>
							<HeaderCell>Address</HeaderCell>
							<Cell>
								{(rowData) =>
									rowData ? rowData.location : renderNoDataMessage()
								}
							</Cell>
						</Column>
						<Column width={150} resizable>
							<HeaderCell>Phone Number</HeaderCell>
							<Cell>
								{(rowData) =>
									rowData ? rowData.phoneNumber : renderNoDataMessage()
								}
							</Cell>
						</Column>
						<Column width={200} resizable>
							<HeaderCell>Event Type</HeaderCell>
							<Cell>
								{(rowData) =>
									rowData ? rowData.serviceName : renderNoDataMessage()
								}
							</Cell>
						</Column>
						<Column width={150} resizable>
							<HeaderCell>Budget</HeaderCell>
							<Cell>
								{(rowData) =>
									rowData ? rowData.totalCost : renderNoDataMessage()
								}
							</Cell>
						</Column>
						<Column width={150} resizable>
							<HeaderCell>Advance Payment</HeaderCell>
							<Cell>
								{(rowData) =>
									rowData ? rowData.advancePayment : renderNoDataMessage()
								}
							</Cell>
						</Column>
						<Column width={150} resizable>
							<HeaderCell>Booking Status</HeaderCell>
							<Cell>
								{(rowData) =>
									rowData ? rowData.bookingStatus : renderNoDataMessage()
								}
							</Cell>
						</Column>
						<Column width={150} resizable>
							<HeaderCell>Payment Status</HeaderCell>
							<Cell>
								{(rowData) =>
									rowData ? rowData.paymentStatus : renderNoDataMessage()
								}
							</Cell>
						</Column>
						<Column width={200} resizable>
							<HeaderCell>Booked At</HeaderCell>
							<Cell>
								{(rowData) =>
									rowData.bookedAt ? formatDate(rowData.bookedAt) : "No Date"
								}
							</Cell>
						</Column>
					</Table>
				)}
			</BookingTableWrapper>
		</>
	);
};

export default BookingTable;
