import {AxiosInstance} from "axios";

import {APIResponse, iPaginatedResult} from "@/customTypes/NetworkTypes";
import NetworkUtil from "@/utils/NetworkUtil";
import {apiEndpoints} from "./axiosConfig/AxiosServiceConstants";

/** Money owed and money received, for the dashboard. */
export interface iMoneySummary {
	totalBooked: string;
	totalReceived: string;
	totalOutstanding: string;
	overdueCount: number;
	overdueAmount: string;
	upcomingCount: number;
	windowFrom: string;
	windowTo: string;
}

/** One customer, rolled up from their bookings. */
export interface iCustomerSummary {
	name: string;
	phoneNumber: string | null;
	email: string | null;
	bookingCount: number;
	firstBookingAt: string;
	lastBookingAt: string;
	totalBooked: string;
	totalPaid: string;
	totalDue: string;
}

/** One entry in the audit trail. */
export interface iActivityEntry {
	id: string;
	actorId: string;
	actorName: string | null;
	action: string;
	entityType: string;
	entityId: string | null;
	summary: string | null;
	createdAt: string;
}

/**
 * Reads that cut across bookings.
 *
 * The dashboard could show how many bookings there were but not what they
 * were worth, there was no way to see whether a customer had booked before,
 * and nothing recorded who changed what.
 */
function InsightService(apiServer: AxiosInstance) {
	// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
	const get = async <T>(url: string, params?: Record<string, unknown>) => {
		let result: APIResponse<T> | null = null;

		await apiServer
			.get(url, {params})
			.then(
				(value) => {
					result = NetworkUtil.buildResult<T>(
						value.data,
						value.status,
						null,
						null,
					);
				},
				(reason) => {
					const {response} = reason;
					const {status, data} = response ?? {status: 0, data: null};

					/**
					 * The error envelope carries no payload, so this is the one
					 * place the generic has to be widened rather than fought.
					 */
					result = NetworkUtil.buildResult(
						data,
						status,
						data,
						null,
					) as APIResponse<T>;
				},
			)
			.catch((error) => {
				throw error;
			});

		return result;
	};

	const getMoneySummary = async (params?: {
		fromDate?: string;
		toDate?: string;
	}): Promise<APIResponse<iMoneySummary> | null> => {
		return get<iMoneySummary>(apiEndpoints.insights.money(), params);
	};

	const getCustomers = async (params?: {
		page?: number;
		limit?: number;
		search?: string;
	}): Promise<APIResponse<iPaginatedResult<iCustomerSummary>> | null> => {
		return get<iPaginatedResult<iCustomerSummary>>(
			apiEndpoints.insights.customers(),
			params,
		);
	};

	const getActivity = async (params?: {
		page?: number;
		limit?: number;
	}): Promise<APIResponse<iPaginatedResult<iActivityEntry>> | null> => {
		return get<iPaginatedResult<iActivityEntry>>(
			apiEndpoints.insights.activity(),
			params,
		);
	};

	return {getMoneySummary, getCustomers, getActivity};
}

export default InsightService;
