import featureFlagConfig from "./featureFlagConfig";

/**
 * Environment variables used in the application
 */
const env = {
	EVENT_MANAGEMENT_BASE_URL:
		process.env.REACT_APP_EVENT_MANAGEMENT_BACKEND_BASEURL,
	EVENT_MANAGEMENT_API_SERVER_TIMEOUT:
		process.env.EVENT_MANAGEMENT_API_SERVER_TIMEOUT,
	// Socket.IO server URL for real-time notifications. Falls back to the
	// REST API host (stripping any /api/v1-style path) if not explicitly set.
	SOCKET_URL:
		process.env.REACT_APP_SOCKET_URL ||
		(process.env.REACT_APP_EVENT_MANAGEMENT_BACKEND_BASEURL || "").replace(
			/\/api(\/v\d+)?\/?$/,
			"",
		),

	FEATURE_FLAG_CONFIG: featureFlagConfig,
};

export default env;
