import {
	APIResponseMessageType,
	httpStatusCodes,
} from "@/customTypes/NetworkTypes";

export interface iStateMessage {
	httpStatusCode?: httpStatusCodes | null;
	message: APIResponseMessageType;
}
