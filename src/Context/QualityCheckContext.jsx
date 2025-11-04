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
      const res = await axiosHandler.get("/quality-check", { withCredentials: true });
      console.log(res)
      const data = res?.data?.data?.filter((i)=> i?.status === "pending");
      setQualityReports(data|| []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };


  console.log(qualityReports)
  // Get one
  const getReportById = async (id) => {
    try {
      const res = await axiosHandler.get(`/quality-check/${id}`, { withCredentials: true });
      setSelectedReport(res.data?.data);
      return res.data?.data;
    } catch (err) {
      console.error("Detail fetch error:", err);
    }
  };

  // Create
  const createReport = async (formData) => {
    try {
      const res = await axiosHandler.post("/quality-check", formData, {
        withCredentials: true,
        headers: { "Content-Type": "multipart/form-data" },
      });
      await getAllReports();
      return res.data?.data;
    } catch (err) {
      console.error("Create error:", err);
    }
  };

  // Update
  const updateReport = async (updatedData) => {
    try {
      const res = await axiosHandler.put("/quality-check", updatedData, {
        withCredentials: true,
      });
      await getAllReports();
      return res.data?.data;
    } catch (err) {
      console.error("Update error:", err);
    }
  };

  // Delete
  const deleteReport = async (_id) => {
    try {
      await axiosHandler.delete("/quality-check", {
        data: { _id },
        withCredentials: true,
      });
      setQualityReports((prev) => prev.filter((r) => r._id !== _id));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

//   staus 
  const changeStatus = async (_id, newStatus) => {
console.log(_id)
    try {

      await axiosHandler.put(`/gateman/change-status/${_id}`, {
        withCredentials: true,
        });
        await getAllReports();
    } catch (err) {
        console.error("Status change error:", err);
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
        changeStatus
      }}
    >
      {children}
    </QualityCheckContext.Provider>
  );
};

export const useQualityCheck = () => useContext(QualityCheckContext);
