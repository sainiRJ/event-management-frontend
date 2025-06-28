// import React, {useEffect, useState} from "react";
// import {useAppDispatch, useAppSelector} from "@/store/Hooks";
// import {fetchFinanceData} from "@/store/finance/ThunkActions";
// import {RootState} from "@/store";
// import {fetchStatus} from "@/store/status/ThunkActions";
// import {fetchServices} from "@/store/services/ThunkActions";
// import {iStatus} from "@/store/status/Types";
// import {iService} from "@/store/services/Types";
// import {ServiceFinanceData} from "@/store/finance/Types";
// import {
// 	AreaChart,
// 	Area,
// 	XAxis,
// 	YAxis,
// 	CartesianGrid,
// 	Tooltip,
// 	ResponsiveContainer,
// 	PieChart,
// 	Pie,
// 	Cell,
// 	BarChart,
// 	Bar,
// 	Legend,
// } from "recharts";
// import {
// 	ValueType,
// 	NameType,
// } from "recharts/types/component/DefaultTooltipContent";

// // Dummy data for revenue trends
// const revenueData = [
// 	{month: "Jan", revenue: 45000, expenses: 32000, profit: 13000},
// 	{month: "Feb", revenue: 52000, expenses: 34000, profit: 18000},
// 	{month: "Mar", revenue: 61000, expenses: 39000, profit: 22000},
// 	{month: "Apr", revenue: 58000, expenses: 36000, profit: 22000},
// 	{month: "May", revenue: 72000, expenses: 41000, profit: 31000},
// 	{month: "Jun", revenue: 85000, expenses: 44000, profit: 41000},
// ];

// // Dummy data for expense breakdown
// const expenseData = [
// 	{name: "Decorations", value: 35000, color: "#8884d8"},
// 	{name: "Labor", value: 25000, color: "#82ca9d"},
// 	{name: "Transportation", value: 15000, color: "#ffc658"},
// 	{name: "Marketing", value: 12000, color: "#ff8042"},
// 	{name: "Utilities", value: 8000, color: "#0088fe"},
// ];

// // Dummy data for project profitability
// const projectData = [
// 	{name: "Wedding Decor", profit: 15000},
// 	{name: "Corporate Events", profit: 12000},
// 	{name: "Birthday Parties", profit: 8000},
// 	{name: "Festival Decor", profit: 10000},
// 	{name: "Home Decor", profit: 6000},
// ];

// const FinancePage: React.FC = () => {
// 	const dispatch = useAppDispatch();
// 	const {data, isLoading, message} = useAppSelector(
// 		(state: RootState) => state.financeReducer,
// 	);
// 	const {statusList} = useAppSelector(
// 		(state: RootState) => state.statusReducer,
// 	);
// 	const {serviceList} = useAppSelector(
// 		(state: RootState) => state.serviceReducer,
// 	);

// 	const [filters, setFilters] = useState({
// 		fromDate: undefined as string | undefined,
// 		toDate: undefined as string | undefined,
// 		bookingStatusId: undefined as string | undefined,
// 		paymentStatusId: undefined as string | undefined,
// 		serviceId: undefined as string | undefined,
// 	});

// 	useEffect(() => {
// 		dispatch(fetchStatus());
// 		dispatch(fetchServices());
// 	}, [dispatch]);

// 	useEffect(() => {
// 		dispatch(fetchFinanceData(filters));
// 	}, [dispatch, filters]);

// 	const formatCurrency = (
// 		value: number | string | undefined | null,
// 	): string => {
// 		if (value === undefined || value === null || value === "") return "-";

// 		const numValue = typeof value === "string" ? parseFloat(value) : value;
// 		if (isNaN(numValue)) return "-";

// 		return new Intl.NumberFormat("en-IN", {
// 			style: "currency",
// 			currency: "INR",
// 			minimumFractionDigits: 0,
// 			maximumFractionDigits: 0,
// 		}).format(numValue);
// 	};

// 	const tooltipCurrencyFormatter = (
// 		value: ValueType,
// 		name: NameType,
// 	): string | string[] => {
// 		if (Array.isArray(value)) {
// 			return value.map(
// 				(item, index) =>
// 					`${
// 						name && Array.isArray(name) ? name[index] : name
// 					}: ${formatCurrency(item as number | string)}`,
// 			);
// 		}
// 		return `${name}: ${formatCurrency(value as number | string)}`;
// 	};

// 	const bookingStatuses = statusList
// 		.filter((status: iStatus) => status.context === "booking")
// 		.map((status: iStatus) => ({label: status.name, value: status.id}));

// 	const paymentStatuses = statusList
// 		.filter((status: iStatus) => status.context === "payment")
// 		.map((status: iStatus) => ({label: status.name, value: status.id}));

