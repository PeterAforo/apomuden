"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Bell, Check, Loader2, Send, Heart, Shield, Sparkles } from "lucide-react";

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
    <section className="relative py-24 overflow-hidden">
      {/* Parallax Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: "url('/img/013.jpg')",
        }}
      />
      
      {/* Vibrant Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/90 via-teal-600/85 to-cyan-700/90" />
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-emerald-400/10 rounded-full blur-2xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-5 py-2.5 mb-6 border border-white/30"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-semibold text-white tracking-wide">Stay Informed, Stay Healthy</span>
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            >
              Subscribe to <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">Health Updates</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-white/90 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
            >
              Get the latest health news, alerts, and expert tips delivered directly to your inbox or phone. 
              Stay informed about disease outbreaks, vaccination campaigns, and health advisories in Ghana.
            </motion.p>
          </div>

          {/* Subscription Form */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="bg-white/95 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-white/50 max-w-2xl mx-auto"
          >
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200"
                >
                  <Check className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Successfully Subscribed!
                </h3>
                <p className="text-gray-600 text-lg">
                  You&apos;ll receive health updates via {method === "both" ? "email and SMS" : method}.
                </p>
                <div className="mt-6 inline-flex items-center gap-2 text-emerald-600 font-medium">
                  <Heart className="w-5 h-5" />
                  <span>Thank you for joining our health community!</span>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Method Selection - Compact */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    How would you like to receive updates?
                  </label>
                  <div className="flex gap-2">
                    {[
                      { key: "email", label: "Email", icon: Mail },
                      { key: "phone", label: "SMS", icon: Phone },
                      { key: "both", label: "Both", icon: Mail },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setMethod(opt.key as "email" | "phone" | "both")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium ${
                          method === opt.key
                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                            : "border-gray-200 hover:border-emerald-300 text-gray-600"
                        }`}
                      >
                        <opt.icon className="w-4 h-4" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input and Button - Same Line */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                  {(method === "email" || method === "both") && (
                    <div className="flex-1 relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 placeholder-gray-400"
                      />
                    </div>
                  )}

                  {(method === "phone" || method === "both") && (
                    <div className="flex-1 relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+233 XX XXX XXXX"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-800 placeholder-gray-400"
                      />
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Subscribe
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-3 p-3 bg-red-50 border-l-4 border-red-500 rounded text-red-700 text-sm">
                    {error}
                  </div>
                )}

                {/* Security & Privacy */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Your data is secure</span>
                  </div>
                  <span>
                    By subscribing, you agree to our{" "}
                    <a href="/privacy" className="text-emerald-600 hover:underline">Privacy Policy</a>
                  </span>
                </div>
              </form>
            )}
          </motion.div>

          {/* Features */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="grid md:grid-cols-3 gap-6 mt-12"
          >
            {[
              {
                icon: Bell,
                title: "Health Alerts",
                description: "Get instant notifications about disease outbreaks and health emergencies in your area",
                gradient: "from-yellow-400 to-orange-400",
              },
              {
                icon: Mail,
                title: "Weekly Digest",
                description: "Curated health news, wellness tips, and medical breakthroughs delivered every week",
                gradient: "from-cyan-400 to-blue-400",
              },
              {
                icon: Phone,
                title: "SMS Updates",
                description: "Critical health alerts sent directly to your phone for immediate awareness",
                gradient: "from-pink-400 to-rose-400",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="group"
              >
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 h-full">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">{feature.title}</h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-white/70 text-sm"
          >
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-300" />
              <span>No spam, ever</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-300" />
              <span>Unsubscribe anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-300" />
              <span>10,000+ subscribers</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
