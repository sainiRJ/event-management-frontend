export interface iCreateBookingDTO {
	customerName: string;
	phoneNumber: string;
	email: string;
	eventDateTime: string;
	service: string;
	venueAddress: string;
	decorationTheme: string;
	additionalNotes?: string;
	budget: string;
}
