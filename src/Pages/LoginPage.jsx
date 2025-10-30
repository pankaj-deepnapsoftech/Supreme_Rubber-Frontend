import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { Loader2, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // 👁️ State for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      password: Yup.string().min(4, "Too short!").required("Password is required"),
    }),

    onSubmit: async (values, { setSubmitting, setStatus }) => {
      setStatus("");
      try {
        await login(values.email, values.password);
        navigate("/");
      } catch (error) {
        setStatus("Invalid credentials. Please try again.");
      }
      setSubmitting(false);
    },
  });

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-900 via-slate-900 to-indigo-900 overflow-hidden text-white">
      {/* Background animated blobs */}
      <motion.div
        className="absolute -top-40 -left-40 w-[28rem] h-[28rem] bg-cyan-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -40, 30, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-[25rem] h-[25rem] bg-indigo-500/20 rounded-full blur-3xl"
        animate={{
          x: [0, -30, 30, 0],
          y: [0, 30, -20, 0],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.4)] rounded-3xl p-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <h1 className="text-4xl font-bold tracking-wide bg-gradient-to-r from-cyan-300 to-blue-400 text-transparent bg-clip-text">
            Sign In
          </h1>
          <p className="text-slate-400 text-sm mt-2">Access your account</p>
        </div>

        {/* Error Message */}
        {formik.status && (
          <div className="text-red-300 text-sm bg-red-900/40 p-2 rounded mb-3 text-center border border-red-500/30">
            {formik.status}
          </div>
        )}

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="text-sm font-semibold text-slate-300">Email</label>
            <div className="flex items-center mt-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-cyan-400 transition">
              <Mail size={18} className="text-cyan-300 mr-2" />
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                {...formik.getFieldProps("email")}
                className="w-full bg-transparent outline-none text-white placeholder-slate-400"
              />
            </div>
            {formik.touched.email && formik.errors.email && (
              <p className="text-xs text-red-400 mt-1">{formik.errors.email}</p>
            )}
          </div>

          {/* Password Field with Toggle */}
          <div>
            <label className="text-sm font-semibold text-slate-300">Password</label>
            <div className="flex items-center mt-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-cyan-400 transition relative">
              <Lock size={18} className="text-cyan-300 mr-2" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                {...formik.getFieldProps("password")}
                className="w-full bg-transparent outline-none text-white placeholder-slate-400 pr-8"
              />
              {/* 👁️ Toggle Password Button */}
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 text-cyan-300 hover:text-blue-300 transition"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-xs text-red-400 mt-1">{formik.errors.password}</p>
            )}

            <p className="text-right text-sm mt-2">
              <Link
                to="/forgot-password"
                className="text-cyan-400 hover:text-blue-300 hover:underline transition"
              >
                Forgot Password?
              </Link>
            </p>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={!formik.isSubmitting ? { scale: 1.05 } : {}}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={formik.isSubmitting}
            className={`w-full py-2.5 rounded-xl font-semibold flex justify-center items-center transition-all duration-300 ${
              formik.isSubmitting
                ? "bg-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 hover:shadow-[0_0_20px_rgba(0,255,255,0.4)]"
            }`}
          >
            {formik.isSubmitting ? (
              <Loader2 size={22} className="animate-spin text-white" />
            ) : (
              "Login"
            )}
          </motion.button>
        </form>

        {/* Register Link */}
        <p className="text-sm text-center mt-6 text-slate-400">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-cyan-400 font-semibold hover:underline hover:text-blue-300 transition"
          >
            Register
          </Link>
        </p>
      </motion.div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-cyan-900/40 to-transparent"></div>
    </div>
  );
};

export default Login;
