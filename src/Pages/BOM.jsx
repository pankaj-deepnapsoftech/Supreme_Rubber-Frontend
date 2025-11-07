import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  RefreshCcw,
  Download,
  Edit,
  Trash2,
  Eye,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useInventory } from "@/Context/InventoryContext";
import { useFormik } from "formik";
import axiosHandler from "@/config/axiosconfig";
import Pagination from "@/Components/Pagination/Pagination";

const BOM = () => {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBoms] = useState([]);
  const [boms, setBoms] = useState([]);
  const [bomsLoading, setBomsLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [selectedBom, setSelectedBom] = useState(null);
  const [viewMode, setViewMode] = useState(false);

  // New state for arrays
  const [compoundCodes, setCompoundCodes] = useState([""]);
  const [compoundName, setCompoundName] = useState("");
  const [partNames, setPartNames] = useState([""]);
  const [hardnesses, setHardnesses] = useState([""]);
  const [finishedGoods, setFinishedGoods] = useState([
    {
      finished_good_id_name: "",
      tolerances: [""],
      quantities: [""],
      comments: [""],
    },
  ]);
  const [rawMaterials, setRawMaterials] = useState([
    {
      raw_material_id: "",
      raw_material_name: "",
      tolerances: [""],
      quantities: [""],
      comments: [""],
    },
  ]);
  const [processRows, setProcessRows] = useState([""]);

  const { products, getAllProducts } = useInventory();

  const finishedGoodsOptions = (products || []).filter((p) =>
    (p?.category || "").toLowerCase().includes("finished")
  );
  const rawMaterialsOptions = (products || []).filter((p) =>
    (p?.category || "").toLowerCase().includes("raw")
  );

  const formik = useFormik({
    initialValues: {
      _id: "",
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const payload = {
          ...values,
          compound_codes: compoundCodes.filter((c) => c && c.trim() !== ""),
          compound_name: (compoundName || "").trim(),
          part_names: partNames.filter((p) => p && p.trim() !== ""),
          hardnesses: hardnesses.filter((h) => h && h.trim() !== ""),
          finished_goods: finishedGoods.map((fg) => ({
            finished_good_id_name: fg.finished_good_id_name || "",
            tolerances: fg.tolerances.filter((t) => t && t.trim() !== ""),
            quantities: fg.quantities
              .filter((q) => q && q.trim() !== "")
              .map((q) => Number(q))
              .filter((q) => !isNaN(q)),
            comments: fg.comments.filter((c) => c && c.trim() !== ""),
          })),
          raw_materials: rawMaterials.map((rm) => ({
            raw_material_id: rm.raw_material_id || "",
            raw_material_name: rm.raw_material_name || "",
            tolerances: rm.tolerances.filter((t) => t && t.trim() !== ""),
            quantities: rm.quantities
              .filter((q) => q && q.trim() !== "")
              .map((q) => Number(q))
              .filter((q) => !isNaN(q)),
            comments: rm.comments.filter((c) => c && c.trim() !== ""),
          })),
          processes: processRows.filter((p) => (p || "").trim() !== ""),
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
        resetAllFields();
      } catch (e) {
        console.error("Error creating BOM", e);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const resetAllFields = () => {
    setCompoundCodes([""]);
    setCompoundName("");
    setPartNames([""]);
    setHardnesses([""]);
    setFinishedGoods([
      {
        finished_good_id_name: "",
        tolerances: [""],
        quantities: [""],
        comments: [""],
      },
    ]);
    setRawMaterials([
      {
        raw_material_id: "",
        raw_material_name: "",
        tolerances: [""],
        quantities: [""],
        comments: [""],
      },
    ]);
    setProcessRows([""]);
  };

  const fetchBoms = async () => {
    try {
      setBomsLoading(true);
      const res = await axiosHandler.get(`/bom/all?page=${page}&limit=10`, {
        withCredentials: true,
      });
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

  const handleDownload = () => {
    const headers = ["Compound Codes", "Part Names", "Created Date"];
    const source = filteredBoms.length ? filteredBoms : boms;
    const rows = source.map((b) => [
      (b.compound_codes || []).join(", ") || "",
      (b.part_names || []).join(", ") || "",
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

  const loadBomForEdit = async (bomId) => {
    try {
      const res = await axiosHandler.get(`/bom/${bomId}`, {
        withCredentials: true,
      });
      const bom = res?.data?.bom || {};

      formik.setValues({
        _id: bom._id || "",
      });

      setCompoundCodes(
        bom.compound_codes && bom.compound_codes.length > 0
          ? bom.compound_codes
          : [""]
      );
      setCompoundName(bom.compound_name || "");
      setPartNames(
        bom.part_names && bom.part_names.length > 0 ? bom.part_names : [""]
      );
      setHardnesses(
        bom.hardnesses && bom.hardnesses.length > 0 ? bom.hardnesses : [""]
      );

      setFinishedGoods(
        bom.finished_goods && bom.finished_goods.length > 0
          ? bom.finished_goods.map((fg) => ({
              finished_good_id_name: fg.finished_good_id_name || "",
              tolerances:
                fg.tolerances && fg.tolerances.length > 0
                  ? fg.tolerances
                  : [""],
              quantities:
                fg.quantities && fg.quantities.length > 0
                  ? fg.quantities.map((q) => String(q))
                  : [""],
              comments:
                fg.comments && fg.comments.length > 0 ? fg.comments : [""],
            }))
          : [
              {
                finished_good_id_name: "",
                tolerances: [""],
                quantities: [""],
                comments: [""],
              },
            ]
      );

      setRawMaterials(
        bom.raw_materials && bom.raw_materials.length > 0
          ? bom.raw_materials.map((rm) => ({
              raw_material_id:
                rm.raw_material_id?._id || rm.raw_material_id || "",
              raw_material_name:
                rm.raw_material_name || rm.raw_material_id?.name || "",
              tolerances:
                rm.tolerances && rm.tolerances.length > 0
                  ? rm.tolerances
                  : [""],
              quantities:
                rm.quantities && rm.quantities.length > 0
                  ? rm.quantities.map((q) => String(q))
                  : [""],
              comments:
                rm.comments && rm.comments.length > 0 ? rm.comments : [""],
            }))
          : [
              {
                raw_material_id: "",
                raw_material_name: "",
                tolerances: [""],
                quantities: [""],
                comments: [""],
              },
            ]
      );

      setProcessRows(
        bom.processes && bom.processes.length > 0 ? bom.processes : [""]
      );
    } catch (e) {
      console.error("Error loading BOM details", e);
    }
  };

  return (
    <div className="p-4 sm:p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Bill of Material</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto cursor-pointer"
          onClick={() => {
            setEditMode(false);
            setViewMode(false);
            formik.resetForm();
            resetAllFields();
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
          {/* <div className="relative group">
            <Filter className="cursor-pointer hover:text-gray-800" />
            <div className="absolute hidden group-hover:block bg-white border shadow-md p-2 right-0 top-6 rounded-md z-10 w-40"></div>
          </div> */}

          {/* Refresh + Download */}
          <button
            onClick={fetchBoms}
            className="p-2 rounded-lg cursor-pointer text-gray-800 hover:bg-gray-200 border border-gray-300 hover:bg-gray-100 transition"
          >
            <RefreshCcw size={16} />
          </button>

          <button
            onClick={handleDownload}
            className="p-2 rounded-lg cursor-pointer text-gray-800 hover:bg-gray-200 border border-gray-300 hover:bg-gray-100 transition"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="border rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full min-w-[700px] text-sm text-left">
          <thead>
            <tr className="bg-linear-to-r text-center from-blue-600 to-sky-500 whitespace-nowrap text-white uppercase text-xs tracking-wide">
              <th className="px-4 sm:px-6 py-3 font-medium">Compound Codes</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Part Names</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Created Date</th>
              <th className="px-4 sm:px-6 py-3 font-medium text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {bomsLoading ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
                  Loading BOMs...
                </td>
              </tr>
            ) : boms?.length > 0 ? (
              (filteredBoms.length ? filteredBoms : boms)
                .filter((item) => {
                  const q = searchQuery.toLowerCase();
                  const compoundCodesStr = (item.compound_codes || [])
                    .join(" ")
                    .toLowerCase();
                  const partNamesStr = (item.part_names || [])
                    .join(" ")
                    .toLowerCase();
                  return (
                    compoundCodesStr.includes(q) || partNamesStr.includes(q)
                  );
                })
                .map((item, index) => (
                  <tr
                    key={index}
                    className={`border-t text-center ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 sm:px-6 py-3">
                      {(item.compound_codes || []).join(", ") || "-"}
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      {(item.part_names || []).join(", ") || "-"}
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : ""}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-center">
                      <div className="flex justify-center gap-3">
                        <Edit
                          className="h-4 w-4 text-blue-500 cursor-pointer"
                          onClick={async () => {
                            await loadBomForEdit(item._id);
                            setEditMode(true);
                            setViewMode(false);
                            setShowModal(true);
                          }}
                        />
                        <Trash2
                          className="h-4 w-4 text-red-500 cursor-pointer"
                          onClick={async () => {
                            if (!window.confirm("Delete this BOM?")) return;
                            try {
                              await axiosHandler.delete("/bom", {
                                data: { id: item._id },
                                withCredentials: true,
                              });
                              fetchBoms();
                            } catch (e) {
                              console.error("Error deleting BOM", e);
                            }
                          }}
                        />
                        <Eye
                          className="h-4 w-4 text-gray-600 cursor-pointer"
                          onClick={async () => {
                            await loadBomForEdit(item._id);
                            setEditMode(false);
                            setViewMode(true);
                            setShowModal(true);
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-6 text-gray-500">
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative bg-linear-to-b from-white/90 to-white/80 dark:from-gray-900/90 dark:to-gray-800/90 backdrop-blur-lg border border-gray-200/60 dark:border-gray-700/50 rounded-3xl shadow-2xl w-[95%] sm:w-[90%] md:w-[85%] lg:max-w-6xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 md:p-10"
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditMode(false);
                  setViewMode(false);
                  formik.resetForm();
                  resetAllFields();
                }}
                className="absolute top-4 right-5 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-all duration-200 text-2xl"
              >
                ✕
              </button>

              {/* Title */}
              <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Bill of Materials (BOM)
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Manage compounds, finished goods, raw materials, and processes.
              </p>
              <hr className="border-gray-300 dark:border-gray-600 mb-8" />

              {/* Compound Section */}
              <section className="mb-10">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Compound Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Compound Name */}
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Compound Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter compound name"
                      value={compoundName}
                      onChange={(e) => setCompoundName(e.target.value)}
                      disabled={viewMode}
                      className="w-full border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                  </div>

                  {/* Compound Codes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Compound Codes
                    </label>
                    {compoundCodes.map((code, idx) => (
                      <input
                        key={idx}
                        type="text"
                        placeholder="Enter compound code"
                        value={code}
                        onChange={(e) => {
                          const next = [...compoundCodes];
                          next[idx] = e.target.value;
                          setCompoundCodes(next);
                        }}
                        disabled={viewMode}
                        className="w-full mb-2 border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition"
                      />
                    ))}
                  </div>

                  {/* Part Names */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Part Names
                    </label>
                    {partNames.map((name, idx) => (
                      <input
                        key={idx}
                        type="text"
                        placeholder="Enter part name"
                        value={name}
                        onChange={(e) => {
                          const next = [...partNames];
                          next[idx] = e.target.value;
                          setPartNames(next);
                        }}
                        disabled={viewMode}
                        className="w-full mb-2 border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition"
                      />
                    ))}
                  </div>

                  {/* Hardnesses */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Hardnesses
                    </label>
                    {hardnesses.map((hardness, idx) => (
                      <input
                        key={idx}
                        type="text"
                        placeholder="Enter hardness"
                        value={hardness}
                        onChange={(e) => {
                          const next = [...hardnesses];
                          next[idx] = e.target.value;
                          setHardnesses(next);
                        }}
                        disabled={viewMode}
                        className="w-full mb-2 border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition"
                      />
                    ))}
                  </div>
                </div>
              </section>

              {/* Finished Goods Section */}
              <section className="mb-10">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Finished Goods
                </h2>
                {finishedGoods.map((fg, fgIdx) => (
                  <div
                    key={fgIdx}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/60 backdrop-blur-sm shadow-sm p-5 mb-5"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-gray-700 dark:text-gray-300">
                        Finished Good #{fgIdx + 1}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Finished Good Selector */}
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Finished Good (ID + Name)
                        </label>
                        <select
                          value={fg.finished_good_id_name}
                          onChange={(e) => {
                            const next = [...finishedGoods];
                            next[fgIdx].finished_good_id_name = e.target.value;
                            setFinishedGoods(next);
                          }}
                          disabled={viewMode}
                          className="w-full border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 transition"
                        >
                          <option value="">Select Finished Good...</option>
                          {finishedGoodsOptions.map((fgOption) => (
                            <option
                              key={fgOption._id}
                              value={`${fgOption._id}-${fgOption.name}`}
                            >
                              {fgOption.name} ({fgOption.product_id})
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Quantities */}
                      {["quantities", "tolerances", "comments"].map((key) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                            {key}
                          </label>
                          {fg[key].map((value, idx2) => (
                            <input
                              key={idx2}
                              type={key === "quantities" ? "number" : "text"}
                              placeholder={key.slice(0, -1)}
                              value={value}
                              onChange={(e) => {
                                const next = [...finishedGoods];
                                next[fgIdx][key][idx2] = e.target.value;
                                setFinishedGoods(next);
                              }}
                              disabled={viewMode}
                              className="w-full mb-2 border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 transition"
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </section>

              {/* Raw Materials Section */}
              <section className="mb-10">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Raw Materials
                </h2>
                {rawMaterials.map((rm, rmIdx) => (
                  <div
                    key={rmIdx}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/60 backdrop-blur-sm shadow-sm p-5 mb-5"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-gray-700 dark:text-gray-300">
                        Raw Material #{rmIdx + 1}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div className="md:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Raw Material
                        </label>
                        <select
                          value={rm.raw_material_id}
                          onChange={(e) => {
                            const next = [...rawMaterials];
                            const selected = rawMaterialsOptions.find(
                              (opt) => opt._id === e.target.value
                            );
                            next[rmIdx].raw_material_id = e.target.value;
                            next[rmIdx].raw_material_name = selected
                              ? selected.name
                              : "";
                            setRawMaterials(next);
                          }}
                          disabled={viewMode}
                          className="w-full border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 transition"
                        >
                          <option value="">Select Raw Material...</option>
                          {rawMaterialsOptions.map((rmOption) => (
                            <option key={rmOption._id} value={rmOption._id}>
                              {rmOption.name} ({rmOption.product_id})
                            </option>
                          ))}
                        </select>
                      </div>

                      {["tolerances", "quantities", "comments"].map((key) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                            {key}
                          </label>
                          {rm[key].map((value, idx2) => (
                            <input
                              key={idx2}
                              type={key === "quantities" ? "number" : "text"}
                              placeholder={key.slice(0, -1)}
                              value={value}
                              onChange={(e) => {
                                const next = [...rawMaterials];
                                next[rmIdx][key][idx2] = e.target.value;
                                setRawMaterials(next);
                              }}
                              disabled={viewMode}
                              className="w-full mb-2 border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-purple-500 transition"
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {!viewMode && (
                  <button
                    onClick={() =>
                      setRawMaterials([
                        ...rawMaterials,
                        {
                          raw_material_id: "",
                          raw_material_name: "",
                          tolerances: [""],
                          quantities: [""],
                          comments: [""],
                        },
                      ])
                    }
                    className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-5 py-2.5 shadow-md text-sm font-medium transition"
                  >
                    + Add Raw Material
                  </button>
                )}
              </section>

              {/* Processes */}
              <section className="mb-12">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Processes
                </h2>
                <div className="flex flex-col gap-3">
                  {processRows.map((proc, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        placeholder={`Process ${idx + 1}`}
                        className="flex-1 border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-yellow-500 transition"
                        value={proc}
                        onChange={(e) => {
                          const next = [...processRows];
                          next[idx] = e.target.value;
                          setProcessRows(next);
                        }}
                        disabled={viewMode}
                      />
                      {!viewMode && (
                        <button
                          onClick={() => {
                            if (processRows.length > 1) {
                              setProcessRows(
                                processRows.filter((_, i) => i !== idx)
                              );
                            }
                          }}
                          className="text-red-500 hover:text-red-600 transition"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {!viewMode && (
                  <div className="flex justify-end mt-6">
                    <button
                      className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg px-5 py-2.5 shadow-md text-sm font-medium transition"
                      onClick={() => setProcessRows([...processRows, ""])}
                    >
                      + Add Process
                    </button>
                  </div>
                )}
              </section>

              {/* Submit Button */}
              {!viewMode && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={formik.handleSubmit}
                    disabled={formik.isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-2.5 shadow-lg font-medium text-base transition disabled:opacity-60"
                  >
                    Submit
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Pagination
        page={page}
        setPage={setPage}
        hasNextPage={boms?.length === 10}
      />
    </div>
  );
};

export default BOM;
