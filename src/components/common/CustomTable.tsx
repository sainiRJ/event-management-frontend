import React, {useRef, useEffect} from "react";
import {Loader2, Inbox} from "lucide-react";

interface CustomTableProps<T = Record<string, any>> {
	data: T[];
	loading?: boolean;
	columns: {
		key: string;
		label: string;
		width?: number;
		render?: (rowData: T) => React.ReactNode;
		className?: string;
	}[];
	selectable?: boolean;
	selectedKeys?: string[];
	onSelectChange?: (selectedKeys: string[]) => void;
	actions?: {
		label: string;
		action: (rowData: T) => void;
		icon?: React.ReactNode;
		className?: string;
	}[];
	onRowClick?: (rowData: T) => void;
	rowKey?: keyof T;
	className?: string;
}

const CustomTable = <T extends Record<string, any>>({
	data,
	loading = false,
	columns,
	selectable = false,
	selectedKeys = [],
	onSelectChange,
	actions = [],
	onRowClick,
	rowKey = "id" as keyof T,
	className = "",
}: CustomTableProps<T>) => {
	const selectAllRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (selectAllRef.current) {
			selectAllRef.current.indeterminate =
				selectedKeys.length > 0 && selectedKeys.length < data.length;
		}
	}, [selectedKeys, data.length]);

	if (loading) {
		return (
			<div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-brand-100/70 shadow-sm">
				<div className="relative">
					<div className="w-16 h-16 border-4 border-brand-50 border-t-brand-600 rounded-full animate-spin" />
					<Loader2 className="w-6 h-6 text-brand-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
				</div>
				<p className="text-[#2B2129] font-black text-sm uppercase tracking-widest mt-6">
					Fetching records
				</p>
				<p className="text-gray-400 text-xs mt-1">Please wait a moment...</p>
			</div>
		);
	}

	if (!data || data.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-brand-100/70 shadow-sm">
				<div className="p-5 bg-brand-50/50 rounded-3xl mb-6">
					<Inbox className="w-12 h-12 text-gray-300" />
				</div>
				<h3 className="text-[#2B2129] font-black text-xl mb-2">
					No Records Found
				</h3>
				<p className="text-gray-400 text-sm max-w-[280px] text-center font-medium leading-relaxed">
					We couldn&apos;t find any data matching your current filters or
					criteria.
				</p>
			</div>
		);
	}

	return (
		<div
			className={`w-full overflow-hidden rounded-3xl border border-brand-100/70 bg-white shadow-sm ${className}`}
		>
			{/* Desktop: a real table. Below `md` the card list below takes
			    over — a seven-column table on a phone means scrolling
			    sideways to read a single row. */}
			<div className="hidden overflow-x-auto md:block">
				<table className="w-full border-separate border-spacing-0">
					<thead>
						<tr className="bg-brand-50/30">
							{selectable && (
								<th className="px-6 py-5 text-left border-b border-brand-100/70 w-12 first:rounded-tl-3xl">
									<input
										type="checkbox"
										className="w-5 h-5 text-brand-600 rounded-lg border-gray-200 focus:ring-brand-400/20 transition-all cursor-pointer"
										checked={
											data.length > 0 && selectedKeys.length === data.length
										}
										ref={selectAllRef}
										onChange={(e) => {
											if (e.target.checked) {
												onSelectChange?.(
													data.map((item) => item[rowKey] as unknown as string),
												);
											} else {
												onSelectChange?.([]);
											}
										}}
									/>
								</th>
							)}
							{columns.map((col) => (
								<th
									key={col.key}
									className={`px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-brand-100/70 whitespace-nowrap ${
										col.className || ""
									}`}
									style={col.width ? {width: col.width} : {}}
								>
									{col.label}
								</th>
							))}
							{actions.length > 0 && (
								<th className="px-6 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-brand-100/70 last:rounded-tr-3xl">
									Actions
								</th>
							)}
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50">
						{data.map((row, idx) => (
							<tr
								key={(row[rowKey] as unknown as string) || idx}
								className="group hover:bg-brand-50/30 transition-all duration-200 cursor-pointer"
								onClick={onRowClick ? () => onRowClick(row) : undefined}
							>
								{selectable && (
									<td className="px-6 py-5 whitespace-nowrap">
										<input
											type="checkbox"
											className="w-5 h-5 text-brand-600 rounded-lg border-gray-200 focus:ring-brand-400/20 transition-all cursor-pointer"
											checked={selectedKeys.includes(
												row[rowKey] as unknown as string,
											)}
											onChange={(e) => {
												e.stopPropagation();
												if (e.target.checked) {
													onSelectChange?.([
														...selectedKeys,
														row[rowKey] as unknown as string,
													]);
												} else {
													onSelectChange?.(
														selectedKeys.filter(
															(key) =>
																key !== (row[rowKey] as unknown as string),
														),
													);
												}
											}}
										/>
									</td>
								)}
								{columns.map((col) => (
									<td
										key={col.key}
										className={`px-6 py-5 whitespace-nowrap text-sm font-bold text-gray-700 ${
											col.className || ""
										}`}
									>
										{col.render
											? col.render(row)
											: (row[col.key] as React.ReactNode) || "-"}
									</td>
								))}
								{actions.length > 0 && (
									<td className="px-6 py-5 whitespace-nowrap text-right">
										<div className="flex justify-end gap-2 sm:opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
											{actions.map((action, i) => (
												<button
													key={i}
													className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all hover:scale-105 active:scale-95 ${
														action.className ||
														"bg-white text-brand-600 border border-brand-100 hover:bg-gradient-to-br from-brand-500 to-brand-700 hover:text-white shadow-sm"
													}`}
													onClick={(e) => {
														e.stopPropagation();
														action.action(row);
													}}
												>
													{action.icon}
													{action.label}
												</button>
											))}
										</div>
									</td>
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			{/* Mobile: one card per row, built from the same column config so
			    callers never define their layout twice. */}
			<ul className="divide-y divide-brand-100/50 md:hidden">
				{data.map((row, idx) => {
					const key = (row[rowKey] as unknown as string) || String(idx);
					const [titleColumn, ...restColumns] = columns;

					return (
						<li key={key} className="p-4">
							<div className="flex items-start gap-3">
								{selectable && (
									<input
										type="checkbox"
										aria-label="Select row"
										className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded-lg border-gray-200 text-brand-600"
										checked={selectedKeys.includes(key)}
										onChange={(e) => {
											if (e.target.checked) {
												onSelectChange?.([...selectedKeys, key]);
											} else {
												onSelectChange?.(
													selectedKeys.filter((k) => {
														return k !== key;
													}),
												);
											}
										}}
									/>
								)}

								<div className="min-w-0 flex-1">
									<button
										type="button"
										onClick={onRowClick ? () => onRowClick(row) : undefined}
										disabled={!onRowClick}
										className="block w-full text-left"
									>
										<p className="truncate text-base font-bold text-[#2B2129]">
											{titleColumn?.render
												? titleColumn.render(row)
												: (row[titleColumn?.key] as React.ReactNode) ?? "-"}
										</p>

										<dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2">
											{restColumns.map((col) => (
												<div key={col.key} className="min-w-0">
													<dt className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
														{col.label}
													</dt>
													<dd className="truncate text-sm font-bold text-gray-700">
														{col.render
															? col.render(row)
															: (row[col.key] as React.ReactNode) || "-"}
													</dd>
												</div>
											))}
										</dl>
									</button>

									{actions.length > 0 && (
										<div className="mt-3 flex flex-wrap gap-2">
											{actions.map((action, i) => (
												<button
													key={i}
													className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-black transition-all active:scale-95 ${
														action.className ||
														"border border-brand-100 bg-white text-brand-600 shadow-sm"
													}`}
													onClick={(e) => {
														e.stopPropagation();
														action.action(row);
													}}
												>
													{action.icon}
													{action.label}
												</button>
											))}
										</div>
									)}
								</div>
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
};

export default CustomTable;
