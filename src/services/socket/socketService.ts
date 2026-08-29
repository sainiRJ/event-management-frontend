import {io, Socket} from "socket.io-client";
import config from "@/config";

/**
 * Singleton Socket.IO client for real-time notifications.
 *
 * Auth: the access token is sent in `auth.token` on connect (NOT as a query
 * param, to avoid it leaking into server access logs). The backend should
 * verify this token the same way it verifies the REST API bearer token.
 *
 * See docs/NOTIFICATIONS_CONTRACT.md for the full event contract this
 * client expects the backend to implement.
 */
let socket: Socket | null = null;

export const connectSocket = (token: string): Socket => {
	if (socket?.connected) return socket;

	socket = io(config.SOCKET_URL, {
		auth: {token},
		transports: ["websocket", "polling"],
		reconnection: true,
		reconnectionAttempts: Infinity,
		reconnectionDelay: 1500,
		reconnectionDelayMax: 10000,
	});

	return socket;
};

export const disconnectSocket = (): void => {
	socket?.disconnect();
	socket = null;
};

export const getSocket = (): Socket | null => socket;
