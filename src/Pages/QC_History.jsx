import React, { useEffect, useState } from "react";
import {
  Search,
  RefreshCcw,
  Download,
  Trash2,
  History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosHandler from "@/config/axiosconfig";
import { toast } from "react-hot-toast";
import Pagination from "@/Components/Pagination/Pagination";

const QC_History = () => {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [qcHistory, setQcHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [filterType, setFilterType] = useState("all"); // all, production, gateman

  const fetchQcHistory = async () => {
    try {
      setLoading(true);
      const res = await axiosHandler.get(`/production/qc-history?page=${page}&limit=10`);
      const history = res?.data?.history || [];
      setQcHistory(history);
      setFilteredHistory(history);
    } catch (error) {
      console.error("Error fetching QC history:", error);
      toast.error("Failed to load QC history");
      setQcHistory([]);
      setFilteredHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQcHistory();
  }, [page]);

  useEffect(() => {
    // start from qcHistory, apply type filter first
    let base = qcHistory || [];
    if (filterType === "production") {
      base = base.filter((it) => it.qc_type === "production");
    } else if (filterType === "gateman") {
      base = base.filter((it) => it.qc_type === "gateman");
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      setFilteredHistory(base);
      return;
    }

    const filtered = base.filter((item) => {
      if (item.qc_type === "production") {
        const pn = item.part_names?.[0] || {};
        const compoundCode = (pn?.compound_code || item?.bom?.compound_code || "").toLowerCase();
        const compoundName = (pn?.compound_name || item?.bom?.compound_name || "").toLowerCase();
        const productionId = (item.production_id || "").toLowerCase();
        return (
          compoundCode.includes(q) ||
          compoundName.includes(q) ||
          productionId.includes(q)
        );
      } else {
        const poNumber = (item?.gateman_entry_id?.po_number || "").toLowerCase();
        const companyName = (item?.gateman_entry_id?.company_name || "").toLowerCase();
        const itemName = (item?.item_name || "").toLowerCase();
        return (
          poNumber.includes(q) ||
          companyName.includes(q) ||
          itemName.includes(q)
        );
      }
    });
    setFilteredHistory(filtered);
  }, [searchQuery, qcHistory, filterType]);

  const handleDelete = async (id, type) => {
    if (!window.confirm("Are you sure you want to delete this QC history entry?")) {
      return;
    }

    try {
      await axiosHandler.delete(`/production/qc-history/${id}?type=${type}`);
      toast.success("QC history entry deleted successfully");
      fetchQcHistory();
    } catch (error) {
      console.error("Error deleting QC history:", error);
      toast.error("Failed to delete QC history entry");
    }
  };

  const handleDownload = () => {
    const headers = [
      "Type",
      "ID/PO Number",
      "Code/Company",
      "Name/Item",
      "QC Status",
      "Approved Qty",
      "Rejected Qty",
      "Date",
    ];
    const rows = filteredHistory.map((item) => {
      if (item.qc_type === "production") {
        const pn = item.part_names?.[0] || {};
        return [
          "Production",
          item.production_id || "",
          pn?.compound_code || item?.bom?.compound_code || "",
          pn?.compound_name || item?.bom?.compound_name || "",
          item.qc_status || "",
          item.approved_qty || 0,
          item.rejected_qty || 0,
          item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "",
        ];
      } else {
        return [
          "Gateman",
          item?.gateman_entry_id?.po_number || "",
          item?.gateman_entry_id?.company_name || "",
          item?.item_name || "",
          item.status || "completed",
          item.approved_qty || item.approved_quantity || 0,
          item.rejected_qty || item.rejected_quantity || 0,
          item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "",
        ];
      }
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `qc-history-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const handleRefresh = () => {
    fetchQcHistory();
  };

  return (
    <div className="p-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <History size={24} className="text-blue-600" />
          <h1 className="text-2xl font-semibold">QC History</h1>
        </div>
        <Button
          className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white"
          onClick={handleRefresh}
        >
          <RefreshCcw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search & Download */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 mt-4">
        <div className="flex items-center gap-2">

          <div className="flex items-center border rounded-lg px-3 py-2 w-48 sm:w-56 md:w-64">
          <Search size={16} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full outline-none text-sm"
          />
        </div>

          <button
            onClick={() => setFilterType("all")}
            className={`px-3 py-1 rounded-lg border transition ${filterType === "all" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType("production")}
            className={`px-3 py-1 rounded-lg border transition ${filterType === "production" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
          >
            Production
          </button>
          <button
            onClick={() => setFilterType("gateman")}
            className={`px-3 py-1 rounded-lg border transition ${filterType === "gateman" ? "bg-blue-600 text-white" : "bg-white text-gray-700"}`}
          >
            Gateman
          </button>
        </div>
 
        
 
        <button
          onClick={handleDownload}
          className="p-2 rounded-lg cursor-pointer text-gray-800 hover:bg-gray-200 border border-gray-300 transition"
        >
          <Download size={16} />
        </button>
      </div>

      <div className="overflow-x-auto bg-white mt-10 rounded-2xl shadow-md border border-gray-100">
        <table className="min-w-full border-collapse text-sm text-left">
          <thead>
            <tr className="bg-linear-to-r from-blue-600 to-sky-500 whitespace-nowrap text-white uppercase text-xs tracking-wide">
              {[
                "Type",
                "ID/PO Number",
                "Code/Company",
                "Name/Item",
                "QC Status",
                "Approved Qty",
                "Rejected Qty",
                "Date",
                "Actions",
              ].map((header, i) => (
                <th
                  key={i}
                  className="py-3 px-4 text-center font-semibold"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="9"
                  className="text-center py-6 text-gray-500 italic bg-gray-50 rounded-b-2xl"
                >
                  Loading QC history...
                </td>
              </tr>
            ) : filteredHistory?.length > 0 ? (
              filteredHistory.map((item, i) => {
                const isProduction = item.qc_type === "production";
                const isApproved = item.qc_status === "approved";
                const isRejected = item.qc_status === "rejected";
                
                return (
                  <tr
                    key={item._id || item.id || i}
                    className={`transition-all duration-200 ${
                      i % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-blue-50`}
                  >
                    <td className="py-3 px-4 text-center border-b">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isProduction
                            ? "bg-blue-100 text-blue-600"
                            : "bg-purple-100 text-purple-600"
                        }`}
                      >
                        {isProduction ? "Production" : "Gateman"}
                      </span>
                    </td>
                    {isProduction ? (
                      <>
                        <td className="py-3 px-4 text-center text-gray-800 border-b">
                          {item.production_id || "-"}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-800 border-b">
                          {item.part_names?.[0]?.compound_code || item?.bom?.compound_code || "-"}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-800 border-b">
                          {item.part_names?.[0]?.compound_name || item?.bom?.compound_name || "-"}
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-3 px-4 text-center text-gray-800 border-b">
                          {item?.gateman_entry_id?.po_number || "-"}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-800 border-b">
                          {item?.gateman_entry_id?.company_name || "-"}
                        </td>
                        <td className="py-3 px-4 text-center text-gray-800 border-b">
                          {item?.item_name || "-"}
                        </td>
                      </>
                    )}
                    <td className="py-3 px-4 text-center border-b">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isApproved
                            ? "bg-green-100 text-green-600"
                            : isRejected
                            ? "bg-red-100 text-red-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.qc_status || item.status || "completed"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-800 border-b">
                      {item.approved_qty || item.approved_quantity || 0}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-800 border-b">
                      {item.rejected_qty || item.rejected_quantity || 0}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-800 border-b">
                      {item.updatedAt
                        ? new Date(item.updatedAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="py-3 px-4 text-center border-b">
                      <button
                        className="h-4 w-4 text-red-500 cursor-pointer hover:text-red-700"
                        title="Delete"
                        onClick={() => handleDelete(item._id || item.id, item.qc_type)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan="9"
                  className="text-center py-6 text-gray-400 italic bg-gray-50 rounded-b-2xl"
                >
                  No QC history found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        setPage={setPage}
        hasNextPage={filteredHistory?.length === 10}
      />
    </div>
  );
};

export default QC_History;

