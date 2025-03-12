import React, {useEffect, useState} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import {
	GOOGLE_CLIENT_SECRET,
	GOOGLE_CLIENT_ID,
	OAUTH_REDIRECT_URI,
} from "../../config/oauth";

const OAuthCallback: React.FC = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const handleCallback = async () => {
			const searchParams = new URLSearchParams(location.search);
			const code = searchParams.get("code");

			if (!code) {
				setError("Authorization code not found");
				return;
			}

			console.log(code);

			try {
				const tokenResponse = await fetch(
					"https://oauth2.googleapis.com/token",
					{
						method: "POST",
						headers: {"Content-Type": "application/x-www-form-urlencoded"},
						body: new URLSearchParams({
							code: code,
							client_id:
								GOOGLE_CLIENT_ID ||
								"721675851182-8b5l16vm2qjrcnb3uj1fpv6niqg8va6i.apps.googleusercontent.com",
							client_secret:
								GOOGLE_CLIENT_SECRET || "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",
							redirect_uri:
								OAUTH_REDIRECT_URI || "http://localhost:3000/auth/callback",
							grant_type: "authorization_code",
						}),
					},
				);

				console.log("tokenResponse", tokenResponse);

				// Fetch user info from Google
				const tokenData: any = await tokenResponse.json();
				const userInfoResponse = await fetch(
					"https://www.googleapis.com/oauth2/v2/userinfo",
					{
						headers: {Authorization: `Bearer ${tokenData.access_token}`},
					},
				);

				const userData = await userInfoResponse.json();

				const response = await fetch(
					"http://localhost:3080/api/auth/google/callback",
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(userData),
					},
				);

				console.log("response", response);

				if (!response.ok) {
					throw new Error("Failed to authenticate");
				}

				const data = await response.json();
				localStorage.setItem("auth_token", data.data.token);
				navigate("/booking");
			} catch (err: any) {
				setError(err.message);
			}
		};

		handleCallback();
	}, [location, navigate]);

	if (error) {
		return (
			<div className="auth-container">
				<div className="auth-box">
					<h2>Authentication Error</h2>
					<p className="error-message">{error}</p>
					<button className="submit-btn" onClick={() => navigate("/login")}>
						Back to Login
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="auth-container">
			<div className="auth-box">
				<h2>Authenticating...</h2>
				<div className="loading-spinner"></div>
			</div>
		</div>
	);
};

export default OAuthCallback;
