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
	/** website | chat | admin | phone */
	source?: string;
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
	/** Shown under the photo on the site and used as its alt text. */
	caption?: string | null;
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

/** Itemised quote on a booking. */
export interface iQuoteItem {
	id: string;
	description: string;
	quantity: number;
	unitPrice: number;
	lineTotal: number;
}

export interface iQuote {
	bookingId: string;
	customerName: string;
	serviceName: string;
	eventDate: string;
	location: string;
	items: iQuoteItem[];
	notes: string | null;
	total: number;
	status: "draft" | "sent" | "accepted" | null;
	sentAt: string | null;
	acceptedAt: string | null;
}

export interface iQuoteSendResult {
	quote: iQuote;
	quoteUrl: string;
	wasEmailed: boolean;
}

/** A customer review, or an unanswered invite. */
export interface iReview {
	id: string;
	bookingId: string;
	customerName: string;
	serviceName: string;
	eventDate: string;
	rating: number | null;
	text: string | null;
	photoUrl: string | null;
	status: "pending" | "approved" | "rejected";
	isSubmitted: boolean;
	submittedAt: string | null;
	createdAt: string;
}

export interface iReviewRequestResult {
	review: iReview;
	reviewUrl: string;
	wasEmailed: boolean;
}

/** Telegram alert link state, from GET /user/me/telegram. */
export interface iTelegramStatus {
	isConfigured: boolean;
	isLinked: boolean;
	botUsername: string | null;
}

export interface iTelegramLinkStart extends iTelegramStatus {
	code: string;
	startUrl: string | null;
	expiresAt: string;
}

export interface iPackage {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	price: number;
	isActive: boolean;
	sortOrder: number;
	separatePrice: number;
	services: {id: string; serviceName: string; slug: string | null}[];
}

export interface iPackageInput {
	name?: string;
	description?: string | null;
	price?: number;
	isActive?: boolean;
	sortOrder?: number;
	serviceIds?: string[];
}

export interface iAttachment {
	id: string;
	url: string;
	createdAt: string;
}

// ── Today ─────────────────────────────────────────────────────────────

export interface iTodayEvent {
	bookingId: string;
	serviceName: string;
	customerName: string;
	phoneNumber: string | null;
	eventName: string;
	eventDate: string;
	location: string;
	status: string;
	totalCost: string;
	amountDue: string;
	crew: {employeeId: string; name: string; designation: string}[];
	materialsDone: number;
	materialsTotal: number;
}

export interface iFollowUp {
	bookingId: string;
	customerName: string;
	phoneNumber: string | null;
	serviceName: string;
	eventDate: string;
	waitingHours: number;
	source: string;
}

export interface iOverduePayment {
	bookingId: string;
	customerName: string;
	phoneNumber: string | null;
	serviceName: string;
	eventDate: string;
	amountDue: string;
	daysOverdue: number;
}

export interface iPendingQuote {
	bookingId: string;
	customerName: string;
	phoneNumber: string | null;
	serviceName: string;
	eventDate: string;
	total: string;
	sentAt: string;
}

export interface iTodayView {
	date: string;
	today: iTodayEvent[];
	tomorrow: iTodayEvent[];
	thisWeekCount: number;
	followUps: iFollowUp[];
	overdue: iOverduePayment[];
	quotesAwaiting: iPendingQuote[];
	unreadMessages: number;
}

// ── Expenses ──────────────────────────────────────────────────────────

export const EXPENSE_CATEGORIES = [
	"flowers",
	"fabric",
	"lighting",
	"transport",
	"labour",
	"food",
	"rental",
	"other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export interface iExpense {
	id: string;
	category: string;
	amount: number;
	note: string | null;
	spentOn: string;
	bookingId: string | null;
	bookingLabel: string | null;
	createdAt: string;
}

export interface iExpenseInput {
	category: string;
	amount: number;
	spentOn: string;
	note?: string;
	bookingId?: string | null;
}

export interface iExpenseSummary {
	total: number;
	byCategory: {category: string; total: number}[];
}

// ── Materials ─────────────────────────────────────────────────────────

export interface iMaterial {
	id: string;
	name: string;
	quantity: number;
	unit: string | null;
	sortOrder: number;
}

export interface iBookingMaterial extends iMaterial {
	isDone: boolean;
}

export interface iBookingChecklist {
	bookingId: string;
	items: iBookingMaterial[];
	doneCount: number;
	didSeed: boolean;
}

export interface iMaterialInput {
	id?: string;
	name: string;
	quantity: number;
	unit?: string | null;
	isDone?: boolean;
}

// ── Attendance ────────────────────────────────────────────────────────

export type AttendanceStatus = "present" | "absent" | "half";

export interface iAttendanceDay {
	date: string;
	employees: {
		employeeId: string;
		name: string;
		designation: string;
		status: AttendanceStatus | null;
		note: string | null;
		bookingId: string | null;
	}[];
}

export interface iAttendanceMonth {
	from: string;
	to: string;
	employees: {
		employeeId: string;
		name: string;
		designation: string;
		present: number;
		half: number;
		absent: number;
		payableDays: number;
	}[];
	rows: {
		id: string;
		employeeId: string;
		employeeName: string;
		date: string;
		status: AttendanceStatus;
		bookingId: string | null;
		note: string | null;
	}[];
}

export interface iAttendanceMark {
	employeeId: string;
	date: string;
	status: AttendanceStatus;
	bookingId?: string | null;
	note?: string | null;
}
