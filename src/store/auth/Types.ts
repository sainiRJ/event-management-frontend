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

export interface iGoogleUserData {
	id: string;
	email: string;
	verified_email: boolean;
	name: string;
	given_name: string;
	family_name: string;
	picture: string;
	locale: string;
}

export interface iLoginCredentials {
	emailOrPhone: string;
	password: string;
}
