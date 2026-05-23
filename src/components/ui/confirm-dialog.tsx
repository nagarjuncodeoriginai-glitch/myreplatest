"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within ConfirmProvider");
  return ctx;
}

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    resolver?.(true);
    setOptions(null);
    setResolver(null);
  };

  const handleCancel = () => {
    resolver?.(false);
    setOptions(null);
    setResolver(null);
  };

  const typeStyles = {
    danger: {
      icon: Trash2,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      btn: "bg-red-600 hover:bg-red-700 shadow-red-500/20",
    },
    warning: {
      icon: AlertTriangle,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      btn: "bg-amber-600 hover:bg-amber-700 shadow-amber-500/20",
    },
    info: {
      icon: AlertTriangle,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      btn: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20",
    },
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <AnimatePresence>
        {options && (
          <motion.div
            className="fixed inset-0 z-[9998] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancel}
            />
            {/* Dialog */}
            <motion.div
              className="relative bg-white rounded-2xl shadow-3d-hover max-w-md w-full p-6"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 200, damping: 25 }}
            >
              <button
                onClick={handleCancel}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>

              {(() => {
                const style = typeStyles[options.type || "danger"];
                const Icon = style.icon;
                return (
                  <>
                    <div className={`w-12 h-12 rounded-xl ${style.iconBg} flex items-center justify-center mb-4`}>
                      <Icon className={`w-6 h-6 ${style.iconColor}`} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{options.title}</h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">{options.message}</p>
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleCancel}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                      >
                        {options.cancelText || "Cancel"}
                      </button>
                      <button
                        onClick={handleConfirm}
                        className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-all shadow-lg ${style.btn}`}
                      >
                        {options.confirmText || "Confirm"}
                      </button>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}
