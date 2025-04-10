import featureFlagConfig from "./featureFlagConfig";

/**
 * Environment variables used in the application
 */
const env = {
	EVENT_MANAGEMENT_BASE_URL:
		process.env.REACT_APP_EVENT_MANAGEMENT_BACKEND_BASEURL,
	EVENT_MANAGEMENT_API_SERVER_TIMEOUT:
		process.env.EVENT_MANAGEMENT_API_SERVER_TIMEOUT,

	FEATURE_FLAG_CONFIG: featureFlagConfig,
};

export default env;
