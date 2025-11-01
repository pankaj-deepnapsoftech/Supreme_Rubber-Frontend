import axiosHandler from "@/config/axiosconfig";
import { createContext, useContext, useState } from "react";
import { toast } from "react-toastify";

export const PurchanseOrderContext = createContext();

export const PurchanseOrderProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [purchaseOrderDetails, setPurchaseOrderDetails] = useState(null);

  

    const CreatePurchaseOrder = async (data) => {
        setLoading(true);
        try {
            const res = await axiosHandler.post("/purchase-order", data);
            toast.success(res?.data?.message);
            return res?.data;
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to create purchase order");
        } finally {
            setLoading(false);
        }
    };

    const GetAllPurchaseOrders = async () => {
        setLoading(true);
        try {
            const res = await axiosHandler.get("/purchase-order/all");
            setPurchaseOrders(res?.data?.data || []);
            return res?.data;
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to fetch purchase orders");
        } finally {
            setLoading(false);
        }
    };

   
    const GetPurchaseOrderDetails = async (id) => {
        setLoading(true);
        try {
            const res = await axiosHandler.get(`/purchase-order/${id}`);
            const data = res?.data?.po || res?.data; // normalize
            setPurchaseOrderDetails(data);
            return { po: data };
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to fetch order details");
        } finally {
            setLoading(false);
        }
    };


    const UpdatePurchaseOrder = async (data) => {
        setLoading(true);
        try {
            const res = await axiosHandler.put("/purchase-order", data);
            toast.success(res?.data?.message);
            return res?.data;
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to update purchase order");
        } finally {
            setLoading(false);
        }
    };


    const DeletePurchaseOrder = async (_id) => {
        setLoading(true);
        try {
            const res = await axiosHandler.delete("/purchase-order", {
                data: { _id }, 
            });
            GetAllPurchaseOrders() 
            toast.success(res?.data?.message);
            return res?.data;
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || "Failed to delete purchase order");
        } finally {
            setLoading(false);
        }
    };


 

    return (
        <PurchanseOrderContext.Provider
            value={{
                loading,
                purchaseOrders,
                purchaseOrderDetails,
                CreatePurchaseOrder,
                GetAllPurchaseOrders,
                GetPurchaseOrderDetails,
                UpdatePurchaseOrder,
                DeletePurchaseOrder,
              
            }}
        >
            {children}
        </PurchanseOrderContext.Provider>
    );
};

export const usePurchanse_Order = () => useContext(PurchanseOrderContext);
