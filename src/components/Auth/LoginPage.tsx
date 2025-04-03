import React, {useState} from "react";
import {useAppDispatch, useAppSelector} from "../../store/Hooks";
import {useNavigate} from "react-router-dom";
import {GOOGLE_AUTH_URL} from "../../config/oauth";
import {login} from "@/store/auth/ThunkActions";
import "./Auth.css";
import Cookies from "js-cookie";
import {Message, toaster} from "rsuite";

const LoginPage: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const [formData, setFormData] = useState({
		emailOrPhone: "",
		password: "",
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

		try {
			const response = await dispatch(login(formData));
			console.log("response", response);
			toaster.push(<Message type="success">Login successfully</Message>);
			navigate("/booking");
		} catch (err: any) {
			setError(err.message);
			toaster.push(<Message type="error">Failed to Login </Message>);
		}
	};

	const handleGoogleSignIn = () => {
		window.location.href = GOOGLE_AUTH_URL;
	};

	return (
		<div className="auth-container">
			<div className="auth-box">
				<div className="auth-header">
					<h2>Welcome Back!</h2>
					<p>Please sign in to continue</p>
				</div>

				{error && <div className="error-message">{error}</div>}

				<form onSubmit={handleSubmit} className="auth-form">
					<div className="form-group">
						<label>Email or Phone Number</label>
						<div className="input-container">
							<i className="fas fa-user input-icon"></i>
							<input
								type="text"
								name="emailOrPhone"
								value={formData.emailOrPhone}
								onChange={handleInputChange}
								placeholder="Enter your email or phone number"
								required
							/>
						</div>
					</div>

					<div className="form-group">
						<label>Password</label>
						<div className="input-container">
							<i className="fas fa-lock input-icon"></i>
							<input
								type="password"
								name="password"
								value={formData.password}
								onChange={handleInputChange}
								placeholder="Enter your password"
								required
							/>
						</div>
					</div>

					<div className="forgot-password">
						<a href="/forgot-password">Forgot Password?</a>
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
