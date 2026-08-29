/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_EVENT_MANAGEMENT_BACKEND_BASEURL: string;
	readonly VITE_EVENT_MANAGEMENT_API_SERVER_TIMEOUT?: string;
	readonly VITE_SOCKET_URL?: string;
	readonly VITE_CHAT_SERVICE_BASEURL?: string;
	readonly VITE_GOOGLE_CLIENT_ID: string;
	readonly VITE_OAUTH_REDIRECT_URI: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
