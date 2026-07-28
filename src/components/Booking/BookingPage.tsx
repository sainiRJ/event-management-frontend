import React, {useState, useEffect} from "react";
import {useAppDispatch, useAppSelector} from "../../store/Hooks";
import {fetchServices} from "@/store/services/ThunkActions";
import {fetchStatus} from "@/store/status/ThunkActions";
import {createBooking, updateBooking} from "@/store/booking/ThunkActions";
import {getAllEmployees} from "@/store/employee/ThunkActions";
import {RootState} from "@store/index";
import BookingTable from "./BookingTable";
import BookingForm from "./BookingForm";
import {bookingValidationSchema} from "../../validations/BookingValidationSchema";
import {iCreateBookingDTO} from "@/types/booking";
import {iBooking} from "@/store/booking/Types";
import DetailsModal from "../common/DetailsModal";
import Joi from "joi";
import {Plus, RefreshCw, Search, Filter} from "lucide-react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import {showToast} from "@/utils/showToatify";

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
	assignedEmployeeIds: [],
};

interface BookingFormErrors {
	[key: string]: string;
}

// Utility to clean payload
function cleanBookingPayload(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	payload: iCreateBookingDTO | Record<string, any>,
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
				let employeeIds: string[] = [];
				if (Array.isArray(value)) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					employeeIds = (value as any[])
						.map((emp) => (typeof emp === "object" ? emp.id : emp))
						.filter((id) => id !== null && id !== undefined && id !== "");
				}
				cleaned["assignedEmployeeIds"] = employeeIds;
			} else if (key in initialFormValue) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(cleaned as any)[key] = value;
			}
		}
	});
	return {
		...initialFormValue,
		...cleaned,
	} as iCreateBookingDTO;
}

