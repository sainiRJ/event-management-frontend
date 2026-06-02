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
	bookedAt: string;
	assignedEmployeeIds?: string[];
}

export interface iBooking extends iCreateBookingDTO {
	id: string;
	createdAt: string;
	updatedAt: string;
}
