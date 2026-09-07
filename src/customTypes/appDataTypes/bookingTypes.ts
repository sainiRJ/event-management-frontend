export interface iCreateBookingDTO {
	id?: string;
	customerName: string;
	phoneNumber: string;
	eventDate: string | null;
	serviceId: string | null;
	venueAddress: string;
	notes?: string;
	budget: string;
	advancePayment: string;
	eventName: string;
	paymentStatusId: string;
	bookingStatusId: string;
	assignedEmployeeIds?: string[];
	/** phone | admin - website and chat stamp their own */
	source?: string;
}

export interface iBookingRequest {
	id: string;
	customerName: string;
	phoneNumber: string;
	eventDate: string;
	location: string;
	bookingRquestAt: string;
	status: string;
	serviceId: string;
	statusId: string;
	statusName: string;
	notes: string;
}
