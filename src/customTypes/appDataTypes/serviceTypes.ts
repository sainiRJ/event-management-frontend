export interface iService {
	id: string;
	serviceName: string;
	description?: string | null;
	price: string;
	available: boolean;
}

export interface iCreateServiceDTO {
	id?: string;
	serviceName: string;
	description?: string | null;
	price: string;
	available: boolean;
}
