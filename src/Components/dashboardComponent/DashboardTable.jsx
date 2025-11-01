import React from "react";
import { Eye, Trash2 } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardTable() {
  const pieData = [
    { name: "Approved", value: 70, color: "#3B82F6" },
    { name: "Rejected", value: 30, color: "#EC4899" },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full bg-gray-50 mt-4 mb-4 rounded-lg">
      {/* ======= USER ROLES TABLE ======= */}
      <div className="flex-1 bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="font-semibold text-gray-800 text-[15px]">
              User roles
            </h2>
            <p className="text-xs text-gray-500">7 Roles found</p>
          </div>
          <button className="text-sm text-blue-500 hover:underline">
            View all
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-700">
            <thead className="text-xs text-gray-500 border-b bg-gray-50">
              <tr>
                <th className="px-3 py-2">Role</th>
                <th className="px-3 py-2">Description</th>
                <th className="px-3 py-2">Created on</th>
                <th className="px-3 py-2">Last updated</th>
                <th className="px-3 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  role: "Inventory",
                  desc: "Manage raw materials s...",
                  created: "14/07/25",
                  updated: "19/08/25",
                },
                {
                  role: "Production",
                  desc: "Overseas manufacturing...",
                  created: "14/07/25",
                  updated: "19/08/25",
                },
                {
                  role: "Accountant",
                  desc: "Overseas manufacturing...",
                  created: "14/06/25",
                  updated: "19/08/25",
                },
              ].map((item, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-3 py-2">{item.role}</td>
                  <td className="px-3 py-2 text-gray-500">{item.desc}</td>
                  <td className="px-3 py-2">{item.created}</td>
                  <td className="px-3 py-2">{item.updated}</td>
                  <td className="px-3 py-2 flex justify-center space-x-3">
                    <Eye className="w-4 h-4 text-gray-500 cursor-pointer hover:text-blue-500" />
                    <Trash2 className="w-4 h-4 text-gray-500 cursor-pointer hover:text-red-500" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======= QUALITY CHECK CARD ======= */}
      <div className="w-full lg:w-[300px] bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-gray-800 text-[15px]">
            Quality Check
          </h2>
          <div className="flex space-x-2">
            <select className="border text-gray-500 border-gray-200 hover:bg-[#cd9cf2] text-xs rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#4b3266]">
              <option className="text-gray-500 hover:bg-[#cd9cf2]">CMB</option>
              <option className="text-gray-500 hover:bg-[#cd9cf2]">ABC</option>
            </select>
            <select className="border text-gray-500 hover:bg-[#cd9cf2] border-gray-200 text-xs rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-gray-200">
              <option className="text-gray-500 hover:bg-[#cd9cf2]">Weekly</option>
              <option className="text-gray-500 hover:bg-[#cd9cf2]">Monthly</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                startAngle={180}
                endAngle={0}
                innerRadius={50}
                outerRadius={70}
              >
                {pieData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-xs text-gray-500 mt-[-10px]">50 kg rubber</div>

          <div className="flex space-x-4 text-xs text-gray-500 mt-2">
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
              <span>Approved</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EC4899]" />
              <span>Rejected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
