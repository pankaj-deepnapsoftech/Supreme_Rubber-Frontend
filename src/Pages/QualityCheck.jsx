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




const QualityCheck = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredReports, setFilteredReports] = useState([]);
  // const [selectedCategory, setSelectedCategory] = useState("");
  const [showGtModal, setShowGtModal] = useState(false);
  const [getData, setGetData] = useState([]);
  const [selectedEntryItems, setSelectedEntryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    gateman_entry_id: "",
    item_id: "",
    approved_quantity: "",
    rejected_quantity: "",
    attached_report: null,
  });

  const {getAllProducts} = useInventory();

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
  } = useQualityCheck();

  useEffect(() => {
    const getGateman = async () => {
      const data = await GetAllPOData();
      // Show both "Entry Created" and "Verified" entries
      const filter = data.filter(
        (i) => i?.status === "Entry Created" || i?.status === "Verified"
      );
      setGetData(filter);
    };
    getGateman();
    getAllProducts();
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to refresh gateman data
  const refreshGatemanData = async () => {
    const data = await GetAllPOData();
    const filter = data.filter(
      (i) => i?.status === "Entry Created" || i?.status === "Verified"
    );
    setGetData(filter);
  };

  useEffect(() => {
    if (selectedReport) {
      const gatemanEntry = getData.find(
        (entry) => entry._id === selectedReport.gateman_entry_id
      );

      if (gatemanEntry && gatemanEntry.items) {
        setSelectedEntryItems(gatemanEntry.items);
        if (selectedReport.item_id) {
          const item = gatemanEntry.items.find(
            (item) => item._id === selectedReport.item_id
          );
          setSelectedItem(item);
        }
      }

      setFormData({
        gateman_entry_id: selectedReport.gateman_entry_id || "",
        item_id: selectedReport.item_id || "",
        approved_quantity: selectedReport.approved_quantity || "",
        rejected_quantity: selectedReport.rejected_quantity || "",
        attached_report: null,
      });
    }
  }, [selectedReport, getData]);

  const handleClose = () => {
    setShowModal(false);
    setSelectedReport(null);
    setSelectedEntryItems([]); // Clear selected items
    setSelectedItem(null);
    setFormData({
      gateman_entry_id: "",
      item_id: "",
      approved_quantity: "",
      rejected_quantity: "",
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

    // Validate that an item is selected
    if (!formData.item_id || !selectedItem) {
      toast.error("Please select an item from the available items list.");
      return;
    }

    try {
      const payload = {
        gateman_entry_id: formData.gateman_entry_id,
        item_id: formData.item_id,
        approved_quantity: parseInt(formData.approved_quantity),
        rejected_quantity: parseInt(formData.rejected_quantity),
      };

      if (selectedReport) {
        await updateReport(selectedReport._id, payload);
        toast.success("Quality check updated successfully");
      } else {
        await createReport(payload);
        toast.success("Quality check created successfully");
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
      await getReportById(id);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching report for edit:", error);
    }
  };

  console.log("selectedReport", selectedReport);

  return (
    <div className="p-4 sm:p-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Quality Check</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
          onClick={() => {
            setSelectedReport(null);
            setSelectedEntryItems([]);
            setSelectedItem(null);
            setFormData({
              gateman_entry_id: "",
              item_id: "",
              approved_quantity: "",
              rejected_quantity: "",
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
          <div className="relative w-full sm:w-72">
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
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2.5 rounded-lg shadow-sm w-full sm:w-auto"
          >
            Gateman
          </Button>
        </div>

        <div className="flex items-center gap-4 text-gray-600">
          <div className="relative group">
            <Filter className="cursor-pointer hover:text-gray-800" />
            <div className="absolute hidden group-hover:block bg-white border shadow-md p-2 right-0 top-6 rounded-md z-10 w-40">
              <p
                onClick={() => handleFilter("All")}
                className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
              >
                All
              </p>
              {[...new Set(qualityReports?.map((p) => p.category) || [])].map((cat) => (

                  <p
                    key={cat}
                    onClick={() => handleFilter(cat)}
                    className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                  >
                    {cat}
                  </p>
                )
              )}
            </div>
          </div>

          <RefreshCcw
            className="cursor-pointer hover:text-gray-800"
            onClick={getAllReports}
          />
          <Download
            className="cursor-pointer hover:text-gray-800"
            onClick={handleDownload}
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full min-w-[800px] text-sm text-left">
          <thead>
            <tr className="bg-linear-to-r from-blue-600 to-sky-500 whitespace-nowrap text-white uppercase text-xs tracking-wide">
              <th className="px-4 sm:px-6 py-3 font-medium">PO Number</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Company</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Item</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Approved</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Rejected</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Status</th>
              <th className="px-4 sm:px-6 py-3 font-medium text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
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
                    className={`border-t ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 sm:px-6 py-3">{item?.gateman_entry_id?.po_number || "-"}</td>
                    <td className="px-4 sm:px-6 py-3">{item?.gateman_entry_id?.company_name || "-"}</td>
                    <td className="px-4 sm:px-6 py-3">{item?.item_name || "-"}</td>
                    <td className="px-4 sm:px-6 py-3">{item?.approved_quantity}</td>
                    <td className="px-4 sm:px-6 py-3">{item?.rejected_quantity}</td>
                    <td className="px-4 sm:px-6 py-3">{item?.status || "-"}</td>
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
                                toast.success("Quality check deleted successfully");
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
                          onClick={() => getReportById(item._id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
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
                <button onClick={handleClose}>
                  <X className="h-5 w-5 text-gray-700" />
                </button>
                <h2 className="text-lg sm:text-xl font-semibold">
                  {selectedReport
                    ? "Edit Quality Report"
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
                      } else {
                        setSelectedEntryItems([]);
                      }

                      setSelectedItem(null);
                      setFormData({
                        ...formData,
                        gateman_entry_id: e.target.value,
                        item_id: "",
                      });
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    required
                  >
                    <option value="">Select Gateman Entry</option>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Items
                  </label>

                  {!formData.gateman_entry_id ? (
                    <div className="p-4 bg-gray-50 rounded-md text-center text-gray-500">
                      Please select a Gateman Entry first
                    </div>
                  ) : selectedEntryItems.length === 0 ? (
                    <div className="p-4 bg-gray-50 rounded-md text-center text-gray-500">
                      No items available for this entry
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedEntryItems.map((item) => (
                        <div
                          key={item._id}
                          onClick={() => {
                            setSelectedItem(item);
                            setFormData({
                              ...formData,
                              item_id: item._id,
                            });
                          }}
                          className={`p-3 border rounded-md cursor-pointer transition-all ${
                            selectedItem?._id === item._id
                              ? "border-blue-500 bg-blue-50 shadow-sm"
                              : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-gray-800">
                                {item.item_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                Available Quantity: {item.item_quantity}
                              </p>
                            </div>
                            {selectedItem?._id === item._id && (
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedItem && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-700">
                        <strong>Selected:</strong> {selectedItem.item_name}
                      </p>
                      <p className="text-sm text-green-600">
                        <strong>Available Quantity:</strong>{" "}
                        {selectedItem.item_quantity}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Approved Quantity
                  </label>
                  <input
                    type="number"
                    name="approved_quantity"
                    placeholder="Enter approved quantity"
                    value={formData.approved_quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        approved_quantity: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    required
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rejected Quantity
                  </label>
                  <input
                    type="number"
                    name="rejected_quantity"
                    placeholder="Enter rejected quantity"
                    value={formData.rejected_quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rejected_quantity: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    required
                    min="0"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium"
                  disabled={loading}
                >
                  {loading
                    ? "Submitting..."
                    : selectedReport
                    ? "Update"
                    : "Submit"}
                </button>
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
                            {/* <div className="text-xs text-gray-500 truncate">
                            {po.supplier?.name} ({po.supplier?.email})
                          </div> */}
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
                            <button
                              onClick={async () => { await ChangesStatus(po._id); await refreshGatemanData(); }}
                              className="px-3 py-1.5 rounded-md bg-green-100 text-green-600 hover:bg-green-200 text-xs sm:text-sm font-medium"
                            >
                              Verified
                            </button>
                          </td>
                          <td className="py-3 px-4 text-center border-b">
                            <div className="flex items-center justify-start space-x-3">
                              <button
                                className="p-1.5 rounded-md bg-green-100 text-green-600 hover:bg-green-200"
                                title="View"
                                onClick={async () => {
                                  await ChangesStatus(po?._id);
                                  // Refresh gateman data after status change
                                  await refreshGatemanData();
                                }}
                              >
                                Verified
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
    </div>
  );
};

export default QualityCheck;
