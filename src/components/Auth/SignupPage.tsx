import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {GOOGLE_AUTH_URL} from "../../config/oauth";
import "./Auth.css";
import {Input, InputGroup, Message, Progress} from "rsuite";
import {
	FaUser,
	FaEnvelope,
	FaPhone,
	FaLock,
	FaEye,
	FaEyeSlash,
} from "react-icons/fa";

const SignupPage: React.FC = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		phone: "",
		password: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState<{[key: string]: string}>({});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");

	// Password strength calculation
	const calculatePasswordStrength = (password: string) => {
		let strength = 0;
		if (password.length >= 8) strength += 25;
		if (password.match(/[A-Z]/)) strength += 25;
		if (password.match(/[0-9]/)) strength += 25;
		if (password.match(/[^A-Za-z0-9]/)) strength += 25;
		return strength;
	};

	const getPasswordStrengthColor = (strength: number) => {
		if (strength <= 25) return "#ff4d4f";
		if (strength <= 50) return "#faad14";
		if (strength <= 75) return "#52c41a";
		return "#1890ff";
	};

	// Updated phone validation and formatting
	const isIndianPhoneNumber = (phone: string) => {
		const cleanPhone = phone.replace(/\D/g, "");
		return (
			cleanPhone.length === 10 ||
			(cleanPhone.length === 12 && cleanPhone.startsWith("91")) ||
			(cleanPhone.length === 11 && cleanPhone.startsWith("0"))
		);
	};

	const formatPhoneDisplay = (phone: string) => {
		// Remove all non-digits
		let cleanPhone = phone.replace(/\D/g, "");

		// If number starts with 91, remove it as we'll add +91 later
		if (cleanPhone.startsWith("91")) {
			cleanPhone = cleanPhone.slice(2);
		}
		// If number starts with 0, remove it
		if (cleanPhone.startsWith("0")) {
			cleanPhone = cleanPhone.slice(1);
		}

		// Take only first 10 digits if longer
		cleanPhone = cleanPhone.slice(0, 10);

		// If empty, return empty
		if (!cleanPhone) return "";

		// Format for display: +91 XXXXX XXXXX
		return `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`.trim();
	};

	const validateForm = () => {
		const newErrors: {[key: string]: string} = {};

		// Name validation
		if (formData.name.length < 2) {
			newErrors.name = "Name must be at least 2 characters long";
		}

		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(formData.email)) {
			newErrors.email = "Please enter a valid email address";
		}

		// Phone validation - strictly for Indian numbers
		const cleanPhone = formData.phone.replace(/\D/g, "");
		// Remove 91 prefix if exists
		const phoneNumber = cleanPhone.startsWith("91")
			? cleanPhone.slice(2)
			: cleanPhone;

		if (phoneNumber.length !== 10) {
			newErrors.phone = "Please enter a valid 10-digit mobile number";
		} else if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
			newErrors.phone = "Please enter a valid Indian mobile number";
		}

		// Password validation
		if (formData.password.length < 8) {
			newErrors.password = "Password must be at least 8 characters long";
		}

		if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleInputChange = (name: string, value: string) => {
		if (name === "phone") {
			// Remove all non-digits
			let cleanPhone = value.replace(/\D/g, "");

			// If number starts with 91, remove it
			if (cleanPhone.startsWith("91")) {
				cleanPhone = cleanPhone.slice(2);
			}
			// If number starts with 0, remove it
			if (cleanPhone.startsWith("0")) {
				cleanPhone = cleanPhone.slice(1);
			}

			// Take only first 10 digits
			cleanPhone = cleanPhone.slice(0, 10);

			// Store with +91 prefix
			setFormData((prev) => ({
				...prev,
				[name]: cleanPhone ? `+91${cleanPhone}` : "",
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}

		// Clear error when user starts typing
		if (errors[name]) {
			setErrors((prev) => ({
				...prev,
				[name]: "",
			}));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setErrors({});
		setSuccessMessage("");

		if (!validateForm()) {
			setLoading(false);
			return;
		}

		try {
			const response = await fetch("http://localhost:3080/api/auth/signup", {
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

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Signup failed");
			}

			setSuccessMessage("Account created successfully! Redirecting...");
			localStorage.setItem("token", data.token);
			setTimeout(() => navigate("/login"), 2000);
		} catch (err: any) {
			setErrors({
				submit: err.message || "An error occurred during signup",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleSignUp = () => {
		window.location.href = GOOGLE_AUTH_URL;
	};

	const passwordStrength = calculatePasswordStrength(formData.password);

	return (
		<div className="auth-container">
			<div className="auth-box">
				<h2>Create Your Account</h2>
				<p className="auth-subtitle">Join us to start managing your events</p>

				{successMessage && (
					<Message type="success" className="message-success">
						{successMessage}
					</Message>
				)}

				{errors.submit && (
					<Message type="error" className="message-error">
						{errors.submit}
					</Message>
				)}

				<form onSubmit={handleSubmit}>
					<div className="form-group">
						<InputGroup>
							<InputGroup.Addon>
								<FaUser />
							</InputGroup.Addon>
							<Input
								name="name"
								value={formData.name}
								onChange={(value) => handleInputChange("name", value)}
								placeholder="Full Name"
								disabled={loading}
							/>
						</InputGroup>
						{errors.name && <span className="error-text">{errors.name}</span>}
					</div>

					<div className="form-group">
						<InputGroup>
							<InputGroup.Addon>
								<FaEnvelope />
							</InputGroup.Addon>
							<Input
								name="email"
								type="email"
								value={formData.email}
								onChange={(value) => handleInputChange("email", value)}
								placeholder="Email Address"
								disabled={loading}
							/>
						</InputGroup>
						{errors.email && <span className="error-text">{errors.email}</span>}
					</div>

					<div className="form-group">
						<InputGroup>
							<InputGroup.Addon>
								<FaPhone />
							</InputGroup.Addon>
							<Input
								name="phone"
								value={formatPhoneDisplay(formData.phone)}
								onChange={(value) => handleInputChange("phone", value)}
								placeholder="Mobile Number (10 digits)"
								disabled={loading}
							/>
						</InputGroup>
						{errors.phone && <span className="error-text">{errors.phone}</span>}
					</div>

					<div className="form-group">
						<InputGroup>
							<InputGroup.Addon>
								<FaLock />
							</InputGroup.Addon>
							<Input
								name="password"
								type={showPassword ? "text" : "password"}
								value={formData.password}
								onChange={(value) => handleInputChange("password", value)}
								placeholder="Password"
								disabled={loading}
							/>
							<InputGroup.Button onClick={() => setShowPassword(!showPassword)}>
								{showPassword ? <FaEyeSlash /> : <FaEye />}
							</InputGroup.Button>
						</InputGroup>
						{formData.password && (
							<div className="password-strength">
								<Progress.Line
									percent={passwordStrength}
									strokeColor={getPasswordStrengthColor(passwordStrength)}
									showInfo={false}
								/>
								<span
									style={{color: getPasswordStrengthColor(passwordStrength)}}
								>
									Password Strength:{" "}
									{passwordStrength === 100
										? "Strong"
										: passwordStrength >= 50
										? "Medium"
										: "Weak"}
								</span>
							</div>
						)}
						{errors.password && (
							<span className="error-text">{errors.password}</span>
						)}
					</div>

					<div className="form-group">
						<InputGroup>
							<InputGroup.Addon>
								<FaLock />
							</InputGroup.Addon>
							<Input
								name="confirmPassword"
								type={showConfirmPassword ? "text" : "password"}
								value={formData.confirmPassword}
								onChange={(value) =>
									handleInputChange("confirmPassword", value)
								}
								placeholder="Confirm Password"
								disabled={loading}
							/>
							<InputGroup.Button
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
							>
								{showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
							</InputGroup.Button>
						</InputGroup>
						{errors.confirmPassword && (
							<span className="error-text">{errors.confirmPassword}</span>
						)}
					</div>

					<button
						type="submit"
						className={`submit-btn ${loading ? "loading" : ""}`}
						disabled={loading}
					>
						{loading ? "Creating Account..." : "Sign Up"}
					</button>
				</form>

				<div className="divider">
					<span>OR</span>
				</div>

				<button
					className="google-btn"
					onClick={handleGoogleSignUp}
					disabled={loading}
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
