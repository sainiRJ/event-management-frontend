import React, {useState, useEffect} from "react";
import {Table, Toggle, HStack, Placeholder, Loader, VStack} from "rsuite";
import {mockUsers, User} from "./mock"; // Import the mock function and User interface
import AddNewBooking from "./AddNewBooking/AddNewBooking";

const {Column, HeaderCell, Cell} = Table;

const columns = [
	{
		key: "company",
		label: "Company",
		fixed: true,
		width: 130,
	},
	{
		key: "city",
		label: "City",
		width: 150,
	},
	{
		key: "street",
		label: "Street",
		width: 180,
	},
	{
		key: "postcode",
		label: "Postcode",
		width: 150,
	},
];

const BookingTable = () => {
	const [autoHeight, setAutoHeight] = useState(true);
	const [size, setSize] = useState(10); // Default to 10 rows
	const [height, setHeight] = useState(400);
	const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined);
	const [minHeight, setMinHeight] = useState(200);
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<User[]>([]);

	useEffect(() => {
		const fetchedData = mockUsers(size); // Fetch mock data
		if (fetchedData && Array.isArray(fetchedData) && fetchedData.length > 0) {
			setData(fetchedData);
			setLoading(false);
		} else {
			setData([]); // Ensure data is always an array
			setLoading(true); // Show loader if no data
		}
	}, [size]);

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

	return (
		<>
			<AddNewBooking />
			<div>
				<VStack spacing={16}>
					<Toggle checked={autoHeight} onChange={setAutoHeight}>
						Auto Height
					</Toggle>

					<VStack>
						<HStack spacing={16}>
							<HStack>
								<div style={{width: 76}}>Rows:</div>
								<input
									type="number"
									value={size}
									onChange={(e) => setSize(parseInt(e.target.value))}
									style={{width: 130}}
								/>
							</HStack>

							<HStack>
								<div style={{width: 76}}>Min Height:</div>
								<input
									type="number"
									value={minHeight}
									onChange={(e) => setMinHeight(parseInt(e.target.value))}
									style={{width: 130}}
								/>
								<span>px</span>
							</HStack>
						</HStack>

						<HStack spacing={16}>
							<HStack>
								<div style={{width: 76}}>Height:</div>
								<input
									type="number"
									value={height}
									onChange={(e) => setHeight(parseInt(e.target.value))}
									style={{width: 130}}
								/>
								<span>px</span>
							</HStack>

							<HStack>
								<div style={{width: 76}}>Max Height:</div>
								<input
									type="number"
									value={maxHeight || ""}
									onChange={(e) => setMaxHeight(parseInt(e.target.value))}
									style={{width: 130}}
								/>
								<span>px</span>
							</HStack>
						</HStack>
					</VStack>
				</VStack>

				<hr />

				<Table
					cellBordered
					autoHeight={autoHeight}
					height={parseInt(height.toString())}
					minHeight={parseInt(minHeight.toString())}
					maxHeight={maxHeight}
					data={data}
				>
					{columns.map((column) => {
						const {key, label, ...rest} = column;
						return (
							<Column fixed resizable {...rest} key={key} width={300}>
								<HeaderCell>{label}</HeaderCell>
								<Cell dataKey={key} />
							</Column>
						);
					})}
				</Table>
			</div>
		</>
	);
};

export default BookingTable;
