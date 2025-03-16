import React, {useState, useEffect} from "react";
import {useAppDispatch, useAppSelector} from "../../store/Hooks";
import {
	Table,
	Placeholder,
	DateRangePicker,
	SelectPicker,
	InputNumber,
	Stack,
	RangeSlider,
	Button,
	IconButton,
	ButtonGroup,
	Tooltip,
	Whisper,
} from "rsuite";
import {mockUsers, User} from "./mock";
import {getAllBookings} from "@/store/booking/ThunkActions";
import {RootState} from "@/store";
import "./BookingTable.css";
import SearchIcon from "@rsuite/icons/Search";
// import FilterIcon from "@rsuite/icons/Filter";
// import RefreshIcon from "@rsuite/icons/Refresh";
import RefreshIcon from "@rsuite/icons/Reload";
import FilterIcon from "@rsuite/icons/Funnel";

const {Column, HeaderCell, Cell} = Table;

const BookingTableWrapper = ({children}: {children: React.ReactNode}) => {
	return <div className="booking-table-wrapper">{children}</div>;
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

	const renderLoading = () => (
		<div className="loading-placeholder">
			<Placeholder.Grid rows={8} columns={11} active />
		</div>
	);

	const renderNoDataMessage = () => (
		<div className="no-data-message">No Data Found</div>
	);

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

			<BookingTableWrapper>
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
				</div>

				{loading ? (
					renderLoading()
				) : (
					<Table
						cellBordered
						autoHeight={false}
						height={400}
						data={filteredData}
						hover={true}
						wordWrap="break-word"
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
						<Column width={300} resizable flexGrow={1}>
							<HeaderCell>Address</HeaderCell>
							<Cell>
								{(rowData) =>
									rowData ? (
										<Whisper
											placement="top"
											trigger="hover"
											speaker={<Tooltip>{rowData.venueAddress}</Tooltip>}
										>
											<span
												style={{
													display: "block",
													overflow: "hidden",
													textOverflow: "ellipsis",
													whiteSpace: "nowrap",
												}}
											>
												{rowData.venueAddress}
											</span>
										</Whisper>
									) : (
										renderNoDataMessage()
									)
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
									rowData
										? formatCurrency(rowData.totalCost)
										: renderNoDataMessage()
								}
							</Cell>
						</Column>
						<Column width={150} resizable>
							<HeaderCell>Advance Payment</HeaderCell>
							<Cell>
								{(rowData) =>
									rowData
										? formatCurrency(rowData.advancePayment)
										: renderNoDataMessage()
								}
							</Cell>
						</Column>
						<Column width={150} resizable>
							<HeaderCell>Booking Status</HeaderCell>
							<Cell>
								{(rowData) =>
									rowData ? (
										<StatusBadge status={rowData.bookingStatus} />
									) : (
										renderNoDataMessage()
									)
								}
							</Cell>
						</Column>
						<Column width={150} resizable>
							<HeaderCell>Payment Status</HeaderCell>
							<Cell>
								{(rowData) =>
									rowData ? (
										<StatusBadge status={rowData.paymentStatus} />
									) : (
										renderNoDataMessage()
									)
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
		</div>
	);
};

export default BookingTable;
