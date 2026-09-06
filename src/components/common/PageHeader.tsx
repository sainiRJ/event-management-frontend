import React, {ReactNode} from "react";
import {Reveal} from "@/components/motion";

interface iPageHeaderProps {
	title: string;
	subtitle?: string;
	/** Small label above the title, e.g. the section the screen belongs to. */
	eyebrow?: string;
	/** Buttons, filters — anything that belongs beside the title. */
	actions?: ReactNode;
}

/**
 * The heading block every admin screen opens with. Same shape everywhere,
 * and on a phone the actions drop under the title at full width.
 */
const PageHeader: React.FC<iPageHeaderProps> = ({
	title,
	subtitle,
	eyebrow,
	actions,
}) => {
	return (
		<Reveal
			onMount
			className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between"
		>
			<div className="min-w-0">
				{eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
				<h1 className="font-display text-2xl font-semibold tracking-tight text-ink-900 sm:text-[2rem] sm:leading-tight">
					{title}
				</h1>
				{subtitle && (
					<p className="mt-1.5 text-sm text-ink-500 sm:text-base">{subtitle}</p>
				)}
			</div>

			{actions && (
				<div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:justify-end">
					{actions}
				</div>
			)}
		</Reveal>
	);
};

export default PageHeader;
