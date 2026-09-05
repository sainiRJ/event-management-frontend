import {AxiosInstance} from "axios";

import {APIResponse, iPaginatedResult} from "@/customTypes/NetworkTypes";

import NetworkUtil from "@/utils/NetworkUtil";
import {apiEndpoints} from "./axiosConfig/AxiosServiceConstants";

import {
	iCreateBookingDTO,
	iBookingRequest,
} from "@/customTypes/appDataTypes/bookingTypes";
import {FinanceData} from "@/store/finance/Types";

function BookingService(apiServer: AxiosInstance) {
	const createBooking = async (
		createBookingDTO: Partial<iCreateBookingDTO>,
	): Promise<APIResponse<iCreateBookingDTO> | null> => {
		let result = null;

		await apiServer
			.post(apiEndpoints.booking.createBooking(), createBookingDTO)
			.then(
				//on fullfilled
				(value) => {
					result = NetworkUtil.buildResult<null>(
						value.data,
						value.status,
						null,
						null,
					);
				},
				// onRejected
				(reason) => {
					const {response} = reason;
					const {status, data} = response;

					result = NetworkUtil.buildResult<null>(data, status, data, null);
				},
			)
			.catch((error) => {
				throw error;
			});

		return result;
	};

	const getAllBookings = async (
		params: {
			page?: number;
			limit?: number;
			/** Matched in the database against customer name, phone and event. */
			search?: string;
			statusId?: string;
		} = {},
	): Promise<APIResponse<iPaginatedResult<iCreateBookingDTO>> | null> => {
		let result = null;

		await apiServer
			.get(apiEndpoints.booking.getAllBooking(), {params})
			.then(
				//on fullfilled
				(value) => {
					result = NetworkUtil.buildResult<iPaginatedResult<iCreateBookingDTO>>(
						value.data,
						value.status,
						null,
						null,
					);
				},
				// onRejected
				(reason) => {
					const {response} = reason;
					const {status, data} = response;

					result = NetworkUtil.buildResult<null>(data, status, data, null);
				},
			)
			.catch((error) => {
				throw error;
			});

		return result;
	};

	/**
	 * Deletes one booking, or several.
	 *
	 * The bulk route is a POST with a `bookingIds` body — a DELETE with a
	 * body is poorly supported and the field name has to match the server's
	 * schema, which this call previously got wrong on both counts.
	 */
	const deleteBooking = async (
		ids: string | string[],
	): Promise<APIResponse<{message: string} | null> | null> => {
		const isBulk = Array.isArray(ids);

		let result: APIResponse<{message: string} | null> | null = null;
		await (isBulk
			? apiServer.post(apiEndpoints.booking.bulkDelete(), {bookingIds: ids})
			: apiServer.delete(apiEndpoints.booking.deleteBooking(ids as string))
		)
			.then(
				(value) => {
					result = NetworkUtil.buildResult<null>(
						value.data,
						value.status,
						null,
						null,
					);
				},
				(reason) => {
					const {response} = reason;
					const {status, data} = response;
					result = NetworkUtil.buildResult<null>(data, status, data, null);
				},
			)
			.catch((error) => {
				throw error;
			});

		return result;
	};

	const updateBooking = async (
		booking: iCreateBookingDTO,
	): Promise<APIResponse<iCreateBookingDTO> | null> => {
		let result = null;

		const bookingId = booking.id;
		if (!bookingId) {
			throw new Error("Booking ID is required for updates");
		}

		await apiServer
			.patch(apiEndpoints.booking.updateBooking(bookingId), booking)
			.then(
				(value) => {
					result = NetworkUtil.buildResult<iCreateBookingDTO>(
						value.data,
						value.status,
						null,
						null,
					);
				},
				(reason) => {
					const {response} = reason;
					const {status, data} = response;

					result = NetworkUtil.buildResult<null>(data, status, data, null);
				},
			)
			.catch((error) => {
				throw error;
			});

		return result;
	};

	const getBookingRequest = async (): Promise<APIResponse<
		iBookingRequest[]
	> | null> => {
		let result = null;

		await apiServer
			.get(apiEndpoints.booking.bookingRequest())
			.then(
				//on fullfilled
				(value) => {
					result = NetworkUtil.buildResult<iBookingRequest[]>(
						value.data,
						value.status,
						null,
						null,
					);
				},
				// onRejected
				(reason) => {
					const {response} = reason;
					const {status, data} = response;

					result = NetworkUtil.buildResult<null>(data, status, data, null);
				},
			)
			.catch((error) => {
				throw error;
			});

		return result;
	};

	const getFinanceData = async (
		queryParams: string,
	): Promise<APIResponse<FinanceData> | null> => {
		let result = null;

		await apiServer
			.get(apiEndpoints.booking.getFinanceData(queryParams))
			.then(
				//on fullfilled
				(value) => {
					result = NetworkUtil.buildResult<FinanceData>(
						value.data,
						value.status,
						null,
						null,
					);
				},
				// onRejected
				(reason) => {
					const {response} = reason;
					const {status, data} = response;

					result = NetworkUtil.buildResult<null>(data, status, data, null);
				},
			)
			.catch((error) => {
				throw error;
			});

		return result;
	};

	return {
		createBooking,
		getAllBookings,
		deleteBooking,
		updateBooking,
		getBookingRequest,
		getFinanceData,
	};
}

export default BookingService;
