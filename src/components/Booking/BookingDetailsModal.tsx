import React from "react";
import {Modal, Button, Stack, Tag} from "rsuite";
import {iBooking} from "@/types/booking";
import {formatDate} from "@/utils/dateUtils";
import {formatCurrency} from "@/utils/currencyUtils";

interface BookingDetailsModalProps {
	booking: iBooking | null;
	show: boolean;
	onClose: () => void;
	onEdit: (booking: iBooking) => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
	booking,
	show,
	onClose,
	onEdit,
}) => {
	if (!booking) return null;

	return (
		<Modal
			size="lg"
			open={show}
			onClose={onClose}
			className="booking-details-modal"
		>
			<Modal.Header>
				<Modal.Title>Booking Details</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<div className="grid grid-cols-2 gap-6">
					<div className="space-y-4">
						<div>
							<h3 className="text-lg font-semibold text-gray-700">
								Customer Information
							</h3>
							<div className="mt-2 space-y-2">
								<p>
									<span className="font-medium">Name:</span>{" "}
									{booking.customerName}
								</p>
								<p>
									<span className="font-medium">Phone:</span>{" "}
									{booking.phoneNumber}
								</p>
							</div>
						</div>

						<div>
							<h3 className="text-lg font-semibold text-gray-700">
								Event Details
							</h3>
							<div className="mt-2 space-y-2">
								<p>
									<span className="font-medium">Event Name:</span>{" "}
									{booking.eventName}
								</p>
								<p>
									<span className="font-medium">Date:</span>{" "}
									{formatDate(booking.eventDate || "")}
								</p>
								<p>
									<span className="font-medium">Venue:</span>{" "}
									{booking.venueAddress}
								</p>
							</div>
						</div>
					</div>

					<div className="space-y-4">
						<div>
							<h3 className="text-lg font-semibold text-gray-700">
								Financial Information
							</h3>
							<div className="mt-2 space-y-2">
								<p>
									<span className="font-medium">Budget:</span>{" "}
									{formatCurrency(Number(booking.budget))}
								</p>
								<p>
									<span className="font-medium">Advance Payment:</span>{" "}
									{formatCurrency(Number(booking.advancePayment))}
								</p>
								<p>
									<span className="font-medium">Payment Status:</span>
									<Tag
										color={
											booking.paymentStatusId === "paid" ? "green" : "orange"
										}
										className="ml-2"
									>
										{booking.paymentStatusId}
									</Tag>
								</p>
							</div>
						</div>

						<div>
							<h3 className="text-lg font-semibold text-gray-700">
								Additional Information
							</h3>
							<div className="mt-2 space-y-2">
								<p>
									<span className="font-medium">Booking Status:</span>
									<Tag
										color={
											booking.bookingStatusId === "confirmed"
												? "green"
												: "orange"
										}
										className="ml-2"
									>
										{booking.bookingStatusId}
									</Tag>
								</p>
								<p>
									<span className="font-medium">Notes:</span>
								</p>
								<p className="text-gray-600">
									{booking.notes || "No additional notes"}
								</p>
							</div>
						</div>
					</div>
				</div>
			</Modal.Body>
			<Modal.Footer>
				<Stack spacing={10} justifyContent="flex-end">
					<Button appearance="subtle" onClick={onClose}>
						Close
					</Button>
					<Button appearance="primary" onClick={() => onEdit(booking)}>
						Edit Booking
					</Button>
				</Stack>
			</Modal.Footer>
		</Modal>
	);
};

export default BookingDetailsModal;
