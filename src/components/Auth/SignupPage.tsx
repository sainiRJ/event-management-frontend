import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {GOOGLE_AUTH_URL} from "../../config/oauth";
import "./Auth.css";

const SignupPage: React.FC = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: "",
	});
	const [error, setError] = useState("");

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

		if (formData.password !== formData.confirmPassword) {
			setError("Passwords do not match");
			return;
		}

		try {
			const response = await fetch("/api/auth/signup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: formData.name,
					email: formData.email,
					phone: formData.phone,
					password: formData.password,
				}),
			});

			if (!response.ok) {
				throw new Error("Signup failed");
			}

			const data = await response.json();
			localStorage.setItem("token", data.token);
			navigate("/dashboard");
		} catch (err: any) {
			setError(err.message);
		}
	};

	const handleGoogleSignUp = () => {
		window.location.href = GOOGLE_AUTH_URL;
	};

	return (
		<div className="auth-container">
			<div className="auth-box">
				<h2>Sign Up</h2>
				{error && <div className="error-message">{error}</div>}

				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label>Full Name</label>
						<input
							type="text"
							name="name"
							value={formData.name}
							onChange={handleInputChange}
							placeholder="Enter your full name"
							required
						/>
					</div>

					<div className="form-group">
						<label>Email</label>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleInputChange}
							placeholder="Enter your email"
							required
						/>
					</div>

					<div className="form-group">
						<label>Phone Number</label>
						<input
							type="tel"
							name="phone"
							value={formData.phone}
							onChange={handleInputChange}
							placeholder="Enter your phone number"
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

					<div className="form-group">
						<label>Confirm Password</label>
						<input
							type="password"
							name="confirmPassword"
							value={formData.confirmPassword}
							onChange={handleInputChange}
							placeholder="Confirm your password"
							required
						/>
					</div>

					<button type="submit" className="submit-btn">
						Sign Up
					</button>
				</form>

				<div className="divider">
					<span>OR</span>
				</div>

				<button 
					className="google-btn"
					onClick={handleGoogleSignUp}
				>
					<img src="/google-icon.svg" alt="Google" />
					Continue with Google
				</button>

				<p className="auth-link">
					Already have an account? <a href="/login">Login</a>
				</p>
			</div>
		</div>
	);
};

export default SignupPage;
