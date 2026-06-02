import {AxiosInstance} from "axios";

import {APIResponse} from "@/customTypes/NetworkTypes";

import NetworkUtil from "@/utils/NetworkUtil";
import {apiEndpoints} from "./axiosConfig/AxiosServiceConstants";

import {iStatus} from "@/customTypes/appDataTypes/statusTypes";

function StatusService(apiServer: AxiosInstance) {
	const fetchStatus = async (): Promise<APIResponse<iStatus[]> | null> => {
		let result = null;

		await apiServer
			.get(apiEndpoints.status.getAllStatus())
			.then(
				//on fullfilled
				(value) => {
					result = NetworkUtil.buildResult<iStatus[]>(
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
		fetchStatus,
	};
}

export default StatusService;
