"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  MapPin, 
  AlertTriangle,
  Activity,
  Users,
  Building2,
  FileText,
  Download,
  Calendar,
  Filter,
  Loader2
} from "lucide-react";

interface DiseaseStats {
  diseaseCode: string;
  diseaseName: string;
  totalCases: number;
  trend: number;
  regions: { name: string; cases: number }[];
}

interface AnalyticsData {
  totalFacilities: number;
  totalReports: number;
  totalCases: number;
  anomaliesDetected: number;
  topDiseases: DiseaseStats[];
  regionalBreakdown: { region: string; cases: number; facilities: number }[];
  weeklyTrend: { week: string; cases: number }[];
}

export default function AnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30d");
  const [data, setData] = useState<AnalyticsData>({
    totalFacilities: 0,
    totalReports: 0,
    totalCases: 0,
    anomaliesDetected: 0,
    topDiseases: [],
    regionalBreakdown: [],
    weeklyTrend: [],
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?range=${dateRange}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, color }: {
    title: string;
    value: number | string;
    icon: React.ElementType;
    trend?: number;
    color: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
            {trend !== undefined && (
              <p className={`text-sm mt-1 ${trend >= 0 ? "text-red-500" : "text-green-500"}`}>
                {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% from last period
              </p>
            )}
          </div>
          <div className={`p-4 rounded-full ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-8 w-8" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Analytics & Intelligence</h1>
                <p className="text-purple-100 mt-1">Disease surveillance and health trends</p>
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white"
              >
                <option value="7d" className="text-gray-900">Last 7 days</option>
                <option value="30d" className="text-gray-900">Last 30 days</option>
                <option value="90d" className="text-gray-900">Last 90 days</option>
                <option value="1y" className="text-gray-900">Last year</option>
              </select>
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 border-0">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Facilities"
                value={data.totalFacilities.toLocaleString()}
                icon={Building2}
                color="bg-blue-500"
              />
              <StatCard
                title="Reports Submitted"
                value={data.totalReports.toLocaleString()}
                icon={FileText}
                color="bg-green-500"
              />
              <StatCard
                title="Total Cases"
                value={data.totalCases.toLocaleString()}
                icon={Users}
                trend={12}
                color="bg-purple-500"
              />
              <StatCard
                title="Anomalies Detected"
                value={data.anomaliesDetected}
                icon={AlertTriangle}
                color="bg-red-500"
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Disease Trends */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      Top Diseases by Case Count
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {data.topDiseases.length > 0 ? (
                        data.topDiseases.map((disease, index) => (
                          <div key={disease.diseaseCode} className="flex items-center gap-4">
                            <span className="text-2xl font-bold text-gray-300 w-8">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="font-medium">{disease.diseaseName}</span>
                                <span className="text-sm text-gray-500">{disease.totalCases} cases</span>
                              </div>
                              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                                  style={{ width: `${(disease.totalCases / (data.topDiseases[0]?.totalCases || 1)) * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-8">No disease data available</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Weekly Trend Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-purple-600" />
                      Weekly Case Trend
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-end gap-2">
                      {data.weeklyTrend.length > 0 ? (
                        data.weeklyTrend.map((week, index) => (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div
                              className="w-full bg-gradient-to-t from-purple-500 to-indigo-400 rounded-t"
                              style={{
                                height: `${(week.cases / Math.max(...data.weeklyTrend.map(w => w.cases), 1)) * 200}px`,
                                minHeight: "4px",
                              }}
                            />
                            <span className="text-xs text-gray-500 mt-2">{week.week}</span>
                          </div>
                        ))
                      ) : (
                        <div className="w-full text-center text-gray-500 py-8">
                          No trend data available
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Regional Breakdown */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-purple-600" />
                      Regional Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {data.regionalBreakdown.length > 0 ? (
                        data.regionalBreakdown.map((region) => (
                          <div key={region.region} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{region.region}</p>
                              <p className="text-sm text-gray-500">{region.facilities} facilities</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-purple-600">{region.cases}</p>
                              <p className="text-xs text-gray-500">cases</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 py-4">No regional data</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Anomaly Alerts */}
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      Active Anomalies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {data.anomaliesDetected > 0 ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-red-50 rounded-lg border border-red-100">
                          <p className="font-medium text-red-800">Malaria Spike</p>
                          <p className="text-sm text-red-600">Greater Accra - 150% above normal</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-4">No anomalies detected</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
