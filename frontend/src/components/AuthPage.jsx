import React, { useState } from "react";
import { z } from "zod";
import axios from "axios";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, AlertCircle, Eye, EyeOff, Shield, Sparkles } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ROLE_LABELS = {
  sde1: "SDE 1",
  sde2: "SDE 2",
  sde3: "SDE 3 / Lead",
  pm: "Product Manager",
};

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const AuthPage = ({ mode = "login", selectedRole = null, onAuthSuccess, onBack }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isRegister = mode === "register";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
    if (serverError) setServerError("");
  };

  const validate = () => {
    const schema = isRegister ? registerSchema : loginSchema;
    const result = schema.safeParse(form);
    if (!result.success) {
      const fieldErrors = {};
      (result.error.errors || result.error.issues || []).forEach((e) => {
        fieldErrors[e.path[0]] = e.message;
      });
      setErrors(fieldErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError("");

    try {
      const endpoint = isRegister ? "/api/auth/register" : "/api/auth/login";
      const payload = isRegister
        ? { ...form, role: selectedRole }
        : { email: form.email, password: form.password };

      const res = await axios.post(`${API_URL}${endpoint}`, payload);
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      onAuthSuccess(user);
    } catch (err) {
      console.error("Auth error details:", err);
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Connection failed. Please check if the server is running.";
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] lg:min-h-[calc(100vh-5rem)] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-600/5 blur-[120px]" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-teal-600/5 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Card */}
        <div className="bg-bg-secondary/80 backdrop-blur-2xl rounded-3xl sm:rounded-[3rem] border border-border-primary shadow-2xl shadow-emerald-500/5 overflow-hidden">
          {/* Header */}
          <div className="p-6 pb-0 text-center space-y-3">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
              {isRegister ? <Sparkles size={24} className="text-white sm:w-7 sm:h-7" /> : <Shield size={24} className="text-white sm:w-7 sm:h-7" />}
            </div>
            <div>
              <h2 className="text-3xl font-black tracking-tight">
                {isRegister ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-text-secondary font-medium mt-2">
                {isRegister
                  ? <>Joining as <span className="text-emerald-600 font-bold">{ROLE_LABELS[selectedRole]}</span></>
                  : "Sign in to continue (New account required after update)"}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {serverError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center gap-3"
              >
                <AlertCircle size={18} className="shrink-0" />
                <span>{serverError}</span>
              </motion.div>
            )}

            {isRegister && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest pl-1">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input
                    name="name"
                    id="auth-name"
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-3 bg-bg-primary border ${errors.name ? "border-red-500" : "border-border-primary"} rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all`}
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs font-bold pl-1">{errors.name}</p>}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest pl-1">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  name="email"
                  id="auth-email"
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-4 bg-bg-primary border ${errors.email ? "border-red-500" : "border-border-primary"} rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs font-bold pl-1">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-text-secondary uppercase tracking-widest pl-1">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  name="password"
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  placeholder={isRegister ? "Min 6 characters" : "Enter password"}
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-4 bg-bg-primary border ${errors.password ? "border-red-500" : "border-border-primary"} rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs font-bold pl-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              id="auth-submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black rounded-xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:scale-[1.01] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-xs uppercase tracking-wider"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isRegister ? "Create Account" : "Sign In"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-10 pb-8 text-center flex justify-center">
            {onBack && (
              <button
                onClick={onBack}
                className="text-sm text-text-secondary hover:text-emerald-600 font-bold transition-colors flex items-center gap-2"
              >
                <ArrowRight size={16} className="rotate-180" /> Back to Position Selection
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
