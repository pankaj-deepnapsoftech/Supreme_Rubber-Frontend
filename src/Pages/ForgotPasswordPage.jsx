import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Factory, Loader2, KeyRound, Lock } from "lucide-react";
import { useAuth } from "@/Context/AuthContext";
import { useFormik } from "formik";
import * as Yup from "yup";

const ForgotPassword = () => {
  const { forgotepass, resetepass,resendOtp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = email, 2 = otp + new password
  const [email, setEmail] = useState("");

  const formik = useFormik({
    initialValues: {
      email: "",
      otp: "",
      password: "",
    },
    validationSchema:
      step === 1
        ? Yup.object({
          email: Yup.string().email("Invalid email").required("Email is required"),
        })
        : Yup.object({
          otp: Yup.string()
            .length(4, "OTP must be 4 digits")
            .required("OTP is required"),
          password: Yup.string()
            .min(6, "Minimum 6 characters")
            .required("New password is required"),
        }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        if (step === 1) {
          await forgotepass(values.email);
          setEmail(values.email);
          setStep(2);
        } else {
          await resetepass(email, values.otp, values.password);
          navigate("/login");
        }
      } catch (error) {
        // toast handled in AuthContext
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-900 via-slate-900 to-indigo-900 overflow-hidden text-white">
      {/* Background blobs */}
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

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 bg-white/10 backdrop-blur-2xl border border-white/20 shadow-[0_8px_40px_rgba(0,0,0,0.4)] rounded-3xl p-10 w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-4 rounded-2xl shadow-lg">
            <Factory size={40} className="text-white" />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-wide bg-gradient-to-r from-cyan-300 to-blue-400 text-transparent bg-clip-text">
            {step === 1 ? "Forgot Password" : "Reset Password"}
          </h1>
          <p className="text-slate-300 text-sm text-center">
            {step === 1
              ? "Enter your registered email to get OTP"
              : `OTP sent to ${email}`}
          </p>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-5">
          {/* Step 1 → Email */}
          {step === 1 && (
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
          )}

          {/* Step 2 → OTP + New Password */}
          {step === 2 && (
            <>
              <div>
                <label className="text-sm font-semibold text-slate-300">
                  Enter OTP
                </label>
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
                    try {
                      await resendOtp(email); // call context function
                    } catch (err) {
                      console.log(err);
                    }
                  }}
                >
                  Resend OTP
                </button>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-300">
                  New Password
                </label>
                <div className="flex items-center mt-2 bg-white/10 border border-white/20 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-cyan-400 transition">
                  <Lock size={18} className="text-cyan-300 mr-2" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Enter new password"
                    {...formik.getFieldProps("password")}
                    className="w-full bg-transparent outline-none text-white placeholder-slate-400"
                  />
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-xs text-red-400 mt-1">
                    {formik.errors.password}
                  </p>
                )}
              </div>
            </>
          )}


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
            ) : step === 1 ? (
              "Send OTP"
            ) : (
              "Reset Password"
            )}
          </motion.button>
        </form>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-cyan-900/40 to-transparent"></div>
    </div>
  );
};

export default ForgotPassword;
