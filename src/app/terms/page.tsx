"use client";

import { motion } from "framer-motion";
import { FileText, CheckCircle, AlertTriangle, Scale, Clock, Globe } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
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
            <FileText className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
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
            {/* Acceptance */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">Acceptance of Terms</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                By accessing and using the Apomuden Health Portal, you accept and agree to be bound by 
                these Terms of Service. If you do not agree to these terms, please do not use our services. 
                Apomuden is operated by the Ghana Ministry of Health in partnership with the Ghana Health Service.
              </p>
            </section>

            {/* Services */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">Our Services</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                Apomuden provides the following digital health services:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Healthcare facility finder and information</li>
                <li>Emergency services request and ambulance dispatch</li>
                <li>AI-powered symptom checker (for informational purposes only)</li>
                <li>Health alerts and epidemic/pandemic notifications</li>
                <li>NHIS facility verification</li>
                <li>Healthcare facility ratings and reviews</li>
              </ul>
            </section>

            {/* Medical Disclaimer */}
            <section className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <h2 className="text-2xl font-bold text-gray-900">Medical Disclaimer</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                <strong>IMPORTANT:</strong> Apomuden is not a substitute for professional medical advice, 
                diagnosis, or treatment. The symptom checker and health information provided are for 
                informational purposes only. Always seek the advice of a qualified healthcare provider 
                with any questions regarding a medical condition. In case of emergency, call 112 or 
                visit the nearest healthcare facility immediately.
              </p>
            </section>

            {/* User Responsibilities */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Scale className="w-6 h-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">User Responsibilities</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                As a user of Apomuden, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Provide accurate and truthful information</li>
                <li>Keep your account credentials secure</li>
                <li>Use the platform only for lawful purposes</li>
                <li>Not misuse emergency services</li>
                <li>Respect the privacy of healthcare providers and other users</li>
                <li>Report any security vulnerabilities or bugs</li>
                <li>Not attempt to access unauthorized areas of the platform</li>
              </ul>
            </section>

            {/* Emergency Services */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Emergency Services</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                When using our emergency services:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Provide accurate location and contact information</li>
                <li>Do not make false emergency requests</li>
                <li>Follow instructions from emergency responders</li>
                <li>Understand that response times may vary based on location and availability</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                False emergency requests may result in account suspension and legal action.
              </p>
            </section>

            {/* Health Alerts */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Health Alerts & Notifications</h2>
              <p className="text-gray-600 leading-relaxed">
                By using Apomuden, you consent to receive health alerts including disease outbreak 
                warnings, epidemic/pandemic notifications, and public health advisories. These 
                notifications are essential for public health and safety and cannot be fully disabled 
                for critical alerts.
              </p>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
              <p className="text-gray-600 leading-relaxed">
                All content, features, and functionality of Apomuden are owned by the Ghana Ministry 
                of Health and are protected by copyright, trademark, and other intellectual property laws. 
                You may not reproduce, distribute, or create derivative works without prior written consent.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
              <p className="text-gray-600 leading-relaxed">
                To the fullest extent permitted by law, the Ghana Ministry of Health and its partners 
                shall not be liable for any indirect, incidental, special, consequential, or punitive 
                damages arising from your use of Apomuden. We do not guarantee uninterrupted or 
                error-free service.
              </p>
            </section>

            {/* Changes to Terms */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">Changes to Terms</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to modify these Terms of Service at any time. Changes will be 
                effective immediately upon posting. Continued use of Apomuden after changes constitutes 
                acceptance of the modified terms.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Governing Law</h2>
              <p className="text-gray-600 leading-relaxed">
                These Terms of Service are governed by the laws of the Republic of Ghana. Any disputes 
                shall be resolved in the courts of Ghana.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">Ghana Ministry of Health</p>
                <p className="text-gray-600">P.O. Box M.44, Accra, Ghana</p>
                <p className="text-gray-600">Email: support@apomuden.gov.gh</p>
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
