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

const BOM = () => {
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
    <h1 className="text-xl sm:text-2xl font-semibold">Bill of Material</h1>
    <Button
      className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
      onClick={() => setShowModal(true)}
    >
      Add New BOM
    </Button>
  </div>

  {/* Search & Actions */}
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
    {/* Search Box */}
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

    {/* Action Icons */}
    <div className="flex items-center gap-4 text-gray-600">
      {/* Filter Dropdown */}
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

      {/* Refresh + Download */}
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
    <table className="w-full min-w-[700px] text-sm text-left">
      <thead >
        <tr className="bg-linear-to-r from-blue-600 to-sky-500 whitespace-nowrap text-white uppercase text-xs tracking-wide" >
          <th className="px-4 sm:px-6 py-3 font-medium">Compound Code</th>
          <th className="px-4 sm:px-6 py-3 font-medium">Compound Name</th>
          <th className="px-4 sm:px-6 py-3 font-medium">Part Name</th>
          <th className="px-4 sm:px-6 py-3 font-medium">Created Date</th>
          <th className="px-4 sm:px-6 py-3 font-medium text-center">Action</th>
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
              No Bill found.
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
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-2xl shadow-lg w-[95%] sm:w-[90%] md:w-[85%] lg:max-w-6xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-4 text-2xl text-gray-600 hover:text-red-500 transition"
              >
                ✕
              </button>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-4">
                Bill of Materials (BOM)
              </h1>
              <hr className="border-gray-300 mb-6" />

              {/* BOM Id & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    BOM Id
                  </label>
                  <input
                    type="text"
                    placeholder="Enter BOM Id..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    BOM Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter BOM Name"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-blue-400"
                  />
                </div>
              </div>

              {/* Sections */}
              <Section
                title="Compounding Standard"
                headers={[
                  "Compound Name",
                  "Compound Code",
                  "Hardness",
                  "Part Name",
                ]}
              />

              <Section
                title="Raw Material"
                headers={[
                  "Raw Material Name",
                  "Weight",
                  "Tolerance",
                  "Code No.",
                ]}
              />

              <Section
                title="Processes"
                headers={["Process 1", "Process 2", "Process 3", "Process 4"]}
              />

              {/* Submit */}
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

/* Reusable Section Component */
const Section = ({ title, headers }) => (
  <section className="mb-8">
    {/* Section Title */}
    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
      {title}
    </h2>

    {/* Header Row */}
    <div className="hidden sm:grid grid-cols-2 sm:grid-cols-4 bg-blue-600 text-white rounded-md px-3 py-2 text-xs sm:text-sm font-medium">
      {headers.map((h, i) => (
        <span key={i} className="truncate text-center">
          {h}
        </span>
      ))}
    </div>

    {/* Input Row(s) */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-3">
      {headers.map((h, i) => (
        <input
          key={i}
          placeholder={`Enter ${h}`}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-400"
        />
      ))}
    </div>

    {/* Add More Button */}
    <div className="flex justify-end mt-4">
      <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 shadow-sm text-sm font-medium">
        Add More
      </button>
    </div>
  </section>
);

export default BOM;
