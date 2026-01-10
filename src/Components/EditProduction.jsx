import React, { useEffect, useState } from "react";
import axiosHandler from "@/config/axiosconfig";
import { toast } from "react-toastify";

const EditProduction = ({ productionId, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [productionData, setProductionData] = useState(null);
  const [bomType, setBomType] = useState("");
  const [compoundDetails, setCompoundDetails] = useState([]);
  
  // Form fields
  const [partName, setPartName] = useState({
    compound_code: "",
    compound_name: "",
    est_qty: "",
    uom: "",
    prod_qty: "",
    remain_qty: "",
    category: "",
    comment: "",
    total_cost: "",
  });
  const [rawMaterials, setRawMaterials] = useState([]);
  const [accelerators, setAccelerators] = useState([]);
  const [processes, setProcesses] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Load production data
  useEffect(() => {
    if (!productionId) return;
    
    const loadProductionData = async () => {
      try {
        setLoading(true);
        const res = await axiosHandler.get(`/production/${productionId}`);
        const data = res?.data?.production;
        
        if (!data) {
          toast.error("Production not found");
          onClose();
          return;
        }

        setProductionData(data);
        
        // Get BOM type from production's BOM
        const bomData = data?.bom;
        const detectedBomType = bomData?.bom_type || "";
        setBomType(detectedBomType);

        // Load compound details for part-name BOMs
        if (detectedBomType === "part-name" && bomData) {
          if (bomData.compounds && Array.isArray(bomData.compounds) && bomData.compounds.length > 0) {
            const compounds = bomData.compounds.map((comp) => {
              const compPopulated = comp.compound_id && typeof comp.compound_id === 'object' ? comp.compound_id : null;
              return {
                compound_id: compPopulated?._id || comp.compound_id || "",
                compound_name: comp.compound_name || compPopulated?.name || "",
                compound_code: comp.compound_code || compPopulated?.product_id || "",
                hardness: comp.hardness || "",
                weight: comp.weight || "",
              };
            });
            setCompoundDetails(compounds);
          } else {
            // Fallback to single compound fields from BOM
            const singleCompound = [];
            if (bomData.compound_name || (bomData.compound_codes && bomData.compound_codes.length > 0)) {
              singleCompound.push({
                compound_id: "",
                compound_name: bomData.compound_name || "",
                compound_code: Array.isArray(bomData.compound_codes) && bomData.compound_codes.length > 0 ? bomData.compound_codes[0] : "",
                hardness: Array.isArray(bomData.hardnesses) && bomData.hardnesses.length > 0 ? bomData.hardnesses[0] : "",
                weight: bomData.compound_weight || "",
              });
            }
            setCompoundDetails(singleCompound);
          }
        } else {
          setCompoundDetails([]);
        }

        // Prefill Part Name from production data (exactly as saved)
        const pn = (data.part_names || [])[0] || {};
        setPartName({
          compound_code: pn.compound_code || "",
          compound_name: pn.compound_name || "",
          est_qty: String(pn.est_qty ?? ""),
          uom: pn.uom || "",
          prod_qty: String(pn.prod_qty ?? ""),
          remain_qty: String(pn.remain_qty ?? ""),
          category: pn.category || "",
          comment: pn.comment || "",
          total_cost: String(pn.total_cost ?? ""),
        });

        // Prefill Raw Materials from production data (exactly as saved)
        const currentEstQtyForRM = parseFloat(pn.est_qty) || 1;
        setRawMaterials(
          (data.raw_materials || []).map((rm) => {
            const estQty = parseFloat(rm.est_qty) || 0;
            const baseQty = currentEstQtyForRM ? estQty / currentEstQtyForRM : 0;
            return {
              raw_material_id: rm.raw_material_id || null,
              raw_material_name: rm.raw_material_name || "",
              raw_material_code: rm.raw_material_code || "",
              est_qty: String(rm.est_qty ?? ""),
              base_qty: baseQty,
              uom: rm.uom || "",
              used_qty: String(rm.used_qty ?? ""),
              remain_qty: String(rm.remain_qty ?? ""),
              category: rm.category || "",
              total_cost: String(rm.total_cost ?? ""),
              weight: rm.weight || "",
              tolerance: rm.tolerance || "",
              code_no: rm.code_no || "",
              comment: rm.comment || "",
            };
          })
        );

        // Prefill Accelerators from production data (exactly as saved)
        const currentEstQty = parseFloat(pn.est_qty) || 1;
        setAccelerators(
          (data.accelerators || []).map((acc) => {
            const estQty = parseFloat(acc.est_qty || acc.quantity) || 0;
            const usedQty = parseFloat(acc.used_qty) || 0;
            const baseQty = currentEstQty ? estQty / currentEstQty : estQty;
            return {
              name: acc.name || "",
              tolerance: acc.tolerance || "",
              quantity: acc.quantity || "",
              est_qty: String(estQty),
              base_qty: baseQty,
              used_qty: String(usedQty),
              remain_qty: String((estQty - usedQty).toFixed(2)),
              comment: acc.comment || "",
            };
          })
        );

        // Prefill Processes from production data
        setProcesses(
          (data.processes || []).map((p) => ({
            process_name: p.process_name || "",
            work_done: String(p.work_done ?? ""),
            start: !!p.start,
            done: !!p.done,
            status:
              p.status ||
              (p.done ? "completed" : p.start ? "in_progress" : "pending"),
          }))
        );

      } catch (e) {
        console.error("Error loading production data:", e);
        toast.error("Failed to load production details");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    loadProductionData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productionId]);

  // Handle form field changes
  const handlePartNameChange = (field, value) => {
    setPartName((prev) => ({ ...prev, [field]: value }));
    
    if (field === "est_qty" || field === "prod_qty") {
      const estQty = parseFloat(field === "est_qty" ? value : partName.est_qty) || 0;
      const prodQty = parseFloat(field === "prod_qty" ? value : partName.prod_qty) || 0;
      const remainQty = estQty - prodQty;
      setPartName((prev) => ({ ...prev, remain_qty: String(remainQty) }));
    }
  };

  const handleRawMaterialChange = (index, field, value) => {
    setRawMaterials((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      if (field === "est_qty" || field === "used_qty") {
        const estQty = parseFloat(field === "est_qty" ? value : updated[index].est_qty) || 0;
        const usedQty = parseFloat(field === "used_qty" ? value : updated[index].used_qty) || 0;
        updated[index].remain_qty = String(estQty - usedQty);
      }
      
      return updated;
    });
  };

  const handleAcceleratorChange = (index, field, value) => {
    setAccelerators((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      if (field === "est_qty" || field === "used_qty") {
        const estQty = parseFloat(field === "est_qty" ? value : updated[index].est_qty) || 0;
        const usedQty = parseFloat(field === "used_qty" ? value : updated[index].used_qty) || 0;
        updated[index].remain_qty = String((estQty - usedQty).toFixed(2));
      }
      
      return updated;
    });
  };

  const handleProcessChange = (index, field, value) => {
    setProcesses((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      if (field === "start" || field === "done") {
        updated[index].status = value
          ? "in_progress"
          : updated[index].done
          ? "completed"
          : "pending";
      }
      
      return updated;
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      const payload = {
        _id: productionId,
        part_names: [partName],
        raw_materials: rawMaterials.map((rm) => ({
          ...rm,
          est_qty: parseFloat(rm.est_qty) || 0,
          used_qty: parseFloat(rm.used_qty) || 0,
          remain_qty: parseFloat(rm.remain_qty) || 0,
        })),
        accelerators: accelerators.map((acc) => ({
          ...acc,
          est_qty: parseFloat(acc.est_qty) || 0,
          used_qty: parseFloat(acc.used_qty) || 0,
          remain_qty: parseFloat(acc.remain_qty) || 0,
        })),
        processes: processes.map((p) => ({
          ...p,
          start: !!p.start,
          done: !!p.done,
        })),
      };

      await axiosHandler.put("/production", payload);
      toast.success("Production updated successfully");
      if (onUpdate) onUpdate();
      onClose();
    } catch (e) {
      console.error("Error updating production:", e);
      toast.error(e?.response?.data?.message || "Failed to update production");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-lg p-6">
          <p>Loading production data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm overflow-y-auto py-8">
      <div className="relative bg-white rounded-2xl shadow-lg w-[95%] sm:w-[90%] md:w-[85%] lg:max-w-6xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 md:p-8 my-8">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-2xl text-gray-600 hover:text-red-500 transition"
        >
          ✕
        </button>

        <button
          onClick={onClose}
          className="text-2xl mb-4 hover:text-blue-500 transition"
        >
          ←
        </button>

        <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-5">
          Edit Production
        </h1>

        <form onSubmit={handleSubmit}>
          {/* Compound Details Section (for compound BOMs) */}
          {bomType === "compound" && (
            <section className="mb-10">
              <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Compound Details
                </h2>
              </div>

              <div className="hidden sm:grid grid-cols-7 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-md overflow-hidden">
                {[
                  "Compound Name",
                  "EST. QTY",
                  "UOM",
                  "PROD. QTY",
                  "Remain QTY",
                  "Category",
                  "Comment",
                ].map((head) => (
                  <div key={head} className="p-2 text-center truncate">
                    {head}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 mt-3">
                <input
                  type="text"
                  placeholder="Compound Name"
                  value={partName.compound_name || ""}
                  readOnly
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                />
                <input
                  type="number"
                  placeholder="Enter Quantity"
                  value={partName.est_qty}
                  onChange={(e) => handlePartNameChange("est_qty", e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-blue-400"
                />
                <input
                  type="text"
                  placeholder="Enter UOM"
                  value={partName.uom}
                  readOnly
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                />
                <input
                  type="number"
                  placeholder="Enter Quantity"
                  value={partName.prod_qty}
                  onChange={(e) => handlePartNameChange("prod_qty", e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-blue-400"
                />
                <input
                  type="number"
                  placeholder="Remain QTY"
                  value={partName.remain_qty}
                  readOnly
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                />
                <input
                  type="text"
                  placeholder="Enter Category"
                  value={partName.category}
                  readOnly
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                />
                <input
                  type="text"
                  placeholder="Comment"
                  value={partName.comment}
                  onChange={(e) => handlePartNameChange("comment", e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                />
              </div>
            </section>
          )}

          {/* Part Details Section (for part-name BOMs) */}
          {bomType === "part-name" && (
            <>
              <section className="mb-10">
                <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Part Details
                  </h2>
                </div>

                <div className="hidden sm:grid grid-cols-7 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-md overflow-hidden">
                  {[
                    "Part Name",
                    "EST. QTY",
                    "UOM",
                    "PROD. QTY",
                    "Remain QTY",
                    "Category",
                    "Comment",
                  ].map((head) => (
                    <div key={head} className="p-2 text-center truncate">
                      {head}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 mt-3">
                  <input
                    type="text"
                    placeholder="Part Name"
                    value={partName.compound_name || ""}
                    readOnly
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                  />
                  <input
                    type="number"
                    placeholder="Enter Quantity"
                    value={partName.est_qty}
                    onChange={(e) => handlePartNameChange("est_qty", e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-blue-400"
                  />
                  <input
                    type="text"
                    placeholder="Enter UOM"
                    value={partName.uom}
                    readOnly
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                  />
                  <input
                    type="number"
                    placeholder="Enter Quantity"
                    value={partName.prod_qty}
                    onChange={(e) => handlePartNameChange("prod_qty", e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-blue-400"
                  />
                  <input
                    type="number"
                    placeholder="Remain QTY"
                    value={partName.remain_qty}
                    readOnly
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                  />
                  <input
                    type="text"
                    placeholder="Enter Category"
                    value={partName.category}
                    readOnly
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                  />
                  <input
                    type="text"
                    placeholder="Comment"
                    value={partName.comment}
                    onChange={(e) => handlePartNameChange("comment", e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                  />
                </div>
              </section>

              {/* Compound Details Section (for part-name BOMs) */}
              {(compoundDetails.length > 0 || (compoundDetails.length === 0 && bomType === "part-name")) && (
                <section className="mb-10">
                  <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Compound Details
                    </h2>
                  </div>

                  {compoundDetails.length > 0 ? (
                    <>
                      <div className="hidden sm:grid grid-cols-5 bg-purple-600 text-white text-xs sm:text-sm font-medium rounded-md overflow-hidden">
                        {[
                          "Compound Name",
                          "Compound Code",
                          "Hardness",
                          "Weight",
                          "Details",
                        ].map((head) => (
                          <div key={head} className="p-2 text-center truncate">
                            {head}
                          </div>
                        ))}
                      </div>

                      {compoundDetails.map((comp, idx) => (
                        <div
                          key={idx}
                          className="grid grid-cols-1 sm:grid-cols-5 gap-3 mt-3"
                        >
                          <input
                            type="text"
                            placeholder="Compound Name"
                            value={comp.compound_name || ""}
                            readOnly
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                          />
                          <input
                            type="text"
                            placeholder="Compound Code"
                            value={comp.compound_code || ""}
                            readOnly
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                          />
                          <input
                            type="text"
                            placeholder="Hardness"
                            value={comp.hardness || ""}
                            readOnly
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                          />
                          <input
                            type="text"
                            placeholder="Weight"
                            value={comp.weight || ""}
                            readOnly
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                          />
                          <div className="flex items-center justify-center text-sm text-gray-600">
                            {comp.compound_id ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                Linked Product
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                Manual Entry
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No compound details available
                    </div>
                  )}
                </section>
              )}
            </>
          )}

          {/* Raw Materials Section */}
          <section className="mb-10">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Raw Materials
              </h2>
            </div>

            {rawMaterials.length > 0 ? (
              <>
                <div className="hidden sm:grid grid-cols-8 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-md overflow-hidden">
                  {[
                    "Part Name",
                    "EST. QTY",
                    "UOM",
                    "Used QTY",
                    "Remain QTY",
                    "Category",
                    "Weight",
                    "Comment",
                  ].map((head) => (
                    <div key={head} className="p-2 text-center truncate">
                      {head}
                    </div>
                  ))}
                </div>

                {rawMaterials.map((rm, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-8 gap-3 mt-3"
                  >
                    <input
                      type="text"
                      placeholder="Part Name"
                      value={rm.raw_material_name || ""}
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
                      value={rm.uom || ""}
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
                      value={rm.category || ""}
                      readOnly
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                    />
                    <input
                      type="text"
                      placeholder="Weight"
                      value={rm.weight || ""}
                      readOnly
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                    />
                    <input
                      type="text"
                      placeholder="Comment"
                      value={rm.comment || ""}
                      onChange={(e) => handleRawMaterialChange(idx, "comment", e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                    />
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                No raw materials
              </div>
            )}
          </section>

          {/* Accelerators Section */}
          <section className="mb-10">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
              <h2 className="text-lg font-semibold text-gray-900">
                Accelerators
              </h2>
            </div>

            {accelerators.length > 0 ? (
              <>
                <div className="hidden sm:grid grid-cols-7 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-md overflow-hidden">
                  {[
                    "Name",
                    "Tolerance",
                    "EST. QTY",
                    "Used QTY",
                    "Remain QTY",
                    "Quantity",
                    "Comment",
                  ].map((head) => (
                    <div key={head} className="p-2 text-center truncate">
                      {head}
                    </div>
                  ))}
                </div>

                {accelerators.map((acc, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-7 gap-3 mt-3"
                  >
                    <input
                      type="text"
                      placeholder="Name"
                      value={acc.name || ""}
                      readOnly
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                    />
                    <input
                      type="text"
                      placeholder="Tolerance"
                      value={acc.tolerance || ""}
                      readOnly
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                    />
                    <input
                      type="number"
                      placeholder="EST. QTY"
                      value={acc.est_qty}
                      onChange={(e) => handleAcceleratorChange(idx, "est_qty", e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-blue-400"
                    />
                    <input
                      type="number"
                      placeholder="Used QTY"
                      value={acc.used_qty}
                      onChange={(e) => handleAcceleratorChange(idx, "used_qty", e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-blue-400"
                    />
                    <input
                      type="number"
                      placeholder="Remain QTY"
                      value={acc.remain_qty}
                      readOnly
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                    />
                    <input
                      type="text"
                      placeholder="Quantity"
                      value={acc.quantity || ""}
                      readOnly
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                    />
                    <input
                      type="text"
                      placeholder="Comment"
                      value={acc.comment || ""}
                      onChange={(e) => handleAcceleratorChange(idx, "comment", e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                    />
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                No accelerators
              </div>
            )}
          </section>

          {/* Processes Section */}
          <section className="mb-10">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Processes</h2>
            </div>

            {processes.length > 0 ? (
              <>
                <div className="hidden sm:grid grid-cols-5 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-md overflow-hidden">
                  {["Process Name", "Work Done", "Start", "Done", "Status"].map((head) => (
                    <div key={head} className="p-2 text-center truncate">
                      {head}
                    </div>
                  ))}
                </div>

                {processes.map((proc, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-5 gap-3 mt-3"
                  >
                    <input
                      type="text"
                      placeholder="Process Name"
                      value={proc.process_name || ""}
                      readOnly
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                    />
                    <input
                      type="text"
                      placeholder="Work Done"
                      value={proc.work_done || ""}
                      onChange={(e) => handleProcessChange(idx, "work_done", e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                    />
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={proc.start || false}
                        onChange={(e) => handleProcessChange(idx, "start", e.target.checked)}
                        className="w-5 h-5"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={proc.done || false}
                        onChange={(e) => handleProcessChange(idx, "done", e.target.checked)}
                        className="w-5 h-5"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Status"
                      value={proc.status || ""}
                      readOnly
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                    />
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-4 text-gray-500 text-sm">
                No processes
              </div>
            )}
          </section>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Updating..." : "Update Production"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduction;
