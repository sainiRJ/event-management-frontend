import React, {useEffect, useRef, useState} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import {handleGoogleCallback} from "../../store/auth/ThunkActions";
import {useAppDispatch} from "../../store/Hooks";

/**
 * Google OAuth redirect landing page.
 *
 * The authorization code is handed straight to the backend, which exchanges
 * it with Google using the client secret and verifies the resulting ID token.
 * The browser never sees the client secret and never asserts an identity of
 * its own - it only relays the code.
 */
const OAuthCallback: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useAppDispatch();
	const [error, setError] = useState<string | null>(null);

	// React 18 StrictMode mounts effects twice in development; an OAuth code is
	// single-use, so the second exchange would always fail.
	const hasExchanged = useRef(false);

	useEffect(() => {
		if (hasExchanged.current) {
			return;
		}
		hasExchanged.current = true;

		const handleCallback = async () => {
			const searchParams = new URLSearchParams(location.search);
			const code = searchParams.get("code");
			const oauthError = searchParams.get("error");

			if (oauthError) {
				setError("Google sign-in was cancelled. Please try again.");
				return;
			}

			if (!code) {
				setError("Authorization code not found. Please start sign-in again.");
				return;
			}

			const result = await dispatch(handleGoogleCallback({code}));

			if (handleGoogleCallback.fulfilled.match(result)) {
				navigate("/", {replace: true});
				return;
			}

			setError("We couldn't sign you in with Google. Please try again.");
		};

		handleCallback();
	}, [location.search, navigate, dispatch]);

	if (error) {
		return (
			<div className="auth-container">
				<div className="auth-box">
					<h2>Authentication Error</h2>
					<p className="error-message">{error}</p>
					<button
						className="submit-btn"
						onClick={() => navigate("/login", {replace: true})}
					>
						Back to Login
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="auth-container">
			<div className="auth-box">
				<h2>Signing you in...</h2>
				<div className="loading-spinner"></div>
			</div>
		</div>
	);
};

export default OAuthCallback;
