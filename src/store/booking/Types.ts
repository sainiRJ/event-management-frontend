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
	id: string;
	customerName: string;
	phoneNumber: string;
	eventName: string;
	eventDate: string | null;
	serviceId: string | null;
	venueAddress: string;
	additionalNotes?: string;
	budget: string;
	advancePayment: string;
	bookingStatus?: string;
	paymentStatusId: string;
	bookingStatusId: string;
	bookedAt: string;
	serviceName: string;
	paymentStatus: string;
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

export interface iBookingState {
	isLoading: boolean;

	httpStatusCode: NullableNumber;

	message: NullableString;

	responseStatus: apiResponseStatuses;

	booking: iBooking | null;

	bookingList: iBooking[];

	bookingRequest: iBookingRequest[];
}
