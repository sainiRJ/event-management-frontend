import React, {useCallback, useEffect, useState} from "react";
import {toast} from "sonner";
import {Bell, Check, Copy, ExternalLink, Send, Unlink} from "lucide-react";

import {operationsService} from "@/services/api/eventManagementServer";
import {
	iTelegramLinkStart,
	iTelegramStatus,
} from "@/customTypes/appDataTypes/operationsTypes";
import {httpStatusCodes} from "@/customTypes/NetworkTypes";
import Button from "../ui/Button";

/**
 * Telegram alerts, linked from the account page.
 *
 * Free replacement for paid SMS/WhatsApp gateways: every dashboard
 * notification (new request, enquiry, payment) is mirrored to the vendor's
 * phone the moment it happens. Linking is a one-time code the vendor sends
 * to the bot; nothing else about Telegram is stored.
 */
const TelegramCard: React.FC = () => {
	const [status, setStatus] = useState<iTelegramStatus | null>(null);
	const [link, setLink] = useState<iTelegramLinkStart | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isStarting, setIsStarting] = useState(false);
	const [isVerifying, setIsVerifying] = useState(false);
	const [isTesting, setIsTesting] = useState(false);
	const [isUnlinking, setIsUnlinking] = useState(false);

	const load = useCallback(async () => {
		setIsLoading(true);
		const response = await operationsService.getTelegramStatus();
		if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
			setStatus(response.data?.data ?? null);
		}
		setIsLoading(false);
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const errorMessage = (
		response: {data?: {error?: {message?: string} | null} | null} | null,
		fallback: string,
	): string => {
		return response?.data?.error?.message || fallback;
	};

	const start = async () => {
		setIsStarting(true);
		const response = await operationsService.startTelegramLink();
		setIsStarting(false);
		if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
			setLink(response.data?.data ?? null);
			return;
		}
		toast.error(errorMessage(response, "Couldn't start the link"));
	};

	const verify = async () => {
		setIsVerifying(true);
		const response = await operationsService.verifyTelegramLink();
		setIsVerifying(false);
		if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
			toast.success("Telegram connected. Alerts will arrive on your phone.");
			setLink(null);
			setStatus(response.data?.data ?? null);
			return;
		}
		toast.error(errorMessage(response, "Couldn't verify the code yet"));
	};

	const test = async () => {
		setIsTesting(true);
		const response = await operationsService.sendTelegramTest();
		setIsTesting(false);
		if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
			toast.success("Test alert sent. Check Telegram.");
			return;
		}
		toast.error(errorMessage(response, "Couldn't send the test"));
	};

	const unlink = async () => {
		setIsUnlinking(true);
		const response = await operationsService.unlinkTelegram();
		setIsUnlinking(false);
		if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
			toast.success("Telegram disconnected");
			setStatus(response.data?.data ?? null);
			return;
		}
		toast.error(errorMessage(response, "Couldn't disconnect"));
	};

	const copyCode = async () => {
		if (!link) return;
		try {
			await navigator.clipboard.writeText(link.code);
			toast.success("Code copied");
		} catch {
			toast.error("Copy the code by hand");
		}
	};

	return (
		<div className="glass-card p-6 sm:p-8">
			<div className="mb-5 flex items-start justify-between gap-4">
				<div className="flex items-center gap-2">
					<Bell className="h-4 w-4 text-brand-600" />
					<h2 className="font-display text-lg font-semibold text-ink-900">
						Telegram alerts
					</h2>
				</div>
				{status?.isLinked && (
					<span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
						<Check className="h-3.5 w-3.5" />
						Connected
					</span>
				)}
			</div>

			<p className="mb-6 text-sm text-ink-500">
				Get every new booking request, enquiry and payment as a Telegram message
				on your phone, the second it happens. Free, no SMS charges.
			</p>

			{isLoading && <div className="skeleton h-12 w-full" />}

			{!isLoading && status && !status.isConfigured && (
				<div className="rounded-2xl border border-dashed border-ink-200 p-4 text-sm text-ink-500">
					Not set up on the server yet. Add <code>TELEGRAM_BOT_TOKEN</code> to
					the backend environment (create a bot with @BotFather) and this card
					comes alive.
				</div>
			)}

			{!isLoading && status?.isConfigured && status.isLinked && (
				<div className="flex flex-wrap gap-2">
					<Button
						variant="outline"
						icon={<Send className="h-4 w-4" />}
						onClick={test}
						isLoading={isTesting}
					>
						Send a test alert
					</Button>
					<Button
						variant="ghost"
						icon={<Unlink className="h-4 w-4" />}
						onClick={unlink}
						isLoading={isUnlinking}
					>
						Disconnect
					</Button>
				</div>
			)}

			{!isLoading && status?.isConfigured && !status.isLinked && !link && (
				<Button onClick={start} isLoading={isStarting}>
					Connect Telegram
				</Button>
			)}

			{!isLoading && link && (
				<div className="space-y-4">
					<ol className="space-y-3 text-sm text-ink-700">
						<li className="flex gap-3">
							<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
								1
							</span>
							<span>
								Open the bot{" "}
								{link.botUsername && (
									<a
										href={link.startUrl ?? `https://t.me/${link.botUsername}`}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:underline"
									>
										@{link.botUsername}
										<ExternalLink className="h-3.5 w-3.5" />
									</a>
								)}{" "}
								on your phone.
							</span>
						</li>
						<li className="flex gap-3">
							<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
								2
							</span>
							<span className="flex flex-wrap items-center gap-2">
								Send it this code:
								<code className="rounded-lg bg-ink-100 px-2.5 py-1 font-mono text-base font-semibold tracking-widest text-ink-900">
									{link.code}
								</code>
								<button
									type="button"
									onClick={copyCode}
									className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
								>
									<Copy className="h-3.5 w-3.5" />
									Copy
								</button>
							</span>
						</li>
						<li className="flex gap-3">
							<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
								3
							</span>
							<span>Come back here and press the button below.</span>
						</li>
					</ol>
					<div className="flex flex-wrap gap-2">
						<Button onClick={verify} isLoading={isVerifying}>
							I&apos;ve sent the code
						</Button>
						<Button variant="ghost" onClick={() => setLink(null)}>
							Cancel
						</Button>
					</div>
					<p className="text-xs text-ink-400">
						The code works once and expires in 15 minutes.
					</p>
				</div>
			)}
		</div>
	);
};

export default TelegramCard;
