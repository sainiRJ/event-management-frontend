import React from "react";
import {iBooking} from "@/store/booking/Types";
import {formatDate} from "@/utils/dateUtils";
import {formatCurrency} from "@/utils/currencyUtils";

interface iBookingReceiptProps {
	booking: iBooking;
	businessName?: string;
	businessPhone?: string;
	businessAddress?: string;
}

/**
 * A receipt the vendor can actually hand over.
 *
 * The payment ledger worked perfectly and had no way out of the screen, so
 * when a customer asked "give me something in writing" the answer was a
 * WhatsApp message typed by hand.
 *
 * Printed through the browser rather than generated as a PDF: it needs no
 * library, it works offline, and "Save as PDF" is one option in the same
 * dialog. The `print:` classes below are what make the surrounding dashboard
 * disappear when it runs.
 */
const BookingReceipt: React.FC<iBookingReceiptProps> = ({
	booking,
	businessName = "Saini Events",
	businessPhone = "+91 94541 89270",
	businessAddress = "Atheha, Pratapgarh, U.P. 230125",
}) => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const anyBooking = booking as any;

	const total = Number(anyBooking.totalCost ?? anyBooking.budget ?? 0);
	const paid = Number(booking.advancePayment ?? 0);
	const due = total - paid;

	return (
		<div
			id="booking-receipt"
			className="hidden print:block print:p-8 print:text-black"
		>
			<div className="mb-6 border-b-2 border-black pb-4">
				<h1 className="text-2xl font-bold">{businessName}</h1>
				<p className="text-sm">{businessAddress}</p>
				<p className="text-sm">{businessPhone}</p>
			</div>

			<div className="mb-6 flex justify-between">
				<div>
					<h2 className="text-lg font-bold">Booking Receipt</h2>
					<p className="text-sm">Reference: {booking.id}</p>
				</div>
				<p className="text-sm">Issued {formatDate(new Date().toISOString())}</p>
			</div>

			<table className="mb-6 w-full text-sm">
				<tbody>
					<tr>
						<td className="py-1 font-semibold">Customer</td>
						<td className="py-1">{booking.customerName}</td>
					</tr>
					<tr>
						<td className="py-1 font-semibold">Phone</td>
						<td className="py-1">{booking.phoneNumber}</td>
					</tr>
					<tr>
						<td className="py-1 font-semibold">Event</td>
						<td className="py-1">{booking.eventName}</td>
					</tr>
					<tr>
						<td className="py-1 font-semibold">Date</td>
						<td className="py-1">{formatDate(booking.eventDate || "")}</td>
					</tr>
					<tr>
						<td className="py-1 font-semibold">Venue</td>
						<td className="py-1">{booking.venueAddress}</td>
					</tr>
					<tr>
						<td className="py-1 font-semibold">Service</td>
						<td className="py-1">{booking.serviceName}</td>
					</tr>
				</tbody>
			</table>

			<table className="mb-6 w-full border-t border-black text-sm">
				<tbody>
					<tr>
						<td className="py-2 font-semibold">Agreed price</td>
						<td className="py-2 text-right">{formatCurrency(total)}</td>
					</tr>
					<tr>
						<td className="py-2 font-semibold">Received</td>
						<td className="py-2 text-right">{formatCurrency(paid)}</td>
					</tr>
					<tr className="border-t border-black">
						<td className="py-2 text-base font-bold">Balance due</td>
						<td className="py-2 text-right text-base font-bold">
							{formatCurrency(due)}
						</td>
					</tr>
				</tbody>
			</table>

			<p className="text-xs">
				{due > 0
					? `The balance of ${formatCurrency(due)} is payable on the event day.`
					: "Paid in full. Thank you."}
			</p>

			<p className="mt-8 text-xs">
				This is a record of a booking with {businessName}. For any question
				about it, call {businessPhone}.
			</p>
		</div>
	);
};

export default BookingReceipt;
