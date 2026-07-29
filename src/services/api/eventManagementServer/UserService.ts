import {AxiosInstance} from "axios";

import {APIResponse} from "@/customTypes/NetworkTypes";

import NetworkUtil from "@/utils/NetworkUtil";
import {apiEndpoints} from "./axiosConfig/AxiosServiceConstants";

import {
	iUserProfile,
	iUpdateProfileDTO,
	iChangePasswordDTO,
} from "@/customTypes/appDataTypes/userTypes";

function UserService(apiServer: AxiosInstance) {
	const getProfile = async (): Promise<APIResponse<iUserProfile> | null> => {
		let result = null;

		await apiServer
			.get(apiEndpoints.user.userProfileDetails())
			.then(
				(value) => {
					result = NetworkUtil.buildResult<iUserProfile>(
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

	const updateProfile = async (
		payload: iUpdateProfileDTO,
	): Promise<APIResponse<iUserProfile> | null> => {
		let result = null;

		await apiServer
			.patch(apiEndpoints.user.updateProfile(), payload)
			.then(
				(value) => {
					result = NetworkUtil.buildResult<iUserProfile>(
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

	const uploadProfilePhoto = async (
		file: File,
	): Promise<APIResponse<iUserProfile> | null> => {
		let result = null;
		const formData = new FormData();
		formData.append("photo", file);

		await apiServer
			.post(apiEndpoints.user.uploadProfilePhoto(), formData, {
				headers: {"Content-Type": "multipart/form-data"},
			})
			.then(
				(value) => {
					result = NetworkUtil.buildResult<iUserProfile>(
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

	const changePassword = async (
		payload: iChangePasswordDTO,
	): Promise<APIResponse<null> | null> => {
		let result = null;

		await apiServer
			.patch(apiEndpoints.user.changePassword(), payload)
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

	return {
		getProfile,
		updateProfile,
		uploadProfilePhoto,
		changePassword,
	};
}

export default UserService;
