import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Loader2, Lock, Mail, Factory, Phone } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Register = () => {
  const { register, checkAdminExists } = useAuth();
  const navigate = useNavigate();
  const [adminExists, setAdminExists] = useState(false);
  const [checking, setChecking] = useState(true);

  const formik = useFormik({
    initialValues: {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: Yup.object({
      first_name: Yup.string()
        .min(2, "First Name must be at least 2 characters")
        .max(40, "First Name cannot exceed 40 characters")
        .required("First Name is required"),
      last_name: Yup.string().max(40, "Last Name cannot exceed 40 characters"),
      phone: Yup.string()
        .matches(/^[7-9]\d{9}$/, "Please provide a valid Indian mobile number")
        .required("Phone number is required"),
      email: Yup.string().email("Invalid email address").required("Email is required"),
      password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm password is required"),
    }),
    onSubmit: async (values, { setSubmitting, setStatus }) => {
      // Check if admin exists before submitting
      if (adminExists) {
        toast.error("Admin already exists. Please contact the existing admin.");
        setSubmitting(false);
        return;
      }

      try {
        setStatus(null);

        const payload = {
          ...values,
          first_name: values.first_name.charAt(0).toUpperCase() + values.first_name.slice(1),
          last_name:
            values.last_name.length > 0
              ? values.last_name.charAt(0).toUpperCase() + values.last_name.slice(1)
              : "",
        };
        delete payload.confirmPassword;
        await register(payload);
        navigate("/verify-email");
      } catch (error) {
        console.log(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Check if admin exists on component mount
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        setChecking(true);
        const exists = await checkAdminExists();
        setAdminExists(exists);
      } catch (error) {
        console.error("Error checking admin:", error);
      } finally {
        setChecking(false);
      }
    };
    checkAdmin();
  }, [checkAdminExists]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-900 via-slate-900 to-indigo-900 overflow-hidden text-white">
      {/* Glowing Orbs */}
      <motion.div
        className="absolute -top-40 -left-40 w-[28rem] h-[28rem] bg-cyan-500/20 rounded-full blur-3xl"
        animate={{ x: [0, 40, -30, 0], y: [0, -40, 30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[25rem] h-[25rem] bg-indigo-500/20 rounded-full blur-3xl"
        animate={{ x: [0, -30, 30, 0], y: [0, 30, -20, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.4)] rounded-3xl p-10 w-full max-w-5xl max-h-[600px] overflow-hidden"
        style={{ display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <motion.div
          initial={{ y: -10 }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center mb-8"
        >
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-2xl shadow-lg">
            <Factory size={40} className="text-white" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-wide bg-gradient-to-r from-cyan-300 to-blue-400 text-transparent bg-clip-text">
            Create Account
          </h1>
          <p className="text-slate-300 text-sm">Join Production Automation Platform</p>
        </motion.div>

        {/* Error */}
        {formik.status && (
          <div className="text-red-300 text-sm bg-red-900/40 p-2 rounded mb-3 text-center border border-red-500/30">
            {formik.status}
          </div>
        )}

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="flex gap-6 flex-nowrap overflow-y-auto form-scrollbar" style={{ flex: 1 }}>
          {/* Left column */}
          <div className="flex-1 min-w-[320px] space-y-5">
            {/* First Name */}
            <div>
              <label className="text-sm font-semibold text-slate-300">First Name</label>
              <input
                type="text"
                name="first_name"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.first_name}
                className="w-full mt-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-slate-400 outline-none"
                placeholder="Your first name"
              />
              {formik.touched.first_name && formik.errors.first_name && (
                <p className="text-red-300 text-xs mt-1">{formik.errors.first_name}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="text-sm font-semibold text-slate-300">Last Name (optional)</label>
              <input
                type="text"
                name="last_name"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.last_name}
                className="w-full mt-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-slate-400 outline-none"
                placeholder="Your last name"
              />
              {formik.touched.last_name && formik.errors.last_name && (
                <p className="text-red-300 text-xs mt-1">{formik.errors.last_name}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-semibold text-slate-300">Phone</label>
              <div className="flex items-center mt-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2">
                <Phone size={18} className="text-cyan-300 mr-2" />
                <input
                  type="text"
                  name="phone"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.phone}
                  className="w-full bg-transparent outline-none text-white placeholder-slate-400"
                  placeholder="e.g. 9876543210"
                />
              </div>
              {formik.touched.phone && formik.errors.phone && (
                <p className="text-red-300 text-xs mt-1">{formik.errors.phone}</p>
              )}
            </div>
          </div>

          {/* Right column */}
          <div className="flex-1 min-w-[320px] space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-slate-300">Email</label>
              <div className="flex items-center mt-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2">
                <Mail size={18} className="text-cyan-300 mr-2" />
                <input
                  type="email"
                  name="email"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.email}
                  className="w-full bg-transparent outline-none text-white placeholder-slate-400"
                  placeholder="you@example.com"
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="text-red-300 text-xs mt-1">{formik.errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-slate-300">Password</label>
              <div className="flex items-center mt-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2">
                <Lock size={18} className="text-cyan-300 mr-2" />
                <input
                  type="password"
                  name="password"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.password}
                  className="w-full bg-transparent outline-none text-white placeholder-slate-400"
                  placeholder="Enter password"
                />
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-300 text-xs mt-1">{formik.errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-sm font-semibold text-slate-300">Confirm Password</label>
              <div className="flex items-center mt-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2">
                <Lock size={18} className="text-cyan-300 mr-2" />
                <input
                  type="password"
                  name="confirmPassword"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.confirmPassword}
                  className="w-full bg-transparent outline-none text-white placeholder-slate-400"
                  placeholder="Re-enter password"
                />
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-red-300 text-xs mt-1">{formik.errors.confirmPassword}</p>
              )}
            </div>
          </div>
        </form>

        {/* Submit button */}
        <motion.button
          whileHover={!adminExists ? {
            scale: 1.05,
            boxShadow: "0px 0px 25px rgba(0,255,255,0.5)",
          } : {}}
          whileTap={!adminExists ? { scale: 0.97 } : {}}
          type="submit"
          disabled={formik.isSubmitting || adminExists || checking}
          className={`w-full py-2.5 rounded-xl font-semibold shadow-lg transition-all duration-300 mt-6 ${
            adminExists || checking
              ? "bg-gray-500 cursor-not-allowed text-white"
              : "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 text-white"
          }`}
          onClick={(e) => {
            if (adminExists) {
              toast.error("Admin already exists. Please contact the existing admin.");
              e.preventDefault();
              return;
            }
            formik.handleSubmit(e);
          }}
          style={{ marginTop: 24 }}
        >
          {checking ? (
            <Loader2 size={20} className="animate-spin mx-auto" />
          ) : formik.isSubmitting ? (
            <Loader2 size={20} className="animate-spin mx-auto" />
          ) : adminExists ? (
            "Registration Disabled - Admin Exists"
          ) : (
            "Register"
          )}
        </motion.button>

        <p className="text-sm text-center mt-6 text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-cyan-400 font-semibold hover:underline hover:text-blue-300 transition"
          >
            Login
          </Link>
        </p>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-cyan-900/40 to-transparent"></div>
    </div>
  );
};

export default Register;
