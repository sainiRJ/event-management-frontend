import {useCallback, useEffect, useState} from "react";
import {useLocation} from "react-router-dom";

import {operationsService} from "@/services/api/eventManagementServer";
import {httpStatusCodes} from "@/customTypes/NetworkTypes";

export interface iPendingCounts {
	bookingRequests: number;
	contactMessages: number;
}

/**
 * Counts for the navigation badges: booking requests and website enquiries
 * still waiting on the vendor.
 *
 * Refreshed on navigation rather than on a timer — the vendor is looking at
 * the screen when they move around it, and a background poll on a shop
 * laptop is wasted work.
 */
export function usePendingCounts(isAuthenticated: boolean): iPendingCounts {
	const location = useLocation();
	const [counts, setCounts] = useState<iPendingCounts>({
		bookingRequests: 0,
		contactMessages: 0,
	});

	const load = useCallback(async () => {
		if (!isAuthenticated) {
			setCounts({bookingRequests: 0, contactMessages: 0});
			return;
		}

		const [requests, messages] = await Promise.all([
			operationsService.countBookingRequests(),
			operationsService.countUnreadMessages(),
		]);

		setCounts({
			bookingRequests:
				requests?.httpStatusCode === httpStatusCodes.SUCCESS_OK
					? requests.data?.data?.count ?? 0
					: 0,
			contactMessages:
				messages?.httpStatusCode === httpStatusCodes.SUCCESS_OK
					? messages.data?.data?.count ?? 0
					: 0,
		});
	}, [isAuthenticated]);

	useEffect(() => {
		load();
	}, [load, location.pathname]);

	return counts;
}
