import React, {useState} from "react";
import {useNavigate, Link} from "react-router-dom";
import {useSelector} from "react-redux";
import {motion, useReducedMotion} from "framer-motion";
import {Lock, Mail} from "lucide-react";
import {login} from "../../store/auth/ThunkActions";
import {RootState} from "../../store/RootReducer";
import {iLoginCredentials} from "../../store/auth/Types";
import {useAppDispatch} from "../../store/Hooks";
import {showToast} from "../../utils/showToatify";
import Button from "../ui/Button";
import Input from "../ui/Input";
import BrandLogo from "../layouts/BrandLogo";
import {GOOGLE_AUTH_URL} from "@/config/oauth";
import {EASE} from "@/components/motion";

/** Optional photo behind the brand panel: public/media/auth/login-bg.jpg */
const LOGIN_PHOTO = "/media/auth/login-bg.jpg";

const GoogleMark: React.FC = () => (
	<svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
		<path
			fill="#EA4335"
			d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.9-5.4 3.9-3.3 0-5.9-2.7-5.9-6s2.6-6 5.9-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z"
		/>
	</svg>
);

const Login: React.FC = () => {
	const navigate = useNavigate();
	const dispatch = useAppDispatch();
	const prefersReduced = useReducedMotion();
	const {isLoading, message} = useSelector(
		(state: RootState) => state.authReducer,
	);

	const [formData, setFormData] = useState<iLoginCredentials>({
		emailOrPhone: "",
		password: "",
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		const {name, value} = e.target;
		setFormData((prev) => ({...prev, [name]: value}));
	};

	const handleSubmit = async (e: React.FormEvent): Promise<void> => {
		e.preventDefault();
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const response: any = await dispatch(login(formData));
		showToast({
			response,
			successMessage: "Signed in",
			errorMessage: "Sign in failed",
		});

		if (response.payload?.data?.token?.accessToken) {
			navigate("/dashboard");
		}
	};

	return (
		<div className="grid min-h-screen bg-cream-100 lg:grid-cols-2">
			{/* Brand panel */}
			<div className="relative hidden overflow-hidden bg-brand-900 lg:block">
				<img
					src={LOGIN_PHOTO}
					alt=""
					aria-hidden="true"
					className="absolute inset-0 h-full w-full object-cover opacity-60"
					onError={(e) => {
						(e.currentTarget as HTMLImageElement).style.display = "none";
					}}
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/50 to-brand-900/10" />
				<div className="relative flex h-full flex-col justify-between p-10 text-white">
					<BrandLogo isOnDark />
					<div className="max-w-md">
						<p className="eyebrow !text-gold-300">Vendor console</p>
						<p className="mt-3 font-display text-4xl leading-tight">
							Bookings, dates and money, in one place.
						</p>
						<p className="mt-3 text-white/70">
							Requests from the website land here. Confirm the date, record the
							advance, and the customer sees it on their side.
						</p>
					</div>
				</div>
			</div>

			{/* Form */}
			<div className="flex flex-col px-5 py-6 sm:px-10 lg:px-16 lg:py-10">
				<div className="lg:hidden">
					<BrandLogo />
				</div>

				<motion.div
					className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10"
					initial={prefersReduced ? false : {opacity: 0, y: 16}}
					animate={{opacity: 1, y: 0}}
					transition={{duration: 0.5, ease: EASE}}
				>
					<p className="eyebrow">Sign in</p>
					<h1 className="mt-2 font-display text-3xl text-ink-900 sm:text-4xl">
						Welcome back
					</h1>
					<p className="mt-2 text-ink-500">
						Manage bookings, payments and your team.
					</p>

					{message && (
						<p
							role="alert"
							className="mt-6 rounded-xl bg-rose-50 p-3 text-sm text-rose-700"
						>
							{message}
						</p>
					)}

					<form onSubmit={handleSubmit} className="mt-8 space-y-5">
						<Input
							label="Email or phone"
							name="emailOrPhone"
							type="text"
							inputMode="email"
							autoComplete="username"
							placeholder="you@example.com"
							icon={<Mail className="h-4 w-4" />}
							value={formData.emailOrPhone}
							onChange={handleChange}
							required
						/>

						<div>
							<div className="mb-1.5 flex items-center justify-between">
								<label
									htmlFor="password"
									className="text-sm font-medium text-ink-700"
								>
									Password
								</label>
								<Link
									to="/forgot-password"
									className="text-sm font-medium text-brand-600 hover:underline"
								>
									Forgot password?
								</Link>
							</div>
							<Input
								name="password"
								id="password"
								type="password"
								autoComplete="current-password"
								placeholder="Your password"
								icon={<Lock className="h-4 w-4" />}
								value={formData.password}
								onChange={handleChange}
								required
							/>
						</div>

						<Button
							type="submit"
							size="lg"
							className="w-full"
							isLoading={isLoading}
						>
							Sign in
						</Button>
					</form>

					<div className="my-6 flex items-center gap-4">
						<div className="h-px flex-1 bg-ink-200" />
						<span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-400">
							or
						</span>
						<div className="h-px flex-1 bg-ink-200" />
					</div>

					<a
						href={GOOGLE_AUTH_URL}
						className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-full border border-ink-200 bg-white text-sm font-semibold text-ink-800 transition-colors hover:bg-ink-50"
					>
						<GoogleMark />
						Continue with Google
					</a>

					<p className="mt-8 text-center text-sm text-ink-500">
						Don&apos;t have an account?{" "}
						<Link
							to="/signup"
							className="font-semibold text-brand-600 hover:underline"
						>
							Create one
						</Link>
					</p>
				</motion.div>
			</div>
		</div>
	);
};

export default Login;
