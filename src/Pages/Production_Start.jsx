import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  RefreshCcw,
  Download,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useInventory } from "@/Context/InventoryContext";

const Production_Start = () => {
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

  const handleFilter = (category) => {
    setSelectedCategory(category);
    if (category === "All") setFilteredProducts(products);
    else setFilteredProducts(products.filter((p) => p.category === category));
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
        <h1 className="text-xl sm:text-2xl font-semibold">Production Start</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
          onClick={() => setShowModal(true)}
        >
          Add Production
        </Button>
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        {/* Search */}
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

        {/* Actions */}
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

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full text-sm text-left min-w-[600px]">
          <thead >
            <tr className="bg-linear-to-r from-blue-600 to-sky-500 whitespace-nowrap text-white uppercase text-xs tracking-wide">
              <th className="px-4 sm:px-6 py-3 font-medium">Compound Code</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Status</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Quantity</th>
              <th className="px-4 sm:px-6 py-3 font-medium">UOM</th>
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
                    <td className="px-4 sm:px-6 py-3 text-center">
                      <div className="flex justify-center space-x-3">
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
                  No Production found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add BOM Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative bg-white rounded-2xl shadow-lg w-[95%] sm:w-[90%] md:w-[85%] lg:max-w-6xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-4 text-2xl text-gray-600 hover:text-red-500 transition"
              >
                ✕
              </button>

              {/* Back Button */}
              <button
                onClick={() => setShowModal(false)}
                className="text-2xl mb-4 hover:text-blue-500 transition"
              >
                ←
              </button>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6 sm:mb-8">
                Add New Production
              </h1>

              {/* ---------- Finished Goods Section ---------- */}
              <section className="mb-10">
                <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Finished Goods
                  </h2>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-1.5 shadow text-sm font-medium">
                    Add More
                  </button>
                </div>

                {/* Header Row */}
                <div className="hidden sm:grid grid-cols-7 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-md overflow-hidden">
                  {[
                    "Finished Goods",
                    "EST. QTY",
                    "UOM",
                    "PROD. QTY",
                    "Remain QTY",
                    "Category",
                    "Total Cost",
                  ].map((head) => (
                    <div key={head} className="p-2 text-center truncate">
                      {head}
                    </div>
                  ))}
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 mt-3">
                  {[
                    "Enter Finished Good",
                    "Enter Quantity",
                    "Enter UOM",
                    "Enter Quantity",
                    "Enter Quantity",
                    "Enter Category",
                    "Enter Total Cost",
                  ].map((ph) => (
                    <input
                      key={ph}
                      placeholder={ph}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-blue-400"
                    />
                  ))}
                </div>
              </section>

              {/* ---------- Raw Materials Section ---------- */}
              <section className="mb-10">
                <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Raw Materials
                  </h2>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-1.5 shadow text-sm font-medium">
                    Add More
                  </button>
                </div>

                {/* Header Row */}
                <div className="hidden sm:grid grid-cols-7 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-md overflow-hidden">
                  {[
                    "Finished Goods",
                    "EST. QTY",
                    "UOM",
                    "Used QTY",
                    "Remain QTY",
                    "Category",
                    "Total Cost",
                  ].map((head) => (
                    <div key={head} className="p-2 text-center truncate">
                      {head}
                    </div>
                  ))}
                </div>

                {/* Example Multiple Rows */}
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 sm:grid-cols-7 gap-3 mt-3"
                  >
                    {[
                      "Enter Finished Good",
                      "Enter Quantity",
                      "Enter UOM",
                      "Enter Quantity",
                      "Enter Quantity",
                      "Enter Category",
                      "Enter Total Cost",
                    ].map((ph) => (
                      <input
                        key={ph + i}
                        placeholder={ph}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-blue-400"
                      />
                    ))}
                  </div>
                ))}
              </section>

              {/* ---------- Processes Section ---------- */}
              <section className="mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-gray-800">
                          Process {i}
                        </h3>
                        <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded-full text-xs font-medium">
                          Completed
                        </span>
                      </div>

                      <input
                        placeholder={i % 2 === 0 ? "Extruding" : "Leveling"}
                        className="border border-gray-300 rounded-md px-3 py-2 w-full mb-3 text-sm focus:ring-1 focus:ring-blue-400"
                      />

                      <label className="text-sm text-gray-700 font-medium mb-1 block">
                        Work Done
                      </label>
                      <input
                        placeholder="1000"
                        type="number"
                        className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:ring-1 focus:ring-blue-400 mb-2"
                      />

                      <div className="flex gap-4 items-center mt-2 flex-wrap">
                        <label className="flex items-center gap-1 text-sm text-gray-700">
                          <input type="checkbox" className="accent-blue-600" />
                          Start
                        </label>
                        <label className="flex items-center gap-1 text-sm text-gray-700">
                          <input type="checkbox" className="accent-blue-600" />
                          Done
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Submit Button */}
              <div className="flex justify-center mt-10 mb-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-8 py-2 shadow-md font-medium transition">
                  Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Production_Start;
