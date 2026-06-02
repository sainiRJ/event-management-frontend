import {AxiosInstance} from "axios";

import {APIResponse} from "@/customTypes/NetworkTypes";

import NetworkUtil from "@/utils/NetworkUtil";
import {apiEndpoints} from "./axiosConfig/AxiosServiceConstants";

import {iCreateBookingDTO} from "@/customTypes/appDataTypes/bookingTypes";

function UserService(apiServer: AxiosInstance) {
	const createBooking = async (
		createBookingDTO: Partial<iCreateBookingDTO>,
	): Promise<APIResponse<iCreateBookingDTO> | null> => {
		let result = null;

		await apiServer
			.patch(apiEndpoints.booking.createBooking(), createBookingDTO)
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
	return {
		createBooking,
	};
}

export default UserService;
