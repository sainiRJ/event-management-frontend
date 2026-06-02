import {AxiosInstance} from "axios";

import {APIResponse} from "@/customTypes/NetworkTypes";

import NetworkUtil from "@/utils/NetworkUtil";
import {NullableString} from "@/customTypes/CommonTypes";
import {apiEndpoints} from "./axiosConfig/AxiosServiceConstants";

import {iService} from "@/customTypes/appDataTypes/serviceTypes";
import {iCreateServiceDTO} from "@/customTypes/appDataTypes/serviceTypes";

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

	const createService = async (
		createServiceDTO: iCreateServiceDTO,
	): Promise<APIResponse<iService> | null> => {
		let result = null;

		await apiServer
			.post(apiEndpoints.service.createService(), createServiceDTO)
			.then(
				(value) => {
					result = NetworkUtil.buildResult<iService>(
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

	const updateService = async (
		serviceId: string,
		updateServiceDTO: Partial<iCreateServiceDTO>,
	): Promise<APIResponse<iService> | null> => {
		let result = null;

		await apiServer
			.patch(apiEndpoints.service.updateService(serviceId), updateServiceDTO)
			.then(
				(value) => {
					result = NetworkUtil.buildResult<iService>(
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

	const deleteService = async (
		serviceId: string,
	): Promise<APIResponse<{message: string}> | null> => {
		let result = null;

		await apiServer
			.delete(apiEndpoints.service.updateService(serviceId).replace("update", "delete"))
			.then(
				(value) => {
					result = NetworkUtil.buildResult<{message: string}>(
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

	return {
		fetchServices,
		createService,
		updateService,
		deleteService,
	};
}

export default ServiceService;
