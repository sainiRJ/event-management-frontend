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
	iTelegramStatus,
	iTelegramLinkStart,
	iReview,
	iReviewRequestResult,
	iQuote,
	iQuoteSendResult,
	iTodayView,
	iExpense,
	iExpenseInput,
	iExpenseSummary,
	iMaterial,
	iMaterialInput,
	iBookingChecklist,
	iBookingMaterial,
	iAttendanceDay,
	iAttendanceMonth,
	iAttendanceMark,
	iAttachment,
	iPackage,
	iPackageInput,
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

	const updatePhotoCaption = (photoId: string, caption: string) => {
		return call<iGalleryPhoto>(() => {
			return apiServer.patch(apiEndpoints.gallery.caption(photoId), {caption});
		});
	};

	// ── Quotes ────────────────────────────────────────────────────────────
	const getQuote = (bookingId: string) => {
		return call<iQuote>(() => {
			return apiServer.get(apiEndpoints.quotes.get(bookingId));
		});
	};

	const saveQuote = (
		bookingId: string,
		body: {
			items: {description: string; quantity: number; unitPrice: number}[];
			notes: string;
		},
	) => {
		return call<iQuote>(() => {
			return apiServer.put(apiEndpoints.quotes.save(bookingId), body);
		});
	};

	const sendQuote = (bookingId: string) => {
		return call<iQuoteSendResult>(() => {
			return apiServer.post(apiEndpoints.quotes.send(bookingId));
		});
	};

	// ── Reviews ───────────────────────────────────────────────────────────
	const listReviews = (params: {
		page?: number;
		limit?: number;
		status?: string;
	}) => {
		return call<iPaginatedResult<iReview>>(() => {
			return apiServer.get(apiEndpoints.reviews.list(), {params});
		});
	};

	const requestReview = (bookingId: string) => {
		return call<iReviewRequestResult>(() => {
			return apiServer.post(apiEndpoints.reviews.request(bookingId));
		});
	};

	const setReviewStatus = (
		reviewId: string,
		status: "approved" | "rejected",
	) => {
		return call<iReview>(() => {
			return apiServer.patch(apiEndpoints.reviews.status(reviewId), {status});
		});
	};

	// ── Telegram alerts ───────────────────────────────────────────────────
	const getTelegramStatus = () => {
		return call<iTelegramStatus>(() => {
			return apiServer.get(apiEndpoints.user.telegram());
		});
	};

	const startTelegramLink = () => {
		return call<iTelegramLinkStart>(() => {
			return apiServer.post(apiEndpoints.user.telegramLink());
		});
	};

	const verifyTelegramLink = () => {
		return call<iTelegramStatus>(() => {
			return apiServer.post(apiEndpoints.user.telegramVerify());
		});
	};

	const sendTelegramTest = () => {
		return call<null>(() => {
			return apiServer.post(apiEndpoints.user.telegramTest());
		});
	};

	const unlinkTelegram = () => {
		return call<iTelegramStatus>(() => {
			return apiServer.delete(apiEndpoints.user.telegram());
		});
	};

	// ── Today / expenses / materials / attendance ─────────────────────────
	/** Multipart upload; the axios instance attaches the bearer token. */
	const uploadPhotos = (serviceId: string, files: File[]) => {
		const body = new FormData();
		body.append("serviceId", serviceId);
		files.forEach((file) => {
			body.append("photos", file);
		});
		return call<iGalleryPhoto[]>(() => {
			return apiServer.post(apiEndpoints.gallery.upload(), body, {
				headers: {"Content-Type": "multipart/form-data"},
				timeout: 120000,
			});
		});
	};

	const listPackages = () => {
		return call<iPackage[]>(() => {
			return apiServer.get(apiEndpoints.packages.list());
		});
	};

	const createPackage = (body: iPackageInput) => {
		return call<iPackage>(() => {
			return apiServer.post(apiEndpoints.packages.create(), body);
		});
	};

	const updatePackage = (packageId: string, body: iPackageInput) => {
		return call<iPackage>(() => {
			return apiServer.patch(apiEndpoints.packages.update(packageId), body);
		});
	};

	const deletePackage = (packageId: string) => {
		return call<{id: string}>(() => {
			return apiServer.delete(apiEndpoints.packages.remove(packageId));
		});
	};

	const listAttachments = (bookingId: string) => {
		return call<iAttachment[]>(() => {
			return apiServer.get(apiEndpoints.attachments.list(bookingId));
		});
	};

	const getToday = () => {
		return call<iTodayView>(() => {
			return apiServer.get(apiEndpoints.insights.today());
		});
	};

	const listExpenses = (params: {
		page?: number;
		limit?: number;
		fromDate?: string;
		toDate?: string;
		bookingId?: string;
		category?: string;
	}) => {
		return call<iPaginatedResult<iExpense> & {summary: iExpenseSummary}>(() => {
			return apiServer.get(apiEndpoints.expenses.list(), {params});
		});
	};

	const createExpense = (body: iExpenseInput) => {
		return call<iExpense>(() => {
			return apiServer.post(apiEndpoints.expenses.create(), body);
		});
	};

	const deleteExpense = (expenseId: string) => {
		return call<{id: string}>(() => {
			return apiServer.delete(apiEndpoints.expenses.remove(expenseId));
		});
	};

	const getServiceMaterials = (serviceId: string) => {
		return call<iMaterial[]>(() => {
			return apiServer.get(apiEndpoints.materials.service(serviceId));
		});
	};

	const saveServiceMaterials = (serviceId: string, items: iMaterialInput[]) => {
		return call<iMaterial[]>(() => {
			return apiServer.put(apiEndpoints.materials.service(serviceId), {
				items,
			});
		});
	};

	const getBookingChecklist = (bookingId: string) => {
		return call<iBookingChecklist>(() => {
			return apiServer.get(apiEndpoints.materials.booking(bookingId));
		});
	};

	const saveBookingChecklist = (bookingId: string, items: iMaterialInput[]) => {
		return call<iBookingChecklist>(() => {
			return apiServer.put(apiEndpoints.materials.booking(bookingId), {
				items,
			});
		});
	};

	const setChecklistItemDone = (
		bookingId: string,
		materialId: string,
		isDone: boolean,
	) => {
		return call<iBookingMaterial>(() => {
			return apiServer.patch(
				apiEndpoints.materials.bookingItem(bookingId, materialId),
				{isDone},
			);
		});
	};

	const getAttendanceDay = (date: string) => {
		return call<iAttendanceDay>(() => {
			return apiServer.get(apiEndpoints.attendance.day(), {params: {date}});
		});
	};

	const getAttendanceMonth = (params: {fromDate?: string; toDate?: string}) => {
		return call<iAttendanceMonth>(() => {
			return apiServer.get(apiEndpoints.attendance.month(), {params});
		});
	};

	const markAttendance = (marks: iAttendanceMark[]) => {
		return call<{count: number}>(() => {
			return apiServer.post(apiEndpoints.attendance.mark(), {marks});
		});
	};

	return {
		uploadPhotos,
		listPackages,
		createPackage,
		updatePackage,
		deletePackage,
		listAttachments,
		getToday,
		listExpenses,
		createExpense,
		deleteExpense,
		getServiceMaterials,
		saveServiceMaterials,
		getBookingChecklist,
		saveBookingChecklist,
		setChecklistItemDone,
		getAttendanceDay,
		getAttendanceMonth,
		markAttendance,
		getTelegramStatus,
		startTelegramLink,
		verifyTelegramLink,
		sendTelegramTest,
		unlinkTelegram,
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
		updatePhotoCaption,
		listReviews,
		requestReview,
		setReviewStatus,
		getQuote,
		saveQuote,
		sendQuote,
	};
}

export default OperationsService;
