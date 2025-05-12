import React, {useState, useEffect} from "react";
import {useAppDispatch, useAppSelector} from "@/store/Hooks";
import {getAllBookings} from "@/store/booking/ThunkActions";
import {RootState} from "@/store";
import CustomTable from "../common/CustomTable";
import {iBooking} from "@/store/booking/Types";
import {formatDate} from "../../utils/dateUtils";
import {formatCurrency} from "../../utils/currencyUtils";
import StatusBadge from "../common/StatusBadge";

interface BookingTableProps {
	onViewDetails: (booking: iBooking) => void;
	searchQuery?: string;
	selectedStatus?: string | null;
}

const BookingTable: React.FC<BookingTableProps> = ({
	onViewDetails,
	searchQuery = "",
	selectedStatus = null,
}) => {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<iBooking[]>([]);
	const [filteredData, setFilteredData] = useState<iBooking[]>([]);
	const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

	const dispatch = useAppDispatch();
	const {bookingList} = useAppSelector(
		(state: RootState) => state.bookingReducer,
	);

	useEffect(() => {
		dispatch(getAllBookings());
	}, [dispatch]);

	useEffect(() => {
		if (bookingList) {
			setData(bookingList);
			setLoading(false);
		}
	}, [bookingList]);
	console.log(bookingList);

	useEffect(() => {
		let filtered = [...data];

		if (searchQuery) {
			filtered = filtered.filter((booking) =>
				booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()),
			);
		}

		if (selectedStatus) {
			filtered = filtered.filter(
				(booking) => booking.bookingStatusId === selectedStatus,
			);
		}

		setFilteredData(filtered);
	}, [data, searchQuery, selectedStatus]);

	const columns = [
		{
			key: "customerName",
			label: "Customer Name",
			width: 200,
			resizable: true,
		},
		{
			key: "eventName",
			label: "Event Name",
			width: 200,
			resizable: true,
		},
		{
			key: "eventDate",
			label: "Event Date",
			width: 150,
			resizable: true,
			render: (rowData: iBooking) => formatDate(rowData.eventDate || ""),
		},
		{
			key: "venueAddress",
			label: "Venue",
			width: 200,
			resizable: true,
		},
		{
			key: "budget",
			label: "Budget",
			width: 150,
			resizable: true,
			render: (rowData: iBooking) => {
				const budgetNum = Number(rowData.totalCost);
				return isNaN(budgetNum) || rowData.totalCost === ""
					? "-"
					: formatCurrency(budgetNum);
			},
		},
		{
			key: "bookingStatus",
			label: "Status",
			width: 120,
			resizable: true,
			render: (rowData: iBooking) => (
				<StatusBadge status={rowData.bookingStatus || ""} />
			),
		},
	];

	return (
		<CustomTable
			data={filteredData}
			loading={loading}
			columns={columns}
			selectable
			selectedKeys={selectedKeys}
			onSelectChange={setSelectedKeys}
			onRowClick={(rowData) => onViewDetails(rowData as iBooking)}
		/>
	);
};

export default BookingTable;
