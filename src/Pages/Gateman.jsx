import React, { useEffect, useState } from "react";
import { Button } from "@/Components/ui/button";
import { useSupplierContext } from "@/Context/SuplierContext";
import { AnimatePresence, motion } from "framer-motion";
import { usePurchanse_Order } from "@/Context/PurchaseOrderContext";
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
import { toast } from "react-toastify";
import Pagination from "@/Components/Pagination/Pagination";

const Gateman = () => {
  const {
    PendingGatemenData,
    AcceptPOData,
    PostGatemenData,
    GetAllPOData,
    UpdatedGatemenData,
    DetailsGatemenData,
    DeleteGatemenData,
  } = useGatemenContext();
  const { GetAllPurchaseOrders } = usePurchanse_Order();
  const [POData, setPOData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPOModal, setShowPOModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState("add");
  const [GatemenData, setGatemenData] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edittable, setEditTable] = useState(null);
  const [page, setPage] = useState(1)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const pending = await PendingGatemenData();
        setPendingData(pending || []);

        const poRes = await GetAllPurchaseOrders();
        const accepted =
          poRes?.pos?.filter((i) => i?.status === "Accepted") || [];
        setPOData(accepted);

        const gateData = await GetAllPOData(page);
        setGatemenData(gateData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page]);

  const refreshGatemenData = async () => {
    setLoading(true);
    try {
      const pending = await PendingGatemenData();
      setPendingData(pending || []);

      const poRes = await GetAllPurchaseOrders();
      const accepted =
        poRes?.pos?.filter((i) => i?.status === "Accepted") || [];
      setPOData(accepted);

      const gateData = await GetAllPOData();
      setGatemenData(gateData || []);
    } catch (error) {
      console.error("Error refreshing Gatemen data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await refreshGatemenData();
    setLoading(true);
    const gateData = await GetAllPOData();
    setGatemenData(gateData || []);
    setLoading(false);
  };

  // Filter Gatemen data based on search
  const filteredGatemen = GatemenData?.filter((entry) => {
    const query = searchQuery.toLowerCase();
    return (
      entry?.po_number?.toLowerCase().includes(query) ||
      entry?.company_name?.toLowerCase().includes(query) ||
      entry?.items?.some((i) => i.item_name.toLowerCase().includes(query))
    );
  });

  console.log(POData);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: edittable
      ? {
        po_ref: edittable.po_ref || "",
        po_number: edittable.po_number || "",
        invoice_number: edittable.invoice_number || "",
        company_name: edittable.company_name || "",
        items: edittable.items || [{ item_name: "", item_quantity: 1 }],
        attached_po: null,
        attached_invoice: null,
        status: edittable.status || "Entry Created",
      }
      : {
        po_ref: "",
        po_number: "",
        invoice_number: "",
        company_name: "",
        items: [{ item_name: "", item_quantity: 1 }],
        attached_po: null,
        attached_invoice: null,
        status: "Entry Created",
      },

    onSubmit: async (values) => {
      try {
        if (mode === "edit" && edittable?._id) {
          const payload = {
            _id: edittable._id,
            po_ref: values.po_ref,
            po_number: values.po_number,
            invoice_number: values.invoice_number,
            company_name: values.company_name,
            items: values.items,
            status: values.status,
          };
          await UpdatedGatemenData(payload);
        } else {
          const formData = new FormData();
          formData.append("po_ref", values.po_ref);
          formData.append("po_number", values.po_number);
          formData.append("invoice_number", values.invoice_number);
          formData.append("company_name", values.company_name);
          formData.append("items", JSON.stringify(values.items));
          if (values.attached_po)
            formData.append("attached_po", values.attached_po);
          if (values.attached_invoice)
            formData.append("attached_invoice", values.attached_invoice);

          await PostGatemenData(formData);
        }

        formik.resetForm();
        setShowModal(false);
        await refreshGatemenData();
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    },
  });

  const handleDownload = () => {
    if (!GatemenData.length) return;
    const headers = [
      "PO Number",
      "Invoice",
      "Company Name",
      "Items",
      "Quantity",
      "Status",
    ];
    const rows = GatemenData.map((g) => [
      g.po_number || "",
      g.invoice_number || "",
      g.company_name || "",
      g.items?.map((i) => i.item_name).join("; "),
      g.items?.map((i) => i.item_quantity).join("; "),
      g.status || "",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((r) => r.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "gatemen_entries.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAccept = async (id) => {
    try {
      await AcceptPOData(id);
      await refreshGatemenData();
      setShowPOModal(false);
      setPendingData((prev) => prev.filter((po) => po._id !== id));

      // Close modal only if you want to
      setShowPOModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to accept purchase order");
    }
  };

  return (
    <div className="p-6 relative w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Gateman</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => {
            setShowModal(true);
            setEditTable(null);
            setMode("mode");
          }}
        >
          Add Entry
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between mb-6 space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search Gatemen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-64 text-sm 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button
            onClick={() => setShowPOModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2.5 rounded-lg shadow-sm"
          >
            PO Data
          </Button>
        </div>

        <div className="flex items-center space-x-3 text-gray-600">
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Refresh"
          >
            <RefreshCcw className="h-5 w-5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-gray-100 rounded-full"
            title="Download"
          >
            <DownloadIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Gatemen Table */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-auto">
        <table className="min-w-max w-full text-sm text-left text-gray-600">
          <thead className="bg-linear-to-r from-blue-600 to-sky-500 text-white uppercase text-xs">
            <tr>
              {[
                "PO Number",
                "Invoice",
                "Company",
                "Items",
                "Qty",
                "Status",
                "Action",
              ].map((header, i) => (
                <th key={i} className="py-3 px-4 text-center font-semibold">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-500 italic bg-gray-50"
                >
                  Loading data...
                </td>
              </tr>
            ) : filteredGatemen.length > 0 ? (
              filteredGatemen.map((g, i) => (
                <tr
                  key={g._id || i}
                  className={`transition-all ${i % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-blue-50`}
                >
                  <td className="py-3 px-4 text-center">{g.po_number}</td>
                  <td className="py-3 px-4 text-center">{g.invoice_number}</td>
                  <td className="py-3 px-4 text-center">{g.company_name}</td>
                  <td className="py-3 px-4 text-center">
                    {g.items?.map((i) => i.item_name).join(", ")}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {g.items?.map((i) => i.item_quantity).join(", ")}
                  </td>
                  <td className="py-3 px-4 text-center"><span className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${
                          g?.status === "Verified"
                            ? "bg-green-100 text-green-700"
                            : g?.status === "Entry Created"
                            ? "bg-yellow-100 text-yellow-700"
                            : g?.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}>{g?.status || "-"}</span> </td>

                  {/* <td className="px-3 py-2">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize ${
                          item?.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : item?.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : item?.status === "Rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item?.status || "-"}
                      </span>
                    </td> */}
                  <td className="py-3 px-4 text-center border-b">
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        className="h-4 w-4 text-blue-500 cursor-pointer"
                        title="Edit"
                        onClick={() => {
                          setEditTable(g);
                          setMode("edit");
                          setShowModal(true);
                        }}
                      >
                        <Edit size={16} />
                      </button>

                      <button
                        className="h-4 w-4 text-red-500 cursor-pointer"
                        title="Delete"
                        onClick={async () => {
                          await DeleteGatemenData(g?._id);
                          await refreshGatemenData();
                        }}
                      >
                        <Trash2 size={16} />
                      </button>

                      <button
                        className="h-4 w-4 text-gray-600 cursor-pointer"
                        title="View"
                        onClick={async () => {
                          const details = await DetailsGatemenData(g?._id);
                          if (details) {
                            setEditTable(details);
                            setMode("view");
                            setShowModal(true);
                          }
                        }}
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
                  colSpan="6"
                  className="text-center py-6 text-gray-400 italic bg-gray-50"
                >
                  No matching entries found.
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
                    name="po_ref"
                    value={formik.values.po_ref}
                    onChange={(e) => {
                      const selectedPOId = e.target.value;
                      formik.setFieldValue("po_ref", selectedPOId);

                      const selectedPO = POData?.find(
                        (po) => po._id === selectedPOId
                      );

                      if (selectedPO) {
                        formik.setFieldValue("po_number", selectedPO.po_number);
                        formik.setFieldValue(
                          "items",
                          selectedPO.products?.map((p) => ({
                            item_name: p.item_name,
                            item_quantity: p.quantity || 1,
                          })) || []
                        );
                        formik.setFieldValue(
                          "company_name",
                          selectedPO?.supplier?.company_name
                        );
                      }
                    }}
                    className="w-full border rounded-md px-3 py-2 mt-1 outline-none focus:ring-2 focus:ring-blue-200"
                    disabled={!POData || POData.length === 0} // disable if no data
                  >
                    {POData && POData.length > 0 ? (
                      <>
                        <option value="">Select PO</option>
                        {POData.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.po_number} — {p.products?.[0]?.item_name}
                          </option>
                        ))}
                      </>
                    ) : (
                      <option value="">No PO available</option>
                    )}
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
                    readOnly={true}
                    className={`w-full border rounded-md px-3 py-2 mt-1 outline-none focus:ring-2 ${formik.touched.po_number && formik.errors.po_number
                        ? "border-red-500 focus:ring-red-200"
                        : "focus:ring-blue-200"
                      } ${mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    placeholder="Enter PO Number"
                  />
                </div>

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
                    readOnly={true}
                    className={`w-full border rounded-md px-3 py-2 mt-1 outline-none focus:ring-2 ${formik.touched.company_name && formik.errors.company_name
                        ? "border-red-500 focus:ring-red-200"
                        : "focus:ring-blue-200"
                      } ${mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    placeholder="Enter Company Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Items
                  </label>
                  {formik.values.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 mb-2 border rounded-md p-2"
                    >
                      <input
                        type="text"
                        name={`items[${index}].item_name`}
                        value={item.item_name}
                        readOnly={true}
                        onChange={formik.handleChange}
                        disabled={mode === "view"}
                        placeholder="Item Name"
                        className="flex-1 border rounded-md px-2 py-1"
                      />
                      {/* <input
                        type="number"
                        name={`items[${index}].item_quantity`}
                        value={item.item_quantity}
                        onChange={formik.handleChange}
                        disabled={mode === "view"}
                        readOnly={true}
                        placeholder="Qty"
                        className="w-20 border rounded-md px-2 py-1"
                      /> */}
                      {/* {mode !== "view" && (
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
                      )} */}
                    </div>
                  ))}
                  {/* {mode !== "view" && (
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
                  )} */}
                </div>
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
                    className={`w-full border rounded-md px-3 py-2 mt-1 outline-none focus:ring-2 ${formik.touched.invoice_number &&
                        formik.errors.invoice_number
                        ? "border-red-500 focus:ring-red-200"
                        : "focus:ring-blue-200"
                      } ${mode === "view" ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                    placeholder="Enter Invoice Number"
                  />
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
                      formik.setFieldValue(
                        "attached_invoice",
                        e.target.files[0]
                      )
                    }
                    disabled={mode === "view"}
                    className="w-full border rounded-md px-3 py-2 mt-1"
                  />
                </div>

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
              <h2 className="text-2xl font-bold text-gray-800">
                Purchase Order List
              </h2>
              <button
                onClick={() => setShowPOModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="overflow-x-auto border rounded-lg shadow-inner">
              <table className="min-w-full text-sm text-left">
                <thead className="bg-linear-to-r from-blue-600 to-sky-500 text-white text-xs uppercase tracking-wide">
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
                        className={`border-b hover:bg-gray-50 transition ${i % 2 === 0 ? "bg-gray-50" : "bg-white"
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
                            <div
                              key={idx}
                              className="border-b last:border-0 py-1"
                            >
                              <span className="font-medium text-gray-800">
                                {p.item_name}
                              </span>{" "}
                              - {p.quantity} {p.uom}
                              {/* <div className="text-xs text-gray-500">
                                Remain: {p.remain_quantity}, Produced:{" "}
                                {p.produce_quantity}
                              </div> */}
                            </div>
                          ))}
                        </td>
                        <td className="py-3 px-4 text-center border-b">
                          <div className="flex items-center justify-start space-x-3">
                            <button
                              className="p-1.5 rounded-md bg-green-100 text-green-600 hover:bg-green-200"
                              title="Accept"
                              onClick={async () => {
                                await handleAccept(po?._id); // updates status etc.
                                await refreshGatemenData(); // refresh data
                                setShowPOModal(false); // close PO list modal
                                setShowModal(true); // open Gate Entry modal

                                // Auto-fill Gate Entry Form with selected PO details
                                const selectedPO = pendingData.find(
                                  (entry) => entry._id === po._id
                                );

                                if (selectedPO) {
                                  formik.setValues({
                                    po_ref: selectedPO._id,
                                    po_number: selectedPO.po_number || "",
                                    invoice_number: "",
                                    company_name:
                                      selectedPO?.supplier?.company_name || "",
                                    items: selectedPO.products?.map((p) => ({
                                      item_name: p.item_name,
                                      item_quantity: p.est_quantity || 1,
                                    })) || [
                                      { item_name: "", item_quantity: 1 },
                                    ],
                                    attached_po: null,
                                    attached_invoice: null,
                                    status: "Entry Created",
                                  });
                                }
                              }}
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

      <Pagination page={page} setPage={setPage} hasNextPage={GatemenData?.length === 10} />
    </div>
  );
};

export default Gateman;
