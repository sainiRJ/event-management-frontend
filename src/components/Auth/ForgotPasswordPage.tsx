import React, {useState} from "react";
import {Link} from "react-router-dom";
import {ArrowLeft, MailCheck} from "lucide-react";

import {authService} from "@/services/api/eventManagementServer";
import {httpStatusCodes} from "@/customTypes/NetworkTypes";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

/**
 * Step one of the reset flow.
 *
 * Always shows the same confirmation, whether or not the address has an
 * account — the backend answers identically for the same reason, so this
 * screen cannot be used to find out who is registered.
 */
const ForgotPasswordPage: React.FC = () => {
	const [email, setEmail] = useState("");
	const [isSending, setIsSending] = useState(false);
	const [isSent, setIsSent] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const submit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!email.trim()) {
			setError("Enter the email address on your account");
			return;
		}

		setIsSending(true);
		setError(null);

		const response = await authService.forgotPassword(email.trim());

		setIsSending(false);

		if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
			setIsSent(true);
			return;
		}

		setError("Something went wrong. Please try again in a moment.");
	};

	return (
		<div className="mx-auto w-full max-w-md px-4 py-12">
			<div className="rounded-3xl border border-ink-200/70 bg-white p-6 shadow-sm sm:p-8">
				{isSent ? (
					<div className="text-center">
						<div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
							<MailCheck className="h-6 w-6" />
						</div>
						<h1 className="font-display text-2xl font-semibold text-ink-900">
							Check your email
						</h1>
						<p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-500">
							If <span className="font-semibold">{email}</span> has an account,
							a link to choose a new password is on its way. It works once and
							expires in 30 minutes.
						</p>
						<p className="mt-4 text-sm text-ink-400">
							Nothing arrived? Check spam, or{" "}
							<button
								type="button"
								className="font-bold text-brand-600 hover:text-brand-700"
								onClick={() => setIsSent(false)}
							>
								try another address
							</button>
							.
						</p>
					</div>
				) : (
					<>
						<h1 className="font-display text-2xl font-semibold text-ink-900">
							Forgot your password?
						</h1>
						<p className="mt-2 text-sm text-ink-500">
							Enter the email on your account and we&apos;ll send you a link to
							set a new password.
						</p>

						<form onSubmit={submit} className="mt-6 space-y-4">
							<Input
								label="Email"
								type="email"
								autoComplete="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="you@example.com"
							/>

							{error && (
								<p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">
									{error}
								</p>
							)}

							<Button type="submit" className="w-full" isLoading={isSending}>
								{isSending ? "Sending…" : "Send reset link"}
							</Button>
						</form>
					</>
				)}

				<Link
					to="/login"
					className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-ink-500 hover:text-brand-600"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to sign in
				</Link>
			</div>
		</div>
	);
};

export default ForgotPasswordPage;
