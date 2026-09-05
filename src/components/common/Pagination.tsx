import React from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";

interface iPaginationProps {
	page: number;
	totalPages: number;
	total: number;
	limit: number;
	onPageChange: (page: number) => void;
	/** Disables the controls while a page is being fetched. */
	isLoading?: boolean;
}

/**
 * Page controls.
 *
 * The API has paginated every list since it was written - 25 rows a page -
 * and no screen rendered a single next button. So the dashboard silently
 * showed the most recent 25 bookings and nothing else: booking 26 onwards
 * existed, was charged for, and could not be found. Search made it worse by
 * filtering only the rows already on screen, so it answered "no results" for
 * customers who were right there in the database.
 *
 * Deliberately plain: the range, and two arrows. Numbered page links are
 * noise on a list nobody browses by page number.
 */
const Pagination: React.FC<iPaginationProps> = ({
	page,
	totalPages,
	total,
	limit,
	onPageChange,
	isLoading = false,
}) => {
	// One page of results needs no controls.
	if (total === 0 || totalPages <= 1) {
		return null;
	}

	const firstOnPage = (page - 1) * limit + 1;
	const lastOnPage = Math.min(page * limit, total);

	const canGoBack = page > 1 && !isLoading;
	const canGoForward = page < totalPages && !isLoading;

	const buttonClass =
		"inline-flex items-center gap-1 rounded-xl border border-brand-100 bg-white px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-brand-200 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-brand-100 disabled:hover:text-gray-600";

	return (
		<nav
			aria-label="Pagination"
			className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row"
		>
			<p className="text-sm text-gray-500" aria-live="polite">
				Showing{" "}
				<span className="font-semibold text-gray-700">{firstOnPage}</span>–
				<span className="font-semibold text-gray-700">{lastOnPage}</span> of{" "}
				<span className="font-semibold text-gray-700">{total}</span>
			</p>

			<div className="flex items-center gap-2">
				<button
					type="button"
					className={buttonClass}
					onClick={() => {
						return onPageChange(page - 1);
					}}
					disabled={!canGoBack}
				>
					<ChevronLeft className="h-4 w-4" />
					Previous
				</button>

				<span className="px-2 text-sm text-gray-500">
					Page {page} of {totalPages}
				</span>

				<button
					type="button"
					className={buttonClass}
					onClick={() => {
						return onPageChange(page + 1);
					}}
					disabled={!canGoForward}
				>
					Next
					<ChevronRight className="h-4 w-4" />
				</button>
			</div>
		</nav>
	);
};

export default Pagination;
