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
	stats: iEmployeeStatsResponse | null;
	assignedServices: iEmployeeAssignedServices[] | null;
	serviceHistory: iEmployeeServiceHistory | null;
}

export interface iServiceStat {
	serviceId: string;
	serviceName: string;
	count: number;
	totalAmount: number;
	paidAmount: number;
	remainingAmount: number;
}

export interface iEmployeeStat {
	employeeId: string;
	name: string;
	statusId: string;
	status: string;
	totalServices: number;
	totalAmount: number;
	totalPaid: number;
	totalRemaining: number;
	extraAmount: number;
	serviceStats: iServiceStat[];
}

export interface iEmployeeStatsResponse {
	employeeStats: Record<string, iEmployeeStat>;
	ids: string[];
}

export interface iEmployeePaymentUpdate {
	employeeId: string;
	amount: number;
	paidAt?: string;
	autoPaid?: boolean;
	assignedEmployeeIds?: string[];
}

export interface iAssignedService {
	assignedEmployeeId: string;
	serviceId: string;
	serviceName: string;
	amount: number;
	eventDate: Date;
	customerName: string;
	location: string;
	eventName: string;
	isPaid: boolean;
	paidAt: string | null;
}

export interface iEmployeeAssignedServices {
	employeeId: string;
	employeeName: string;
	assignedServices: iAssignedService[];
}

export interface iAssignedServicesResponse {
	success: boolean;
	data: iEmployeeAssignedServices[];
}

export interface iEmployeeServiceHistory {
	employeeId: string;
	employeeName: string;
	assignedServices: iAssignedService[];
	extraAmount?: number;
}

export interface iEmployeeServiceHistoryResponse {
	success: boolean;
	data: iEmployeeServiceHistory;
}
