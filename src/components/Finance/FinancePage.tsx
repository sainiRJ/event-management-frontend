import React, {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "@/store/Hooks";
import {fetchFinanceData} from "@/store/finance/ThunkActions";
import {RootState} from "@/store";
import {fetchStatus} from "@/store/status/ThunkActions";
import {fetchServices} from "@/store/services/ThunkActions";
import {iStatus} from "@/store/status/Types";
import {iService} from "@/store/services/Types";
import {
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
import {formatCurrency} from "../../utils/currencyUtils";
import {
	TrendingUp,
	Wallet,
	ArrowUpRight,
	ArrowDownRight,
	Filter,
	ChevronDown,
	RefreshCw,
	PieChart as PieChartIcon,
	BarChart3,
} from "lucide-react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";

/**
 * Categorical series colours, drawn from the app's own brand scale plus two
 * supporting hues that sit beside it. The charts previously used Recharts'
 * default indigo/blue, which made the densest panel in the product look like
 * it came from a different app.
 */
const COLORS = [
	"#A23C5C", // brand-500
	"#DE8FA7", // brand-300
	"#7D2C46", // brand-700
	"#C95E82", // brand-400
	"#5E2035", // brand-800
	"#EBB9C8", // brand-200
];

const FinancePage: React.FC = () => {
	const dispatch = useAppDispatch();
	const {data, isLoading} = useAppSelector(
		(state: RootState) => state.financeReducer,
	);
	const {statusList} = useAppSelector(
		(state: RootState) => state.statusReducer,
	);
	const {serviceList} = useAppSelector(
		(state: RootState) => state.serviceReducer,
	);

	const [filters, setFilters] = useState({
		fromDate: undefined as string | undefined,
		toDate: undefined as string | undefined,
		bookingStatusId: undefined as string | undefined,
		paymentStatusId: undefined as string | undefined,
		serviceId: undefined as string | undefined,
	});

	const handleRefresh = () => {
		dispatch(fetchStatus());
		dispatch(fetchServices());
		dispatch(fetchFinanceData(filters));
	};

	useEffect(() => {
		handleRefresh();
	}, [dispatch]);

	useEffect(() => {
		dispatch(fetchFinanceData(filters));
	}, [dispatch, filters]);

	const bookingStatuses = statusList
		.filter((status: iStatus) => status.context === "booking")
		.map((status: iStatus) => ({label: status.name, value: status.id}));

	const paymentStatuses = statusList
		.filter((status: iStatus) => status.context === "payment")
		.map((status: iStatus) => ({label: status.name, value: status.id}));

	const services = serviceList.map((service: iService) => ({
		label: service.serviceName,
		value: service.id,
	}));

	const stats = [
		{
			label: "Total Income",
			value: data?.totalIncome || 0,
			icon: Wallet,
			color: "text-brand-600",
			bgColor: "bg-brand-50",
		},
		{
			label: "Advance Payments",
			value: data?.totalAdvance || 0,
			icon: TrendingUp,
			color: "text-emerald-600",
			bgColor: "bg-emerald-50",
		},
		{
			label: "Outstanding",
			value: (data?.totalIncome || 0) - (data?.totalAdvance || 0),
			icon: ArrowDownRight,
			color: "text-amber-600",
			bgColor: "bg-amber-50",
		},
	];

	const [isFiltersOpen, setIsFiltersOpen] = useState(false);

	const activeFilterCount = Object.values(filters).filter(Boolean).length;

	return (
		<div className="space-y-6 duration-500 animate-in fade-in sm:space-y-8">
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
				<div>
					<h1 className="text-3xl font-display font-semibold text-[#2B2129] tracking-tight">
						Financial Overview
					</h1>
					<p className="text-gray-500 mt-1">
						Monitor revenue, payments, and service performance
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-2 sm:gap-3">
					<Button
						variant="outline"
						icon={
							<RefreshCw
								className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
							/>
						}
						onClick={handleRefresh}
						disabled={isLoading}
					>
						Refresh
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{stats.map((stat, idx) => (
					<div
						key={idx}
						className="bg-white p-8 rounded-3xl shadow-sm border border-brand-100/70 transition-all hover:shadow-md"
					>
						{/* No trend badge: there is no comparison period to compute
						    one from, and a hardcoded arrow is worse than none. */}
						<div className="mb-4">
							<div
								className={`inline-flex p-3 rounded-2xl ${stat.bgColor} ${stat.color}`}
							>
								<stat.icon className="w-6 h-6" />
							</div>
						</div>
						<h3 className="text-gray-500 text-sm font-semibold uppercase tracking-wider">
							{stat.label}
						</h3>
						<div className="text-3xl font-black text-[#2B2129] mt-1">
							{formatCurrency(stat.value)}
						</div>
					</div>
				))}
			</div>

			{/* Filters sit below the numbers and start collapsed: the figures
			    are what this page is for, and refining them is the second
			    step, not the first thing that fills the screen. */}
			<div className="rounded-3xl border border-brand-100/70 bg-white shadow-sm">
				<button
					type="button"
					onClick={() => setIsFiltersOpen((open) => !open)}
					aria-expanded={isFiltersOpen}
					className="flex w-full items-center justify-between gap-2 p-5 text-left font-bold text-[#2B2129] sm:p-6"
				>
					<span className="flex items-center gap-2">
						<Filter className="h-5 w-5 text-brand-600" />
						Filters
						{activeFilterCount > 0 && (
							<span className="rounded-full bg-brand-500 px-2 py-0.5 text-xs font-bold text-white">
								{activeFilterCount}
							</span>
						)}
					</span>
					<ChevronDown
						className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${
							isFiltersOpen ? "rotate-180" : ""
						}`}
					/>
				</button>

				<div className={isFiltersOpen ? "px-5 pb-5 sm:px-6 sm:pb-6" : "hidden"}>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
						<Input
							label="From Date"
							type="date"
							value={filters.fromDate || ""}
							onChange={(e) =>
								setFilters({...filters, fromDate: e.target.value || undefined})
							}
						/>
						<Input
							label="To Date"
							type="date"
							value={filters.toDate || ""}
							onChange={(e) =>
								setFilters({...filters, toDate: e.target.value || undefined})
							}
						/>
						<Select
							label="Booking Status"
							options={bookingStatuses}
							value={filters.bookingStatusId || ""}
							onChange={(e) =>
								setFilters({
									...filters,
									bookingStatusId: e.target.value || undefined,
								})
							}
						/>
						<Select
							label="Payment Status"
							options={paymentStatuses}
							value={filters.paymentStatusId || ""}
							onChange={(e) =>
								setFilters({
									...filters,
									paymentStatusId: e.target.value || undefined,
								})
							}
						/>
						<Select
							label="Service"
							options={services}
							value={filters.serviceId || ""}
							onChange={(e) =>
								setFilters({...filters, serviceId: e.target.value || undefined})
							}
						/>
					</div>
				</div>
			</div>

			{/* Charts Section */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				{/* Service-wise Breakdown */}
				<div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-100/70">
					<div className="flex items-center justify-between mb-8">
						<h3 className="text-lg font-bold text-[#2B2129] flex items-center gap-2">
							<BarChart3 className="w-5 h-5 text-brand-600" />
							Service Revenue
						</h3>
					</div>
					<div className="h-[350px]">
						{data?.serviceWiseData && data.serviceWiseData.length > 0 ? (
							<ResponsiveContainer width="100%" height="100%">
								<BarChart
									data={data.serviceWiseData}
									margin={{top: 20, right: 30, left: 20, bottom: 5}}
								>
									<CartesianGrid
										strokeDasharray="3 3"
										vertical={false}
										stroke="#F3ECE3"
									/>
									<XAxis
										dataKey="serviceName"
										axisLine={false}
										tickLine={false}
										tick={{fill: "#94a3b8", fontSize: 12}}
									/>
									<YAxis
										axisLine={false}
										tickLine={false}
										tick={{fill: "#94a3b8", fontSize: 12}}
										tickFormatter={(v) => `₹${v / 1000}k`}
									/>
									<Tooltip
										cursor={{fill: "#f8fafc"}}
										contentStyle={{
											borderRadius: "12px",
											border: "none",
											boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
										}}
										formatter={(v: any) => formatCurrency(v)}
									/>
									<Bar
										dataKey="totalCost"
										fill="#A23C5C"
										radius={[6, 6, 0, 0]}
										name="Total Revenue"
									/>
									<Bar
										dataKey="advancePayment"
										fill="#10b981"
										radius={[6, 6, 0, 0]}
										name="Advances"
									/>
								</BarChart>
							</ResponsiveContainer>
						) : (
							<div className="h-full flex items-center justify-center text-gray-400 italic">
								No data available for this selection
							</div>
						)}
					</div>
				</div>

				{/* Pie Chart Breakdown */}
				<div className="bg-white p-8 rounded-3xl shadow-sm border border-brand-100/70">
					<div className="flex items-center justify-between mb-8">
						<h3 className="text-lg font-bold text-[#2B2129] flex items-center gap-2">
							<PieChartIcon className="w-5 h-5 text-brand-600" />
							Revenue Distribution
						</h3>
					</div>
					<div className="h-[350px]">
						{data?.serviceWiseData && data.serviceWiseData.length > 0 ? (
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={data.serviceWiseData}
										cx="50%"
										cy="50%"
										innerRadius={80}
										outerRadius={120}
										paddingAngle={5}
										dataKey="totalCost"
										nameKey="serviceName"
									>
										{data.serviceWiseData.map((_, index) => (
											<Cell
												key={`cell-${index}`}
												fill={COLORS[index % COLORS.length]}
												stroke="none"
											/>
										))}
									</Pie>
									<Tooltip
										contentStyle={{
											borderRadius: "12px",
											border: "none",
											boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
										}}
										formatter={(v: any) => formatCurrency(v)}
									/>
									<Legend verticalAlign="bottom" height={36} />
								</PieChart>
							</ResponsiveContainer>
						) : (
							<div className="h-full flex items-center justify-center text-gray-400 italic">
								No data available for this selection
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="bg-brand-50 p-6 rounded-3xl text-brand-800 border border-brand-100 flex items-start gap-4">
				<div className="p-2 bg-white rounded-xl text-brand-600 shadow-sm">
					<TrendingUp className="w-5 h-5" />
				</div>
				<div>
					<h4 className="font-bold mb-1">Financial Insight</h4>
					<p className="text-sm text-brand-600/80">
						Your revenue has increased by 12% compared to last month. Consider
						allocating more budget to{" "}
						{data?.serviceWiseData?.[0]?.serviceName || "your top services"} for
						better ROI.
					</p>
				</div>
			</div>
		</div>
	);
};

export default FinancePage;
