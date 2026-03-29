"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastType = "success" | "error" | "warning" | "info";

type ToastPayload = {
  title: string;
  message?: string;
  type: ToastType;
};

type ToastItem = ToastPayload & { id: string };

const ToastContext = createContext<{ push: (payload: ToastPayload) => void } | null>(null);

const styleMap: Record<ToastType, string> = {
  success: "border-emerald-200 bg-white text-slate-900 shadow-[0_18px_45px_rgba(5,150,105,0.16)]",
  error: "border-red-200 bg-white text-slate-900 shadow-[0_18px_45px_rgba(239,68,68,0.16)]",
  warning: "border-amber-200 bg-white text-slate-900 shadow-[0_18px_45px_rgba(245,158,11,0.16)]",
  info: "border-sky-200 bg-white text-slate-900 shadow-[0_18px_45px_rgba(14,165,233,0.16)]",
};

const iconMap: Record<ToastType, { icon: typeof CheckCircle2; badge: string; badgeClass: string; iconClass: string }> = {
  success: {
    icon: CheckCircle2,
    badge: "Success",
    badgeClass: "bg-emerald-50 text-emerald-700",
    iconClass: "text-emerald-600",
  },
  error: {
    icon: XCircle,
    badge: "Issue",
    badgeClass: "bg-red-50 text-red-700",
    iconClass: "text-red-600",
  },
  warning: {
    icon: AlertTriangle,
    badge: "Heads up",
    badgeClass: "bg-amber-50 text-amber-700",
    iconClass: "text-amber-600",
  },
  info: {
    icon: Info,
    badge: "Update",
    badgeClass: "bg-sky-50 text-sky-700",
    iconClass: "text-sky-600",
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (payload: ToastPayload) => {
      const id = Math.random().toString(36).slice(2);
      setItems((prev) => [...prev, { ...payload, id }]);
      window.setTimeout(() => remove(id), 3200);
    },
    [remove]
  );

  const value = useMemo(() => ({ push }), [push]);
  const stackedItems = [...items].slice(-4).reverse();

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[120] flex justify-center px-3 sm:top-5 sm:justify-end sm:px-5">
        <AnimatePresence>
          {stackedItems.map((item, index) => (
            <ToastCard
              key={item.id}
              item={item}
              index={index}
              remove={remove}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  item,
  index,
  remove,
}: {
  item: ToastItem;
  index: number;
  remove: (id: string) => void;
}) {
  const meta = iconMap[item.type];
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 240, damping: 26 }}
      className={`pointer-events-auto mt-3 w-[min(calc(100vw-1.5rem),25rem)] rounded-3xl border p-4 ${styleMap[item.type]}`}
      style={{ zIndex: 120 - index }}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 rounded-2xl bg-slate-50 p-2.5 ${meta.iconClass}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${meta.badgeClass}`}>
                {meta.badge}
              </span>
              <p className="mt-2 text-sm font-semibold leading-snug">{item.title}</p>
            </div>
            <button
              aria-label="Close notification"
              className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              onClick={() => remove(item.id)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {item.message ? <p className="mt-2 text-xs leading-relaxed text-slate-500">{item.message}</p> : null}
        </div>
      </div>
    </motion.div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return {
    toast: context.push,
  };
}
