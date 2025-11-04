import React, { createContext, useContext, useState, useEffect } from "react";
import axiosHandler from "@/config/axiosconfig";

const BomContext = createContext();

export const BomProvider = ({ children }) => {
  const [boms, setBoms] = useState([]);
  const [filteredBoms, setFilteredBoms] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchBoms = async () => {
    try {
      setLoading(true);
      const res = await axiosHandler.get("/bom/all", { withCredentials: true });
      const data = res?.data?.boms || [];
      setBoms(data);
      setFilteredBoms(data);
    } catch (error) {
      setBoms([]);
      setFilteredBoms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoms();
  }, []);

  return (
    <BomContext.Provider
      value={{ boms, filteredBoms, loading, fetchBoms }}
    >
      {children}
    </BomContext.Provider>
  );
};

export const useBomContext = () => useContext(BomContext);
