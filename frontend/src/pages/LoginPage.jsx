import { motion } from "framer-motion";
import { BarChart3, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../components/AuthContext";
import { useToast } from "../components/ToastContext";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "admin@shopflow.dev", password: "admin123" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form);
      pushToast("Welcome back to ShopFlow", "success");
      navigate("/");
    } catch {
      setError("Sign in failed. Please verify email and password.");
      pushToast("Unable to sign in. Check credentials.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top,#312e8160,transparent_50%),#020617] p-4">
      <motion.form
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-7 shadow-soft"
      >
        <div className="mb-8">
          <div className="mb-3 inline-flex rounded-xl bg-violet-500/20 p-2 text-violet-200">
            <BarChart3 size={20} />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Welcome to ShopFlow</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to manage your storefront operations.</p>
        </div>

        <label className="mb-4 block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Email</span>
          <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-3">
            <Mail size={16} className="text-slate-500" />
            <input
              className="w-full bg-transparent py-3 text-sm outline-none"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
          </div>
        </label>

        <label className="mb-5 block">
          <span className="mb-1 block text-xs uppercase tracking-wider text-slate-400">Password</span>
          <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 px-3">
            <Lock size={16} className="text-slate-500" />
            <input
              type="password"
              className="w-full bg-transparent py-3 text-sm outline-none"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
          </div>
        </label>

        <button
          disabled={loading}
          className="w-full rounded-xl bg-violet-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-violet-400 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
        {error && <p className="mt-3 text-xs text-rose-300">{error}</p>}
        <p className="mt-4 text-center text-xs text-slate-500">Demo: admin@shopflow.dev / admin123</p>
      </motion.form>
    </div>
  );
};

export default LoginPage;
