"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Activity, Users, Building2 } from "lucide-react";

interface DashboardChartsProps {
  monthlyVisits: { month: string; total: number }[];
  facilitiesByType: { type: string; _count: number }[];
  topDiseases: { diseaseName: string; _sum: { caseCount: number | null } }[];
}

export default function DashboardCharts({ 
  monthlyVisits, 
  facilitiesByType,
  topDiseases 
}: DashboardChartsProps) {
  const maxVisits = Math.max(...monthlyVisits.map(v => v.total), 1);
  const maxCases = Math.max(...topDiseases.map(d => d._sum.caseCount || 0), 1);

  return (
    <div className="grid lg:grid-cols-2 gap-6 mt-8">
      {/* Monthly Visits Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Monthly Patient Visits
          </CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyVisits.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No visit data available</p>
          ) : (
            <div className="space-y-3">
              {monthlyVisits.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="w-12 text-sm text-gray-600">{item.month}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${(item.total / maxVisits) * 100}%` }}
                    />
                  </div>
                  <span className="w-16 text-sm font-medium text-gray-900 text-right">
                    {item.total.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Diseases Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-red-600" />
            Top Reported Conditions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topDiseases.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No diagnosis data available</p>
          ) : (
            <div className="space-y-3">
              {topDiseases.map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {item.diseaseName}
                      </span>
                      <span className="text-sm text-gray-600">
                        {(item._sum.caseCount || 0).toLocaleString()} cases
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                        style={{ width: `${((item._sum.caseCount || 0) / maxCases) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Facilities by Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Facilities by Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {facilitiesByType.map((item, index) => {
              const colors = [
                "bg-blue-100 text-blue-700 border-blue-200",
                "bg-emerald-100 text-emerald-700 border-emerald-200",
                "bg-purple-100 text-purple-700 border-purple-200",
                "bg-amber-100 text-amber-700 border-amber-200",
                "bg-pink-100 text-pink-700 border-pink-200",
                "bg-cyan-100 text-cyan-700 border-cyan-200",
              ];
              return (
                <div 
                  key={item.type} 
                  className={`p-3 rounded-lg border ${colors[index % colors.length]}`}
                >
                  <p className="text-2xl font-bold">{item._count}</p>
                  <p className="text-sm">{item.type.replace(/_/g, " ")}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
              <p className="text-3xl font-bold text-purple-700">
                {monthlyVisits.reduce((sum, v) => sum + v.total, 0).toLocaleString()}
              </p>
              <p className="text-sm text-purple-600">Total Visits (6 months)</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
              <p className="text-3xl font-bold text-emerald-700">
                {topDiseases.reduce((sum, d) => sum + (d._sum.caseCount || 0), 0).toLocaleString()}
              </p>
              <p className="text-sm text-emerald-600">Total Cases Reported</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <p className="text-3xl font-bold text-blue-700">
                {facilitiesByType.reduce((sum, f) => sum + f._count, 0)}
              </p>
              <p className="text-sm text-blue-600">Active Facilities</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
              <p className="text-3xl font-bold text-amber-700">16</p>
              <p className="text-sm text-amber-600">Regions Covered</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
