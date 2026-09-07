export interface iService {
	/** URL on the customer site: /services/<slug> */
	slug?: string | null;
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
