"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string, duration?: number) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colors = {
  success: {
    bg: "bg-emerald-50 border-emerald-200",
    icon: "text-emerald-500",
    title: "text-emerald-900",
    msg: "text-emerald-700",
    bar: "bg-emerald-500",
  },
  error: {
    bg: "bg-red-50 border-red-200",
    icon: "text-red-500",
    title: "text-red-900",
    msg: "text-red-700",
    bar: "bg-red-500",
  },
  warning: {
    bg: "bg-amber-50 border-amber-200",
    icon: "text-amber-500",
    title: "text-amber-900",
    msg: "text-amber-700",
    bar: "bg-amber-500",
  },
  info: {
    bg: "bg-blue-50 border-blue-200",
    icon: "text-blue-500",
    title: "text-blue-900",
    msg: "text-blue-700",
    bar: "bg-blue-500",
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, title: string, message?: string, duration = 4000) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, title, message, duration }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value: ToastContextType = {
    toast: addToast,
    success: (title, message) => addToast("success", title, message),
    error: (title, message) => addToast("error", title, message),
    warning: (title, message) => addToast("warning", title, message),
    info: (title, message) => addToast("info", title, message),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const Icon = icons[t.type];
            const color = colors[t.type];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 80, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className={`pointer-events-auto relative overflow-hidden rounded-xl border ${color.bg} p-4 shadow-3d`}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 ${color.icon} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${color.title}`}>{t.title}</p>
                    {t.message && <p className={`text-xs mt-0.5 ${color.msg}`}>{t.message}</p>}
                  </div>
                  <button
                    onClick={() => removeToast(t.id)}
                    className="text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {/* Progress bar */}
                <motion.div
                  className={`absolute bottom-0 left-0 h-1 ${color.bar}`}
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: (t.duration || 4000) / 1000, ease: "linear" }}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
