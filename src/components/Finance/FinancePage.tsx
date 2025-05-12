


import React from "react";
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

// Dummy data for revenue trends
const revenueData = [
	{ month: "Jan", revenue: 45000, expenses: 32000, profit: 13000 },
	{ month: "Feb", revenue: 52000, expenses: 34000, profit: 18000 },
	{ month: "Mar", revenue: 61000, expenses: 39000, profit: 22000 },
	{ month: "Apr", revenue: 58000, expenses: 36000, profit: 22000 },
	{ month: "May", revenue: 72000, expenses: 41000, profit: 31000 },
	{ month: "Jun", revenue: 85000, expenses: 44000, profit: 41000 },
];

// Dummy data for expense breakdown
const expenseData = [
	{ name: "Decorations", value: 35000, color: "#8884d8" },
	{ name: "Labor", value: 25000, color: "#82ca9d" },
	{ name: "Transportation", value: 15000, color: "#ffc658" },
	{ name: "Marketing", value: 12000, color: "#ff8042" },
	{ name: "Utilities", value: 8000, color: "#0088fe" },
];

// Dummy data for project profitability
const projectData = [
	{ name: "Wedding Decor", profit: 15000 },
	{ name: "Corporate Events", profit: 12000 },
	{ name: "Birthday Parties", profit: 8000 },
	{ name: "Festival Decor", profit: 10000 },
	{ name: "Home Decor", profit: 6000 },
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
		<div className="p-6 mt-10">
			<h1 className="text-2xl font-semibold mb-6 text-gray-800">
				Financial Overview
			</h1>

			<div className="flex flex-wrap gap-5">
				{/* Revenue Overview */}
				<div className="flex-1 min-w-[300px] md:min-w-[400px] bg-white shadow-md rounded-lg p-4 mb-5">
					<h2 className="text-lg font-semibold mb-4">Revenue Trends</h2>
					<div className="h-[350px]">
						<ResponsiveContainer width="100%" height="100%">
							<AreaChart
								data={revenueData}
								margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
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
					</div>
				</div>

				{/* Expense Breakdown */}
				<div className="flex-1 min-w-[300px] md:min-w-[400px] bg-white shadow-md rounded-lg p-4 mb-5">
					<h2 className="text-lg font-semibold mb-4">Expense Breakdown</h2>
					<div className="h-[350px]">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={expenseData}
									cx="50%"
									cy="50%"
									outerRadius={100}
									fill="#8884d8"
									dataKey="value"
									label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
								>
									{expenseData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip formatter={formatCurrency} />
								<Legend />
							</PieChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Project Profitability */}
				<div className="flex-1 min-w-[300px] md:min-w-[400px] bg-white shadow-md rounded-lg p-4 mb-5">
					<h2 className="text-lg font-semibold mb-4">Project Profitability</h2>
					<div className="h-[350px]">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={projectData}
								margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
							>
								<CartesianGrid strokeDasharray="3 3" />
								<XAxis dataKey="name" />
								<YAxis tickFormatter={formatCurrency} />
								<Tooltip formatter={formatCurrency} />
								<Bar dataKey="profit" fill="#8884d8" name="Profit" />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* Key Metrics */}
				<div className="w-full bg-white shadow-md rounded-lg p-4 mb-5">
					<h2 className="text-lg font-semibold mb-4">Key Financial Metrics</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
						<div className="text-center p-4 bg-gray-50 rounded shadow">
							<h3 className="text-sm text-gray-500 mb-1">Total Revenue</h3>
							<p className="text-2xl font-bold text-gray-800">
								{formatCurrency(373000)}
							</p>
						</div>
						<div className="text-center p-4 bg-gray-50 rounded shadow">
							<h3 className="text-sm text-gray-500 mb-1">Total Expenses</h3>
							<p className="text-2xl font-bold text-gray-800">
								{formatCurrency(226000)}
							</p>
						</div>
						<div className="text-center p-4 bg-gray-50 rounded shadow">
							<h3 className="text-sm text-gray-500 mb-1">Net Profit</h3>
							<p className="text-2xl font-bold text-gray-800">
								{formatCurrency(147000)}
							</p>
						</div>
						<div className="text-center p-4 bg-gray-50 rounded shadow">
							<h3 className="text-sm text-gray-500 mb-1">Profit Margin</h3>
							<p className="text-2xl font-bold text-gray-800">39.4%</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default FinancePage;
