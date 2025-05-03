import React from "react";
import {Stack, Panel} from "rsuite";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	BarChart,
	Bar,
	Legend,
} from "recharts";
import "./FinancePage.css";

// Dummy data for revenue trends
const revenueData = [
	{month: "Jan", revenue: 45000, expenses: 32000, profit: 13000},
	{month: "Feb", revenue: 52000, expenses: 34000, profit: 18000},
	{month: "Mar", revenue: 61000, expenses: 39000, profit: 22000},
	{month: "Apr", revenue: 58000, expenses: 36000, profit: 22000},
	{month: "May", revenue: 72000, expenses: 41000, profit: 31000},
	{month: "Jun", revenue: 85000, expenses: 44000, profit: 41000},
];

// Dummy data for expense breakdown
const expenseData = [
	{name: "Decorations", value: 35000, color: "#8884d8"},
	{name: "Labor", value: 25000, color: "#82ca9d"},
	{name: "Transportation", value: 15000, color: "#ffc658"},
	{name: "Marketing", value: 12000, color: "#ff8042"},
	{name: "Utilities", value: 8000, color: "#0088fe"},
];

// Dummy data for project profitability
const projectData = [
	{name: "Wedding Decor", profit: 15000},
	{name: "Corporate Events", profit: 12000},
	{name: "Birthday Parties", profit: 8000},
	{name: "Festival Decor", profit: 10000},
	{name: "Home Decor", profit: 6000},
];

const FinancePage: React.FC = () => {
	const formatCurrency = (value: number) => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(value);
	};

	return (
		<div className="finance-page">
			<h1>Financial Overview</h1>

			<Stack wrap spacing={20}>
				{/* Revenue Overview */}
				<Panel
					className="chart-panel revenue-panel"
					header="Revenue Trends"
					bordered
				>
					<ResponsiveContainer width="100%" height={300}>
						<AreaChart
							data={revenueData}
							margin={{top: 10, right: 30, left: 0, bottom: 0}}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="month" />
							<YAxis tickFormatter={formatCurrency} />
							<Tooltip formatter={formatCurrency} />
							<Legend />
							<Area
								type="monotone"
								dataKey="revenue"
								stackId="1"
								stroke="#8884d8"
								fill="#8884d8"
								name="Revenue"
							/>
							<Area
								type="monotone"
								dataKey="expenses"
								stackId="1"
								stroke="#82ca9d"
								fill="#82ca9d"
								name="Expenses"
							/>
						</AreaChart>
					</ResponsiveContainer>
				</Panel>

				{/* Expense Breakdown */}
				<Panel
					className="chart-panel expense-panel"
					header="Expense Breakdown"
					bordered
				>
					<ResponsiveContainer width="100%" height={300}>
						<PieChart>
							<Pie
								data={expenseData}
								cx="50%"
								cy="50%"
								outerRadius={100}
								fill="#8884d8"
								dataKey="value"
								label={({name, value}) => `${name}: ${formatCurrency(value)}`}
							>
								{expenseData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={entry.color} />
								))}
							</Pie>
							<Tooltip formatter={formatCurrency} />
							<Legend />
						</PieChart>
					</ResponsiveContainer>
				</Panel>

				{/* Project Profitability */}
				<Panel
					className="chart-panel profit-panel"
					header="Project Profitability"
					bordered
				>
					<ResponsiveContainer width="100%" height={300}>
						<BarChart
							data={projectData}
							margin={{top: 20, right: 30, left: 20, bottom: 5}}
						>
							<CartesianGrid strokeDasharray="3 3" />
							<XAxis dataKey="name" />
							<YAxis tickFormatter={formatCurrency} />
							<Tooltip formatter={formatCurrency} />
							<Bar dataKey="profit" fill="#8884d8" name="Profit" />
						</BarChart>
					</ResponsiveContainer>
				</Panel>

				{/* Key Metrics */}
				<Panel
					className="metrics-panel"
					header="Key Financial Metrics"
					bordered
				>
					<div className="metrics-grid">
						<div className="metric-item">
							<h3>Total Revenue</h3>
							<p>{formatCurrency(373000)}</p>
						</div>
						<div className="metric-item">
							<h3>Total Expenses</h3>
							<p>{formatCurrency(226000)}</p>
						</div>
						<div className="metric-item">
							<h3>Net Profit</h3>
							<p>{formatCurrency(147000)}</p>
						</div>
						<div className="metric-item">
							<h3>Profit Margin</h3>
							<p>39.4%</p>
						</div>
					</div>
				</Panel>
			</Stack>
		</div>
	);
};

export default FinancePage;
