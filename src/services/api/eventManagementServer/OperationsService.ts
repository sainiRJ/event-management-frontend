import {AxiosInstance} from "axios";

import {APIResponse, iPaginatedResult} from "@/customTypes/NetworkTypes";
import NetworkUtil from "@/utils/NetworkUtil";
import {apiEndpoints} from "./axiosConfig/AxiosServiceConstants";
import {
	iBookingRequest,
	iContactMessage,
	iCalendarDay,
	iBookingLedger,
	iGalleryPhoto,
} from "@/customTypes/appDataTypes/operationsTypes";

/**
 * Booking requests, website enquiries, calendar, payments and gallery.
 *
 * Same factory shape as the other services here: methods resolve to
 * `NetworkUtil.buildResult` and never throw for an HTTP error.
 */
function OperationsService(apiServer: AxiosInstance) {
	async function call<T>(
		run: () => Promise<{data: unknown; status: number}>,
	): Promise<APIResponse<T> | null> {
		try {
			const value = await run();
			return NetworkUtil.buildResult<T>(
				value.data as never,
				value.status,
				null,
				null,
			);
		} catch (reason) {
			const response = (reason as {response?: {status: number; data: never}})
				.response;

			return NetworkUtil.buildResult<T>(
				response?.data ?? null,
				response?.status ?? 0,
				null,
				response?.data ?? null,
			);
		}
	}

	// ── Booking requests ──────────────────────────────────────────────────
	const listBookingRequests = (
		params: {
			page?: number;
			limit?: number;
			includeHandled?: boolean;
		} = {},
	) => {
		return call<iPaginatedResult<iBookingRequest>>(() => {
			return apiServer.get(apiEndpoints.bookingRequests.list(), {params});
		});
	};

	const countBookingRequests = () => {
		return call<{count: number}>(() => {
			return apiServer.get(apiEndpoints.bookingRequests.count());
		});
	};

	const approveBookingRequest = (
		id: string,
		body: {totalCost: number; advancePayment: number},
	) => {
		return call<iBookingRequest>(() => {
			return apiServer.patch(apiEndpoints.bookingRequests.approve(id), body);
		});
	};

	const rejectBookingRequest = (id: string) => {
		return call<iBookingRequest>(() => {
			return apiServer.patch(apiEndpoints.bookingRequests.reject(id));
		});
	};

	// ── Website enquiries ─────────────────────────────────────────────────
	const listContactMessages = (
		params: {
			page?: number;
			limit?: number;
			unreadOnly?: boolean;
		} = {},
	) => {
		return call<iPaginatedResult<iContactMessage>>(() => {
			return apiServer.get(apiEndpoints.contactMessages.list(), {params});
		});
	};

	const countUnreadMessages = () => {
		return call<{count: number}>(() => {
			return apiServer.get(apiEndpoints.contactMessages.count());
		});
	};

	const markMessageRead = (id: number, isRead: boolean) => {
		return call<iContactMessage>(() => {
			return apiServer.patch(apiEndpoints.contactMessages.markRead(id), {
				isRead,
			});
		});
	};

	// ── Calendar ──────────────────────────────────────────────────────────
	const getCalendar = (from: string, to: string) => {
		return call<iCalendarDay[]>(() => {
			return apiServer.get(apiEndpoints.calendar.range(), {
				params: {from, to},
			});
		});
	};

	// ── Payment ledger ────────────────────────────────────────────────────
	const getLedger = (bookingId: string) => {
		return call<iBookingLedger>(() => {
			return apiServer.get(apiEndpoints.payments.ledger(bookingId));
		});
	};

	const recordPayment = (
		bookingId: string,
		body: {amount: number; paymentDate?: string},
	) => {
		return call<iBookingLedger>(() => {
			return apiServer.post(apiEndpoints.payments.record(bookingId), body);
		});
	};

	const deletePayment = (paymentId: string) => {
		return call<iBookingLedger>(() => {
			return apiServer.delete(apiEndpoints.payments.remove(paymentId));
		});
	};

	// ── Gallery ───────────────────────────────────────────────────────────
	const listMyPhotos = (params: {page?: number; limit?: number} = {}) => {
		return call<iPaginatedResult<iGalleryPhoto>>(() => {
			return apiServer.get(apiEndpoints.gallery.mine(), {params});
		});
	};

	const deletePhoto = (photoId: string) => {
		return call<{message: string}>(() => {
			return apiServer.delete(apiEndpoints.gallery.remove(photoId));
		});
	};

	return {
		listBookingRequests,
		countBookingRequests,
		approveBookingRequest,
		rejectBookingRequest,
		listContactMessages,
		countUnreadMessages,
		markMessageRead,
		getCalendar,
		getLedger,
		recordPayment,
		deletePayment,
		listMyPhotos,
		deletePhoto,
	};
}

export default OperationsService;
