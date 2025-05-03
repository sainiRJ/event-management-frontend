import {
	NullableNumber,
	NullableString,
	StringArray,
} from "@/customTypes/CommonTypes";
import {
	apiResponseStatuses,
	iAPIRequestStatus,
} from "@/customTypes/NetworkTypes";

export const REDUCER_NAME = "serviceSlice";

export interface iService {
	id: string;
	serviceName: string;
	description: string | null;
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
