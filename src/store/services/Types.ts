import {NullableNumber, NullableString} from "@/customTypes/CommonTypes";
import {apiResponseStatuses} from "@/customTypes/NetworkTypes";

export const REDUCER_NAME = "serviceSlice";

export interface iService {
	/** URL on the customer site: /services/<slug> */
	slug?: string | null;
	id: string;
	serviceName: string;
	description?: string | null;
	price: string;
	available: boolean;
}

export interface iServiceState {
	isLoading: boolean;

	httpStatusCode: NullableNumber;

	message: NullableString;

	responseStatus: apiResponseStatuses;

	service: iService | null;

	serviceList: iService[];
}
