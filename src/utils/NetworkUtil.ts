import {iGenericResponse} from "@/customTypes/CommonServiceTypes";
import {
	APIResponse,
	iAPIError,
	httpStatusCodes,
} from "@/customTypes/NetworkTypes";

/**
 * This function helps the api service functions to return
 * a standard result-object.
 *
 * @param error
 * @param httpStatusCode
 * @param message
 * @param data
 * @returns
 */
function buildResult<SuccessResultType>(
	data: iGenericResponse<SuccessResultType> | null,
	httpStatusCode: httpStatusCodes,
	message: string | null,
	error: iAPIError | null,
): APIResponse<SuccessResultType> {
	return {
		error: error || null,
		httpStatusCode: httpStatusCode || null,
		message: message || null,
		data: data || null,
	};
}

const NetworkUtil = {
	buildResult,
};

export default NetworkUtil;
