"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity, Clock, CheckCircle, AlertTriangle, TrendingUp,
  Building2, Ambulance, Users, ArrowLeft, Calendar, MapPin,
  Phone, Star, Timer, Heart, ThumbsUp, BarChart3, PieChart
} from "lucide-react";

interface EmergencyStats {
  totalRequests: number;
  successfulResponses: number;
  averageResponseTime: number;
  averageTimeToHospital: number;
  responseRate: number;
  pendingRequests: number;
  todayRequests: number;
  weeklyTrend: number;
}

interface RecentEmergency {
  id: string;
  type: string;
  status: string;
  facilityName: string;
  responseTime: number;
  timeToHospital: number;
  createdAt: string;
  patientName?: string;
}

interface SuccessStory {
  id: string;
  patientName: string;
  emergencyType: string;
  facilityName: string;
  responseTime: number;
  outcome: string;
  date: string;
  testimonial?: string;
}

const EMERGENCY_TYPE_COLORS: Record<string, string> = {
  MEDICAL: "bg-red-100 text-red-700",
  ACCIDENT: "bg-orange-100 text-orange-700",
  MATERNITY: "bg-pink-100 text-pink-700",
  FIRE_BURNS: "bg-amber-100 text-amber-700",
  OTHER: "bg-blue-100 text-blue-700",
};

const MOCK_STATS: EmergencyStats = {
  totalRequests: 1247,
  successfulResponses: 1198,
  averageResponseTime: 4.2,
  averageTimeToHospital: 18.5,
  responseRate: 96.1,
  pendingRequests: 3,
  todayRequests: 12,
  weeklyTrend: 8.5,
};

const MOCK_RECENT: RecentEmergency[] = [
  { id: "1", type: "MEDICAL", status: "COMPLETED", facilityName: "Korle Bu Teaching Hospital", responseTime: 3, timeToHospital: 15, createdAt: "2024-03-15T10:30:00Z", patientName: "Kwame A." },
  { id: "2", type: "ACCIDENT", status: "IN_PROGRESS", facilityName: "Ridge Hospital", responseTime: 5, timeToHospital: 22, createdAt: "2024-03-15T09:45:00Z", patientName: "Ama M." },
  { id: "3", type: "MATERNITY", status: "COMPLETED", facilityName: "37 Military Hospital", responseTime: 2, timeToHospital: 12, createdAt: "2024-03-15T08:20:00Z", patientName: "Efua D." },
  { id: "4", type: "MEDICAL", status: "COMPLETED", facilityName: "Trust Hospital", responseTime: 4, timeToHospital: 18, createdAt: "2024-03-14T22:15:00Z", patientName: "Kofi B." },
  { id: "5", type: "FIRE_BURNS", status: "COMPLETED", facilityName: "Nyaho Medical Centre", responseTime: 6, timeToHospital: 25, createdAt: "2024-03-14T18:30:00Z", patientName: "Yaw O." },
];

const MOCK_SUCCESS_STORIES: SuccessStory[] = [
  {
    id: "1",
    patientName: "Kwame Asante",
    emergencyType: "MEDICAL",
    facilityName: "Korle Bu Teaching Hospital",
    responseTime: 3,
    outcome: "Full Recovery",
    date: "2024-03-10",
    testimonial: "The quick response saved my life. The hospital was ready when I arrived.",
  },
  {
    id: "2",
    patientName: "Ama Mensah",
    emergencyType: "MATERNITY",
    facilityName: "Ridge Hospital",
    responseTime: 2,
    outcome: "Healthy Baby Delivered",
    date: "2024-03-08",
    testimonial: "I was so scared but the team was amazing. My baby is healthy thanks to Apomuden.",
  },
  {
    id: "3",
    patientName: "Kofi Owusu",
    emergencyType: "ACCIDENT",
    facilityName: "37 Military Hospital",
    responseTime: 4,
    outcome: "Successful Surgery",
    date: "2024-03-05",
    testimonial: "After my accident, I thought I wouldn't make it. The fast response made all the difference.",
  },
];

