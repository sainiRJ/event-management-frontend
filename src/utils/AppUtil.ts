import config from "@/config";
import {
	appFeatureFlagStatusType,
	appFeatureTypes,
} from "@/customTypes/GenericAppTypes";

/**
 * Returns whether the app is currently running on the "development"
 * environment or not.
 *
 * @returns isDev
 */
function isDev(): boolean {
	return process.env.NODE_ENV === "development";
}

/**
 * Checks if a specific feature is enabled for a given project.
 *
 * @param feature - The feature to check.
 * @param projectId - The ID of the project.
 * @returns A boolean indicating whether the feature is enabled for the project.
 */
function isFeatureEnabledForProject(
	feature: appFeatureTypes,
	projectId: string,
	featureFlagsByProject: appFeatureFlagStatusType = config.FEATURE_FLAG_CONFIG
		.featureFlagByProjectConfig,
): boolean {
	let isEnabled = false;

	const featureFlagStatus = featureFlagsByProject[feature];
	if (featureFlagStatus) {
		const isEnabledForProject = featureFlagStatus.projects[projectId] || false;
		if (isEnabledForProject !== undefined && isEnabledForProject !== null) {
			isEnabled = isEnabledForProject;
		}
	}

	return isEnabled;
}

const AppUtil = {
	isDev,
	isFeatureEnabledForProject,
};

export default AppUtil;
