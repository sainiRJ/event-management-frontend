import React, {ReactNode} from "react";
import {Navigate, useLocation} from "react-router-dom";
import {hasValidSession} from "@/utils/tokenUtils";

interface iAuthGuardProps {
	children: ReactNode;
	requireAuth: boolean;
}

/**
 * Route guard.
 *
 * Checks that the access token is present AND unexpired - the presence of any
 * string under `access_token` is not a session. This is a UX guard only; the
 * backend enforces authentication and roles on every request.
 */
const AuthGuard: React.FC<iAuthGuardProps> = ({children, requireAuth}) => {
	const location = useLocation();
	const isAuthenticated = hasValidSession();

	if (requireAuth && !isAuthenticated) {
		return <Navigate to="/login" replace state={{from: location}} />;
	}

	if (!requireAuth && isAuthenticated) {
		return <Navigate to="/" replace />;
	}

	return <>{children}</>;
};

export default AuthGuard;
