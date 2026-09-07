import React, {ReactNode} from "react";
import {Navigate, useLocation} from "react-router-dom";
import {getCurrentUserRole, hasValidSession} from "@/utils/tokenUtils";

interface iAuthGuardProps {
	children: ReactNode;
	requireAuth: boolean;
	/**
	 * Roles allowed on this screen. A signed-in user with another role is
	 * sent to Today rather than shown an empty page. Omit to allow any role.
	 */
	roles?: string[];
}

/**
 * Route guard.
 *
 * Checks that the access token is present AND unexpired - the presence of any
 * string under `access_token` is not a session. This is a UX guard only; the
 * backend enforces authentication and roles on every request.
 */
const AuthGuard: React.FC<iAuthGuardProps> = ({
	children,
	requireAuth,
	roles,
}) => {
	const location = useLocation();
	const isAuthenticated = hasValidSession();

	if (requireAuth && !isAuthenticated) {
		return <Navigate to="/login" replace state={{from: location}} />;
	}

	if (!requireAuth && isAuthenticated) {
		return <Navigate to="/" replace />;
	}

	if (requireAuth && roles) {
		const role = getCurrentUserRole();
		if (!role || !roles.includes(role)) {
			return <Navigate to="/today" replace />;
		}
	}

	return <>{children}</>;
};

export default AuthGuard;
