import React, { createContext, useContext, useEffect, useState } from "react";
import axiosHandler from "@/config/axiosconfig";

export const InventoryContext = createContext();

export const InventoryProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // ==================== 📦 PRODUCT API CALLS ====================

  const createProduct = async (data) => {
    try {
      const res = await axiosHandler.post("/product", data);
      await getAllProducts(); // Refresh list
      return res.data;
    } catch (error) {
      console.error("❌ Error creating product:", error);
      throw error;
    }
  };

  const updateProduct = async (data) => {
    try {
      const res = await axiosHandler.put("/product", data);
      await getAllProducts();
      return res.data;
    } catch (error) {
      console.error("❌ Error updating product:", error);
      throw error;
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await axiosHandler.delete("/product", { data: { id } });
      await getAllProducts();
      return res.data;
    } catch (error) {
      console.error("❌ Error deleting product:", error);
      throw error;
    }
  };

  const getAllProducts = async () => {
    try {
      setLoading(true);
      const res = await axiosHandler.get("/product/all");
      setProducts(res?.data?.products || []);
      console.log("qlt",res)
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
