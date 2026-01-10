import axiosHandler from "@/config/axiosconfig";
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]); 
 const [token,settoken] = useState(null)
  
  // Function to refresh current user data from server
  const refreshUserData = useCallback(async () => {
    try {
      const res = await axiosHandler.get("/auth/user");
      const updatedUser = res?.data?.user;
      if (updatedUser) {
        delete updatedUser.password;
        // Always update with fresh data from server
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser;
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
      // If refresh fails (e.g., 401/403), user might have been logged out or permissions changed
      // Keep the localStorage data and let the user continue with cached data
      return null;
    }
  }, []);

  // Load user/token from localStorage and refresh from server
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    settoken(storedToken)
    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      axiosHandler.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      
      // Refresh user data from server to get latest role/permissions after setting token
      refreshUserData().finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [refreshUserData]);

  // Refresh user data when tab/window becomes visible (user switches back to app)
  useEffect(() => {
    if (!token || !user) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Refresh user data when user comes back to the tab
        refreshUserData();
      }
    };

    const handleFocus = () => {
      // Also refresh when window regains focus
      refreshUserData();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [token, user, refreshUserData]);

  // ========================= AUTH METHODS =========================

  const register = async (userData) => {
    try {
      const res = await axiosHandler.post("/auth", userData);
      const { user, token } = res.data;

      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      axiosHandler.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      toast.success(res?.data?.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axiosHandler.post("/auth/login", { email, password });
      const { user, token } = res.data;

      setUser(user);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);
      axiosHandler.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      toast.success(res?.data?.message || "Login successful");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
      throw err.response?.data || err;
    }
  };

  const logout = () => {
    setUser(null);
    setAllUsers([]); 
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axiosHandler.defaults.headers.common["Authorization"];
    toast.info("Logged out successfully");
  };

  // ========================= PASSWORD / OTP =========================

  const forgotepass = async (email) => {
    try {
      const res = await axiosHandler.post("/auth/reset-password-request", { email });
      toast.success(res?.data?.message || "OTP sent to your email!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
      throw error;
    }
  };

  const resetepass = async (email, otp, password) => {
    try {
      const res = await axiosHandler.post("/auth/reset-password", { email, otp, password });
      toast.success(res?.data?.message || "Password reset successfully!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
      throw error;
    }
  };

  const verifyEmail = async (email, otp) => {
    try {
      const res = await axiosHandler.post("/auth/verify", { email, otp });
      toast.success(res?.data?.message || "Email verified successfully!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed!");
      throw error;
    }
  };

  const resendOtp = async (email) => {
    try {
      const res = await axiosHandler.post("/auth/resend-otp", { email });
      toast.success(res?.data?.message || "OTP resent successfully!");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
      throw error;
    }
  };

 // ========================= USERS =========================

const getAllUsers = async (page) => {
  try {
    const res = await axiosHandler.get(`/auth/all?page=${page}&limit=10`);
    let users = res?.data?.users || [];
    users = users.filter((u) => !u.isSuper);
    setAllUsers(users);
    return users;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to fetch users");
    throw error;
  }
};

const getUserById = async (id) => {
  try {
    const res = await axiosHandler.get(`/auth/user/${id}`);
    return res.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to fetch user details");
    throw error;
  }
};

const updateUserRole = async (id, role) => {
  try {
    const res = await axiosHandler.put(`/auth/user`, { id, role });
    toast.success(res?.data?.message || "User role updated successfully!");
    
    // Check if the updated user is the current logged-in user
    const updatedUser = res?.data?.user;
    const currentUserId = user?._id?.toString();
    const updatedUserId = updatedUser?._id?.toString();
    const requestUserId = id?.toString();
    
    if (currentUserId && (currentUserId === requestUserId || currentUserId === updatedUserId)) {
      // Refresh current user's data from server to get latest role with populated permissions
      await refreshUserData();
      toast.info("Your permissions have been updated. Changes will be visible after page refresh.");
    }
    
    await getAllUsers();
    return res.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update user role");
    throw error;
  }
};

const deleteUser = async (id) => {
  try {
    const res = await axiosHandler.delete("/auth/user", {
      data: { _id: id }, 
    });

    toast.success(res?.data?.message || "User deleted successfully!");
    await getAllUsers(); // refresh user list after deletion
  } catch (error) {
    console.error("Error deleting user:", error.response?.data || error);
    toast.error(error.response?.data?.message || "Failed to delete user");
  }
};

const createEmployee = async (employeeData) => {
  try {
    const res = await axiosHandler.post("/auth/employee", employeeData);
    toast.success(res?.data?.message || "Employee created successfully!");
    return res.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to create employee");
    throw error;
  }
};

const checkAdminExists = async () => {
  try {
    const res = await axiosHandler.get("/auth/check-admin");
    return res.data.adminExists;
  } catch (error) {
    console.error("Error checking admin:", error);
    return false;
  }
};







  // ========================= PROVIDER =========================

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        register,
        login,
        logout,
        forgotepass,
        resetepass,
        verifyEmail,
        resendOtp,
        getAllUsers,
        getUserById,
        allUsers, 
        setAllUsers,
        updateUserRole,
        deleteUser,
        createEmployee,
        checkAdminExists,
        refreshUserData,
        token
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
