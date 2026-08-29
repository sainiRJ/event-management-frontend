export interface iUserProfile {
	id: string;
	name: string;
	email: string;
	phoneNumber?: string | null;
	photoUrl?: string | null;
	role?: string;
	createdAt?: string;
}

export interface iUpdateProfileDTO {
	name?: string;
	email?: string;
	phoneNumber?: string;
}

export interface iChangePasswordDTO {
	currentPassword: string;
	newPassword: string;
}
