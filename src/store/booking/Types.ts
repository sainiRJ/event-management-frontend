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

export interface iBookingState {
	isLoading: boolean;

	httpStatusCode: NullableNumber;

	message: NullableString;

	responseStatus: apiResponseStatuses;

	booking: iBooking | null;

	bookingList: iBooking[];
}
