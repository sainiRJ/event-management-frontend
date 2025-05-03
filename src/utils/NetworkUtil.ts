import {iGenericResponse} from "@/customTypes/CommonServiceTypes";
import {APIResponse, httpStatusCodes} from "@/customTypes/NetworkTypes";

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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	data: iGenericResponse<SuccessResultType> | null,
	httpStatusCode: httpStatusCodes,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	message: any,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	error: any,
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
