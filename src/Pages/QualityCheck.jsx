import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  RefreshCcw,
  Download,
  Edit,
  Trash2,
  Eye,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useGatemenContext } from "@/Context/GatemenContext";
import { useQualityCheck } from "@/Context/QualityCheckContext";
import { toast } from "react-toastify";
import { useInventory } from "@/Context/InventoryContext";
import axiosHandler from "@/config/axiosconfig";
import Pagination from "@/Components/Pagination/Pagination";

const QualityCheck = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredReports, setFilteredReports] = useState([]);
  const [showGtModal, setShowGtModal] = useState(false);
  const [showProdQcModal, setShowProdQcModal] = useState(false);
  const [prodQcList, setProdQcList] = useState([]);
  const [prodQcStatusMap, setProdQcStatusMap] = useState({}); // {_id: 'approved'|'rejected'}
  const [prodQcQuantities, setProdQcQuantities] = useState({}); // {_id: {approved_qty: '', rejected_qty: ''}}
  const [getData, setGetData] = useState([]);
  const [selectedEntryItems, setSelectedEntryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    gateman_entry_id: "",
    items: [],
    attached_report: null,
  });
  const [modalMode, setModalMode] = useState("add");
  const { getAllProducts } = useInventory();

  const { GetAllPOData } = useGatemenContext();

  const {
    qualityReports = [],
    getAllReports,
    getReportById,
    createReport,
    updateReport,
    deleteReport,
    selectedReport,
    setSelectedReport,
    loading,
    ChangesStatus,
    page,
    setPage,
  } = useQualityCheck();

  useEffect(() => {
    const getGateman = async () => {
      const data = await GetAllPOData();
      const filter = data.filter(
        (i) => i?.status === "Entry Created" || i?.status === "Verified"
      );
      setGetData(filter);
    };
    getGateman();
    getAllProducts();
  }, []);

  const refreshGatemanData = async () => {
    const data = await GetAllPOData();
    const filter = data.filter(
      (i) => i?.status === "Entry Created" || i?.status === "Verified"
    );
    setGetData(filter);
  };

  console.log(selectedReport);

  useEffect(() => {
    if (!selectedReport) return;

    const gatemanEntry = getData.find(
      (entry) => entry._id === selectedReport.gateman_entry_id?._id
    );

    if (!gatemanEntry) return;

    const item = gatemanEntry.items?.find(
      (itm) => itm._id === selectedReport.item_id
    );

    setSelectedEntryItems(gatemanEntry.items || []);
    setSelectedItem(item || null);

    const itemsArray = [
      {
        item_id: selectedReport.item_id,
        item_name: item?.item_name || "",
        available_quantity: item?.item_quantity || 0,
        approved_quantity: selectedReport.approved_quantity || "",
        rejected_quantity: selectedReport.rejected_quantity || "",
      },
    ];

    setFormData({
      gateman_entry_id: selectedReport.gateman_entry_id?._id || "",
      items: itemsArray,
      attached_report: selectedReport.attached_report || null,
    });
  }, [selectedReport, getData]);
  const handleClose = () => {
    setShowModal(false);
    setSelectedReport(null);
    setSelectedEntryItems([]);
    setSelectedItem(null);
    setFormData({
      gateman_entry_id: "",
      items: [],
      attached_report: null,
    });
  };

  const handleFilter = (category) => {
    if (category === "All") setFilteredReports(qualityReports);
    else {
      const filtered = qualityReports.filter((p) => p.category === category);
      setFilteredReports(filtered);
    }
  };

  const handleDownload = () => {
    const headers = ["Product Name", "Approved Qty", "Rejected Qty", "Status"];
    const rows = (
      filteredReports.length ? filteredReports : qualityReports
    ).map((p) => [
      p.item_name,
      p.approved_quantity,
      p.rejected_quantity,
      p.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "quality_reports.csv";
    link.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validItems = formData.items.filter(
      (item) => item.approved_quantity > 0 || item.rejected_quantity > 0
    );

    if (validItems.length === 0) {
      toast.error(
        "Please enter approved or rejected quantities for at least one item."
      );
      return;
    }

    try {
      const promises = validItems.map(async (item) => {
        const payload = {
          gateman_entry_id: formData.gateman_entry_id,
          item_id: item.item_id,
          approved_quantity: parseInt(item.approved_quantity) || 0,
          rejected_quantity: parseInt(item.rejected_quantity) || 0,
        };

        // If file is attached (File object), use FormData
        const isFileObject = formData.attached_report instanceof File;
        if (isFileObject) {
          const formDataToSend = new FormData();
          formDataToSend.append("gateman_entry_id", payload.gateman_entry_id);
          formDataToSend.append("item_id", payload.item_id);
          formDataToSend.append("approved_quantity", payload.approved_quantity.toString());
          formDataToSend.append("rejected_quantity", payload.rejected_quantity.toString());
          formDataToSend.append("attached_report", formData.attached_report);

          if (selectedReport && selectedReport.item_id === item.item_id) {
            return updateReport(selectedReport._id, formDataToSend);
          } else {
            return createReport(formDataToSend);
          }
        } else {
          // No file or file is URL string, use JSON
          if (selectedReport && selectedReport.item_id === item.item_id) {
            return updateReport(selectedReport._id, payload);
          } else {
            return createReport(payload);
          }
        }
      });

      await Promise.all(promises);

      if (selectedReport) {
        toast.success("Quality check updated successfully");
      } else {
        toast.success(
          `Quality check created successfully for ${validItems.length} item(s)`
        );
      }

      handleClose();
      getAllReports();
    } catch (error) {
      console.error("Error submitting quality check:", error);

      if (error.response?.data?.message) {
        toast.error(`Error: ${error.response.data.message}`);
      } else if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors
          .map((err) => err.message)
          .join(", ");
        toast.error(`Validation errors: ${errorMessages}`);
      } else {
        toast.error("Error submitting quality check. Please try again.");
      }
    }
  };
  const handleEdit = async (id) => {
    try {
      const res = await getReportById(id); // Wait for data
      setModalMode("edit");
      if (res) {
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error fetching report for edit:", error);
    }
  };

  const handleView = async (id) => {
    try {
      const res = await getReportById(id);
      setModalMode("view");
      if (res) {
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error fetching report for view:", error);
    }
  };

  return (
    <div className="p-4 sm:p-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Quality Check</h1>
        <Button
          className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white"
          onClick={() => {
            setSelectedReport(null);
            setSelectedEntryItems([]);
            setSelectedItem(null);
            setFormData({
              gateman_entry_id: "",
              items: [],
              attached_report: null,
            });
            setShowModal(true);
          }}
        >
          Add Report
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full mt-3 sm:w-72">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>

          <Button
            onClick={() => setShowGtModal(true)}
            className="bg-blue-600 cursor-pointer mt-3 hover:bg-blue-700 text-white text-sm px-3 py-2.5 rounded-lg shadow-sm w-full sm:w-auto"
          >
           Gateman
          </Button>

          <Button
            onClick={async () => {
              try {
                // Fetch productions and show only completed
                const res = await (
                  await import("@/config/axiosconfig")
                ).default.get("/production/all");
                const list = res?.data?.productions || [];
                const completed = list
                  .filter(
                    (p) =>
                      (p?.status || "pending") === "completed" &&
                      !p.qc_done &&
                      p.ready_for_qc
                  )
                  .map((p) => {
                    const pn = p.part_names?.[0] || {};
                    const existingQty = prodQcQuantities[p._id] || {};
                    return {
                      ...p,
                      __qc_local_status: prodQcStatusMap[p._id] || undefined,
                      __approved_qty: existingQty.approved_qty || "",
                      __rejected_qty: existingQty.rejected_qty || "",
                      __prod_qty: pn.prod_qty || pn.est_qty || 0,
                    };
                  });
                setProdQcList(completed);
              } catch (e) {
                console.error("Failed to load productions for QC", e);
                setProdQcList([]);
              } finally {
                setShowProdQcModal(true);
              }
            }}
            className="bg-blue-600 cursor-pointer mt-3 hover:bg-blue-700 text-white text-sm px-3 py-2.5 rounded-lg shadow-sm w-full sm:w-auto"
          >
            Finished-Good QC
          </Button>
          <Button className="bg-blue-600 cursor-pointer mt-3 hover:bg-blue-700 text-white text-sm px-3 py-2.5 rounded-lg shadow-sm w-full sm:w-auto">
            Raw Material QC
          </Button>
          <Button className="bg-blue-600 cursor-pointer mt-3 hover:bg-blue-700 text-white text-sm px-3 py-2.5 rounded-lg shadow-sm w-full sm:w-auto">
            Compound QC{" "}
          </Button>
        </div>

        <div className="flex mt-3 justify-end items-center gap-4 text-gray-600 w-full">
          <button
            className="p-2 rounded-lg cursor-pointer border border-gray-300 hover:bg-gray-100 transition"
            onClick={getAllReports}
          >
            <RefreshCcw size={16} />
          </button>

          <button
            className="p-2 rounded-lg cursor-pointer border border-gray-300 hover:bg-gray-100 transition"
            onClick={handleDownload}
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto shadow-sm ">
        <table className="w-full min-w-[800px] text-sm text-left">
          <thead>
            <tr className="bg-linear-to-r from-blue-600 to-sky-500 whitespace-nowrap text-center text-white uppercase text-xs tracking-wide">
              <th className="px-4 sm:px-6 py-3 font-medium">PO Number</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Company</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Item</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Approved</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Rejected</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Status</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Report File</th>
              <th className="px-4 sm:px-6 py-3 font-medium text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  Loading reports...
                </td>
              </tr>
            ) : qualityReports?.length > 0 ? (
              (filteredReports.length ? filteredReports : qualityReports)
                .filter((item) => {
                  const q = searchQuery.toLowerCase();
                  const po = item?.gateman_entry_id?.po_number || "";
                  const company = item?.gateman_entry_id?.company_name || "";
                  const name = item?.item_name || "";
                  return (
                    po.toLowerCase().includes(q) ||
                    company.toLowerCase().includes(q) ||
                    name.toLowerCase().includes(q)
                  );
                })
                .map((item, i) => (
                  <tr
                    key={item._id || i}
                    className={`border-t text-center ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 sm:px-6 py-3">
                      {item?.gateman_entry_id?.po_number || "-"}
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      {item?.gateman_entry_id?.company_name || "-"}
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      {item?.item_name || "-"}
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      {item?.approved_quantity}
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      {item?.rejected_quantity}
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${
                          item?.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : item?.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : item?.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item?.status || "-"}
                      </span>
                    </td>

                    {/* Report File Column */}
                    <td className="px-4 sm:px-6 py-3 text-center">
                      {item?.attached_report ? (
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              window.open(item.attached_report, "_blank")
                            }
                            className="h-4 w-4 text-blue-500 cursor-pointer hover:text-blue-700"
                            title="View Report File"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const response = await fetch(
                                  item.attached_report
                                );
                                const blob = await response.blob();
                                const urlParts =
                                  item.attached_report.split("/");
                                const originalFilename =
                                  urlParts[urlParts.length - 1];
                                const decodedFilename =
                                  decodeURIComponent(originalFilename);
                                const blobUrl =
                                  window.URL.createObjectURL(blob);
                                const link = document.createElement("a");
                                link.href = blobUrl;
                                link.download =
                                  decodedFilename ||
                                  `Report_${item.item_name || "document"}`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                window.URL.revokeObjectURL(blobUrl);
                              } catch (error) {
                                console.error("Download failed:", error);
                                // Fallback to direct download
                                const link = document.createElement("a");
                                link.href = item.attached_report;
                                link.download = "";
                                link.target = "_blank";
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }
                            }}
                            className="h-4 w-4 text-green-500 cursor-pointer hover:text-green-700"
                            title="Download Report File"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>

                    <td className="px-4 sm:px-6 py-3 text-center">
                      <div className="flex justify-center gap-3">
                        <Edit
                          className="h-4 w-4 text-blue-500 cursor-pointer"
                          onClick={() => handleEdit(item._id)}
                        />
                        <Trash2
                          className="h-4 w-4 text-red-500 cursor-pointer"
                          onClick={async () => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this quality check?"
                              )
                            ) {
                              try {
                                await deleteReport(item._id);
                                toast.success(
                                  "Quality check deleted successfully"
                                );
                              } catch (error) {
                                console.error(
                                  "Error deleting quality check:",
                                  error
                                );
                                toast.error(
                                  "Error deleting quality check. Please try again."
                                );
                              }
                            }
                          }}
                        />
                        <Eye
                          className="h-4 w-4 text-gray-600 cursor-pointer"
                          onClick={() => handleView(item?._id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  No reports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showModal && (
          <>
            <Motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />
            <Motion.div
              className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 p-5 sm:p-6 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center space-x-2 mb-6">
                <button className="cursor-pointer" onClick={handleClose}>
                  <X className="h-5 w-5 text-gray-700" />
                </button>
                <h2 className="text-lg sm:text-xl font-semibold">
                  {modalMode === "edit"
                    ? "Edit Quality Report"
                    : modalMode === "view"
                    ? "View Quality Report"
                    : "Add New Quality Report"}
                </h2>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gateman Entry
                  </label>
                  <select
                    name="gateman_entry_id"
                    value={formData.gateman_entry_id}
                    onChange={(e) => {
                      const selectedEntry = getData.find(
                        (entry) => entry._id === e.target.value
                      );

                      console.log("Selected Entry:", selectedEntry);

                      if (selectedEntry && selectedEntry.items) {
                        setSelectedEntryItems(selectedEntry.items);
                        const itemsArray = selectedEntry.items.map((item) => ({
                          item_id: item._id,
                          item_name: item.item_name,
                          available_quantity: item.item_quantity,
                          approved_quantity: "",
                          rejected_quantity: "",
                        }));
                        setFormData({
                          ...formData,
                          gateman_entry_id: e.target.value,
                          items: itemsArray,
                        });
                      } else {
                        setSelectedEntryItems([]);
                        setFormData({
                          ...formData,
                          gateman_entry_id: e.target.value,
                          items: [],
                        });
                      }

                      setSelectedItem(null);
                    }}
                    disabled={modalMode === "view"}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    required
                  >
                    <option value="" className="cursor-pointer">
                      Select Gateman Entry
                    </option>
                    {getData
                      ?.filter((entry) => entry.status === "Verified")
                      .map((entry) => (
                        <option key={entry._id} value={entry._id}>
                          {entry.po_number} - {entry.company_name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Items Quality Check
                  </label>

                  {!formData.gateman_entry_id ? (
                    <div className="p-4 bg-gray-50 rounded-md text-center text-gray-500">
                      Please select a Gateman Entry first
                    </div>
                  ) : formData.items.length === 0 ? (
                    <div className="p-4 bg-gray-50 rounded-md text-center text-gray-500">
                      No items available for this entry
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {formData.items.map((item, index) => (
                        <div
                          key={item.item_id}
                          className="p-4 border rounded-lg bg-gray-50"
                        >
                          <div className="mb-3">
                            <h4 className="font-medium text-gray-800 mb-1">
                              {item.item_name}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Available Quantity: {item.available_quantity}
                              {console.log("helloworld", formData)}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            {/* Approved Quantity */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Approved Quantity
                              </label>
                              <input
                                type="number"
                                placeholder="0"
                                value={item.approved_quantity}
                                onChange={(e) => {
                                  const value = Number(e.target.value);
                                  const newItems = [...formData.items];
                                  const available = Number(
                                    item.available_quantity
                                  );

                                  // Update approved quantity
                                  newItems[index].approved_quantity = value;

                                  // Automatically update rejected quantity
                                  newItems[index].rejected_quantity = Math.max(
                                    available - value,
                                    0
                                  );

                                  setFormData({
                                    ...formData,
                                    items: newItems,
                                  });
                                }}
                                disabled={modalMode === "view"}
                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-100"
                                min="0"
                                max={item.available_quantity}
                              />
                            </div>

                            {/* Rejected Quantity */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Rejected Quantity
                              </label>
                              <input
                                type="number"
                                placeholder="0"
                                value={item.rejected_quantity}
                                // disabled
                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-100 bg-gray-100 "
                              />
                            </div>
                          </div>

                          {(parseInt(item.approved_quantity) || 0) +
                            (parseInt(item.rejected_quantity) || 0) >
                            parseInt(item.available_quantity) && (
                            <p className="text-xs text-red-500 mt-1">
                              Total quantity cannot exceed available quantity (
                              {item.available_quantity})
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Attach Report
                  </label>
                  <input
                    type="file"
                    name="attached_report"
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        attached_report: e.target.files[0],
                      });
                    }}
                    disabled={modalMode === "view"}
                    className="w-full border rounded-md px-3 py-2 mt-1"
                  />
                </div>

                {/* Show Report File in view mode */}
                {modalMode === "view" && selectedReport?.attached_report && (
                  <div className="border rounded-md p-3 bg-gray-50">
                    <label className="block text-sm font-medium mb-2">
                      Report File
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          window.open(selectedReport.attached_report, "_blank")
                        }
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
                      >
                        <Eye size={16} />
                        View File
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const response = await fetch(
                              selectedReport.attached_report
                            );
                            const blob = await response.blob();
                            const urlParts =
                              selectedReport.attached_report.split("/");
                            const originalFilename =
                              urlParts[urlParts.length - 1];
                            const decodedFilename =
                              decodeURIComponent(originalFilename);
                            const blobUrl = window.URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = blobUrl;
                            link.download =
                              decodedFilename ||
                              `Report_${
                                selectedReport.item_name || "document"
                              }`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            window.URL.revokeObjectURL(blobUrl);
                          } catch (error) {
                            console.error("Download failed:", error);
                            // Fallback to direct download
                            const link = document.createElement("a");
                            link.href = selectedReport.attached_report;
                            link.download = "";
                            link.target = "_blank";
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                  </div>
                )}

                {modalMode !== "view" && (
                  <button
                    type="submit"
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium"
                    disabled={loading}
                  >
                    {loading
                      ? "Submitting..."
                      : modalMode === "edit"
                      ? "Update"
                      : "Submit"}
                  </button>
                )}
              </form>
            </Motion.div>
          </>
        )}
      </AnimatePresence>

      {showGtModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={() => setShowGtModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-6xl p-4 sm:p-6 relative overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 mb-6 gap-3">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
                Gateway Order List
              </h2>
              <button
                onClick={() => setShowGtModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="overflow-x-auto border rounded-lg shadow-inner">
              <table className="min-w-[700px] sm:min-w-full text-sm text-left">
                <thead>
                  <tr className="bg-linear-to-r from-blue-600 to-sky-500 text-white text-xs sm:text-sm uppercase tracking-wide">
                    <th className="px-3 sm:px-4 py-3 text-left">PO Number</th>
                    <th className="px-3 sm:px-4 py-3 text-left">Invoice No.</th>
                    <th className="px-3 sm:px-4 py-3 text-left">
                      Company Name
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left">Items</th>
                    <th className="px-3 sm:px-4 py-3 text-left">Quantity</th>
                    <th className="px-3 sm:px-4 py-3 text-left">Status</th>
                    <th className="px-3 sm:px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {getData && getData.length > 0 ? (
                    getData
                      .filter((po) => po.status === "Entry Created")
                      .map((po, i) => (
                        <tr
                          key={i}
                          className={`border-b hover:bg-gray-50 transition ${
                            i % 2 === 0 ? "bg-gray-50" : "bg-white"
                          }`}
                        >
                          <td className="px-3 sm:px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                            {po?.po_number}
                          </td>
                          <td className="px-3 sm:px-4 py-3 text-gray-700 whitespace-nowrap">
                            {po?.invoice_number || "—"}
                          </td>
                          <td className="px-3 sm:px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                            {po?.company_name}
                          </td>
                          <td className="px-3 sm:px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                            {po?.items.map((i) => i.item_name).join(", ")}
                          </td>
                          <td className="px-3 sm:px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                            {po?.items.map((i) => i.item_quantity).join(", ")}
                          </td>
                          <td className="px-3 sm:px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                            {po?.status}
                          </td>
                          <td className="py-3 px-4 text-center border-b">
                            <div className="flex items-center justify-start space-x-3">
                              <button
                                className="px-3 py-1.5 rounded-md bg-green-100 cursor-pointer text-green-600 hover:bg-green-200 text-xs sm:text-sm font-medium"
                                title="View"
                                onClick={async () => {
                                  await ChangesStatus(po?._id);
                                  await refreshGatemanData();
                                  setShowGtModal(false);
                                  setShowModal(true);

                                  // Auto-fill the selected Gateman Entry in the form
                                  const selectedEntry = getData.find(
                                    (entry) => entry._id === po._id
                                  );

                                  if (selectedEntry && selectedEntry.items) {
                                    const itemsArray = selectedEntry.items.map(
                                      (item) => ({
                                        item_id: item._id,
                                        item_name: item.item_name,
                                        available_quantity: item.item_quantity,
                                        approved_quantity: "",
                                        rejected_quantity: "",
                                      })
                                    );

                                    setFormData({
                                      ...formData,
                                      gateman_entry_id: po._id,
                                      items: itemsArray,
                                    });

                                    setSelectedEntryItems(selectedEntry.items);
                                    setSelectedItem(null);
                                  }
                                }}
                              >
                                Accept
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td
                        colSpan="7"
                        className="text-center text-gray-500 py-6 italic"
                      >
                        No Gateman Records with "Entry Created" Status Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowGtModal(false)}
                className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showProdQcModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={() => setShowProdQcModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-6xl p-4 sm:p-6 relative overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 mb-6 gap-3">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-800">
                Production Quality Check
              </h2>
              <button
                onClick={() => setShowProdQcModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="overflow-x-auto border rounded-lg shadow-inner">
              <table className="w-full min-w-[1100px] text-sm text-left table-fixed">
                <thead>
                  <tr className="bg-linear-to-r from-blue-600 to-sky-500 text-white text-xs sm:text-sm uppercase tracking-wide">
                    <th className="px-3 sm:px-4 py-3 text-left">
                      Compound Code
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left">
                      Compound Name
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left">Status</th>
                    <th className="px-3 sm:px-4 py-3 text-left">Quantity</th>
                    <th className="px-3 sm:px-4 py-3 text-left">UOM</th>
                    <th className="px-3 sm:px-4 py-3 text-left">
                      Approved Qty
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left">
                      Rejected Qty
                    </th>
                    <th className="px-3 sm:px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {prodQcList && prodQcList.length ? (
                    prodQcList.map((prod, index) => {
                      const pn = prod.part_names?.[0] || {};
                      const isRejected = prod.__qc_local_status === "rejected";
                      const isApproved = prod.__qc_local_status === "approved";
                      return (
                        <tr
                          key={prod._id}
                          className={`border-b hover:bg-gray-50 transition ${
                            index % 2 === 0 ? "bg-gray-50" : "bg-white"
                          }`}
                        >
                          <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                            {pn?.compound_code ||
                              prod?.bom?.compound_code ||
                              prod.production_id}
                          </td>
                          <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                            {pn?.compound_name ||
                              prod?.bom?.compound_name ||
                              "-"}
                          </td>
                          <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isRejected
                                  ? "bg-red-100 text-red-600"
                                  : "bg-green-100 text-green-600"
                              }`}
                            >
                              {isRejected ? "rejected" : "completed"}
                            </span>
                          </td>
                          <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                            {pn?.prod_qty || pn?.est_qty || 0}
                          </td>
                          <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                            {pn?.uom || "-"}
                          </td>
                          <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                            {isRejected || isApproved ? (
                              <div className="text-gray-600 text-xs sm:text-sm font-medium">
                                {prod.__approved_qty ||
                                  prod.approved_qty ||
                                  "-"}
                              </div>
                            ) : (
                              <input
                                type="number"
                                placeholder="0"
                                value={prod.__approved_qty || ""}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  const approvedQty = parseFloat(value) || 0;
                                  const totalQty = parseFloat(
                                    prod.__prod_qty ||
                                      prod.part_names?.[0]?.prod_qty ||
                                      prod.part_names?.[0]?.est_qty ||
                                      0
                                  );
                                  const rejectedQty = Math.max(
                                    0,
                                    totalQty - approvedQty
                                  );

                                  setProdQcList((prev) =>
                                    prev.map((p) =>
                                      p._id === prod._id
                                        ? {
                                            ...p,
                                            __approved_qty: value,
                                            __rejected_qty: String(rejectedQty),
                                          }
                                        : p
                                    )
                                  );
                                  setProdQcQuantities((prev) => ({
                                    ...prev,
                                    [prod._id]: {
                                      ...prev[prod._id],
                                      approved_qty: value,
                                      rejected_qty: String(rejectedQty),
                                    },
                                  }));
                                }}
                                className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                                min="0"
                                max={prod.__prod_qty || 0}
                              />
                            )}
                          </td>
                          <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                            {isRejected || isApproved ? (
                              <div className="text-gray-600 text-xs sm:text-sm font-medium">
                                {prod.__rejected_qty ||
                                  prod.rejected_qty ||
                                  "-"}
                              </div>
                            ) : (
                              <input
                                type="number"
                                placeholder="0"
                                value={prod.__rejected_qty || ""}
                                readOnly
                                className="w-20 border border-gray-300 rounded-md px-2 py-1 text-sm bg-gray-50"
                              />
                            )}
                          </td>
                          <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                            {isRejected ? (
                              <div className="text-red-600 text-xs sm:text-sm font-medium">
                                Rejected
                              </div>
                            ) : isApproved ? (
                              <div className="text-green-600 text-xs sm:text-sm font-medium">
                                Approved
                              </div>
                            ) : (
                              <button
                                className="px-3 py-1.5 rounded-md bg-green-100 text-green-600 hover:bg-green-200 text-xs sm:text-sm font-medium"
                                onClick={async () => {
                                  try {
                                    const approvedQty = parseFloat(
                                      prod.__approved_qty ||
                                        prod.approved_qty ||
                                        0
                                    );
                                    const rejectedQty = parseFloat(
                                      prod.__rejected_qty ||
                                        prod.rejected_qty ||
                                        0
                                    );

                                    if (
                                      approvedQty === 0 &&
                                      rejectedQty === 0
                                    ) {
                                      toast.error(
                                        "Please enter approved quantity"
                                      );
                                      return;
                                    }

                                    await axiosHandler.patch(
                                      `/production/${prod._id}/approve`,
                                      {
                                        approved_qty: approvedQty,
                                        rejected_qty: rejectedQty,
                                      }
                                    );
                                    toast.success("Production approved");
                                    // Remove from list after approve
                                    setProdQcList((prev) =>
                                      prev.filter((p) => p._id !== prod._id)
                                    );
                                    setProdQcStatusMap((prev) => ({
                                      ...prev,
                                      [prod._id]: "approved",
                                    }));
                                  } catch (e) {
                                    console.error(e);
                                    toast.error("Failed to approve production");
                                  }
                                }}
                              >
                                Approve
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="8"
                        className="text-center text-gray-500 py-6 italic"
                      >
                        No completed productions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowProdQcModal(false)}
                className="w-full sm:w-auto px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <Pagination
        page={page}
        setPage={setPage}
        hasNextPage={qualityReports?.length === 10}
      />
    </div>
  );
};

export default QualityCheck;
