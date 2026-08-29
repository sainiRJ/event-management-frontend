import featureFlagConfig from "./featureFlagConfig";

/**
 * Environment variables used in the application.
 *
 * Vite only exposes VITE_-prefixed variables to the bundle, and everything
 * here is public by definition - never read a secret through this object.
 */
const env = {
	EVENT_MANAGEMENT_BASE_URL: import.meta.env
		.VITE_EVENT_MANAGEMENT_BACKEND_BASEURL,

	EVENT_MANAGEMENT_API_SERVER_TIMEOUT: import.meta.env
		.VITE_EVENT_MANAGEMENT_API_SERVER_TIMEOUT,

	/**
	 * Socket.IO server for real-time notifications. Falls back to the REST API
	 * host with any /api or /api/v1 suffix stripped.
	 */
	SOCKET_URL:
		import.meta.env.VITE_SOCKET_URL ||
		(import.meta.env.VITE_EVENT_MANAGEMENT_BACKEND_BASEURL || "").replace(
			/\/api(\/v\d+)?\/?$/,
			"",
		),

	/**
	 * The AI chat service. Transcripts live in its own database, so the
	 * admin reads them from there rather than through the main API.
	 */
	CHAT_SERVICE_BASE_URL:
		import.meta.env.VITE_CHAT_SERVICE_BASEURL || "http://localhost:4080/api",

	FEATURE_FLAG_CONFIG: featureFlagConfig,
};

export default env;
