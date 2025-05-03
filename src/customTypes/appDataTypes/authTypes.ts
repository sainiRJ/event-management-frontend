export interface iLoginDTO {
	emailOrPhone: string;
	password: string;
}

interface iUserResponse {
	id: string;
	name: string;
	email: string;
}

export interface iToken {
	accessToken: string;
	refreshToken: string;
	tokenExpireDate: string;
}

export interface iLoginResponse {
	userResponse: iUserResponse;
	token: iToken;
}

export interface iSignupDTO {
	name: string;
	email: string;
	phoneNumber: string;
	password: string;
}
