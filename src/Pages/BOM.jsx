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
import { toast } from "react-toastify";

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

  const [bomType, setBomType] = useState("");

  // New state for arrays
  const [compoundCodes, setCompoundCodes] = useState([""]);
  const [compoundName, setCompoundName] = useState("");
  const [compoundWeight, setCompoundWeight] = useState("");
  const [partNames, setPartNames] = useState([""]);
  const [hardnesses, setHardnesses] = useState([""]);
  const [partNameDetails, setPartNameDetails] = useState([
    {
      part_name_id_name: "",
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
  const [compounds, setCompounds] = useState([
    {
      compound_id: "",
      compound_name: "",
      compound_code: "",
      hardness: "",
      weight: "",
    },
  ]);
  const [processRows, setProcessRows] = useState([""]);
  const [accelerators, setAccelerators] = useState([
    { name: "", tolerance: "", quantity: "", comment: "" },
  ]);

  const { products, getAllProducts } = useInventory();

  const partNameOptions = (products || []).filter((p) =>
    (p?.category || "").toLowerCase().includes("part") || (p?.category || "").toLowerCase().includes("finished")
  );
  const rawMaterialsOptions = (products || []).filter((p) => {
    const category = (p?.category || "").toLowerCase();
    return category.includes("raw") || category === "raw material";
  });
  const compoundOptions = (products || []).filter((p) => 
    p?.category === "Compound Name"
  );

  const formik = useFormik({
    initialValues: {
      _id: "",
    },
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const payload = {
          ...values,
          bom_type: bomType,
          compound_codes: compoundCodes.filter((c) => c && c.trim() !== ""),
          compound_name: (compoundName || "").trim(),
          compound_weight: (compoundWeight || "").trim(),
          compounds: bomType === "part-name" ? compounds.filter((c) => (c.compound_id || c.compound_name) && (c.compound_id.trim() !== "" || c.compound_name.trim() !== "")).map((c) => ({
            compound_id: c.compound_id || "",
            compound_name: c.compound_name || "",
            compound_code: c.compound_code || "",
            hardness: c.hardness || "",
            weight: c.weight || "",
          })) : [],
          part_names: partNames.filter((p) => p && p.trim() !== ""),
          hardnesses: hardnesses.filter((h) => h && h.trim() !== ""),
          part_name_details: partNameDetails.map((pnd) => ({
            part_name_id_name: pnd.part_name_id_name || "",
            tolerances: pnd.tolerances.filter((t) => t && t.trim() !== ""),
            quantities: pnd.quantities
              .filter((q) => q && q.trim() !== "")
              .map((q) => Number(q))
              .filter((q) => !isNaN(q)),
            comments: pnd.comments.filter((c) => c && c.trim() !== ""),
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
          accelerators: accelerators.map((acc) => ({
            name: acc.name || "",
            tolerance: acc.tolerance || "",
            quantity: acc.quantity || "",
            comment: acc.comment || "",
          })),
        };

        if (editMode) {
          await axiosHandler.put("/bom", payload, { withCredentials: true });
          toast.success("BOM updated successfully");
        } else {
          await axiosHandler.post("/bom", payload, { withCredentials: true });
          toast.success("BOM created successfully");
        }
        await fetchBoms();
        // Refresh products to ensure raw materials remain visible in inventory
        await getAllProducts();
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
    setBomType("");
    setCompoundCodes([""]);
    setCompoundName("");
    setCompoundWeight("");
    setPartNames([""]);
    setHardnesses([""]);
    setPartNameDetails([
      {
        part_name_id_name: "",
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
    setCompounds([
      {
        compound_id: "",
        compound_name: "",
        compound_code: "",
        hardness: "",
        weight: "",
      },
    ]);
    setProcessRows([""]);
    setAccelerators([{ name: "", tolerance: "", quantity: "", comment: "" }]);
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

  // Refresh products when modal opens to ensure dropdowns are populated
  useEffect(() => {
    if (showModal) {
      getAllProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  const handleDownload = () => {
    const headers = ["Compound Codes", "Compound Name", "Part Names", "Created Date"];
    const source = filteredBoms.length ? filteredBoms : boms;
    const rows = source.map((b) => [
      (b.compound_codes || []).join(", ") || "",
      b.compound_name || "",
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

      setBomType(bom.bom_type || "");
      setCompoundCodes(
        bom.compound_codes && bom.compound_codes.length > 0
          ? bom.compound_codes
          : [""]
      );
      setCompoundName(bom.compound_name || "");
      setCompoundWeight(bom.compound_weight || "");
      // Only load compounds array for part-name BOMs
      if (bom.bom_type === "part-name") {
        setCompounds(
          bom.compounds && bom.compounds.length > 0
            ? bom.compounds.map((c) => ({
                compound_id: c.compound_id?._id || c.compound_id || "",
                compound_name: c.compound_name || c.compound_id?.name || "",
                compound_code: c.compound_code || c.compound_id?.product_id || (Array.isArray(c.compound_codes) && c.compound_codes.length > 0 ? c.compound_codes[0] : ""),
                hardness: c.hardness || c.compound_id?.hardness || (Array.isArray(c.hardnesses) && c.hardnesses.length > 0 ? c.hardnesses[0] : ""),
                weight: c.weight || c.compound_id?.weight || "",
              }))
            : [{ compound_id: "", compound_name: "", compound_code: "", hardness: "", weight: "" }]
        );
      } else {
        setCompounds([{ compound_id: "", compound_name: "", compound_code: "", hardness: "", weight: "" }]);
      }
      setPartNames(
        bom.part_names && bom.part_names.length > 0 ? bom.part_names : [""]
      );
      setHardnesses(
        bom.hardnesses && bom.hardnesses.length > 0 ? bom.hardnesses : [""]
      );

      setPartNameDetails(
        bom.part_name_details && bom.part_name_details.length > 0
          ? bom.part_name_details.map((pnd) => ({
              part_name_id_name: pnd.part_name_id_name || "",
              tolerances:
                pnd.tolerances && pnd.tolerances.length > 0
                  ? pnd.tolerances
                  : [""],
              quantities:
                pnd.quantities && pnd.quantities.length > 0
                  ? pnd.quantities.map((q) => String(q))
                  : [""],
              comments:
                pnd.comments && pnd.comments.length > 0 ? pnd.comments : [""],
            }))
          : [
              {
                part_name_id_name: "",
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

      setAccelerators(
        bom.accelerators && bom.accelerators.length > 0
          ? bom.accelerators.map((acc) => ({
              name: acc.name || "",
              tolerance: acc.tolerance || "",
              quantity: acc.quantity || "",
              comment: acc.comment || "",
            }))
          : [{ name: "", tolerance: "", quantity: "", comment: "" }]
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
          onClick={async () => {
            setEditMode(false);
            setViewMode(false);
            formik.resetForm();
            resetAllFields();
            // Refresh products when opening modal to ensure dropdowns are populated
            await getAllProducts();
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

          {/* <button
            onClick={handleDownload}
            className="p-2 rounded-lg cursor-pointer text-gray-800 hover:bg-gray-200 border border-gray-300 hover:bg-gray-100 transition"
          >
            <Download size={16} />
          </button> */}
        </div>
      </div>

      {/* Table Section */}
      <div className="border rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full min-w-[900px] text-sm text-left">
          <thead>
            <tr className="bg-linear-to-r text-center from-blue-600 to-sky-500 whitespace-nowrap text-white uppercase text-xs tracking-wide">
              <th className="px-4 sm:px-6 py-3 font-medium">BOM Type</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Compound Codes</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Compound Name</th>
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
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  Loading BOMs...
                </td>
              </tr>
            ) : boms?.length > 0 ? (
              (filteredBoms.length ? filteredBoms : boms)
                .filter((item) => {
                  const q = searchQuery.toLowerCase();
                  // For part-name BOMs, search in compounds array
                  let compoundCodesStr = "";
                  let compoundNameStr = "";

                  if (
                    item.bom_type === "part-name" &&
                    item.compounds &&
                    item.compounds.length > 0
                  ) {
                    compoundCodesStr = item.compounds
                      .map((c) => c.compound_code || "")
                      .join(" ")
                      .toLowerCase();
                    compoundNameStr = item.compounds
                      .map((c) => c.compound_name || c.compound_id?.name || "")
                      .join(" ")
                      .toLowerCase();
                  } else {
                    compoundCodesStr = (item.compound_codes || [])
                      .join(" ")
                      .toLowerCase();
                    compoundNameStr = (item.compound_name || "").toLowerCase();
                  }

                  const partNamesStr = (item.part_names || [])
                    .join(" ")
                    .toLowerCase();
                  return (
                    compoundCodesStr.includes(q) ||
                    partNamesStr.includes(q) ||
                    compoundNameStr.includes(q)
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
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.bom_type === "compound"
                            ? "bg-blue-100 text-blue-800"
                            : item.bom_type === "part-name"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.bom_type === "compound"
                          ? "Compound"
                          : item.bom_type === "part-name"
                          ? "Part Name"
                          : "-"}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      {item.bom_type === "part-name" &&
                      item.compounds &&
                      item.compounds.length > 0
                        ? item.compounds
                            .map((c) => c.compound_code || "-")
                            .filter((code) => code !== "-")
                            .join(", ") || "-"
                        : (item.compound_codes || []).join(", ") || "-"}
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      {item.bom_type === "part-name" &&
                      item.compounds &&
                      item.compounds.length > 0
                        ? item.compounds
                            .map(
                              (c) =>
                                c.compound_name || c.compound_id?.name || "-"
                            )
                            .filter((name) => name !== "-")
                            .join(", ") || "-"
                        : item.compound_name || "-"}
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      {(() => {
                        // Try to get part names from part_name_details first
                        if (
                          item.part_name_details &&
                          item.part_name_details.length > 0
                        ) {
                          const names = item.part_name_details
                            .map((pnd) => {
                              // First try product_snapshot name
                              if (
                                pnd.product_snapshot &&
                                pnd.product_snapshot.name
                              ) {
                                return pnd.product_snapshot.name;
                              }
                              // Then try part_name_id_name
                              if (pnd.part_name_id_name) {
                                // Extract name from "id-name" format or use the full string
                                const parts = pnd.part_name_id_name.split("-");
                                if (parts.length > 1) {
                                  // Return the name part (everything after first "-")
                                  return parts.slice(1).join("-");
                                }
                                // If no dash, might be just the ID, try using the full string
                                return pnd.part_name_id_name;
                              }
                              return null;
                            })
                            .filter(Boolean);
                          if (names.length > 0) {
                            return names.join(", ");
                          }
                        }
                        // Fallback to part_names array if part_name_details is not available or empty
                        const partNames = (item.part_names || []).filter(
                          (p) => p && p.trim() !== ""
                        );
                        if (partNames.length > 0) {
                          return partNames.join(", ");
                        }
                        // If nothing found, show "-"
                        return "-";
                      })()}
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
                              toast.success("BOM deleted successfully");
                              fetchBoms();
                            } catch (e) {
                              toast.error("Failed to delete BOM");
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
                onClick={async () => {
                  setShowModal(false);
                  setEditMode(false);
                  setViewMode(false);
                  formik.resetForm();
                  resetAllFields();
                  // Refresh products when closing modal
                  await getAllProducts();
                }}
                className="absolute top-4 right-5 text-gray-600 dark:text-gray-300 hover:text-red-500 transition-all duration-200 text-2xl"
              >
                ✕
              </button>

              {/* Title */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Bill of Materials (BOM)
                  </h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Manage compounds, part names, raw materials, and processes.
                  </p>
                </div>

                <select
                  className="h-12 w-50 border rounded-xl border-gray-300"
                  value={bomType}
                  onChange={(e) => setBomType(e.target.value)}
                >
                  <option value="">Select an option</option>
                  <option value="compound">Compound</option>
                  <option value="part-name">Part Name</option>
                </select>
              </div>
              <hr className="border-gray-300 dark:border-gray-600 mb-8" />

              {bomType === "compound" && (
                <>
                  <section className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Compound Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* Compound Name - Single manual input for compound BOM */}
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
                          className="w-full border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
                      {/* Compound Codes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Compound Code
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

                      {/* Hardnesses */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Hardness
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Weight
                        </label>

                        <input
                          type="text"
                          placeholder="Enter weight"
                          value={compoundWeight}
                          onChange={(e) => setCompoundWeight(e.target.value)}
                          disabled={viewMode}
                          className="w-full mb-2 border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Part Name Section */}
                  {/* <section className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Part Name
                    </h2>
                    {partNameDetails.map((pnd, pndIdx) => (
                      <div
                        key={pndIdx}
                        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/60 backdrop-blur-sm shadow-sm p-5 mb-5"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium text-gray-700 dark:text-gray-300">
                            Part Name #{pndIdx + 1}
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Part Name (ID + Name)
                            </label>
                            <select
                              value={pnd.part_name_id_name}
                              onChange={(e) => {
                                const next = [...partNameDetails];
                                next[pndIdx].part_name_id_name = e.target.value;
                                setPartNameDetails(next);
                              }}
                              disabled={viewMode}
                              className="w-full border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 transition"
                            >
                              <option value="">Select Part Name...</option>
                              {partNameOptions.map((pndOption) => (
                                <option
                                  key={pndOption._id}
                                  value={`${pndOption._id}-${pndOption.name}`}
                                >
                                  {pndOption.name} ({pndOption.product_id})
                                </option>
                              ))}
                            </select>
                          </div>

                        
                          {["quantities", "tolerances", "comments"].map(
                            (key) => (
                              <div key={key}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                                  {key}
                                </label>
                                {pnd[key].map((value, idx2) => (
                                  <input
                                    key={idx2}
                                    type={
                                      key === "quantities" ? "number" : "text"
                                    }
                                    placeholder={key.slice(0, -1)}
                                    value={value}
                                    onChange={(e) => {
                                      const next = [...partNameDetails];
                                      next[pndIdx][key][idx2] = e.target.value;
                                      setPartNameDetails(next);
                                    }}
                                    disabled={viewMode}
                                    className="w-full mb-2 border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 transition"
                                  />
                                ))}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </section> */}

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

                          {["tolerances", "quantities", "comments"].map(
                            (key) => (
                              <div key={key}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                                  {key}
                                </label>
                                {rm[key].map((value, idx2) => (
                                  <input
                                    key={idx2}
                                    type={
                                      key === "quantities" ? "number" : "text"
                                    }
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
                            )
                          )}
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

                    {/* Raw Materials Summary Table */}
                    {rawMaterials.length > 0 &&
                      rawMaterials.some((rm) => rm.raw_material_name) && (
                        <div className="mt-6 border rounded-lg overflow-x-auto shadow-sm">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 mt-6">
                            Raw Materials Summary
                          </h3>
                          <table className="w-full text-sm text-left min-w-[600px]">
                            <thead>
                              <tr className="bg-purple-600 text-white uppercase text-xs tracking-wide">
                                <th className="px-4 sm:px-6 py-3 font-medium">
                                  Raw Material Name
                                </th>
                                <th className="px-4 sm:px-6 py-3 font-medium text-center">
                                  Total Weight
                                </th>
                                <th className="px-4 sm:px-6 py-3 font-medium text-center">
                                  Tolerances
                                </th>
                                <th className="px-4 sm:px-6 py-3 font-medium text-center">
                                  Comments
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {rawMaterials
                                .filter(
                                  (rm) =>
                                    rm.raw_material_name &&
                                    rm.raw_material_name.trim() !== ""
                                )
                                .map((rm, idx) => {
                                  // Calculate total quantity
                                  const totalQty = (rm.quantities || [])
                                    .filter(
                                      (q) =>
                                        q !== "" &&
                                        q !== null &&
                                        q !== undefined
                                    )
                                    .reduce((sum, q) => {
                                      const num = parseFloat(q);
                                      return sum + (isNaN(num) ? 0 : num);
                                    }, 0);

                                  // Get tolerances (unique values or first value)
                                  const tolerances = (
                                    rm.tolerances || []
                                  ).filter((t) => t && t.trim() !== "");
                                  const toleranceDisplay =
                                    tolerances.length > 0
                                      ? tolerances.length === 1
                                        ? tolerances[0]
                                        : tolerances.join(", ")
                                      : "-";

                                  // Get comments (unique values or first value)
                                  const comments = (rm.comments || []).filter(
                                    (c) => c && c.trim() !== ""
                                  );
                                  const commentDisplay =
                                    comments.length > 0
                                      ? comments.length === 1
                                        ? comments[0]
                                        : comments.join(", ")
                                      : "-";

                                  return (
                                    <tr
                                      key={idx}
                                      className={`border-t ${
                                        idx % 2 === 0
                                          ? "bg-white dark:bg-gray-800"
                                          : "bg-gray-50 dark:bg-gray-700"
                                      }`}
                                    >
                                      <td className="px-4 sm:px-6 py-3 font-medium text-gray-900 dark:text-gray-100">
                                        {rm.raw_material_name}
                                      </td>
                                      <td className="px-4 sm:px-6 py-3 text-center text-gray-700 dark:text-gray-300">
                                        {totalQty.toFixed(2)}
                                      </td>
                                      <td className="px-4 sm:px-6 py-3 text-center text-gray-700 dark:text-gray-300">
                                        {toleranceDisplay}
                                      </td>
                                      <td className="px-4 sm:px-6 py-3 text-center text-gray-700 dark:text-gray-300">
                                        {commentDisplay}
                                      </td>
                                    </tr>
                                  );
                                })}
                              {rawMaterials.filter(
                                (rm) =>
                                  rm.raw_material_name &&
                                  rm.raw_material_name.trim() !== ""
                              ).length === 0 && (
                                <tr>
                                  <td
                                    colSpan="4"
                                    className="text-center py-6 text-gray-500"
                                  >
                                    No raw materials added yet.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                            <tfoot>
                              <tr className="bg-purple-100 dark:bg-purple-900 font-semibold">
                                <td className="px-4 sm:px-6 py-3 text-gray-900 dark:text-gray-100">
                                  Total
                                </td>
                                <td className="px-4 sm:px-6 py-3 text-center text-gray-900 dark:text-gray-100">
                                  {rawMaterials
                                    .filter(
                                      (rm) =>
                                        rm.raw_material_name &&
                                        rm.raw_material_name.trim() !== ""
                                    )
                                    .reduce((total, rm) => {
                                      const qty = (rm.quantities || [])
                                        .filter(
                                          (q) =>
                                            q !== "" &&
                                            q !== null &&
                                            q !== undefined
                                        )
                                        .reduce((sum, q) => {
                                          const num = parseFloat(q);
                                          return sum + (isNaN(num) ? 0 : num);
                                        }, 0);
                                      return total + qty;
                                    }, 0)
                                    .toFixed(2)}
                                </td>
                                <td className="px-4 sm:px-6 py-3 text-center text-gray-900 dark:text-gray-100">
                                  -
                                </td>
                                <td className="px-4 sm:px-6 py-3 text-center text-gray-900 dark:text-gray-100">
                                  -
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )}
                  </section>

                  {/* Accelerator Section */}
                  <section className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Accelerator (Pakai)
                    </h2>
                    {accelerators.map((acc, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/60 backdrop-blur-sm shadow-sm p-5 mb-5"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium text-gray-700 dark:text-gray-300">
                            Accelerator #{idx + 1}
                          </h3>
                          {!viewMode && accelerators.length > 1 && (
                            <button
                              onClick={() =>
                                setAccelerators(
                                  accelerators.filter((_, i) => i !== idx)
                                )
                              }
                              className="text-red-500 hover:text-red-600 text-sm"
                            >
                              ✕ Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {/* Accelerator Name */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Accelerator Name
                            </label>
                            <input
                              type="text"
                              value={acc.name}
                              onChange={(e) => {
                                const next = [...accelerators];
                                next[idx].name = e.target.value;
                                setAccelerators(next);
                              }}
                              disabled={viewMode}
                              placeholder="Enter Accelerator name"
                              className="w-full border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 transition"
                            />
                          </div>
                          {/* Tolerance */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Tolerance
                            </label>
                            <input
                              type="text"
                              value={acc.tolerance}
                              onChange={(e) => {
                                const next = [...accelerators];
                                next[idx].tolerance = e.target.value;
                                setAccelerators(next);
                              }}
                              disabled={viewMode}
                              placeholder="Enter tolerance"
                              className="w-full border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 transition"
                            />
                          </div>
                          {/* Quantity */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Weight
                            </label>
                            <input
                              type="number"
                              value={acc.quantity}
                              onChange={(e) => {
                                const next = [...accelerators];
                                next[idx].quantity = e.target.value;
                                setAccelerators(next);
                              }}
                              disabled={viewMode}
                              placeholder="Enter Weight"
                              className="w-full border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 transition"
                            />
                          </div>
                          {/* Comment */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Comments
                            </label>
                            <input
                              type="text"
                              value={acc.comment}
                              onChange={(e) => {
                                const next = [...accelerators];
                                next[idx].comment = e.target.value;
                                setAccelerators(next);
                              }}
                              disabled={viewMode}
                              placeholder="Enter comment"
                              className="w-full border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 transition"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {!viewMode && (
                      <button
                        onClick={() =>
                          setAccelerators([
                            ...accelerators,
                            {
                              name: "",
                              tolerance: "",
                              quantity: "",
                              comment: "",
                            },
                          ])
                        }
                        className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-5 py-2.5 shadow-md text-sm font-medium transition"
                      >
                        + Add Accelerator
                      </button>
                    )}

                    {/* Raw Materials + Accelerators Combined Summary Table */}
                    {((rawMaterials.length > 0 &&
                      rawMaterials.some((rm) => rm.raw_material_name)) ||
                      (accelerators.length > 0 &&
                        accelerators.some((acc) => acc.name))) && (
                      <div className="mt-6 border rounded-lg overflow-x-auto shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 mt-6">
                          Raw Materials + Accelerators Summary
                        </h3>
                        <table className="w-full text-sm text-left min-w-[600px]">
                          <thead>
                            <tr className="bg-gradient-to-r from-purple-600 to-green-600 text-white uppercase text-xs tracking-wide">
                              <th className="px-4 sm:px-6 py-3 font-medium">
                                Category
                              </th>
                              <th className="px-4 sm:px-6 py-3 font-medium text-center">
                                Total Weight
                              </th>
                              <th className="px-4 sm:px-6 py-3 font-medium text-center">
                                Details
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Raw Materials Total Row */}
                            {rawMaterials.some(
                              (rm) =>
                                rm.raw_material_name &&
                                rm.raw_material_name.trim() !== ""
                            ) && (
                              <tr className="border-t bg-white dark:bg-gray-800">
                                <td className="px-4 sm:px-6 py-3 font-medium text-gray-900 dark:text-gray-100">
                                  Raw Materials
                                </td>
                                <td className="px-4 sm:px-6 py-3 text-center text-gray-700 dark:text-gray-300 font-semibold">
                                  {rawMaterials
                                    .filter(
                                      (rm) =>
                                        rm.raw_material_name &&
                                        rm.raw_material_name.trim() !== ""
                                    )
                                    .reduce((total, rm) => {
                                      const qty = (rm.quantities || [])
                                        .filter(
                                          (q) =>
                                            q !== "" &&
                                            q !== null &&
                                            q !== undefined
                                        )
                                        .reduce((sum, q) => {
                                          const num = parseFloat(q);
                                          return sum + (isNaN(num) ? 0 : num);
                                        }, 0);
                                      return total + qty;
                                    }, 0)
                                    .toFixed(2)}
                                </td>
                                <td className="px-4 sm:px-6 py-3 text-center text-gray-700 dark:text-gray-300">
                                  {
                                    rawMaterials.filter(
                                      (rm) =>
                                        rm.raw_material_name &&
                                        rm.raw_material_name.trim() !== ""
                                    ).length
                                  }{" "}
                                  item(s)
                                </td>
                              </tr>
                            )}

                            {/* Accelerators Total Row */}
                            {accelerators.some(
                              (acc) => acc.name && acc.name.trim() !== ""
                            ) && (
                              <tr className="border-t bg-white dark:bg-gray-800">
                                <td className="px-4 sm:px-6 py-3 font-medium text-gray-900 dark:text-gray-100">
                                  Accelerators
                                </td>
                                <td className="px-4 sm:px-6 py-3 text-center text-gray-700 dark:text-gray-300 font-semibold">
                                  {accelerators
                                    .filter(
                                      (acc) =>
                                        acc.name && acc.name.trim() !== ""
                                    )
                                    .reduce((total, acc) => {
                                      const qty = parseFloat(acc.quantity);
                                      return total + (isNaN(qty) ? 0 : qty);
                                    }, 0)
                                    .toFixed(2)}
                                </td>
                                <td className="px-4 sm:px-6 py-3 text-center text-gray-700 dark:text-gray-300">
                                  {
                                    accelerators.filter(
                                      (acc) =>
                                        acc.name && acc.name.trim() !== ""
                                    ).length
                                  }{" "}
                                  item(s)
                                </td>
                              </tr>
                            )}
                          </tbody>
                          <tfoot>
                            <tr className="bg-gradient-to-r from-purple-100 to-green-100 dark:from-purple-900 dark:to-green-900 font-bold">
                              <td className="px-4 sm:px-6 py-3 text-gray-900 dark:text-gray-100 text-lg">
                                Grand Total
                              </td>
                              <td className="px-4 sm:px-6 py-3 text-center text-gray-900 dark:text-gray-100 text-lg">
                                {
                                  // Raw Materials Total
                                  (
                                    rawMaterials
                                      .filter(
                                        (rm) =>
                                          rm.raw_material_name &&
                                          rm.raw_material_name.trim() !== ""
                                      )
                                      .reduce((total, rm) => {
                                        const qty = (rm.quantities || [])
                                          .filter(
                                            (q) =>
                                              q !== "" &&
                                              q !== null &&
                                              q !== undefined
                                          )
                                          .reduce((sum, q) => {
                                            const num = parseFloat(q);
                                            return sum + (isNaN(num) ? 0 : num);
                                          }, 0);
                                        return total + qty;
                                      }, 0) +
                                    // Accelerators Total
                                    accelerators
                                      .filter(
                                        (acc) =>
                                          acc.name && acc.name.trim() !== ""
                                      )
                                      .reduce((total, acc) => {
                                        const qty = parseFloat(acc.quantity);
                                        return total + (isNaN(qty) ? 0 : qty);
                                      }, 0)
                                  ).toFixed(2)
                                }
                              </td>
                              <td className="px-4 sm:px-6 py-3 text-center text-gray-900 dark:text-gray-100 text-lg">
                                {rawMaterials.filter(
                                  (rm) =>
                                    rm.raw_material_name &&
                                    rm.raw_material_name.trim() !== ""
                                ).length +
                                  accelerators.filter(
                                    (acc) => acc.name && acc.name.trim() !== ""
                                  ).length}{" "}
                                total item(s)
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
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
                </>
              )}

              {bomType === "part-name" && (
                <>
                  {/* Part Name Section */}
                  <section className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Part Name
                    </h2>
                    {partNameDetails.map((pnd, pndIdx) => (
                      <div
                        key={pndIdx}
                        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/60 backdrop-blur-sm shadow-sm p-5 mb-5"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium text-gray-700 dark:text-gray-300">
                            Part Name #{pndIdx + 1}
                          </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Part Name (ID + Name)
                            </label>
                            <select
                              value={pnd.part_name_id_name}
                              onChange={(e) => {
                                const next = [...partNameDetails];
                                next[pndIdx].part_name_id_name = e.target.value;
                                setPartNameDetails(next);
                              }}
                              disabled={viewMode}
                              className="w-full border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 transition"
                            >
                              <option value="">Select Part Name...</option>
                              {partNameOptions.map((pndOption) => (
                                <option
                                  key={pndOption._id}
                                  value={`${pndOption._id}-${pndOption.name}`}
                                >
                                  {pndOption.name} ({pndOption.product_id})
                                </option>
                              ))}
                            </select>
                          </div>

                          {["quantities", "tolerances", "comments"].map(
                            (key) => (
                              <div key={key}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                                  {key}
                                </label>
                                {pnd[key].map((value, idx2) => (
                                  <input
                                    key={idx2}
                                    type={
                                      key === "quantities" ? "number" : "text"
                                    }
                                    placeholder={key.slice(0, -1)}
                                    value={value}
                                    onChange={(e) => {
                                      const next = [...partNameDetails];
                                      next[pndIdx][key][idx2] = e.target.value;
                                      setPartNameDetails(next);
                                    }}
                                    disabled={viewMode}
                                    className="w-full mb-2 border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 transition"
                                  />
                                ))}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </section>

                  <section className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Compound Details
                    </h2>
                    {compounds.map((compound, compoundIdx) => (
                      <div
                        key={compoundIdx}
                        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/60 backdrop-blur-sm shadow-sm p-5 mb-5"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium text-gray-700 dark:text-gray-300">
                            Compound #{compoundIdx + 1}
                          </h3>
                          {!viewMode && compounds.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                const next = compounds.filter(
                                  (_, idx) => idx !== compoundIdx
                                );
                                setCompounds(next);
                              }}
                              className="text-red-600 hover:text-red-700 p-2 rounded border border-red-300 hover:border-red-400 hover:bg-red-50 transition"
                              title="Delete Compound"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          {/* Compound Name - Dropdown for part-name */}
                          <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Compound Name
                            </label>
                            <select
                              value={compound.compound_id}
                              onChange={(e) => {
                                const next = [...compounds];
                                const selected = compoundOptions.find(
                                  (opt) => opt._id === e.target.value
                                );
                                next[compoundIdx].compound_id = e.target.value;
                                next[compoundIdx].compound_name = selected
                                  ? selected.name
                                  : "";
                                // Auto-fill compound code, hardness, and weight from selected compound
                                next[compoundIdx].compound_code = selected?.product_id || "";
                                next[compoundIdx].hardness = selected?.hardness || "";
                                next[compoundIdx].weight = selected?.weight || "";
                                setCompounds(next);
                              }}
                              disabled={viewMode}
                              className="w-full border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 transition"
                            >
                              <option value="">Select Compound...</option>
                              {compoundOptions.map((compoundOption) => (
                                <option
                                  key={compoundOption._id}
                                  value={compoundOption._id}
                                >
                                  {compoundOption.name} (
                                  {compoundOption.product_id})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Compound Code - Single */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Compound Code
                            </label>
                            <input
                              type="text"
                              placeholder="Select compound to auto-fill"
                              value={compound.compound_code || ""}
                              readOnly
                              disabled={viewMode || !compound.compound_id}
                              className="w-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed rounded-lg px-4 py-2.5 text-sm opacity-75"
                            />
                          </div>

                          {/* Hardness - Single */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Hardness
                            </label>
                            <input
                              type="text"
                              placeholder="Select compound to auto-fill"
                              value={compound.hardness || ""}
                              readOnly
                              disabled={viewMode || !compound.compound_id}
                              className="w-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed rounded-lg px-4 py-2.5 text-sm opacity-75"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Weight
                            </label>
                            <input
                              type="text"
                              placeholder="Select compound to auto-fill"
                              value={compound.weight || ""}
                              readOnly
                              disabled={viewMode || !compound.compound_id}
                              className="w-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed rounded-lg px-4 py-2.5 text-sm opacity-75"
                            />
                          </div>
                        </div>

                        {/* Add Compound button below each compound's fields */}
                        {!viewMode && compoundIdx === compounds.length - 1 && (
                          <div className="mt-4">
                            <button
                              type="button"
                              onClick={() =>
                                setCompounds([
                                  ...compounds,
                                  {
                                    compound_id: "",
                                    compound_name: "",
                                    compound_code: "",
                                    hardness: "",
                                    weight: "",
                                  },
                                ])
                              }
                              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2.5 shadow-md text-sm font-medium transition"
                            >
                              + Add Compound
                            </button>
                          </div>
                        )}
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

                          {["tolerances", "quantities", "comments"].map(
                            (key) => (
                              <div key={key}>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                                  {key}
                                </label>
                                {rm[key].map((value, idx2) => (
                                  <input
                                    key={idx2}
                                    type={
                                      key === "quantities" ? "number" : "text"
                                    }
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
                            )
                          )}
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

                    {rawMaterials.length > 0 &&
                      rawMaterials.some((rm) => rm.raw_material_name) && (
                        <div className="mt-6 border rounded-lg overflow-x-auto shadow-sm">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 mt-6">
                            Raw Materials Summary
                          </h3>
                          <table className="w-full text-sm text-left min-w-[600px]">
                            <thead>
                              <tr className="bg-purple-600 text-white uppercase text-xs tracking-wide">
                                <th className="px-4 sm:px-6 py-3 font-medium">
                                  Raw Material Name
                                </th>
                                <th className="px-4 sm:px-6 py-3 font-medium text-center">
                                  Total Quantity
                                </th>
                                <th className="px-4 sm:px-6 py-3 font-medium text-center">
                                  Tolerances
                                </th>
                                <th className="px-4 sm:px-6 py-3 font-medium text-center">
                                  Comments
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {rawMaterials
                                .filter(
                                  (rm) =>
                                    rm.raw_material_name &&
                                    rm.raw_material_name.trim() !== ""
                                )
                                .map((rm, idx) => {
                                  // Calculate total quantity
                                  const totalQty = (rm.quantities || [])
                                    .filter(
                                      (q) =>
                                        q !== "" &&
                                        q !== null &&
                                        q !== undefined
                                    )
                                    .reduce((sum, q) => {
                                      const num = parseFloat(q);
                                      return sum + (isNaN(num) ? 0 : num);
                                    }, 0);

                                  // Get tolerances (unique values or first value)
                                  const tolerances = (
                                    rm.tolerances || []
                                  ).filter((t) => t && t.trim() !== "");
                                  const toleranceDisplay =
                                    tolerances.length > 0
                                      ? tolerances.length === 1
                                        ? tolerances[0]
                                        : tolerances.join(", ")
                                      : "-";

                                  // Get comments (unique values or first value)
                                  const comments = (rm.comments || []).filter(
                                    (c) => c && c.trim() !== ""
                                  );
                                  const commentDisplay =
                                    comments.length > 0
                                      ? comments.length === 1
                                        ? comments[0]
                                        : comments.join(", ")
                                      : "-";

                                  return (
                                    <tr
                                      key={idx}
                                      className={`border-t ${
                                        idx % 2 === 0
                                          ? "bg-white dark:bg-gray-800"
                                          : "bg-gray-50 dark:bg-gray-700"
                                      }`}
                                    >
                                      <td className="px-4 sm:px-6 py-3 font-medium text-gray-900 dark:text-gray-100">
                                        {rm.raw_material_name}
                                      </td>
                                      <td className="px-4 sm:px-6 py-3 text-center text-gray-700 dark:text-gray-300">
                                        {totalQty.toFixed(2)}
                                      </td>
                                      <td className="px-4 sm:px-6 py-3 text-center text-gray-700 dark:text-gray-300">
                                        {toleranceDisplay}
                                      </td>
                                      <td className="px-4 sm:px-6 py-3 text-center text-gray-700 dark:text-gray-300">
                                        {commentDisplay}
                                      </td>
                                    </tr>
                                  );
                                })}
                              {rawMaterials.filter(
                                (rm) =>
                                  rm.raw_material_name &&
                                  rm.raw_material_name.trim() !== ""
                              ).length === 0 && (
                                <tr>
                                  <td
                                    colSpan="4"
                                    className="text-center py-6 text-gray-500"
                                  >
                                    No raw materials added yet.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                            <tfoot>
                              <tr className="bg-purple-100 dark:bg-purple-900 font-semibold">
                                <td className="px-4 sm:px-6 py-3 text-gray-900 dark:text-gray-100">
                                  Total
                                </td>
                                <td className="px-4 sm:px-6 py-3 text-center text-gray-900 dark:text-gray-100">
                                  {rawMaterials
                                    .filter(
                                      (rm) =>
                                        rm.raw_material_name &&
                                        rm.raw_material_name.trim() !== ""
                                    )
                                    .reduce((total, rm) => {
                                      const qty = (rm.quantities || [])
                                        .filter(
                                          (q) =>
                                            q !== "" &&
                                            q !== null &&
                                            q !== undefined
                                        )
                                        .reduce((sum, q) => {
                                          const num = parseFloat(q);
                                          return sum + (isNaN(num) ? 0 : num);
                                        }, 0);
                                      return total + qty;
                                    }, 0)
                                    .toFixed(2)}
                                </td>
                                <td className="px-4 sm:px-6 py-3 text-center text-gray-900 dark:text-gray-100">
                                  -
                                </td>
                                <td className="px-4 sm:px-6 py-3 text-center text-gray-900 dark:text-gray-100">
                                  -
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )}
                  </section>

                  {/* Accelerator Section */}
                  {/* <section className="mb-10">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Accelerator (Pakai)
                    </h2>
                    {accelerators.map((acc, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/60 backdrop-blur-sm shadow-sm p-5 mb-5"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium text-gray-700 dark:text-gray-300">
                            Accelerator #{idx + 1}
                          </h3>
                          {!viewMode && accelerators.length > 1 && (
                            <button
                              onClick={() =>
                                setAccelerators(
                                  accelerators.filter((_, i) => i !== idx)
                                )
                              }
                              className="text-red-500 hover:text-red-600 text-sm"
                            >
                              ✕ Remove
                            </button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Accelerator Name
                            </label>
                            <input
                              type="text"
                              value={acc.name}
                              onChange={(e) => {
                                const next = [...accelerators];
                                next[idx].name = e.target.value;
                                setAccelerators(next);
                              }}
                              disabled={viewMode}
                              placeholder="Enter Accelerator name"
                              className="w-full border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 transition"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Tolerance
                            </label>
                            <input
                              type="text"
                              value={acc.tolerance}
                              onChange={(e) => {
                                const next = [...accelerators];
                                next[idx].tolerance = e.target.value;
                                setAccelerators(next);
                              }}
                              disabled={viewMode}
                              placeholder="Enter tolerance"
                              className="w-full border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 transition"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Quantity
                            </label>
                            <input
                              type="number"
                              value={acc.quantity}
                              onChange={(e) => {
                                const next = [...accelerators];
                                next[idx].quantity = e.target.value;
                                setAccelerators(next);
                              }}
                              disabled={viewMode}
                              placeholder="Enter quantity"
                              className="w-full border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 transition"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Comments
                            </label>
                            <input
                              type="text"
                              value={acc.comment}
                              onChange={(e) => {
                                const next = [...accelerators];
                                next[idx].comment = e.target.value;
                                setAccelerators(next);
                              }}
                              disabled={viewMode}
                              placeholder="Enter comment"
                              className="w-full border border-gray-300 dark:border-gray-600 bg-white/60 dark:bg-gray-800/60 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-500 transition"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    {!viewMode && (
                      <button
                        onClick={() =>
                          setAccelerators([
                            ...accelerators,
                            {
                              name: "",
                              tolerance: "",
                              quantity: "",
                              comment: "",
                            },
                          ])
                        }
                        className="bg-green-600 hover:bg-green-700 text-white rounded-lg px-5 py-2.5 shadow-md text-sm font-medium transition"
                      >
                        + Add Accelerator
                      </button>
                    )}

                    {((rawMaterials.length > 0 &&
                      rawMaterials.some((rm) => rm.raw_material_name)) ||
                      (accelerators.length > 0 &&
                        accelerators.some((acc) => acc.name))) && (
                      <div className="mt-6 border rounded-lg overflow-x-auto shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 mt-6">
                          Raw Materials + Accelerators Summary
                        </h3>
                        <table className="w-full text-sm text-left min-w-[600px]">
                          <thead>
                            <tr className="bg-gradient-to-r from-purple-600 to-green-600 text-white uppercase text-xs tracking-wide">
                              <th className="px-4 sm:px-6 py-3 font-medium">
                                Category
                              </th>
                              <th className="px-4 sm:px-6 py-3 font-medium text-center">
                                Total Quantity
                              </th>
                              <th className="px-4 sm:px-6 py-3 font-medium text-center">
                                Details
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {rawMaterials.some(
                              (rm) =>
                                rm.raw_material_name &&
                                rm.raw_material_name.trim() !== ""
                            ) && (
                              <tr className="border-t bg-white dark:bg-gray-800">
                                <td className="px-4 sm:px-6 py-3 font-medium text-gray-900 dark:text-gray-100">
                                  Raw Materials
                                </td>
                                <td className="px-4 sm:px-6 py-3 text-center text-gray-700 dark:text-gray-300 font-semibold">
                                  {rawMaterials
                                    .filter(
                                      (rm) =>
                                        rm.raw_material_name &&
                                        rm.raw_material_name.trim() !== ""
                                    )
                                    .reduce((total, rm) => {
                                      const qty = (rm.quantities || [])
                                        .filter(
                                          (q) =>
                                            q !== "" &&
                                            q !== null &&
                                            q !== undefined
                                        )
                                        .reduce((sum, q) => {
                                          const num = parseFloat(q);
                                          return sum + (isNaN(num) ? 0 : num);
                                        }, 0);
                                      return total + qty;
                                    }, 0)
                                    .toFixed(2)}
                                </td>
                                <td className="px-4 sm:px-6 py-3 text-center text-gray-700 dark:text-gray-300">
                                  {
                                    rawMaterials.filter(
                                      (rm) =>
                                        rm.raw_material_name &&
                                        rm.raw_material_name.trim() !== ""
                                    ).length
                                  }{" "}
                                  item(s)
                                </td>
                              </tr>
                            )}

                            {accelerators.some(
                              (acc) => acc.name && acc.name.trim() !== ""
                            ) && (
                              <tr className="border-t bg-white dark:bg-gray-800">
                                <td className="px-4 sm:px-6 py-3 font-medium text-gray-900 dark:text-gray-100">
                                  Accelerators
                                </td>
                                <td className="px-4 sm:px-6 py-3 text-center text-gray-700 dark:text-gray-300 font-semibold">
                                  {accelerators
                                    .filter(
                                      (acc) =>
                                        acc.name && acc.name.trim() !== ""
                                    )
                                    .reduce((total, acc) => {
                                      const qty = parseFloat(acc.quantity);
                                      return total + (isNaN(qty) ? 0 : qty);
                                    }, 0)
                                    .toFixed(2)}
                                </td>
                                <td className="px-4 sm:px-6 py-3 text-center text-gray-700 dark:text-gray-300">
                                  {
                                    accelerators.filter(
                                      (acc) =>
                                        acc.name && acc.name.trim() !== ""
                                    ).length
                                  }{" "}
                                  item(s)
                                </td>
                              </tr>
                            )}
                          </tbody>
                          <tfoot>
                            <tr className="bg-gradient-to-r from-purple-100 to-green-100 dark:from-purple-900 dark:to-green-900 font-bold">
                              <td className="px-4 sm:px-6 py-3 text-gray-900 dark:text-gray-100 text-lg">
                                Grand Total
                              </td>
                              <td className="px-4 sm:px-6 py-3 text-center text-gray-900 dark:text-gray-100 text-lg">
                                {
                                  // Raw Materials Total
                                  (
                                    rawMaterials
                                      .filter(
                                        (rm) =>
                                          rm.raw_material_name &&
                                          rm.raw_material_name.trim() !== ""
                                      )
                                      .reduce((total, rm) => {
                                        const qty = (rm.quantities || [])
                                          .filter(
                                            (q) =>
                                              q !== "" &&
                                              q !== null &&
                                              q !== undefined
                                          )
                                          .reduce((sum, q) => {
                                            const num = parseFloat(q);
                                            return sum + (isNaN(num) ? 0 : num);
                                          }, 0);
                                        return total + qty;
                                      }, 0) +
                                    // Accelerators Total
                                    accelerators
                                      .filter(
                                        (acc) =>
                                          acc.name && acc.name.trim() !== ""
                                      )
                                      .reduce((total, acc) => {
                                        const qty = parseFloat(acc.quantity);
                                        return total + (isNaN(qty) ? 0 : qty);
                                      }, 0)
                                  ).toFixed(2)
                                }
                              </td>
                              <td className="px-4 sm:px-6 py-3 text-center text-gray-900 dark:text-gray-100 text-lg">
                                {rawMaterials.filter(
                                  (rm) =>
                                    rm.raw_material_name &&
                                    rm.raw_material_name.trim() !== ""
                                ).length +
                                  accelerators.filter(
                                    (acc) => acc.name && acc.name.trim() !== ""
                                  ).length}{" "}
                                total item(s)
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
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
                </>
              )}

              {bomType === "" && (
                <div className="text-center text-gray-500">
                  No BOM Type Selected
                </div>
              )}

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

