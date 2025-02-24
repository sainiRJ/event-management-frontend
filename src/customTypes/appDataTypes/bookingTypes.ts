export interface iCreateBookingDTO {
	customerName: string;
	phoneNumber: string;
	eventDateTime: string | null;
	serviceId: string | null;
	venueAddress: string;
	decorationTheme: string | null;
	additionalNotes?: string;
	budget: string;
	eventName: string;
	paymentStatusId: string;
	bookingStatusId: string;
}
