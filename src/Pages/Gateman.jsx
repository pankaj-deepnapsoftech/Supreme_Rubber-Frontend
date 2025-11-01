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
  Plus,
} from "lucide-react";
import { useGatemenContext } from "@/Context/GatemenContext";
import { useFormik } from "formik";


const Gateman = () => {


  const [searchQuery, setSearchQuery] = useState("");
  const [showPOModal, setShowPOModal] = useState(false);
  const { PendingGatemenData, AcceptPOData } = useGatemenContext()
  const [pendingData,setPendingData] = useState()
  const [showModal,setShowModal] = useState()
  const [mode, setMode] = useState("add"); // add | edit | view

  useEffect(()=>{
   const fetchPendingData = async()=>{
     const data = await PendingGatemenData()
     setPendingData(data)
    }
    fetchPendingData()
  },[])



  const formik = useFormik({
    initialValues: {
      po_ref:"",
      po_number: "",
      invoice_number: "",
      company_name: "",
      items: [{ item_name: "", item_quantity: 1 }],
      attached_po: null,
      attached_invoice: null,
      status: "Entry Created",
    },
    onSubmit: (values) => {
      console.log("Form Submitted", values);
    },
  });

  // const formik = useFormik({
  //   initialValues: {
  //     name: "",
  //     phone: "",
  //     email: "",
  //     company_name: "",
  //     address: "",
  //     gst_number: "",
  //   },
  //   validationSchema: Yup.object({
  //     name: Yup.string().required("Name is required"),
  //     phone: Yup.string()
  //       .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
  //       .required("Phone is required"),
  //     email: Yup.string().email("Invalid email").required("Email is required"),
  //     company_name: Yup.string().required("Company name is required"),
  //     address: Yup.string().required("Address is required"),
  //     gst_number: Yup.string().required("GST number is required"),
  //   }),
  //   onSubmit: async (values) => {
  //     try {
  //       if (mode === "edit" && selectedSupplier) {
  //         await updateSupplier(selectedSupplier._id, values);
  //       } else {
  //         await createSupplier(values);
  //       }
  //       fetchSuppliers();
  //       setShowModal(false);
  //       formik.resetForm();
  //       setSelectedSupplier(null);
  //       setMode("add");
  //     } catch (error) {
  //       console.error("Error saving supplier:", error);
  //     }
  //   },
  // });

  // const handleView = (supplier) => {
  //   setSelectedSupplier(supplier);
  //   setMode("view");
  //   formik.setValues({
  //     name: supplier.name || "",
  //     phone: supplier.phone || "",
  //     email: supplier.email || "",
  //     company_name: supplier.company_name || "",
  //     address: supplier.address || "",
  //     gst_number: supplier.gst_number || "",
  //   });
  //   setShowModal(true);
  // };

  // const handleEdit = (supplier) => {
  //   setSelectedSupplier(supplier);
  //   setMode("edit");
  //   formik.setValues({
  //     name: supplier.name || "",
  //     phone: supplier.phone || "",
  //     email: supplier.email || "",
  //     company_name: supplier.company_name || "",
  //     address: supplier.address || "",
  //     gst_number: supplier.gst_number || "",
  //   });
  //   setShowModal(true);
  // };

  // const handleDelete = async (id) => {
  //   if (window.confirm("Are you sure you want to delete this supplier?")) {
  //     try {
  //       await deleteSupplier(id);
  //       fetchSuppliers();
  //     } catch (error) {
  //       console.error("Error deleting supplier:", error);
  //     }
  //   }
  // };

  // const filteredSuppliers = suppliers.filter((s) => {
  //   const q = searchQuery.toLowerCase();
  //   return (
  //     s.name?.toLowerCase().includes(q) ||
  //     s.email?.toLowerCase().includes(q) ||
  //     s.phone?.includes(q) ||
  //     s.company_name?.toLowerCase().includes(q)
  //   );
  // });

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
  console.log(showModal)

  return (
    <div className="p-6 relative w-full ">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Gatemen</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => {
           
            // setSelectedSupplier(null);
            // formik.resetForm();
            setShowModal(true);
          }}
        >
          Add Gatemen
        </Button>
      </div>

     
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-3 sm:space-y-0">
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search Gatemen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-64 text-sm 
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   placeholder-gray-400"
            />
          </div>

          <Button onClick={() => setShowPOModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2.5 rounded-lg shadow-sm transition-all duration-150">
            PO Data
          </Button>
        </div>

        
        <div className="flex items-center space-x-3 text-gray-600">
          <button
            // onClick={fetchSuppliers}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-150"
            title="Refresh"
          >
            <RefreshCcw className="h-5 w-5" />
          </button>

          <button
            onClick={handleDownload}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-150"
            title="Download"
          >
            <DownloadIcon className="h-5 w-5" />
          </button>
        </div>
      </div>


     
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-auto">
        <div className="overflow-auto max-h-[70vh] rounded-lg">
          <table className="min-w-max w-full text-sm text-left text-gray-600">
            <thead className="sticky top-0 z-10">
              <tr className="bg-gradient-to-r from-blue-600 to-sky-500 text-white uppercase text-xs tracking-wide">
                {[
                  "PO Number",
                  "Invoice",
                  "Company Name",
                  "Item",
                  "Quantity",
                  
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

            {/* <tbody>
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
                          className="p-1.5 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200"
                          title="View"
                          onClick={() => handleView(s)}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className="p-1.5 rounded-md bg-green-100 text-green-600 hover:bg-green-200"
                          title="Edit"
                          onClick={() => handleEdit(s)}
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="p-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200"
                          title="Delete"
                          onClick={() => handleDelete(s._id)}
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
                    colSpan="8"
                    className="text-center py-6 text-gray-400 italic bg-gray-50"
                  >
                    No suppliers found.
                  </td>
                </tr>
              )}
            </tbody> */}
          </table>
        </div>
      </div>

     
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
              className="fixed top-0 right-0 h-full w-[450px] bg-white shadow-2xl z-50 p-6 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {mode === "add"
                    ? "Add Gate Entry"
                    : mode === "edit"
                      ? "Edit Gate Entry"
                      : "Gate Entry Details"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X />
                </button>
              </div>

             
              <form onSubmit={formik.handleSubmit} className="space-y-4">
             
                <div>
                  <label className="block text-sm font-medium">PO Ref.</label>
                  <select
                    type="text"
                    name="po_number"
                    value={formik.values.po_number}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    // disabled={mode === "view"}
                    className={`w-full border rounded-md px-3 py-2 mt-1 outline-none focus:ring-2 ${formik.touched.po_number && formik.errors.po_number
                      ? "border-red-500 focus:ring-red-200"
                      : "focus:ring-blue-200"
                      } ${mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    placeholder="Enter PO Number"
                  >

                  </select>
                </div>
                

                <div>
                  <label className="block text-sm font-medium">PO Number</label>
                  <input
                    type="text"
                    name="po_number"
                    value={formik.values.po_number}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    // disabled={mode === "view"}
                    className={`w-full border rounded-md px-3 py-2 mt-1 outline-none focus:ring-2 ${formik.touched.po_number && formik.errors.po_number
                        ? "border-red-500 focus:ring-red-200"
                        : "focus:ring-blue-200"
                      } ${mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    placeholder="Enter PO Number"
                  />
                </div>

                {/* Invoice Number */}
                <div>
                  <label className="block text-sm font-medium">
                    Invoice Number
                  </label>
                  <input
                    type="text"
                    name="invoice_number"
                    value={formik.values.invoice_number}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={mode === "view"}
                    className={`w-full border rounded-md px-3 py-2 mt-1 outline-none focus:ring-2 ${formik.touched.invoice_number && formik.errors.invoice_number
                        ? "border-red-500 focus:ring-red-200"
                        : "focus:ring-blue-200"
                      } ${mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    placeholder="Enter Invoice Number"
                  />
                </div>

                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company_name"
                    value={formik.values.company_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={mode === "view"}
                    className={`w-full border rounded-md px-3 py-2 mt-1 outline-none focus:ring-2 ${formik.touched.company_name && formik.errors.company_name
                        ? "border-red-500 focus:ring-red-200"
                        : "focus:ring-blue-200"
                      } ${mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    placeholder="Enter Company Name"
                  />
                </div>

                {/* Items List */}
                <div>
                  <label className="block text-sm font-medium mb-2">Items</label>
                  {formik.values.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 mb-2 border rounded-md p-2"
                    >
                      <input
                        type="text"
                        name={`items[${index}].item_name`}
                        value={item.item_name}
                        onChange={formik.handleChange}
                        disabled={mode === "view"}
                        placeholder="Item Name"
                        className="flex-1 border rounded-md px-2 py-1"
                      />
                      <input
                        type="number"
                        name={`items[${index}].item_quantity`}
                        value={item.item_quantity}
                        onChange={formik.handleChange}
                        disabled={mode === "view"}
                        placeholder="Qty"
                        className="w-20 border rounded-md px-2 py-1"
                      />
                      {mode !== "view" && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...formik.values.items];
                            updated.splice(index, 1);
                            formik.setFieldValue("items", updated);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                  {mode !== "view" && (
                    <Button
                      type="button"
                      onClick={() =>
                        formik.setFieldValue("items", [
                          ...formik.values.items,
                          { item_name: "", item_quantity: 1 },
                        ])
                      }
                      className="flex items-center gap-1 text-sm bg-green-600 hover:bg-green-700 mt-2"
                    >
                      <Plus size={16} /> Add Item
                    </Button>
                  )}
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-sm font-medium">Attach PO</label>
                  <input
                    type="file"
                    name="attached_po"
                    onChange={(e) =>
                      formik.setFieldValue("attached_po", e.target.files[0])
                    }
                    disabled={mode === "view"}
                    className="w-full border rounded-md px-3 py-2 mt-1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    Attach Invoice
                  </label>
                  <input
                    type="file"
                    name="attached_invoice"
                    onChange={(e) =>
                      formik.setFieldValue("attached_invoice", e.target.files[0])
                    }
                    disabled={mode === "view"}
                    className="w-full border rounded-md px-3 py-2 mt-1"
                  />
                </div>

                {/* Status Dropdown */}
                <div>
                  <label className="block text-sm font-medium">Status</label>
                  <select
                    name="status"
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    disabled={mode === "view"}
                    className={`w-full border rounded-md px-3 py-2 mt-1 outline-none focus:ring-2 ${mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                  >
                    <option value="Entry Created">Entry Created</option>
                    <option value="Verified">Verified</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                {/* Submit Button */}
                {mode !== "view" && (
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full mt-4"
                  >
                    {mode === "edit" ? "Update Entry" : "Add Entry"}
                  </Button>
                )}
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {showPOModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fadeIn"
          onClick={() => setShowPOModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-5xl p-6 relative overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
           
            <div className="flex justify-between items-center border-b pb-3 mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Purchase Order List</h2>
              <button
                onClick={() => setShowPOModal(false)}
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
                    <th className="px-4 py-3 text-left">Supplier</th>
                    <th className="px-4 py-3 text-left">Created On</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Items</th>
                    <th className="px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingData && pendingData.length > 0 ? (
                    pendingData.map((po, i) => (
                      <tr
                        key={i}
                        className={`border-b hover:bg-gray-50 transition ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
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
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${po.status === "PO Created"
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
                            <div key={idx} className="border-b last:border-0 py-1">
                              <span className="font-medium text-gray-800">
                                {p.item_name}
                              </span>{" "}
                              - {p.est_quantity} {p.uom}
                              <div className="text-xs text-gray-500">
                                Remain: {p.remain_quantity}, Produced: {p.produce_quantity}
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
                        No PO data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

           
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPOModal(false)}
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

export default Gateman;
