"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Users, Shield, Heart, Target, Eye } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const STATS = [
  { value: "5,000+", label: "Healthcare Facilities" },
  { value: "16", label: "Regions Covered" },
  { value: "30M+", label: "Citizens Served" },
  { value: "24/7", label: "Emergency Support" },
];

const TEAM = [
  { name: "Ministry of Health", role: "Government Partner", icon: Building2 },
  { name: "Ghana Health Service", role: "Implementation Partner", icon: Shield },
  { name: "NHIA", role: "Insurance Partner", icon: Heart },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-emerald-800 text-white py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About Apomuden</h1>
            <p className="text-xl text-white/90">
              Ghana's National Digital Health Platform, connecting citizens with quality healthcare services across all 16 regions.
            </p>
          </motion.div>
        </div>
      </section>

      <main className="flex-1 py-16">
        <div className="container mx-auto px-4">
          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="h-full">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                    <Target className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
                  <p className="text-gray-600">
                    To provide every Ghanaian with easy access to quality healthcare information, 
                    enabling informed decisions about their health and well-being. We aim to bridge 
                    the gap between citizens and healthcare providers through technology.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-8">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <Eye className="h-6 w-6 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
                  <p className="text-gray-600">
                    A Ghana where every citizen can access healthcare services efficiently, 
                    where health information is transparent, and where emergency services 
                    are just a click away. We envision a healthier nation through digital innovation.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-emerald-600 rounded-2xl p-8 mb-16"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
              {STATS.map((stat, index) => (
                <div key={index}>
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-emerald-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* What We Offer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">What We Offer</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Facility Discovery",
                  description: "Find hospitals, clinics, and pharmacies near you with detailed information about services, ratings, and operating hours.",
                },
                {
                  title: "Price Transparency",
                  description: "Compare service prices across facilities and check NHIS coverage to make informed healthcare decisions.",
                },
                {
                  title: "Emergency Services",
                  description: "Request emergency assistance with one tap. Our platform connects you with the nearest emergency responders.",
                },
                {
                  title: "Health Alerts",
                  description: "Stay informed about disease outbreaks, vaccination campaigns, and health advisories in your region.",
                },
                {
                  title: "Reviews & Ratings",
                  description: "Read and share experiences about healthcare facilities to help others make better choices.",
                },
                {
                  title: "NHIS Integration",
                  description: "Easily identify NHIS-accredited facilities and understand your coverage options.",
                },
              ].map((feature, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Partners */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Partners</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {TEAM.map((partner, index) => (
                <Card key={index}>
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <partner.icon className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{partner.name}</h3>
                    <p className="text-sm text-gray-500">{partner.role}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
