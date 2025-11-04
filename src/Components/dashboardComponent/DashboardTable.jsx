import React, { useEffect } from "react";
import { Edit, Trash2 } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useUserRole } from "@/Context/UserRoleContext";
import { useInventory } from "@/Context/InventoryContext";

export default function DashboardTable() {
  const { products, getAllProducts } = useInventory();
  

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

  return (
    <div className="flex flex-col lg:flex-row gap-4 w-full bg-gray-50 mt-4 mb-4 rounded-lg p-2 sm:p-4">
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
          <button className="text-sm text-blue-500 hover:underline self-start sm:self-auto" onClick={()=>{"/supplier"}}>
            View all
          </button>
        </div>

        {/* Table */}
        <table className="w-full text-sm text-left text-gray-700 min-w-[500px]">
          <thead className="text-xs bg-gray-200 text-gray-800  border-b ">
            <tr>
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
              roles.map((r, i) => (
                <tr
                  key={r._id || i}
                  className={`transition-all duration-200 ${
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
                      {/* <button
                        className="p-1.5 rounded-md bg-green-100 text-green-600 hover:bg-green-200 transition"
                        title="Edit"
                        onClick={() => handleEdit(r)}
                      >
                        <Edit size={16} />
                      </button> */}
                      <button
                        className="p-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition"
                        title="Delete"
                        onClick={() => handleDelete(r._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===== QUALITY CHECK CARD ===== */}
      <div className="w-full lg:w-[320px] bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
          <h2 className="font-semibold text-gray-800 text-[15px]">
            Quality Check
          </h2>
          <div className="flex space-x-2">
            <select className="border text-gray-500 border-gray-200 text-xs rounded-md px-2 py-1 hover:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-400">
              <option>CMB</option>
              <option>ABC</option>
            </select>
            <select className="border text-gray-500 border-gray-200 text-xs rounded-md px-2 py-1 hover:bg-blue-50 focus:outline-none focus:ring-1 focus:ring-blue-400">
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
        </div>

        {/* Pie Chart */}
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

          <div className="text-xs text-gray-500 -mt-2.5">50 kg rubber</div>

          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500 mt-2">
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
