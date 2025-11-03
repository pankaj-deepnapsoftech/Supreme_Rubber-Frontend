import React, { useState } from "react";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { LuNotebookText } from "react-icons/lu";
import { ArrowDropDown } from "@mui/icons-material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { GiNotebook } from "react-icons/gi";
import { BsPeople } from "react-icons/bs";
import DashboardTable from "./DashboardTable";

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

export default function DashboardMain() {
  const [period, setPeriod] = useState(" ");

  const lineData = [
    { month: "Jan", a: 12, b: 8 },
    { month: "Feb", a: 16, b: 12 },
    { month: "Mar", a: 25, b: 20 },
    { month: "Apr", a: 22, b: 30 },
    { month: "May", a: 35, b: 26 },
    { month: "Jun", a: 18, b: 10 },
    { month: "Jul", a: 28, b: 32 },
    { month: "Aug", a: 22, b: 8 },
    { month: "Sep", a: 16, b: 12 },
    { month: "Oct", a: 25, b: 20 },
    { month: "Nov", a: 22, b: 30 },
    { month: "Dec", a: 35, b: 26 },
  ];

  const pieDataInventory = [
    { name: "Raw materials", value: 10, color: "#FBBF24" },
    { name: "Work in progress", value: 20, color: "#A78BFA" },
    { name: "Finished goods (FGW)", value: 30, color: "#3B82F6" },
    { name: "CMW", value: 15, color: "#F87171" },
  ];

  const pieDataStatus = [
    { name: "Completed", value: 124, color: "#3B82F6" },
    { name: "Not Started", value: 80, color: "#EC4899" },
    { name: "In Progress", value: 60, color: "#A78BFA" },
  ];

  const barData = [
    { day: "Mon", completed: 20, notCompleted: 15 },
    { day: "Tue", completed: 30, notCompleted: 10 },
    { day: "Wed", completed: 25, notCompleted: 12 },
    { day: "Thu", completed: 40, notCompleted: 5 },
    { day: "Fri", completed: 35, notCompleted: 10 },
    { day: "Sat", completed: 28, notCompleted: 8 },
    { day: "Sun", completed: 18, notCompleted: 12 },
  ];

  const donutData = [{ value: 80 }, { value: 20 }];

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
            <div className="border border-gray-200 bg-white rounded-[10px] p-2.5 flex justify-between items-center h-26 shadow-sm">
              <div className="flex flex-col">
                <p className="text-[16px] text-gray-700">Purchase Order</p>
                <p className="text-[24px] text-gray-700 font-semibold">24</p>
                <p className="text-[13px] text-gray-600">
                  <span className="text-[12px] text-green-400 flex items-center">
                    5 <ArrowDropUpIcon className="mt-0.5" />
                  </span>
                  v/s last month
                </p>
              </div>
              <div className="flex items-center justify-center h-10 w-10 bg-[#ffeded] rounded-full shadow-sm">
                <LuNotebookText className="text-[#fb7777] text-xl" />
              </div>
            </div>

            {/* CARD - Total Production */}
            <div className="border border-gray-200 bg-white rounded-[10px] p-2.5 flex justify-between items-center h-26 shadow-sm">
              <div className="flex flex-col">
                <p className="text-[16px] text-gray-700">Total Production</p>
                <p className="text-[24px] text-gray-700 font-semibold">15</p>
                <p className="text-[13px] text-gray-600">
                  <span className="text-[12px] text-red-400 flex items-center">
                    2 <ArrowDropDown className="mb-0.5" />
                  </span>
                  v/s last month
                </p>
              </div>
              <div className="flex items-center justify-center h-10 w-10 bg-[#eafbed] rounded-full shadow-sm">
                <CheckCircleOutlineIcon className="text-[#99db9f] text-xl" />
              </div>
            </div>

            {/* CARD - Total BOM */}
            <div className="border border-gray-200 bg-white rounded-[10px] p-2.5 flex justify-between items-center h-26 shadow-sm">
              <div className="flex flex-col">
                <p className="text-[16px] text-gray-700">Total BOM</p>
                <p className="text-[24px] text-gray-700 font-semibold">3</p>
                <p className="text-[13px] text-gray-600">
                  <span className="text-[12px] text-green-400 flex items-center">
                    1 <ArrowDropUpIcon className="mb-0.5" />
                  </span>
                  v/s last month
                </p>
              </div>
              <div className="flex items-center justify-center h-10 w-10 bg-[#fcefe0] rounded-full shadow-sm">
                <GiNotebook className="text-[#efb777] text-xl" />
              </div>
            </div>

            {/* CARD - Total Suppliers */}
            <div className="border border-gray-200 bg-white rounded-[10px] p-2.5 flex justify-between items-center h-26 shadow-sm">
              <div className="flex flex-col">
                <p className="text-[16px] text-gray-700">Total Suppliers</p>
                <p className="text-[24px] text-gray-700 font-semibold">9</p>
                <p className="text-[13px] text-gray-600">
                  <span className="text-[12px] text-gray-400 flex items-center">
                    0 <ArrowDropUpIcon className="mb-0.5" />
                  </span>
                  v/s last month
                </p>
              </div>
              <div className="flex items-center justify-center h-10 w-10 bg-[#e7fdff] rounded-full shadow-sm">
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
                  <div className="flex flex-wrap gap-2">
                    {["Weekly", "Monthly", "Yearly"].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-3 py-1 text-sm rounded-md transition ${
                          p === period
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-full overflow-x-auto">
                  <ResponsiveContainer
                    width="100%"
                    height={250}
                    className="mt-[30px]"
                  >
                    <LineChart data={lineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="month" stroke="#6B7280" />
                      <YAxis stroke="#6B7280" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="a"
                        stroke="#3B82F6"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="b"
                        stroke="#F59E0B"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Inventory */}
              <div className="w-full lg:w-[400px] h-auto lg:h-[400px] bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-3">
                  <h2 className="font-semibold text-gray-800 text-[15px]">
                    Inventory
                  </h2>
                  <select className="border border-gray-200 text-xs hover:bg-[#cd9cf2]/10 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#4b3266]">
                    <option className="text-gray-500">Weekly</option>
                    <option className="text-gray-500">Monthly</option>
                    <option className="text-gray-500">Yearly</option>
                  </select>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieDataInventory}
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {pieDataInventory.map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Production Status */}
            {/* Row: Production Status + Production + Gate Entry */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-4">
              {/* Production Status */}
              <div className="flex-1 min-w-[300px] h-[300px] bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex justify-between">
                  <h2 className="font-semibold text-gray-800 text-[15px]">
                    Production Status
                  </h2>
                  <div className="flex">
                    <select className="border border-gray-200 text-xs hover:bg-[#cd9cf2] rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#4b3266]">
                      <option className="text-gray-500 hover:bg-[#cd9cf2]">
                        Weekly
                      </option>
                      <option className=" hover:bg-[#cd9cf2]">Monthly</option>
                      <option className=" hover:bg-[#cd9cf2]">Yearly</option>
                    </select>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
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
              </div>

              {/* Production */}

              <div className="bg-white rounded-2xl p-5 h-[300px] shadow-sm w-full">
                <div className="flex justify-between">
                  <h2 className="font-semibold text-gray-800 text-[15px]">
                    Production
                  </h2>
                  <div className="flex">
                    <select className="border border-gray-200 text-xs hover:bg-[#cd9cf2] rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#4b3266]">
                      <option className="text-gray-500 hover:bg-[#cd9cf2]">
                        Weekly
                      </option>
                      <option className=" text-gray-500 hover:bg-[#cd9cf2]">
                        Monthly
                      </option>
                      <option className=" text-gray-500 hover:bg-[#cd9cf2]">
                        Yearly
                      </option>
                    </select>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="day" stroke="#6B7280" />
                    <YAxis stroke="#6B7280" />
                    <Tooltip />
                    <Bar dataKey="completed" fill="#3B82F6" />
                    <Bar dataKey="notCompleted" fill="#EC4899" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Gate Entry */}
              <div className="bg-white rounded-2xl h-[300px] p-5 shadow-sm w-full">
                <div className="flex justify-between">
                  <h2 className="font-semibold text-gray-800 text-[15px]">
                    Gate Entry
                  </h2>
                  <div className="flex">
                    <select className="border border-gray-200 text-xs hover:bg-[#cd9cf2] rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#4b3266]">
                      <option className="text-gray-500 hover:bg-[#cd9cf2]">
                        Weekly
                      </option>
                      <option className="text-gray-500 hover:bg-[#cd9cf2]">
                        Monthly
                      </option>
                      <option className=" text-gray-500 hover:bg-[#cd9cf2]">
                        Yearly
                      </option>
                    </select>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      innerRadius={60}
                      outerRadius={80}
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill="#3B82F6" />
                      <Cell fill="#E5E7EB" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <p className="text-center text-sm text-gray-600 mt-2">
                  <b>Order ID:</b> 100 kg received
                </p>
              </div>
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
