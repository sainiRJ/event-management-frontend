export interface iCreateEmployeeDTO {
	id?: string;
	name: string;
	email: string;
	designation: string;
	salary: number;
	status: string;
	joinedDate: Date | string;
}

export interface iEmployeeState {
	employeeList: iCreateEmployeeDTO[];
	loading: boolean;
	error: string | null;
} 