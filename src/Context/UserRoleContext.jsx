// src/context/UserRoleContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import axiosHandler from "@/config/axiosconfig";
import { useAuth } from "./AuthContext";

const UserRoleContext = createContext();


export const UserRoleProvider = ({ children }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useAuth()

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const { data } = await axiosHandler.get(`/role`);
      setRoles(data.roles);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };


  const createRole = async (roleData) => {
    try {
      setLoading(true);
      const { data } = await axiosHandler.post(`/role`, roleData);
      setRoles((prev) => [data.role, ...prev]);
      return data.role;
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };


  const editRole = async (updatedData,) => {
    try {
      setLoading(true);
      const { data } = await axiosHandler.put(`/role`, updatedData);
      setRoles((prev) =>
        prev.map((r) => (r._id === data.role._id ? data.role : r))
      );
  
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update role");
    } finally {
      setLoading(false);
    }
  };

 
  const deleteRole = async (_id) => {
    try {
      setLoading(true);
      await axiosHandler.delete(`/role`, { data: { _id } });
      setRoles((prev) => prev.filter((r) => r._id !== _id));
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
   if(token){
     fetchRoles();
   }
  }, [token]);

  return (
    <UserRoleContext.Provider
      value={{
        roles,
        loading,
        error,
        fetchRoles,
        createRole,
        editRole,
        deleteRole,
      }}
    >
      {children}
    </UserRoleContext.Provider>
  );
};

export const useUserRole = () => useContext(UserRoleContext);
