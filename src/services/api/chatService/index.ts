import axios from "axios";

import config from "@/config/index";
import {getAccessToken} from "@/utils/tokenUtils";
import {APIResponse, iPaginatedResult} from "@/customTypes/NetworkTypes";
import NetworkUtil from "@/utils/NetworkUtil";
import {
	iChatSessionSummary,
	iChatTranscript,
} from "@/customTypes/appDataTypes/operationsTypes";

/**
 * Chat transcripts.
 *
 * The assistant is a separate service with its own database, so this has its
 * own axios instance pointed at it. It accepts the same access token the main
 * API issues, and gates these routes on the vendor role.
 */
const chatApi = axios.create({
	baseURL: config.CHAT_SERVICE_BASE_URL,
	timeout: 15000,
});

chatApi.interceptors.request.use((request) => {
	const token = getAccessToken();

	if (token) {
		request.headers.Authorization = `Bearer ${token}`;
	}

	return request;
});

async function call<T>(
	run: () => Promise<{data: unknown; status: number}>,
): Promise<APIResponse<T> | null> {
	try {
		const value = await run();

		return NetworkUtil.buildResult<T>(
			value.data as never,
			value.status,
			null,
			null,
		);
	} catch (reason) {
		const response = (reason as {response?: {status: number; data: never}})
			.response;

		return NetworkUtil.buildResult<T>(
			response?.data ?? null,
			response?.status ?? 0,
			null,
			response?.data ?? null,
		);
	}
}

export const chatTranscriptService = {
	listSessions: (params: {page?: number; limit?: number} = {}) => {
		return call<iPaginatedResult<iChatSessionSummary>>(() => {
			return chatApi.get("admin/chat/sessions", {params});
		});
	},

	getTranscript: (sessionId: string) => {
		return call<iChatTranscript>(() => {
			return chatApi.get(`admin/chat/sessions/${sessionId}`);
		});
	},
};

export default chatTranscriptService;
