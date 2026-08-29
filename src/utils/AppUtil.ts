/**
 * Returns whether the app is currently running on the "development"
 * environment or not.
 *
 * @returns isDev
 */
function isDev(): boolean {
	return import.meta.env.DEV;
}

const AppUtil = {
	isDev,
};

export default AppUtil;
