"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, LayoutDashboard, Building2, Bell, BarChart3, FileText, Map } from "lucide-react";

const ADMIN_NAV_LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/facilities", label: "Facilities", icon: Building2 },
  { href: "/admin/alerts", label: "Alerts", icon: Bell },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/audit", label: "Audit Log", icon: FileText },
  { href: "/admin/surveillance", label: "Surveillance", icon: Map },
];

export default function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-3 hover:bg-white/10 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="md:hidden fixed inset-0 bg-black/50 z-40"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="md:hidden fixed top-0 right-0 bottom-0 w-72 bg-emerald-800 z-50 shadow-xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-emerald-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-emerald-800 font-bold">A</span>
                  </div>
                  <span className="font-bold text-white">Admin Menu</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="p-4 space-y-2">
                {ADMIN_NAV_LINKS.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "text-emerald-100 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      <link.icon className="h-5 w-5" />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-emerald-700">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium transition-colors min-h-[44px]"
                >
                  ← Back to Portal
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
