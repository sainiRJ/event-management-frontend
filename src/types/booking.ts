export interface iCreateBookingDTO {
	id: string;
	customerName: string;
	phoneNumber: string;
	serviceId: string | null;
	eventDate: string | null;
	venueAddress: string;
	budget: string;
	advancePayment: string;
	eventName: string;
	notes: string;
	paymentStatusId: string;
	bookingStatusId: string;
	bookingStatus: string| null;
	bookedAt: string;
	serviceName: string;
	paymentStatus: string;
}

export interface iBooking extends iCreateBookingDTO {
	id: string;
	createdAt: string;
	updatedAt: string;
}
