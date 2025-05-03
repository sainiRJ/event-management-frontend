import {
	appFeatureFlagStatusType,
	appFeatureTypes,
} from "../customTypes/GenericAppTypes";

const featureFlagByProjectConfig: appFeatureFlagStatusType = {
	[appFeatureTypes.BUG_TRACKING]: {
		projects: {},
	},
};

const featureFlagConfig = {
	featureFlagByProjectConfig,
};

export default featureFlagConfig;
