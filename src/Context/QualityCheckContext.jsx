import React, { createContext, useContext, useState, useEffect } from "react";
import axiosHandler from "../config/axiosconfig";

const QualityCheckContext = createContext();

export const QualityCheckProvider = ({ children }) => {
  const [qualityReports, setQualityReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch all
  const getAllReports = async () => {
    try {
      setLoading(true);
      const res = await axiosHandler.get("/quality-check", {
        withCredentials: true,
      });
      console.log(res);
      setQualityReports(res.data?.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get one
  const getReportById = async (id) => {
    try {
      setLoading(true);
      const res = await axiosHandler.get(`/quality-check/${id}`, {
        withCredentials: true,
      });
      setSelectedReport(res.data.data);
      return res.data.data;
    } catch (err) {
      console.error("Detail fetch error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create
  const createReport = async (formData) => {
    try {
      setLoading(true);
      const res = await axiosHandler.post("/quality-check", formData, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      await getAllReports();
      return res.data.data;
    } catch (err) {
      console.error("Create error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update
  const updateReport = async (id, updatedData) => {
    try {
      setLoading(true);
      const res = await axiosHandler.put(`/quality-check/${id}`, updatedData, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });
      await getAllReports();
      return res.data.data;
    } catch (err) {
      console.error("Update error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete
  const deleteReport = async (_id) => {
    try {
      setLoading(true);
      await axiosHandler.delete(`/quality-check/${_id}`, {
        withCredentials: true,
      });
      setQualityReports((prev) => prev.filter((r) => r._id !== _id));
    } catch (err) {
      console.error("Delete error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllReports();
  }, []);

  return (
    <QualityCheckContext.Provider
      value={{
        qualityReports,
        selectedReport,
        loading,
        getAllReports,
        getReportById,
        createReport,
        updateReport,
        deleteReport,
        setSelectedReport,
      }}
    >
      {children}
    </QualityCheckContext.Provider>
  );
};

export const useQualityCheck = () => useContext(QualityCheckContext);
