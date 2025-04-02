import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import {login} from "../../store/auth/ThunkActions";
import {RootState} from "../../store/RootReducer";
import {iLoginCredentials} from "../../store/auth/Types";
import {useAppDispatch} from "../../store/Hooks";

const Login: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const {isLoading, message} = useSelector(
		(state: RootState) => state.authReducer,
	);
	const [formData, setFormData] = useState<iLoginCredentials>({
		email: "",
		password: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const {name, value} = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await dispatch(login(formData));
			navigate("/booking");
		} catch (error) {
			console.error("Login failed:", error);
		}
	};

	const handleGoogleLogin = () => {
		window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_OAUTH_REDIRECT_URI}&response_type=code&scope=email profile`;
	};

	return (
		<div className="auth-container">
			<div className="auth-box">
				<h2>Login</h2>
				{message && <p className="error-message">{message}</p>}
				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<label htmlFor="email">Email</label>
						<input
							type="email"
							id="email"
							name="email"
							value={formData.email}
							onChange={handleChange}
							required
						/>
					</div>
					<div className="form-group">
						<label htmlFor="password">Password</label>
						<input
							type="password"
							id="password"
							name="password"
							value={formData.password}
							onChange={handleChange}
							required
						/>
					</div>
					<button type="submit" className="submit-btn" disabled={isLoading}>
						{isLoading ? "Logging in..." : "Login"}
					</button>
				</form>
				<div className="divider">
					<span>OR</span>
				</div>
				<button onClick={handleGoogleLogin} className="google-btn">
					Continue with Google
				</button>
			</div>
		</div>
	);
};

export default Login;