export default function EmergencyAnalyticsPage() {
  const [stats, setStats] = useState<EmergencyStats>(MOCK_STATS);
  const [recentEmergencies, setRecentEmergencies] = useState<RecentEmergency[]>(MOCK_RECENT);
  const [successStories, setSuccessStories] = useState<SuccessStory[]>(MOCK_SUCCESS_STORIES);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<"today" | "week" | "month" | "all">("week");

  useEffect(() => {
    // In production, fetch real data from API
    // fetchEmergencyAnalytics();
  }, [selectedPeriod]);

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon: Icon, 
    color, 
    trend 
  }: { 
    title: string; 
    value: string | number; 
    subtitle?: string; 
    icon: React.ElementType; 
    color: string;
    trend?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">{title}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
              {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
              {trend !== undefined && (
                <div className={`flex items-center gap-1 mt-2 text-sm ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
                  <TrendingUp className={`w-4 h-4 ${trend < 0 ? "rotate-180" : ""}`} />
                  <span>{Math.abs(trend)}% vs last period</span>
                </div>
              )}
            </div>
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Emergency Analytics</h1>
                <p className="text-sm text-gray-500">Monitor emergency response performance</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {(["today", "week", "month", "all"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedPeriod === period
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Requests"
            value={stats.totalRequests.toLocaleString()}
            subtitle={`${stats.todayRequests} today`}
            icon={Activity}
            color="bg-blue-500"
            trend={stats.weeklyTrend}
          />
          <StatCard
            title="Response Rate"
            value={`${stats.responseRate}%`}
            subtitle={`${stats.successfulResponses} successful`}
            icon={CheckCircle}
            color="bg-green-500"
            trend={2.3}
          />
          <StatCard
            title="Avg Response Time"
            value={`${stats.averageResponseTime} min`}
            subtitle="Time to first contact"
            icon={Timer}
            color="bg-amber-500"
            trend={-5.2}
          />
          <StatCard
            title="Avg Time to Hospital"
            value={`${stats.averageTimeToHospital} min`}
            subtitle="Patient arrival time"
            icon={Ambulance}
            color="bg-red-500"
            trend={-3.1}
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Emergency Types Distribution */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-emerald-600" />
                Emergency Types Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: "Medical", percentage: 45, color: "bg-red-500" },
                  { type: "Accident/Trauma", percentage: 28, color: "bg-orange-500" },
                  { type: "Maternity", percentage: 15, color: "bg-pink-500" },
                  { type: "Fire/Burns", percentage: 8, color: "bg-amber-500" },
                  { type: "Other", percentage: 4, color: "bg-blue-500" },
                ].map((item) => (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{item.type}</span>
                      <span className="text-sm text-gray-500">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${item.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Response Time Trends */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                Response Time Trends (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-48 gap-2">
                {[
                  { day: "Mon", time: 4.5 },
                  { day: "Tue", time: 3.8 },
                  { day: "Wed", time: 5.2 },
                  { day: "Thu", time: 4.1 },
                  { day: "Fri", time: 3.5 },
                  { day: "Sat", time: 4.8 },
                  { day: "Sun", time: 4.2 },
                ].map((item, idx) => (
                  <div key={item.day} className="flex flex-col items-center flex-1">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${(item.time / 6) * 100}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg relative group"
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {item.time} min
                      </div>
                    </motion.div>
                    <span className="text-xs text-gray-500 mt-2">{item.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Emergencies & Success Stories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Emergencies */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  Recent Emergencies
                </span>
                <span className="text-sm font-normal text-gray-500">
                  {stats.pendingRequests} pending
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentEmergencies.map((emergency) => (
                  <div
                    key={emergency.id}
                    className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${EMERGENCY_TYPE_COLORS[emergency.type]}`}>
                      {emergency.type}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-gray-900 truncate">{emergency.patientName}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          emergency.status === "COMPLETED" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {emergency.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{emergency.facilityName}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Timer className="w-3 h-3" /> {emergency.responseTime} min response
                        </span>
                        <span className="flex items-center gap-1">
                          <Ambulance className="w-3 h-3" /> {emergency.timeToHospital} min to hospital
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Emergencies
              </Button>
            </CardContent>
          </Card>

          {/* Success Stories */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" />
                Success Stories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {successStories.map((story) => (
                  <div
                    key={story.id}
                    className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{story.patientName}</p>
                        <p className="text-sm text-gray-500">{story.facilityName}</p>
                      </div>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        {story.outcome}
                      </span>
                    </div>
                    {story.testimonial && (
                      <p className="text-sm text-gray-600 italic mt-2">
                        &ldquo;{story.testimonial}&rdquo;
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      <span className={`${EMERGENCY_TYPE_COLORS[story.emergencyType]} px-2 py-0.5 rounded-full`}>
                        {story.emergencyType}
                      </span>
                      <span className="flex items-center gap-1">
                        <Timer className="w-3 h-3" /> {story.responseTime} min response
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {story.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4">
                View All Success Stories
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Facilities */}
        <Card className="border-0 shadow-lg mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Top Performing Facilities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Facility</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Emergencies Handled</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Avg Response Time</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Success Rate</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Korle Bu Teaching Hospital", handled: 245, responseTime: 3.2, successRate: 98.5, rating: 4.9 },
                    { name: "Ridge Hospital", handled: 189, responseTime: 3.8, successRate: 97.2, rating: 4.8 },
                    { name: "37 Military Hospital", handled: 156, responseTime: 4.1, successRate: 96.8, rating: 4.7 },
                    { name: "Trust Hospital", handled: 134, responseTime: 4.5, successRate: 95.5, rating: 4.6 },
                    { name: "Nyaho Medical Centre", handled: 98, responseTime: 4.8, successRate: 94.2, rating: 4.5 },
                  ].map((facility, idx) => (
                    <tr key={facility.name} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-gray-900">{facility.name}</span>
                        </div>
                      </td>
                      <td className="text-center py-3 px-4 text-gray-600">{facility.handled}</td>
                      <td className="text-center py-3 px-4">
                        <span className="text-emerald-600 font-medium">{facility.responseTime} min</span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-sm">
                          {facility.successRate}%
                        </span>
                      </td>
                      <td className="text-center py-3 px-4">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="font-medium">{facility.rating}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
