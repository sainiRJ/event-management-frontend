import React, {ReactNode} from "react";
import {Navigate} from "react-router-dom";

interface AuthGuardProps {
	children: ReactNode;
	requireAuth: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({children, requireAuth}) => {
	const token = localStorage.getItem("auth_token");

	if (requireAuth && !token) return <Navigate to="/login" replace />;
	if (!requireAuth && token) return <Navigate to="/dashboard" replace />;

	return <>{children}</>;
};

export default AuthGuard;
