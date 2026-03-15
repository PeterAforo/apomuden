"use client";

import { motion } from "framer-motion";
import { Shield, Lock, Eye, Database, Bell, Users, FileText, Mail } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-emerald-600 text-white py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto text-center"
          >
            <Shield className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-emerald-100">
              Last updated: March 15, 2026
            </p>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm p-8 space-y-8"
          >
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
              <p className="text-gray-600 leading-relaxed">
                Apomuden Health Portal (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you use our digital health platform operated by the Ghana Ministry of Health.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">Information We Collect</h2>
              </div>
              <div className="space-y-4 text-gray-600">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Name, phone number, and email address</li>
                    <li>Date of birth and gender</li>
                    <li>NHIS membership details</li>
                    <li>Location data (with your consent)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Health Information</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Symptom checker responses</li>
                    <li>Healthcare facility visits</li>
                    <li>Emergency service requests</li>
                    <li>Health alerts and notifications preferences</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Your Information */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">How We Use Your Information</h2>
              </div>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>To provide and maintain our health services</li>
                <li>To send you health alerts and emergency notifications</li>
                <li>To connect you with healthcare facilities and ambulance services</li>
                <li>To improve our services through anonymized analytics</li>
                <li>To comply with legal obligations and public health requirements</li>
                <li>To detect and prevent epidemic/pandemic outbreaks</li>
              </ul>
            </section>

            {/* Data Protection */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">Data Protection</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your personal and health information:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>End-to-end encryption for all data transmission</li>
                <li>Secure data storage compliant with Ghana Data Protection Act, 2012</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Staff training on data protection and privacy</li>
              </ul>
            </section>

            {/* Notifications */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Bell className="w-6 h-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">Health Alerts & Notifications</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                By using Apomuden, you consent to receive health alerts including disease outbreak warnings, 
                pandemic notifications, and emergency health advisories from the Ghana Health Service and 
                Ministry of Health. These notifications are essential for public health and safety.
              </p>
            </section>

            {/* Data Sharing */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">Data Sharing</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                We may share your information with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Healthcare facilities you choose to visit</li>
                <li>Emergency services when you request assistance</li>
                <li>Ghana Health Service for public health monitoring</li>
                <li>Law enforcement when required by law</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                We do not sell your personal information to third parties.
              </p>
            </section>

            {/* Your Rights */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">Your Rights</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Under the Ghana Data Protection Act, you have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
                <li>Withdraw consent for non-essential data processing</li>
                <li>Lodge a complaint with the Data Protection Commission</li>
              </ul>
            </section>

            {/* Contact */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Mail className="w-6 h-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                For privacy-related inquiries, please contact our Data Protection Officer:
              </p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">Ghana Ministry of Health</p>
                <p className="text-gray-600">Data Protection Officer</p>
                <p className="text-gray-600">Email: privacy@apomuden.gov.gh</p>
                <p className="text-gray-600">Phone: +233 30 268 4090</p>
              </div>
            </section>
          </motion.div>

          {/* Back Link */}
          <div className="text-center mt-8">
            <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
