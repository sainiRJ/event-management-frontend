import React from "react";
import {Table, Placeholder, Checkbox} from "rsuite";
import "./CustomTable.css";

const {Column, HeaderCell, Cell} = Table;

interface CustomTableProps {
	data: any[];
	loading?: boolean;
	height?: number;
	columns: {
		key: string;
		label: string;
		width?: number;
		flexGrow?: number;
		resizable?: boolean;
		render?: (rowData: any) => React.ReactNode;
	}[];
	hover?: boolean;
	wordWrap?: boolean | "break-word" | "break-all" | "keep-all";
	cellBordered?: boolean;
	autoHeight?: boolean;
	selectable?: boolean;
	selectedKeys?: string[];
	onSelectChange?: (selectedKeys: string[]) => void;
	actions?: {
		label: string;
		action: (rowData: any) => void;
		icon?: React.ReactNode;
	}[];
}

const CustomTable: React.FC<CustomTableProps> = ({
	data,
	loading = false,
	height = 400,
	columns,
	hover = true,
	wordWrap = "break-word",
	cellBordered = true,
	autoHeight = false,
	selectable = false,
	selectedKeys = [],
	onSelectChange,
	actions = [],
}) => {
	const renderLoading = () => (
		<div className="loading-placeholder">
			<Placeholder.Grid rows={8} columns={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)} active />
		</div>
	);

	const renderNoDataMessage = () => (
		<div className="no-data-message">No Data Found</div>
	);

	if (loading) {
		return renderLoading();
	}

	return (
		<Table
			cellBordered={cellBordered}
			autoHeight={autoHeight}
			height={height}
			data={data}
			hover={hover}
			wordWrap={wordWrap}
		>
			{selectable && (
				<Column width={50} fixed>
					<HeaderCell>
						<Checkbox
							checked={selectedKeys.length === data.length}
							indeterminate={selectedKeys.length > 0 && selectedKeys.length < data.length}
							onChange={(_, checked) => {
								if (checked) {
									onSelectChange?.(data.map(item => item.id));
								} else {
									onSelectChange?.([]);
								}
							}}
						/>
					</HeaderCell>
					<Cell>
						{(rowData) => (
							<Checkbox
								checked={selectedKeys.includes(rowData.id)}
								onChange={(_, checked) => {
									if (checked) {
										onSelectChange?.([...selectedKeys, rowData.id]);
									} else {
										onSelectChange?.(selectedKeys.filter(key => key !== rowData.id));
									}
								}}
							/>
						)}
					</Cell>
				</Column>
			)}
			{columns.map((column) => (
				<Column
					key={column.key}
					width={column.width}
					flexGrow={column.flexGrow}
					resizable={column.resizable}
				>
					<HeaderCell>{column.label}</HeaderCell>
					<Cell>
						{(rowData) =>
							column.render
								? column.render(rowData)
								: rowData[column.key] || renderNoDataMessage()
						}
					</Cell>
				</Column>
			))}
			{actions.length > 0 && (
				<Column width={120} fixed="right">
					<HeaderCell>Actions</HeaderCell>
					<Cell>
						{(rowData) => (
							<div className="table-actions">
								{actions.map((action, index) => (
									<button
										key={index}
										className="action-button"
										onClick={() => action.action(rowData)}
									>
										{action.icon}
										<span>{action.label}</span>
									</button>
								))}
							</div>
						)}
					</Cell>
				</Column>
			)}
		</Table>
	);
};

export default CustomTable;
