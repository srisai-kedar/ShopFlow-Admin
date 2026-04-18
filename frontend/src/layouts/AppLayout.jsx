import { BarChart3, Bell, Boxes, LayoutDashboard, LogOut, Menu, PackageCheck, Search, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { useAuth } from "../components/AuthContext";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/products", label: "Products", icon: Boxes },
  { to: "/orders", label: "Orders", icon: PackageCheck },
];

const AppLayout = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [apiHealthy, setApiHealthy] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    const checkApi = async () => {
      try {
        const base = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
        const response = await fetch(`${base}/`);
        if (isMounted) setApiHealthy(response.ok);
      } catch {
        if (isMounted) setApiHealthy(false);
      }
    };
    checkApi();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#312e8140,transparent_42%),#020617] text-slate-100">
      <div className="mx-auto flex max-w-7xl gap-4 p-3 md:p-6">
        <aside
          className={`fixed inset-y-3 left-3 z-40 w-64 rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-950 p-4 shadow-soft transition-transform md:static md:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-[120%]"
          }`}
        >
          <Link to="/" className="mb-7 flex items-center gap-2 px-2">
            <BarChart3 className="text-violet-300" size={19} />
            <span className="text-lg font-semibold tracking-tight">ShopFlow</span>
          </Link>
          <nav className="space-y-1.5">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-all ${
                    isActive
                      ? "bg-violet-500/20 text-violet-200 shadow-[inset_0_0_0_1px_rgba(139,92,246,.3)]"
                      : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900/60 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">Workspace</p>
            <p className="mt-1 text-sm font-medium text-slate-200">Growth Team</p>
            <button
              onClick={logout}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/70 px-4 py-3 shadow-soft">
            <div className="flex items-center gap-3">
              <button className="rounded-lg p-2 hover:bg-slate-800 md:hidden" onClick={() => setOpen(!open)}>
                <Menu size={18} />
              </button>
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">ShopFlow Admin</p>
                <h1 className="text-base font-semibold">
                  {location.pathname === "/" ? "Dashboard" : location.pathname.slice(1)}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="hidden rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800 md:inline-flex">
                <Search size={15} />
              </button>
              <button className="hidden rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800 md:inline-flex">
                <Bell size={15} />
              </button>
              <div className="rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-right">
                <p className="text-sm font-medium text-slate-100">{user?.full_name}</p>
                <p className="inline-flex items-center gap-1 text-xs capitalize text-slate-400">
                  <Sparkles size={12} /> {user?.role}
                </p>
                <p className={`mt-1 text-[11px] ${apiHealthy ? "text-emerald-300" : "text-amber-300"}`}>
                  {apiHealthy ? "API live" : "Fallback mode"}
                </p>
              </div>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
