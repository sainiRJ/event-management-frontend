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
			<div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
				<div className="relative">
					<div className="w-16 h-16 border-4 border-indigo-50 border-t-indigo-600 rounded-full animate-spin" />
					<Loader2 className="w-6 h-6 text-indigo-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
				</div>
				<p className="text-gray-900 font-black text-sm uppercase tracking-widest mt-6">
					Fetching records
				</p>
				<p className="text-gray-400 text-xs mt-1">Please wait a moment...</p>
			</div>
		);
	}

	if (!data || data.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
				<div className="p-5 bg-gray-50 rounded-3xl mb-6">
					<Inbox className="w-12 h-12 text-gray-300" />
				</div>
				<h3 className="text-gray-900 font-black text-xl mb-2">
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
			className={`w-full overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm ${className}`}
		>
			<div className="overflow-x-auto">
				<table className="w-full border-separate border-spacing-0">
					<thead>
						<tr className="bg-gray-50/50">
							{selectable && (
								<th className="px-6 py-5 text-left border-b border-gray-100 w-12 first:rounded-tl-3xl">
									<input
										type="checkbox"
										className="w-5 h-5 text-indigo-600 rounded-lg border-gray-200 focus:ring-indigo-500/20 transition-all cursor-pointer"
										checked={
											data.length > 0 && selectedKeys.length === data.length
										}
										ref={selectAllRef}
										onChange={(e) => {
											if (e.target.checked) {
												onSelectChange?.(data.map((item) => item[rowKey] as unknown as string));
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
									className={`px-6 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 whitespace-nowrap ${
										col.className || ""
									}`}
									style={col.width ? {width: col.width} : {}}
								>
									{col.label}
								</th>
							))}
							{actions.length > 0 && (
								<th className="px-6 py-5 text-right text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-100 last:rounded-tr-3xl">
									Actions
								</th>
							)}
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-50">
						{data.map((row, idx) => (
							<tr
								key={(row[rowKey] as unknown as string) || idx}
								className="group hover:bg-indigo-50/30 transition-all duration-200 cursor-pointer"
								onClick={onRowClick ? () => onRowClick(row) : undefined}
							>
								{selectable && (
									<td className="px-6 py-5 whitespace-nowrap">
										<input
											type="checkbox"
											className="w-5 h-5 text-indigo-600 rounded-lg border-gray-200 focus:ring-indigo-500/20 transition-all cursor-pointer"
											checked={selectedKeys.includes(row[rowKey] as unknown as string)}
											onChange={(e) => {
												e.stopPropagation();
												if (e.target.checked) {
													onSelectChange?.([...selectedKeys, row[rowKey] as unknown as string]);
												} else {
													onSelectChange?.(
														selectedKeys.filter((key) => key !== (row[rowKey] as unknown as string)),
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
										{col.render ? col.render(row) : (row[col.key] as React.ReactNode) || "-"}
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
														"bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-600 hover:text-white shadow-sm"
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
			{/* Mobile indicator for scrolling */}
			<div className="lg:hidden h-1 w-full bg-gray-50">
				<div className="h-full bg-indigo-100 w-1/3 rounded-full mx-auto" />
			</div>
		</div>
	);
};

export default CustomTable;
