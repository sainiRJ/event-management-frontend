import {authService} from "@/services/api/eventManagementServer";
import {httpStatusCodes} from "@/customTypes/NetworkTypes";

/**
 * Token handling.
 *
 * The refresh token is an httpOnly cookie set by the backend, so this file
 * deliberately cannot read it. The only way to learn whether a session is
 * still valid is to call the refresh endpoint and look at the result.
 */

interface iDecodedToken {
	exp: number;
	id: string;
	email: string;
	role?: string;
	iat: number;
}

const ACCESS_TOKEN_KEY = "access_token";

const decodeToken = (token: string): iDecodedToken | null => {
	try {
		return JSON.parse(atob(token.split(".")[1])) as iDecodedToken;
	} catch {
		return null;
	}
};

export const getAccessToken = (): string | null => {
	return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const setAccessToken = (token: string): void => {
	localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const isAccessTokenExpired = (token: string): boolean => {
	const decoded = decodeToken(token);

	if (!decoded?.exp) {
		return true;
	}

	// 30-second buffer for clock skew and time in transit.
	return Date.now() + 30 * 1000 >= decoded.exp * 1000;
};

/**
 * True when a present, unexpired access token exists. Use this for route
 * guards rather than checking that any string is stored.
 */
export const hasValidSession = (): boolean => {
	const token = getAccessToken();
	return Boolean(token) && !isAccessTokenExpired(token as string);
};

export const getCurrentUserRole = (): string | null => {
	const token = getAccessToken();
	return token ? decodeToken(token)?.role ?? null : null;
};

export const clearTokens = (): void => {
	localStorage.removeItem(ACCESS_TOKEN_KEY);
	// The refresh cookie is httpOnly; only the server can clear it.
	void authService.logout();
};

let refreshPromise: Promise<string | null> | null = null;

/**
 * Exchanges the httpOnly refresh cookie for a new access token.
 *
 * De-duplicated, which matters because the backend rotates the refresh token
 * on every use - two concurrent refreshes would invalidate each other.
 */
export const refreshAccessToken = async (): Promise<string | null> => {
	if (refreshPromise) {
		return refreshPromise;
	}

	refreshPromise = (async () => {
		try {
			const response = await authService.refreshToken();

			if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
				const accessToken = response.data?.data?.accessToken;

				if (accessToken) {
					setAccessToken(accessToken);
					return accessToken;
				}
			}

			return null;
		} catch {
			return null;
		} finally {
			refreshPromise = null;
		}
	})();

	return refreshPromise;
};

/**
 * Returns a usable access token, refreshing first when the current one has
 * expired. Returns null when the session is over.
 */
export const validateAndRefreshToken = async (): Promise<string | null> => {
	const token = getAccessToken();

	if (!token) {
		return null;
	}

	if (!isAccessTokenExpired(token)) {
		return token;
	}

	const refreshed = await refreshAccessToken();

	if (!refreshed) {
		localStorage.removeItem(ACCESS_TOKEN_KEY);
		return null;
	}

	return refreshed;
};