// 	const services = serviceList.map((service: iService) => ({
// 		label: service.serviceName,
// 		value: service.id,
// 	}));

// 	return (
// 		<div className="p-6 mt-10">
// 			<h1 className="text-2xl font-semibold mb-6 text-gray-800">
// 				Financial Overview
// 			</h1>

// 			{/* Filter Controls Container */}
// 			<div className="bg-white shadow-md rounded-lg p-4 mb-6">
// 				<h2 className="text-lg font-semibold mb-4 text-gray-800">Filters</h2>
// 				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
// 					{/* From Date */}
// 					<div>
// 						<label
// 							htmlFor="fromDate"
// 							className="block text-sm font-medium text-gray-700"
// 						>
// 							From Date
// 						</label>
// 						<input
// 							type="date"
// 							id="fromDate"
// 							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
// 							onChange={(e) =>
// 								setFilters({...filters, fromDate: e.target.value || undefined})
// 							}
// 							value={filters.fromDate || ""}
// 						/>
// 					</div>
// 					{/* To Date */}
// 					<div>
// 						<label
// 							htmlFor="toDate"
// 							className="block text-sm font-medium text-gray-700"
// 						>
// 							To Date
// 						</label>
// 						<input
// 							type="date"
// 							id="toDate"
// 							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
// 							onChange={(e) =>
// 								setFilters({...filters, toDate: e.target.value || undefined})
// 							}
// 							value={filters.toDate || ""}
// 						/>
// 					</div>
// 					{/* Booking Status */}
// 					<div>
// 						<label
// 							htmlFor="bookingStatus"
// 							className="block text-sm font-medium text-gray-700"
// 						>
// 							Booking Status
// 						</label>
// 						<select
// 							id="bookingStatus"
// 							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
// 							onChange={(e) =>
// 								setFilters({
// 									...filters,
// 									bookingStatusId: e.target.value || undefined,
// 								})
// 							}
// 							value={filters.bookingStatusId || ""}
// 						>
// 							<option value="">All Statuses</option>
// 							{bookingStatuses.map((status) => (
// 								<option key={status.value} value={status.value}>
// 									{status.label}
// 								</option>
// 							))}
// 						</select>
// 					</div>
// 					{/* Payment Status */}
// 					<div>
// 						<label
// 							htmlFor="paymentStatus"
// 							className="block text-sm font-medium text-gray-700"
// 						>
// 							Payment Status
// 						</label>
// 						<select
// 							id="paymentStatus"
// 							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
// 							onChange={(e) =>
// 								setFilters({
// 									...filters,
// 									paymentStatusId: e.target.value || undefined,
// 								})
// 							}
// 							value={filters.paymentStatusId || ""}
// 						>
// 							<option value="">All Statuses</option>
// 							{paymentStatuses.map((status) => (
// 								<option key={status.value} value={status.value}>
// 									{status.label}
// 								</option>
// 							))}
// 						</select>
// 					</div>
// 					{/* Service */}
// 					<div>
// 						<label
// 							htmlFor="service"
// 							className="block text-sm font-medium text-gray-700"
// 						>
// 							Service
// 						</label>
// 						<select
// 							id="service"
// 							className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
// 							onChange={(e) =>
// 								setFilters({...filters, serviceId: e.target.value || undefined})
// 							}
// 							value={filters.serviceId || ""}
// 						>
// 							<option value="">All Services</option>
// 							{services.map((service) => (
// 								<option key={service.value} value={service.value}>
// 									{service.label}
// 								</option>
// 							))}
// 						</select>
// 					</div>
// 				</div>
// 			</div>

// 			{isLoading && <p>Loading finance data...</p>}
// 			{message && <p className="text-red-500">Error: {message}</p>}

// 			{data && (
// 				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// 					{/* Key Metrics */}
// 					<div className="lg:col-span-3 bg-white shadow-md rounded-lg p-4">
// 						<h2 className="text-lg font-semibold mb-4">
// 							Key Financial Metrics
// 						</h2>
// 						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
// 							<div className="text-center p-4 bg-gray-50 rounded shadow">
// 								<h3 className="text-sm text-gray-500 mb-1">
// 									Total Revenue (Income)
// 								</h3>
// 								<p className="text-2xl font-bold text-gray-800">
// 									{formatCurrency(data.totalIncome)}
// 								</p>
// 							</div>
// 							<div className="text-center p-4 bg-gray-50 rounded shadow">
// 								<h3 className="text-sm text-gray-500 mb-1">
// 									Total Advance Payment
// 								</h3>
// 								<p className="text-2xl font-bold text-gray-800">
// 									{formatCurrency(data.totalAdvance)}
// 								</p>
// 							</div>
// 						</div>
// 					</div>

