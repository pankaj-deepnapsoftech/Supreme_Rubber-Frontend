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
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useInventory } from "@/Context/InventoryContext";
import axiosHandler from "@/config/axiosconfig";
import { toast } from "react-toastify";

const Production_Start = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProductionId, setCurrentProductionId] = useState("");
  const [viewDetails, setViewDetails] = useState(null);

  // BOM and form data
  const [boms, setBoms] = useState([]);
  const [selectedBomId, setSelectedBomId] = useState("");
  const [_selectedBom, setSelectedBom] = useState(null);

  // Finished Goods data
  const [finishedGood, setFinishedGood] = useState({
    compound_code: "",
    compound_name: "",
    est_qty: "",
    uom: "",
    prod_qty: "",
    remain_qty: "",
    category: "",
    total_cost: "",
  });

  // Raw Materials data
  const [rawMaterials, setRawMaterials] = useState([]);

  // Processes data
  const [processes, setProcesses] = useState([]);

  const { getAllProducts, products } = useInventory();

  // Fetch all productions
  const fetchProductions = async () => {
    try {
      setLoading(true);
      const res = await axiosHandler.get("/production/all");
      setProductions(res?.data?.productions || []);
    } catch (e) {
      console.error("Error fetching productions", e);
      setProductions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all BOMs
  const fetchBoms = async () => {
    try {
      const res = await axiosHandler.get("/bom/all");
      setBoms(res?.data?.boms || []);
    } catch (e) {
      console.error("Error fetching BOMs", e);
      setBoms([]);
    }
  };

  

  useEffect(() => {
    getAllProducts();
    fetchBoms();
    fetchProductions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle BOM selection
  const handleBomSelect = async (bomId) => {
    if (!bomId) {
      setSelectedBomId("");
      setSelectedBom(null);
      setRawMaterials([]);
      setProcesses([]);
      return;
    }

    setSelectedBomId(bomId);
    
    try {
      // Fetch detailed BOM data to ensure all fields are populated
      const res = await axiosHandler.get(`/bom/${bomId}`);
      const bom = res?.data?.bom;
      
      if (!bom) {
        setSelectedBom(null);
        setRawMaterials([]);
        setProcesses([]);
        return;
      }

      setSelectedBom(bom);
      console.log("Selected BOM:", bom);
      console.log("Raw Materials:", bom.rawMaterials);

      // Get first compound from compoundingStandards or use top-level
      const compound =
        bom.compoundingStandards?.[0] ||
        {
          compound_code: bom.compound_code,
          compound_name: bom.compound_name,
          product_snapshot: bom.compound,
        };

      // Auto-fill Finished Goods
      setFinishedGood({
        compound_code: compound.compound_code || bom.compound_code || "",
        compound_name: compound.compound_name || bom.compound_name || "",
        est_qty: "",
        uom: compound.product_snapshot?.uom || bom.compound?.uom || "",
        prod_qty: "",
        remain_qty: "",
        category: compound.product_snapshot?.category || bom.compound?.category || "",
        total_cost: "",
      });

      // Auto-fill Raw Materials from BOM
      let rms = [];
      
      // Check if rawMaterials array exists and has data
      if (bom.rawMaterials && Array.isArray(bom.rawMaterials) && bom.rawMaterials.length > 0) {
        rms = bom.rawMaterials.map((rm) => {
          // Handle populated raw_material object
          const rawMaterialPopulated = rm.raw_material && typeof rm.raw_material === 'object' ? rm.raw_material : null;
          
          return {
            raw_material_id: rawMaterialPopulated?._id || rm.raw_material || null,
            raw_material_name: rm.raw_material_name || rawMaterialPopulated?.name || "",
            raw_material_code: rm.raw_material_code || rawMaterialPopulated?.product_id || "",
            // Use BOM weight as default estimated quantity
            est_qty: (rm.weight !== undefined && rm.weight !== null && rm.weight !== "")
              ? parseFloat(rm.weight) || 0
              : 0,
            uom: rm.uom || rawMaterialPopulated?.uom || rm.product_snapshot?.uom || "",
            used_qty: "",
            // Initialize remain equal to est by default
            remain_qty: (rm.weight !== undefined && rm.weight !== null && rm.weight !== "")
              ? parseFloat(rm.weight) || 0
              : 0,
            category: rm.category || rawMaterialPopulated?.category || rm.product_snapshot?.category || "",
            total_cost: "",
            weight: rm.weight || "",
            tolerance: rm.tolerance || "",
            code_no: rm.code_no || "",
          };
        });
      }
      
      // Fallback to single raw material if array is empty
      if (rms.length === 0 && (bom.raw_material || bom.raw_material_name)) {
        const rawMaterialPopulated = bom.raw_material && typeof bom.raw_material === 'object' ? bom.raw_material : null;
        
        rms.push({
          raw_material_id: rawMaterialPopulated?._id || bom.raw_material || null,
          raw_material_name: bom.raw_material_name || rawMaterialPopulated?.name || "",
          raw_material_code: bom.raw_material_code || rawMaterialPopulated?.product_id || "",
          // Use BOM single raw material weight as default estimated quantity
          est_qty: (bom.raw_material_weight !== undefined && bom.raw_material_weight !== null && bom.raw_material_weight !== "")
            ? parseFloat(bom.raw_material_weight) || 0
            : 0,
          uom: bom.raw_material_uom || rawMaterialPopulated?.uom || "",
          used_qty: "",
          // Initialize remain equal to est by default
          remain_qty: (bom.raw_material_weight !== undefined && bom.raw_material_weight !== null && bom.raw_material_weight !== "")
            ? parseFloat(bom.raw_material_weight) || 0
            : 0,
          category: bom.raw_material_category || rawMaterialPopulated?.category || "",
          total_cost: "",
          weight: bom.raw_material_weight || "",
          tolerance: bom.raw_material_tolerance || "",
          code_no: "",
        });
      }

      console.log("Processed Raw Materials:", rms);
      setRawMaterials(rms);

      // Auto-fill Processes from BOM
      const procList = (bom.processes || [])
        .map((proc, idx) => ({
          process_name: proc || bom[`process${idx + 1}`] || "",
          work_done: "",
          start: false,
          done: false,
          status: "pending",
        }))
        .filter((p) => p.process_name);

      // If processes array is empty, check process1-4
      if (!procList.length) {
        for (let i = 1; i <= 4; i++) {
          const procName = bom[`process${i}`];
          if (procName) {
            procList.push({
              process_name: procName,
              work_done: "",
              start: false,
              done: false,
              status: "pending",
            });
          }
        }
      }

      setProcesses(procList);
    } catch (error) {
      console.error("Error fetching BOM details:", error);
      setSelectedBom(null);
      setRawMaterials([]);
      setProcesses([]);
    }
  };

  // Handle Finished Goods field changes
  const handleFinishedGoodChange = (field, value) => {
    setFinishedGood((prev) => {
      const updated = { ...prev, [field]: value };
      // Calculate remain_qty
      if (field === "est_qty" || field === "prod_qty") {
        const est = parseFloat(field === "est_qty" ? value : updated.est_qty) || 0;
        const prod = parseFloat(field === "prod_qty" ? value : updated.prod_qty) || 0;
        updated.remain_qty = (est - prod).toFixed(2);
      }
      // Calculate total_cost = est_qty * price (price from Inventory product)
      if (field === "est_qty" || field === "prod_qty") {
        const est = parseFloat(updated.est_qty) || 0;
        // Try to find the finished good product by code or name
        const productMatch = (products || []).find(
          (p) => p?.product_id === updated.compound_code || p?.name === updated.compound_name
        );
        const unitPrice =
          (typeof productMatch?.updated_price === "number" ? productMatch.updated_price : undefined) ??
          (typeof productMatch?.latest_price === "number" ? productMatch.latest_price : undefined) ??
          (typeof productMatch?.price === "number" ? productMatch.price : 0);
        updated.total_cost = (est * (unitPrice || 0)).toFixed(2);
      }
      return updated;
    });

    // If compound estimated qty changes, scale each RM est_qty = weight * compound_est
    if (field === "est_qty") {
      const estMultiplier = parseFloat(value) || 0;
      setRawMaterials((prev) =>
        (prev || []).map((rm) => {
          const baseWeight = parseFloat(rm.weight) || 0;
          const nextEst = baseWeight * estMultiplier;
          const used = parseFloat(rm.used_qty) || 0;
          const productMatch = (products || []).find(
            (p) => p?._id === rm.raw_material_id || p?.product_id === rm.raw_material_code || p?.name === rm.raw_material_name
          );
          const unitPrice =
            (typeof productMatch?.updated_price === "number" ? productMatch.updated_price : undefined) ??
            (typeof productMatch?.latest_price === "number" ? productMatch.latest_price : undefined) ??
            (typeof productMatch?.price === "number" ? productMatch.price : 0);
          return {
            ...rm,
            est_qty: nextEst,
            remain_qty: (nextEst - used).toFixed(2),
            total_cost: (nextEst * (unitPrice || 0)).toFixed(2),
          };
        })
      );
    }
  };

  // Handle Raw Material changes
  const handleRawMaterialChange = (idx, field, value) => {
    setRawMaterials((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      // Calculate remain_qty for raw materials
      if (field === "est_qty" || field === "used_qty") {
        const est = parseFloat(field === "est_qty" ? value : next[idx].est_qty) || 0;
        const used = parseFloat(field === "used_qty" ? value : next[idx].used_qty) || 0;
        next[idx].remain_qty = (est - used).toFixed(2);
      }
      // Recalculate total_cost = est_qty * price when est or identity fields change
      if (field === "est_qty" || field === "raw_material_id" || field === "raw_material_code" || field === "raw_material_name") {
        const est = parseFloat(field === "est_qty" ? value : next[idx].est_qty) || 0;
        const productMatch = (products || []).find(
          (p) => p?._id === next[idx].raw_material_id || p?.product_id === next[idx].raw_material_code || p?.name === next[idx].raw_material_name
        );
        const unitPrice =
          (typeof productMatch?.updated_price === "number" ? productMatch.updated_price : undefined) ??
          (typeof productMatch?.latest_price === "number" ? productMatch.latest_price : undefined) ??
          (typeof productMatch?.price === "number" ? productMatch.price : 0);
        next[idx].total_cost = (est * (unitPrice || 0)).toFixed(2);
      }
      return next;
    });
  };

  // Handle Process changes
  const handleProcessChange = (idx, field, value) => {
    setProcesses((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      // Update status based on start/done
      if (field === "start" || field === "done") {
        next[idx].status = next[idx].done
          ? "completed"
          : next[idx].start
          ? "in_progress"
          : "pending";
      }
      return next;
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBomId) {
      toast.error("Please select a BOM");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        bom: selectedBomId,
        finished_goods: [
          {
            compound_code: finishedGood.compound_code,
            compound_name: finishedGood.compound_name,
            est_qty: parseFloat(finishedGood.est_qty) || 0,
            uom: finishedGood.uom,
            prod_qty: parseFloat(finishedGood.prod_qty) || 0,
            remain_qty: parseFloat(finishedGood.remain_qty) || 0,
            category: finishedGood.category,
            total_cost: parseFloat(finishedGood.total_cost) || 0,
          },
        ],
        raw_materials: rawMaterials.map((rm) => ({
          raw_material_id: rm.raw_material_id,
          raw_material_name: rm.raw_material_name,
          raw_material_code: rm.raw_material_code,
          est_qty: parseFloat(rm.est_qty) || 0,
          uom: rm.uom,
          used_qty: parseFloat(rm.used_qty) || 0,
          remain_qty: parseFloat(rm.remain_qty) || 0,
          category: rm.category,
          total_cost: parseFloat(rm.total_cost) || 0,
          weight: rm.weight || "",
          tolerance: rm.tolerance || "",
          code_no: rm.code_no || "",
        })),
        processes: processes.map((proc) => ({
          process_name: proc.process_name,
          work_done: parseFloat(proc.work_done) || 0,
          start: proc.start || false,
          done: proc.done || false,
        })),
      };

      let res;
      if (editMode && currentProductionId) {
        res = await axiosHandler.put("/production", { _id: currentProductionId, ...payload });
      } else {
        res = await axiosHandler.post("/production", payload);
      }
      if (res.data.success) {
        toast.success(editMode ? "Production updated successfully" : "Production created successfully");
        setShowModal(false);
        resetForm();
        fetchProductions();
      }
    } catch (error) {
      console.error("Error creating production", error);
      toast.error(error.response?.data?.message || (editMode ? "Failed to update production" : "Failed to create production"));
    } finally {
      setSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setSelectedBomId("");
    setSelectedBom(null);
    setEditMode(false);
    setCurrentProductionId("");
    setFinishedGood({
      compound_code: "",
      compound_name: "",
      est_qty: "",
      uom: "",
      prod_qty: "",
      remain_qty: "",
      category: "",
      total_cost: "",
    });
    setRawMaterials([]);
    setProcesses([]);
  };

  // Filter productions (show all, search applied)
  const filteredProductions = productions.filter((prod) => {
    const q = searchQuery.toLowerCase();
    const fg = prod.finished_goods?.[0];
    return (
      prod.production_id?.toLowerCase().includes(q) ||
      fg?.compound_code?.toLowerCase().includes(q) ||
      fg?.compound_name?.toLowerCase().includes(q) ||
      prod.bom?.compound_code?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Production Start</h1>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto"
          onClick={() => {
            setShowModal(true);
            resetForm();
          }}
        >
          Add Production
        </Button>
      </div>

      {/* Search & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
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

        <div className="flex items-center gap-4 text-gray-600">
          <RefreshCcw
            className="cursor-pointer hover:text-gray-800"
            onClick={fetchProductions}
          />
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full text-sm text-left min-w-[600px]">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-sky-500 whitespace-nowrap text-white uppercase text-xs tracking-wide">
              <th className="px-4 sm:px-6 py-3 font-medium">Compound Code</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Status</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Quantity</th>
              <th className="px-4 sm:px-6 py-3 font-medium">UOM</th>
              <th className="px-4 sm:px-6 py-3 font-medium text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  Loading productions...
                </td>
              </tr>
            ) : filteredProductions?.length > 0 ? (
              filteredProductions.map((prod, index) => {
                const fg = prod.finished_goods?.[0];
                return (
                  <tr
                    key={prod._id}
                    className={`border-t ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-4 sm:px-6 py-3">
                      {fg?.compound_code || prod.bom?.compound_code || prod.production_id}
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      {(() => {
                        const deriveStatus = (p) => {
                          const list = Array.isArray(p?.processes) ? p.processes : [];
                          if (!p?.status && list.length) {
                            const allDone = list.every((pr) => pr.done === true || pr.status === "completed");
                            const anyStarted = list.some((pr) => pr.start === true || pr.status === "in_progress");
                            return allDone ? "completed" : anyStarted ? "in_progress" : "pending";
                          }
                          return p?.status || "pending";
                        };
                        const statusVal = deriveStatus(prod);
                        const label = statusVal === "in_progress" ? "Work in progress" : statusVal;
                        const cls =
                          statusVal === "completed"
                            ? "bg-green-100 text-green-600"
                            : statusVal === "in_progress"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-gray-100 text-gray-600";
                        return (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls}`}>
                            {label}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-4 sm:px-6 py-3">{fg?.prod_qty || fg?.est_qty || 0}</td>
                    <td className="px-4 sm:px-6 py-3">{fg?.uom || "-"}</td>
                    <td className="px-4 sm:px-6 py-3 text-center">
                      <div className="flex justify-center space-x-3">
                        <Edit
                          className="h-4 w-4 text-blue-500 cursor-pointer"
                          onClick={async () => {
                            try {
                              const res = await axiosHandler.get(`/production/${prod._id}`);
                              const data = res?.data?.production;
                              if (!data) return;
                              setEditMode(true);
                              setCurrentProductionId(data._id);
                              setShowModal(true);
                              // Prefill BOM selection
                              const bomId = data?.bom?._id || data?.bom;
                              await handleBomSelect(bomId);
                              // Prefill FG
                              const fg = (data.finished_goods || [])[0] || {};
                              setFinishedGood({
                                compound_code: fg.compound_code || "",
                                compound_name: fg.compound_name || "",
                                est_qty: String(fg.est_qty ?? ""),
                                uom: fg.uom || "",
                                prod_qty: String(fg.prod_qty ?? ""),
                                remain_qty: String(fg.remain_qty ?? ""),
                                category: fg.category || "",
                                total_cost: String(fg.total_cost ?? ""),
                              });
                              // Prefill RMs
                              setRawMaterials(
                                (data.raw_materials || []).map((rm) => ({
                                  raw_material_id: rm.raw_material_id || null,
                                  raw_material_name: rm.raw_material_name || "",
                                  raw_material_code: rm.raw_material_code || "",
                                  est_qty: String(rm.est_qty ?? ""),
                                  uom: rm.uom || "",
                                  used_qty: String(rm.used_qty ?? ""),
                                  remain_qty: String(rm.remain_qty ?? ""),
                                  category: rm.category || "",
                                  total_cost: String(rm.total_cost ?? ""),
                                  weight: rm.weight || "",
                                  tolerance: rm.tolerance || "",
                                  code_no: rm.code_no || "",
                                }))
                              );
                              // Prefill processes
                              setProcesses(
                                (data.processes || []).map((p) => ({
                                  process_name: p.process_name || "",
                                  work_done: String(p.work_done ?? ""),
                                  start: !!p.start,
                                  done: !!p.done,
                                  status: p.status || (p.done ? "completed" : p.start ? "in_progress" : "pending"),
                                }))
                              );
                            } catch (e) {
                              console.error(e);
                              toast.error("Failed to load production details for edit");
                            }
                          }}
                        />
                        <Trash2
                          className="h-4 w-4 text-red-500 cursor-pointer"
                          onClick={async () => {
                            if (!confirm("Delete this production?")) return;
                            try {
                              await axiosHandler.delete("/production", { data: { id: prod._id } });
                              toast.success("Production deleted");
                              fetchProductions();
                            } catch (e) {
                              console.error(e);
                              toast.error("Failed to delete production");
                            }
                          }}
                        />
                        <Eye
                          className="h-4 w-4 text-gray-600 cursor-pointer"
                          onClick={async () => {
                            try {
                              const res = await axiosHandler.get(`/production/${prod._id}`);
                              setViewDetails(res?.data?.production || null);
                            } catch (e) {
                              console.error(e);
                              toast.error("Failed to load production details");
                            }
                          }}
                        />
                        {(() => {
                          const alreadySent = prod?.ready_for_qc === true;
                          const alreadyQCed = prod?.qc_done === true;
                          const isCompleted = prod?.status === 'completed';
                          if (!isCompleted) return null;
                          if (alreadyQCed) return (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">QC Done</span>
                          );
                          if (alreadySent) return (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600">Waiting for QC</span>
                          );
                          return (
                            <button
                              className="px-3 py-1 rounded-md bg-indigo-100 text-indigo-600 hover:bg-indigo-200 text-xs"
                              onClick={async () => {
                                try {
                                  await axiosHandler.patch(`/production/${prod._id}/ready-for-qc`);
                                  toast.success('Sent to Quality Check');
                                  fetchProductions();
                                } catch (e) {
                                  console.error(e);
                                  toast.error('Failed to send to Quality Check');
                                }
                              }}
                            >
                              Send to Quality Check
                            </button>
                          );
                        })()}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6 text-gray-500">
                  No Production found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Production Modal */}
      <AnimatePresence>
        {showModal && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <Motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative bg-white rounded-2xl shadow-lg w-[95%] sm:w-[90%] md:w-[85%] lg:max-w-6xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8"
            >
              <button
                onClick={() => { resetForm(); setShowModal(false); }}
                className="absolute top-3 right-4 text-2xl text-gray-600 hover:text-red-500 transition"
              >
                ✕
              </button>

              <button
                onClick={() => { resetForm(); setShowModal(false); }}
                className="text-2xl mb-4 hover:text-blue-500 transition"
              >
                ←
              </button>

              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-6 sm:mb-8">
                Add New Production
              </h1>

              <form onSubmit={handleSubmit}>
                {/* ---------- Finished Goods Section ---------- */}
                <section className="mb-10">
                  <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Compound Details
                    </h2>
                  </div>

                  <div className="hidden sm:grid grid-cols-7 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-md overflow-hidden">
                    {[
                      "Compound Details",
                      "EST. QTY",
                      "UOM",
                      "PROD. QTY",
                      "Remain QTY",
                      "Category",
                      "Total Cost",
                    ].map((head) => (
                      <div key={head} className="p-2 text-center truncate">
                        {head}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 mt-3">
                    <select
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-blue-400"
                      value={selectedBomId}
                      onChange={(e) => handleBomSelect(e.target.value)}
                      required
                    >
                      <option value="">Select Compound</option>
                      {boms.map((b) => (
                        <option key={b._id} value={b._id}>
                          {b.compound_name || "Unnamed"}
                          {b.compound_code ? ` (${b.compound_code})` : ""}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Enter Quantity"
                      value={finishedGood.est_qty}
                      onChange={(e) => handleFinishedGoodChange("est_qty", e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-blue-400"
                    />
                    <input
                      type="text"
                      placeholder="Enter UOM"
                      value={finishedGood.uom}
                      readOnly
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                    />
                    <input
                      type="number"
                      placeholder="Enter Quantity"
                      value={finishedGood.prod_qty}
                      onChange={(e) => handleFinishedGoodChange("prod_qty", e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-blue-400"
                    />
                    <input
                      type="number"
                      placeholder="Remain QTY"
                      value={finishedGood.remain_qty}
                      readOnly
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                    />
                    <input
                      type="text"
                      placeholder="Enter Category"
                      value={finishedGood.category}
                      readOnly
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                    />
                    <input
                      type="number"
                      placeholder="Total Cost"
                      value={finishedGood.total_cost}
                      readOnly
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                    />
                  </div>
                </section>

                {/* ---------- Raw Materials Section ---------- */}
                <section className="mb-10">
                  <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Raw Materials
                    </h2>
                  </div>

                  {rawMaterials.length > 0 ? (
                    <>
                      <div className="hidden sm:grid grid-cols-7 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-md overflow-hidden">
                        {[
                          "Finished Goods",
                          "EST. QTY",
                          "UOM",
                          "Used QTY",
                          "Remain QTY",
                          "Category",
                          "Total Cost",
                        ].map((head) => (
                          <div key={head} className="p-2 text-center truncate">
                            {head}
                          </div>
                        ))}
                      </div>

                      {rawMaterials.map((rm, idx) => (
                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-7 gap-3 mt-3">
                          <input
                            value={`${rm.raw_material_name || ""}${rm.raw_material_code ? ` (${rm.raw_material_code})` : ""}`}
                            readOnly
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                          />
                          <input
                            type="number"
                            placeholder="EST. QTY"
                            value={rm.est_qty}
                            onChange={(e) => handleRawMaterialChange(idx, "est_qty", e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-blue-400"
                          />
                          <input
                            type="text"
                            placeholder="UOM"
                            value={rm.uom}
                            readOnly
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                          />
                          <input
                            type="number"
                            placeholder="Used QTY"
                            value={rm.used_qty}
                            onChange={(e) => handleRawMaterialChange(idx, "used_qty", e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-blue-400"
                          />
                          <input
                            type="number"
                            placeholder="Remain QTY"
                            value={rm.remain_qty}
                            readOnly
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                          />
                          <input
                            type="text"
                            placeholder="Category"
                            value={rm.category}
                            readOnly
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                          />
                          <input
                            type="number"
                            placeholder="Total Cost"
                            value={rm.total_cost}
                            onChange={(e) => handleRawMaterialChange(idx, "total_cost", e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-blue-400"
                          />
                        </div>
                      ))}
                    </>
                  ) : selectedBomId ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No raw materials found for the selected BOM. Please check if the BOM has raw materials configured.
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Please select a BOM to see raw materials.
                    </div>
                  )}
                </section>

                {/* ---------- Processes Section ---------- */}
                <section className="mb-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {processes.map((proc, idx) => (
                      <div
                        key={idx}
                        className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold text-gray-800">
                            Process {idx + 1}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              proc.status === "completed"
                                ? "text-green-600 bg-green-100"
                                : proc.status === "in_progress"
                                ? "text-yellow-600 bg-yellow-100"
                                : "text-gray-600 bg-gray-100"
                            }`}
                          >
                            {proc.status}
                          </span>
                        </div>

                        <input
                          type="text"
                          placeholder="Process Name"
                          value={proc.process_name}
                          readOnly
                          className="border border-gray-300 rounded-md px-3 py-2 w-full mb-3 text-sm bg-gray-50"
                        />

                        <label className="text-sm text-gray-700 font-medium mb-1 block">
                          Work Done
                        </label>
                        <input
                          type="number"
                          placeholder="1000"
                          value={proc.work_done}
                          onChange={(e) => handleProcessChange(idx, "work_done", e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:ring-1 focus:ring-blue-400 mb-2"
                        />

                        <div className="flex gap-4 items-center mt-2 flex-wrap">
                          <label className="flex items-center gap-1 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              className="accent-blue-600"
                              checked={proc.start}
                              onChange={(e) => handleProcessChange(idx, "start", e.target.checked)}
                            />
                            Start
                          </label>
                          <label className="flex items-center gap-1 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              className="accent-blue-600"
                              checked={proc.done}
                              onChange={(e) => handleProcessChange(idx, "done", e.target.checked)}
                            />
                            Done
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="flex justify-center mt-10 mb-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-8 py-2 shadow-md font-medium transition disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </button>
                </div>
              </form>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {viewDetails && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <Motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative bg-white rounded-2xl shadow-lg w-[95%] sm:w-[90%] md:w-[80%] lg:max-w-4xl max-h-[85vh] overflow-y-auto p-5"
            >
              <button
                onClick={() => setViewDetails(null)}
                className="absolute top-3 right-4 text-2xl text-gray-600 hover:text-red-500 transition"
              >
                ✕
              </button>
              <h2 className="text-xl font-semibold mb-4">Production Details</h2>
              <div className="space-y-3 text-sm">
                <div><span className="font-medium">Production ID:</span> {viewDetails?.production_id || "-"}</div>
                <div><span className="font-medium">BOM:</span> {viewDetails?.bom?.compound_name || viewDetails?.bom?.compound_code || "-"}</div>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Finished Goods</h3>
                  {(viewDetails?.finished_goods || []).map((fg, i) => (
                    <div key={i} className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 border rounded-lg mb-2">
                      <div><span className="font-medium">Compound:</span> {fg.compound_name || fg.compound_code}</div>
                      <div><span className="font-medium">EST:</span> {fg.est_qty}</div>
                      <div><span className="font-medium">PROD:</span> {fg.prod_qty}</div>
                      <div><span className="font-medium">Remain:</span> {fg.remain_qty}</div>
                      <div><span className="font-medium">UOM:</span> {fg.uom}</div>
                      <div><span className="font-medium">Category:</span> {fg.category}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Raw Materials</h3>
                  {(viewDetails?.raw_materials || []).map((rm, i) => (
                    <div key={i} className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 border rounded-lg mb-2">
                      <div><span className="font-medium">Item:</span> {rm.raw_material_name || rm.raw_material_code}</div>
                      <div><span className="font-medium">EST:</span> {rm.est_qty}</div>
                      <div><span className="font-medium">Used:</span> {rm.used_qty}</div>
                      <div><span className="font-medium">Remain:</span> {rm.remain_qty}</div>
                      <div><span className="font-medium">UOM:</span> {rm.uom}</div>
                      <div><span className="font-medium">Category:</span> {rm.category}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Processes</h3>
                  {(viewDetails?.processes || []).map((p, i) => (
                    <div key={i} className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 border rounded-lg mb-2">
                      <div><span className="font-medium">Process:</span> {p.process_name}</div>
                      <div><span className="font-medium">Work Done:</span> {p.work_done}</div>
                      <div><span className="font-medium">Status:</span> {p.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Production_Start;
