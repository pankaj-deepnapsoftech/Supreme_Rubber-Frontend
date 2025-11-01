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
import { useFormik } from "formik";
import * as Yup from "yup";
import { useInventory } from "@/Context/InventoryContext";

const Inventory = () => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const {
    products,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductDetails,
    loading,
    getAllProducts,
  } = useInventory();


  const formik = useFormik({
    initialValues: {
     
      inventory_category: "",
      name: "",
      uom: "",
      category: "",
      current_stock: "",
      price: "",
      item_type: "",
      product_or_service: "",
      sub_category: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Product name is required"),
      inventory_category: Yup.string().required("Inventory category is required"),
      current_stock: Yup.number()
        .typeError("Stock must be a number")
        .required("Stock is required"),
      price: Yup.number()
        .typeError("Price must be a number")
        .required("Price is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      if (editMode) {
        await updateProduct(values);
      } else {
        await createProduct(values);
      }
      resetForm();
      setShowModal(false);
      setEditMode(false);
    },
  });


  const handleEdit = async (id) => {
    const product = await getProductDetails(id);
    setSelectedProduct(product);
    formik.setValues(product);
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      await deleteProduct(id);
    }
  };

  const handleClose = () => {
    formik.resetForm();
    setShowModal(false);
    setEditMode(false);
    setViewMode(false);
    setSelectedProduct(null);
  };

  const handleView = async (id) => {
    const product = await getProductDetails(id);
    console.log(product)
    formik.setValues(product);
    setSelectedProduct(product);
    setViewMode(true);
    setShowModal(true);
  };

  const handleRefresh = () => {
    getAllProducts();
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
    const rows = (filteredProducts.length ? filteredProducts : products).map((p) => [
      p.product_id,
      p.category,
      p.name,
      p.current_stock,
      p.uom,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "inventory.csv";
    link.click();
  };


  useEffect(() => {
    getAllProducts();
  }, []);
  return (
    <div className="p-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Inventory</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setShowModal(true)}
        >
          Add Inventory
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

        </div>
        <div className="flex items-center space-x-4 text-gray-600">
          {/* Filter dropdown */}
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
            onClick={handleRefresh}
          />

         
          <Download
            className="cursor-pointer hover:text-gray-800"
            onClick={handleDownload}
          />
        </div>

      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-md border border-gray-100">
        <table className="min-w-full border-collapse text-sm text-left">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-sky-500 whitespace-nowrap text-white uppercase text-xs tracking-wide">
              {["Product ID", "Category", "Name", "Stock", "UOM", "Actions"].map(
                (header, i) => (
                  <th
                    key={i}
                    className={`py-3 px-4 text-center font-semibold ${i === 0 ? "rounded-tl-2xl" : ""
                      } ${i === 5 ? "rounded-tr-2xl" : ""}`}
                  >
                    {header}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-500 italic bg-gray-50 rounded-b-2xl"
                >
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
                .map((item, i) => (
                  <tr
                    key={item._id || i}
                    className={`transition-all duration-200 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-blue-50`}
                  >
                    <td className="py-3 px-4 text-center text-gray-800 border-b">
                      {item.product_id}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-800 border-b">
                      {item.category}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-800 border-b">
                      {item.name}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-800 border-b">
                      {item.current_stock}
                    </td>
                    <td className="py-3 px-4 text-center text-gray-800 border-b">
                      {item.uom}
                    </td>

                    <td className="py-3 px-4 text-center border-b">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          className="p-1.5 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200"
                          title="View"
                          onClick={() => handleView(item._id)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="p-1.5 rounded-md bg-green-100 text-green-600 hover:bg-green-200"
                          title="Edit"
                          onClick={() => handleEdit(item._id)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="p-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200"
                          title="Delete"
                          onClick={() => handleDelete(item._id)}
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
                  colSpan="6"
                  className="text-center py-6 text-gray-400 italic bg-gray-50 rounded-b-2xl"
                >
                  No products found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>




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
              className="fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-50 p-6 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {viewMode ? "Product Details" : editMode ? "Edit Product" : "Add Inventory"}

                </h2>
                <button
                  onClick={handleClose}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X />
                </button>
              </div>
              <form onSubmit={formik.handleSubmit} className="space-y-4">
                {Object.keys(formik.initialValues)
                  .filter((key) => key !== "_id")
                  .map((key) => {
                    const label = key.replaceAll("_", " ");
                    const isNumber = key === "price" || key === "current_stock";

                    // Dropdown options for specific fields
                    const dropdownOptions = {
                      category: ["Finished Goods", "Raw Material"],
                      uom: ["Kg", "Litre", "Meter", "Piece", "Box", "Dozen", "Pack"],
                      product_service: ["Product", "Service"], 
                    };

                    const isSelect = Object.keys(dropdownOptions).includes(key);

                    return (
                      <div key={key}>
                        <label className="block text-sm font-medium capitalize mb-1">
                          {label}
                        </label>

                        {/* Dropdown Field */}
                        {isSelect ? (
                          <select
                            name={key}
                            value={formik.values[key]}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            disabled={viewMode}
                            className={`w-full border rounded-md px-3 py-2 mt-1 outline-none focus:ring-2 ${formik.touched[key] && formik.errors[key]
                                ? "border-red-500 focus:ring-red-200"
                                : "focus:ring-blue-200"
                              } ${viewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          >
                            <option value="">Select {label}</option>
                            {dropdownOptions[key].map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          // Normal input
                          <input
                            type={isNumber ? "number" : "text"}
                            name={key}
                            value={formik.values[key]}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            readOnly={viewMode}
                            className={`w-full border rounded-md px-3 py-2 mt-1 outline-none focus:ring-2 ${formik.touched[key] && formik.errors[key]
                                ? "border-red-500 focus:ring-red-200"
                                : "focus:ring-blue-200"
                              } ${viewMode ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          />
                        )}

                        {/* Validation Message */}
                        {formik.touched[key] && formik.errors[key] && (
                          <p className="text-red-500 text-xs mt-1">
                            {formik.errors[key]}
                          </p>
                        )}
                      </div>
                    );
                  })}

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-3">
                  <Button
                    type="button"
                    onClick={handleClose}
                    className="bg-gray-400 hover:bg-gray-500 text-white"
                  >
                    {viewMode ? "Close" : "Cancel"}
                  </Button>

                  {!viewMode && (
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {editMode ? "Update" : "Save"}
                    </Button>
                  )}
                </div>
              </form>

            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;
