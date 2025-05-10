// import React, {useState} from "react";
// import {useAppDispatch, useAppSelector} from "../../store/Hooks";
// import {useNavigate} from "react-router-dom";
// import {GOOGLE_AUTH_URL} from "../../config/oauth";
// import {login} from "@/store/auth/ThunkActions";
// import "./Auth.css";
// import Cookies from "js-cookie";
// import {Message, toaster} from "rsuite";

// const LoginPage: React.FC = () => {
// 	const navigate = useNavigate();
// 	const dispatch = useAppDispatch();
// 	const [formData, setFormData] = useState({
// 		emailOrPhone: "",
// 		password: "",
// 	});
// 	const [error, setError] = useState("");

// 	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// 		const {name, value} = e.target;
// 		setFormData((prev) => ({
// 			...prev,
// 			[name]: value,
// 		}));
// 	};

// 	const handleSubmit = async (e: React.FormEvent) => {
// 		e.preventDefault();
// 		setError("");

// 		try {
// 			const response = await dispatch(login(formData));
// 			console.log("response", response);
// 			toaster.push(<Message type="success">Login successfully</Message>);
// 			navigate("/booking");
// 		} catch (err: any) {
// 			setError(err.message);
// 			toaster.push(<Message type="error">Failed to Login </Message>);
// 		}
// 	};

// 	const handleGoogleSignIn = () => {
// 		window.location.href = GOOGLE_AUTH_URL;
// 	};

// 	return (
// 		<div className="auth-container">
// 			<div className="auth-box">
// 				<div className="auth-header">
// 					<h2>Welcome Back!</h2>
// 					<p>Please sign in to continue</p>
// 				</div>

// 				{error && <div className="error-message">{error}</div>}

// 				<form onSubmit={handleSubmit} className="auth-form">
// 					<div className="form-group">
// 						<label>Email or Phone Number</label>
// 						<div className="input-container">
// 							<i className="fas fa-user input-icon"></i>
// 							<input
// 								type="text"
// 								name="emailOrPhone"
// 								value={formData.emailOrPhone}
// 								onChange={handleInputChange}
// 								placeholder="Enter your email or phone number"
// 								required
// 							/>
// 						</div>
// 					</div>

// 					<div className="form-group">
// 						<label>Password</label>
// 						<div className="input-container">
// 							<i className="fas fa-lock input-icon"></i>
// 							<input
// 								type="password"
// 								name="password"
// 								value={formData.password}
// 								onChange={handleInputChange}
// 								placeholder="Enter your password"
// 								required
// 							/>
// 						</div>
// 					</div>

// 					<div className="forgot-password">
// 						<a href="/forgot-password">Forgot Password?</a>
// 					</div>

// 					<button type="submit" className="submit-btn">
// 						Login
// 					</button>
// 				</form>

// 				<div className="divider">
// 					<span>OR</span>
// 				</div>

// 				<button className="google-btn" onClick={handleGoogleSignIn}>
// 					<img src="/google-icon.svg" alt="Google" />
// 					Continue with Google
// 				</button>

// 				<p className="auth-link">
// 					{"Don't have an account?"} <a href="/signup">Sign up</a>
// 				</p>
// 			</div>
// 		</div>
// 	);
// };

// export default LoginPage;


// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { login } from "../../store/auth/ThunkActions";
// import { RootState } from "../../store/RootReducer";
// import { iLoginCredentials } from "../../store/auth/Types";
// import { useAppDispatch } from "../../store/Hooks";

// const Login: React.FC = () => {
// 	const navigate = useNavigate();
// 	const dispatch = useAppDispatch();
// 	const { isLoading, message } = useSelector((state: RootState) => state.authReducer);

// 	const [formData, setFormData] = useState<iLoginCredentials>({
// 		emailOrPhone: "",
// 		password: "",
// 	});

