import {NullableNumber, NullableString} from "@/customTypes/CommonTypes";
import {apiResponseStatuses} from "@/customTypes/NetworkTypes";
import {iUserProfile} from "@/customTypes/appDataTypes/userTypes";

export const REDUCER_NAME = "userSlice";

export interface iUserState {
	isLoading: boolean;

	httpStatusCode: NullableNumber;

	message: NullableString;

	responseStatus: apiResponseStatuses;

	profile: iUserProfile | null;
}
