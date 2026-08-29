export type NotificationType =
	| "new_booking"
	| "booking_updated"
	| "payment_received"
	| "booking_cancelled"
	| "generic";

export interface iNotification {
	id: string;
	type: NotificationType;
	title: string;
	message: string;
	entityId?: string | null;
	isRead: boolean;
	createdAt: string;
}
