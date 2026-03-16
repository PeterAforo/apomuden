"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MapPin,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Loader2,
  Bug,
  Thermometer,
  Droplets,
  Wind,
} from "lucide-react";

interface DiseaseData {
  id: string;
  name: string;
  cases: number;
  trend: "up" | "down" | "stable";
  changePercent: number;
  severity: "low" | "medium" | "high" | "critical";
  regions: string[];
}

interface OutbreakAlert {
  id: string;
  disease: string;
  region: string;
  date: string;
  status: "active" | "contained" | "resolved";
  cases: number;
}

export default function SurveillancePage() {
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("7d");

  const diseases: DiseaseData[] = [
    { id: "1", name: "Malaria", cases: 2456, trend: "down", changePercent: 12, severity: "high", regions: ["Greater Accra", "Ashanti", "Western"] },
    { id: "2", name: "Cholera", cases: 89, trend: "up", changePercent: 23, severity: "critical", regions: ["Greater Accra", "Central"] },
    { id: "3", name: "Typhoid", cases: 234, trend: "stable", changePercent: 2, severity: "medium", regions: ["Northern", "Upper East"] },
    { id: "4", name: "COVID-19", cases: 156, trend: "down", changePercent: 45, severity: "low", regions: ["Greater Accra"] },
    { id: "5", name: "Dengue Fever", cases: 67, trend: "up", changePercent: 18, severity: "medium", regions: ["Volta", "Greater Accra"] },
    { id: "6", name: "Meningitis", cases: 23, trend: "down", changePercent: 8, severity: "high", regions: ["Upper West", "Northern"] },
  ];

  const outbreakAlerts: OutbreakAlert[] = [
    { id: "1", disease: "Cholera", region: "Greater Accra - James Town", date: "2024-01-15", status: "active", cases: 45 },
    { id: "2", disease: "Meningitis", region: "Northern - Tamale", date: "2024-01-12", status: "contained", cases: 12 },
    { id: "3", disease: "Dengue Fever", region: "Volta - Ho", date: "2024-01-10", status: "active", cases: 28 },
  ];

  const regions = [
    "All Regions",
    "Greater Accra",
    "Ashanti",
    "Western",
    "Central",
    "Eastern",
    "Northern",
    "Upper East",
    "Upper West",
    "Volta",
    "Bono",
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-700 border-red-200";
      case "high": return "bg-orange-100 text-orange-700 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-red-100 text-red-700";
      case "contained": return "bg-yellow-100 text-yellow-700";
      default: return "bg-green-100 text-green-700";
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Disease Surveillance</h1>
          <p className="text-gray-600">Real-time disease monitoring and outbreak tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            >
              {regions.map((region) => (
                <option key={region} value={region.toLowerCase().replace(" ", "-")}>
                  {region}
                </option>
              ))}
            </select>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Cases</p>
                <p className="text-2xl font-bold">3,025</p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5.2% from last week
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Outbreaks</p>
                <p className="text-2xl font-bold">3</p>
                <p className="text-xs text-orange-600 flex items-center mt-1">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  2 critical attention
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Bug className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Regions Affected</p>
                <p className="text-2xl font-bold">8</p>
                <p className="text-xs text-gray-600 flex items-center mt-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  Out of 16 regions
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Response Rate</p>
                <p className="text-2xl font-bold">94%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +2% improvement
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Thermometer className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Outbreak Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Active Outbreak Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {outbreakAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${alert.status === "active" ? "bg-red-500 animate-pulse" : alert.status === "contained" ? "bg-yellow-500" : "bg-green-500"}`} />
                  <div>
                    <p className="font-medium">{alert.disease}</p>
                    <p className="text-sm text-gray-600">{alert.region}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium">{alert.cases} cases</p>
                    <p className="text-xs text-gray-500">{alert.date}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(alert.status)}`}>
                    {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Disease Tracking Table */}
      <Card>
        <CardHeader>
          <CardTitle>Disease Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Disease</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Cases</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Trend</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Severity</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Affected Regions</th>
                </tr>
              </thead>
              <tbody>
                {diseases.map((disease) => (
                  <tr key={disease.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{disease.name}</td>
                    <td className="py-3 px-4">{disease.cases.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`flex items-center gap-1 ${disease.trend === "up" ? "text-red-600" : disease.trend === "down" ? "text-green-600" : "text-gray-600"}`}>
                        {disease.trend === "up" ? <TrendingUp className="w-4 h-4" /> : disease.trend === "down" ? <TrendingDown className="w-4 h-4" /> : null}
                        {disease.changePercent}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(disease.severity)}`}>
                        {disease.severity.charAt(0).toUpperCase() + disease.severity.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {disease.regions.slice(0, 2).join(", ")}
                      {disease.regions.length > 2 && ` +${disease.regions.length - 2} more`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
