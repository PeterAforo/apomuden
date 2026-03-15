"use client";

import { useServiceWorker } from "@/hooks/useServiceWorker";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, X } from "lucide-react";
import { useState } from "react";

export function PWAUpdateBanner() {
  const { isUpdateAvailable, updateServiceWorker } = useServiceWorker();
  const [dismissed, setDismissed] = useState(false);

  if (!isUpdateAvailable || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        className="fixed top-0 left-0 right-0 z-50 bg-emerald-600 text-white px-4 py-3 shadow-lg"
      >
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 animate-spin-slow" />
            <p className="text-sm font-medium">
              A new version of Apomuden is available!
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                updateServiceWorker();
                window.location.reload();
              }}
              className="px-4 py-1.5 bg-white text-emerald-600 rounded-lg text-sm font-semibold hover:bg-emerald-50 transition-colors"
            >
              Update Now
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1.5 hover:bg-emerald-500 rounded-lg transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
