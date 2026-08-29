import {apiResponseStatuses} from "@/customTypes/NetworkTypes";

export const REDUCER_NAME = "auth";

export interface iToken {
	accessToken: string;
	refreshToken: string;
}

export interface iUserResponse {
	id: string;
	name: string;
	email: string;
}

export interface iAuthResponse {
	error: null | string;
	data: {
		userResponse: iUserResponse;
		token: iToken;
	};
}

export interface iAuthState {
	isLoading: boolean;
	responseStatus: apiResponseStatuses;
	httpStatusCode: number | null;
	token: iToken | null;
	user: iUserResponse | null;
	message: string | null;
}

/**
 * What the browser sends for Google sign-in: the authorization code only.
 *
 * The backend exchanges it with Google (using the client secret it holds) and
 * reads the identity from the verified ID token, so no profile fields are
 * sent from here - a client-supplied email could not be trusted.
 */
export interface iGoogleAuthRequest {
	code: string;
}

export interface iLoginCredentials {
	emailOrPhone: string;
	password: string;
}
