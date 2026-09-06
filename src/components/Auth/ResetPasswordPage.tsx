import React, {useState} from "react";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {ArrowLeft, ShieldCheck} from "lucide-react";
import {toast} from "sonner";

import {authService} from "@/services/api/eventManagementServer";
import {httpStatusCodes} from "@/customTypes/NetworkTypes";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const MIN_PASSWORD_LENGTH = 8;

/**
 * Step two: choose the new password, using the token from the emailed link.
 *
 * Resetting signs every device out, so the user is sent back to login rather
 * than straight into the dashboard.
 */
const ResetPasswordPage: React.FC = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();

	const token = searchParams.get("token") ?? "";

	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isSaving, setIsSaving] = useState(false);

	const submit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (newPassword.length < MIN_PASSWORD_LENGTH) {
			setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
			return;
		}

		if (newPassword !== confirmPassword) {
			setError("Both passwords must match");
			return;
		}

		setIsSaving(true);
		setError(null);

		const response = await authService.resetPassword(token, newPassword);

		setIsSaving(false);

		if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
			toast.success("Password changed. Please sign in.");
			navigate("/login", {replace: true});
			return;
		}

		setError(
			response?.data?.error?.message ??
				"That reset link is invalid or has expired. Please request a new one.",
		);
	};

	if (!token) {
		return (
			<div className="mx-auto w-full max-w-md px-4 py-12">
				<div className="rounded-3xl border border-ink-200/70 bg-white p-6 text-center shadow-sm sm:p-8">
					<h1 className="font-display text-2xl font-semibold text-ink-900">
						This link is incomplete
					</h1>
					<p className="mt-2 text-sm text-ink-500">
						Open the link from your email exactly as it was sent, or request a
						new one.
					</p>
					<Link to="/forgot-password" className="mt-6 inline-block">
						<Button>Request a new link</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto w-full max-w-md px-4 py-12">
			<div className="rounded-3xl border border-ink-200/70 bg-white p-6 shadow-sm sm:p-8">
				<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
					<ShieldCheck className="h-6 w-6" />
				</div>

				<h1 className="font-display text-2xl font-semibold text-ink-900">
					Choose a new password
				</h1>
				<p className="mt-2 text-sm text-ink-500">
					You&apos;ll be signed out everywhere and can sign back in with the new
					password.
				</p>

				<form onSubmit={submit} className="mt-6 space-y-4">
					<Input
						label="New password"
						type="password"
						autoComplete="new-password"
						value={newPassword}
						onChange={(e) => setNewPassword(e.target.value)}
						placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
					/>

					<Input
						label="Confirm new password"
						type="password"
						autoComplete="new-password"
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
					/>

					{error && (
						<p className="rounded-xl bg-rose-50 p-3 text-sm text-rose-600">
							{error}
						</p>
					)}

					<Button type="submit" className="w-full" disabled={isSaving}>
						{isSaving ? "Saving…" : "Change password"}
					</Button>
				</form>

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

export default ResetPasswordPage;
