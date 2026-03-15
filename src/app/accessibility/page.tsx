"use client";

import { motion } from "framer-motion";
import { Accessibility, Eye, Ear, Hand, Monitor, MessageSquare, Phone } from "lucide-react";
import Link from "next/link";

export default function AccessibilityPage() {
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
            <Accessibility className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-4xl font-bold mb-4">Accessibility Statement</h1>
            <p className="text-emerald-100">
              Our commitment to inclusive healthcare access
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
            {/* Commitment */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Commitment</h2>
              <p className="text-gray-600 leading-relaxed">
                The Ghana Ministry of Health is committed to ensuring that Apomuden Health Portal 
                is accessible to all citizens, including persons with disabilities. We strive to 
                meet the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards and 
                continuously improve the accessibility of our platform.
              </p>
            </section>

            {/* Accessibility Features */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Accessibility Features</h2>
              
              <div className="grid gap-6">
                {/* Visual */}
                <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Eye className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Visual Accessibility</h3>
                    <ul className="text-gray-600 space-y-1 text-sm">
                      <li>• High contrast color schemes</li>
                      <li>• Scalable text (up to 200% zoom)</li>
                      <li>• Alt text for all images</li>
                      <li>• Screen reader compatible</li>
                      <li>• Clear visual hierarchy</li>
                    </ul>
                  </div>
                </div>

                {/* Hearing */}
                <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Ear className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Hearing Accessibility</h3>
                    <ul className="text-gray-600 space-y-1 text-sm">
                      <li>• Visual alerts alongside audio notifications</li>
                      <li>• Text-based communication options</li>
                      <li>• Captions for video content</li>
                      <li>• SMS alerts as alternative to voice calls</li>
                    </ul>
                  </div>
                </div>

                {/* Motor */}
                <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Hand className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Motor Accessibility</h3>
                    <ul className="text-gray-600 space-y-1 text-sm">
                      <li>• Full keyboard navigation</li>
                      <li>• Large touch targets (minimum 44x44 pixels)</li>
                      <li>• No time-limited interactions</li>
                      <li>• Skip navigation links</li>
                      <li>• Focus indicators</li>
                    </ul>
                  </div>
                </div>

                {/* Cognitive */}
                <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Monitor className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Cognitive Accessibility</h3>
                    <ul className="text-gray-600 space-y-1 text-sm">
                      <li>• Clear and simple language</li>
                      <li>• Consistent navigation</li>
                      <li>• Error prevention and recovery</li>
                      <li>• Progress indicators for multi-step processes</li>
                      <li>• Helpful error messages</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Assistive Technologies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Assistive Technologies</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Apomuden is designed to work with common assistive technologies including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Screen readers (NVDA, JAWS, VoiceOver, TalkBack)</li>
                <li>Screen magnification software</li>
                <li>Speech recognition software</li>
                <li>Alternative input devices</li>
                <li>Browser accessibility extensions</li>
              </ul>
            </section>

            {/* Language Support */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="w-6 h-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">Language Support</h2>
              </div>
              <p className="text-gray-600 leading-relaxed">
                Apomuden is available in multiple Ghanaian languages to ensure accessibility 
                for all citizens:
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <span className="font-medium text-gray-900">English</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <span className="font-medium text-gray-900">Twi (Akan)</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <span className="font-medium text-gray-900">Ga</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <span className="font-medium text-gray-900">Ewe</span>
                </div>
              </div>
            </section>

            {/* Known Limitations */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Known Limitations</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We are actively working to address the following accessibility limitations:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Some third-party map components may have limited screen reader support</li>
                <li>PDF documents may not be fully accessible</li>
                <li>Some older content may not meet current accessibility standards</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mt-4">
                We are committed to resolving these issues and welcome your feedback.
              </p>
            </section>

            {/* Feedback */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Phone className="w-6 h-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-gray-900">Accessibility Feedback</h2>
              </div>
              <p className="text-gray-600 leading-relaxed mb-4">
                We welcome your feedback on the accessibility of Apomuden. If you encounter 
                any accessibility barriers or have suggestions for improvement, please contact us:
              </p>
              <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <p className="font-medium text-gray-900">Accessibility Support</p>
                <p className="text-gray-600">Email: accessibility@apomuden.gov.gh</p>
                <p className="text-gray-600">Phone: +233 30 268 4090</p>
                <p className="text-gray-600">WhatsApp: +233 55 000 1234</p>
                <p className="text-sm text-gray-500 mt-2">
                  We aim to respond to accessibility feedback within 2 business days.
                </p>
              </div>
            </section>

            {/* Compliance */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Compliance Status</h2>
              <p className="text-gray-600 leading-relaxed">
                Apomuden partially conforms to WCAG 2.1 Level AA. We conduct regular 
                accessibility audits and are committed to achieving full conformance. 
                This statement was last reviewed on March 15, 2026.
              </p>
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
