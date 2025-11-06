import React, { useEffect, useState } from "react";
import { Eye, Edit2, Trash2 } from "lucide-react";
import { useSupplierContext } from "@/Context/SuplierContext";
import { useNavigate } from "react-router-dom";

export default function DashboardSupplier() {
  const { getAllSupplier, deleteSupplier } = useSupplierContext();
  const [suppliers, setSuppliers] = useState([]);
  const navigate = useNavigate();

  // ✅ Fetch live data from context (no loading)
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await getAllSupplier();
        const data = Array.isArray(res) ? res : res?.suppliers || [];

        setSuppliers(data);
      } catch (error) {
        console.error("Error fetching suppliers:", error);
      }
    };

    fetchSuppliers();
  }, []);

  // ✅ Handlers
  const handleView = (supplier) => {
    console.log("View Supplier:", supplier);
  };

  const handleEdit = (supplier) => {
    console.log("Edit Supplier:", supplier);
  };

  const handleDelete = async (id) => {
    if (!id) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this supplier?"
    );
    if (!confirmed) return;

    try {
      await deleteSupplier(id);
      setSuppliers((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Error deleting supplier:", err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="font-semibold text-gray-800 text-[15px]">Suppliers</h2>
          <p className="text-xs text-gray-500">
            {`${suppliers.length} Supplier${
              suppliers.length !== 1 ? "s" : ""
            } found`}
          </p>
        </div>
        <button
          className="text-sm text-blue-500 hover:underline cursor-pointer"
          onClick={() => navigate("/supplier")}
        >
          View all
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-auto">
        <div className="overflow-auto max-h-[70vh] rounded-lg">
          <table className="min-w-max w-full text-sm text-left text-gray-600">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gray-200 text-gray-800 text-center uppercase text-xs tracking-wide">
                {["ID", "Name", "Phone", "Actions"].map(
                  (header, i) => (
                    <th
                      key={i}
                      className={`py-3 px-4 text-center font-semibold ${
                        i === 0 ? "rounded-tl-2xl" : ""
                      } ${i === 7 ? "rounded-tr-2xl" : ""}`}
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>

            <tbody>
              {suppliers.length > 0 ? (
                suppliers.slice(0, 4).map((s, i) => (
                  <tr
                    key={s._id || i}
                    className={`transition-all duration-200 text-center ${
                      i % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-blue-50`}
                  >
                    <td className="py-3 px-4 text-center text-gray-800 border-b">
                      {s.supplier_id || "—"}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800 border-b">
                      {s.name || "—"}
                    </td>
                    <td className="py-3 px-4 text-gray-700 border-b">
                      {s.phone || "—"}
                    </td>
                    {/* <td className="py-3 px-4 text-gray-700 border-b">
                      {s.email || "—"}
                    </td>

                    <td className="py-3 px-4 text-gray-700 border-b truncate max-w-[200px]">
                      {s.address || "—"}
                    </td> */}
                    <td className="py-3 px-4 text-center border-b">
                      <div className="flex items-center justify-center space-x-3">
                        {/* <button
                          className="p-1.5 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200"
                          title="View"
                          onClick={() => handleView(s)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="p-1.5 rounded-md bg-green-100 text-green-600 hover:bg-green-200"
                          title="Edit"
                          onClick={() => handleEdit(s)}
                        >
                          <Edit2 size={16} />
                        </button> */}
                        <button
                          className="p-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200"
                          title="Delete"
                          onClick={() => handleDelete(s._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-6 text-gray-400 italic bg-gray-50"
                  >
                    No suppliers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
