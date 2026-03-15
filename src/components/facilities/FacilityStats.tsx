"use client";

import { useState, useEffect } from "react";
import { Users, Activity, TrendingUp } from "lucide-react";

interface FacilityStatsProps {
  facilityId: string;
  compact?: boolean;
}

interface DiagnosisData {
  rank: number;
  diseaseCode: string;
  diseaseName: string;
  caseCount: number;
}

interface StatsData {
  visitCount: number;
  topDiagnoses: DiagnosisData[];
  period: {
    start: string;
    end: string;
    type: string;
  };
}

export function FacilityStats({ facilityId, compact = false }: FacilityStatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/facilities/${facilityId}/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch facility stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [facilityId]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-emerald-600" />
          <span>{stats.visitCount.toLocaleString()} visits</span>
        </div>
        {stats.topDiagnoses.length > 0 && (
          <div className="flex items-center gap-1">
            <Activity className="h-4 w-4 text-blue-600" />
            <span>Top: {stats.topDiagnoses[0]?.diseaseName}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          Facility Statistics
        </h4>
        <span className="text-xs text-gray-500">
          {new Date(stats.period.start).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
        </span>
      </div>

      {/* Visit Count */}
      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
          <Users className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{stats.visitCount.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Patient Visits This Month</p>
        </div>
      </div>

      {/* Top Diagnoses */}
      {stats.topDiagnoses.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            Most Reported Conditions
          </h5>
          <div className="space-y-2">
            {stats.topDiagnoses.map((diagnosis) => (
              <div
                key={diagnosis.diseaseCode}
                className="flex items-center justify-between p-2 bg-white rounded border text-sm"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-medium">
                    {diagnosis.rank}
                  </span>
                  <span className="text-gray-900">{diagnosis.diseaseName}</span>
                </div>
                <span className="text-gray-600 font-medium">{diagnosis.caseCount} cases</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default FacilityStats;
