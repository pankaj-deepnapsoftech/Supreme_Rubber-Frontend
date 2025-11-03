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
    <div className="p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Quality Check</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setShowModal(true)}
        >
          Add Report
        </Button>
      </div>

      {/* Search & Icons */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-1 focus:ring-gray-300"
          />

          <Button
            onClick={() => setShowGtModal(true)}
            className="bg-blue-600 ml-[10px] hover:bg-blue-700 text-white text-sm px-4 py-2.5 rounded-lg shadow-sm transition-all duration-150"
          >
            Gateman
          </Button>
        </div>

        <div className="flex items-center space-x-4 text-gray-600">
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

      {/* Table */}
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="px-6 py-3 font-medium">Product Type</th>
              <th className="px-6 py-3 font-medium">Product Name</th>
              <th className="px-6 py-3 font-medium">Item</th>
              <th className="px-6 py-3 font-medium">Quantity</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-center">Action</th>
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
                    <td className="px-6 py-3">{item.product_id}</td>
                    <td className="px-6 py-3">{item.category}</td>
                    <td className="px-6 py-3">{item.name}</td>
                    <td className="px-6 py-3">{item.current_stock}</td>
                    <td className="px-6 py-3">{item.uom}</td>
                    <td className="px-6 py-3 flex space-x-3 justify-center">
                      <Edit className="h-4 w-4 text-blue-500 cursor-pointer" />
                      <Trash2 className="h-4 w-4 text-red-500 cursor-pointer" />
                      <Eye className="h-4 w-4 text-gray-600 cursor-pointer" />
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

      {/* Modal Drawer */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/30 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
            />

            <motion.div
              className="fixed top-0 right-0 h-full w-[420px] bg-white shadow-2xl z-50 p-6 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              {/* Header */}
              <div className="flex items-center space-x-2 mb-6">
                <button
                  onClick={handleClose}
                  className="text-gray-700 hover:text-black"
                >
                  <X className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-semibold">
                  Add New Quality Report
                </h2>
              </div>

              {/* Form */}
              <form className="space-y-5">
                {/* Product Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Type
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Product Type"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Product Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Product Name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Status Section */}
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
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">Approved</span>
                      <input
                        type="text"
                        placeholder="15kg"
                        className="w-16 border border-gray-300 rounded-md text-center text-sm py-1 focus:outline-none focus:ring-1 focus:ring-blue-100"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-700">Rejected</span>
                      <input
                        type="text"
                        placeholder="10kg"
                        className="w-16 border border-gray-300 rounded-md text-center text-sm py-1 focus:outline-none focus:ring-1 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Approved Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Approved Quantity
                  </label>
                  <input
                    type="text"
                    placeholder="20kg"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Rejected Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rejected Quantity
                  </label>
                  <input
                    type="text"
                    placeholder="5kg"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Attached Report */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attached Report
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

      {showGtModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn"
          onClick={() => setShowGtModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-5xl p-6 relative overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b pb-3 mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Purchase Order List
              </h2>
              <button
                onClick={() => setShowGtModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="overflow-x-auto border rounded-lg shadow-inner">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-gradient-to-r from-blue-600 to-sky-500 text-white text-xs uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left">PO Number</th>
                    <th className="px-4 py-3 text-left">Invoice No.</th>
                    <th className="px-4 py-3 text-left">Company Name</th>
                    <th className="px-4 py-3 text-left">Items</th>
                    <th className="px-4 py-3 text-left">Quantity</th>
                    <th className="px-4 py-3 text-left">Action</th>
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
                        <td className="px-4 py-3 font-semibold text-gray-800">
                          {po.po_number}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {po.supplier?.company_name || "—"}
                          <div className="text-xs text-gray-500">
                            {po.supplier?.name} ({po.supplier?.email})
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {new Date(po.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              po.status === "PO Created"
                                ? "bg-blue-100 text-blue-700"
                                : po.status === "Approved"
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {po.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {po.products?.map((p, idx) => (
                            <div
                              key={idx}
                              className="border-b last:border-0 py-1"
                            >
                              <span className="font-medium text-gray-800">
                                {p.item_name}
                              </span>{" "}
                              - {p.est_quantity} {p.uom}
                              <div className="text-xs text-gray-500">
                                Remain: {p.remain_quantity}, Produced:{" "}
                                {p.produce_quantity}
                              </div>
                            </div>
                          ))}
                        </td>
                        <td className="py-3 px-4 text-center border-b">
                          <div className="flex items-center justify-start space-x-3">
                            <button
                              className="p-1.5 rounded-md bg-green-100 text-green-600 hover:bg-green-200"
                              title="View"
                              onClick={() => AcceptPOData(po?._id)}
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
                        colSpan="5"
                        className="text-center text-gray-500 py-6 italic"
                      >
                        No Gateman Record Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowGtModal(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
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
