import {
	NullableNumber,
	NullableString,
	StringArray,
} from "@/customTypes/CommonTypes";
import {
	apiResponseStatuses,
	iAPIRequestStatus,
} from "@/customTypes/NetworkTypes";

export const REDUCER_NAME = "bookingSlice";

export interface iBooking {
	customerName: string;
	phoneNumber: string;
	eventName: string;
	eventDate: string | null;
	serviceId: string | null;
	venueAddress: string;
	decorationTheme: string | null;
	additionalNotes?: string;
	budget: string;
	advancePayment: string;
	bookingStatus?: string;
}

export interface iBookingRequest {
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

export interface iBookingState {
	isLoading: boolean;

	httpStatusCode: NullableNumber;

	message: NullableString;

	responseStatus: apiResponseStatuses;

	booking: iBooking | null;

	bookingList: iBooking[];

	bookingRequest: iBookingRequest[]
}
