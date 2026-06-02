import React, {useState, useEffect} from "react";
import {useNavigate, Link} from "react-router-dom";
import {useSelector} from "react-redux";
import {login} from "../../store/auth/ThunkActions";
import {RootState} from "../../store/RootReducer";
import {iLoginCredentials} from "../../store/auth/Types";
import {useAppDispatch} from "../../store/Hooks";
import {showToast} from "../../utils/showToatify";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { LogIn, Sparkles, Star } from "lucide-react";

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
		setFormData((prev) => ({...prev, [name]: value}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const response: any = await dispatch(login(formData));
		showToast({
			response,
			successMessage: "Login successful",
			errorMessage: "Login failed",
		});

		if (response.payload?.data?.token?.accessToken) {
			navigate("/dashboard");
		}
	};

	const handleGoogleLogin = () => {
		window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID}&redirect_uri=${process.env.REACT_APP_OAUTH_REDIRECT_URI}&response_type=code&scope=email profile`;
	};

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
			<div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] border border-gray-100">
				{/* Left: Login Form */}
				<div className="flex-1 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
					<div className="mb-10">
						<div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-6">
							<LogIn className="w-8 h-8 text-indigo-600" />
						</div>
						<h2 className="text-4xl font-black text-gray-900 tracking-tight mb-3">
							Welcome Back
						</h2>
						<p className="text-gray-500 font-medium">
							Sign in to manage your decoration events and team.
						</p>
					</div>

					{message && (
						<div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium flex items-center gap-3">
							<div className="w-2 h-2 bg-rose-600 rounded-full animate-pulse"></div>
							{message}
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-6">
						<Input
							label="Email or Phone"
							name="emailOrPhone"
							type="text"
							placeholder="admin@example.com"
							value={formData.emailOrPhone}
							onChange={handleChange}
							required
							className="h-12"
						/>
						
						<div className="space-y-1">
							<div className="flex justify-between items-center">
								<label className="block text-sm font-bold text-gray-700">Password</label>
								<Link to="/forgot-password" title="Forgot password link" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Forgot Password?</Link>
							</div>
							<Input
								name="password"
								type="password"
								placeholder="••••••••"
								value={formData.password}
								onChange={handleChange}
								required
								className="h-12"
							/>
						</div>

						<Button
							type="submit"
							className="w-full h-14 text-lg font-bold shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-[0.98]"
							isLoading={isLoading}
						>
							Log In
						</Button>
					</form>

					<div className="relative my-10">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-100"></div>
						</div>
						<div className="relative flex justify-center text-sm font-bold uppercase tracking-widest">
							<span className="px-4 bg-white text-gray-400">or continue with</span>
						</div>
					</div>

					<button
						type="button"
						onClick={handleGoogleLogin}
						className="w-full h-14 flex items-center justify-center gap-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-[0.98]"
					>
						<img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo" className="w-6 h-6" />
						Google Account
					</button>

					<p className="mt-10 text-center text-gray-500 font-medium">
						Don&apos;t have an account?{" "}
						<Link to="/signup" className="text-indigo-600 font-black hover:underline underline-offset-4">
							Create Account
						</Link>
					</p>
				</div>

				{/* Right: Brand Section */}
				<div className="hidden md:flex flex-1 bg-indigo-600 p-12 lg:p-16 flex-col justify-between relative overflow-hidden">
					{/* Decorative background elements */}
					<div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full -mr-32 -mt-32 opacity-20"></div>
					<div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-700 rounded-full -ml-48 -mb-48 opacity-20"></div>
					
					<div className="relative z-10">
						<div className="flex items-center gap-3 mb-12">
							<div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
								<Sparkles className="w-6 h-6 text-white" />
							</div>
							<span className="text-white font-black text-xl tracking-tighter">Saini Events</span>
						</div>

						<h1 className="text-5xl font-black text-white leading-tight mb-8">
							Crafting Memories, <br />
							<span className="text-indigo-200">One Event at a Time.</span>
						</h1>
						
						<div className="space-y-6">
							<div className="flex items-start gap-4">
								<div className="p-2 bg-indigo-500 rounded-lg text-indigo-100">
									<Star className="w-5 h-5" />
								</div>
								<div>
									<h4 className="text-white font-bold mb-1">Elite Decoration</h4>
									<p className="text-indigo-100 text-sm font-medium opacity-80 leading-relaxed">
										Professional-grade management tools for your creative decoration business.
									</p>
								</div>
							</div>
						</div>
					</div>

					<div className="relative z-10">
						<div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
							<div className="flex -space-x-3 mb-4">
								{[1, 2, 3, 4].map((i) => (
									<div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-indigo-400 overflow-hidden shadow-lg">
										<img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User avatar" />
									</div>
								))}
								<div className="w-10 h-10 rounded-full border-2 border-indigo-600 bg-white/20 backdrop-blur-md flex items-center justify-center text-xs font-bold text-white shadow-lg">
									+50
								</div>
							</div>
							<p className="text-white font-bold text-sm">Join 50+ event planners managing their business with Saini Events.</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Login;
