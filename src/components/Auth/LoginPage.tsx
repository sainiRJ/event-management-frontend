import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {GOOGLE_AUTH_URL} from "../../config/oauth";
import "./Auth.css";

const LoginPage: React.FC = () => {
	const navigate = useNavigate();
	const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
	const [formData, setFormData] = useState({
		emailOrPhone: "",
		password: "",
	});
	const [error, setError] = useState("");
	console.log("GOOGLE_AUTH_URL", GOOGLE_AUTH_URL);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const {name, value} = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");

		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					emailOrPhone: formData.emailOrPhone,
					password: formData.password,
				}),
			});

			if (!response.ok) {
				throw new Error("Login failed");
			}

			const data = await response.json();
			localStorage.setItem("token", data.token);
			navigate("/dashboard");
		} catch (err: any) {
			setError(err.message);
		}
	};

	const handleGoogleSignIn = () => {
		window.location.href = GOOGLE_AUTH_URL;
	};

	return (
		<div className="auth-container">
			<div className="auth-box">
				<h2>Login</h2>
				{error && <div className="error-message">{error}</div>}

				<div className="login-method-toggle">
					<button
						className={loginMethod === "email" ? "active" : ""}
						onClick={() => setLoginMethod("email")}
					>
						Email
					</button>
					<button
						className={loginMethod === "phone" ? "active" : ""}
						onClick={() => setLoginMethod("phone")}
					>
						Phone
					</button>
				</div>

				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label>{loginMethod === "email" ? "Email" : "Phone Number"}</label>
						<input
							type={loginMethod === "email" ? "email" : "tel"}
							name="emailOrPhone"
							value={formData.emailOrPhone}
							onChange={handleInputChange}
							placeholder={
								loginMethod === "email"
									? "Enter your email"
									: "Enter your phone number"
							}
							required
						/>
					</div>

					<div className="form-group">
						<label>Password</label>
						<input
							type="password"
							name="password"
							value={formData.password}
							onChange={handleInputChange}
							placeholder="Enter your password"
							required
						/>
					</div>

					<button type="submit" className="submit-btn">
						Login
					</button>
				</form>

				<div className="divider">
					<span>OR</span>
				</div>

				<button className="google-btn" onClick={handleGoogleSignIn}>
					<img src="/google-icon.svg" alt="Google" />
					Continue with Google
				</button>

				<p className="auth-link">
					{"Don't have an account?"} <a href="/signup">Sign up</a>
				</p>
			</div>
		</div>
	);
};

export default LoginPage;
