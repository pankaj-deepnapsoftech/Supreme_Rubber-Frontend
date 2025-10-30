import React, { useState } from "react";
import { Button } from "@/Components/ui/button";
import { useSuplierContext } from "@/Context/SuplierContext";
import { AnimatePresence, motion } from "framer-motion";
import { DownloadIcon, Filter, RefreshCcw, Search, X } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";

const Supplier = () => {
  const [showModal, setShowModal] = useState(false);
  const { createSupplier } = useSuplierContext();

  
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
      gst_number: Yup.string()
        .matches(/^[0-9]{15}$/, "GST must be 15 digits")
        .required("GST number is required"),
    }),
    onSubmit: (values) => {
      createSupplier(values);
      setShowModal(false);
      formik.resetForm();
    },
  });

  return (
    <div className="p-6 relative overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Supplier</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setShowModal(true)}
        >
          Add Supplier
        </Button>
      </div>

      {/* Search & Icons */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search"
            className="pl-8 pr-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-1 focus:ring-gray-300"
          />
        </div>

        <div className="flex items-center space-x-4 text-gray-600">
          <Filter className="cursor-pointer hover:text-gray-800" />
          <RefreshCcw className="cursor-pointer hover:text-gray-800" />
          <DownloadIcon className="cursor-pointer hover:text-gray-800" />
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
              className="fixed top-0 right-0 h-full w-[400px] bg-white shadow-2xl z-50 p-6 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Add Supplier</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <X />
                </button>
              </div>

              {/* ✅ Formik Form */}
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
                      className={`w-full border rounded-md px-3 py-2 mt-1 outline-none focus:ring-2 ${formik.touched[field.name] && formik.errors[field.name]
                          ? "border-red-500 focus:ring-red-200"
                          : "focus:ring-blue-200"
                        }`}
                      placeholder={`Enter ${field.label.toLowerCase()}`}
                    />
                    {formik.touched[field.name] &&
                      formik.errors[field.name] && (
                        <p className="text-red-500 text-xs mt-1">
                          {formik.errors[field.name]}
                        </p>
                      )}
                  </div>
                ))}

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="bg-gray-400 hover:bg-gray-500 text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Save
                  </Button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Supplier;