// 					{/* Service-wise Financial Breakdown */}
// 					{data.serviceWiseData && data.serviceWiseData.length > 0 && (
// 						<div className="col-span-1 lg:col-span-2 bg-white shadow-md rounded-lg p-4">
// 							<h2 className="text-lg font-semibold mb-4">
// 								Service-wise Breakdown
// 							</h2>
// 							<div className="h-[350px]">
// 								<ResponsiveContainer width="100%" height="100%">
// 									<BarChart
// 										data={data.serviceWiseData}
// 										margin={{top: 20, right: 30, left: 20, bottom: 5}}
// 									>
// 										<CartesianGrid strokeDasharray="3 3" />
// 										<XAxis dataKey="serviceName" />
// 										<YAxis
// 											tickFormatter={(value: number | string) =>
// 												formatCurrency(value)
// 											}
// 										/>
// 										<Tooltip
// 											formatter={(value: ValueType, name: NameType) =>
// 												tooltipCurrencyFormatter(value, name)
// 											}
// 										/>
// 										<Legend />
// 										<Bar dataKey="totalCost" fill="#8884d8" name="Total Cost" />
// 										<Bar
// 											dataKey="advancePayment"
// 											fill="#82ca9d"
// 											name="Advance Payment"
// 										/>
// 									</BarChart>
// 								</ResponsiveContainer>
// 							</div>
// 						</div>
// 					)}

// 					{/* Placeholder for other charts (can uncomment and adjust grid spans) */}
// 					{/*
// 					<div className="col-span-1 bg-white shadow-md rounded-lg p-4 mb-5">
// 						<h2 className="text-lg font-semibold mb-4">Revenue Trends</h2>
// 						<div className="h-[350px]">
// 							<ResponsiveContainer width="100%" height="100%">
// 								<AreaChart
// 									data={revenueData}
// 									margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
// 								>
// 									<CartesianGrid strokeDasharray="3 3" />
// 									<XAxis dataKey="month" />
// 									<YAxis tickFormatter={formatCurrency} />
// 									<Tooltip formatter={formatCurrency} />
// 									<Legend />
// 									<Area
// 										type="monotone"
// 										dataKey="revenue"
// 										stackId="1"
// 										stroke="#8884d8"
// 										fill="#8884d8"
// 										name="Revenue"
// 									/>
// 									<Area
// 										type="monotone"
// 										dataKey="expenses"
// 										stackId="1"
// 										stroke="#82ca9d"
// 										fill="#82ca9d"
// 										name="Expenses"
// 									/>
// 								</AreaChart>
// 							</ResponsiveContainer>
// 						</div>
// 					</div>

// 					<div className="col-span-1 bg-white shadow-md rounded-lg p-4 mb-5">
// 						<h2 className="text-lg font-semibold mb-4">Expense Breakdown</h2>
// 						<div className="h-[350px]">
// 							<ResponsiveContainer width="100%" height="100%">
// 								<PieChart>
// 									<Pie
// 										data={expenseData}
// 										cx="50%"
// 										cy="50%"
// 										outerRadius={100}
// 										fill="#8884d8"
// 										dataKey="value"
// 										label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
// 									>
// 										{expenseData.map((entry, index) => (
// 											<Cell key={`cell-${index}`} fill={entry.color} />
// 										))}
// 									</Pie>
// 									<Tooltip formatter={formatCurrency} />
// 									<Legend />
// 								</PieChart>
// 							</ResponsiveContainer>
// 						</div>
// 					</div>

// 					<div className="col-span-1 bg-white shadow-md rounded-lg p-4 mb-5">
// 						<h2 className="text-lg font-semibold mb-4">Project Profitability</h2>
// 						<div className="h-[350px]">
// 							<ResponsiveContainer width="100%" height="100%">
// 								<BarChart
// 									data={projectData}
// 									margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
// 								>
// 									<CartesianGrid strokeDasharray="3 3" />
// 									<XAxis dataKey="name" />
// 									<YAxis tickFormatter={formatCurrency} />
// 									<Tooltip formatter={formatCurrency} />
// 									<Bar dataKey="profit" fill="#8884d8" name="Profit" />
// 								</BarChart>
// 							</ResponsiveContainer>
// 						</div>
// 					</div>
// 					*/}
// 				</div>
// 			)}
// 		</div>
// 	);
// };

// export default FinancePage;


import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";

