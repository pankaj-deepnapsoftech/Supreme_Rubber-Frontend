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
import { motion, AnimatePresence } from "framer-motion";
import { useGatemenContext } from "@/Context/GatemenContext";
import { useQualityCheck } from "@/Context/QualityCheckContext";

const QualityCheck = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredReports, setFilteredReports] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showGtModal, setShowGtModal] = useState(false);
  const [getData, setGetData] = useState([]);
  const [formData, setFormData] = useState({
    productType: "",
    productName: "",
    approvedQty: "",
    rejectedQty: "",
    status: "",
    attached_report: null,
  });

  const { GetAllPOData } = useGatemenContext();

  const {
    qualityReports,
    getAllReports,
    getReportById,
    createReport,
    updateReport,
    deleteReport,
    selectedReport,
    setSelectedReport,
    loading,
  } = useQualityCheck();

  // Fetch initial data
  useEffect(() => {
    const getGateman = async () => {
      const data = await GetAllPOData();
      setGetData(data);
    };
    getGateman();
    getAllReports();
  }, []);

  // Prefill edit modal
  useEffect(() => {
    if (selectedReport) {
      setFormData({
        productType: selectedReport.productType || "",
        productName: selectedReport.productName || "",
        approvedQty: selectedReport.approvedQty || "",
        rejectedQty: selectedReport.rejectedQty || "",
        status: selectedReport.status || "",
        attached_report: null,
      });
    }
  }, [selectedReport]);

  const handleClose = () => {
    setShowModal(false);
    setSelectedReport(null);
    setFormData({
      productType: "",
      productName: "",
      approvedQty: "",
      rejectedQty: "",
      status: "",
      attached_report: null,
    });
  };

  const handleFilter = (category) => {
    setSelectedCategory(category);
    if (category === "All") setFilteredReports(qualityReports);
    else {
      const filtered = qualityReports.filter((p) => p.category === category);
      setFilteredReports(filtered);
    }
  };

  const handleDownload = () => {
    const headers = [
      "Product Type",
      "Product Name",
      "Approved Qty",
      "Rejected Qty",
      "Status",
    ];
    const rows = (filteredReports.length ? filteredReports : qualityReports).map(
      (p) => [p.productType, p.productName, p.approvedQty, p.rejectedQty, p.status]
    );

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "quality_reports.csv";
    link.click();
  };

  return (
    <div className="p-4 sm:p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Quality Check</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
          onClick={() => setShowModal(true)}
        >
          Add Report
        </Button>
      </div>

      {/* Search + Actions */}
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
              {[...new Set(qualityReports.map((p) => p.category))].map((cat) => (
                <p
                  key={cat}
                  onClick={() => handleFilter(cat)}
                  className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                >
                  {cat}
                </p>
              ))}
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

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full min-w-[800px] text-sm text-left">
          <thead>
            <tr className="bg-linear-to-r from-blue-600 to-sky-500 text-white uppercase text-xs tracking-wide">
              <th className="px-4 py-3 font-medium">Product Type</th>
              <th className="px-4 py-3 font-medium">Product Name</th>
              <th className="px-4 py-3 font-medium">Approved</th>
              <th className="px-4 py-3 font-medium">Rejected</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  Loading reports...
                </td>
              </tr>
            ) : qualityReports?.length > 0 ? (
              (filteredReports.length ? filteredReports : qualityReports)
                .filter((item) => {
                  const q = searchQuery.toLowerCase();
                  return (
                    item.productType?.toLowerCase().includes(q) ||
                    item.productName?.toLowerCase().includes(q)
                  );
                })
                .map((item, i) => (
                  <tr
                    // key={i}
                    key={item._id || i}
                    className={`border-t ${
                      i % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 py-3">{item.productType}</td>
                    <td className="px-4 py-3">{item.productName}</td>
                    <td className="px-4 py-3">{item.approvedQty}</td>
                    <td className="px-4 py-3">{item.rejectedQty}</td>
                    <td className="px-4 py-3">{item.status}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-3">
                        <Edit
                          className="h-4 w-4 text-blue-500 cursor-pointer"
                          onClick={() => handleEdit(item._id)}
                        />
                        <Trash2
                          className="h-4 w-4 text-red-500 cursor-pointer"
                          onClick={() => deleteReport(item._id)}
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
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No reports found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {/* <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />
            <motion.div
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
                  {selectedReport ? "Edit Report" : "Add New Report"}
                </h2>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                {[
                  { name: "productType", label: "Product Type" },
                  { name: "productName", label: "Product Name" },
                  { name: "approvedQty", label: "Approved Quantity" },
                  { name: "rejectedQty", label: "Rejected Quantity" },
                  { name: "status", label: "Status" },
                ].map((f) => (
                  <div key={f.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {f.label}
                    </label>
                    <input
                      type="text"
                      name={f.name}
                      value={formData[f.name]}
                      onChange={(e) =>
                        setFormData({ ...formData, [f.name]: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                      required
                    />
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attach Report
                  </label>
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        attached_report: e.target.files[0],
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium"
                >
                  {selectedReport ? "Update" : "Submit"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence> */}
      <AnimatePresence>
  {showModal && (
    <>
      <motion.div
        className="fixed inset-0 bg-black/40 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      />
      <motion.div
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
            {selectedReport ? "Edit Quality Report" : "Add New Quality Report"}
          </h2>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Product Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Type
            </label>
            <input
              type="text"
              name="product_type"
              placeholder="Enter Product Type"
              value={formData.product_type}
              onChange={(e) =>
                setFormData({ ...formData, product_type: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>



          {/* Product Name (Item ID dropdown) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <select
              name="item_id"
              value={formData.item_id}
              onChange={(e) =>
                setFormData({ ...formData, item_id: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            >
              <option value="">Select Item</option>
              {getData?.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.item_name || item._id}
                </option>
              ))}
            </select>
          </div>

          {/* Approved Quantity */}
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
                setFormData({ ...formData, approved_quantity: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {/* Rejected Quantity */}
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
                setFormData({ ...formData, rejected_quantity: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {/* Max Allowed Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Allowed Quantity
            </label>
            <input
              type="number"
              name="max_allowed_quantity"
              placeholder="Enter max allowed quantity"
              value={formData.max_allowed_quantity}
              onChange={(e) =>
                setFormData({ ...formData, max_allowed_quantity: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attached Report
            </label>
            <input
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) =>
                setFormData({
                  ...formData,
                  attached_report: e.target.files[0],
                })
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium"
          >
            {selectedReport ? "Update" : "Submit"}
          </button>
        </form>
      </motion.div>
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
            {/* Header */}
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

            {/* Responsive Table Container */}
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
                  </tr>
                </thead>

                <tbody>
                  {getData && getData.length > 0 ? (
                    getData.map((po, i) => (
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
                          {po?.items.map((i) => i.item_name).join(', ')}
                        </td>
                         <td className="px-3 sm:px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                          {po?.items.map((i)=> i.item_quantity).join(", ")}
                        </td> 
                        <td className="px-3 sm:px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                          {po?.status}
                        </td>

                        {/* <td className="px-3 sm:px-4 py-3 text-gray-600 whitespace-nowrap">
                          {new Date(po.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          })}
                        </td> */}
                        {/* <td className="px-3 sm:px-4 py-3 text-gray-600">
                          {po.products?.map((p, idx) => (
                            <div
                              key={idx}
                              className="border-b last:border-0 py-1"
                            >
                              <span className="font-medium text-gray-800">
                                {p.item_name}
                              </span>{" "}
                              - {p.est_quantity} {p.uom}
                            </div>
                          ))}
                        </td> */}
                        {/* <td className="py-3 px-3 sm:px-4 text-center">
                          <button
                            className="px-3 py-1.5 rounded-md bg-green-100 text-green-600 hover:bg-green-200 text-xs sm:text-sm font-medium"
                            onClick={() => AcceptPOData(po?._id)}
                          >
                            Accept
                          </button>
                        </td> */}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="text-center text-gray-500 py-6 italic"
                      >
                        No Gateman Record Found
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
