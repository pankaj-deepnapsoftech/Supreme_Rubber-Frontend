import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, KeyRound, Factory } from "lucide-react";

const OTPVerification = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

   
    setTimeout(() => {
      setLoading(false);
      if (otp === "123456") {
        setVerified(true);
        setTimeout(() => navigate("/login"), 2000);
      } else {
        alert("Invalid OTP. Try again.");
      }
    }, 1500);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-900 via-slate-900 to-indigo-900 overflow-hidden text-white">
      
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
            Verify OTP
          </h1>
          <p className="text-slate-300 text-sm text-center">
            Enter the 6-digit OTP sent to your email.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-slate-300">OTP Code</label>
            <div className="flex items-center justify-center mt-3">
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength="6"
                className="tracking-[0.6em] text-center text-xl font-semibold bg-white/10 border border-white/20 rounded-xl px-4 py-3 w-48 outline-none focus:ring-2 focus:ring-cyan-400"
                placeholder="______"
                required
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-700 text-white py-2.5 rounded-xl font-semibold shadow-lg transition-all duration-300"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin mx-auto" />
            ) : verified ? (
              "Verified ✅"
            ) : (
              "Verify OTP"
            )}
          </motion.button>
        </form>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-cyan-900/40 to-transparent"></div>
    </div>
  );
};

export default OTPVerification;
