import React, { useEffect, useState, useRef } from "react";
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
import Pagination from "@/Components/Pagination/Pagination";
import EditProduction from "@/Components/EditProduction";

const Production_Start = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProductionId, setCurrentProductionId] = useState("");
  const [viewDetails, setViewDetails] = useState(null);
  const [bomTypeFilter, setBomTypeFilter] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProductionId, setEditingProductionId] = useState("");


  // BOM and form data
  const [boms, setBoms] = useState([]);
  const [selectedBomId, setSelectedBomId] = useState("");
  const [_selectedBom, setSelectedBom] = useState(null);
  const [page, setPage] = useState(1)
  // Searchable BOM selector state
  const [bomSearch, setBomSearch] = useState("");
  const [showBomResults, setShowBomResults] = useState(false);
  const [bomType, setBomType] = useState("");
  // Part Names list for dropdown
  const [partNamesList, setPartNamesList] = useState([]);
  const [selectedPartName, setSelectedPartName] = useState("");
  const [partNameSearch, setPartNameSearch] = useState("");
  const [showPartNameResults, setShowPartNameResults] = useState(false);
  const partNameDropdownRef = useRef(null);
  // Part Name data
  const [partName, setPartName] = useState({
    compound_code: "",
    compound_name: "",
    est_qty: "",
    uom: "",
    prod_qty: "",
    remain_qty: "",
    category: "",
    comment: "",
  });

  // Raw Materials data
  const [rawMaterials, setRawMaterials] = useState([]);

  // Accelerators data
  const [accelerators, setAccelerators] = useState([]);

  // Processes data
  const [processes, setProcesses] = useState([]);

  // Compound Details data (for part-name BOMs)
  const [compoundDetails, setCompoundDetails] = useState([]);

  const { getAllProducts, products } = useInventory();

  // Fetch all productions
  const fetchProductions = async () => {
    try {
      setLoading(true);
      const res = await axiosHandler.get(`/production/all?page=${page}&limit=10`);
      setProductions(res?.data?.productions || []);
    } catch (e) {
      console.error("Error fetching productions", e);
      setProductions([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all BOMs
  const fetchBoms = async (typeFilter = "") => {
    try {
      const url = typeFilter 
        ? `/bom/all?bom_type=${typeFilter}` 
        : `/bom/all`;
      const res = await axiosHandler.get(url);
      setBoms(res?.data?.boms || []);
    } catch (e) {
      console.error("Error fetching BOMs", e);
      setBoms([]);
    }
  };

  // Fetch all part names from BOM table
  const fetchPartNames = async () => {
    try {
      const res = await axiosHandler.get("/bom/part-names");
      setPartNamesList(res?.data?.partNames || []);
    } catch (e) {
      console.error("Error fetching part names", e);
      setPartNamesList([]);
      toast.error("Failed to fetch part names");
    }
  };

  // Handle part name selection and auto-fill form
  const handlePartNameSelect = async (partNameValue) => {
    if (!partNameValue) {
      setSelectedPartName("");
      setPartNameSearch("");
      setSelectedBomId("");
      setSelectedBom(null);
      setRawMaterials([]);
      setAccelerators([]);
      setProcesses([]);
      setPartName({
        compound_code: "",
        compound_name: "",
        est_qty: "",
        uom: "",
        prod_qty: "",
        remain_qty: "",
        category: "",
        comment: "",
      });
      return;
    }

    setSelectedPartName(partNameValue);
    setPartNameSearch(partNameValue);
    setShowPartNameResults(false);

    try {
      // Fetch BOM details by part name
      const res = await axiosHandler.get(`/bom/by-part-name?part_name=${encodeURIComponent(partNameValue)}`);
      const { bom, partDetail } = res.data;

      if (!bom) {
        toast.error("BOM not found for this part name");
        return;
      }

      setSelectedBomId(bom._id);
      setSelectedBom(bom);

      // Auto-fill Part Name fields
      const partNameFromDetail = partDetail?.product_snapshot?.name || 
        (partDetail?.part_name_id_name ? 
          (partDetail.part_name_id_name.includes("-") ? 
            partDetail.part_name_id_name.split("-").slice(1).join("-") : 
            partDetail.part_name_id_name) : 
          partNameValue);
      
      // Get first quantity from part detail
      const firstEstQty = partDetail && Array.isArray(partDetail.quantities) && partDetail.quantities.length > 0
        ? String(partDetail.quantities[0])
        : "";

      // Get UOM and category from product snapshot or BOM
      const productSnap = partDetail?.product_snapshot || null;
      const resolvedUom = productSnap?.uom || bom.compound_weight ? "Kg" : "";
      const resolvedCategory = productSnap?.category || "";

      // Get compound code
      const firstCode = Array.isArray(bom.compound_codes) && bom.compound_codes.length > 0 
        ? bom.compound_codes[0] 
        : "";

      setPartName({
        compound_code: firstCode,
        compound_name: partNameFromDetail,
        est_qty: firstEstQty,
        uom: resolvedUom,
        prod_qty: "",
        remain_qty: firstEstQty,
        category: resolvedCategory,
        comment: "",
      });

      // Auto-fill Raw Materials from BOM
      let rms = [];
      if (bom.raw_materials && Array.isArray(bom.raw_materials) && bom.raw_materials.length > 0) {
        rms = bom.raw_materials.map((rm) => {
          const rawPop = rm.raw_material_id && typeof rm.raw_material_id === 'object' ? rm.raw_material_id : null;
          const snap = rm.product_snapshot || null;
          const firstQtyStr = Array.isArray(rm.quantities) && rm.quantities.length > 0 ? String(rm.quantities[0]) : "0";
          const firstQtyNum = parseFloat(firstQtyStr) || 0;
          const fgBaseForRM = parseFloat(firstEstQty) || 1;
          const perUnitBase = fgBaseForRM ? firstQtyNum / fgBaseForRM : 0;
          const initialEst = firstQtyStr;
          return {
            raw_material_id: rawPop?._id || rm.raw_material_id || null,
            raw_material_name: rm.raw_material_name || rawPop?.name || snap?.name || "",
            raw_material_code: rawPop?.product_id || snap?.product_id || "",
            est_qty: initialEst,
            base_qty: perUnitBase,
            uom: rawPop?.uom || snap?.uom || "",
            used_qty: "",
            remain_qty: initialEst,
            category: rawPop?.category || snap?.category || "",
            comment: "",
            weight: "",
            tolerance: (Array.isArray(rm.tolerances) && rm.tolerances[0]) || "",
            code_no: "",
          };
        });
      }
      setRawMaterials(rms);

      // Auto-fill Accelerators from BOM
      const accs = Array.isArray(bom.accelerators) && bom.accelerators.length > 0
        ? bom.accelerators.map((acc) => {
          const accQtyStr = acc.quantity || "0";
          const accQtyNum = parseFloat(accQtyStr) || 0;
          const fgBaseForAcc = parseFloat(firstEstQty) || 1;
          const perUnitBase = fgBaseForAcc ? accQtyNum / fgBaseForAcc : 0;
          const initialEst = accQtyStr;
          return {
            name: acc.name || "",
            tolerance: acc.tolerance || "",
            quantity: acc.quantity || "",
            est_qty: initialEst,
            base_qty: perUnitBase,
            used_qty: "",
            remain_qty: initialEst,
            comment: acc.comment || "",
          };
        })
        : [];
      setAccelerators(accs);

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

      // Extract Compound Details from BOM
      if (bom.compounds && Array.isArray(bom.compounds) && bom.compounds.length > 0) {
        const compounds = bom.compounds.map((comp) => {
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
        // If no compounds array, check for single compound fields
        const singleCompound = [];
        if (bom.compound_name || bom.compound_codes?.length > 0) {
          singleCompound.push({
            compound_id: "",
            compound_name: bom.compound_name || "",
            compound_code: Array.isArray(bom.compound_codes) && bom.compound_codes.length > 0 ? bom.compound_codes[0] : "",
            hardness: Array.isArray(bom.hardnesses) && bom.hardnesses.length > 0 ? bom.hardnesses[0] : "",
            weight: bom.compound_weight || "",
          });
        }
        setCompoundDetails(singleCompound);
      }
    } catch (error) {
      console.error("Error fetching BOM by part name:", error);
      toast.error(error.response?.data?.message || "Failed to fetch BOM details for this part name");
      setCompoundDetails([]);
    }
  };



  useEffect(() => {
    getAllProducts();
    fetchBoms();
    fetchProductions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Fetch BOMs when bomType filter changes
  useEffect(() => {
    if (bomType) {
      fetchBoms(bomType);
      // Clear selected BOM when filter changes
      setSelectedBomId("");
      setSelectedBom(null);
      setBomSearch("");
      setShowBomResults(false);
    } else {
      fetchBoms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bomType]);

  // Fetch part names when bomType is "part-name"
  useEffect(() => {
    if (bomType === "part-name") {
      fetchPartNames();
      // Clear selected part name when filter changes
      setSelectedPartName("");
      setPartNameSearch("");
      setShowPartNameResults(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bomType]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        partNameDropdownRef.current &&
        !partNameDropdownRef.current.contains(event.target)
      ) {
        setShowPartNameResults(false);
      }
    };

    if (showPartNameResults) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPartNameResults]);

  // Handle BOM selection
  const handleBomSelect = async (bomId) => {
    if (!bomId) {
      setSelectedBomId("");
      setSelectedBom(null);
      setRawMaterials([]);
      setAccelerators([]);
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
        setAccelerators([]);
        setProcesses([]);
        return;
      }

      setSelectedBom(bom);
      console.log("Selected BOM:", bom);
      console.log("Raw Materials:", bom.raw_materials);

      // Get first compound from compoundingStandards or use top-level
      const firstCode = Array.isArray(bom.compound_codes) ? bom.compound_codes[0] : "";

      // Auto-fill Part Name
      // Try to resolve uom/category for part name
      const firstPartNameDetail = Array.isArray(bom.part_name_details) && bom.part_name_details.length > 0 ? bom.part_name_details[0] : null;
      const pndId = typeof firstPartNameDetail?.part_name_id_name === "string" ? firstPartNameDetail.part_name_id_name.split("-")[0] : null;
      const productById = (products || []).find((p) => p?._id === pndId);
      
      // For compound BOMs, find the compound product by name and category
      let productMatch = null;
      if (bom.bom_type === "compound" && bom.compound_name) {
        // Find compound product by name and category "Compound Name"
        productMatch = (products || []).find(
          (p) => p?.category === "Compound Name" && 
                 p?.name?.toLowerCase() === bom.compound_name?.toLowerCase()
        );
      }
      
      // Fallback: find by product_id or name
      if (!productMatch) {
        productMatch = (products || []).find(
          (p) => p?.product_id === firstCode || p?.name === (bom.compound_name || "")
        );
      }
      
      const pndSnap = firstPartNameDetail?.product_snapshot || null;
      // Get first quantity from part_name_details if available
      const firstEstQty = firstPartNameDetail && Array.isArray(firstPartNameDetail.quantities) && firstPartNameDetail.quantities.length > 0
        ? String(firstPartNameDetail.quantities[0])
        : "";
      // Use weight from BOM if available, otherwise use firstEstQty
      const estQtyValue = bom.compound_weight && bom.compound_weight.trim() !== "" 
        ? bom.compound_weight 
        : firstEstQty;
      
      // For compound BOMs, default UOM to "Kg" if not found
      const resolvedUom = pndSnap?.uom || productById?.uom || productMatch?.uom || (bom.bom_type === "compound" ? "Kg" : "");
      
      setPartName({
        compound_code: firstCode || "",
        compound_name: bom.compound_name || "",
        est_qty: estQtyValue,
        uom: resolvedUom,
        prod_qty: "",
        remain_qty: estQtyValue || "",
        category: pndSnap?.category || productById?.category || productMatch?.category || "",
        comment: "",
      });

      // Auto-fill Raw Materials from BOM
      let rms = [];

      // Check if rawMaterials array exists and has data
      if (bom.raw_materials && Array.isArray(bom.raw_materials) && bom.raw_materials.length > 0) {
        rms = bom.raw_materials.map((rm) => {
          const rawPop = rm.raw_material_id && typeof rm.raw_material_id === 'object' ? rm.raw_material_id : null;
          const snap = rm.product_snapshot || null;
          // Get first quantity from quantities array
          const firstQtyStr = Array.isArray(rm.quantities) && rm.quantities.length > 0 ? String(rm.quantities[0]) : "0";
          const firstQtyNum = parseFloat(firstQtyStr) || 0;
          // Use weight from BOM if available for scaling, otherwise use firstEstQty
          const fgBaseForRM = bom.compound_weight && bom.compound_weight.trim() !== "" 
            ? parseFloat(bom.compound_weight) || 1 
            : (parseFloat(firstEstQty) || 1);
          const fgBase = fgBaseForRM; // initial FG qty from BOM (fallback 1)
          const perUnitBase = fgBase ? firstQtyNum / fgBase : 0; // RM per 1 FG unit
          const initialEst = firstQtyStr; // show exactly BOM value on first load
          return {
            raw_material_id: rawPop?._id || rm.raw_material_id || null,
            raw_material_name: rm.raw_material_name || rawPop?.name || snap?.name || "",
            raw_material_code: rawPop?.product_id || snap?.product_id || "",
            est_qty: initialEst,
            base_qty: perUnitBase,
            uom: rawPop?.uom || snap?.uom || "",
            used_qty: "",
            remain_qty: initialEst,
            category: rawPop?.category || snap?.category || "",
            comment: "",
            weight: "",
            tolerance: (Array.isArray(rm.tolerances) && rm.tolerances[0]) || "",
            code_no: "",
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

      // Auto-fill Accelerators from BOM
      const accs = Array.isArray(bom.accelerators) && bom.accelerators.length > 0
        ? bom.accelerators.map((acc) => {
          const accQtyStr = acc.quantity || "0";
          const accQtyNum = parseFloat(accQtyStr) || 0;
          // Use weight from BOM if available for scaling, otherwise use firstEstQty
          const fgBaseForAcc = bom.compound_weight && bom.compound_weight.trim() !== "" 
            ? parseFloat(bom.compound_weight) || 1 
            : (parseFloat(firstEstQty) || 1);
          const fgBase = fgBaseForAcc; // initial FG qty from BOM (fallback 1)
          const perUnitBase = fgBase ? accQtyNum / fgBase : 0; // Accelerator per 1 FG unit
          const initialEst = accQtyStr; // show exactly BOM value on first load
          return {
            name: acc.name || "",
            tolerance: acc.tolerance || "",
            quantity: acc.quantity || "",
            est_qty: initialEst,
            base_qty: perUnitBase,
            used_qty: "",
            remain_qty: initialEst,
            comment: acc.comment || "",
          };
        })
        : [];
      setAccelerators(accs);

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
      setAccelerators([]);
      setProcesses([]);
    }
  };

  // Handle Part Name field changes
  const handlePartNameChange = (field, value) => {
    // Validation: PROD QTY should not exceed EST QTY
    if (field === "prod_qty") {
      const estQty = parseFloat(partName.est_qty) || 0;
      const prodQty = parseFloat(value) || 0;
      if (prodQty > estQty) {
        toast.error(`Production quantity cannot exceed estimated quantity (${estQty})`);
        return; // Don't update if validation fails
      }
    }
    
    setPartName((prev) => {
      const updated = { ...prev, [field]: value };
      // Calculate remain_qty and (if est changes) we'll scale RMs below
      if (field === "prod_qty" || field === "est_qty") {
        const est = parseFloat(field === "est_qty" ? value : updated.est_qty) || 0;
        const prod = parseFloat(field === "prod_qty" ? value : updated.prod_qty) || 0;
        updated.remain_qty = (est - prod).toFixed(2);
      }
      return updated;
    });
    // When est_qty changes, scale raw materials: rm.est_qty = rm.base_qty * est_qty
    if (field === "est_qty") {
      const multiplier = parseFloat(value) || 0;
      setRawMaterials((prev) =>
        (prev || []).map((rm) => {
          const base = parseFloat(rm.base_qty) || 0;
          const nextEst = base * multiplier;
          const used = parseFloat(rm.used_qty) || 0;
          return {
            ...rm,
            est_qty: String(nextEst),
            remain_qty: String((nextEst - used).toFixed(2)),
          };
        })
      );
      // Also scale accelerators: acc.est_qty = acc.base_qty * est_qty
      setAccelerators((prev) =>
        (prev || []).map((acc) => {
          const base = parseFloat(acc.base_qty) || 0;
          const nextEst = base * multiplier;
          const used = parseFloat(acc.used_qty) || 0;
          return {
            ...acc,
            est_qty: String(nextEst),
            remain_qty: String((nextEst - used).toFixed(2)),
          };
        })
      );
    }
  };

  // Handle Raw Material changes
  const handleRawMaterialChange = (idx, field, value) => {
    // Validation: Used QTY should not exceed EST QTY
    if (field === "used_qty") {
      const rm = rawMaterials[idx];
      const estQty = parseFloat(rm?.est_qty) || 0;
      const usedQty = parseFloat(value) || 0;
      if (usedQty > estQty) {
        toast.error(`Used quantity cannot exceed estimated quantity (${estQty}) for ${rm?.raw_material_name || "raw material"}`);
        return; // Don't update if validation fails
      }
    }
    
    setRawMaterials((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      // Calculate remain_qty for raw materials
      if (field === "est_qty" || field === "used_qty") {
        const est = parseFloat(field === "est_qty" ? value : next[idx].est_qty) || 0;
        const used = parseFloat(field === "used_qty" ? value : next[idx].used_qty) || 0;
        next[idx].remain_qty = (est - used).toFixed(2);
      }
      // no cost calculation; using comments instead
      return next;
    });
  };

  // Handle Accelerator changes
  const handleAcceleratorChange = (idx, field, value) => {
    // Validation: Used QTY should not exceed EST QTY
    if (field === "used_qty") {
      const acc = accelerators[idx];
      const estQty = parseFloat(acc?.est_qty || acc?.quantity) || 0;
      const usedQty = parseFloat(value) || 0;
      if (usedQty > estQty) {
        toast.error(`Used quantity cannot exceed estimated quantity (${estQty}) for ${acc?.name || "accelerator"}`);
        return; // Don't update if validation fails
      }
    }
    
    setAccelerators((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      // Calculate remain_qty for accelerators
      if (field === "est_qty" || field === "used_qty") {
        const est = parseFloat(field === "est_qty" ? value : next[idx].est_qty) || 0;
        const used = parseFloat(field === "used_qty" ? value : next[idx].used_qty) || 0;
        next[idx].remain_qty = (est - used).toFixed(2);
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
        part_names: [
          {
            compound_code: partName.compound_code,
            compound_name: partName.compound_name,
            est_qty: parseFloat(partName.est_qty) || 0,
            uom: partName.uom,
            prod_qty: parseFloat(partName.prod_qty) || 0,
            remain_qty: parseFloat(partName.remain_qty) || 0,
            category: partName.category,
            comment: partName.comment || "",
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
          comment: rm.comment || "",
          weight: rm.weight || "",
          tolerance: rm.tolerance || "",
          code_no: rm.code_no || "",
        })),
        accelerators: accelerators.map((acc) => ({
          name: acc.name || "",
          tolerance: acc.tolerance || "",
          quantity: acc.quantity || acc.est_qty || "",
          est_qty: parseFloat(acc.est_qty) || 0,
          used_qty: parseFloat(acc.used_qty) || 0,
          remain_qty: parseFloat(acc.remain_qty) || 0,
          comment: acc.comment || "",
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
    setBomType("");
    setSelectedBomId("");
    setSelectedBom(null);
    setBomSearch("");
    setShowBomResults(false);
    setSelectedPartName("");
    setPartNameSearch("");
    setShowPartNameResults(false);
    setCompoundDetails([]);
    setEditMode(false);
    setCurrentProductionId("");
    setPartName({
      compound_code: "",
      compound_name: "",
      est_qty: "",
      uom: "",
      prod_qty: "",
      remain_qty: "",
      category: "",
      comment: "",
    });
    setRawMaterials([]);
    setAccelerators([]);
    setProcesses([]);
  };

  // Filter productions (show all, search applied)
  const filteredProductions = productions.filter((prod) => {
    const q = searchQuery.toLowerCase();
    const pn = prod.part_names?.[0];
    return (
      prod.production_id?.toLowerCase().includes(q) ||
      pn?.compound_code?.toLowerCase().includes(q) ||
      pn?.compound_name?.toLowerCase().includes(q) ||
      prod.bom?.compound_code?.toLowerCase().includes(q) ||
      prod.bom?.compound_name?.toLowerCase().includes(q)
    );
  });


  const Info = ({ label, value }) => (
    <div>
      <span className="font-medium text-gray-600">{label}:</span>{" "}
      <span className="text-gray-900">{value || "-"}</span>
    </div>
  );

  const EmptyState = ({ message }) => (
    <div className="text-gray-500 italic text-sm bg-gray-50 border border-dashed border-gray-300 rounded-lg p-3 text-center">
      {message}
    </div>
  );

  return (
    <div className="p-4 sm:p-6 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold">Production Start</h1>
        <Button
          className="bg-blue-600 cursor-pointer hover:bg-blue-700 text-white w-full sm:w-auto"
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
          <button
            onClick={fetchProductions}
            className="p-2 cursor-pointer rounded-lg  text-gray-800  border border-gray-300 hover:bg-gray-100 transition"
          >
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mt-5 border rounded-lg overflow-x-auto shadow-sm">
        <table className="w-full text-sm text-left min-w-[800px]">
          <thead>
            <tr className="bg-linear-to-r text-center from-blue-600 to-sky-500 whitespace-nowrap text-white uppercase text-xs tracking-wide">
              <th className="px-4 sm:px-6 py-3 font-medium">Compound Code</th>
              <th className="px-4 sm:px-6 py-3 font-medium">Compound Name</th>
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
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  Loading productions...
                </td>
              </tr>
            ) : filteredProductions?.length > 0 ? (
              filteredProductions.map((prod, index) => {
                const pn = prod.part_names?.[0];
                return (
                  <tr
                    key={prod._id}
                    className={`border-t text-center whitespace-nowrap ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } `}
                  >
                    <td className="px-4 sm:px-6 py-3">
                      {pn?.compound_code ||
                        prod.bom?.compound_code ||
                        prod.production_id}
                    </td>
                    <td className="px-4 sm:px-6 py-3">
                      {pn?.compound_name || prod.bom?.compound_name || "-"}
                    </td>

                    {/* <td className="px-4 sm:px-6 py-3">
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

                        const statusVal = (deriveStatus(prod) || "pending").toString().toLowerCase();
                        const normalizedStatus =
                          statusVal === "production start" || statusVal === "production_start"
                            ? "completed"
                            : statusVal;

                        const label = (() => {
                          if (normalizedStatus === "completed") return "Production Completed";
                          if (normalizedStatus === "in_progress") return "Work in progress";
                          if (!normalizedStatus) return "Pending";
                          return normalizedStatus
                            .split(/[_\s]+/)
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ");
                        })();

                        const cls =
                          normalizedStatus === "completed"
                            ? "bg-green-100 text-green-600"
                            : normalizedStatus === "in_progress"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-gray-100 text-gray-600";

                        return (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls}`}>
                            {label}
                          </span>
                        );
                      })()}

{(() => {
                          // Check Compound Details remain_qty is 0
                          const pnRemainQty = parseFloat(pn?.remain_qty) || 0;
                          const isPnRemainZero = Math.abs(pnRemainQty) <= 1e-6;
                          
                          // Check all Raw Materials remain_qty are 0
                          const rawMaterials = prod?.raw_materials || [];
                          const allRmRemainZero = rawMaterials.length === 0 || rawMaterials.every(
                            (rm) => Math.abs(parseFloat(rm?.remain_qty) || 0) <= 1e-6
                          );
                          
                          // If both remain_qty are 0, consider it ready/matched
                          if (isPnRemainZero && allRmRemainZero) {
                            return (
                              <span
                                className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600"
                                title="All quantities consumed - Quantity matched"
                              >
                                Quantity matched
                              </span>
                            );
                          }
                          
                          // Otherwise check quantity match
                          const pnQty = parseFloat(pn?.prod_qty) || 0;
                          const usedTotal = rawMaterials.reduce(
                            (sum, rm) => sum + (parseFloat(rm?.used_qty) || 0),
                            0
                          );
                          const isMatched = Math.abs(usedTotal - pnQty) <= 1e-6;
                          return (
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                isMatched ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                              }`}
                              title={`Part Name: ${pnQty}, Used: ${usedTotal.toFixed(2)}${!isPnRemainZero ? `, Compound remain: ${pnRemainQty.toFixed(2)}` : ''}${!allRmRemainZero ? ', RM remain qty' : ''}`}
                            >
                              {isMatched ? "Quantity matched" : "Quantity mismatched"}
                            </span>
                          );
                        })()}

                    </td> */}
                    <td className="px-2 sm:px-4 md:px-6 py-3 align-top">
                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2">
                        {/* Production Status Badge */}
                        {(() => {
                          const deriveStatus = (p) => {
                            const list = Array.isArray(p?.processes)
                              ? p.processes
                              : [];
                            if (!p?.status && list.length) {
                              const allDone = list.every(
                                (pr) =>
                                  pr.done === true || pr.status === "completed"
                              );
                              const anyStarted = list.some(
                                (pr) =>
                                  pr.start === true ||
                                  pr.status === "in_progress"
                              );
                              return allDone
                                ? "completed"
                                : anyStarted
                                ? "in_progress"
                                : "pending";
                            }
                            return p?.status || "pending";
                          };

                          const statusVal = (deriveStatus(prod) || "pending")
                            .toString()
                            .toLowerCase();
                          const normalizedStatus =
                            statusVal === "production start" ||
                            statusVal === "production_start"
                              ? "completed"
                              : statusVal;

                          const label = (() => {
                            if (normalizedStatus === "completed")
                              return "Production Completed";
                            if (normalizedStatus === "in_progress")
                              return "Work in Progress";
                            if (!normalizedStatus) return "Pending";
                            return normalizedStatus
                              .split(/[_\s]+/)
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(" ");
                          })();

                          const cls =
                            normalizedStatus === "completed"
                              ? "bg-green-100 text-green-600"
                              : normalizedStatus === "in_progress"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-gray-100 text-gray-600";

                          return (
                            <span
                              className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium text-center ${cls}`}
                            >
                              {label}
                            </span>
                          );
                        })()}

                        {/* Quantity Match Badge */}
                        {(() => {
                          const pnRemainQty = parseFloat(pn?.remain_qty) || 0;
                          const isPnRemainZero = Math.abs(pnRemainQty) <= 1e-6;

                          const rawMaterials = prod?.raw_materials || [];
                          const allRmRemainZero =
                            rawMaterials.length === 0 ||
                            rawMaterials.every(
                              (rm) =>
                                Math.abs(parseFloat(rm?.remain_qty) || 0) <=
                                1e-6
                            );

                          if (isPnRemainZero && allRmRemainZero) {
                            return (
                              <span
                                className="px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-600 text-center"
                                title="All quantities consumed - Quantity matched"
                              >
                                Quantity matched
                              </span>
                            );
                          }

                          const pnQty = parseFloat(pn?.prod_qty) || 0;
                          const usedTotal = rawMaterials.reduce(
                            (sum, rm) => sum + (parseFloat(rm?.used_qty) || 0),
                            0
                          );
                          const isMatched = Math.abs(usedTotal - pnQty) <= 1e-6;

                          return (
                            <span
                              className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium text-center ${
                                isMatched
                                  ? "bg-green-100 text-green-600"
                                  : "bg-red-100 text-red-600"
                              }`}
                              title={`Part Name: ${pnQty}, Used: ${usedTotal.toFixed(
                                2
                              )}${
                                !isPnRemainZero
                                  ? `, Compound remain: ${pnRemainQty.toFixed(
                                      2
                                    )}`
                                  : ""
                              }${!allRmRemainZero ? ", RM remain qty" : ""}`}
                            >
                              {isMatched
                                ? "Quantity matched"
                                : "Quantity mismatched"}
                            </span>
                          );
                        })()}
                      </div>
                    </td>

                    <td className="px-4 sm:px-6 py-3">
                      {pn?.prod_qty || pn?.est_qty || 0}
                    </td>
                    <td className="px-4 sm:px-6 py-3">{pn?.uom || "-"}</td>
                    <td className="px-4 sm:px-6 py-3  text-center ">
                      <div className="flex justify-center items-center pb-4 space-x-3">
                        <Edit
                          className="h-4 w-4 text-blue-500 cursor-pointer"
                          onClick={() => {
                            setEditingProductionId(prod._id);
                            setShowEditModal(true);
                          }}
                        />
                        <Trash2
                          className="h-4 w-4 text-red-500 cursor-pointer"
                          onClick={async () => {
                            if (!confirm("Delete this production?")) return;
                            try {
                              await axiosHandler.delete("/production", {
                                data: { id: prod._id },
                              });
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
                              const res = await axiosHandler.get(
                                `/production/${prod._id}`
                              );
                              setViewDetails(res?.data?.production || null);
                            } catch (e) {
                              console.error(e);
                              toast.error("Failed to load production details");
                            }
                          }}
                        />
                      </div>
                      {(() => {
                        const alreadySent = prod?.ready_for_qc === true;
                        const alreadyQCed = prod?.qc_done === true;
                        const isCompleted = prod?.status === "completed";
                        if (!isCompleted) return null;
                        if (alreadyQCed)
                          return (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
                              QC Done
                            </span>
                          );
                        if (alreadySent)
                          return (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-600">
                              Waiting for QC
                            </span>
                          );

                        // Check Compound Details remain_qty is 0
                        const pnRemainQty = parseFloat(pn?.remain_qty) || 0;
                        const isPnRemainZero = Math.abs(pnRemainQty) <= 1e-6;

                        // Check all Raw Materials remain_qty are 0
                        const rawMaterials = prod?.raw_materials || [];
                        const allRmRemainZero =
                          rawMaterials.length === 0 ||
                          rawMaterials.every(
                            (rm) =>
                              Math.abs(parseFloat(rm?.remain_qty) || 0) <= 1e-6
                          );

                        // Block sending to QC until Compound remain_qty is 0 AND all Raw Materials remain_qty are 0
                        if (!isPnRemainZero || !allRmRemainZero) {
                          return (
                            <span
                              className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-600"
                              title={
                                !isPnRemainZero
                                  ? `Compound remain qty: ${pnRemainQty.toFixed(
                                      2
                                    )}`
                                  : `Some raw materials still have remaining quantity`
                              }
                            >
                              {!isPnRemainZero
                                ? "Compound qty remaining"
                                : "Raw materials qty remaining"}
                            </span>
                          );
                        }

                        // If both remain_qty are 0, allow sending to QC (quantities are considered consumed/complete)
                        // No need to check quantity match when all quantities are fully consumed
                        return (
                          <button
                            className=" px-4 py-1.5
  rounded-lg
  bg-yellow-500
  text-white text-xs font-semibold tracking-wide
   border-yellow-600
  shadow
  hover:bg-yellow-400
  hover:shadow-lg transition-all duration-200"
                            onClick={async () => {
                              try {
                                await axiosHandler.patch(
                                  `/production/${prod._id}/ready-for-qc`
                                );
                                toast.success("Sent to Quality Check");
                                fetchProductions();
                              } catch (e) {
                                console.error(e);
                                toast.error("Failed to send to Quality Check");
                              }
                            }}
                          >
                            Send to Quality Check
                          </button>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No Production found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Production Modal */}
      {/* now this  */}
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
                onClick={() => {
                  resetForm();
                  setShowModal(false);
                }}
                className="absolute top-3 right-4 text-2xl text-gray-600 hover:text-red-500 transition"
              >
                ✕
              </button>

              <button
                onClick={() => {
                  resetForm();
                  setShowModal(false);
                }}
                className="text-2xl mb-4 hover:text-blue-500 transition"
              >
                ←
              </button>

              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 dark:text-gray-100 mb-5">
                    Add New Production
                  </h1>
                </div>

                 <select
                   className="h-12 w-50 border rounded-xl border-gray-300"
                   value={bomType}
                     onChange={(e) => {
                     setBomType(e.target.value);
                     // Clear form when filter changes
                     setSelectedBomId("");
                     setSelectedBom(null);
                     setBomSearch("");
                     setShowBomResults(false);
                     setSelectedPartName("");
                     setPartNameSearch("");
                     setShowPartNameResults(false);
                     setCompoundDetails([]);
                     setPartName({
                       compound_code: "",
                       compound_name: "",
                       est_qty: "",
                       uom: "",
                       prod_qty: "",
                       remain_qty: "",
                       category: "",
                       comment: "",
                     });
                     setRawMaterials([]);
                     setAccelerators([]);
                     setProcesses([]);
                   }}
                 >
                   <option value="">Select an option</option>
                   <option value="compound">Compound</option>
                   <option value="part-name">Part Name</option>
                 </select>
              </div>

              <form onSubmit={handleSubmit}>
                {/* ---------- Part Name Section ---------- */}

                {bomType === "compound" && (
                  <section className="mb-10">
                    <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Compound Details
                      </h2>
                    </div>

                    <div className="hidden sm:grid grid-cols-8 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-md overflow-hidden">
                      {[
                        "Compound Details",
                        
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

                    <div className="grid grid-cols-1 sm:grid-cols-8 gap-3 mt-3">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search Compound"
                          value={bomSearch}
                          onChange={(e) => {
                            setBomSearch(e.target.value);
                            setShowBomResults(true);
                          }}
                          onFocus={() => setShowBomResults(true)}
                          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-blue-400"
                        />
                        {showBomResults && (
                          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-sm max-h-56 overflow-auto">
                            {boms
                              .filter((b) => {
                                // Filter by BOM type (bomType state)
                                if (bomType && b.bom_type !== bomType) {
                                  return false;
                                }
                                // Filter by search query
                                const q = (bomSearch || "").toLowerCase();
                                const name = (
                                  b.compound_name || ""
                                ).toLowerCase();
                                const code = (
                                  Array.isArray(b.compound_codes) &&
                                  b.compound_codes[0]
                                    ? b.compound_codes[0]
                                    : ""
                                ).toLowerCase();
                                return (
                                  !q || name.includes(q) || code.includes(q)
                                );
                              })
                              .slice(0, 50)
                              .map((b) => {
                                const label = `${b.compound_name || "Unnamed"}${
                                  Array.isArray(b.compound_codes) &&
                                  b.compound_codes[0]
                                    ? ` (${b.compound_codes[0]})`
                                    : ""
                                }`;
                                return (
                                  <div
                                    key={b._id}
                                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                                      selectedBomId === b._id
                                        ? "bg-gray-50"
                                        : ""
                                    }`}
                                    onMouseDown={(e) => {
                                      // prevent input blur before click handler
                                      e.preventDefault();
                                    }}
                                    onClick={() => {
                                      setSelectedBomId(b._id);
                                      setBomSearch(label);
                                      setShowBomResults(false);
                                      handleBomSelect(b._id);
                                    }}
                                  >
                                    {label}
                                  </div>
                                );
                              })}
                            {boms.length === 0 && (
                              <div className="px-3 py-2 text-sm text-gray-500">
                                No BOMs
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <input
                        type="number"
                        placeholder="Enter Quantity"
                        value={partName.est_qty}
                        onChange={(e) =>
                          handlePartNameChange("est_qty", e.target.value)
                        }
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-blue-400"
                      />
                      <input
                        type="text"
                        placeholder="Enter UOM"
                        value={partName.uom}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                      />
                      <input
                        type="number"
                        placeholder="Enter Quantity"
                        value={partName.prod_qty}
                        onChange={(e) =>
                          handlePartNameChange("prod_qty", e.target.value)
                        }
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-blue-400"
                      />
                      <input
                        type="number"
                        placeholder="Remain QTY"
                        value={partName.remain_qty}
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
                        onChange={(e) =>
                          handlePartNameChange("comment", e.target.value)
                        }
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                      />
                    </div>
                  </section>
                )}

                {bomType === "part-name" && (
                  <section className="mb-10">
                    <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Part Details
                      </h2>
                    </div>

                    <div className="hidden sm:grid grid-cols-8 bg-blue-600 text-white text-xs sm:text-sm font-medium rounded-md overflow-hidden">
                      {[
                        "Select Part",
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

                    <div className="grid grid-cols-1 sm:grid-cols-8 gap-3 mt-3">
                      <div className="relative" ref={partNameDropdownRef}>
                        <input
                          type="text"
                          placeholder="Select Part Name"
                          value={partNameSearch}
                          onChange={(e) => {
                            setPartNameSearch(e.target.value);
                            setShowPartNameResults(true);
                          }}
                          onFocus={() => {
                            setShowPartNameResults(true);
                            if (partNamesList.length === 0) {
                              fetchPartNames();
                            }
                          }}
                          className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-blue-400"
                        />
                        {showPartNameResults && (
                          <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-sm max-h-56 overflow-auto">
                            {partNamesList
                              .filter((pn) => {
                                const q = (partNameSearch || "").toLowerCase();
                                const name = (pn || "").toLowerCase();
                                return !q || name.includes(q);
                              })
                              .slice(0, 50)
                              .map((pn, idx) => (
                                <div
                                  key={idx}
                                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                                    selectedPartName === pn
                                      ? "bg-blue-50 text-blue-600 font-medium"
                                      : ""
                                  }`}
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                  }}
                                  onClick={() => {
                                    handlePartNameSelect(pn);
                                  }}
                                >
                                  {pn}
                                </div>
                              ))}
                            {partNamesList.length === 0 && (
                              <div className="px-3 py-2 text-sm text-gray-500">
                                No part names found
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Part Name"
                        value={partName.compound_name || selectedPartName}
                        readOnly
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                      />
                      <input
                        type="number"
                        placeholder="Enter Quantity"
                        value={partName.est_qty}
                        onChange={(e) =>
                          handlePartNameChange("est_qty", e.target.value)
                        }
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-blue-400"
                      />
                      <input
                        type="text"
                        placeholder="Enter UOM"
                        value={partName.uom}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                      />
                      <input
                        type="number"
                        placeholder="Enter Quantity"
                        value={partName.prod_qty}
                        onChange={(e) =>
                          handlePartNameChange("prod_qty", e.target.value)
                        }
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-blue-400"
                      />
                      <input
                        type="number"
                        placeholder="Remain QTY"
                        value={partName.remain_qty}
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
                        onChange={(e) =>
                          handlePartNameChange("comment", e.target.value)
                        }
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full"
                      />
                    </div>
                  </section>
                )}

                {/* ---------- Compound Details Section (for part-name BOMs) ---------- */}
                {bomType === "part-name" && compoundDetails.length > 0 && (
                  <section className="mb-10">
                    <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
                      <h2 className="text-lg font-semibold text-gray-900">
                        Compound Details
                      </h2>
                    </div>

                    <div className="hidden sm:grid grid-cols-4 bg-purple-600 text-white text-xs sm:text-sm font-medium rounded-md overflow-hidden">
                      {[
                        "Compound Name",
                        "Compound Code",
                        "Hardness",
                        "Weight",
                      ].map((head) => (
                        <div key={head} className="p-2 text-center truncate">
                          {head}
                        </div>
                      ))}
                    </div>

                    {compoundDetails.map((comp, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-3"
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
                        
                      </div>
                    ))}
                  </section>
                )}

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
                          "Part Name",
                          "EST. QTY",
                          "UOM",
                          "Used QTY",
                          "Remain QTY",
                          "Category",
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
                          className="grid grid-cols-1 sm:grid-cols-7 gap-3 mt-3"
                        >
                          <input
                            value={`${rm.raw_material_name || ""}${
                              rm.raw_material_code
                                ? ` (${rm.raw_material_code})`
                                : ""
                            }`}
                            readOnly
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                          />
                          <input
                            type="number"
                            placeholder="EST. QTY"
                            value={rm.est_qty}
                            readOnly
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
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
                            onChange={(e) =>
                              handleRawMaterialChange(
                                idx,
                                "used_qty",
                                e.target.value
                              )
                            }
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
                            type="text"
                            placeholder="Comment"
                            value={rm.comment || ""}
                            onChange={(e) =>
                              handleRawMaterialChange(
                                idx,
                                "comment",
                                e.target.value
                              )
                            }
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-blue-400"
                          />
                        </div>
                      ))}
                    </>
                  ) : selectedBomId ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No raw materials found for the selected BOM. Please check
                      if the BOM has raw materials configured.
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Please select a BOM to see raw materials.
                    </div>
                  )}
                </section>

                {/* ---------- Accelerator (Pakai) Section ---------- */}
                <section className="mb-10">
                  <div className="flex flex-wrap justify-between items-center gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-6 bg-green-500 rounded-full"></div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Accelerator (Pakai)
                      </h2>
                    </div>
                  </div>

                  {accelerators.length > 0 ? (
                    <>
                      <div className="hidden sm:grid grid-cols-5 bg-green-600 text-white text-xs sm:text-sm font-medium rounded-md overflow-hidden">
                        {[
                          "Name",
                          "EST. QTY",
                          "Used QTY",
                          "Remain QTY",
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
                          className="grid grid-cols-1 sm:grid-cols-5 gap-3 mt-3"
                        >
                          <input
                            type="text"
                            placeholder="Name"
                            value={acc.name || ""}
                            readOnly
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                          />
                          <input
                            type="number"
                            placeholder="EST. QTY"
                            value={acc.est_qty || ""}
                            readOnly
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                          />
                          <input
                            type="number"
                            placeholder="Used QTY"
                            value={acc.used_qty || ""}
                            onChange={(e) =>
                              handleAcceleratorChange(
                                idx,
                                "used_qty",
                                e.target.value
                              )
                            }
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-blue-400"
                          />
                          <input
                            type="number"
                            placeholder="Remain QTY"
                            value={acc.remain_qty || ""}
                            readOnly
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full bg-gray-50"
                          />
                          <input
                            type="text"
                            placeholder="Comment"
                            value={acc.comment || ""}
                            onChange={(e) =>
                              handleAcceleratorChange(
                                idx,
                                "comment",
                                e.target.value
                              )
                            }
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full focus:ring-1 focus:ring-blue-400"
                          />
                        </div>
                      ))}
                    </>
                  ) : selectedBomId ? (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      No accelerators found for the selected BOM.
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      Please select a BOM to see accelerators.
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
                          onChange={(e) =>
                            handleProcessChange(
                              idx,
                              "work_done",
                              e.target.value
                            )
                          }
                          className="border border-gray-300 rounded-md px-3 py-2 w-full text-sm focus:ring-1 focus:ring-blue-400 mb-2"
                        />

                        <div className="flex gap-4 items-center mt-2 flex-wrap">
                          <label className="flex items-center gap-1 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              className="accent-blue-600"
                              checked={proc.start}
                              onChange={(e) =>
                                handleProcessChange(
                                  idx,
                                  "start",
                                  e.target.checked
                                )
                              }
                            />
                            Start
                          </label>
                          <label className="flex items-center gap-1 text-sm text-gray-700">
                            <input
                              type="checkbox"
                              className="accent-blue-600"
                              checked={proc.done}
                              onChange={(e) =>
                                handleProcessChange(
                                  idx,
                                  "done",
                                  e.target.checked
                                )
                              }
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
          >
            <Motion.div
              initial={{ y: 60, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 60, opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative bg-white rounded-2xl shadow-2xl w-[95%] sm:w-[90%] md:w-[80%] lg:max-w-4xl max-h-[85vh] overflow-y-auto"
            >
              {/* Sticky Header */}
              <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-gray-200 flex justify-between items-center px-6 py-4 z-10">
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  Production Details
                </h2>
                <button
                  onClick={() => setViewDetails(null)}
                  className="text-gray-500 hover:text-red-500 text-2xl transition"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-6 sm:p-8 space-y-8 text-sm text-gray-800">
                {/* Header Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-linear-to-br from-blue-50 to-white rounded-xl shadow-sm p-4">
                  <div>
                    <span className="font-medium text-gray-600">
                      Production ID:
                    </span>
                    <p className="text-gray-900">
                      {viewDetails?.production_id || "-"}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">BOM:</span>
                    <p className="text-gray-900">
                      {viewDetails?.bom?.compound_name ||
                        viewDetails?.bom?.compound_code ||
                        "-"}
                    </p>
                  </div>
                </div>

                {/* Part Names */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Part Names
                    </h3>
                  </div>
                  {(viewDetails?.part_names || []).length > 0 ? (
                    <div className="grid gap-3">
                      {viewDetails.part_names.map((pn, i) => (
                        <div
                          key={i}
                          className="border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition bg-gray-50/50"
                        >
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <Info
                              label="Compound"
                              value={pn.compound_name || pn.compound_code}
                            />
                            <Info label="EST" value={pn.est_qty} />
                            <Info label="PROD" value={pn.prod_qty} />
                            <Info label="Remain" value={pn.remain_qty} />
                            <Info label="UOM" value={pn.uom} />
                            <Info label="Category" value={pn.category} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="No part names found." />
                  )}
                </section>

                {/* Raw Materials */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Raw Materials
                    </h3>
                  </div>
                  {(viewDetails?.raw_materials || []).length > 0 ? (
                    <div className="grid gap-3">
                      {viewDetails.raw_materials.map((rm, i) => (
                        <div
                          key={i}
                          className="border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition bg-white"
                        >
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <Info
                              label="Item"
                              value={
                                rm.raw_material_name || rm.raw_material_code
                              }
                            />
                            <Info label="EST" value={rm.est_qty} />
                            <Info label="Used" value={rm.used_qty} />
                            <Info label="Remain" value={rm.remain_qty} />
                            <Info label="UOM" value={rm.uom} />
                            <Info label="Category" value={rm.category} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="No raw materials found." />
                  )}
                </section>

                {/* Accelerators */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-6 bg-green-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Accelerator (Pakai)
                    </h3>
                  </div>
                  {(viewDetails?.accelerators || []).length > 0 ? (
                    <div className="grid gap-3">
                      {viewDetails.accelerators.map((acc, i) => (
                        <div
                          key={i}
                          className="border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition bg-white"
                        >
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <Info label="Name" value={acc.name} />
                            <Info
                              label="EST QTY"
                              value={acc.est_qty || acc.quantity}
                            />
                            <Info label="Used QTY" value={acc.used_qty || 0} />
                            <Info
                              label="Remain QTY"
                              value={acc.remain_qty || 0}
                            />
                            <Info label="Comment" value={acc.comment} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="No accelerators found." />
                  )}
                </section>

                {/* Processes */}
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-6 bg-green-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Processes
                    </h3>
                  </div>
                  {(viewDetails?.processes || []).length > 0 ? (
                    <div className="grid gap-3">
                      {viewDetails.processes.map((p, i) => (
                        <div
                          key={i}
                          className="border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition bg-gray-50"
                        >
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <Info label="Process" value={p.process_name} />
                            <Info label="Work Done" value={p.work_done} />
                            <div>
                              5
                              <span className="font-medium text-gray-600">
                                Status:
                              </span>{" "}
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  p.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : p.status === "in_progress"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {p.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState message="No processes found." />
                  )}
                </section>
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>

      <Pagination
        page={page}
        setPage={setPage}
        hasNextPage={productions?.length === 10}
      />

      {/* Edit Production Modal */}
      {showEditModal && (
        <EditProduction
          productionId={editingProductionId}
          onClose={() => {
            setShowEditModal(false);
            setEditingProductionId("");
          }}
          onUpdate={() => {
            fetchProductions();
          }}
        />
      )}
    </div>
  );
};

export default Production_Start;