// 	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// 		const { name, value } = e.target;
// 		setFormData((prev) => ({
// 			...prev,
// 			[name]: value,
// 		}));
// 	};

// 	const handleSubmit = async (e: React.FormEvent) => {
// 		e.preventDefault();
// 		try {
// 			await dispatch(login(formData));
// 			navigate("/booking");
// 		} catch (error) {
// 			console.error("Login failed:", error);
// 		}
// 	};

// 	const handleGoogleLogin = () => {
// 		window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_OAUTH_REDIRECT_URI}&response_type=code&scope=email profile`;
// 	};

// 	return (
// 		<div className="login-wrapper">
// 			<div className="background-circles"></div>
// 			<div className="login-box">
// 				<h2 className="title">Login Here</h2>
// 				{message && <p className="error">{message}</p>}
// 				<form onSubmit={handleSubmit}>
// 					<label>Username</label>
// 					<input
// 						type="text"
// 						name="emailOrPhone"
// 						placeholder="Email or Phone"
// 						value={formData.emailOrPhone}
// 						onChange={handleChange}
// 						required
// 					/>
// 					<label>Password</label>
// 					<input
// 						type="password"
// 						name="password"
// 						placeholder="Password"
// 						value={formData.password}
// 						onChange={handleChange}
// 						required
// 					/>
// 					<button type="submit" className="login-button" disabled={isLoading}>
// 						{isLoading ? "Logging in..." : "Log In"}
// 					</button>
// 				</form>
// 				<div className="social-buttons">
// 					<button onClick={handleGoogleLogin} className="google-btn">
// 						<span>G</span> Google
// 					</button>
// 					<button className="facebook-btn">
// 						<span>f</span> Facebook
// 					</button>
// 				</div>
// 			</div>
// 		</div>
// 	);
// };

// export default Login;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { login } from "../../store/auth/ThunkActions";
import { RootState } from "../../store/RootReducer";
import { iLoginCredentials } from "../../store/auth/Types";
import { useAppDispatch } from "../../store/Hooks";
import {Message, toaster} from "rsuite";

import "./Auth.css";

const Login: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const { isLoading, message } = useSelector((state: RootState) => state.authReducer);
	const [error, setError] = useState("");

	const [formData, setFormData] = useState<iLoginCredentials>({
		emailOrPhone: "",
		password: "",
	});

	useEffect(() => {
		document.body.style.background = "#0f0f1b";
		return () => {
			document.body.style.background = "";
		};
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
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

	const handleGoogleLogin = () => {
		window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_OAUTH_REDIRECT_URI}&response_type=code&scope=email profile`;
	};

	return (
		<div className="login-wrapper">
			<div className="background-circles"></div>

			<div className="login-content">
				<div className="login-left">
					<h2>Login Here</h2>
					{message && <p className="error">{message}</p>}
					<form onSubmit={handleSubmit}>
						<label>Username</label>
						<input
							type="text"
							name="emailOrPhone"
							placeholder="Email or Phone"
							value={formData.emailOrPhone}
							onChange={handleChange}
							required
						/>
						<label>Password</label>
						<input
							type="password"
							name="password"
							placeholder="Password"
							value={formData.password}
							onChange={handleChange}
							required
						/>
						<button type="submit" className="login-button" disabled={isLoading}>
							{isLoading ? "Logging in..." : "Log In"}
						</button>
					</form>
					<div className="social-buttons">
						<button onClick={handleGoogleLogin} className="google-btn">
							<span>G</span> Google
						</button>
					</div>
				</div>

				<div className="login-right">
  <div className="welcome-content">
    <h1>Welcome to Saini Event Planner!</h1>
	we design events that speak your heart unforgettable.
    <img
      src="https://i.pinimg.com/736x/9e/f9/2f/9ef92f371c50e5757192fd194f20b471.jpg"
      alt="Login visual"
    />
  </div>
</div>

			</div>
		</div>
	);
};

export default Login;
