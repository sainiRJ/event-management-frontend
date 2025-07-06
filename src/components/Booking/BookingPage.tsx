import React, {useState, useEffect} from "react";
import {useAppDispatch, useAppSelector} from "../../store/Hooks";
import {fetchServices} from "@/store/services/ThunkActions";
import {fetchStatus} from "@/store/status/ThunkActions";
import {createBooking, updateBooking} from "@/store/booking/ThunkActions";
import {getAllEmployees} from "@/store/employee/ThunkActions";
import {RootState} from "@store/index";
import BookingTable from "./BookingTable";
import {
	Modal,
	Stack,
	Button,
	IconButton,
	Input,
	SelectPicker,
	ButtonGroup,
} from "rsuite";
import BookingForm from "./BookingForm";
import {bookingValidationSchema} from "../../validations/BookingValidationSchema";
import {iCreateBookingDTO} from "@/types/booking";
import {iBooking} from "@/store/booking/Types";
import RefreshIcon from "@rsuite/icons/Reload";
import DetailsModal from "../common/DetailsModal";
import Joi from "joi";

const initialFormValue: iCreateBookingDTO = {
	id: "",
	customerName: "",
	phoneNumber: "",
	serviceId: null,
	eventDate: null,
	venueAddress: "",
	budget: "",
	advancePayment: "",
	eventName: "",
	notes: "",
	paymentStatusId: "",
	bookingStatusId: "",
	bookedAt: "",
	serviceName: "",
	paymentStatus: "",
	bookingStatus: "",
	assignedEmployeeIds: [],
};

// Utility to clean payload
function cleanBookingPayload(
	payload: Record<string, any>,
	excludeFields: string[] = [],
): iCreateBookingDTO {
	const cleaned: Partial<iCreateBookingDTO> = {};
	Object.entries(payload).forEach(([key, value]) => {
		if (
			value !== "" &&
			value !== null &&
			value !== undefined &&
			!excludeFields.includes(key)
		) {
			if (key === "assignedEmployees" || key === "assignedEmployeeIds") {
				// Ensure we have a valid array and filter out any undefined/null values
				const employeeIds = Array.isArray(value) 
					? value
						.map((emp) => emp?.id || emp)
						.filter((id) => id !== null && id !== undefined && id !== "")
					: [];
				cleaned["assignedEmployeeIds"] = employeeIds;
			} else if (key in initialFormValue) {
				(cleaned as any)[key] = value;
			}
		}
	});
	const finalPayload: iCreateBookingDTO = {
		...initialFormValue,
		...cleaned,
		id: cleaned.id as string,
		assignedEmployeeIds: cleaned.assignedEmployeeIds || [],
		serviceId:
			cleaned.serviceId === undefined
				? initialFormValue.serviceId
				: cleaned.serviceId,
		eventDate:
			cleaned.eventDate === undefined
				? initialFormValue.eventDate
				: cleaned.eventDate,
	};
	return finalPayload as iCreateBookingDTO;
}

