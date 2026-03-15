"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Bell, Check, Loader2, Send } from "lucide-react";

type SubscriptionMethod = "email" | "phone" | "both";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<SubscriptionMethod>("email");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (method === "email" || method === "both") {
      if (!email || !email.includes("@")) {
        setError("Please enter a valid email address");
        return;
      }
    }

    if (method === "phone" || method === "both") {
      if (!phone || phone.length < 10) {
        setError("Please enter a valid phone number");
        return;
      }
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: method === "phone" ? null : email,
          phone: method === "email" ? null : phone,
          method,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Subscription failed");
      }

      setIsSuccess(true);
      setEmail("");
      setPhone("");

      // Reset success state after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-gradient-to-br from-emerald-600 to-teal-700 py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-4">
              <Bell className="w-4 h-4 text-white" />
              <span className="text-sm font-medium text-white">Stay Updated</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Subscribe to Health Updates
            </h2>
            <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
              Get the latest health news, alerts, and tips delivered directly to your inbox or phone. 
              Stay informed about disease outbreaks, vaccination campaigns, and health advisories.
            </p>
          </div>

          {/* Subscription Form */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Successfully Subscribed!
                </h3>
                <p className="text-gray-600">
                  You&apos;ll receive health updates via {method === "both" ? "email and SMS" : method}.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Method Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How would you like to receive updates?
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setMethod("email")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        method === "email"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      <Mail className="w-6 h-6" />
                      <span className="text-sm font-medium">Email</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod("phone")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        method === "phone"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      <Phone className="w-6 h-6" />
                      <span className="text-sm font-medium">SMS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod("both")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        method === "both"
                          ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                          : "border-gray-200 hover:border-gray-300 text-gray-600"
                      }`}
                    >
                      <div className="flex">
                        <Mail className="w-5 h-5" />
                        <Phone className="w-5 h-5 -ml-1" />
                      </div>
                      <span className="text-sm font-medium">Both</span>
                    </button>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  {(method === "email" || method === "both") && (
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          id="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}

                  {(method === "phone" || method === "both") && (
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="tel"
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+233 XX XXX XXXX"
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full md:w-auto px-8 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Subscribing...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Subscribe Now
                    </>
                  )}
                </button>

                {/* Privacy Note */}
                <p className="mt-4 text-xs text-gray-500">
                  By subscribing, you agree to receive health updates from Apomuden. 
                  You can unsubscribe at any time. Read our{" "}
                  <a href="/privacy" className="text-emerald-600 hover:underline">
                    Privacy Policy
                  </a>
                  .
                </p>
              </form>
            )}
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1">Health Alerts</h3>
              <p className="text-sm text-emerald-100">
                Get notified about disease outbreaks and health emergencies
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1">Weekly Digest</h3>
              <p className="text-sm text-emerald-100">
                Curated health news and tips delivered weekly
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-1">SMS Updates</h3>
              <p className="text-sm text-emerald-100">
                Critical alerts sent directly to your phone
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
