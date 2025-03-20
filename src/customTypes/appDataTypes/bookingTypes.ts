export interface iCreateBookingDTO {
	id?: string;
	customerName: string;
	phoneNumber: string;
	eventDate: string | null;
	serviceId: string | null;
	venueAddress: string;
	decorationTheme: string | null;
	additionalNotes?: string;
	budget: string;
	advancePayment: string;
	eventName: string;
	paymentStatusId: string;
	bookingStatusId: string;
	bookingStatus?: string | undefined;
}
