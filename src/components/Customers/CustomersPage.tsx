import React, {useCallback, useEffect, useState} from "react";
import {Search, Users, Phone, Loader2, RefreshCw} from "lucide-react";

import PageHeader from "../common/PageHeader";
import CustomTable from "../common/CustomTable";
import Pagination from "../common/Pagination";
import Button from "../ui/Button";
import {insightService} from "@/services/api/eventManagementServer";
import {iCustomerSummary} from "@/services/api/eventManagementServer/InsightService";
import {httpStatusCodes, iPagination} from "@/customTypes/NetworkTypes";
import {formatCurrency} from "@/utils/currencyUtils";
import {formatDate} from "@/utils/dateUtils";

/**
 * The vendor's customers.
 *
 * Bookings carried a name and a phone number and nothing joined them up, so a
 * customer on their fourth event looked exactly like a stranger. Repeat
 * business is most of this trade - a wedding, then a birthday, then the
 * brother's wedding - and none of it was visible anywhere.
 *
 * Grouped by phone number server-side, because that is the field the public
 * form makes mandatory and the one people type consistently.
 */
const CustomersPage: React.FC = () => {
	const [customers, setCustomers] = useState<iCustomerSummary[]>([]);
	const [pagination, setPagination] = useState<iPagination | null>(null);
	const [search, setSearch] = useState("");
	const [isLoading, setIsLoading] = useState(true);
	const [hasFailed, setHasFailed] = useState(false);

	const load = useCallback(
		async (page: number, searchTerm: string): Promise<void> => {
			setIsLoading(true);
			setHasFailed(false);

			try {
				const response = await insightService.getCustomers({
					page,
					limit: 25,
					search: searchTerm || undefined,
				});

				if (response?.httpStatusCode === httpStatusCodes.SUCCESS_OK) {
					setCustomers(response.data?.data?.items ?? []);
					setPagination(response.data?.data?.pagination ?? null);
					return;
				}

				setHasFailed(true);
			} catch {
				setHasFailed(true);
			} finally {
				setIsLoading(false);
			}
		},
		[],
	);

	// Debounced, so typing a name is one request rather than one per letter.
	useEffect(() => {
		const timer = setTimeout(() => {
			void load(1, search);
		}, 300);

		return () => {
			return clearTimeout(timer);
		};
	}, [load, search]);

	const columns = [
		{
			key: "name",
			label: "Customer",
			width: 200,
			resizable: true,
		},
		{
			key: "phoneNumber",
			label: "Phone",
			width: 160,
			resizable: true,
			render: (row: iCustomerSummary) => {
				return row.phoneNumber ? (
					<a
						href={`tel:${row.phoneNumber}`}
						className="inline-flex items-center gap-1 text-brand-600 hover:underline"
						onClick={(event) => {
							return event.stopPropagation();
						}}
					>
						<Phone className="h-3 w-3" />
						{row.phoneNumber}
					</a>
				) : (
					<span className="text-gray-400">—</span>
				);
			},
		},
		{
			key: "bookingCount",
			label: "Bookings",
			width: 110,
			resizable: true,
			render: (row: iCustomerSummary) => {
				const isRepeat = row.bookingCount > 1;

				return (
					<span
						className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
							isRepeat
								? "bg-emerald-50 text-emerald-700"
								: "bg-gray-100 text-gray-600"
						}`}
					>
						{row.bookingCount}
						{isRepeat ? " · repeat" : ""}
					</span>
				);
			},
		},
		{
			key: "lastBookingAt",
			label: "Last event",
			width: 140,
			resizable: true,
			render: (row: iCustomerSummary) => {
				return formatDate(row.lastBookingAt);
			},
		},
		{
			key: "totalBooked",
			label: "Total booked",
			width: 140,
			resizable: true,
			render: (row: iCustomerSummary) => {
				return formatCurrency(Number(row.totalBooked));
			},
		},
		{
			key: "totalDue",
			label: "Still owed",
			width: 130,
			resizable: true,
			render: (row: iCustomerSummary) => {
				const due = Number(row.totalDue);

				return (
					<span
						className={
							due > 0 ? "font-semibold text-rose-600" : "text-gray-400"
						}
					>
						{due > 0 ? formatCurrency(due) : "—"}
					</span>
				);
			},
		},
	];

	return (
		<div className="space-y-6 animate-in fade-in duration-500">
			<PageHeader
				title="Customers"
				subtitle="Everyone who has booked with you, and what they still owe"
			/>

			<div className="glass-card p-4">
				<div className="relative">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
					<input
						type="search"
						value={search}
						onChange={(event) => {
							return setSearch(event.target.value);
						}}
						placeholder="Search by name or phone number…"
						className="w-full rounded-xl border border-brand-100 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-brand-300 focus:ring-2 focus:ring-brand-100"
					/>
				</div>
			</div>

			{hasFailed ? (
				<div className="glass-card p-12 text-center">
					<p className="text-gray-600">
						We couldn&apos;t load your customers just now.
					</p>
					<Button
						variant="secondary"
						className="mt-4"
						onClick={() => {
							void load(1, search);
						}}
					>
						<RefreshCw className="mr-2 h-4 w-4" />
						Try again
					</Button>
				</div>
			) : !isLoading && customers.length === 0 ? (
				<div className="glass-card p-12 text-center">
					<Users className="mx-auto mb-3 h-10 w-10 text-brand-200" />
					<p className="font-semibold text-[#2B2129]">
						{search ? "Nobody matches that search" : "No customers yet"}
					</p>
					<p className="mx-auto mt-1 max-w-sm text-sm text-gray-500">
						{search
							? "Try just the phone number, or part of the name."
							: "Customers appear here as soon as their first booking is recorded."}
					</p>
				</div>
			) : (
				<div className="glass-card p-4">
					{isLoading && customers.length === 0 ? (
						<div className="flex items-center justify-center gap-3 py-16 text-gray-500">
							<Loader2 className="h-5 w-5 animate-spin" />
							Loading customers…
						</div>
					) : (
						<>
							<CustomTable
								data={customers}
								loading={isLoading}
								columns={columns}
							/>

							{pagination && (
								<Pagination
									page={pagination.page}
									totalPages={pagination.totalPages}
									total={pagination.total}
									limit={pagination.limit}
									isLoading={isLoading}
									onPageChange={(nextPage) => {
										void load(nextPage, search);
									}}
								/>
							)}
						</>
					)}
				</div>
			)}
		</div>
	);
};

export default CustomersPage;
