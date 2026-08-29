/**
 * Types for the operational screens added alongside the audit fixes:
 * booking requests, website enquiries, the calendar, the payment ledger,
 * gallery management and chat transcripts.
 */

export interface iBookingRequest {
	id: string;
	customerName: string;
	phoneNumber: string | null;
	email: string | null;
	eventName: string;
	eventDate: string;
	location: string;
	serviceName: string;
	serviceId: string;
	notes: string | null;
	requestedAt: string | null;
	status: string;
}

export interface iContactMessage {
	id: number;
	name: string;
	mobile: string;
	message: string;
	isRead: boolean;
	handledAt: string | null;
	createdAt: string;
}

export interface iCalendarEntry {
	bookingId: string;
	serviceId: string;
	serviceName: string;
	customerName: string;
	eventName: string;
	status: string;
	isOnlineBooking: boolean;
	totalCost: string;
}

export interface iCalendarDay {
	date: string;
	entries: iCalendarEntry[];
}

export interface iPaymentEntry {
	id: string;
	amount: string;
	paymentDate: string | null;
	status: string;
}

export interface iBookingLedger {
	bookingId: string;
	totalCost: string;
	totalPaid: string;
	outstanding: string;
	payments: iPaymentEntry[];
}

export interface iGalleryPhoto {
	photoId: string;
	photoUrl: string;
	serviceId: string;
	serviceName: string;
}

export interface iChatSessionSummary {
	sessionId: string;
	userId: string;
	title: string;
	startedAt: string;
	messageCount: number;
	lastMessageAt: string;
}

export interface iChatTranscriptMessage {
	id: string;
	role: "user" | "assistant";
	content: string;
	at: string;
}

export interface iChatTranscript {
	sessionId: string;
	userId: string;
	title: string;
	startedAt: string;
	messages: iChatTranscriptMessage[];
}
