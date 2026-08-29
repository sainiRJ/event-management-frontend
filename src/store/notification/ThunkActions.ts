import {createAsyncThunk} from "@reduxjs/toolkit";

import {curryGetThunkName} from "@/utils/ReduxUtil";
import {notificationService} from "@/services/api/eventManagementServer";

import {REDUCER_NAME} from "./NotificationSlice";

const curriedGetThunkName = curryGetThunkName(REDUCER_NAME);

/**
 * Persists read-state on the server so it survives a reload and follows the
 * admin to another device. The reducer updates optimistically; these thunks
 * make the change durable.
 */
export const markNotificationRead = createAsyncThunk<string, string>(
	curriedGetThunkName("markRead"),
	async (notificationId) => {
		await notificationService.markRead(notificationId);
		return notificationId;
	},
);

export const markAllNotificationsRead = createAsyncThunk<void, void>(
	curriedGetThunkName("markAllRead"),
	async () => {
		await notificationService.markAllRead();
	},
);
