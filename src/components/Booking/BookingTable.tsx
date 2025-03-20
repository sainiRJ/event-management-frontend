import React, {useState, useEffect} from "react";
import {useAppDispatch, useAppSelector} from "../../store/Hooks";
import {
	DateRangePicker,
	SelectPicker,
	Stack,
	RangeSlider,
	Button,
	IconButton,
	ButtonGroup,
	Tooltip,
	Whisper,
	Modal,
	toaster,
	Message,
	Input,
	InputNumber,
	DatePicker,
} from "rsuite";
import {
	getAllBookings,
	deleteBooking,
	updateBooking,
} from "@/store/booking/ThunkActions";
import {RootState} from "@/store";
import "./BookingTable.css";
import RefreshIcon from "@rsuite/icons/Reload";
import FilterIcon from "@rsuite/icons/Funnel";
import EditIcon from "@rsuite/icons/Edit";
import TrashIcon from "@rsuite/icons/Trash";
import CustomTable from "../common/CustomTable";
import BookingForm from "./BookingForm";
import {iCreateBookingDTO} from "../../customTypes/appDataTypes/bookingTypes";

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

const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: "USD",
	}).format(amount);
};

const StatusBadge = ({status}: {status: string}) => {
	const getStatusClass = () => {
		switch (status.toLowerCase()) {
			case "confirmed":
				return "status-confirmed";
			case "pending":
				return "status-pending";
			case "cancelled":
				return "status-cancelled";
			default:
				return "";
		}
	};

	return <span className={`status-badge ${getStatusClass()}`}>{status}</span>;
};

const EditableCell = ({rowData, dataKey, onChange, ...props}: any) => {
	const editing = rowData.status === "EDIT";
	const value = rowData[dataKey];

	const handleChange = (value: any) => {
		onChange && onChange(rowData.id, dataKey, value);
	};

	if (editing) {
		switch (dataKey) {
			case "eventDate":
				return (
					<DatePicker
						value={value ? new Date(value) : null}
						onChange={handleChange}
						format="yyyy-MM-dd HH:mm"
						style={{width: "100%"}}
					/>
				);
			case "totalCost":
			case "advancePayment":
				return (
					<InputNumber
						value={value}
						onChange={handleChange}
						style={{width: "100%"}}
					/>
				);
			case "bookingStatus":
			case "paymentStatus":
				return (
					<SelectPicker
						value={value}
						onChange={handleChange}
						data={[
							{label: "Confirmed", value: "confirmed"},
							{label: "Pending", value: "pending"},
							{label: "Cancelled", value: "cancelled"},
						]}
						style={{width: "100%"}}
					/>
				);
			default:
				return <Input value={value} onChange={handleChange} />;
		}
	}

	return <span>{value}</span>;
};

