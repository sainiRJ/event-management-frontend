import React, {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useSelector} from "react-redux";
import {login} from "../../store/auth/ThunkActions";
import {RootState} from "../../store/RootReducer";
import {iLoginCredentials} from "../../store/auth/Types";
import {useAppDispatch} from "../../store/Hooks";
import {Message, toaster} from "rsuite";
import {showToast} from "../../utils/showToatify";

// Custom CSS for animated background circles
const bgCircleStyles = `
  .background-circles {
    position: absolute;
    inset: 0;
    z-index: 0;
    overflow: hidden;
  }
  .background-circles::before, .background-circles::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.5;
    animation: float 8s ease-in-out infinite alternate;
  }
  .background-circles::before {
    width: 400px;
    height: 400px;
    left: -120px;
    top: -120px;
    background: radial-gradient(circle, #ffb86c 0%, #ff6bcb 100%);
    animation-delay: 0s;
  }
  .background-circles::after {
    width: 300px;
    height: 300px;
    right: -100px;
    bottom: -100px;
    background: radial-gradient(circle, #667eea 0%, #764ba2 100%);
    animation-delay: 2s;
  }
  @keyframes float {
    0% { transform: translateY(0) scale(1); }
    100% { transform: translateY(40px) scale(1.1); }
  }
`;

const Login: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const {isLoading, message} = useSelector(
		(state: RootState) => state.authReducer,
	);
	const [error, setError] = useState("");

	const [formData, setFormData] = useState<iLoginCredentials>({
		emailOrPhone: "",
		password: "",
	});

	useEffect(() => {
		document.body.style.background = "#181a22";
		return () => {
			document.body.style.background = "";
		};
	}, []);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const {name, value} = e.target;
		setFormData((prev) => ({...prev, [name]: value}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		const response: any = await dispatch(login(formData));
		showToast({
			response,
			successMessage: "Login successful",
			errorMessage: "Login failed",
		});

		// Add navigation after successful login
		if (response.payload?.data?.token?.accessToken) {
			navigate("/dashboard");
		}
	};

	const handleGoogleLogin = () => {
		window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_OAUTH_REDIRECT_URI}&response_type=code&scope=email profile`;
	};

	return (
		<div className="relative min-h-screen flex items-center justify-center bg-[#181a22] overflow-hidden">
			{/* Animated background circles */}
			<style>{bgCircleStyles}</style>
			<div className="background-circles" />
			<div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row rounded-2xl shadow-2xl overflow-hidden bg-white/90 backdrop-blur-md">
				{/* Left: Login Form */}
				<div className="flex flex-col justify-center px-8 py-12 md:w-1/2 w-full bg-white/90">
					<div className="mb-8 text-center">
						<h2 className="text-3xl font-bold text-gray-900 mb-2">
							Login Here
						</h2>
						<p className="text-gray-500 text-base">
							Welcome back! Please login to your account.
						</p>
					</div>
					{message && (
						<p className="text-red-500 text-sm mb-2 text-center">{message}</p>
					)}
					<form onSubmit={handleSubmit} className="flex flex-col gap-4">
						<div>
							<label className="block text-gray-700 text-sm mb-1">
								Username
							</label>
							<input
								type="text"
								name="emailOrPhone"
								placeholder="Email or Phone"
								value={formData.emailOrPhone}
								onChange={handleChange}
								required
								className="w-full px-4 py-2 rounded-md bg-gray-100 text-gray-900 border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none placeholder-gray-400 transition"
							/>
						</div>
						<div>
							<label className="block text-gray-700 text-sm mb-1">
								Password
							</label>
							<input
								type="password"
								name="password"
								placeholder="Password"
								value={formData.password}
								onChange={handleChange}
								required
								className="w-full px-4 py-2 rounded-md bg-gray-100 text-gray-900 border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none placeholder-gray-400 transition"
							/>
						</div>
						<button
							type="submit"
							className="submit-btn w-full py-2 mt-2 rounded-md bg-gradient-to-r from-indigo-400 to-purple-500 text-white font-bold text-lg shadow hover:-translate-y-0.5 hover:shadow-lg transition disabled:opacity-60 relative"
							disabled={isLoading}
						>
							{isLoading ? (
								<span className="flex items-center justify-center">
									<svg
										className="animate-spin h-5 w-5 mr-2 text-white"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8v8z"
										></path>
									</svg>
									Logging in...
								</span>
							) : (
								"Log In"
							)}
						</button>
					</form>
					<div className="divider flex items-center my-6">
						<div className="flex-grow h-px bg-gray-300" />
						<span className="mx-3 text-gray-400">OR</span>
						<div className="flex-grow h-px bg-gray-300" />
					</div>
					<button
						onClick={handleGoogleLogin}
						className="google-btn w-full flex items-center justify-center gap-2 py-2 rounded-md bg-white text-gray-800 border border-gray-300 font-semibold text-lg hover:bg-gray-100 transition shadow"
					>
						<img src="/google-icon.svg" alt="Google logo" className="w-5 h-5" />
						Continue with Google
					</button>
				</div>
				{/* Right: Welcome Section */}
				<div className="flex flex-col justify-center items-center bg-[#6d5c57] px-8 py-12 md:w-1/2 w-full">
					<div className="welcome-content text-center">
						<h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
							Welcome to Saini Event Planner!
						</h1>
						<p className="text-white text-base mb-4">
							we design events that speak your heart unforgettable.
						</p>
						<img
							src="https://i.pinimg.com/736x/9e/f9/2f/9ef92f371c50e5757192fd194f20b471.jpg"
							alt="Login visual"
							className="rounded-lg shadow-lg w-full max-w-xs border-4 border-[#bbaea7] animate-slideIn"
						/>
					</div>
				</div>
			</div>
			{/* Custom animation for image */}
			<style>{`
				@keyframes slideIn {
					0% { opacity: 0; transform: translateY(40px); }
					100% { opacity: 1; transform: translateY(0); }
				}
				.animate-slideIn {
					animation: slideIn 1.2s cubic-bezier(0.23, 1, 0.32, 1) both;
				}
			`}</style>
		</div>
	);
};

export default Login;
