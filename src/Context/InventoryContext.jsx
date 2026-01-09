import React, { createContext, useContext, useEffect, useState } from "react";
import axiosHandler from "@/config/axiosconfig";
import { toast } from "react-toastify";

export const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // ==================== 📦 PRODUCT API CALLS ====================

  const createProduct = async (data, currentPage = 1) => {
    try {
      const res = await axiosHandler.post("/product", data);
      await getAllProducts(currentPage); // Refresh list with current page
      toast.success("Product created successfully");
      return res.data;
    } catch (error) {
      console.error("❌ Error creating product:", error);
      toast.error("Failed to create product");
      throw error;
    }
  };

  const updateProduct = async (data, currentPage = 1) => {
    try {
      const res = await axiosHandler.put("/product", data);
      await getAllProducts(currentPage); // Refresh list with current page
      toast.success("Product updated successfully");
      return res.data;
    } catch (error) {
      console.error("❌ Error updating product:", error);
      toast.error("Failed to update product");
      throw error;
    }
  };

  const deleteProduct = async (id, currentPage = 1) => {
    try {
      const res = await axiosHandler.delete("/product", { data: { id } });
      await getAllProducts(currentPage); // Refresh list with current page
      toast.success("Product deleted successfully");
      return res.data;
    } catch (error) {
      console.error("❌ Error deleting product:", error);
      toast.error("Failed to delete product");
      throw error;
    }
  };

  const getAllProducts = async (page) => {
    try {
      setLoading(true);
      const res = await axiosHandler.get(`/product/all?page=${page}&limit=10`);
      setProducts(res?.data?.products || []);
      return res.data;
    } catch (error) {
      console.error("❌ Error fetching all products:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getProductDetails = async (id) => {
    try {
      const res = await axiosHandler.get(`/product/${id}`);

      return res.data?.product;
    } catch (error) {
      console.error("❌ Error fetching product details:", error);
      throw error;
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        products,
        loading,
        createProduct,
        updateProduct,
        deleteProduct,
        getAllProducts,
        getProductDetails,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => useContext(InventoryContext);
