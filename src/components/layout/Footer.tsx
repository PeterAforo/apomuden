"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Phone, Mail, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { NewsletterSection } from "@/components/newsletter";

export default function Footer() {
  return (
    <>
      <NewsletterSection />
      <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t">
      {/* Main Footer */}
      <div className="container py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4 group">
              <motion.img 
                src="/favicon.svg"
                alt="OneHealthGH"
                className="h-10 w-10 rounded-xl shadow-md"
                whileHover={{ scale: 1.1, rotate: 5 }}
              />
              <span className="font-bold text-2xl bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">OneHealthGH</span>
            </Link>
            <p className="text-gray-600 mb-6 max-w-sm">
              Ghana's National Digital Health Platform. Connecting citizens with quality healthcare services across all 16 regions.
            </p>
            {/* Social Links */}
            <div className="flex items-center space-x-3">
              {[
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Youtube, href: "#", label: "Youtube" },
              ].map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  className="w-11 h-11 rounded-full bg-white shadow-sm border flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:border-emerald-200 hover:shadow-md transition-all"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-3">
              {[
                { href: "/facilities", label: "Find Facilities" },
                { href: "/alerts", label: "Health Alerts" },
                { href: "/compare", label: "Compare Services" },
                { href: "/emergency", label: "Emergency Services" },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-emerald-600 transition-colors text-sm animated-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Facilities */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">For Facilities</h4>
            <ul className="space-y-3">
              {[
                { href: "/register-facility", label: "Register Facility" },
                { href: "/facility-admin", label: "Facility Dashboard" },
                { href: "/about", label: "About Us" },
              ].map((link) => (
                <li key={link.href}>
                  <Link 
                    href={link.href} 
                    className="text-gray-600 hover:text-emerald-600 transition-colors text-sm animated-underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>Ministry of Health, Accra, Ghana</span>
              </li>
              <li>
                <a href="tel:112" className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                  <Phone className="h-4 w-4 text-emerald-600" />
                  <span>Emergency: 112</span>
                </a>
              </li>
              <li>
                <a href="mailto:support@onehealthgh.gov.gh" className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                  <Mail className="h-4 w-4 text-emerald-600" />
                  <span>support@onehealthgh.gov.gh</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t bg-white/50">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} OneHealthGH. Ghana Ministry of Health. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-emerald-600 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-emerald-600 transition-colors">Terms of Service</Link>
              <Link href="/accessibility" className="hover:text-emerald-600 transition-colors">Accessibility</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
    </>
  );
}
