import {AxiosInstance} from "axios";

import {APIResponse} from "@/customTypes/NetworkTypes";

import NetworkUtil from "@/utils/NetworkUtil";
import {NullableString} from "@/customTypes/CommonTypes";
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

	const getAllBookings = async (): Promise<APIResponse<
		iCreateBookingDTO[]
	> | null> => {
		let result = null;

		await apiServer
			.get(apiEndpoints.booking.getAllBooking())
			.then(
				//on fullfilled
				(value) => {
					result = NetworkUtil.buildResult<iCreateBookingDTO[]>(
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

	const deleteBooking = async (ids: string | string[]) => {
		const endpoint = Array.isArray(ids)
			? apiEndpoints.booking.bulkDelete()
			: apiEndpoints.booking.deleteBooking(ids as string);

		let result = null;
		await apiServer
			.delete(endpoint, Array.isArray(ids) ? {data: {ids}} : undefined)
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

		await apiServer
			.patch(apiEndpoints.booking.updateBooking(booking.id!), booking)
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
