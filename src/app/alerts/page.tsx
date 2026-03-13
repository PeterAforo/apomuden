"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Bell, MapPin, Calendar, ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface Alert {
  id: string;
  title: string;
  description: string;
  type: "OUTBREAK" | "ADVISORY" | "WARNING" | "INFO";
  severity: "HIGH" | "MEDIUM" | "LOW";
  region: string | null;
  date: string;
  isActive: boolean;
}

const MOCK_ALERTS: Alert[] = [
  {
    id: "1",
    title: "Increased Malaria Cases in Northern Region",
    description: "The Ghana Health Service has reported a significant increase in malaria cases in the Northern Region. Residents are advised to use insecticide-treated nets and seek early treatment for fever symptoms.",
    type: "OUTBREAK",
    severity: "HIGH",
    region: "Northern",
    date: "2024-01-15",
    isActive: true,
  },
  {
    id: "2",
    title: "COVID-19 Booster Vaccination Campaign",
    description: "Updated COVID-19 booster vaccines are now available at all regional hospitals. Priority is given to healthcare workers and individuals over 60 years of age.",
    type: "ADVISORY",
    severity: "MEDIUM",
    region: null,
    date: "2024-01-14",
    isActive: true,
  },
  {
    id: "3",
    title: "Cholera Prevention Advisory - Greater Accra",
    description: "Following recent flooding, residents in low-lying areas of Greater Accra are advised to boil drinking water and maintain proper sanitation to prevent cholera outbreaks.",
    type: "WARNING",
    severity: "HIGH",
    region: "Greater Accra",
    date: "2024-01-12",
    isActive: true,
  },
  {
    id: "4",
    title: "Mental Health Awareness Week",
    description: "The Ministry of Health is observing Mental Health Awareness Week. Free counseling services are available at all district hospitals. Call the mental health hotline: 0800-123-456.",
    type: "INFO",
    severity: "LOW",
    region: null,
    date: "2024-01-10",
    isActive: true,
  },
  {
    id: "5",
    title: "Meningitis Vaccination Drive - Upper East",
    description: "A meningitis vaccination campaign is underway in Upper East Region. All children aged 1-5 years should be vaccinated at the nearest health center.",
    type: "ADVISORY",
    severity: "MEDIUM",
    region: "Upper East",
    date: "2024-01-08",
    isActive: true,
  },
];

const TYPE_STYLES = {
  OUTBREAK: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  WARNING: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  ADVISORY: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  INFO: { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
};

const SEVERITY_STYLES = {
  HIGH: "bg-red-600",
  MEDIUM: "bg-amber-500",
  LOW: "bg-green-500",
};

export default function AlertsPage() {
  const [filter, setFilter] = useState<string>("all");

  const filteredAlerts = filter === "all" 
    ? MOCK_ALERTS 
    : MOCK_ALERTS.filter(a => a.type === filter);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-amber-600 to-red-600 text-white py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-8 w-8" />
              <h1 className="text-3xl md:text-4xl font-bold">Health Alerts</h1>
            </div>
            <p className="text-lg text-white/90 max-w-2xl">
              Stay informed about disease outbreaks, health advisories, and important public health announcements across Ghana.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b py-4 sticky top-16 z-40">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All Alerts" },
              { value: "OUTBREAK", label: "Outbreaks" },
              { value: "WARNING", label: "Warnings" },
              { value: "ADVISORY", label: "Advisories" },
              { value: "INFO", label: "Information" },
            ].map((f) => (
              <Button
                key={f.value}
                variant={filter === f.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f.value)}
                className={filter === f.value ? "bg-emerald-600 hover:bg-emerald-700" : ""}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Alerts List */}
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <div className="space-y-4">
            {filteredAlerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className={`border-l-4 ${TYPE_STYLES[alert.type].border} hover:shadow-md transition-shadow`}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded ${TYPE_STYLES[alert.type].bg} ${TYPE_STYLES[alert.type].text}`}>
                            {alert.type}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${SEVERITY_STYLES[alert.severity]}`} title={`${alert.severity} severity`}></span>
                          {alert.region && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <MapPin className="h-3 w-3" />
                              {alert.region} Region
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{alert.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{alert.description}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="h-3 w-3" />
                          {new Date(alert.date).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <Button variant="ghost" size="sm" className="text-emerald-600">
                          Read More <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredAlerts.length === 0 && (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No alerts found for this category.</p>
            </div>
          )}
        </div>
      </main>

      {/* Subscribe Section */}
      <section className="bg-emerald-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <Bell className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-bold mb-2">Stay Updated</h2>
          <p className="text-emerald-100 mb-6 max-w-md mx-auto">
            Enable notifications to receive health alerts and advisories for your region.
          </p>
          <Button variant="secondary" size="lg">
            <Bell className="h-4 w-4 mr-2" />
            Enable Notifications
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
