import React, {useCallback, useEffect, useState} from "react";
import {toast} from "sonner";
import {Check, MailOpen, MessageSquare, Phone, RefreshCw} from "lucide-react";

import {operationsService} from "@/services/api/eventManagementServer";
import {iContactMessage} from "@/customTypes/appDataTypes/operationsTypes";
import {httpStatusCodes} from "@/customTypes/NetworkTypes";
import PageHeader from "@/components/common/PageHeader";
import Button from "@/components/ui/Button";

function formatWhen(value: string): string {
	return new Date(value).toLocaleString("en-IN", {
		day: "numeric",
		month: "short",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	});
}

/**
 * Enquiries from the website contact form.
 *
 * The form has always saved these, but nothing could read them — no endpoint
 * and no screen — so every enquiry a customer sent went unanswered.
 */
const ContactMessagesPage: React.FC = () => {
	const [messages, setMessages] = useState<iContactMessage[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isUnreadOnly, setIsUnreadOnly] = useState(false);

	const load = useCallback(async () => {
		setIsLoading(true);

		const response = await operationsService.listContactMessages({
			unreadOnly: isUnreadOnly,
			limit: 50,
		});

		if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
			setMessages(response.data?.data?.items ?? []);
		} else {
			toast.error("Couldn't load enquiries");
		}

		setIsLoading(false);
	}, [isUnreadOnly]);

	useEffect(() => {
		load();
	}, [load]);

	const toggleRead = async (message: iContactMessage) => {
		// Optimistic: the list should respond immediately.
		setMessages((prev) => {
			return prev.map((m) => {
				return m.id === message.id ? {...m, isRead: !m.isRead} : m;
			});
		});

		const response = await operationsService.markMessageRead(
			message.id,
			!message.isRead,
		);

		if (response?.httpStatusCode !== httpStatusCodes.SUCCESS_OK) {
			toast.error("Couldn't update that enquiry");
			load();
		}
	};

	const unreadCount = messages.filter((m) => !m.isRead).length;

	return (
		<div>
			<PageHeader
				title="Website Enquiries"
				subtitle={
					unreadCount > 0
						? `${unreadCount} still to answer`
						: "Messages sent through your contact form"
				}
				actions={
					<>
						<Button
							variant="secondary"
							onClick={() => setIsUnreadOnly((v) => !v)}
						>
							{isUnreadOnly ? "Show all" : "Show unanswered"}
						</Button>
						<Button variant="secondary" onClick={load} disabled={isLoading}>
							<RefreshCw
								className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
							/>
							Refresh
						</Button>
					</>
				}
			/>

			{isLoading && messages.length === 0 && (
				<p className="py-12 text-center text-sm text-gray-500">
					Loading enquiries…
				</p>
			)}

			{!isLoading && messages.length === 0 && (
				<div className="rounded-3xl border border-brand-100/70 bg-white py-16 text-center">
					<MessageSquare className="mx-auto mb-3 h-10 w-10 text-brand-300" />
					<h2 className="font-display text-lg font-semibold text-[#2B2129]">
						{isUnreadOnly ? "Everything answered" : "No enquiries yet"}
					</h2>
					<p className="mt-1 text-sm text-gray-500">
						Messages from your website contact form land here.
					</p>
				</div>
			)}

			<div className="space-y-3">
				{messages.map((message) => {
					return (
						<article
							key={message.id}
							className={`rounded-3xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6 ${
								message.isRead
									? "border-brand-100/70"
									: "border-brand-300 bg-brand-50/40"
							}`}
						>
							<div className="mb-3 flex flex-wrap items-start justify-between gap-3">
								<div className="min-w-0">
									<h2 className="flex items-center gap-2 font-display text-lg font-semibold text-[#2B2129]">
										{!message.isRead && (
											<span
												className="h-2 w-2 shrink-0 rounded-full bg-brand-500"
												aria-label="Unanswered"
											/>
										)}
										<span className="truncate">{message.name}</span>
									</h2>
									<a
										className="mt-1 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600"
										href={`tel:${message.mobile}`}
									>
										<Phone className="h-3.5 w-3.5" />
										{message.mobile}
									</a>
								</div>

								<time className="text-xs text-gray-400">
									{formatWhen(message.createdAt)}
								</time>
							</div>

							<p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
								{message.message}
							</p>

							<div className="mt-4 flex flex-col gap-2 sm:flex-row">
								<Button
									variant="secondary"
									className="w-full sm:w-auto"
									onClick={() => toggleRead(message)}
								>
									{message.isRead ? (
										<>
											<MailOpen className="mr-2 h-4 w-4" />
											Mark unanswered
										</>
									) : (
										<>
											<Check className="mr-2 h-4 w-4" />
											Mark answered
										</>
									)}
								</Button>
								<Button
									variant="secondary"
									className="w-full sm:w-auto"
									onClick={() => {
										window.location.href = `tel:${message.mobile}`;
									}}
								>
									<Phone className="mr-2 h-4 w-4" />
									Call back
								</Button>
							</div>
						</article>
					);
				})}
			</div>
		</div>
	);
};

export default ContactMessagesPage;
