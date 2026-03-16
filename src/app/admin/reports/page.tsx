"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Loader2,
  BarChart3,
  PieChart,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  File,
} from "lucide-react";

interface Report {
  id: string;
  name: string;
  type: "daily" | "weekly" | "monthly" | "quarterly" | "annual";
  category: "facilities" | "emergency" | "disease" | "financial" | "performance";
  lastGenerated: string;
  status: "ready" | "generating" | "scheduled";
  size: string;
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState("all");

  const reports: Report[] = [
    { id: "1", name: "Daily Facility Operations Summary", type: "daily", category: "facilities", lastGenerated: "Today, 6:00 AM", status: "ready", size: "2.4 MB" },
    { id: "2", name: "Weekly Emergency Response Report", type: "weekly", category: "emergency", lastGenerated: "Jan 14, 2024", status: "ready", size: "5.1 MB" },
    { id: "3", name: "Monthly Disease Surveillance Report", type: "monthly", category: "disease", lastGenerated: "Jan 1, 2024", status: "ready", size: "12.3 MB" },
    { id: "4", name: "Quarterly NHIS Claims Analysis", type: "quarterly", category: "financial", lastGenerated: "Dec 31, 2023", status: "ready", size: "8.7 MB" },
    { id: "5", name: "Annual Health System Performance", type: "annual", category: "performance", lastGenerated: "Dec 31, 2023", status: "ready", size: "45.2 MB" },
    { id: "6", name: "Weekly Ambulance Utilization", type: "weekly", category: "emergency", lastGenerated: "Generating...", status: "generating", size: "-" },
    { id: "7", name: "Monthly Facility Compliance Audit", type: "monthly", category: "facilities", lastGenerated: "Scheduled: Jan 31", status: "scheduled", size: "-" },
    { id: "8", name: "Regional Health Indicators", type: "monthly", category: "performance", lastGenerated: "Jan 1, 2024", status: "ready", size: "15.8 MB" },
  ];

  const reportTemplates = [
    { id: "1", name: "Custom Facility Report", icon: FileText, description: "Generate custom reports for specific facilities" },
    { id: "2", name: "Disease Trend Analysis", icon: TrendingUp, description: "Analyze disease patterns over custom time periods" },
    { id: "3", name: "Financial Summary", icon: BarChart3, description: "NHIS claims, revenue, and expenditure reports" },
    { id: "4", name: "Resource Utilization", icon: PieChart, description: "Staff, equipment, and bed utilization metrics" },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "facilities": return "bg-blue-100 text-blue-700";
      case "emergency": return "bg-red-100 text-red-700";
      case "disease": return "bg-purple-100 text-purple-700";
      case "financial": return "bg-green-100 text-green-700";
      default: return "bg-orange-100 text-orange-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "generating": return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const filteredReports = reports.filter((report) => {
    if (selectedCategory !== "all" && report.category !== selectedCategory) return false;
    if (selectedType !== "all" && report.type !== selectedType) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Generate and download health system reports</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <FileText className="w-4 h-4 mr-2" />
          Create Custom Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reports Generated</p>
                <p className="text-2xl font-bold">156</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Downloads</p>
                <p className="text-2xl font-bold">423</p>
                <p className="text-xs text-gray-500">This month</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Download className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-gray-500">Upcoming reports</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Storage Used</p>
                <p className="text-2xl font-bold">2.4 GB</p>
                <p className="text-xs text-gray-500">Of 10 GB</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Report Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportTemplates.map((template) => (
              <button
                key={template.id}
                className="p-4 border rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-left"
              >
                <template.icon className="w-8 h-8 text-emerald-600 mb-2" />
                <h3 className="font-medium text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              <option value="facilities">Facilities</option>
              <option value="emergency">Emergency</option>
              <option value="disease">Disease</option>
              <option value="financial">Financial</option>
              <option value="performance">Performance</option>
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Types</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg border flex items-center justify-center">
                    {report.status === "ready" ? (
                      <File className="w-5 h-5 text-red-500" />
                    ) : (
                      <FileSpreadsheet className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{report.name}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(report.category)}`}>
                        {report.category.charAt(0).toUpperCase() + report.category.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">{report.type}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm">
                      {getStatusIcon(report.status)}
                      <span className="text-gray-600">{report.lastGenerated}</span>
                    </div>
                    {report.status === "ready" && (
                      <p className="text-xs text-gray-500">{report.size}</p>
                    )}
                  </div>
                  {report.status === "ready" && (
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
