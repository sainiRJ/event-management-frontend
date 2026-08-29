import {useEffect, useState} from "react";
import {useLocation} from "react-router-dom";

import {hasValidSession} from "@/utils/tokenUtils";

/**
 * Whether someone is signed in, re-evaluated on navigation and on the
 * `auth-changed` event that login and logout dispatch.
 *
 * App used to read `localStorage.getItem("access_token")` during render with
 * nothing subscribed to it, so the sidebar and header did not appear until
 * the page was manually reloaded.
 */
export const AUTH_CHANGED_EVENT = "auth-changed";

export function notifyAuthChanged(): void {
	window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function useSession(): boolean {
	const location = useLocation();
	const [isAuthenticated, setIsAuthenticated] = useState(hasValidSession());

	useEffect(() => {
		const sync = () => {
			setIsAuthenticated(hasValidSession());
		};

		sync();

		window.addEventListener(AUTH_CHANGED_EVENT, sync);
		// Keeps other tabs in step when one of them logs out.
		window.addEventListener("storage", sync);

		return () => {
			window.removeEventListener(AUTH_CHANGED_EVENT, sync);
			window.removeEventListener("storage", sync);
		};
	}, [location.pathname]);

	return isAuthenticated;
}
