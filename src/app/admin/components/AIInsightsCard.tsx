"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Lightbulb, TrendingUp, AlertTriangle, RefreshCw, Sparkles } from "lucide-react";

interface AIInsightsCardProps {
  stats: {
    totalFacilities: number;
    pendingApprovals: number;
    approvedFacilities: number;
    totalUsers?: number;
    topDiseases?: { diseaseName: string; _sum: { caseCount: number | null } }[];
  };
  userRole: string;
}

export default function AIInsightsCard({ stats, userRole }: AIInsightsCardProps) {
  const [loading, setLoading] = useState(false);

  // Generate insights based on data
  const generateInsights = () => {
    const insights: { type: "info" | "warning" | "success" | "tip"; message: string }[] = [];

    // Pending approvals insight
    if (stats.pendingApprovals > 5) {
      insights.push({
        type: "warning",
        message: `You have ${stats.pendingApprovals} facilities pending approval. Consider reviewing them to maintain service quality.`
      });
    } else if (stats.pendingApprovals === 0) {
      insights.push({
        type: "success",
        message: "All facility applications have been reviewed. Great job keeping up with approvals!"
      });
    }

    // Coverage insight
    const coverageRate = (stats.approvedFacilities / stats.totalFacilities * 100).toFixed(1);
    insights.push({
      type: "info",
      message: `${coverageRate}% of registered facilities are currently approved and operational.`
    });

    // Disease trends
    if (stats.topDiseases && stats.topDiseases.length > 0) {
      const topDisease = stats.topDiseases[0];
      insights.push({
        type: "warning",
        message: `${topDisease.diseaseName} is the most reported condition with ${(topDisease._sum.caseCount || 0).toLocaleString()} cases. Consider targeted health campaigns.`
      });
    }

    // Role-specific insights
    if (userRole === "SUPER_ADMIN") {
      insights.push({
        type: "tip",
        message: "As Super Admin, you can access all system features including user management and audit logs."
      });
    } else if (userRole === "ANALYST") {
      insights.push({
        type: "tip",
        message: "Use the Analytics dashboard to generate detailed reports on disease trends and facility performance."
      });
    } else if (userRole === "MINISTRY_ADMIN") {
      insights.push({
        type: "tip",
        message: "Review regional performance metrics to identify areas needing additional healthcare resources."
      });
    }

    // General recommendations
    insights.push({
      type: "info",
      message: "Regular monitoring of facility statistics helps identify healthcare gaps and improve service delivery."
    });

    return insights;
  };

  const insights = generateInsights();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "warning": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "success": return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case "tip": return <Lightbulb className="w-5 h-5 text-purple-500" />;
      default: return <Sparkles className="w-5 h-5 text-blue-500" />;
    }
  };

  const getInsightBg = (type: string) => {
    switch (type) {
      case "warning": return "bg-amber-50 border-amber-200";
      case "success": return "bg-emerald-50 border-emerald-200";
      case "tip": return "bg-purple-50 border-purple-200";
      default: return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <Card className="mt-8 border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <span className="text-lg">AI-Powered Insights</span>
              <p className="text-sm font-normal text-gray-500">Intelligent analysis of your health data</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1000);
            }}
            disabled={loading}
            className="border-purple-300 text-purple-700 hover:bg-purple-100"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div 
              key={index}
              className={`flex items-start gap-3 p-3 rounded-lg border ${getInsightBg(insight.type)}`}
            >
              {getInsightIcon(insight.type)}
              <p className="text-sm text-gray-700">{insight.message}</p>
            </div>
          ))}
        </div>

        {/* AI Recommendations Section */}
        <div className="mt-6 p-4 bg-white rounded-lg border border-purple-200">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Recommended Actions
          </h4>
          <ul className="space-y-2 text-sm text-gray-600">
            {stats.pendingApprovals > 0 && (
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                Review {stats.pendingApprovals} pending facility applications
              </li>
            )}
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
              Check disease surveillance dashboard for outbreak alerts
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
              Generate monthly performance report for stakeholders
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
              Review facility bed availability across regions
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
