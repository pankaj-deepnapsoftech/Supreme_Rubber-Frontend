import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { usePurchanse_Order } from "@/Context/PurchaseOrderContext";
import {
  Edit,
  Eye,
  Trash2,
  X,
  PlusCircle,
  Trash,
  Search,
  RefreshCw,
  Download,
} from "lucide-react";
import { useSupplierContext } from "@/Context/SuplierContext";
import { useInventory } from "@/Context/InventoryContext";
import Pagination from "@/Components/Pagination/Pagination";

const PurchaseOrder = () => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [POData, setPOData] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const {
    loading,
    CreatePurchaseOrder,
    GetAllPurchaseOrders,
    GetPurchaseOrderDetails,
    UpdatePurchaseOrder,
    DeletePurchaseOrder,
  } = usePurchanse_Order();

  const { getAllSupplier } = useSupplierContext();
  const { getAllProducts } = useInventory();

  const [supplierData, setSupplierData] = useState([]);
  const [Inventorydata, setInventoryData] = useState([]);
//  console.log("Inventorydata", Inventorydata);
  // Filter inventory data to show only raw materials (exclude part names)
  // For purchase orders, we want items that can be bought and are not part names
  const rawMaterialsOnly = Inventorydata.filter((item) => {
    const category = (item.category || "").toLowerCase().trim();
    const itemType = (item.item_type || "").toLowerCase().trim();

    // Debug: Log item details
    // console.log("Item:", item.name, "Category:", category, "Type:", itemType);

    // Exclude part names and finished goods explicitly
    if (
      category &&
      (category.includes("finished") || category.includes("part"))
    ) {
      return false;
    }

    // Include items that can be bought (item_type = "Buy" or "both")
    // This is the primary criteria for purchase orders
    const canBeBought = itemType === "buy" || itemType === "both";

    // Also include items with "raw" in category (case-insensitive)
    const isRawMaterial = category && category.includes("raw");



    // Show items that can be bought OR are raw materials
    return canBeBought || isRawMaterial;
  });


  const [products, setProducts] = useState([
    {
      item_name: "",
      quantity: "",
      produce_quantity: "",
      remain_quantity: "",
      category: "",
      uom: "",
      product_type: "",
    },
  ]);

  const formik = useFormik({
    initialValues: { supplier: "" },
    validationSchema: Yup.object({
      supplier: Yup.string().required("Supplier is required"),
    }),
    onSubmit: async (values) => {
      const payload = { ...values, products };

      if (editMode && selectedOrder?._id) {
        await UpdatePurchaseOrder({ _id: selectedOrder._id, ...payload });
      } else {
        await CreatePurchaseOrder(payload);
      }

      // ✅ Get the latest data and update UI immediately
      const updatedData = await GetAllPurchaseOrders();
      setPOData(updatedData);

      // ✅ Close modal
      setShowModal(false);
      setEditMode(false);
      setViewMode(false);
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const sup = await getAllSupplier();
      const inv = await getAllProducts();
      const rmItem = inv?.data?.find((i) => i?.category === "Raw Material");
      console.log("rmItem", rmItem);

     setInventoryData(rmItem?.products || []);
       
      setSupplierData(sup || []);
      const data = await GetAllPurchaseOrders(page);
      setPOData(data);
    };
    fetchData();
  }, [page]);

  const handleAddItem = () => {
    setProducts([
      ...products,
      {
        item_name: "",
        quantity: "",
        produce_quantity: "",
        remain_quantity: "",
        category: "",
        uom: "",
        product_type: "",
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...products];
    updated[index][name] = value;
    if (name === "item_name") {
      // Search in rawMaterialsOnly first, fallback to Inventorydata if needed
      const selected =
        rawMaterialsOnly.find((p) => p._id === value) ||
        Inventorydata.find((p) => p._id === value);
      if (selected) {
        updated[index].category = selected.category || "";
        updated[index].uom = selected.uom || "";
        updated[index].product_type = selected.product_or_service || "";
      }
    }
    setProducts(updated);
  };

  const handleView = async (id) => {
    const res = await GetPurchaseOrderDetails(id);
    const po = res?.po || res;
    if (po) {
      formik.setValues({ supplier: po.supplier?._id || "" });
      const formattedProducts = po.products.map((p) => ({
        item_name:
          p.item_name?._id ||
          Inventorydata.find((i) => i.name === p.item_name)?._id ||
          p.item_name,
        quantity: p.quantity || "",
        produce_quantity: p.produce_quantity || "",
        remain_quantity: p.remain_quantity || "",
        category:
          p.category ||
          Inventorydata.find((i) => i.name === p.item_name)?.category ||
          "",
        uom:
          p.uom || Inventorydata.find((i) => i.name === p.item_name)?.uom || "",
        product_type:
          p.product_type ||
          Inventorydata.find((i) => i.name === p.item_name)
            ?.product_or_service ||
          "",
      }));
      setProducts(formattedProducts);
      setViewMode(true);
      setShowModal(true);
    }
  };

  const handleEdit = async (id) => {
    const res = await GetPurchaseOrderDetails(id);
    const po = res?.po || res;
    if (po) {
      setSelectedOrder(po);
      formik.setValues({ supplier: po.supplier?._id || "" });
      const formattedProducts = po.products.map((p) => ({
        item_name:
          p.item_name?._id ||
          Inventorydata.find((i) => i.name === p.item_name)?._id ||
          p.item_name,
        quantity: p.quantity || "",
        produce_quantity: p.produce_quantity || "",
        remain_quantity: p.remain_quantity || "",
        category:
          p.category ||
          Inventorydata.find((i) => i.name === p.item_name)?.category ||
          "",
        uom:
          p.uom || Inventorydata.find((i) => i.name === p.item_name)?.uom || "",
        product_type:
          p.product_type ||
          Inventorydata.find((i) => i.name === p.item_name)
            ?.product_or_service ||
          "",
      }));
      setProducts(formattedProducts);
      setEditMode(true);
      setShowModal(true);
    }
  };

  const handleDelete = async (_id) => {
    if (
      window.confirm("Are you sure you want to delete this purchase order?")
    ) {
      try {
        await DeletePurchaseOrder(_id);
        setPOData((prev) => ({
          ...prev,
          pos: prev.pos.filter((order) => order._id !== _id),
        }));
      } catch (error) {
        console.error(error);
      }
    }
  };

  // search + filter
  const filteredPurchaseOrders = POData?.pos?.filter((po) => {
    const query = searchQuery.toLowerCase();
    return (
      po.po_number?.toLowerCase().includes(query) ||
      po.supplier?.name?.toLowerCase().includes(query) ||
      po.products?.some((p) => p.item_name?.toLowerCase().includes(query))
    );
  });

  const handleRefresh = async () => {
    const updated = await GetAllPurchaseOrders(page);
    setPOData(updated);
    setSearchQuery("");
  };

  const handleDownload = () => {
    if (!POData?.pos?.length) return;
    const rows = POData.pos.map((po) => ({
      "PO Number": po.po_number,
      Supplier: po.supplier?.name,
      Products: po.products?.map((p) => p.item_name).join(", "),
      Status: po.status,
    }));
    const csv =
      "data:text/csv;charset=utf-8," +
      [
        Object.keys(rows[0]).join(","),
        ...rows.map((r) => Object.values(r).join(",")),
      ].join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csv);
    link.download = "purchase_orders.csv";
    link.click();
  };

  return (
    <div className="p-6 font-sans relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Purchase Order</h2>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setShowModal(true);
              setEditMode(false);
              setViewMode(false);
              formik.resetForm();
              setProducts([
                {
                  item_name: "",
                  quantity: "",
                  produce_quantity: "",
                  remain_quantity: "",
                  category: "",
                  uom: "",
                  product_type: "",
                },
              ]);
            }}
            className="bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Purchase
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search Purchase Orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-55 text-sm 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg cursor-pointer border ml-3 border-gray-300 hover:bg-gray-100 transition"
          >
            <RefreshCw size={16} />
          </button>

          <button
            onClick={handleDownload}
            className="p-2 rounded-lg border cursor-pointer border-gray-300 hover:bg-gray-100 transition"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl mt-10 shadow-md border border-gray-100">
        <table className="min-w-full border-collapse text-sm text-left">
          <thead>
            <tr className="bg-linear-to-r from-blue-600 to-sky-500 text-white uppercase text-xs tracking-wide">
              {["PO No", "Supplier", "Product Count", "Status", "Actions"].map(
                (h, i) => (
                  <th key={i} className="py-3 px-4 text-center font-semibold">
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-gray-500 italic bg-gray-50"
                >
                  Loading...
                </td>
              </tr>
            ) : filteredPurchaseOrders?.length > 0 ? (
              filteredPurchaseOrders.map((order, i) => (
                <tr
                  key={order._id}
                  className={`transition-all ${
                    i % 2 ? "bg-white" : "bg-gray-50"
                  } hover:bg-blue-50`}
                >
                  <td className="py-3 px-4 text-center">
                    {order.po_number || "--"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {order.supplier?.name || "N/A"}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {order.products?.length || 0}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="bg-green-100 px-3 py-1 text-green-700 rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                      {order.status || "--"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-3">
                      <Edit
                        onClick={() => handleEdit(order._id)}
                        className="h-4 w-4 text-blue-500 cursor-pointer"
                      />
                      <Trash2
                        onClick={() => handleDelete(order._id)}
                        className="h-4 w-4 text-red-500 cursor-pointer"
                      />
                      <Download
                        className="h-4 w-4 text-green-700 cursor-pointer"
                        onClick={() => {}}
                      />
                      <Eye
                        onClick={() => handleView(order._id)}
                        className="h-4 w-4 text-gray-600 cursor-pointer"
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-gray-400 italic bg-gray-50"
                >
                  No matching purchase orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 flex justify-end bg-black/40 z-50 transition-opacity">
          <div className="bg-white w-full max-w-2xl h-full shadow-2xl transform transition-all duration-500 ease-out">
            {/* Header */}
            <div className="flex justify-between items-center p-5 border-b bg-linear-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-semibold text-gray-800">
                {viewMode
                  ? "View Purchase Order"
                  : editMode
                  ? "Edit Purchase Order"
                  : "Add Purchase Order"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl transition"
              >
                <X />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[85vh]">
              <form onSubmit={formik.handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Select Supplier
                  </label>
                  <select
                    name="supplier"
                    value={formik.values.supplier}
                    onChange={formik.handleChange}
                    disabled={viewMode}
                    className="border w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Select supplier</option>
                    {supplierData?.map((s) => (
                      <option key={s._id} value={s._id} className="capitalize">
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {products.map((item, index) => (
                  <div
                    key={index}
                    className="p-4 border border-gray-200 rounded-xl bg-gray-50 relative space-y-4"
                  >
                    {!viewMode && products.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      >
                        <Trash size={16} />
                      </button>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-1">
                          Item
                        </label>
                        <select
                          name="item_name"
                          value={item.item_name}
                          onChange={(e) => handleItemChange(index, e)}
                          disabled={viewMode}
                          className="border w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          <option value="">Select Item</option>
                          {rawMaterialsOnly && rawMaterialsOnly.length > 0 ? (
                            rawMaterialsOnly.map((i) => (
                              <option key={i._id} value={i._id}>
                                {i.name}
                              </option>
                            ))
                          ) : (
                            <option value="" disabled>
                              No raw materials available
                            </option>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-1">
                          Category
                        </label>
                        <input
                          type="text"
                          value={item.category}
                          readOnly
                          className="border w-full px-3 py-2 rounded-lg bg-gray-100"
                        />
                      </div>

                      <div>
                        <label className="block text-gray-700 font-medium mb-1">
                          UOM
                        </label>
                        <input
                          type="text"
                          value={item.uom}
                          readOnly
                          className="border w-full px-3 py-2 rounded-lg bg-gray-100"
                        />
                      </div>

                      {/* <div>
                        <label className="block text-gray-700 font-medium mb-1">
                          Product / Service
                        </label>
                        <input
                          type="text"
                          value={item.product_type}
                          readOnly
                          className="border w-full px-3 py-2 rounded-lg bg-gray-100"
                        />
                      </div> */}

                      {/* ["quantity", "produce_quantity", "remain_quantity"].map(
                        (field) => (
                          <div key={field}>
                            <label className="block text-gray-700 font-medium mb-1 capitalize">
                              {field.replace("_", " ")}
                            </label>
                            <input
                              type="number"
                              name={field}
                              value={item[field]}
                              onChange={(e) => handleItemChange(index, e)}
                              disabled={viewMode}
                              className="border w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                            />
                          </div>
                        )
                      )} */}

                      {["quantity"].map((field) => (
                        <div key={field}>
                          <label className="block text-gray-700 font-medium mb-1 capitalize">
                            {field.replace("_", " ")}
                          </label>
                          <input
                            type="number"
                            name={field}
                            value={item[field]}
                            onChange={(e) => handleItemChange(index, e)}
                            disabled={viewMode}
                            className="border w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {!viewMode && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                    >
                      <PlusCircle size={18} /> Add Item
                    </button>
                  </div>
                )}

                {!viewMode && (
                  <button
                    type="submit"
                    className="w-full bg-linear-to-r from-blue-500 to-indigo-600 text-white py-2.5 rounded-lg shadow-md hover:scale-105 transition"
                  >
                    {editMode ? "Update" : "Submit"}
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      <Pagination
        page={page}
        setPage={setPage}
        hasNextPage={POData?.pos?.length === 10}
      />
    </div>
  );
};

export default PurchaseOrder;
