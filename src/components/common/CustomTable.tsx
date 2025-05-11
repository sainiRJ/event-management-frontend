import React, {useRef, useEffect} from "react";

interface CustomTableProps {
	data: any[];
	loading?: boolean;
	columns: {
		key: string;
		label: string;
		width?: number;
		render?: (rowData: any) => React.ReactNode;
		className?: string;
	}[];
	selectable?: boolean;
	selectedKeys?: string[];
	onSelectChange?: (selectedKeys: string[]) => void;
	actions?: {
		label: string;
		action: (rowData: any) => void;
		icon?: React.ReactNode;
		className?: string;
	}[];
	onRowClick?: (rowData: any) => void;
	rowKey?: string;
	className?: string;
}

const CustomTable: React.FC<CustomTableProps> = ({
	data,
	loading = false,
	columns,
	selectable = false,
	selectedKeys = [],
	onSelectChange,
	actions = [],
	onRowClick,
	rowKey = "id",
	className = "",
}) => {
	if (loading) {
		return (
			<div className="flex justify-center items-center py-12 text-gray-400">
				Loading...
			</div>
		);
	}

	if (!data || data.length === 0) {
		return (
			<div className="flex justify-center items-center py-12 text-gray-400">
				No data found.
			</div>
		);
	}

	// Ref for the select-all checkbox
	const selectAllRef = useRef<HTMLInputElement>(null);
	useEffect(() => {
		if (selectAllRef.current) {
			selectAllRef.current.indeterminate =
				selectedKeys.length > 0 && selectedKeys.length < data.length;
		}
	}, [selectedKeys, data.length]);

	return (
		<div className={`w-full overflow-x-auto ${className}`}>
			<table className="min-w-full divide-y divide-gray-200">
				<thead className="bg-gray-50 sticky top-0 z-10">
					<tr>
						{selectable && (
							<th
								className="px-1 py-2 w-10"
								style={{width: 40, minWidth: 40, maxWidth: 40}}
							>
								<input
									type="checkbox"
									checked={selectedKeys.length === data.length}
									ref={selectAllRef}
									onChange={(e) => {
										if (e.target.checked) {
											onSelectChange?.(data.map((item) => item[rowKey]));
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
								className={`px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase ${
									col.className || ""
								}`}
								style={col.width ? {width: col.width} : {}}
							>
								{col.label}
							</th>
						))}
						{actions.length > 0 && (
							<th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
								Actions
							</th>
						)}
					</tr>
				</thead>
				<tbody className="bg-white divide-y divide-gray-100">
					{data.map((row, idx) => (
						<tr
							key={row[rowKey] || idx}
							className={`hover:bg-gray-50 transition cursor-pointer`}
							onClick={onRowClick ? () => onRowClick(row) : undefined}
						>
							{selectable && (
								<td
									className="px-1 py-2 w-10"
									style={{width: 40, minWidth: 40, maxWidth: 40}}
								>
									<input
										type="checkbox"
										checked={selectedKeys.includes(row[rowKey])}
										onChange={(e) => {
											e.stopPropagation();
											if (e.target.checked) {
												onSelectChange?.([...selectedKeys, row[rowKey]]);
											} else {
												onSelectChange?.(
													selectedKeys.filter((key) => key !== row[rowKey]),
												);
											}
										}}
									/>
								</td>
							)}
							{columns.map((col) => (
								<td
									key={col.key}
									className={`px-3 py-2 whitespace-nowrap text-sm text-gray-800 ${
										col.className || ""
									}`}
								>
									{col.render ? col.render(row) : row[col.key]}
								</td>
							))}
							{actions.length > 0 && (
								<td className="px-3 py-2 whitespace-nowrap">
									<div className="flex gap-2">
										{actions.map((action, i) => (
											<button
												key={i}
												className={`bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-1 rounded text-xs font-semibold transition ${
													action.className || ""
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
	);
};

export default CustomTable;
