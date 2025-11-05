import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { usePurchanse_Order } from "@/Context/PurchaseOrderContext";
import { Edit, Eye, Trash2, X, PlusCircle, Trash } from "lucide-react";
import { useSupplierContext } from "@/Context/SuplierContext";
import { useInventory } from "@/Context/InventoryContext";
import Pagination from "@/Components/Pagination/Pagination";

const PurchaseOrder = () => {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [viewMode, setViewMode] = useState(false);
  const [POData, setPOData] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [page,setPage] = useState(1)

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
  const [products, setProducts] = useState([
    {
      item_name: "",
      est_quantity: "",
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

      await GetAllPurchaseOrders(page);
      setShowModal(false);
      setEditMode(false);
      setViewMode(false);
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      const sup = await getAllSupplier();
      const inv = await getAllProducts();
      setSupplierData(sup || []);
      setInventoryData(inv?.products || []);
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
        est_quantity: "",
        produce_quantity: "",
        remain_quantity: "",
        category: "",
        uom: "",
        product_type: "",
      },
    ]);
  };

  const handleRemoveItem = (index) => {
    const updated = products.filter((_, i) => i !== index);
    setProducts(updated);
  };

  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const updated = [...products];
    updated[index][name] = value;

    if (name === "item_name") {
      const selected = Inventorydata.find((p) => p._id === value);
      if (selected) {
        updated[index].category = selected.category || "";
        updated[index].uom = selected.uom || "";
        updated[index].product_type = selected.product_or_service || "";
      }
    }
    setProducts(updated);
  };
  console.log(POData)
  const handleView = async (id) => {
    const res = await GetPurchaseOrderDetails(id);
    const po = res?.po || res;

    if (po) {
      formik.setValues({
        supplier: po.supplier?._id || "",
      });

      const formattedProducts = po.products.map((p) => ({
        item_name:
          p.item_name?._id ||
          Inventorydata.find((i) => i.name === p.item_name)?._id ||
          p.item_name,
        est_quantity: p.est_quantity || "",
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

      formik.setValues({
        supplier: po.supplier?._id || "",
      });

      const formattedProducts = po.products.map((p) => ({
        item_name:
          p.item_name?._id ||
          Inventorydata.find((i) => i.name === p.item_name)?._id ||
          p.item_name,
        est_quantity: p.est_quantity || "",
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
        toast.success("Purchase order deleted successfully");
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete purchase order");
      }
    }
  };

  return (
    <div className="p-6 font-sans relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Purchase Order</h2>
        <button
          onClick={() => {
            setShowModal(true);
            setEditMode(false);
            setViewMode(false);
            formik.resetForm();
            setProducts([
              {
                item_name: "",
                est_quantity: "",
                produce_quantity: "",
                remain_quantity: "",
                category: "",
                uom: "",
                product_type: "",
              },
            ]);
          }}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded shadow-lg hover:scale-105 transition-transform"
        >
          Add Purchase Order
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-2xl shadow-md border border-gray-100">
        <table className="min-w-full border-collapse text-sm text-left">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-sky-500 text-white uppercase text-xs tracking-wide">
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
            ) : POData?.pos?.length > 0 ? (
              POData.pos.map((order, i) => (
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
                      <Eye
                        onClick={() => handleView(order._id)}
                        className="text-blue-500 cursor-pointer"
                      />
                      <Edit
                        onClick={() => handleEdit(order._id)}
                        className="text-green-500 cursor-pointer"
                      />
                      <Trash2
                        onClick={() => handleDelete(order._id)}
                        className="text-red-500 cursor-pointer"
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
                  No purchase orders found.
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
            <div className="flex justify-between items-center p-5 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
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
                {/* Supplier Dropdown */}
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
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Products */}
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
                      {/* Product Dropdown */}
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
                          {Inventorydata?.map((i) => (
                            <option key={i._id} value={i._id}>
                              {i.name}
                            </option>
                          ))}
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

                      <div>
                        <label className="block text-gray-700 font-medium mb-1">
                          Product / Service
                        </label>
                        <input
                          type="text"
                          value={item.product_type}
                          readOnly
                          className="border w-full px-3 py-2 rounded-lg bg-gray-100"
                        />
                      </div>

                      {[
                        "est_quantity",
                        "produce_quantity",
                        "remain_quantity",
                      ].map((field) => (
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
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2.5 rounded-lg shadow-md hover:scale-105 transition"
                  >
                    {editMode ? "Update" : "Submit"}
                  </button>
                )}
              </form>
            </div>
          </div>
        </div>
      )}

      <Pagination page={page} setPage={setPage} hasNextPage={POData?.pos?.length === 10}  />
    </div>
  );
};

export default PurchaseOrder;