const BookingPage = () => {
	const dispatch = useAppDispatch();
	const [showAddModal, setShowAddModal] = useState(false);
	const [newBooking, setNewBooking] =
		useState<iCreateBookingDTO>(initialFormValue);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
	const [selectedBooking, setSelectedBooking] = useState<iBooking | null>(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editingBooking, setEditingBooking] =
		useState<iCreateBookingDTO | null>(null);
	const [addFormErrors, setAddFormErrors] = useState<any>({});
	const [editFormErrors, setEditFormErrors] = useState<any>({});

	const {statusList} = useAppSelector(
		(state: RootState) => state.statusReducer,
	);
	const {serviceList} = useAppSelector(
		(state: RootState) => state.serviceReducer,
	);
	const {employeeList} = useAppSelector(
		(state: RootState) => state.employeeReducer,
	);

	const bookingStatuses = statusList
		.filter((status) => status.context === "booking")
		.map((status) => ({label: status.name, value: status.id}));

	// Filter active employees
	const activeEmployees = employeeList.filter((emp: any) => {
		return emp.status === "Working";
	});
	console.log("employeeList", employeeList);
	console.log("activeEmployees", activeEmployees);

	const handleSubmit = async () => {
		const excludeFields = [
			"id",
			"bookedAt",
			"bookingStatus",
			"paymentStatus",
			"serviceName",
		];
		const cleanedPayload = cleanBookingPayload(newBooking, excludeFields);
		const {error} = bookingValidationSchema.validate(cleanedPayload, {
			abortEarly: false,
		});
		if (error) {
			const errors: any = {};
			error.details.forEach((detail: Joi.ValidationErrorItem) => {
				errors[detail.path[0]] = detail.message;
			});
			setAddFormErrors(errors);
			return;
		}
		setAddFormErrors({});
		try {
			await dispatch(createBooking(cleanedPayload as iCreateBookingDTO));
			setNewBooking(initialFormValue);
			setShowAddModal(false);
			dispatch(fetchServices());
			dispatch(fetchStatus());
			dispatch(getAllEmployees());
		} catch (error) {
			console.error("Failed to create booking:", error);
		}
	};

	const handleViewDetails = (booking: iBooking) => {
		setSelectedBooking({
			...booking,
			eventDate: booking.eventDate
				? new Date(booking.eventDate).toISOString().split("T")[0]
				: "",
		});
		setShowDetailsModal(true);
	};

	const handleEditBooking = (selected: iBooking) => {
		setShowDetailsModal(false);
		setEditingBooking({
			id: selected.id || "",
			customerName: selected.customerName || "",
			phoneNumber: selected.phoneNumber || "",
			eventName: selected.eventName || "",
			eventDate: selected.eventDate || null,
			venueAddress: selected.venueAddress || "",
			serviceId: selected.serviceId || null,
			bookingStatus: selected.bookingStatusId || "",
			budget: selected.totalCost || "",
			advancePayment: selected.advancePayment || "",
			notes: selected.notes || "",
			paymentStatusId: selected.paymentStatusId || "",
			bookingStatusId: selected.bookingStatusId || "",
			bookedAt: selected.bookedAt || "",
			serviceName: selected.serviceName || "",
			paymentStatus: selected.paymentStatus || "",
			assignedEmployeeIds: (selected.assignedEmployees || []).map(
				(emp) => emp.id,
			),
		});
		setShowEditModal(true);
	};

	const handleEditSubmit = async () => {
		if (!editingBooking) return;
		const cleanedPayload = cleanBookingPayload(editingBooking);
		const {error} = bookingValidationSchema.validate(cleanedPayload, {
			abortEarly: false,
		});
		if (error) {
			const errors: any = {};
			error.details.forEach((detail: Joi.ValidationErrorItem) => {
				errors[detail.path[0]] = detail.message;
			});
			setEditFormErrors(errors);
			return;
		}
		setEditFormErrors({});
		try {
			await dispatch(updateBooking(cleanedPayload));
			setShowEditModal(false);
			setEditingBooking(null);
			dispatch(fetchServices());
			dispatch(fetchStatus());
			dispatch(getAllEmployees());
		} catch (error) {
			console.error("Failed to update booking:", error);
		}
	};

	const bookingDetailsFields = [
		{name: "customerName", label: "Customer Name", type: "text" as const},
		{name: "phoneNumber", label: "Phone Number", type: "text" as const},
		{name: "eventName", label: "Event Name", type: "text" as const},
		{name: "eventDate", label: "Event Date", type: "date" as const},
		{name: "venueAddress", label: "Venue", type: "text" as const},
		{name: "budget", label: "Budget", type: "text" as const},
		{name: "advancePayment", label: "Advance Payment", type: "text" as const},
		{
			name: "bookingStatus",
			label: "Booking Status",
			type: "select" as const,
			options: bookingStatuses,
		},
		{
			name: "assignedEmployees",
			label: "Assigned Employees",
			type: "text" as const,
			render: (value: any) => {
				if (!value?.length) return "-";
				return value.map((emp: any) => emp.name).join(", ");
			},
		},
		{name: "notes", label: "Notes", type: "textarea" as const},
	];

	// Prevent page scroll when modal is open
	useEffect(() => {
		if (showAddModal || showDetailsModal || showEditModal) {
			document.body.classList.add("overflow-hidden");
		} else {
			document.body.classList.remove("overflow-hidden");
		}
		return () => {
			document.body.classList.remove("overflow-hidden");
		};
	}, [showAddModal, showDetailsModal, showEditModal]);

	useEffect(() => {
		dispatch(fetchServices());
		dispatch(fetchStatus());
		dispatch(getAllEmployees());
	}, [dispatch]);

	return (
		<div className="min-h-screen bg-gray-50 py-8 px-4 mt-10">
			<div className="max-w-7xl mx-auto">
				<div className="bg-white rounded-lg shadow p-8 mb-8">
					<h1 className="text-3xl font-bold mb-2">Bookings</h1>
					<p className="text-gray-500 mb-6">
						Manage and track all your event bookings in one place
					</p>
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
						<div className="flex gap-2 w-full md:w-auto">
							<Input
								placeholder="Search by customer name..."
								value={searchQuery}
								onChange={setSearchQuery}
								size="sm"
								className="w-full md:w-64"
							/>
							<SelectPicker
								data={bookingStatuses}
								placeholder="Filter by status"
								value={selectedStatus}
								onChange={setSelectedStatus}
								size="sm"
								cleanable
								className="w-full md:w-48"
							/>
						</div>
						<div className="flex gap-2 justify-end">
							<Button
								appearance="primary"
								onClick={() => setShowAddModal(true)}
							>
								Add Booking
							</Button>
							<IconButton
								icon={<RefreshIcon />}
								onClick={() => {
									dispatch(fetchServices());
									dispatch(fetchStatus());
									dispatch(getAllEmployees());
								}}
							>
								Refresh
							</IconButton>
						</div>
					</div>
					<div className="overflow-x-auto rounded-lg">
						<BookingTable
							onViewDetails={handleViewDetails}
							searchQuery={searchQuery}
							selectedStatus={selectedStatus}
						/>
					</div>
				</div>
			</div>
			{/* Add Booking Modal */}
			<Modal
				size="md"
				open={showAddModal}
				onClose={() => setShowAddModal(false)}
			>
				<Modal.Header>
					<Modal.Title>Add New Booking</Modal.Title>
				</Modal.Header>
				<Modal.Body
					style={{maxHeight: "70vh", overflowY: "auto", paddingBottom: 0}}
				>
					<BookingForm
						formValue={newBooking}
						setFormValue={setNewBooking}
						onSubmit={handleSubmit}
						isEdit={false}
						errors={addFormErrors}
					/>
				</Modal.Body>
				<Modal.Footer>
					<Button onClick={() => setShowAddModal(false)} appearance="subtle">
						Cancel
					</Button>
					<Button onClick={handleSubmit} appearance="primary">
						Add Booking
					</Button>
				</Modal.Footer>
			</Modal>
			{/* Edit Booking Modal */}
			<Modal
				size="md"
				open={showEditModal}
				onClose={() => {
					setShowEditModal(false);
					setEditingBooking(null);
				}}
			>
				<Modal.Header>
					<Modal.Title>Edit Booking</Modal.Title>
				</Modal.Header>
				<Modal.Body
					style={{maxHeight: "70vh", overflowY: "auto", paddingBottom: 0}}
				>
					{editingBooking && (
						<BookingForm
							formValue={editingBooking}
							setFormValue={setEditingBooking}
							onSubmit={handleEditSubmit}
							isEdit={true}
							errors={editFormErrors}
						/>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button
						onClick={() => {
							setShowEditModal(false);
							setEditingBooking(null);
						}}
						appearance="subtle"
					>
						Cancel
					</Button>
					<Button onClick={handleEditSubmit} appearance="primary">
						Save Changes
					</Button>
				</Modal.Footer>
			</Modal>
			<DetailsModal
				open={showDetailsModal}
				onClose={() => setShowDetailsModal(false)}
				data={selectedBooking}
				onSave={handleEditBooking}
				title="Booking Details"
				fields={bookingDetailsFields}
				externalEdit={true}
			/>
		</div>
	);
};

export default BookingPage;
