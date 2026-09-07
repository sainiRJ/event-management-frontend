import React, {useEffect, useState} from "react";
import {Images} from "lucide-react";

import {operationsService} from "@/services/api/eventManagementServer";
import {iAttachment} from "@/customTypes/appDataTypes/operationsTypes";
import {httpStatusCodes} from "@/customTypes/NetworkTypes";

interface iProps {
	bookingId: string;
	/** Compact: thumbnails only, no heading. For list rows. */
	isCompact?: boolean;
}

/**
 * The reference photos a customer attached to their request. Opens the
 * full image in a new tab; there is nothing to edit here.
 */
const AttachmentStrip: React.FC<iProps> = ({bookingId, isCompact = false}) => {
	const [items, setItems] = useState<iAttachment[] | null>(null);

	useEffect(() => {
		let isStale = false;
		(async () => {
			const response = await operationsService.listAttachments(bookingId);
			if (isStale) return;
			if (
				response?.httpStatusCode === httpStatusCodes.SUCCESS_OK &&
				response.data?.data
			) {
				setItems(response.data.data);
			} else {
				setItems([]);
			}
		})();
		return () => {
			isStale = true;
		};
	}, [bookingId]);

	if (!items || items.length === 0) {
		return null;
	}

	const thumbs = (
		<div className="flex flex-wrap gap-2">
			{items.map((item) => (
				<a
					key={item.id}
					href={item.url}
					target="_blank"
					rel="noopener noreferrer"
					className={`block overflow-hidden rounded-xl border border-ink-200 bg-ink-50 ${
						isCompact ? "h-14 w-14" : "h-24 w-24"
					}`}
				>
					<img
						src={item.url}
						alt="Customer reference"
						loading="lazy"
						className="h-full w-full object-cover transition-transform hover:scale-105"
					/>
				</a>
			))}
		</div>
	);

	if (isCompact) {
		return thumbs;
	}

	return (
		<section className="mt-8 border-t border-ink-200/60 pt-6">
			<h4 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-brand-600">
				<Images className="h-4 w-4" />
				Customer&apos;s inspiration
				<span className="rounded-full bg-ink-100 px-2 py-0.5 text-[10px] font-semibold tracking-normal text-ink-600">
					{items.length}
				</span>
			</h4>
			{thumbs}
		</section>
	);
};

export default AttachmentStrip;
