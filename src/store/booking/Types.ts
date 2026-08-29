import {iPagination} from "@/customTypes/NetworkTypes";
import {NullableNumber, NullableString} from "@/customTypes/CommonTypes";
import {apiResponseStatuses} from "@/customTypes/NetworkTypes";

export const REDUCER_NAME = "bookingSlice";

export interface iBooking {
	id: string;
	customerName: string;
	phoneNumber: string;
	eventName: string;
	eventDate: string | null;
	serviceId: string | null;
	venueAddress: string;
	notes?: string;
	budget: string;
	totalCost: string;
	advancePayment: string;
	paymentStatusId: string;
	bookingStatusId: string;
	bookingStatus: string;
	bookedAt: string;
	serviceName: string;
	paymentStatus: string;
	assignedEmployees?: {
		id: string;
		name: string;
		designation?: string;
		serviceName?: string;
	}[];
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

export interface iBookingState {
	isLoading: boolean;

	httpStatusCode: NullableNumber;

	message: NullableString;

	responseStatus: apiResponseStatuses;

	booking: iBooking | null;

	bookingList: iBooking[];
	pagination: iPagination | null;

	bookingRequest: iBookingRequest[];
}
