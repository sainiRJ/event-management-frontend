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

export interface iBookingRequest{
	id: string;
	customerName: string;
	phoneNumber: string;
	email?: string;
	eventDate: string;
	location: string;
	bookingRquestAt: string;
	status: string;
	serviceName: string;
	serviceId: string;
	statusId: string;
	statusName: string;
	notes: string;
}