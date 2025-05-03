import {AxiosInstance} from "axios";

import {APIResponse} from "@/customTypes/NetworkTypes";

import NetworkUtil from "@/utils/NetworkUtil";
import {NullableString} from "@/customTypes/CommonTypes";
import {apiEndpoints} from "./axiosConfig/AxiosServiceConstants";
import {
	iLoginDTO,
	iLoginResponse,
	iSignupDTO,
} from "@/customTypes/appDataTypes/authTypes";

function AuthService(apiServer: AxiosInstance) {
	const login = async (
		loginDTO: Partial<iLoginDTO>,
	): Promise<APIResponse<iLoginResponse> | null> => {
		let result = null;

		await apiServer
			.post(apiEndpoints.auth.login(), loginDTO)
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

	const signup = async (signDTO: Partial<iSignupDTO>) => {
		let result = null;

		await apiServer
			.post(apiEndpoints.auth.signup(), signDTO)
			.then(
				(value) => {
					result = NetworkUtil.buildResult<null>(
						null,
						value.status,
						value.data.message,
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
		login,
		signup,
	};
}

export default AuthService;
