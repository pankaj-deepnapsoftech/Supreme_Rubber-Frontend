import axiosHandler from "@/config/axiosconfig";
import { createContext, useContext, useState } from "react";
import { toast } from "react-toastify";

export const SupplierContext = createContext();

export const SupplierProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);

  
    const createSupplier = async (data) => {
        try {
            setLoading(true);
            const res = await axiosHandler.post("/supplier", data);
            toast.success(res?.data?.message || "Supplier created successfully!");
            await getAllSupplier();
            return res.data;
        } catch (error) {
            console.error("❌ Error creating supplier:", error);
            toast.error(error?.response?.data?.message || "Failed to create supplier");
            throw error;
        } finally {
            setLoading(false);
        }
    };

  
    const updateSupplier = async (_id, updates) => {
        try {
            setLoading(true);
            const res = await axiosHandler.put("/supplier", { _id, ...updates });
            toast.success(res?.data?.message || "Supplier updated successfully!");
            await getAllSupplier();
            return res.data;
        } catch (error) {
            console.error("❌ Error updating supplier:", error);
            toast.error(error?.response?.data?.message || "Failed to update supplier");
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const deleteSupplier = async (id) => {
        try {
            setLoading(true);
            const res = await axiosHandler.delete("/supplier", { data: { id } });
            toast.success(res?.data?.message || "Supplier deleted successfully!");
            await getAllSupplier();
            return res.data;
        } catch (error) {
            console.error("❌ Error deleting supplier:", error);
            toast.error(error?.response?.data?.message || "Failed to delete supplier");
            throw error;
        } finally {
            setLoading(false);
        }
    };

  
    const getAllSupplier = async (page) => {
        try {
            setLoading(true);
            const res = await axiosHandler.get(`/supplier/all?page=${page}&limit=10`);
            
            return res.data?.suppliers;
        } catch (error) {
            console.error("❌ Error fetching all suppliers:", error);
            toast.error(error?.response?.data?.message || "Failed to fetch suppliers");
            throw error;
        } finally {
            setLoading(false);
        }
    };

   
    const getSupplierDetails = async (id) => {
        try {
            setLoading(true);
            const res = await axiosHandler.get(`/supplier/${id}`);
            return res.data?.supplier;
        } catch (error) {
            console.error("❌ Error fetching supplier details:", error);
            toast.error(error?.response?.data?.message || "Failed to fetch supplier details");
            throw error;
        } finally {
            setLoading(false);
        }
    };

  
    return (
        <SupplierContext.Provider
            value={{
                createSupplier,
                updateSupplier,
                deleteSupplier,
                getAllSupplier,
                getSupplierDetails,
                loading,
            }}
        >
            {children}
        </SupplierContext.Provider>
    );
};

export const useSupplierContext = () => useContext(SupplierContext);
