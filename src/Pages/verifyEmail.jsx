import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, KeyRound, Factory, Loader2 } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/Context/AuthContext";
import { toast } from "react-toastify";

const VerifyEmail = () => {
  const { verifyEmail, resendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [resendBusy, setResendBusy] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      otp: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email is required"),
      otp: Yup.string()
        .length(4, "OTP must be 4 digits")
        .required("OTP is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await verifyEmail(values.email, values.otp);
        navigate("/login");
      } catch (error) {
        // toast handled in AuthContext
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Prefill email from navigation state, query params, or localStorage
  useEffect(() => {
    try {
      const stateEmail = location?.state?.email;
      const queryEmail = (() => {
        const params = new URLSearchParams(location.search || "");
        return params.get("email");
      })();
      const storedEmail = localStorage.getItem("pendingEmail");
      const nextEmail = stateEmail || queryEmail || storedEmail || "";
      if (nextEmail) {
        formik.setFieldValue("email", nextEmail, false);
      }
    } catch (_) {}
  }, [location]);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-900 via-slate-900 to-indigo-900 overflow-hidden text-white">
      {/* Animated background orbs */}
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

      {/* Verification Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.4)] rounded-3xl p-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-2xl shadow-lg">
            <Factory size={40} className="text-white" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-wide bg-gradient-to-r from-cyan-300 to-blue-400 text-transparent bg-clip-text">
            Verify Your Email
          </h1>
          <p className="text-slate-300 text-sm text-center">
            Enter your registered email and the OTP sent to it.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-5">
          {/* Email */}
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

          {/* OTP */}
          <div>
            <label className="text-sm font-semibold text-slate-300">Enter OTP</label>
            <div className="flex items-center mt-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-cyan-400 transition">
              <KeyRound size={18} className="text-cyan-300 mr-2" />
              <input
                type="text"
                name="otp"
                placeholder="4-digit OTP"
                {...formik.getFieldProps("otp")}
                className="w-full bg-transparent outline-none text-white placeholder-slate-400"
              />
            </div>
            {formik.touched.otp && formik.errors.otp && (
              <p className="text-xs text-red-400 mt-1">{formik.errors.otp}</p>
            )}
          {/* Resend OTP */}
          <button
            type="button"
            className="text-cyan-400 mt-2 text-sm hover:underline"
            onClick={async () => {
              if (!formik.values.email) {
                toast.error("Please enter your email to resend OTP");
                return;
              }
              try {
                setResendBusy(true);
                await resendOtp(formik.values.email);
              } catch (err) {
                // toast handled in context
              } finally {
                setResendBusy(false);
              }
            }}
            disabled={resendBusy}
          >
            {resendBusy ? "Sending..." : "Resend OTP"}
          </button>
          </div>

          {/* Button */}
          <motion.button
            whileHover={!formik.isSubmitting ? { scale: 1.05 } : {}}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={formik.isSubmitting}
            className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 text-white py-2.5 rounded-xl font-semibold shadow-lg transition-all duration-300 flex justify-center items-center"
          >
            {formik.isSubmitting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              "Verify Email"
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-cyan-900/40 to-transparent"></div>
    </div>
  );
};

export default VerifyEmail;
