import React from "react";
import { Eye, Edit2, Trash2 } from "lucide-react";

export default function DashboardSupplier() {
  const suppliers = [
    {
      id: "454334",
      name: "Raghav Chadha",
      mobile: "5464545554",
      location: "19/08/25",
    },
    {
      id: "454334",
      name: "Raghav Chadha",
      mobile: "5464545554",
      location: "19/08/25",
    },
    {
      id: "454334",
      name: "Raghav Chadha",
      mobile: "5464545554",
      location: "19/08/25",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="font-semibold text-gray-800 text-[15px]">
            Supplier
          </h2>
          <p className="text-xs text-gray-500">7 Approval found</p>
        </div>
        <button className="text-sm text-blue-500 hover:underline">
          View all
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-700">
          <thead className="text-xs text-gray-500 bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Mobile No.</th>
              <th className="px-3 py-2">Location</th>
              <th className="px-3 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((supplier, index) => (
              <tr
                key={index}
                className="border-b last:border-0 hover:bg-gray-50 transition"
              >
                <td className="px-3 py-2">{supplier.id}</td>
                <td className="px-3 py-2">{supplier.name}</td>
                <td className="px-3 py-2">{supplier.mobile}</td>
                <td className="px-3 py-2">{supplier.location}</td>
                <td className="px-3 py-2 flex justify-center items-center space-x-3">
                  <Eye className="w-4 h-4 text-gray-500 cursor-pointer hover:text-blue-500" />
                  <Edit2 className="w-4 h-4 text-gray-500 cursor-pointer hover:text-green-500" />
                  <Trash2 className="w-4 h-4 text-gray-500 cursor-pointer hover:text-red-500" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
