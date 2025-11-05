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
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useInventory } from "@/Context/InventoryContext";
import { useFormik } from "formik";
import axiosHandler from "@/config/axiosconfig";
import Pagination from "@/Components/Pagination/Pagination";

const BOM = () => {
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBoms] = useState([]);
  const [boms, setBoms] = useState([]);
  const [bomsLoading, setBomsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [selectedBom, setSelectedBom] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [compoundingRows, setCompoundingRows] = useState([
    { compoundId: "", compoundName: "", compoundCode: "", hardness: "", partName: "" },
  ]);
  const [rawMaterialRows, setRawMaterialRows] = useState([
    { rawMaterialId: "", rawMaterialName: "", rawMaterialCode: "", weight: "", tolerance: "" },
  ]);
  const [processRows, setProcessRows] = useState(["", "", "", ""]);

  const {
    products,
    getAllProducts,
  } = useInventory();

  const finishedGoods = (products || []).filter((p) =>
    (p?.category || "").toLowerCase().includes("finished")
  );
  const rawMaterials = (products || []).filter((p) =>
    (p?.category || "").toLowerCase().includes("raw")
  );

  const formik = useFormik({
    initialValues: {
      _id: "",
      compoundCode: "",
      compoundName: "",
      compoundId: "",
      partName: "",
      compoundingStandardHardness: "",
      rawMaterialName: "",
      rawMaterialId: "",
      rawMaterialWeight: "",
      rawMaterialTolerance: "",
      rawMaterialCode: "",
      process1: "",
      process2: "",
      process3: "",
      process4: "",
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const firstComp = compoundingRows && compoundingRows[0] ? compoundingRows[0] : {};
        const payload = {
          ...values,
          // ensure top-level mirrors first row for backend consistency
          compoundId: values.compoundId || firstComp.compoundId || "",
          compoundName: values.compoundName || firstComp.compoundName || "",
          compoundCode: values.compoundCode || firstComp.compoundCode || "",
          partName: values.partName || firstComp.partName || "",
          compoundingStandards: compoundingRows,
          rawMaterials: rawMaterialRows,
          processes: (processRows || []).filter((p) => (p || "").trim() !== ""),
        };
        if (editMode) {
          await axiosHandler.put("/bom", payload, { withCredentials: true });
        } else {
          await axiosHandler.post("/bom", payload, { withCredentials: true });
        }
        await fetchBoms();
        resetForm();
        setShowModal(false);
        setEditMode(false);
        setSelectedBom(null);
        setCompoundingRows([{ compoundId: "", compoundName: "", compoundCode: "", hardness: "", partName: "" }]);
        setRawMaterialRows([{ rawMaterialId: "", rawMaterialName: "", rawMaterialCode: "", weight: "", tolerance: "" }]);
        setProcessRows(["", "", "", ""]);
      } catch (e) {
        console.error("Error creating BOM", e);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const fetchBoms = async () => {
    try {
      setBomsLoading(true);
      const res = await axiosHandler.get(`/bom/all?page=${page}&limit=10`, { withCredentials: true });
      setBoms(res?.data?.boms || []);
    } catch (e) {
      console.error("Error fetching BOMs", e);
      setBoms([]);
    } finally {
      setBomsLoading(false);
    }
  };

  useEffect(() => {
    getAllProducts();
    fetchBoms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // const handleFilter = () => {};

  const handleDownload = () => {
    const headers = [
      "Compound Code",
      "Compound Name",
      "Part Name",
      "Created Date",
    ];
    const source = filteredBoms.length ? filteredBoms : boms;
    const rows = source.map((b) => [
      b.compound_code || "",
      b.compound_name || "",
      b.part_name || "",
      b.createdAt ? new Date(b.createdAt).toLocaleDateString() : "",
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "boms.csv";
    link.click();
  };

  return (
    <div className="p-4 sm:p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Bill of Material</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
          onClick={() => {
            setEditMode(false);
            setViewMode(false);
            formik.resetForm();
            setCompoundingRows([{ compoundId: "", compoundName: "", compoundCode: "", hardness: "", partName: "" }]);
            setRawMaterialRows([{ rawMaterialId: "", rawMaterialName: "", rawMaterialCode: "", weight: "", tolerance: "" }]);
            setProcessRows(["", "", "", ""]);
            setShowModal(true);
          }}
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
            <div className="absolute hidden group-hover:block bg-white border shadow-md p-2 right-0 top-6 rounded-md z-10 w-40"></div>
          </div>

          {/* Refresh + Download */}
          <RefreshCcw
            className="cursor-pointer hover:text-gray-800"
            onClick={fetchBoms}
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
          <thead>
            <tr className="bg-linear-to-r from-blue-600 to-sky-500 whitespace-nowrap text-white uppercase text-xs tracking-wide">
              <th className="px-4 sm:px-6 py-3 font-medium">Compound Code</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Compound Name</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Part Name</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Created Date</th>
              <th className="px-4 sm:px-6 py-3 font-medium text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {bomsLoading ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  Loading BOMs...
                </td>
              </tr>
            ) : boms?.length > 0 ? (
              (filteredBoms.length ? filteredBoms : boms)
                .filter((item) => {
                  const q = searchQuery.toLowerCase();
                  return (
                    (item.compound_name || "").toLowerCase().includes(q) ||
                    (item.compound_code || "").toLowerCase().includes(q) ||
                    (item.part_name || "").toLowerCase().includes(q)
                  );
                })
                .map((item, index) => (
                  <tr
                    key={index}
                    className={`border-t ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 sm:px-6 py-3">{item.compound_code}</td>
                    <td className="px-4 sm:px-6 py-3">{item.compound_name}</td>
                    <td className="px-4 sm:px-6 py-3">{item.part_name}</td>
                    <td className="px-4 sm:px-6 py-3">{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</td>
                    <td className="px-4 sm:px-6 py-3 text-center">
                      <div className="flex justify-center gap-3">
                        <Edit className="h-4 w-4 text-blue-500 cursor-pointer" onClick={async () => {
                          try {
                            const res = await axiosHandler.get(`/bom/${item._id}`, { withCredentials: true });
                            const bom = res?.data?.bom || {};
                            setSelectedBom(bom);
                            formik.setValues({
                              _id: bom._id || "",
                              compoundId: bom.compound || "",
                              compoundName: bom.compound_name || "",
                              compoundCode: bom.compound_code || "",
                              compoundingStandardHardness: bom.hardness || "",
                              partName: bom.part_name || "",
                              rawMaterialId: bom.raw_material || "",
                              rawMaterialName: bom.raw_material_name || "",
                              rawMaterialCode: bom.raw_material_code || "",
                              rawMaterialWeight: bom.raw_material_weight || "",
                              rawMaterialTolerance: bom.raw_material_tolerance || "",
                              process1: bom.process1 || (Array.isArray(bom.processes) ? bom.processes[0] || "" : ""),
                              process2: bom.process2 || (Array.isArray(bom.processes) ? bom.processes[1] || "" : ""),
                              process3: bom.process3 || (Array.isArray(bom.processes) ? bom.processes[2] || "" : ""),
                              process4: bom.process4 || (Array.isArray(bom.processes) ? bom.processes[3] || "" : ""),
                            });
                            setProcessRows(
                              Array.isArray(bom.processes) && bom.processes.length
                                ? [...bom.processes]
                                : [
                                    bom.process1 || "",
                                    bom.process2 || "",
                                    bom.process3 || "",
                                    bom.process4 || "",
                                  ]
                            );
                            // initialize rows if arrays exist on bom (future-proof)
                            if (Array.isArray(bom.compoundingStandards) && bom.compoundingStandards.length) {
                              setCompoundingRows(
                                bom.compoundingStandards.map((r) => ({
                                  compoundId: r.compoundId || r.compound || "",
                                  compoundName: r.compoundName || "",
                                  compoundCode: r.compoundCode || "",
                                  hardness: r.hardness || "",
                                  partName: r.partName || "",
                                }))
                              );
                            } else {
                              setCompoundingRows([
                                {
                                  compoundId: bom.compound || "",
                                  compoundName: bom.compound_name || "",
                                  compoundCode: bom.compound_code || "",
                                  hardness: bom.hardness || "",
                                  partName: bom.part_name || "",
                                },
                              ]);
                            }
                            if (Array.isArray(bom.rawMaterials) && bom.rawMaterials.length) {
                              setRawMaterialRows(
                                bom.rawMaterials.map((r) => ({
                                  rawMaterialId: r.rawMaterialId || r.raw_material || "",
                                  rawMaterialName: r.rawMaterialName || "",
                                  rawMaterialCode: r.rawMaterialCode || "",
                                  weight: r.weight || r.raw_material_weight || "",
                                  tolerance: r.tolerance || r.raw_material_tolerance || "",
                                }))
                              );
                            } else {
                              setRawMaterialRows([
                                {
                                  rawMaterialId: bom.raw_material || "",
                                  rawMaterialName: bom.raw_material_name || "",
                                  rawMaterialCode: bom.raw_material_code || "",
                                  weight: bom.raw_material_weight || "",
                                  tolerance: bom.raw_material_tolerance || "",
                                },
                              ]);
                            }
                            setEditMode(true);
                            setShowModal(true);
                          } catch (e) {
                            console.error("Error loading BOM details", e);
                          }
                        }} />
                        <Trash2 className="h-4 w-4 text-red-500 cursor-pointer" onClick={async () => {
                          if (!window.confirm("Delete this BOM?")) return;
                          try {
                            await axiosHandler.delete("/bom", { data: { id: item._id }, withCredentials: true });
                            fetchBoms();
                          } catch (e) {
                            console.error("Error deleting BOM", e);
                          }
                        }} />
                        <Eye className="h-4 w-4 text-gray-600 cursor-pointer" onClick={async () => {
                          try {
                            const res = await axiosHandler.get(`/bom/${item._id}`, { withCredentials: true });
                            const bom = res?.data?.bom || {};
                            formik.setValues({
                              _id: bom._id || "",
                              compoundId: bom.compound || "",
                              compoundName: bom.compound_name || "",
                              compoundCode: bom.compound_code || "",
                              compoundingStandardHardness: bom.hardness || "",
                              partName: bom.part_name || "",
                              rawMaterialId: bom.raw_material || "",
                              rawMaterialName: bom.raw_material_name || "",
                              rawMaterialCode: bom.raw_material_code || "",
                              rawMaterialWeight: bom.raw_material_weight || "",
                              rawMaterialTolerance: bom.raw_material_tolerance || "",
                              process1: bom.process1 || (Array.isArray(bom.processes) ? bom.processes[0] || "" : ""),
                              process2: bom.process2 || (Array.isArray(bom.processes) ? bom.processes[1] || "" : ""),
                              process3: bom.process3 || (Array.isArray(bom.processes) ? bom.processes[2] || "" : ""),
                              process4: bom.process4 || (Array.isArray(bom.processes) ? bom.processes[3] || "" : ""),
                            });
                            setProcessRows(
                              Array.isArray(bom.processes) && bom.processes.length
                                ? [...bom.processes]
                                : [
                                    bom.process1 || "",
                                    bom.process2 || "",
                                    bom.process3 || "",
                                    bom.process4 || "",
                                  ]
                            );
                            if (Array.isArray(bom.compoundingStandards) && bom.compoundingStandards.length) {
                              setCompoundingRows(
                                bom.compoundingStandards.map((r) => ({
                                  compoundId: r.compoundId || r.compound || "",
                                  compoundName: r.compoundName || "",
                                  compoundCode: r.compoundCode || "",
                                  hardness: r.hardness || "",
                                  partName: r.partName || "",
                                }))
                              );
                            } else {
                              setCompoundingRows([
                                {
                                  compoundId: bom.compound || "",
                                  compoundName: bom.compound_name || "",
                                  compoundCode: bom.compound_code || "",
                                  hardness: bom.hardness || "",
                                  partName: bom.part_name || "",
                                },
                              ]);
                            }
                            if (Array.isArray(bom.rawMaterials) && bom.rawMaterials.length) {
                              setRawMaterialRows(
                                bom.rawMaterials.map((r) => ({
                                  rawMaterialId: r.rawMaterialId || r.raw_material || "",
                                  rawMaterialName: r.rawMaterialName || "",
                                  rawMaterialCode: r.rawMaterialCode || "",
                                  weight: r.weight || r.raw_material_weight || "",
                                  tolerance: r.tolerance || r.raw_material_tolerance || "",
                                }))
                              );
                            } else {
                              setRawMaterialRows([
                                {
                                  rawMaterialId: bom.raw_material || "",
                                  rawMaterialName: bom.raw_material_name || "",
                                  rawMaterialCode: bom.raw_material_code || "",
                                  weight: bom.raw_material_weight || "",
                                  tolerance: bom.raw_material_tolerance || "",
                                },
                              ]);
                            }
                            setEditMode(false);
                            setViewMode(true);
                            setShowModal(true);
                          } catch (e) {
                            console.error("Error loading BOM details", e);
                          }
                        }} />
                      </div>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No BOM found.
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
                onClick={() => {
                  setShowModal(false);
                  setEditMode(false);
                  setViewMode(false);
                  formik.resetForm();
                  setCompoundingRows([{ compoundId: "", compoundName: "", compoundCode: "", hardness: "", partName: "" }]);
                  setRawMaterialRows([{ rawMaterialId: "", rawMaterialName: "", rawMaterialCode: "", weight: "", tolerance: "" }]);
                  setProcessRows(["", "", "", ""]);
                }}
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
                    Compound Code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter BOM Id..."
                    name="compoundCode"
                    value={formik.values.compoundCode}
                    onChange={formik.handleChange}
                    disabled={viewMode}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compound Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter BOM Name"
                    name="compoundName"
                    value={formik.values.compoundName}
                    onChange={formik.handleChange}
                    disabled={viewMode}
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
                selectOptions={finishedGoods.map((fg) => ({
                  label: `${fg.name} (${fg.product_id})`,
                  value: fg._id,
                  code: fg.product_id,
                  name: fg.name,
                }))}
                rows={compoundingRows}
                setRows={setCompoundingRows}
                onRowChange={(idx, field, val) => {
                  const next = [...compoundingRows];
                  next[idx][field] = val;
                  setCompoundingRows(next);
                  if (idx === 0) {
                    // keep first row in single-value fields for backward compatibility
                    if (field === "compoundId") formik.setFieldValue("compoundId", val);
                    if (field === "compoundCode") formik.setFieldValue("compoundCode", val);
                    if (field === "hardness") formik.setFieldValue("compoundingStandardHardness", val);
                    if (field === "partName") formik.setFieldValue("partName", val);
                    if (field === "compoundName") formik.setFieldValue("compoundName", val);
                  }
                }}
                disabled={viewMode}
              />

              <Section
                title="Raw Material"
                headers={[
                  "Raw Material Name",
                  "Weight",
                  "Tolerance",
                  "Code No.",
                ]}
                selectOptions={rawMaterials.map((rm) => ({
                  label: `${rm.name} (${rm.product_id})`,
                  value: rm._id,
                  code: rm.product_id,
                  name: rm.name,
                }))}
                rows={rawMaterialRows}
                setRows={setRawMaterialRows}
                onRowChange={(idx, field, val) => {
                  const next = [...rawMaterialRows];
                  next[idx][field] = val;
                  setRawMaterialRows(next);
                  if (idx === 0) {
                    if (field === "rawMaterialId") formik.setFieldValue("rawMaterialId", val);
                    if (field === "weight") formik.setFieldValue("rawMaterialWeight", val);
                    if (field === "tolerance") formik.setFieldValue("rawMaterialTolerance", val);
                    if (field === "rawMaterialCode") formik.setFieldValue("rawMaterialCode", val);
                    if (field === "rawMaterialName") formik.setFieldValue("rawMaterialName", val);
                  }
                }}
                disabled={viewMode}
              />

              <section className="mb-8">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">
                  Processes
                </h2>
                <div className="hidden sm:grid grid-cols-2 sm:grid-cols-4 bg-blue-600 text-white rounded-md px-3 py-2 text-xs sm:text-sm font-medium">
                  {['Process 1','Process 2','Process 3','Process 4'].map((h, i) => (
                    <span key={i} className="truncate text-center">{h}</span>
                  ))}
                </div>
                <div className="flex flex-col gap-3 mt-3">
                  {processRows.map((proc, idx) => (
                    <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                      <input
                        placeholder={idx === 0 ? "e.g., Mixing" : idx === 1 ? "e.g., Kneading" : idx === 2 ? "e.g., Curing" : "e.g., Finishing"}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-400"
                        value={proc}
                        onChange={(e) => {
                          const next = [...processRows];
                          next[idx] = e.target.value;
                          setProcessRows(next);
                          // keep first four in legacy fields
                          if (idx === 0) formik.setFieldValue('process1', e.target.value);
                          if (idx === 1) formik.setFieldValue('process2', e.target.value);
                          if (idx === 2) formik.setFieldValue('process3', e.target.value);
                          if (idx === 3) formik.setFieldValue('process4', e.target.value);
                        }}
                        disabled={viewMode}
                      />
                    </div>
                  ))}
                </div>
                {!viewMode && (
                  <div className="flex justify-end mt-4">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 shadow-sm text-sm font-medium"
                      onClick={() => {
                        if (processRows.length > 49) return;
                        setProcessRows([...processRows, ""]);
                      }}
                    >
                      Add More
                    </button>
                  </div>
                )}
              </section>

              {/* Submit */}
              {!viewMode && (
                <div className="flex justify-center mt-10 mb-4">
                  <button onClick={formik.handleSubmit} disabled={formik.isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-8 py-2 shadow-md font-medium transition disabled:opacity-60">
                    Submit
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <Pagination page={page} setPage={setPage} hasNextPage={boms?.length === 10} />
    </div>
  );
};

/* Reusable Section Component */
const Section = ({ title, headers, selectOptions, rows, setRows, onRowChange, disabled = false }) => (
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
    {rows && Array.isArray(rows) ? (
      <div className="flex flex-col gap-3 mt-3">
        {rows.map((row, idx) => (
          <div key={idx} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {selectOptions ? (
              <select
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-400"
                value={row.compoundId || row.rawMaterialId || ""}
                onChange={(e) => {
                  const val = e.target.value;
                  const isCompound = Object.prototype.hasOwnProperty.call(row, "compoundId");
                  onRowChange && onRowChange(idx, isCompound ? "compoundId" : "rawMaterialId", val);
                  const found = selectOptions.find((o) => o.value === val);
                  if (isCompound) {
                    onRowChange && onRowChange(idx, "compoundName", found?.name || "");
                    onRowChange && onRowChange(idx, "compoundCode", found?.code || "");
                  } else {
                    onRowChange && onRowChange(idx, "rawMaterialName", found?.name || "");
                    onRowChange && onRowChange(idx, "rawMaterialCode", found?.code || "");
                  }
                }}
                disabled={disabled}
              >
                <option value="">Select...</option>
                {selectOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                placeholder={`Enter ${headers[0]}`}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-400"
                value={row[headers[0]] || ""}
                onChange={(e) => onRowChange && onRowChange(idx, headers[0], e.target.value)}
                disabled={disabled}
              />
            )}

            <input
              placeholder={`Enter ${headers[1]}`}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-400"
              value={row.compoundCode ?? row.weight ?? ""}
              onChange={(e) => {
                const isCompound = Object.prototype.hasOwnProperty.call(row, "compoundCode");
                onRowChange && onRowChange(idx, isCompound ? "compoundCode" : "weight", e.target.value);
              }}
              disabled={disabled}
            />
            <input
              placeholder={`Enter ${headers[2]}`}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-400"
              value={row.hardness ?? row.tolerance ?? ""}
              onChange={(e) => {
                const isCompound = Object.prototype.hasOwnProperty.call(row, "hardness");
                onRowChange && onRowChange(idx, isCompound ? "hardness" : "tolerance", e.target.value);
              }}
              disabled={disabled}
            />
            <input
              placeholder={`Enter ${headers[3]}`}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-400"
              value={row.partName ?? row.rawMaterialCode ?? ""}
              onChange={(e) => {
                const isCompound = typeof row.partName !== "undefined";
                onRowChange && onRowChange(idx, isCompound ? "partName" : "rawMaterialCode", e.target.value);
              }}
              disabled={disabled}
            />
          </div>
        ))}
      </div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-3">
        {/* Fallback single-row mode (not used now) */}
      </div>
    )}

    {/* Add More Button */}
    {!disabled && setRows && onRowChange && (
      <div className="flex justify-end mt-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 shadow-sm text-sm font-medium"
          onClick={() => {
            if (rows && Array.isArray(rows)) {
              if (rows.length > 49) return; // simple guard
              const isCompound = rows[0] && typeof rows[0].compoundId !== "undefined";
              const blank = isCompound
                ? { compoundId: "", compoundName: "", compoundCode: "", hardness: "", partName: "" }
                : { rawMaterialId: "", rawMaterialName: "", rawMaterialCode: "", weight: "", tolerance: "" };
              setRows([...rows, blank]);
            }
          }}
        >
          Add More
        </button>
      </div>
    )}

    
  </section>
);

export default BOM;
