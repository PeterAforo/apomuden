"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Phone, Menu, X, Bell, Heart } from "lucide-react";
import { LanguageSwitcher } from "@/components/language";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface NavbarProps {
  onNotificationClick?: () => void;
  notificationsEnabled?: boolean;
}

const NAV_LINKS = [
  { href: "/facilities", labelKey: "nav.facilities" },
  { href: "/ambulance", labelKey: "nav.ambulance" },
  { href: "/alerts", labelKey: "nav.alerts" },
  { href: "/news", labelKey: "nav.news" },
  { href: "/about", labelKey: "nav.about" },
];

export default function Navbar({ onNotificationClick, notificationsEnabled }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-lg shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <motion.img 
            src="/favicon.svg"
            alt="OneHealthGH"
            className="h-9 w-9 rounded-xl shadow-md"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          />
          <span className="font-bold text-xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">OneHealthGH</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-sm font-medium transition-all duration-200 hover:text-emerald-600 ${
                pathname === link.href 
                  ? "text-emerald-600" 
                  : "text-gray-600"
              }`}
            >
              {t(link.labelKey)}
              {pathname === link.href && (
                <motion.span 
                  layoutId="navbar-indicator"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Language Switcher */}
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>

          {/* Notification Bell */}
          {onNotificationClick && (
            <motion.button
              onClick={onNotificationClick}
              className="relative p-3 hover:bg-emerald-50 rounded-full transition-colors"
              title="Health Notifications"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {notificationsEnabled && (
                <motion.span 
                  className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </motion.button>
          )}

          {/* Emergency Button */}
          <Link href="/emergency">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="destructive" size="sm" className="emergency-pulse bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/25">
                <Phone className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Emergency</span>
              </Button>
            </motion.div>
          </Link>

          {/* Sign In */}
          <Link href="/auth/login" className="hidden sm:block">
            <Button variant="outline" size="sm" className="border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700">Sign In</Button>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-3 hover:bg-gray-100 rounded-lg min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-background"
          >
            <nav className="container py-4 space-y-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {t(link.labelKey)}
                </Link>
              ))}
              <Link
                href="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100"
              >
                {t('nav.login')}
              </Link>
              <div className="px-4 py-2 border-t mt-2 pt-4">
                <p className="text-xs text-gray-500 mb-2">Select Language</p>
                <LanguageSwitcher />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
