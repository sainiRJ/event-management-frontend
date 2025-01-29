import {AxiosInstance} from "axios";

import {APIResponse} from "@/customTypes/NetworkTypes";

import NetworkUtil from "@/utils/NetworkUtil";
import {NullableString} from "@/customTypes/CommonTypes";
import {apiEndpoints} from "./axiosConfig/AxiosServiceConstants";

import {iService} from "@/customTypes/appDataTypes/serviceTypes";

function ServiceService(apiServer: AxiosInstance) {
	const fetchServices = async (): Promise<APIResponse<iService[]> | null> => {
		let result = null;

		await apiServer
			.get(apiEndpoints.service.getAllServices())
			.then(
				//on fullfilled
				(value) => {
					result = NetworkUtil.buildResult<iService[]>(
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
		fetchServices,
	};
}

export default ServiceService;