const initialData = {
  revenue: 125000,
  expenses: 70000,
  profit: 55000,
  pendingPayments: 15000,
  salariesPaid: 30000,
  staffOutsourceCost: 12000,
  staffCostPerEvent: 2000,
  topService: "Stage Decoration",
  cashFlow: [
    { name: "Inflow", value: 120000 },
    { name: "Outflow", value: 85000 },
  ],
  expenseBreakdown: [
    { name: "Decorations", value: 20000 },
    { name: "Catering", value: 15000 },
    { name: "Transportation", value: 10000 },
    { name: "Venue", value: 15000 },
    { name: "Marketing", value: 10000 },
    { name: "Labor", value: 10000 },
  ],
  monthlyRevenue: [
    { month: "Jan", revenue: 45000, expenses: 30000 },
    { month: "Feb", revenue: 52000, expenses: 34000 },
    { month: "Mar", revenue: 61000, expenses: 39000 },
    { month: "Apr", revenue: 58000, expenses: 36000 },
    { month: "May", revenue: 72000, expenses: 41000 },
    { month: "Jun", revenue: 85000, expenses: 44000 },
  ],
  transactions: [
    { client: "Rahul", service: "Wedding Decor", amount: 50000, date: "2025-06-01", status: "Paid" },
    { client: "Pooja", service: "Birthday Setup", amount: 15000, date: "2025-06-05", status: "Unpaid" },
    { client: "Raj", service: "Corporate Stage", amount: 30000, date: "2025-06-07", status: "Paid" },
    { client: "Simran", service: "Haldi Setup", amount: 20000, date: "2025-06-10", status: "Pending" },
  ],
};

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a4de6c"];

export default function EventFinanceDashboard() {
  const [data] = useState(initialData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 text-gray-800 space-y-10 py-8 px-4 mt-10">
      {/* Top Summary Cards */}
	  <div>
						<h1 className="m-0 text-2xl font-bold text-gray-800">Finance Overview</h1>
						<p className="text-gray-600 mt-2 text-base md:text-lg">
							{"Welcome back! Here's your finance event overview"}
						</p>
					</div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue", value: data.revenue, color: "text-blue-700" },
          { label: "Total Expenses", value: data.expenses, color: "text-red-500" },
          { label: "Net Profit", value: data.profit, color: "text-green-600" },
          { label: "Pending Payments", value: data.pendingPayments, color: "text-orange-500" },
        ].map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transition">
            <h2 className="text-sm font-medium text-gray-500 mb-1">{card.label}</h2>
            <div className={`text-3xl font-bold ${card.color}`}>₹{card.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Monthly Revenue vs Expense LineChart */}
      <div className="bg-white p-6 rounded-2xl shadow-xl">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Revenue vs Expenses (Monthly)</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#1e3a8a" name="Revenue" strokeWidth={3} />
              <Line type="monotone" dataKey="expenses" stroke="#dc2626" name="Expenses" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Expense Breakdown and Cash Flow */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4">Expense Breakdown</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.expenseBreakdown} dataKey="value" nameKey="name" outerRadius={100} label>
                  {data.expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <h2 className="text-lg font-semibold mb-4">Cash Flow Overview</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.cashFlow}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                <Bar dataKey="value" fill="#0ea5e9" barSize={40} radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Staff Cost Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <h2 className="text-sm text-gray-500">Salaries Paid</h2>
          <div className="text-2xl font-bold text-green-700">₹{data.salariesPaid.toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <h2 className="text-sm text-gray-500">Outsourced Staff Cost</h2>
          <div className="text-2xl font-bold text-blue-700">₹{data.staffOutsourceCost.toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <h2 className="text-sm text-gray-500">Avg. Staff Cost / Event</h2>
          <div className="text-2xl font-bold text-red-500">₹{data.staffCostPerEvent.toLocaleString()}</div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="bg-white p-6 rounded-2xl shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-left text-gray-600">
                <th className="py-2 px-3">Client</th>
                <th className="py-2 px-3">Service</th>
                <th className="py-2 px-3">Amount</th>
                <th className="py-2 px-3">Date</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.transactions.map((tx, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="py-2 px-3">{tx.client}</td>
                  <td className="py-2 px-3">{tx.service}</td>
                  <td className="py-2 px-3">₹{tx.amount.toLocaleString()}</td>
                  <td className="py-2 px-3">{tx.date}</td>
                  <td className={`py-2 px-3 font-medium ${
                    tx.status === "Paid" ? "text-green-600" :
                    tx.status === "Unpaid" ? "text-red-500" :
                    "text-yellow-600"}`}>{tx.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-100 p-6 rounded-2xl text-blue-800">
        <strong>Insight:</strong>
        <p className="text-sm mt-1">Top Profitable Service: {data.topService}. Consider increasing focus and marketing for this category.</p>
      </div>
    </div>
  );
}