const BookingPage = () => {
	const dispatch = useAppDispatch();
	const [showAddModal, setShowAddModal] = useState(false);
	const [newBooking, setNewBooking] =
		useState<iCreateBookingDTO>(initialFormValue);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedStatus, setSelectedStatus] = useState<string>("");
	const [selectedBooking, setSelectedBooking] = useState<iBooking | null>(null);
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [editingBooking, setEditingBooking] =
		useState<iCreateBookingDTO | null>(null);
	const [addFormErrors, setAddFormErrors] = useState<BookingFormErrors>({});
	const [editFormErrors, setEditFormErrors] = useState<BookingFormErrors>({});
	const [isRefreshing, setIsRefreshing] = useState(false);

	const {statusList} = useAppSelector(
		(state: RootState) => state.statusReducer,
	);
	const bookingStatuses = statusList
		.filter((status) => status.context === "booking")
		.map((status) => ({label: status.name, value: status.id}));

	const handleRefresh = async () => {
		setIsRefreshing(true);
		await Promise.all([
			dispatch(fetchServices()),
			dispatch(fetchStatus()),
			dispatch(getAllEmployees()),
		]);
		setIsRefreshing(false);
	};

	useEffect(() => {
		handleRefresh();
	}, [dispatch]);

	const handleSubmit = async () => {
		const excludeFields = ["id", "bookedAt", "bookingStatus", "paymentStatus"];
		const cleanedPayload = cleanBookingPayload(newBooking, excludeFields);
		const {error} = bookingValidationSchema.validate(cleanedPayload, {
			abortEarly: false,
		});

		if (error) {
			const errors: BookingFormErrors = {};
			error.details.forEach((detail: Joi.ValidationErrorItem) => {
				errors[detail.path[0] as string] = detail.message;
			});
			setAddFormErrors(errors);
			return;
		}

		setAddFormErrors({});
		try {
			const response: any = await dispatch(createBooking(cleanedPayload));
			showToast({
				response,
				successMessage: "Booking created successfully",
				errorMessage: "Failed to create booking. Please try again.",
			});
			if (response?.meta?.requestStatus === "fulfilled") {
				setNewBooking(initialFormValue);
				setShowAddModal(false);
				handleRefresh();
			}
		} catch (error) {
			console.error("Failed to create booking:", error);
			showToast({
				response: {meta: {requestStatus: "rejected"}, payload: {}},
				errorMessage: "Something went wrong while creating the booking.",
			});
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
			budget: selected.totalCost || "",
			advancePayment: selected.advancePayment || "",
			notes: selected.notes || "",
			paymentStatusId: selected.paymentStatusId || "",
			bookingStatusId: selected.bookingStatusId || "",
			bookedAt: selected.bookedAt || "",
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
			const errors: BookingFormErrors = {};
			error.details.forEach((detail: Joi.ValidationErrorItem) => {
				errors[detail.path[0] as string] = detail.message;
			});
			setEditFormErrors(errors);
			return;
		}

		setEditFormErrors({});
		try {
			const response: any = await dispatch(updateBooking(cleanedPayload));
			showToast({
				response,
				successMessage: "Booking updated successfully",
				errorMessage: "Failed to update booking. Please try again.",
			});
			if (response?.meta?.requestStatus === "fulfilled") {
				setShowEditModal(false);
				setEditingBooking(null);
				handleRefresh();
			}
		} catch (error) {
			console.error("Failed to update booking:", error);
			showToast({
				response: {meta: {requestStatus: "rejected"}, payload: {}},
				errorMessage: "Something went wrong while updating the booking.",
			});
		}
	};

	const bookingDetailsFields: {
		name: keyof iBooking;
		label: string;
		type: "text" | "date" | "select" | "textarea";
		options?: {label: string; value: string}[];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		render?: (value: any) => React.ReactNode;
	}[] = [
		{name: "customerName", label: "Customer Name", type: "text"},
		{name: "phoneNumber", label: "Phone Number", type: "text"},
		{name: "eventName", label: "Event Name", type: "text"},
		{name: "eventDate", label: "Event Date", type: "date"},
		{name: "venueAddress", label: "Venue", type: "text"},
		{name: "budget", label: "Budget", type: "text"},
		{name: "advancePayment", label: "Advance Payment", type: "text"},
		{
			name: "bookingStatus",
			label: "Booking Status",
			type: "select",
			options: bookingStatuses,
		},
		{
			name: "assignedEmployees",
			label: "Assigned Employees",
			type: "text",
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			render: (value: any) => {
				if (!value?.length) return "-";
				return (value as {name: string}[]).map((emp) => emp.name).join(", ");
			},
		},
		{name: "notes", label: "Notes", type: "textarea"},
	];

	return (
		<div className="space-y-8 animate-in fade-in duration-500">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
				<div>
					<h1 className="text-3xl font-display font-semibold text-[#2B2129] tracking-tight">
						Bookings
					</h1>
					<p className="text-gray-500 mt-1">
						Manage and track all your event bookings in one place
					</p>
				</div>

				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						icon={
							<RefreshCw
								className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
							/>
						}
						onClick={handleRefresh}
						disabled={isRefreshing}
					>
						Refresh
					</Button>
					<Button
						icon={<Plus className="w-4 h-4" />}
						onClick={() => setShowAddModal(true)}
					>
						Add Booking
					</Button>
				</div>
			</div>

			<div className="bg-white rounded-3xl shadow-sm border border-brand-100/70 p-8">
				{/* Filters Section */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
						<input
							type="text"
							placeholder="Search by customer name..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-400 transition-all"
						/>
					</div>

					<div className="relative">
						<Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
						<select
							value={selectedStatus}
							onChange={(e) => setSelectedStatus(e.target.value)}
							className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-400 appearance-none transition-all cursor-pointer"
						>
							<option value="">All Statuses</option>
							{bookingStatuses.map((status) => (
								<option key={status.value} value={status.value}>
									{status.label}
								</option>
							))}
						</select>
					</div>
				</div>

				<div className="rounded-2xl overflow-hidden border border-brand-100/50">
					<BookingTable
						onViewDetails={handleViewDetails}
						searchQuery={searchQuery}
						selectedStatus={selectedStatus || null}
					/>
				</div>
			</div>

			{/* Add Booking Modal */}
			<Modal
				isOpen={showAddModal}
				onClose={() => setShowAddModal(false)}
				title="Add New Booking"
				size="lg"
				footer={
					<>
						<Button variant="ghost" onClick={() => setShowAddModal(false)}>
							Cancel
						</Button>
						<Button onClick={handleSubmit}>Create Booking</Button>
					</>
				}
			>
				<BookingForm
					formValue={newBooking}
					setFormValue={setNewBooking}
					onSubmit={handleSubmit}
					errors={addFormErrors}
				/>
			</Modal>

			{/* Edit Booking Modal */}
			<Modal
				isOpen={showEditModal}
				onClose={() => {
					setShowEditModal(false);
					setEditingBooking(null);
				}}
				title="Edit Booking"
				size="lg"
				footer={
					<>
						<Button variant="ghost" onClick={() => setShowEditModal(false)}>
							Cancel
						</Button>
						<Button onClick={handleEditSubmit}>Save Changes</Button>
					</>
				}
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
