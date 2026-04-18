import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export const Card = ({ children, className = "" }) => (
  <div
    className={`rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/80 to-slate-900/60 p-5 shadow-soft backdrop-blur ${className}`}
  >
    {children}
  </div>
);

export const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded-lg bg-slate-800/80 ${className}`} />
);

export const Badge = ({ children, tone = "neutral" }) => {
  const tones = {
    neutral: "bg-slate-700/70 text-slate-200",
    success: "bg-emerald-500/20 text-emerald-200",
    warning: "bg-amber-500/20 text-amber-200",
    danger: "bg-rose-500/20 text-rose-200",
    info: "bg-violet-500/20 text-violet-200",
  };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`}>{children}</span>;
};

export const EmptyState = ({ title, description }) => (
  <Card className="grid min-h-48 place-items-center text-center">
    <div>
      <p className="text-base font-semibold text-slate-100">{title}</p>
      <p className="mt-1 text-sm text-slate-400">{description}</p>
    </div>
  </Card>
);

export const Modal = ({ open, title, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-soft"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          <button className="rounded-lg p-1 text-slate-400 hover:bg-slate-800" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {children}
      </motion.div>
    </div>
  );
};

export const Pagination = ({ page, totalPages, onPageChange, total }) => (
  <div className="flex flex-col gap-3 border-t border-slate-800 px-4 py-3 text-xs text-slate-400 md:flex-row md:items-center md:justify-between">
    <p>
      Showing page {page} of {totalPages} · {total} records
    </p>
    <div className="flex items-center gap-2">
      <button
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1.5 text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft size={14} /> Prev
      </button>
      <button
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-2.5 py-1.5 text-slate-200 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next <ChevronRight size={14} />
      </button>
    </div>
  </div>
);
