import {AxiosInstance} from "axios";

import {APIResponse} from "@/customTypes/NetworkTypes";

import NetworkUtil from "@/utils/NetworkUtil";
import {NullableString} from "@/customTypes/CommonTypes";
import {apiEndpoints} from "./axiosConfig/AxiosServiceConstants";

import {iCreateBookingDTO} from "@/customTypes/appDataTypes/bookingTypes";

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
						null,
						value.status,
						null,
						value.data,
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
	return {
		createBooking,
		getAllBookings,
	};
}

export default BookingService;
