import React, { createContext, useContext, useEffect, useState } from "react";
import axiosHandler from "@/config/axiosconfig";

const ProductionContext = createContext();

export const ProductionProvider = ({ children }) => {
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(false);

  //  Fetch all productions
  const getAllProductions = async () => {
    try {
      setLoading(true);
      const res = await axiosHandler.get("/production/all");
      setProductions(res?.data?.productions || []);
    } catch (error) {
      setProductions([]);
    } finally {
      setLoading(false);
    }
  };


  // Fetch on mount
  useEffect(() => {
    getAllProductions();
  }, []);

  //  Derived data: total count
  const totalProductions = productions.length;


  return (
    <ProductionContext.Provider
      value={{
        productions,
        loading,
        totalProductions,
        getAllProductions,
      }}
    >
      {children}
    </ProductionContext.Provider>
  );
};

//  Hook to use it anywhere
export const useProductionContext = () => useContext(ProductionContext);
