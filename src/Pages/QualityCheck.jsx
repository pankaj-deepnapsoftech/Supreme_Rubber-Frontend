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
import { useInventory } from "@/Context/InventoryContext";

const QualityCheck = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showGtModal, setShowGtModal] = useState(false);
  const [pendingData, setPendingData] = useState();

  const {
    products,
    deleteProduct,
    getProductDetails,
    loading,
    getAllProducts,
  } = useInventory();

  useEffect(() => {
    getAllProducts();
  }, []);

  const handleClose = () => {
    setShowModal(false);
  };

  const handleFilter = (category) => {
    setSelectedCategory(category);
    if (category === "All") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((p) => p.category === category);
      setFilteredProducts(filtered);
    }
  };

  const handleDownload = () => {
    const headers = ["Product Id", "Category", "Name", "Stock", "UOM"];
    const rows = (filteredProducts.length ? filteredProducts : products).map(
      (p) => [p.product_id, p.category, p.name, p.current_stock, p.uom]
    );

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "inventory.csv";
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

      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
        {/* Search + Gateman */}
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

        {/* Icons */}
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
              {[...new Set(products.map((p) => p.category))].map((cat) => (
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
            onClick={getAllProducts}
          />
          <Download
            className="cursor-pointer hover:text-gray-800"
            onClick={handleDownload}
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="border rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full min-w-[800px] text-sm text-left">
          <thead>
            <tr className="bg-linear-to-r from-blue-600 to-sky-500 whitespace-nowrap text-white uppercase text-xs tracking-wide">
              <th className="px-4 sm:px-6 py-3 font-medium">Product Type</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Product Name</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Item</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Quantity</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Status</th>
              <th className="px-4 sm:px-6 py-3 font-medium text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  Loading products...
                </td>
              </tr>
            ) : products?.length > 0 ? (
              (filteredProducts.length ? filteredProducts : products)
                .filter((item) => {
                  const q = searchQuery.toLowerCase();
                  return (
                    item.name.toLowerCase().includes(q) ||
                    item.category.toLowerCase().includes(q) ||
                    item.product_id.toLowerCase().includes(q)
                  );
                })
                .map((item, index) => (
                  <tr
                    key={index}
                    className={`border-t ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 sm:px-6 py-3">{item.product_id}</td>
                    <td className="px-4 sm:px-6 py-3">{item.category}</td>
                    <td className="px-4 sm:px-6 py-3">{item.name}</td>
                    <td className="px-4 sm:px-6 py-3">{item.current_stock}</td>
                    <td className="px-4 sm:px-6 py-3">{item.uom}</td>
                    <td className="px-4 sm:px-6 py-3 text-center">
                      <div className="flex justify-center gap-3">
                        <Edit className="h-4 w-4 text-blue-500 cursor-pointer" />
                        <Trash2 className="h-4 w-4 text-red-500 cursor-pointer" />
                        <Eye className="h-4 w-4 text-gray-600 cursor-pointer" />
                      </div>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Slide Drawer Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />
            {/* Drawer */}
            <motion.div
              className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white shadow-2xl z-50 p-5 sm:p-6 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {/* Drawer Header */}
              <div className="flex items-center space-x-2 mb-6">
                <button
                  onClick={handleClose}
                  className="text-gray-700 hover:text-black"
                >
                  <X className="h-5 w-5" />
                </button>
                <h2 className="text-lg sm:text-xl font-semibold">
                  Add New Quality Report
                </h2>
              </div>

              {/* Form */}
              <form className="space-y-5">
                {[
                  { label: "Product Type", ph: "Enter Product Type" },
                  { label: "Product Name", ph: "Enter Product Name" },
                  { label: "Approved Quantity", ph: "20kg" },
                  { label: "Rejected Quantity", ph: "5kg" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {f.label}
                    </label>
                    <input
                      type="text"
                      placeholder={f.ph}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                ))}

                {/* Status */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <button
                      type="button"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      Add More
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">Approved</span>
                      <input
                        type="text"
                        placeholder="15kg"
                        className="w-16 border border-gray-300 rounded-md text-center text-sm py-1 focus:outline-none focus:ring-1 focus:ring-blue-100"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-700">Rejected</span>
                      <input
                        type="text"
                        placeholder="10kg"
                        className="w-16 border border-gray-300 rounded-md text-center text-sm py-1 focus:outline-none focus:ring-1 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </div>

                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attach Report
                  </label>
                  <button
                    type="button"
                    className="border border-gray-300 rounded-md w-full py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    Attach Report
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md text-sm font-medium transition"
                >
                  SUBMIT
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Gateman Modal */}
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
                Purchase Order List
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
                    <th className="px-3 sm:px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {pendingData && pendingData.length > 0 ? (
                    pendingData.map((po, i) => (
                      <tr
                        key={i}
                        className={`border-b hover:bg-gray-50 transition ${
                          i % 2 === 0 ? "bg-gray-50" : "bg-white"
                        }`}
                      >
                        <td className="px-3 sm:px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                          {po.po_number}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-gray-700 whitespace-nowrap">
                          {po.supplier?.company_name || "—"}
                          <div className="text-xs text-gray-500 truncate">
                            {po.supplier?.name} ({po.supplier?.email})
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-gray-600 whitespace-nowrap">
                          {new Date(po.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          })}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-gray-600">
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
                        </td>
                        <td className="py-3 px-3 sm:px-4 text-center">
                          <button
                            className="px-3 py-1.5 rounded-md bg-green-100 text-green-600 hover:bg-green-200 text-xs sm:text-sm font-medium"
                            onClick={() => AcceptPOData(po?._id)}
                          >
                            Accept
                          </button>
                        </td>
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
