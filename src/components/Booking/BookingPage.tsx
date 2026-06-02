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
import Input from "../ui/Input";
import Select from "../ui/Select";
import Modal from "../ui/Modal";

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
	const [addFormErrors, setAddFormErrors] = useState<any>({});
	const [editFormErrors, setEditFormErrors] = useState<any>({});
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
			const errors: any = {};
			error.details.forEach((detail: Joi.ValidationErrorItem) => {
				errors[detail.path[0]] = detail.message;
			});
			setAddFormErrors(errors);
			return;
		}

		setAddFormErrors({});
		try {
			await dispatch(createBooking(cleanedPayload));
			setNewBooking(initialFormValue);
			setShowAddModal(false);
			handleRefresh();
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
			handleRefresh();
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

	return (
		<div className="space-y-8 animate-in fade-in duration-500">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900 tracking-tight">
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

			<div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
				{/* Filters Section */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
						<input
							type="text"
							placeholder="Search by customer name..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
						/>
					</div>

					<div className="relative">
						<Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
						<select
							value={selectedStatus}
							onChange={(e) => setSelectedStatus(e.target.value)}
							className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 appearance-none transition-all cursor-pointer"
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

				<div className="rounded-2xl overflow-hidden border border-gray-50">
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
