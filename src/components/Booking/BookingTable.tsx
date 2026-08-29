import React, {useState, useEffect} from "react";
import {useAppDispatch, useAppSelector} from "@/store/Hooks";
import {getAllBookings} from "@/store/booking/ThunkActions";
import {RootState} from "@/store";
import CustomTable from "../common/CustomTable";
import {iBooking} from "@/store/booking/Types";
import {formatDate} from "../../utils/dateUtils";
import {formatCurrency} from "../../utils/currencyUtils";
import StatusBadge from "../common/StatusBadge";
import {httpStatusCodes} from "@/customTypes/NetworkTypes";
import {bookingService} from "@/services/api/eventManagementServer";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import {Trash2} from "lucide-react";
import {toast} from "sonner";

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
	const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const dispatch = useAppDispatch();
	const {bookingList} = useAppSelector(
		(state: RootState) => state.bookingReducer,
	);
	const {employeeList} = useAppSelector(
		(state: RootState) => state.employeeReducer,
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
			/**
			 * The toolbar offers a status filter, so the status has to be
			 * visible - otherwise filtering just makes rows disappear with no
			 * explanation.
			 */
			key: "bookingStatus",
			label: "Status",
			width: 140,
			resizable: true,
			render: (rowData: iBooking) => {
				return rowData.bookingStatus ? (
					<StatusBadge status={rowData.bookingStatus} />
				) : (
					"-"
				);
			},
		},
		{
			key: "paymentStatus",
			label: "Payment",
			width: 140,
			resizable: true,
			render: (rowData: iBooking) => {
				return rowData.paymentStatus ? (
					<StatusBadge status={rowData.paymentStatus} />
				) : (
					"-"
				);
			},
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
			key: "assignedEmployees",
			label: "Assigned Employees",
			width: 200,
			resizable: true,
			render: (rowData: iBooking) => {
				if (!rowData.assignedEmployees?.length) return "-";
				return (
					<div className="flex flex-wrap gap-1">
						{rowData.assignedEmployees.map((employee) => {
							return (
								<span
									key={employee.id}
									className="px-2 py-1 bg-brand-100 text-indigo-800 rounded-full text-xs"
								>
									{employee.name}
								</span>
							);
						})}
					</div>
				);
			},
		},
	];

	const removeSelected = async () => {
		setIsDeleting(true);

		const response = await bookingService.deleteBooking(selectedKeys);

		setIsDeleting(false);
		setIsConfirmingDelete(false);

		if (
			response?.httpStatusCode === httpStatusCodes.SUCCESS_OK ||
			response?.httpStatusCode === httpStatusCodes.SUCCESS_NO_CONTENT
		) {
			toast.success(
				`${selectedKeys.length} booking${
					selectedKeys.length === 1 ? "" : "s"
				} deleted`,
			);
			setSelectedKeys([]);
			dispatch(getAllBookings());
			return;
		}

		toast.error("Couldn't delete those bookings");
	};

	return (
		<>
			{/* Appears only once rows are selected. The checkboxes existed with
			    nothing behind them until now. */}
			{selectedKeys.length > 0 && (
				<div className="mb-3 flex flex-col gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-3 sm:flex-row sm:items-center sm:justify-between">
					<p className="text-sm font-bold text-brand-700">
						{selectedKeys.length} selected
					</p>
					<div className="flex gap-2">
						<Button
							variant="secondary"
							className="flex-1 sm:flex-none"
							onClick={() => setSelectedKeys([])}
						>
							Clear
						</Button>
						<Button
							variant="danger"
							className="flex-1 sm:flex-none"
							onClick={() => setIsConfirmingDelete(true)}
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Delete
						</Button>
					</div>
				</div>
			)}

			<CustomTable
				data={filteredData}
				loading={loading}
				columns={columns}
				selectable
				selectedKeys={selectedKeys}
				onSelectChange={setSelectedKeys}
				onRowClick={(rowData) => onViewDetails(rowData as iBooking)}
			/>

			<Modal
				isOpen={isConfirmingDelete}
				onClose={() => setIsConfirmingDelete(false)}
				title={`Delete ${selectedKeys.length} booking${
					selectedKeys.length === 1 ? "" : "s"
				}?`}
				size="sm"
			>
				<div className="space-y-4">
					<p className="text-sm text-gray-600">
						This removes the bookings and their events, along with any payments
						recorded against them. It cannot be undone.
					</p>

					<div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
						<Button
							variant="secondary"
							className="w-full sm:w-auto"
							onClick={() => setIsConfirmingDelete(false)}
						>
							Keep them
						</Button>
						<Button
							variant="danger"
							className="w-full sm:w-auto"
							onClick={removeSelected}
							disabled={isDeleting}
						>
							{isDeleting ? "Deleting…" : "Delete"}
						</Button>
					</div>
				</div>
			</Modal>
		</>
	);
};

export default BookingTable;
