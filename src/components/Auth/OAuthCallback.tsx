import React, {useEffect, useState} from "react";
import {useNavigate, useLocation} from "react-router-dom";

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

			try {
				const response = await fetch("/api/auth/google/callback", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({code}),
				});

				if (!response.ok) {
					throw new Error("Failed to authenticate");
				}

				const data = await response.json();
				localStorage.setItem("token", data.token);
				navigate("/dashboard");
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
