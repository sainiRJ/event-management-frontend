import React, {useState, useEffect} from "react";
import {Table, Placeholder} from "rsuite";
import {mockUsers, User} from "./mock";

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

const BookingTable = () => {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<User[]>([]);

	useEffect(() => {
		const fetchedData = mockUsers(0); // Simulate fetching mock data
		setTimeout(() => {
			if (fetchedData && Array.isArray(fetchedData) && fetchedData.length > 0) {
				setData(fetchedData);
				setLoading(false);
			} else {
				setData([]); // Ensure data is always an array
				setLoading(false); // Stop loading when no data
			}
		}, 1000); // Simulate loading delay
	}, []);

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
						<Column width={200} fixed resizable>
							<HeaderCell>DATE & TIME</HeaderCell>
							<Cell>
								{(rowData) => (rowData ? rowData.time : renderNoDataMessage())}
							</Cell>
						</Column>
						<Column width={200} fixed resizable>
							<HeaderCell>Customer Name</HeaderCell>
							<Cell>
								{(rowData) =>
									rowData ? rowData.customerName : renderNoDataMessage()
								}
							</Cell>
						</Column>
						<Column width={300} fixed resizable>
							<HeaderCell>Address</HeaderCell>
							<Cell>
								{(rowData) =>
									rowData ? rowData.address : renderNoDataMessage()
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
							<HeaderCell>Email</HeaderCell>
							<Cell>
								{(rowData) => (rowData ? rowData.email : renderNoDataMessage())}
							</Cell>
						</Column>
						<Column width={200} resizable>
							<HeaderCell>Event Type</HeaderCell>
							<Cell>
								{(rowData) =>
									rowData ? rowData.eventType : renderNoDataMessage()
								}
							</Cell>
						</Column>
						<Column width={150} resizable>
							<HeaderCell>Budget</HeaderCell>
							<Cell>
								{(rowData) =>
									rowData ? rowData.budget : renderNoDataMessage()
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
