import React, { useEffect, useState } from "react";
import { Button } from "@/Components/ui/button";
import { useSupplierContext } from "@/Context/SuplierContext";
import { AnimatePresence, motion } from "framer-motion";
import {
  DownloadIcon,
  RefreshCcw,
  Search,
  X,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import Pagination from "@/Components/Pagination/Pagination";

const Supplier = () => {
  const { createSupplier, getAllSupplier, updateSupplier, deleteSupplier } =
    useSupplierContext();

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [mode, setMode] = useState("add");
  const [searchQuery, setSearchQuery] = useState("");
  const [page,setPage] = useState(1)


  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await getAllSupplier(page);
      setSuppliers(res || []);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [page]);


  const formik = useFormik({
    initialValues: {
      name: "",
      phone: "",
      email: "",
      company_name: "",
      address: "",
      gst_number: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      phone: Yup.string()
        .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
        .required("Phone is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      company_name: Yup.string().required("Company name is required"),
      address: Yup.string().required("Address is required"),
      gst_number: Yup.string().required("GST number is required"),
    }),
    onSubmit: async (values) => {
      try {
        if (mode === "edit" && selectedSupplier) {
          await updateSupplier(selectedSupplier._id, values);
        } else {
          await createSupplier(values);
        }
        fetchSuppliers();
        setShowModal(false);
        formik.resetForm();
        setSelectedSupplier(null);
        setMode("add");
      } catch (error) {
        console.error("Error saving supplier:", error);
      }
    },
  });

  const handleView = (supplier) => {
    setSelectedSupplier(supplier);
    setMode("view");
    formik.setValues({
      name: supplier.name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      company_name: supplier.company_name || "",
      address: supplier.address || "",
      gst_number: supplier.gst_number || "",
    });
    setShowModal(true);
  };

  const handleEdit = (supplier) => {
    setSelectedSupplier(supplier);
    setMode("edit");
    formik.setValues({
      name: supplier.name || "",
      phone: supplier.phone || "",
      email: supplier.email || "",
      company_name: supplier.company_name || "",
      address: supplier.address || "",
      gst_number: supplier.gst_number || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      try {
        await deleteSupplier(id);
        fetchSuppliers();
      } catch (error) {
        console.error("Error deleting supplier:", error);
      }
    }
  };

  const filteredSuppliers = suppliers.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.phone?.includes(q) ||
      s.company_name?.toLowerCase().includes(q)
    );
  });

  const handleDownload = () => {
    const headers = [
      "Supplier ID",
      "Name",
      "Phone",
      "Email",
      "GST Number",
      "Company Name",
      "Address",
      "Created At",
    ];
    const rows = suppliers.map((s) => [
      s._id || "",
      s.name || "",
      s.phone || "",
      s.email || "",
      s.gst_number || "",
      s.company_name || "",
      s.address || "",
      s.createdAt || "",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "suppliers.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="p-6 relative w-full ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Supplier</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => {
            setMode("add");
            setSelectedSupplier(null);
            formik.resetForm();
            setShowModal(true);
          }}
        >
          Add Supplier
        </Button>
      </div>

      {/* Search + Icons */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>
        <div className="flex items-center space-x-4 text-gray-600">
          <RefreshCcw
            className="cursor-pointer hover:text-gray-800"
            onClick={fetchSuppliers}
          />
          <DownloadIcon
            className="cursor-pointer hover:text-gray-800"
            onClick={handleDownload}
          />
        </div>
      </div>

     
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-auto">
        <div className="overflow-auto max-h-[70vh] rounded-lg">
          <table className="min-w-max w-full text-sm text-left text-gray-600">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-blue-600 to-sky-500 text-white uppercase text-xs tracking-wide">
                {[
                  "Supplier Id",
                  "Name",
                  "Company",
                  "Phone",
                  "Email",
                  "GST",
                  "Address",
                  "Actions",
                ].map((header, i) => (
                  <th
                    key={i}
                    className={`py-3 px-4 text-center font-semibold ${i === 0 ? "rounded-tl-2xl" : ""
                      } ${i === 7 ? "rounded-tr-2xl" : ""}`}
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
                    colSpan="8"
                    className="text-center py-6 text-gray-500 italic bg-gray-50"
                  >
                    Loading suppliers...
                  </td>
                </tr>
              ) : filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((s, i) => (
                  <tr
                    key={s._id || i}
                    className={`transition-all duration-200 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-blue-50`}
                  >
                    <td className="py-3 px-4 text-center text-gray-800 border-b">
                      {s?.supplier_id}
                    </td>
                    <td className="py-3 px-4 font-medium text-gray-800 border-b">
                      {s.name}
                    </td>
                    <td className="py-3 px-4 text-gray-700 border-b">
                      {s.company_name}
                    </td>
                    <td className="py-3 px-4 text-gray-700 border-b">
                      {s.phone}
                    </td>
                    <td className="py-3 px-4 text-gray-700 border-b">
                      {s.email}
                    </td>
                    <td className="py-3 px-4 text-gray-700 border-b">
                      {s.gst_number}
                    </td>
                    <td className="py-3 px-4 text-gray-700 border-b  overflow-hidden whitespace-nowrap">
                      {s.address.length > 20
                        ? `${s.address.slice(0, 20)}...`
                        : s.address}
                    </td>
                    <td className="py-3 px-4 text-center border-b">
                      <div className="flex items-center justify-center space-x-3">
                        <button
                          className="h-4 w-4 text-blue-500 cursor-pointer"
                          title="Edit"
                          onClick={() => handleEdit(s)}
                        >
                          <Edit size={16} />
                        </button>
                         <button
                         className="h-4 w-4 text-red-500 cursor-pointer"
                          title="Delete"
                          onClick={() => handleDelete(s._id)}
                        >
                          <Trash2 size={16} />
                        </button>
                        <button
                          className="h-4 w-4 text-gray-600 cursor-pointer"
                          title="View"
                          onClick={() => handleView(s)}
                        >
                          <Eye size={16} />
                        </button>
                        
                       
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="text-center py-6 text-gray-400 italic bg-gray-50"
                  >
                    No suppliers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/30 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
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
                  {mode === "add"
                    ? "Add Supplier"
                    : mode === "edit"
                      ? "Edit Supplier"
                      : "Supplier Details"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X />
                </button>
              </div>

              <form onSubmit={formik.handleSubmit} className="space-y-4">
                {[
                  { name: "name", label: "Name" },
                  { name: "phone", label: "Phone" },
                  { name: "email", label: "Email" },
                  { name: "company_name", label: "Company Name" },
                  { name: "address", label: "Address" },
                  { name: "gst_number", label: "GST Number" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium">
                      {field.label}
                    </label>
                    <input
                      type="text"
                      name={field.name}
                      value={formik.values[field.name]}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      disabled={mode === "view"}
                      className={`w-full border rounded-md px-3 py-2 mt-1 outline-none focus:ring-2 ${formik.touched[field.name] &&
                          formik.errors[field.name] &&
                          mode !== "view"
                          ? "border-red-500 focus:ring-red-200"
                          : "focus:ring-blue-200"
                        } ${mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""
                        }`}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                    {formik.touched[field.name] &&
                      formik.errors[field.name] &&
                      mode !== "view" && (
                        <p className="text-red-500 text-xs mt-1">
                          {formik.errors[field.name]}
                        </p>
                      )}
                  </div>
                ))}

                {mode !== "view" && (
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full mt-2"
                  >
                    {mode === "edit" ? "Update Supplier" : "Add Supplier"}
                  </Button>
                )}
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Pagination page={page} setPage={setPage} hasNextPage={suppliers?.length === 10} />
    </div>
  );
};

export default Supplier;
