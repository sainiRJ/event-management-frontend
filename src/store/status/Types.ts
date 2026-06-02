import {NullableNumber, NullableString} from "@/customTypes/CommonTypes";
import {apiResponseStatuses} from "@/customTypes/NetworkTypes";

export const REDUCER_NAME = "statusSlice";

export interface iStatus {
	id: string;
	context: string;
	name: string;
	description: string | null;
}

export interface iStatusState {
	isLoading: boolean;

	httpStatusCode: NullableNumber;

	message: NullableString;

	responseStatus: apiResponseStatuses;

	status: iStatus | null;

	statusList: iStatus[];
}
