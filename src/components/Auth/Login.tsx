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
		emailOrPhone: "",
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
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
				<div>
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						Login to your account
					</h2>
				</div>
				{message && (
					<p className="text-red-500 text-sm text-center">{message}</p>
				)}
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<div className="rounded-md shadow-sm space-y-4">
						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700"
							>
								Email
							</label>
							<input
								id="email"
								name="email"
								type="email"
								required
								value={formData.emailOrPhone}
								onChange={handleChange}
								className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder="Enter your email"
							/>
						</div>
						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700"
							>
								Password
							</label>
							<input
								id="password"
								name="password"
								type="password"
								required
								value={formData.password}
								onChange={handleChange}
								className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
								placeholder="Enter your password"
							/>
						</div>
					</div>

					<div>
						<button
							type="submit"
							disabled={isLoading}
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{isLoading ? "Logging in..." : "Login"}
						</button>
					</div>
				</form>

				<div className="mt-6">
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-300"></div>
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-2 bg-white text-gray-500">OR</span>
						</div>
					</div>

					<div className="mt-6">
						<button
							onClick={handleGoogleLogin}
							className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
						>
							<img
								className="h-5 w-5 mr-2"
								src="/google-icon.svg"
								alt="Google logo"
							/>
							Continue with Google
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
