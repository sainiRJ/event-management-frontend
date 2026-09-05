import React, {useCallback, useEffect, useState} from "react";
import {toast} from "sonner";
import {ArrowLeft, MessagesSquare, RefreshCw} from "lucide-react";

import {chatTranscriptService} from "@/services/api/chatService";
import {
	iChatSessionSummary,
	iChatTranscript,
} from "@/customTypes/appDataTypes/operationsTypes";
import {httpStatusCodes, iPagination} from "@/customTypes/NetworkTypes";
import PageHeader from "@/components/common/PageHeader";
import Pagination from "@/components/common/Pagination";
import Button from "@/components/ui/Button";

function formatWhen(value: string): string {
	return new Date(value).toLocaleString("en-IN", {
		day: "numeric",
		month: "short",
		hour: "numeric",
		minute: "2-digit",
	});
}

/**
 * Conversations customers had with the AI assistant.
 *
 * The assistant quotes prices and takes bookings on your behalf, and none of
 * it was visible. The conversations that did *not* end in a booking are the
 * ones worth reading — they show what people asked for and did not get.
 */
const ChatTranscriptsPage: React.FC = () => {
	const [sessions, setSessions] = useState<iChatSessionSummary[]>([]);
	const [transcript, setTranscript] = useState<iChatTranscript | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
	const [isUnavailable, setIsUnavailable] = useState(false);
	const [pagination, setPagination] = useState<iPagination | null>(null);

	const load = useCallback(async (page = 1) => {
		setIsLoading(true);

		const response = await chatTranscriptService.listSessions({
			page,
			limit: 25,
		});

		if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
			setSessions(response.data?.data?.items ?? []);
			setPagination(response.data?.data?.pagination ?? null);
			setIsUnavailable(false);
		} else {
			// The assistant is a separate service; it may simply be down.
			setIsUnavailable(true);
		}

		setIsLoading(false);
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const openTranscript = async (session: iChatSessionSummary) => {
		setIsLoadingTranscript(true);

		const response = await chatTranscriptService.getTranscript(
			session.sessionId,
		);

		setIsLoadingTranscript(false);

		if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
			setTranscript(response.data?.data ?? null);
			return;
		}

		toast.error("Couldn't open that conversation");
	};

	if (transcript) {
		return (
			<div>
				<PageHeader
					title={transcript.title || "Conversation"}
					subtitle={`Started ${formatWhen(transcript.startedAt)}`}
					actions={
						<Button variant="secondary" onClick={() => setTranscript(null)}>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to conversations
						</Button>
					}
				/>

				<div className="space-y-3 rounded-3xl border border-brand-100/70 bg-white p-4 shadow-sm sm:p-6">
					{transcript.messages.length === 0 && (
						<p className="py-8 text-center text-sm text-gray-500">
							This conversation has no messages.
						</p>
					)}

					{transcript.messages.map((message) => {
						const isCustomer = message.role === "user";

						return (
							<div
								key={message.id}
								className={`flex ${
									isCustomer ? "justify-start" : "justify-end"
								}`}
							>
								<div
									className={`max-w-[85%] rounded-2xl px-4 py-3 sm:max-w-[70%] ${
										isCustomer
											? "bg-cream-100 text-[#2B2129]"
											: "bg-brand-500 text-white"
									}`}
								>
									<p className="whitespace-pre-wrap text-sm leading-relaxed">
										{message.content}
									</p>
									<p
										className={`mt-1.5 text-[11px] ${
											isCustomer ? "text-gray-400" : "text-brand-100"
										}`}
									>
										{isCustomer ? "Customer" : "Assistant"} ·{" "}
										{formatWhen(message.at)}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		);
	}

	return (
		<div>
			<PageHeader
				title="Chat Conversations"
				subtitle="What customers asked the assistant on your website"
				actions={
					<Button
						variant="secondary"
						onClick={() => {
							void load(pagination?.page ?? 1);
						}}
						disabled={isLoading}
					>
						<RefreshCw
							className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
						/>
						Refresh
					</Button>
				}
			/>

			{isUnavailable && (
				<div className="rounded-3xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">
					<p className="font-semibold">The chat service isn&apos;t reachable</p>
					<p className="mt-1">
						Conversations are stored by the assistant service. Check that it is
						running and that its address is set in{" "}
						<code className="rounded bg-amber-100 px-1">
							VITE_CHAT_SERVICE_BASEURL
						</code>
						.
					</p>
				</div>
			)}

			{isLoading && sessions.length === 0 && !isUnavailable && (
				<p className="py-12 text-center text-sm text-gray-500">
					Loading conversations…
				</p>
			)}

			{!isLoading && !isUnavailable && sessions.length === 0 && (
				<div className="rounded-3xl border border-brand-100/70 bg-white py-16 text-center">
					<MessagesSquare className="mx-auto mb-3 h-10 w-10 text-brand-300" />
					<h2 className="font-display text-lg font-semibold text-[#2B2129]">
						No conversations yet
					</h2>
					<p className="mt-1 text-sm text-gray-500">
						Chats from your website assistant will appear here.
					</p>
				</div>
			)}

			<div className="space-y-3">
				{sessions.map((session) => (
					<button
						key={session.sessionId}
						type="button"
						onClick={() => openTranscript(session)}
						disabled={isLoadingTranscript}
						className="flex w-full flex-wrap items-center justify-between gap-3 rounded-3xl border border-brand-100/70 bg-white p-5 text-left shadow-sm transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:opacity-60 sm:p-6"
					>
						<div className="min-w-0">
							<h2 className="truncate font-display text-base font-semibold text-[#2B2129]">
								{session.title || "Conversation"}
							</h2>
							<p className="mt-0.5 text-sm text-gray-500">
								{session.messageCount} message
								{session.messageCount === 1 ? "" : "s"} · last activity{" "}
								{formatWhen(session.lastMessageAt)}
							</p>
						</div>

						<span className="shrink-0 rounded-lg bg-cream-100 px-2.5 py-1 text-xs font-bold text-gray-500">
							{formatWhen(session.startedAt)}
						</span>
					</button>
				))}
			</div>

			{pagination && (
				<Pagination
					page={pagination.page}
					totalPages={pagination.totalPages}
					total={pagination.total}
					limit={pagination.limit}
					isLoading={isLoading}
					onPageChange={(nextPage) => {
						void load(nextPage);
					}}
				/>
			)}
		</div>
	);
};

export default ChatTranscriptsPage;
