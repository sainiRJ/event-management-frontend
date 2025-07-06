export interface iCreateBookingDTO {
	id?: string;
	customerName: string;
	phoneNumber: string;
	eventDate: string | null;
	serviceId: string | null;
	venueAddress: string;
	additionalNotes?: string;
	budget: string;
	advancePayment: string;
	eventName: string;
	paymentStatusId: string;
	bookingStatusId: string;
	bookingStatus: string | null;
	assignedEmployeeIds?: string[];
}

export interface iBookingRequest {
	id: string;
	customerName: string;
	phoneNumber: string;
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
