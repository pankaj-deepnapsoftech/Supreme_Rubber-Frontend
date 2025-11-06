import React, { useState, useEffect } from "react";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { LuNotebookText } from "react-icons/lu";
import { ArrowDropDown } from "@mui/icons-material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { GiNotebook } from "react-icons/gi";
import { BsPeople } from "react-icons/bs";
import DashboardTable from "./DashboardTable";
import { useBomContext } from "@/Context/BomContext";

import {
  LineChart,
  Line,
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
} from "recharts";
import DashboardSupplier from "./DashboardSupplier";

import { useInventory } from "../../Context/InventoryContext";
import { useGatemenContext } from "@/Context/GatemenContext";
import { usePurchanse_Order } from "@/Context/PurchaseOrderContext";
import { useSupplierContext } from "@/Context/SuplierContext";
import { useProductionContext } from "@/Context/ProductionContext";
import axiosHandler from "@/config/axiosconfig";
import { useNavigate } from "react-router-dom";

export default function DashboardMain() {
  const { GetAllPurchaseOrders } = usePurchanse_Order();
  // removed unused getAllProduction
  const { getAllSupplier } = useSupplierContext();

  const { boms } = useBomContext();
  const { totalProductions } = useProductionContext();

  const [period, setPeriod] = useState("Weekly");
  const [orders, setOrders] = useState([]);
  // removed unused production state
  const [supplier, setSupplier] = useState([]);
  const [lineData, setLineData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [loadingProductionGraph, setLoadingProductionGraph] = useState(false);
  const [inventoryPeriod, setInventoryPeriod] = useState("Weekly");
  const [inventoryLoading, setInventoryLoading] = useState(false);

  // Fetch production graph data from API
  const fetchProductionGraphData = async (
    selectedPeriod = period,
    year = selectedYear
  ) => {
    setLoadingProductionGraph(true);
    try {
      const params = new URLSearchParams({
        period: selectedPeriod.toLowerCase(),
      });

      if (selectedPeriod.toLowerCase() === "yearly") {
        params.append("year", year);
      }

      const response = await axiosHandler.get(
        `/production/dashboard/graph?${params}`,
        {
          withCredentials: true,
        }
      );

      if (response.data?.success) {
        const graphData = response.data.data.graphData;

        // Transform data for the chart
        const chartData = graphData.map((item) => ({
          ...item,
          productions: item.productions, // Single line for production count
        }));

        setLineData(chartData);
      }
    } catch (error) {
      console.error("Error fetching production graph data:", error);
      // Fallback to dummy data on error
      setLineData(getDefaultData(selectedPeriod));
    } finally {
      setLoadingProductionGraph(false);
    }
  };

  // Default data fallback
  const getDefaultData = (period) => {
    switch (period) {
      case "Weekly":
        return [
          { day: "Mon", productions: 0 },
          { day: "Tue", productions: 0 },
          { day: "Wed", productions: 0 },
          { day: "Thu", productions: 0 },
          { day: "Fri", productions: 0 },
          { day: "Sat", productions: 0 },
          { day: "Sun", productions: 0 },
        ];
      case "Monthly":
        return Array.from({ length: 30 }, (_, i) => ({
          date: (i + 1).toString(),
          productions: 0,
        }));
      case "Yearly":
        return [
          { month: "Jan", productions: 0 },
          { month: "Feb", productions: 0 },
          { month: "Mar", productions: 0 },
          { month: "Apr", productions: 0 },
          { month: "May", productions: 0 },
          { month: "Jun", productions: 0 },
          { month: "Jul", productions: 0 },
          { month: "Aug", productions: 0 },
          { month: "Sep", productions: 0 },
          { month: "Oct", productions: 0 },
          { month: "Nov", productions: 0 },
          { month: "Dec", productions: 0 },
        ];
      default:
        return [];
    }
  };

  const navigate = useNavigate();

  // demo datasets removed

  // 👇 Auto-update graph when period or year changes
  useEffect(() => {
    fetchProductionGraphData(period, selectedYear);
  }, [period, selectedYear]);

  // Fetch inventory stats for Inventory card based on its own filter
  useEffect(() => {
    const fetchInventoryStats = async () => {
      try {
        setInventoryLoading(true);
        const params = new URLSearchParams();
        params.set("period", inventoryPeriod.toLowerCase());
        const { data } = await axiosHandler.get(`/product/inventory-stats?${params.toString()}`);
        const byCategory = data?.data?.byCategory || [];
        const colors = ["#FBBF24", "#A78BFA", "#3B82F6", "#F87171", "#10B981", "#f59e0b", "#ef4444"];
        const coloredData = byCategory.map((d, i) => ({
          name: d.category,
          value: d.count,
          color: colors[i % colors.length],
        }));
        setPieDataInventory(coloredData);
      } catch (err) {
        console.error("Error fetching inventory stats", err);
        setPieDataInventory([]);
      } finally {
        setInventoryLoading(false);
      }
    };
    fetchInventoryStats();
  }, [inventoryPeriod]);

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const res = await GetAllPurchaseOrders();
        const sup = await getAllSupplier();

        setOrders(res);
        setSupplier(sup);
      } catch (error) {
        console.error("Error fetching purchase orders:", error);
      }
    };

    fetchProductData();
  }, []);

  const productCount = orders?.pos?.length;
  // removed unused productionCount
  const Supplier = supplier?.length;

  // inventory pie chart
  const [pieDataInventory, setPieDataInventory] = useState([]);
  const { products, getAllProducts } = useInventory();
  useEffect(() => {
    if (products && products.length > 0) {
      const categoryCounts = products.reduce((acc, p) => {
        const category = p.category || "Uncategorized";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      const formatted = Object.entries(categoryCounts).map(
        ([category, count]) => ({
          name: category,
          value: count,
        })
      );

      const colors = ["#FBBF24", "#A78BFA", "#3B82F6", "#F87171", "#10B981"];
      const coloredData = formatted.map((d, i) => ({
        ...d,
        color: colors[i % colors.length],
      }));

      setPieDataInventory(coloredData);
    }
  }, [products]);

  useEffect(() => {
    getAllProducts();
  }, []);

  // gate man entry
  const { GetAllPOData } = useGatemenContext();
  const [gateChartData, setGateChartData] = useState([]);
  const [gatePeriod, setGatePeriod] = useState("Weekly");
  const [gateLoading, setGateLoading] = useState(false);
  const [qcChartData, setQcChartData] = useState([]);
  const [qcPeriod, setQcPeriod] = useState("Weekly");
  const [qcLoading, setQcLoading] = useState(false);
  useEffect(() => {
    const fetchGateStats = async () => {
      try {
        setGateLoading(true);
        const params = new URLSearchParams();
        params.set("period", gatePeriod.toLowerCase());
        const res = await axiosHandler.get(`/gateman/status-stats?${params.toString()}`, { withCredentials: true });
        const d = res.data?.data || { created: 0, verified: 0 };
        const items = [
          { name: "Created", value: d.created || 0, color: "#3B82F6" },
          { name: "Verified", value: d.verified || 0, color: "#10B981" },
        ];
        setGateChartData(items);
      } catch (err) {
        console.error("Fetch gate status stats error:", err);
        setGateChartData([]);
      } finally {
        setGateLoading(false);
      }
    };
    fetchGateStats();
  }, [gatePeriod]);

  // QC stats
  useEffect(() => {
    const fetchQcStats = async () => {
      try {
        setQcLoading(true);
        const params = new URLSearchParams();
        params.set("period", qcPeriod.toLowerCase());
        const res = await axiosHandler.get(`/production/qc-stats?${params.toString()}`, { withCredentials: true });
        const d = res.data?.data || { approved: 0, rejected: 0 };
        const items = [
          { name: "Approved", value: d.approved || 0, color: "#10B981" },
          { name: "Rejected", value: d.rejected || 0, color: "#F87171" },
        ];
        setQcChartData(items);
      } catch (err) {
        console.error("Fetch QC stats error:", err);
        setQcChartData([]);
      } finally {
        setQcLoading(false);
      }
    };
    fetchQcStats();
  }, [qcPeriod]);

  // removed unused productionData state
  const [statusCount, setStatusCount] = useState({ completed: 0, inProgress: 0, notStarted: 0 });
  const [statusPeriod, setStatusPeriod] = useState("Weekly");
  const [statusLoading, setStatusLoading] = useState(false);

  const pieDataStatus = [
    { name: "Completed", value: statusCount.completed, color: "#00C49F" },
    { name: "In Progress", value: statusCount.inProgress, color: "#FFBB28" },
    { name: "Pending", value: statusCount.notStarted, color: "#FF8042" },
  ];

  const [prodBarPeriod, setProdBarPeriod] = useState("Weekly");
  const [prodBarLoading, setProdBarLoading] = useState(false);
  const [barData, setBarData] = useState([
    { name: "Production", completed: 0, notCompleted: 0 },
  ]);

  useEffect(() => {
    const fetchProdBarStats = async () => {
      try {
        setProdBarLoading(true);
        const params = new URLSearchParams();
        params.set("period", prodBarPeriod.toLowerCase());
        const res = await axiosHandler.get(`/production/status-stats?${params.toString()}`, { withCredentials: true });
        const d = res.data?.data || { pending: 0, in_progress: 0, completed: 0 };
        setBarData([
          {
            name: "Production",
            completed: d.completed || 0,
            notCompleted: (d.in_progress || 0) + (d.pending || 0),
          },
        ]);
      } catch (err) {
        console.error("Fetch production bar stats error:", err);
        setBarData([{ name: "Production", completed: 0, notCompleted: 0 }]);
      } finally {
        setProdBarLoading(false);
      }
    };
    fetchProdBarStats();
  }, [prodBarPeriod]);

  useEffect(() => {
    const fetchStatusStats = async () => {
      try {
        setStatusLoading(true);
        const params = new URLSearchParams();
        params.set("period", statusPeriod.toLowerCase());
        const res = await axiosHandler.get(`/production/status-stats?${params.toString()}`, { withCredentials: true });
        const d = res.data?.data || { pending: 0, in_progress: 0, completed: 0 };
        setStatusCount({
          completed: d.completed || 0,
          inProgress: d.in_progress || 0,
          notStarted: d.pending || 0,
        });
      } catch (err) {
        console.error("Fetch production status stats error:", err);
        setStatusCount({ completed: 0, inProgress: 0, notStarted: 0 });
      } finally {
        setStatusLoading(false);
      }
    };
    fetchStatusStats();
  }, [statusPeriod]);

  // demo donut removed

  return (
    <>
      <div>
        <p className="text-[20px] font-semibold text-gray-500 ml-6">
          Dashboard
        </p>
        <div>
          {/* CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full px-2 mt-4">
            {/* CARD - Purchase Order */}
            <div
              onClick={() => navigate("/purchase-order")}
              className="border border-[#fb7777] bg-[#f8dddd] rounded-[10px] p-2.5 flex justify-between items-center h-30 shadow-sm 
hover:shadow-lg hover:-translate-y-1 hover:bg-[#fce5e5] transition-all duration-300 ease-in-out cursor-pointer"
            >
              <div className="flex flex-col">
                <p className="text-[16px] text-gray-700">Purchase Order</p>
                <p className="text-[24px] text-gray-700 font-semibold">
                  {productCount}
                </p>
                <p className="text-[13px] text-gray-600">
                  <span className="text-[12px] text-green-400 flex items-center">
                    5 <ArrowDropUpIcon className="mt-0.5" />
                  </span>
                  &nbsp;v/s last month
                </p>
              </div>
              <div className="flex items-center justify-center h-10 w-10 bg-[#ffe9e9] rounded-full group-hover:scale-110 transition-transform duration-300">
                <LuNotebookText className="text-[#fb7777] text-xl" />
              </div>
            </div>

            {/* CARD - Total Production */}
            <div
              onClick={() => navigate("/production/start")}
              className="border border-[#99db9f] bg-[#d6f7d7] rounded-[10px] p-2.5 flex justify-between items-center h-30 shadow-sm
hover:shadow-lg hover:-translate-y-1 hover:bg-[#e5fbe6] transition-all duration-300 ease-in-out cursor-pointer"
            >
              <div className="flex flex-col">
                <p className="text-[16px] text-gray-700">Total Production</p>
                <p className="text-[24px] text-gray-700 font-semibold">
                  {totalProductions}
                </p>
                <p className="text-[13px] text-gray-600">
                  <span className="text-[12px] text-red-400 flex items-center">
                    2 <ArrowDropDown className="mb-0.5" />
                  </span>
                  &nbsp;v/s last month
                </p>
              </div>
              <div className="flex items-center justify-center h-10 w-10 bg-[#eafbed] rounded-full transition-transform duration-300 hover:scale-110">
                <CheckCircleOutlineIcon className="text-[#58c468] text-xl" />
              </div>
            </div>

            {/* CARD - Total BOM */}
            <div
              onClick={() => navigate("/production/bom")}
              className="border border-[#efb777] bg-[#f8e7d0] rounded-[10px] p-2.5 flex justify-between items-center h-30 shadow-sm
hover:shadow-lg hover:-translate-y-1 hover:bg-[#faeddc] transition-all duration-300 ease-in-out cursor-pointer"
            >
              <div className="flex flex-col">
                <p className="text-[16px] text-gray-700">Total BOM</p>
                <p className="text-[24px] text-gray-700 font-semibold">
                  {boms.length}
                </p>
                <p className="text-[13px] text-gray-600">
                  <span className="text-[12px] text-green-400 flex items-center">
                    1 <ArrowDropUpIcon className="mb-0.5" />
                  </span>
                  &nbsp;v/s last month
                </p>
              </div>
              <div className="flex items-center justify-center h-10 w-10 bg-[#fcefe0] rounded-full transition-transform duration-300 hover:scale-110">
                <GiNotebook className="text-[#efb777] text-xl" />
              </div>
            </div>

            {/* CARD - Total Suppliers */}
            <div
              onClick={() => navigate("/supplier")}
              className="border border-[#0ed8ef] bg-[#d6f8fa] rounded-[10px] p-2.5 flex justify-between items-center h-30 shadow-sm
hover:shadow-lg hover:-translate-y-1 hover:bg-[#e0fbfd] transition-all duration-300 ease-in-out cursor-pointer"
            >
              <div className="flex flex-col">
                <p className="text-[16px] text-gray-700">Total Suppliers</p>
                <p className="text-[24px] text-gray-700 font-semibold">
                  {Supplier}
                </p>
                <p className="text-[13px] text-gray-600">
                  <span className="text-[12px] text-gray-400 flex items-center">
                    0 <ArrowDropUpIcon className="mb-0.5" />
                  </span>
                  &nbsp;v/s last month
                </p>
              </div>
              <div className="flex items-center justify-center h-10 w-10 bg-[#e7fdff] rounded-full transition-transform duration-300 hover:scale-110">
                <BsPeople className="text-[#0ed8ef] text-xl" />
              </div>
            </div>
          </div>

          {/* Sales Overview GRAPHS */}

          <div className="p-6 flex flex-wrap  bg-gray-50 min-h-screen">
            {/* Production Graph */}
            {/* Row: Production Graph + Inventory */}
            <div className="flex flex-col lg:flex-row gap-6 w-full">
              {/* Production Graph */}
              <div className="flex-1 bg-white h-auto lg:h-[400px] rounded-2xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-3">
                  <h2 className="font-semibold text-gray-700 text-lg">
                    Production Graph
                  </h2>
                  <div className="flex flex-wrap gap-2 items-center">
                    {["Weekly", "Monthly", "Yearly"].map((p) => (
                      <button
                        key={p}
                        onClick={() => {
                          setPeriod(p);
                          fetchProductionGraphData(p, selectedYear);
                        }}
                        className={`px-3 py-1 text-sm rounded-md transition cursor-pointer ${
                          p === period
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {p}
                      </button>
                    ))}

                    {/* Show Year Select only when 'Yearly' is active */}
                    {period === "Yearly" && (
                      <select
                        className="ml-2 border border-gray-300 text-sm rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={selectedYear}
                        onChange={(e) => {
                          const newYear = Number(e.target.value);
                          setSelectedYear(newYear);
                          fetchProductionGraphData(period, newYear);
                        }}
                      >
                        {[2025, 2024, 2023, 2022, 2021, 2020].map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="w-full overflow-x-auto">
                  {loadingProductionGraph ? (
                    <div className="flex items-center justify-center h-[250px]">
                      <div className="text-gray-500">
                        Loading production data...
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer
                      width="100%"
                      height={250}
                      className="mt-[30px]"
                    >
                      <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis
                          dataKey={
                            period === "Weekly"
                              ? "day"
                              : period === "Monthly"
                              ? "date"
                              : "month"
                          }
                          stroke="#6B7280"
                        />
                        <YAxis stroke="#6B7280" />
                        <Tooltip
                          formatter={(value) => [value, "Productions"]}
                          labelFormatter={(label) => {
                            if (period === "Weekly") return `Day: ${label}`;
                            if (period === "Monthly") return `Date: ${label}`;
                            return `Month: ${label}`;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="productions"
                          stroke="#3B82F6"
                          strokeWidth={3}
                          dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                          activeDot={{
                            r: 6,
                            stroke: "#3B82F6",
                            strokeWidth: 2,
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Inventory */}
              <div className="w-full lg:w-[400px] h-auto lg:h-[400px] bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between">
                  <h2 className="font-semibold text-gray-800 text-[15px]">
                    Inventory
                  </h2>
                  <select
                    className="border border-gray-200 cursor-pointer text-xs hover:bg-[#cd9cf2]/10 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#4b3266]"
                    value={inventoryPeriod}
                    onChange={(e) => setInventoryPeriod(e.target.value)}
                  >
                    <option className="text-gray-500" value="Weekly">Weekly</option>
                    <option className="text-gray-500" value="Monthly">Monthly</option>
                    <option className="text-gray-500" value="Yearly">Yearly</option>
                  </select>
                </div>

                {inventoryLoading ? (
                  <div className="flex items-center justify-center h-[300px] text-gray-500">Loading inventory...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieDataInventory}
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label
                      >
                        {pieDataInventory.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-4">
              {/* Production Status */}
              <div className="flex-1 min-w-[300px] h-[300px] bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between">
                  <h2 className="font-semibold text-gray-800 text-[15px]">
                    Production Status
                  </h2>
                  <div className="flex">
                    <select
                      className="border border-gray-200 cursor-pointer text-xs hover:bg-[#cd9cf2]/10 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#4b3266]"
                      value={statusPeriod}
                      onChange={(e) => setStatusPeriod(e.target.value)}
                    >
                      <option className="text-gray-500" value="Weekly">Weekly</option>
                      <option value="Monthly">Monthly</option>
                      <option  value="Yearly">Yearly</option>
                    </select>
                  </div>
                </div>
                {statusLoading ? (
                  <div className="flex items-center justify-center h-[200px] text-gray-500">Loading status...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200} className="">
                    <PieChart>
                      <Pie
                        data={pieDataStatus}
                        dataKey="value"
                        outerRadius={80}
                        label
                      >
                        {pieDataStatus.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Production */}

              {/* <div className="bg-white rounded-2xl p-5 h-[300px] shadow-sm w-full">
                <div className="flex justify-between">
                  <h2 className="font-semibold text-gray-800 text-[15px]">
                    Production
                  </h2>
                  <div className="flex">
                    <select
                      className="border border-gray-200 cursor-pointer text-xs hover:bg-[#cd9cf2]/10 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#4b3266]"
                      value={prodBarPeriod}
                      onChange={(e) => setProdBarPeriod(e.target.value)}
                    >
                      <option className="text-gray-500" value="Weekly">Weekly</option>
                      <option className=" text-gray-500" value="Monthly">Monthly</option>
                      <option className=" text-gray-500" value="Yearly">Yearly</option>
                    </select>
                  </div>
                </div>
                {prodBarLoading ? (
                  <div className="flex items-center justify-center h-[200px] text-gray-500">Loading production...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip />
                      <Bar dataKey="completed" fill="#3B82F6" />
                      <Bar dataKey="notCompleted" fill="#EC4899" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div> */}

              {/* Gate Entry */}
              <div className="bg-white rounded-2xl h-[300px] p-5 shadow-sm w-full">
                <div className="flex justify-between">
                  <h2 className="font-semibold text-gray-800 text-[15px]">
                    Gate Entry
                  </h2>
                  <div className="flex">
                    <select
                      className="border border-gray-200 cursor-pointer text-xs hover:bg-[#cd9cf2]/10 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#4b3266]"
                      value={gatePeriod}
                      onChange={(e) => setGatePeriod(e.target.value)}
                    >
                      <option className="text-gray-500" value="Weekly">Weekly</option>
                      <option className="text-gray-500" value="Monthly">Monthly</option>
                      <option className="text-gray-500" value="Yearly">Yearly</option>
                    </select>
                  </div>
                </div>
                {gateLoading ? (
                  <div className="flex items-center justify-center h-[200px] text-gray-500">Loading gate stats...</div>
                ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={gateChartData}
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="value"
                        label
                      >
                        {gateChartData.map((d, i) => (
                          <Cell key={i} fill={d.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                <p className="text-center text-sm text-gray-600 mt-2">
                  <b>Order ID:</b> 100 kg received
                </p>
              </div>

              {/* Quality Check */}



            </div>

            {/* TABLE */}
            <DashboardTable />

            {/* Supplier Table */}
            <DashboardSupplier />
          </div>
        </div>
      </div>
    </>
  );
}