const BookingTable = () => {
	const [loading, setLoading] = useState(true);
	const [data, setData] = useState<any[]>([]);
	const [filteredData, setFilteredData] = useState<any[]>([]);
	const [dateRange, setDateRange] = useState<[Date, Date] | null>(null);
	const [selectedEventType, setSelectedEventType] = useState<string | null>(
		null,
	);
	const [budgetRange, setBudgetRange] = useState<[number, number]>([0, 100000]);
	const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
	const [showFilters, setShowFilters] = useState(true);
	const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editingBooking, setEditingBooking] =
		useState<iCreateBookingDTO | null>(null);
	const [editingKey, setEditingKey] = useState<string | null>(null);

	const {bookingList} = useAppSelector(
		(state: RootState) => state.bookingReducer,
	);
	const dispatch = useAppDispatch();

	const handleRefresh = () => {
		setLoading(true);
		dispatch(getAllBookings());
	};

	const resetFilters = () => {
		setDateRange(null);
		setSelectedEventType(null);
		setBudgetRange([0, 100000]);
		setSelectedStatus(null);
	};

	const handleEdit = (id: string) => {
		setEditingKey(id);
		setData(
			data.map((item) => (item.id === id ? {...item, status: "EDIT"} : item)),
		);
	};

	const handleDelete = async (rowData: any) => {
		try {
			await dispatch(deleteBooking(rowData.id));
			toaster.push(
				<Message type="success">Booking deleted successfully</Message>,
			);
			handleRefresh();
		} catch (error) {
			toaster.push(<Message type="error">Failed to delete booking</Message>);
		}
	};

	const handleBulkDelete = async () => {
		if (selectedKeys.length === 0) {
			toaster.push(
				<Message type="warning">Please select bookings to delete</Message>,
			);
			return;
		}

		try {
			await dispatch(deleteBooking(selectedKeys));
			toaster.push(
				<Message type="success">
					Selected bookings deleted successfully
				</Message>,
			);
			setSelectedKeys([]);
			handleRefresh();
		} catch (error) {
			toaster.push(<Message type="error">Failed to delete bookings</Message>);
		}
	};

	const handleEditSubmit = async (formValue: iCreateBookingDTO) => {
		try {
			await dispatch(updateBooking(formValue));
			toaster.push(
				<Message type="success">Booking updated successfully</Message>,
			);
			setShowEditModal(false);
			handleRefresh();
		} catch (error) {
			toaster.push(<Message type="error">Failed to update booking</Message>);
		}
	};

	const handleSave = async (id: string) => {
		const editedRow = data.find((item) => item.id === id);
		if (editedRow) {
			try {
				await dispatch(updateBooking(editedRow));
				toaster.push(
					<Message type="success">Booking updated successfully</Message>,
				);
				setEditingKey(null);
				setData(
					data.map((item) =>
						item.id === id ? {...item, status: "VIEW"} : item,
					),
				);
				handleRefresh();
			} catch (error) {
				toaster.push(<Message type="error">Failed to update booking</Message>);
			}
		}
	};

	const handleCancel = (id: string) => {
		setEditingKey(null);
		setData(
			data.map((item) => (item.id === id ? {...item, status: "VIEW"} : item)),
		);
	};

	const handleChange = (id: string, dataKey: string, value: any) => {
		setData(
			data.map((item) => (item.id === id ? {...item, [dataKey]: value} : item)),
		);
	};

	useEffect(() => {
		dispatch(getAllBookings());
	}, [dispatch]);

	useEffect(() => {
		const fetchedData = bookingList;
		setTimeout(() => {
			if (fetchedData && Array.isArray(fetchedData) && fetchedData.length > 0) {
				setData(fetchedData);
				setFilteredData(fetchedData);
				setLoading(false);
			} else {
				setData([]);
				setFilteredData([]);
				setLoading(false);
			}
		}, 1000);
	}, [bookingList]);

	const eventTypes = Array.from(
		new Set(data.map((item) => item.serviceName)),
	).map((type) => ({
		label: type,
		value: type,
	}));

	const bookingStatuses = Array.from(
		new Set(data.map((item) => item.bookingStatus)),
	).map((status) => ({
		label: status,
		value: status,
	}));

	const budgets = data.map((item) => Number(item.totalCost));
	const maxBudget = Math.max(...budgets, 100000);
	const minBudget = Math.min(...budgets, 0);

	useEffect(() => {
		let filtered = [...data];

		if (dateRange && dateRange[0] && dateRange[1]) {
			filtered = filtered.filter((item) => {
				const eventDate = new Date(item.eventDate);
				return eventDate >= dateRange[0] && eventDate <= dateRange[1];
			});
		}

		if (selectedEventType) {
			filtered = filtered.filter(
				(item) => item.serviceName === selectedEventType,
			);
		}

		filtered = filtered.filter((item) => {
			const budget = Number(item.totalCost);
			return budget >= budgetRange[0] && budget <= budgetRange[1];
		});

		if (selectedStatus) {
			filtered = filtered.filter(
				(item) => item.bookingStatus === selectedStatus,
			);
		}

		setFilteredData(filtered);
	}, [data, dateRange, selectedEventType, budgetRange, selectedStatus]);

	const columns = [
		{
			key: "eventDate",
			label: "DATE & TIME",
			width: 200,
			resizable: true,
			render: (rowData: any) => (
				<EditableCell
					rowData={rowData}
					dataKey="eventDate"
					onChange={handleChange}
				/>
			),
		},
		{
			key: "eventName",
			label: "Event Name",
			width: 200,
			resizable: true,
			render: (rowData: any) => (
				<EditableCell
					rowData={rowData}
					dataKey="eventName"
					onChange={handleChange}
				/>
			),
		},
		{
			key: "customerName",
			label: "Customer Name",
			width: 200,
			resizable: true,
			render: (rowData: any) => (
				<EditableCell
					rowData={rowData}
					dataKey="customerName"
					onChange={handleChange}
				/>
			),
		},
		{
			key: "venueAddress",
			label: "Address",
			width: 300,
			flexGrow: 1,
			resizable: true,
			render: (rowData: any) => (
				<Whisper
					placement="top"
					trigger="hover"
					speaker={<Tooltip>{rowData.venueAddress}</Tooltip>}
				>
					<EditableCell
						rowData={rowData}
						dataKey="venueAddress"
						onChange={handleChange}
					/>
				</Whisper>
			),
		},
		{
			key: "phoneNumber",
			label: "Phone Number",
			width: 150,
			resizable: true,
			render: (rowData: any) => (
				<EditableCell
					rowData={rowData}
					dataKey="phoneNumber"
					onChange={handleChange}
				/>
			),
		},
		{
			key: "serviceName",
			label: "Event Type",
			width: 200,
			resizable: true,
			render: (rowData: any) => (
				<EditableCell
					rowData={rowData}
					dataKey="serviceName"
					onChange={handleChange}
				/>
			),
		},
		{
			key: "totalCost",
			label: "Budget",
			width: 150,
			resizable: true,
			render: (rowData: any) => (
				<EditableCell
					rowData={rowData}
					dataKey="totalCost"
					onChange={handleChange}
				/>
			),
		},
		{
			key: "advancePayment",
			label: "Advance Payment",
			width: 150,
			resizable: true,
			render: (rowData: any) => (
				<EditableCell
					rowData={rowData}
					dataKey="advancePayment"
					onChange={handleChange}
				/>
			),
		},
		{
			key: "bookingStatus",
			label: "Booking Status",
			width: 150,
			resizable: true,
			render: (rowData: any) => (
				<EditableCell
					rowData={rowData}
					dataKey="bookingStatus"
					onChange={handleChange}
				/>
			),
		},
		{
			key: "paymentStatus",
			label: "Payment Status",
			width: 150,
			resizable: true,
			render: (rowData: any) => (
				<EditableCell
					rowData={rowData}
					dataKey="paymentStatus"
					onChange={handleChange}
				/>
			),
		},
		{
			key: "bookedAt",
			label: "Booked At",
			width: 200,
			resizable: true,
			render: (rowData: any) =>
				rowData.bookedAt ? formatDate(rowData.bookedAt) : "No Date",
		},
		{
			key: "actions",
			label: "Actions",
			width: 120,
			render: (rowData: any) => {
				if (rowData.status === "EDIT") {
					return (
						<Stack spacing={10}>
							<Button
								size="sm"
								onClick={() => handleSave(rowData.id)}
								appearance="primary"
							>
								Save
							</Button>
							<Button
								size="sm"
								onClick={() => handleCancel(rowData.id)}
								appearance="subtle"
							>
								Cancel
							</Button>
						</Stack>
					);
				}
				return (
					<Button
						size="sm"
						onClick={() => handleEdit(rowData.id)}
						appearance="subtle"
					>
						Edit
					</Button>
				);
			},
		},
	];

	return (
		<div className="booking-page">
			<div className="page-header">
				<h1>Bookings</h1>
				<p className="page-description">
					Manage and track all your event bookings in one place
				</p>
			</div>

			<div
				className="filters-section"
				style={{display: showFilters ? "block" : "none"}}
			>
				<Stack
					spacing={20}
					wrap
					alignItems="flex-end"
					justifyContent="space-between"
					style={{width: "100%"}}
				>
					<Stack spacing={20} wrap alignItems="flex-end" style={{flex: 1}}>
						<div style={{minWidth: 260}}>
							<label>Date Range</label>
							<DateRangePicker
								value={dateRange}
								onChange={setDateRange}
								placeholder="Select Date Range"
								format="yyyy-MM-dd HH:mm"
								style={{width: "100%"}}
							/>
						</div>
						<div style={{minWidth: 200}}>
							<label>Event Type</label>
							<SelectPicker
								data={eventTypes}
								value={selectedEventType}
								onChange={setSelectedEventType}
								placeholder="Select Event Type"
								style={{width: "100%"}}
								cleanable
							/>
						</div>
						<div style={{minWidth: 300}}>
							<label>
								Budget Range: {formatCurrency(budgetRange[0])} -{" "}
								{formatCurrency(budgetRange[1])}
							</label>
							<RangeSlider
								value={budgetRange}
								onChange={setBudgetRange}
								min={minBudget}
								max={maxBudget}
								step={1000}
								style={{width: "100%"}}
							/>
						</div>
						<div style={{minWidth: 200}}>
							<label>Booking Status</label>
							<SelectPicker
								data={bookingStatuses}
								value={selectedStatus}
								onChange={setSelectedStatus}
								placeholder="Select Status"
								style={{width: "100%"}}
								cleanable
							/>
						</div>
					</Stack>
					<Stack spacing={10} alignItems="flex-end">
						<Button appearance="default" onClick={resetFilters}>
							Reset Filters
						</Button>
						<Button appearance="primary" onClick={handleRefresh}>
							<RefreshIcon /> Refresh
						</Button>
					</Stack>
				</Stack>
			</div>

			<div className="booking-table-wrapper">
				<div className="table-actions">
					<Stack
						spacing={10}
						justifyContent="space-between"
						alignItems="center"
					>
						<div>
							<h4 style={{margin: 0}}>
								{filteredData.length}{" "}
								{filteredData.length === 1 ? "Booking" : "Bookings"} Found
							</h4>
						</div>
						<Stack spacing={10}>
							{selectedKeys.length > 0 && (
								<Button
									appearance="subtle"
									color="red"
									onClick={handleBulkDelete}
								>
									Delete Selected ({selectedKeys.length})
								</Button>
							)}
							<ButtonGroup>
								<IconButton
									icon={<FilterIcon />}
									onClick={() => setShowFilters(!showFilters)}
									appearance={showFilters ? "primary" : "default"}
								>
									Filters
								</IconButton>
								<IconButton icon={<RefreshIcon />} onClick={handleRefresh}>
									Refresh
								</IconButton>
							</ButtonGroup>
						</Stack>
					</Stack>
				</div>

				<CustomTable
					data={filteredData}
					loading={loading}
					columns={columns}
					height={400}
					selectable
					selectedKeys={selectedKeys}
					onSelectChange={setSelectedKeys}
				/>
			</div>

			<Modal
				size="lg"
				open={showEditModal}
				onClose={() => setShowEditModal(false)}
			>
				<Modal.Header>
					<Modal.Title>Edit Booking</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{editingBooking && (
						<BookingForm
							formValue={editingBooking}
							setFormValue={setEditingBooking}
							serviceList={eventTypes}
							decorationThemes={[]} // Add your decoration themes here
							bookingStatuses={bookingStatuses}
							paymentStatuses={[]} // Add your payment statuses here
						/>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={() => setShowEditModal(false)} appearance="subtle">
						Cancel
					</Button>
					<Button
						onClick={() => handleEditSubmit(editingBooking!)}
						appearance="primary"
					>
						Save Changes
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
};

export default BookingTable;
