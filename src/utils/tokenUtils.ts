import Cookies from "js-cookie";

interface DecodedToken {
	exp: number;
	id: string;
	email: string;
	iat: number;
}

const decodeToken = (token: string): DecodedToken | null => {
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		return payload as DecodedToken;
	} catch (error) {
		console.error("Error decoding token:", error);
		return null;
	}
};

export const isAccessTokenExpired = (token: string): boolean => {
	try {
		const decodedToken = decodeToken(token);
		if (!decodedToken) return true;
		return Date.now() >= decodedToken.exp * 1000;
	} catch (error) {
		console.error("Error checking access token expiration:", error);
		return true;
	}
};

export const isRefreshTokenExpired = (): boolean => {
	const refreshToken = Cookies.get("refresh_token");
	if (!refreshToken) {
		console.log("No refresh token found in cookies");
		return true;
	}

	try {
		const decodedToken = decodeToken(refreshToken);
		if (!decodedToken) return true;
		return Date.now() >= decodedToken.exp * 1000;
	} catch (error) {
		console.error("Error checking refresh token expiration:", error);
		return true;
	}
};

export const refreshAccessToken = async (): Promise<string | null> => {
	try {
		const response = await fetch(
			"http://localhost:3080/api/auth/refresh-token",
			{
				method: "POST",
				credentials: "include", // This is important to send cookies
			},
		);

		if (!response.ok) {
			throw new Error("Failed to refresh token");
		}

		const data = await response.json();
		if (data.data?.accessToken) {
			localStorage.setItem("access_token", data.data.accessToken);
			console.log("Access token refreshed successfully");
			return data.data.accessToken;
		}
		console.log("No access token in refresh response");
		return null;
	} catch (error) {
		console.error("Error refreshing token:", error);
		return null;
	}
};

export const getAccessToken = (): string | null => {
	const token = localStorage.getItem("access_token");
	console.log(
		"Retrieved access token from localStorage:",
		token ? "Token exists" : "No token found",
	);
	return token;
};

export const clearTokens = () => {
	localStorage.removeItem("access_token");
	Cookies.remove("refresh_token");
	console.log("Tokens cleared from storage");
};
