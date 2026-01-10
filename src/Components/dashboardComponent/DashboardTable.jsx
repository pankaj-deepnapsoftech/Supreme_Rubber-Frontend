import React, { useEffect, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useUserRole } from "@/Context/UserRoleContext";
import { useInventory } from "@/Context/InventoryContext";
import { useNavigate } from "react-router-dom";

import axiosHandler from "@/config/axiosconfig";
import { useAuth } from "@/Context/AuthContext";

export default function DashboardTable() {
  const { products, getAllProducts } = useInventory();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAllProducts();
    };
    fetchData();
  }, []);

  const approvedCount = products.filter(
    (item) => item.approved === true
  ).length;
  const unapprovedCount = products.filter(
    (item) => item.approved !== true
  ).length;

  const pieData = [
    { name: "Approved", value: approvedCount, color: "#3B82F6" },
    { name: "Rejected", value: unapprovedCount, color: "#EC4899" },
  ];

  const { roles, deleteRole, loading } = useUserRole();

  const handleEdit = (role) => {
    console.log("Edit:", role);
    // Add your edit modal or form logic here
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this role?")) {
      await deleteRole(id);
    }
  };

  const { user } = useAuth();

  // Debug: Log user info to check isSuper value
  useEffect(() => {
    console.log("User object:", user);
    console.log("isSuper value:", user?.isSuper);
    console.log("isSuper type:", typeof user?.isSuper);
  }, [user]);

  const [qcChartData, setQcChartData] = useState([]);
  const [qcPeriod, setQcPeriod] = useState("Weekly");
  const [qcLoading, setQcLoading] = useState(false);

  useEffect(() => {
    const fetchQcStats = async () => {
      try {
        setQcLoading(true);
        const params = new URLSearchParams();
        params.set("period", qcPeriod.toLowerCase());

        const res = await axiosHandler.get(
          `/production/qc-stats?${params.toString()}`,
          { withCredentials: true }
        );

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

  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-4 w-full bg-gray-50 mt-4 mb-4 rounded-lg p-2 sm:p-4">
      {/* ===== USER ROLES TABLE ===== */}
      <div className="flex-1 bg-white rounded-lg shadow-sm p-4 border border-gray-100 overflow-x-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-3 gap-2">
          <div>
            <h2 className="font-semibold text-gray-800 text-[15px]">
              User Roles
            </h2>
            <p className="text-xs text-gray-500">{roles.length} Roles found</p>
          </div>
          <button
            className="text-sm text-blue-500 hover:underline self-start cursor-pointer sm:self-auto"
            onClick={() => navigate("/user-role")}
          >
            View all
          </button>
        </div>

        {/* Table */}
        <table className="w-full text-sm text-left text-gray-700 min-w-[500px]">
          <thead className="text-xs bg-gray-200 text-gray-800 rounded-lg border-b">
            <tr className="text-center">
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2">Permissions</th>
              <th className="px-3 py-2 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {roles.length === 0 ? (
              <tr>
                <td
                  colSpan="4"
                  className="text-center py-6 text-gray-400 italic bg-gray-50 rounded-b-2xl"
                >
                  No roles found.
                </td>
              </tr>
            ) : (
              roles.slice(0, 3).map((r, i) => (
                <tr
                  key={r._id || i}
                  className={`transition-all duration-200 text-center ${
                    i % 2 === 0 ? "bg-gray-50" : "bg-white"
                  } hover:bg-blue-50`}
                >
                  <td className="py-3 px-4 font-medium text-gray-800 border-b">
                    {r.role}
                  </td>
                  <td className="py-3 px-4 text-gray-700 border-b">
                    {r.description || "—"}
                  </td>
                  <td className="py-3 px-4 text-gray-700 border-b">
                    {r.permissions && r.permissions.length > 0
                      ? r.permissions.join(", ")
                      : "No permissions"}
                  </td>
                  <td className="py-3 px-4 border-b text-center">
                    <div className="flex justify-center space-x-3">
                      {user && user.isSuper === true && (
                        <button
                          className="p-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition"
                          title="Delete"
                          onClick={() => handleDelete(r._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===== QUALITY CHECK CARD ===== */}
      {/* <div className="w-full lg:w-[350px] shrink-0 bg-white rounded-2xl h-[300px] p-5 shadow-sm">
      <div className="flex justify-between">
        <h2 className="font-semibold text-gray-800 text-[15px]">Quality Check</h2>
        <div className="flex">
          <select
            className="border border-gray-200 cursor-pointer text-xs rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#4b3266]"
            value={qcPeriod}
            onChange={(e) => setQcPeriod(e.target.value)}
          >
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>   
            <option value="Yearly">Yearly</option>
          </select>
        </div>
      </div>

      {qcLoading ? (
        <div className="flex items-center justify-center h-[200px] text-gray-500">
          Loading QC...
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={qcChartData}
              innerRadius={50}
              outerRadius={80}
              dataKey="value"
              label
            >
              {qcChartData.map((d, i) => (
                <Cell key={i} fill={d.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div> */}
    </div>
  );
}
