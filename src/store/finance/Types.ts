// src/store/finance/Types.ts

import {NullableNumber, NullableString} from "@/customTypes/CommonTypes";
import {
	apiResponseStatuses,
	iAPIRequestStatus,
} from "@/customTypes/NetworkTypes";

export const REDUCER_NAME = "financeSlice";

// Define types for the finance data based on your API response
export interface ServiceFinanceData {
	serviceId: string;
	serviceName: string;
	totalCost: number; // Assuming totalCost represents revenue for the service
	advancePayment: number;
}

export interface FinanceData {
	totalIncome: number;
	totalAdvance: number;
	serviceWiseData: ServiceFinanceData[];
}

export interface FetchFinanceParams {
	fromDate?: string;
	toDate?: string;
	bookingStatusId?: string;
	paymentStatusId?: string;
	serviceId?: string;
}

export interface FinanceState {
	isLoading: boolean;
	httpStatusCode: NullableNumber;
	message: NullableString;
	responseStatus: apiResponseStatuses;
	data: FinanceData | null;
}
