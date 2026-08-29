import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {iNotification} from "@/customTypes/appDataTypes/notificationTypes";

export const REDUCER_NAME = "notificationSlice";

interface iNotificationState {
	items: iNotification[];
	unreadCount: number;
	isConnected: boolean;
}

const initialState: iNotificationState = {
	items: [],
	unreadCount: 0,
	isConnected: false,
};

export const notificationSlice = createSlice({
	name: REDUCER_NAME,
	initialState,
	reducers: {
		setSocketConnected: (state, action: PayloadAction<boolean>) => {
			state.isConnected = action.payload;
		},
		hydrateNotifications: (state, action: PayloadAction<iNotification[]>) => {
			state.items = action.payload;
			state.unreadCount = action.payload.filter((n) => !n.isRead).length;
		},
		notificationReceived: (state, action: PayloadAction<iNotification>) => {
			// Guard against duplicate delivery (e.g. reconnect + backlog fetch)
			if (state.items.some((n) => n.id === action.payload.id)) return;
			state.items.unshift(action.payload);
			if (!action.payload.isRead) state.unreadCount += 1;
		},
		markAsRead: (state, action: PayloadAction<string>) => {
			const item = state.items.find((n) => n.id === action.payload);
			if (item && !item.isRead) {
				item.isRead = true;
				state.unreadCount = Math.max(0, state.unreadCount - 1);
			}
		},
		markAllAsRead: (state) => {
			state.items.forEach((n) => (n.isRead = true));
			state.unreadCount = 0;
		},
	},
});

export const {
	setSocketConnected,
	hydrateNotifications,
	notificationReceived,
	markAsRead,
	markAllAsRead,
} = notificationSlice.actions;

export default notificationSlice.reducer;
