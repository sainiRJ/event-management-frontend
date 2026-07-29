import {useEffect} from "react";
import {toast} from "sonner";

import {useAppDispatch} from "@/store/Hooks";
import {connectSocket, disconnectSocket} from "@/services/socket/socketService";
import {
	notificationReceived,
	hydrateNotifications,
	setSocketConnected,
} from "@/store/notification/NotificationSlice";
import {iNotification} from "@/customTypes/appDataTypes/notificationTypes";

/**
 * Mounts once (in App.tsx) while the admin is logged in. Connects the
 * Socket.IO client, wires the events described in
 * docs/NOTIFICATIONS_CONTRACT.md into the notification store, and shows a
 * toast for anything that arrives while the app is open.
 */
export function useNotificationSocket(isAuthenticated: boolean) {
	const dispatch = useAppDispatch();

	useEffect(() => {
		if (!isAuthenticated) return;

		const token = localStorage.getItem("access_token");
		if (!token) return;

		const socket = connectSocket(token);

		const onConnect = () => dispatch(setSocketConnected(true));
		const onDisconnect = () => dispatch(setSocketConnected(false));

		// Backend sends the unread backlog once, right after connecting.
		const onBacklog = (items: iNotification[]) => {
			dispatch(hydrateNotifications(items || []));
		};

		// Backend emits this for every new event (new booking, payment, etc.)
		const onNewNotification = (notification: iNotification) => {
			dispatch(notificationReceived(notification));
			toast.message(notification.title, {
				description: notification.message,
			});
		};

		socket.on("connect", onConnect);
		socket.on("disconnect", onDisconnect);
		socket.on("notification:backlog", onBacklog);
		socket.on("notification:new", onNewNotification);

		return () => {
			socket.off("connect", onConnect);
			socket.off("disconnect", onDisconnect);
			socket.off("notification:backlog", onBacklog);
			socket.off("notification:new", onNewNotification);
			disconnectSocket();
		};
	}, [isAuthenticated, dispatch]);
}
