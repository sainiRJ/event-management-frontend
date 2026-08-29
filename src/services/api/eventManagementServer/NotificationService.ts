import {AxiosInstance} from "axios";

import {APIResponse} from "@/customTypes/NetworkTypes";
import NetworkUtil from "@/utils/NetworkUtil";
import {apiEndpoints} from "./axiosConfig/AxiosServiceConstants";
import {iNotification} from "@/customTypes/appDataTypes/notificationTypes";

function NotificationService(apiServer: AxiosInstance) {
	const list = async (): Promise<APIResponse<iNotification[]> | null> => {
		let result = null;

		await apiServer.get(apiEndpoints.notifications.list()).then(
			(value) => {
				result = NetworkUtil.buildResult<iNotification[]>(
					value.data,
					value.status,
					null,
					null,
				);
			},
			(reason) => {
				const {response} = reason;
				result = NetworkUtil.buildResult<null>(
					response?.data ?? null,
					response?.status ?? 0,
					null,
					response?.data?.error ?? null,
				);
			},
		);

		return result;
	};

	const markRead = async (notificationId: string): Promise<void> => {
		try {
			await apiServer.patch(
				apiEndpoints.notifications.markRead(notificationId),
			);
		} catch {
			// The UI already updated optimistically; a failed sync is not worth
			// interrupting the admin over.
		}
	};

	const markAllRead = async (): Promise<void> => {
		try {
			await apiServer.patch(apiEndpoints.notifications.markAllRead());
		} catch {
			// See markRead.
		}
	};

	return {list, markRead, markAllRead};
}

export default NotificationService;
