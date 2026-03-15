"use client";

import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";
import { useEffect, useState } from "react";

export function NetworkStatusBanner() {
  const { isOnline, isOffline } = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (isOffline) {
      setWasOffline(true);
    } else if (wasOffline && isOnline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, isOffline, wasOffline]);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2.5"
        >
          <div className="container mx-auto flex items-center justify-center gap-2">
            <WifiOff className="w-4 h-4" />
            <p className="text-sm font-medium">
              You&apos;re offline. Some features may be unavailable.
            </p>
          </div>
        </motion.div>
      )}

      {showReconnected && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white px-4 py-2.5"
        >
          <div className="container mx-auto flex items-center justify-center gap-2">
            <Wifi className="w-4 h-4" />
            <p className="text-sm font-medium">
              You&apos;re back online!
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
