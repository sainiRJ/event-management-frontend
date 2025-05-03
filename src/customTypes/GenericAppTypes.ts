export enum appFeatureTypes {
	BUG_TRACKING = "BUG_TRACKING",
}

export type appFeatureFlagStatusType = {
	[key in appFeatureTypes]: {
		projects: {
			[key: string]: boolean;
		};
	};
};
