import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Building2, Clock, CheckCircle, MapPin, Users, Activity, 
  TrendingUp, AlertTriangle, Brain, BarChart3 
} from "lucide-react";
import DashboardCharts from "./components/DashboardCharts";
import AIInsightsCard from "./components/AIInsightsCard";

export const dynamic = "force-dynamic";

interface AdminFacility {
  id: string;
  name: string;
  type: string;
  tier: string | null;
  licenseNumber: string;
  region: {
    name: string;
  };
}

interface FacilityTypeCount {
  type: string;
  _count: number;
}

async function getStats() {
  const [
    totalFacilities,
    pendingApprovals,
    approvedFacilities,
    totalRegions,
    totalUsers,
  ] = await Promise.all([
    db.facility.count(),
    db.facility.count({ where: { status: "PENDING" } }),
    db.facility.count({ where: { status: "APPROVED" } }),
    db.region.count(),
    db.user.count(),
  ]);

  const facilitiesByType = await db.facility.groupBy({
    by: ["type"],
    _count: true,
    where: { status: "APPROVED" },
  });

  const facilitiesByRegion = await db.facility.groupBy({
    by: ["regionId"],
    _count: true,
    where: { status: "APPROVED" },
  });

  // Get diagnosis reports for disease trends
  const recentDiagnoses = await db.diagnosisReport.groupBy({
    by: ['diseaseName'],
    _sum: { caseCount: true },
    orderBy: { _sum: { caseCount: 'desc' } },
    take: 5,
  });

  return {
    totalFacilities,
    pendingApprovals,
    approvedFacilities,
    totalRegions,
    totalUsers,
    facilitiesByType,
    facilitiesByRegion: facilitiesByRegion.length,
    topDiseases: recentDiagnoses,
  };
}

async function getPendingFacilities() {
  return db.facility.findMany({
    where: { status: "PENDING" },
    include: { region: true, district: true },
    orderBy: { createdAt: "desc" },
    take: 10,
  });
}

async function getRecentFacilities() {
  return db.facility.findMany({
    where: { status: "APPROVED" },
    include: { region: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
}

async function getMonthlyVisitData() {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  
  try {
    const visits = await db.$queryRaw<{ month: string; total: number }[]>`
      SELECT 
        TO_CHAR(visit_date, 'Mon') as month,
        SUM(visit_count)::int as total
      FROM facility_visits
      WHERE visit_date >= ${sixMonthsAgo}
      GROUP BY TO_CHAR(visit_date, 'Mon'), DATE_TRUNC('month', visit_date)
      ORDER BY DATE_TRUNC('month', visit_date)
    `;
    return visits;
  } catch {
    return [];
  }
}

export default async function AdminDashboard() {
  const session = await auth();
  const userRole = (session?.user as { role?: string })?.role || "DISTRICT_OFFICER";
  
  const stats = await getStats();
  const pendingFacilities = await getPendingFacilities();
  const recentFacilities = await getRecentFacilities();
  const monthlyVisits = await getMonthlyVisitData();

  const roleLabels: Record<string, string> = {
    SUPER_ADMIN: "Super Administrator",
    MINISTRY_ADMIN: "Ministry Administrator",
    ANALYST: "Health Analyst",
    REGIONAL_DIRECTOR: "Regional Director",
    DISTRICT_OFFICER: "District Officer",
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 text-sm">
                Welcome back, {session?.user?.name || "Admin"} • {roleLabels[userRole]}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {new Date().toLocaleDateString('en-GB', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Facilities</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalFacilities}</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pending Approvals</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.pendingApprovals}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Approved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.approvedFacilities}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Regions Covered</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.facilitiesByRegion}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pending Approvals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pending Approvals</CardTitle>
              <Link href="/admin/facilities?status=pending" className="text-sm text-emerald-600 hover:underline">
                View All
              </Link>
            </CardHeader>
            <CardContent>
              {pendingFacilities.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No pending approvals</p>
              ) : (
                <div className="space-y-4">
                  {pendingFacilities.map((facility: AdminFacility) => (
                    <div key={facility.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{facility.name}</p>
                        <p className="text-sm text-gray-500">
                          {facility.type.replace("_", " ")} • {facility.region.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          License: {facility.licenseNumber}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/facilities/${facility.id}`}
                          className="px-3 py-1 bg-emerald-600 text-white text-sm rounded hover:bg-emerald-700"
                        >
                          Review
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Approvals */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recently Approved</CardTitle>
              <Link href="/admin/facilities?status=approved" className="text-sm text-emerald-600 hover:underline">
                View All
              </Link>
            </CardHeader>
            <CardContent>
              {recentFacilities.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No approved facilities yet</p>
              ) : (
                <div className="space-y-4">
                  {recentFacilities.map((facility: AdminFacility) => (
                    <div key={facility.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{facility.name}</p>
                        <p className="text-sm text-gray-500">
                          {facility.type.replace("_", " ")} • {facility.region.name}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {facility.tier && (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded">
                            {facility.tier.replace("_", " ")}
                          </span>
                        )}
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                          Approved
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Facility Types Distribution */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Facilities by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {stats.facilitiesByType.map((item: FacilityTypeCount) => (
                <div key={item.type} className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-gray-900">{item._count}</p>
                  <p className="text-sm text-gray-500">{item.type.replace("_", " ")}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <Link
                href="/admin/alerts/create"
                className="p-4 bg-red-50 border border-red-200 rounded-lg text-center hover:bg-red-100 transition-colors"
              >
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="font-medium text-red-700">Create Alert</p>
              </Link>

              <Link
                href="/admin/reports"
                className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center hover:bg-blue-100 transition-colors"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="font-medium text-blue-700">View Reports</p>
              </Link>

              <Link
                href="/admin/facilities"
                className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-center hover:bg-emerald-100 transition-colors"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <p className="font-medium text-emerald-700">Manage Facilities</p>
              </Link>

              <Link
                href="/admin/surveillance"
                className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-center hover:bg-purple-100 transition-colors"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <p className="font-medium text-purple-700">Disease Surveillance</p>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section - Only for Analysts and Admins */}
        {["SUPER_ADMIN", "MINISTRY_ADMIN", "ANALYST"].includes(userRole) && (
          <DashboardCharts 
            monthlyVisits={monthlyVisits}
            facilitiesByType={stats.facilitiesByType}
            topDiseases={stats.topDiseases}
          />
        )}

        {/* AI Insights - Only for Super Admin and Analysts */}
        {["SUPER_ADMIN", "ANALYST"].includes(userRole) && (
          <AIInsightsCard stats={stats} userRole={userRole} />
        )}
      </main>
    </div>
  );
}
