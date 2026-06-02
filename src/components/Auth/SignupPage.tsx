import React, {useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import {GOOGLE_AUTH_URL} from "../../config/oauth";
import {useAppDispatch} from "../../store/Hooks";
import {signup} from "@/store/auth/ThunkActions";
import Button from "../ui/Button";
import Input from "../ui/Input";
import {
	UserPlus,
	Sparkles,
	Star,
	ShieldCheck,
	Mail,
	Phone,
	Lock,
	Eye,
	EyeOff,
} from "lucide-react";
import {toast} from "sonner";

const SignupPage: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phoneNumber: "",
		password: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState<{[key: string]: string}>({});
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);

	const calculatePasswordStrength = (password: string) => {
		let strength = 0;
		if (password.length >= 8) strength += 25;
		if (password.match(/[A-Z]/)) strength += 25;
		if (password.match(/[0-9]/)) strength += 25;
		if (password.match(/[^A-Za-z0-9]/)) strength += 25;
		return strength;
	};

	const validateForm = () => {
		const newErrors: {[key: string]: string} = {};

		if (formData.name.length < 2) {
			newErrors.name = "Name must be at least 2 characters long";
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.email)) {
			newErrors.email = "Please enter a valid email address";
		}

		const cleanPhone = formData.phoneNumber.replace(/\D/g, "");
		if (cleanPhone.length < 10) {
			newErrors.phoneNumber = "Please enter a valid 10-digit mobile number";
		}

		if (formData.password.length < 8) {
			newErrors.password = "Password must be at least 8 characters long";
		}

		if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const {name, value} = e.target;
		setFormData((prev) => ({...prev, [name]: value}));
		if (errors[name]) {
			setErrors((prev) => ({...prev, [name]: ""}));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;

		setLoading(true);
		try {
			await dispatch(signup(formData));
			toast.success("Account created successfully!");
			setTimeout(() => navigate("/login"), 1500);
		} catch (err: any) {
			toast.error(err.message || "An error occurred during signup");
		} finally {
			setLoading(false);
		}
	};

	const passwordStrength = calculatePasswordStrength(formData.password);
	const strengthColor =
		passwordStrength <= 25
			? "bg-rose-500"
			: passwordStrength <= 50
			? "bg-amber-500"
			: passwordStrength <= 75
			? "bg-emerald-500"
			: "bg-indigo-500";

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6 lg:p-8">
			<div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row-reverse min-h-[600px] border border-gray-100">
				{/* Right: Signup Form */}
				<div className="flex-1 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
					<div className="mb-10">
						<div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-2xl mb-6">
							<UserPlus className="w-8 h-8 text-indigo-600" />
						</div>
						<h2 className="text-4xl font-black text-gray-900 tracking-tight mb-3">
							Create Account
						</h2>
						<p className="text-gray-500 font-medium">
							Join our community of professional event planners.
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-5">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
							<Input
								label="Full Name"
								name="name"
								placeholder="John Doe"
								value={formData.name}
								onChange={handleInputChange}
								error={errors.name}
								required
							/>
							<Input
								label="Email Address"
								name="email"
								type="email"
								placeholder="john@example.com"
								value={formData.email}
								onChange={handleInputChange}
								error={errors.email}
								required
							/>
						</div>

						<Input
							label="Phone Number"
							name="phoneNumber"
							type="tel"
							placeholder="10-digit number"
							value={formData.phoneNumber}
							onChange={handleInputChange}
							error={errors.phoneNumber}
							required
						/>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
							<div className="space-y-1">
								<Input
									label="Password"
									name="password"
									type={showPassword ? "text" : "password"}
									placeholder="••••••••"
									value={formData.password}
									onChange={handleInputChange}
									error={errors.password}
									required
								/>
								{formData.password && (
									<div className="px-1 pt-2">
										<div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
											<div
												className={`h-full ${strengthColor} transition-all duration-500`}
												style={{width: `${passwordStrength}%`}}
											></div>
										</div>
										<p className="text-[10px] font-bold mt-1 text-gray-400 uppercase tracking-wider text-right">
											Strength:{" "}
											{passwordStrength === 100
												? "Excellent"
												: passwordStrength >= 50
												? "Good"
												: "Weak"}
										</p>
									</div>
								)}
							</div>
							<Input
								label="Confirm Password"
								name="confirmPassword"
								type={showPassword ? "text" : "password"}
								placeholder="••••••••"
								value={formData.confirmPassword}
								onChange={handleInputChange}
								error={errors.confirmPassword}
								required
							/>
						</div>

						<Button
							type="submit"
							className="w-full h-14 text-lg font-bold shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all active:scale-[0.98] mt-4"
							isLoading={loading}
						>
							Create Account
						</Button>
					</form>

					<div className="relative my-8">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-100"></div>
						</div>
						<div className="relative flex justify-center text-sm font-bold uppercase tracking-widest">
							<span className="px-4 bg-white text-gray-400">
								or sign up with
							</span>
						</div>
					</div>

					<button
						type="button"
						onClick={() => (window.location.href = GOOGLE_AUTH_URL)}
						className="w-full h-14 flex items-center justify-center gap-4 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-[0.98]"
					>
						<img
							src="https://www.svgrepo.com/show/475656/google-color.svg"
							alt="Google logo"
							className="w-6 h-6"
						/>
						Google Account
					</button>

					<p className="mt-8 text-center text-gray-500 font-medium">
						Already have an account?{" "}
						<Link
							to="/login"
							className="text-indigo-600 font-black hover:underline underline-offset-4"
						>
							Sign In
						</Link>
					</p>
				</div>

				{/* Left: Brand Section */}
				<div className="hidden md:flex flex-1 bg-indigo-600 p-12 lg:p-16 flex-col justify-between relative overflow-hidden">
					<div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500 rounded-full -ml-32 -mt-32 opacity-20"></div>
					<div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-700 rounded-full -mr-48 -mb-48 opacity-20"></div>

					<div className="relative z-10">
						<div className="flex items-center gap-3 mb-12">
							<div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
								<Sparkles className="w-6 h-6 text-white" />
							</div>
							<span className="text-white font-black text-xl tracking-tighter">
								Saini Events
							</span>
						</div>

						<h1 className="text-5xl font-black text-white leading-tight mb-8">
							Empower Your <br />
							<span className="text-indigo-200">Creative Vision.</span>
						</h1>

						<div className="space-y-6">
							<div className="flex items-center gap-4 group">
								<div className="p-2 bg-indigo-500 rounded-lg text-indigo-100 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
									<ShieldCheck className="w-5 h-5" />
								</div>
								<p className="text-indigo-100 text-sm font-bold opacity-90">
									Enterprise-grade Security
								</p>
							</div>
							<div className="flex items-center gap-4 group">
								<div className="p-2 bg-indigo-500 rounded-lg text-indigo-100 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
									<Star className="w-5 h-5" />
								</div>
								<p className="text-indigo-100 text-sm font-bold opacity-90">
									Premium Management Tools
								</p>
							</div>
						</div>
					</div>

					<div className="relative z-10">
						<div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8">
							<p className="text-white font-black text-xl mb-4 italic leading-relaxed">
								&quot;The most intuitive platform for event management I&apos;ve
								ever used.&quot;
							</p>
							<div className="flex items-center gap-3">
								<img
									src="https://i.pravatar.cc/100?img=32"
									alt="Testimonial"
									className="w-10 h-10 rounded-full border-2 border-indigo-400"
								/>
								<div>
									<p className="text-white font-bold text-sm">Sarah Jenkins</p>
									<p className="text-indigo-200 text-xs font-medium">
										CEO, DreamDecor
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SignupPage;
