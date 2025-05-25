export interface iCreateEmployeeDTO {
	id?: string;
	name: string;
	email: string;
	phoneNumber: string;
	designation: string;
	statusId: string;
	joinedDate: Date | string;
}

export interface iEmployeeResponse {
	employeeDetails: Record<string, iCreateEmployeeDTO>;
}

export interface iEmployeeState {
	employeeList: iCreateEmployeeDTO[];
	loading: boolean;
	error: string | null;
}
