"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  MapPin,
  Star,
  Clock,
  Heart,
  Bell,
  Settings,
  LogOut,
  ChevronRight,
  Building2,
  AlertTriangle,
  Calendar,
  Phone,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const QUICK_ACTIONS = [
  {
    title: "Find Facilities",
    description: "Search for hospitals and clinics near you",
    icon: Building2,
    href: "/facilities",
    color: "bg-emerald-500",
  },
  {
    title: "Emergency Services",
    description: "Request ambulance or emergency help",
    icon: AlertTriangle,
    href: "/emergency",
    color: "bg-red-500",
  },
  {
    title: "Health Alerts",
    description: "View health advisories in your area",
    icon: Bell,
    href: "/alerts",
    color: "bg-amber-500",
  },
  {
    title: "My Appointments",
    description: "View and manage your appointments",
    icon: Calendar,
    href: "/dashboard/appointments",
    color: "bg-blue-500",
  },
];

const RECENT_ACTIVITY = [
  {
    type: "visit",
    title: "Visited Korle Bu Teaching Hospital",
    date: "2 days ago",
    icon: Building2,
  },
  {
    type: "review",
    title: "Left a review for Ridge Hospital",
    date: "1 week ago",
    icon: Star,
  },
  {
    type: "emergency",
    title: "Emergency request completed",
    date: "2 weeks ago",
    icon: AlertTriangle,
  },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Welcome back, {session.user?.name?.split(" ")[0] || "User"}!
                </h1>
                <p className="text-emerald-100 flex items-center gap-2 mt-1">
                  <Phone className="h-4 w-4" />
                  {session.user?.email || "User"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Link href="/dashboard/profile">
                <Button variant="secondary" size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0 min-h-[44px]">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/20 hover:bg-white/30 text-white border-0 min-h-[44px]"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-8 flex-1">
        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Link href={action.href}>
                  <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                    <CardContent className="p-5">
                      <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Health Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Health Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-emerald-50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-emerald-600">3</div>
                    <p className="text-sm text-gray-600">Facilities Visited</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">2</div>
                    <p className="text-sm text-gray-600">Reviews Given</p>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-amber-600">1</div>
                    <p className="text-sm text-gray-600">Emergency Requests</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-gray-500" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {RECENT_ACTIVITY.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <activity.icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{activity.title}</p>
                        <p className="text-sm text-gray-500">{activity.date}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  ))}
                </div>
                <Button variant="ghost" className="w-full mt-4 text-emerald-600">
                  View All Activity
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Saved Facilities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Saved Facilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Korle Bu Teaching Hospital", type: "Hospital" },
                    { name: "Ridge Hospital", type: "Hospital" },
                    { name: "Medilab Diagnostics", type: "Diagnostic Centre" },
                  ].map((facility, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">{facility.name}</p>
                        <p className="text-xs text-gray-500">{facility.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/facilities">
                  <Button variant="outline" className="w-full mt-4" size="sm">
                    Browse Facilities
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Health Tips */}
            <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">💡 Health Tip</h3>
                <p className="text-emerald-100 text-sm mb-4">
                  Regular health check-ups can help detect potential health issues early. 
                  Schedule your annual check-up today!
                </p>
                <Button variant="secondary" size="sm" className="bg-white text-emerald-600 hover:bg-emerald-50">
                  Find a Facility
                </Button>
              </CardContent>
            </Card>

            {/* NHIS Status */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">NHIS Status</h3>
                    <p className="text-sm text-emerald-600 font-medium">Active</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500">Card Number</p>
                  <p className="font-mono font-medium text-gray-900">GHA-XXXX-XXXX-1234</p>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Expires: December 2024
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
