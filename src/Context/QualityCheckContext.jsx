import React, { createContext, useContext, useState, useEffect } from "react";
import axiosHandler from "../config/axiosconfig";
import { toast } from "react-toastify";

const QualityCheckContext = createContext();

export const QualityCheckProvider = ({ children }) => {
  const [qualityReports, setQualityReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1)
  // Fetch all
  const getAllReports = async () => {
    try {
      setLoading(true);
      const res = await axiosHandler.get(`/quality-check?page=${page}&limit=10`, {
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

  // console.log(qualityReports)
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


   const ChangesStatus = async(_id) =>{
    try {
      const res = await axiosHandler.patch(`/gateman/change-status/${_id}`)
      toast.success(res?.data?.message)
    } catch (error) {
       console.log(error)
    }
   }

  useEffect(() => {
    getAllReports();
  }, [page]);

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
        ChangesStatus,
        page,
        setPage
      }}
    >
      {children}
    </QualityCheckContext.Provider>
  );
};

export const useQualityCheck = () => useContext(QualityCheckContext);
