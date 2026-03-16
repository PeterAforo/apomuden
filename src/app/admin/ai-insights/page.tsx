"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Lightbulb,
  Target,
  BarChart3,
  Activity,
  RefreshCw,
  Loader2,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Clock,
} from "lucide-react";

interface Insight {
  id: string;
  title: string;
  description: string;
  category: "prediction" | "recommendation" | "alert" | "trend";
  priority: "high" | "medium" | "low";
  confidence: number;
  actionable: boolean;
  timestamp: string;
}

interface Prediction {
  id: string;
  metric: string;
  currentValue: number;
  predictedValue: number;
  timeframe: string;
  confidence: number;
  trend: "up" | "down" | "stable";
}

export default function AIInsightsPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"insights" | "predictions" | "recommendations">("insights");

  const insights: Insight[] = [
    {
      id: "1",
      title: "Cholera Outbreak Risk Elevated",
      description: "Based on rainfall patterns, sanitation reports, and historical data, there's a 78% probability of cholera cases increasing in Greater Accra within the next 2 weeks.",
      category: "alert",
      priority: "high",
      confidence: 78,
      actionable: true,
      timestamp: "2 hours ago",
    },
    {
      id: "2",
      title: "Emergency Response Optimization",
      description: "Analysis shows ambulance response times can be improved by 23% by repositioning 3 units from Central to Eastern region during peak hours (6PM-10PM).",
      category: "recommendation",
      priority: "medium",
      confidence: 85,
      actionable: true,
      timestamp: "5 hours ago",
    },
    {
      id: "3",
      title: "Facility Capacity Prediction",
      description: "Korle Bu Teaching Hospital is projected to reach 95% capacity within 5 days based on current admission trends. Consider activating overflow protocols.",
      category: "prediction",
      priority: "high",
      confidence: 82,
      actionable: true,
      timestamp: "1 day ago",
    },
    {
      id: "4",
      title: "Seasonal Malaria Trend",
      description: "Malaria cases are following expected seasonal patterns with a 15% decrease compared to the same period last year, indicating successful prevention campaigns.",
      category: "trend",
      priority: "low",
      confidence: 92,
      actionable: false,
      timestamp: "2 days ago",
    },
    {
      id: "5",
      title: "NHIS Claim Pattern Anomaly",
      description: "Unusual spike in NHIS claims from 3 facilities in Ashanti region detected. Pattern suggests potential billing irregularities requiring audit.",
      category: "alert",
      priority: "medium",
      confidence: 71,
      actionable: true,
      timestamp: "3 days ago",
    },
  ];

  const predictions: Prediction[] = [
    { id: "1", metric: "Daily Emergency Calls", currentValue: 245, predictedValue: 312, timeframe: "Next 7 days", confidence: 88, trend: "up" },
    { id: "2", metric: "Hospital Bed Occupancy", currentValue: 78, predictedValue: 85, timeframe: "Next 14 days", confidence: 82, trend: "up" },
    { id: "3", metric: "Ambulance Demand", currentValue: 156, predictedValue: 142, timeframe: "Next 7 days", confidence: 75, trend: "down" },
    { id: "4", metric: "Outpatient Visits", currentValue: 12500, predictedValue: 14200, timeframe: "Next 30 days", confidence: 79, trend: "up" },
    { id: "5", metric: "Medicine Stock Depletion", currentValue: 45, predictedValue: 62, timeframe: "Next 21 days", confidence: 86, trend: "up" },
  ];

  const recommendations = [
    {
      id: "1",
      title: "Increase Ambulance Coverage in Northern Region",
      impact: "High",
      effort: "Medium",
      description: "Deploy 2 additional ambulance units to Tamale to reduce average response time by 18 minutes.",
      status: "pending",
    },
    {
      id: "2",
      title: "Launch Cholera Prevention Campaign",
      impact: "High",
      effort: "High",
      description: "Initiate public awareness campaign in James Town and surrounding areas before rainy season peak.",
      status: "in_progress",
    },
    {
      id: "3",
      title: "Optimize Staff Scheduling at Ridge Hospital",
      impact: "Medium",
      effort: "Low",
      description: "Adjust nurse shift patterns based on patient flow analysis to reduce wait times by 25%.",
      status: "completed",
    },
    {
      id: "4",
      title: "Upgrade Telemedicine Infrastructure",
      impact: "High",
      effort: "High",
      description: "Expand telemedicine capabilities to 15 rural health centers to improve access in underserved areas.",
      status: "pending",
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "alert": return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "recommendation": return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      case "prediction": return <Target className="w-5 h-5 text-blue-500" />;
      default: return <TrendingUp className="w-5 h-5 text-green-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-700 border-red-200";
      case "medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default: return "bg-green-100 text-green-700 border-green-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700";
      case "in_progress": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">AI is analyzing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Brain className="w-7 h-7 text-purple-600" />
            AI Insights & Predictions
          </h1>
          <p className="text-gray-600">Machine learning-powered health analytics and recommendations</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Generate New Insights
        </Button>
      </div>

      {/* AI Summary Card */}
      <Card className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">AI Health System Summary</h3>
              <p className="text-purple-100 text-sm">
                Based on analysis of 2.4M data points across 847 facilities, the health system is operating at 
                <span className="font-bold text-white"> 87% efficiency</span>. Key areas requiring attention: 
                emergency response in Northern region, cholera prevention in coastal areas, and facility capacity 
                management in Greater Accra.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { id: "insights", label: "Insights", icon: Lightbulb },
          { id: "predictions", label: "Predictions", icon: Target },
          { id: "recommendations", label: "Recommendations", icon: CheckCircle },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Insights Tab */}
      {activeTab === "insights" && (
        <div className="space-y-4">
          {insights.map((insight) => (
            <Card key={insight.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getCategoryIcon(insight.category)}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${getPriorityColor(insight.priority)}`}>
                        {insight.priority.charAt(0).toUpperCase() + insight.priority.slice(1)} Priority
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {insight.timestamp}
                      </span>
                      <span className="text-gray-500">
                        Confidence: <span className="font-medium text-gray-700">{insight.confidence}%</span>
                      </span>
                      {insight.actionable && (
                        <Button variant="link" size="sm" className="text-purple-600 p-0 h-auto">
                          Take Action <ArrowRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Predictions Tab */}
      {activeTab === "predictions" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {predictions.map((prediction) => (
            <Card key={prediction.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-gray-900">{prediction.metric}</h3>
                  {prediction.trend === "up" ? (
                    <TrendingUp className="w-5 h-5 text-red-500" />
                  ) : prediction.trend === "down" ? (
                    <TrendingDown className="w-5 h-5 text-green-500" />
                  ) : (
                    <Activity className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div className="flex items-end gap-2 mb-2">
                  <span className="text-3xl font-bold text-gray-900">{prediction.predictedValue.toLocaleString()}</span>
                  <span className="text-sm text-gray-500 mb-1">predicted</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Current: {prediction.currentValue.toLocaleString()} • {prediction.timeframe}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{ width: `${prediction.confidence}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{prediction.confidence}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recommendations Tab */}
      {activeTab === "recommendations" && (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <Card key={rec.id}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(rec.status)}`}>
                        {rec.status.replace("_", " ").charAt(0).toUpperCase() + rec.status.replace("_", " ").slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{rec.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm">
                      <span className="text-gray-500">
                        Impact: <span className="font-medium text-gray-700">{rec.impact}</span>
                      </span>
                      <span className="text-gray-500">
                        Effort: <span className="font-medium text-gray-700">{rec.effort}</span>
                      </span>
                    </div>
                  </div>
                  {rec.status === "pending" && (
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                      Implement
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
