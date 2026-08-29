import React, {ReactNode} from "react";

interface iPageHeaderProps {
	title: string;
	subtitle?: string;
	/** Buttons, filters — anything that belongs beside the title. */
	actions?: ReactNode;
}

/**
 * The heading block every admin screen opens with.
 *
 * Exists so the pages stay visually identical and, more usefully, so the
 * title/actions row stacks the same way on a phone: actions drop below the
 * title and go full width rather than being squeezed beside it.
 */
const PageHeader: React.FC<iPageHeaderProps> = ({title, subtitle, actions}) => {
	return (
		<div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
			<div className="min-w-0">
				<h1 className="font-display text-2xl font-semibold tracking-tight text-[#2B2129] sm:text-3xl">
					{title}
				</h1>
				{subtitle && (
					<p className="mt-1 text-sm text-gray-500 sm:text-base">{subtitle}</p>
				)}
			</div>

			{actions && (
				<div className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:justify-end">
					{actions}
				</div>
			)}
		</div>
	);
};

export default PageHeader;
