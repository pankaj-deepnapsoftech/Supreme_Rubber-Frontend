import axiosHandler from "@/config/axiosconfig";
import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]); 
 const [token,settoken] = useState(null)
  // Load user/token from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");
    settoken(storedToken)
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      axiosHandler.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }

    setLoading(false);
  }, []);

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

const getAllUsers = async () => {
  try {
    const res = await axiosHandler.get("/auth/all");
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
    await getAllUsers();
    return res.data;
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update user role");
    throw error;
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
        token
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
