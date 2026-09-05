import React from "react";
import {iBooking} from "@/store/booking/Types";
import {formatDate} from "@/utils/dateUtils";
import {formatCurrency} from "@/utils/currencyUtils";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import {
	User,
	Calendar,
	MapPin,
	Wallet,
	ClipboardCheck,
	MessageSquare,
	Printer,
} from "lucide-react";
import {IndianRupee} from "lucide-react";
import PaymentLedger from "./PaymentLedger";
import BookingReceipt from "./BookingReceipt";

interface BookingDetailsModalProps {
	booking: iBooking | null;
	show: boolean;
	onClose: () => void;
	onEdit: (booking: any) => void;
	/** Called after a payment is added or removed, so the list can refresh. */
	onPaymentChange?: () => void;
}

interface DetailItem {
	label: string;
	value: any;
	isBadge?: boolean;
	isFullWidth?: boolean;
}

interface Section {
	title: string;
	icon: any;
	items: DetailItem[];
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
	booking,
	show,
	onClose,
	onEdit,
	onPaymentChange,
}) => {
	if (!booking) return null;

	const sections: Section[] = [
		{
			title: "Customer Info",
			icon: User,
			items: [
				{label: "Name", value: booking.customerName},
				{label: "Phone", value: booking.phoneNumber},
			],
		},
		{
			title: "Event Details",
			icon: Calendar,
			items: [
				{label: "Event Name", value: (booking as any).eventName},
				{label: "Date", value: formatDate(booking.eventDate || "")},
				{label: "Venue", value: booking.venueAddress},
			],
		},
		{
			title: "Financials",
			icon: Wallet,
			items: [
				{
					label: "Total Budget",
					value: formatCurrency(
						Number((booking as any).totalCost || (booking as any).budget || 0),
					),
				},
				{
					label: "Advance Payment",
					value: formatCurrency(Number(booking.advancePayment || 0)),
				},
				{label: "Payment Status", value: booking.paymentStatus, isBadge: true},
			],
		},
		{
			title: "Status & Notes",
			icon: ClipboardCheck,
			items: [
				{label: "Booking Status", value: booking.bookingStatus, isBadge: true},
				{
					label: "Notes",
					value: booking.notes || "No additional notes",
					isFullWidth: true,
				},
			],
		},
	];

	return (
		<Modal
			size="lg"
			isOpen={show}
			onClose={onClose}
			title="Booking Overview"
			footer={
				<>
					{/* Something to hand the customer. The ledger was accurate and
					    trapped on screen. */}
					<Button variant="secondary" onClick={() => window.print()}>
						<Printer className="mr-2 h-4 w-4" />
						Print receipt
					</Button>
					<Button variant="ghost" onClick={onClose}>
						Close
					</Button>
					<Button onClick={() => onEdit(booking)}>Edit Booking</Button>
				</>
			}
		>
			<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
				{sections.map((section, idx) => (
					<div key={idx} className="space-y-4">
						<h4 className="flex items-center gap-2 text-brand-600 font-black text-sm uppercase tracking-widest">
							<section.icon className="w-4 h-4" />
							{section.title}
						</h4>

						<div className="space-y-3 bg-gray-50/50 rounded-2xl p-5 border border-brand-100/50">
							{section.items.map((item, i) => (
								<div key={i} className={item.isFullWidth ? "col-span-2" : ""}>
									<p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
										{item.label}
									</p>
									{item.isBadge ? (
										<span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white border border-brand-100/70 shadow-sm text-brand-600">
											{item.value}
										</span>
									) : (
										<p className="text-sm font-bold text-[#2B2129] leading-relaxed">
											{item.value || "-"}
										</p>
									)}
								</div>
							))}
						</div>
					</div>
				))}
			</div>

			{/* The payment ledger: every receipt against this booking. The
			    booking's advance is derived from these, not typed in. */}
			<section className="mt-8 border-t border-brand-100/50 pt-6">
				<h4 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-brand-600">
					<IndianRupee className="h-4 w-4" />
					Payments
				</h4>

				<PaymentLedger bookingId={booking.id} onChange={onPaymentChange} />
			</section>

			{/* Hidden on screen; this is what the browser prints. */}
			<BookingReceipt booking={booking} />
		</Modal>
	);
};

export default BookingDetailsModal;
