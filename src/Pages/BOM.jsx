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
    <div className="p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Bill of Material</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setShowModal(true)}
        >
          Add New BOM
        </Button>
      </div>

      {/* Search & Actions */}
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
              <th className="px-6 py-3 font-medium">Compound Code</th>
              <th className="px-6 py-3 font-medium">Compound Name</th>
              <th className="px-6 py-3 font-medium">Part Name</th>
              <th className="px-6 py-3 font-medium">Created Date</th>
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
                    <td className="px-6 py-3 text-center flex justify-center space-x-3">
                      <Edit className="h-4 w-4 text-blue-500 cursor-pointer" />
                      <Trash2 className="h-4 w-4 text-red-500 cursor-pointer" />
                      <Eye className="h-4 w-4 text-gray-600 cursor-pointer" />
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
              className="relative bg-white rounded-2xl shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto p-6 sm:p-10"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-2xl text-gray-600 hover:text-red-500 transition"
              >
                ✕
              </button>

              <h1 className="text-3xl font-semibold text-gray-900 mb-2">
                Bill of Materials (BOM)
              </h1>
              <hr className="border-gray-300 mb-6" />

              {/* BOM Id & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
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

              {/* Compounding Standard */}
              <Section
                title="Compounding Standard"
                headers={[
                  "Compound Name",
                  "Compound Code",
                  "Hardness",
                  "Part Name",
                ]}
              />

              {/* Raw Material */}
              <Section
                title="Raw Material"
                headers={[
                  "Raw Material Name",
                  "Weight",
                  "Tolerance",
                  "Code No.",
                ]}
              />

              {/* Processes */}
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
    <h2 className="text-lg font-semibold text-gray-900 mb-3">{title}</h2>
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-blue-600 text-white rounded-md px-3 py-2 text-sm font-medium">
      {headers.map((h, i) => (
        <span key={i}>{h}</span>
      ))}
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3">
      {headers.map((_, i) => (
        <input
          key={i}
          placeholder={`Enter ${headers[i]}`}
          className="border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-blue-400"
        />
      ))}
      <div className="flex gap-3 col-span-1 sm:col-span-4 justify-end">
        <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 shadow-sm text-sm font-medium">
          Add More
        </button>
      </div>
    </div>
  </section>
);

export default BOM;
