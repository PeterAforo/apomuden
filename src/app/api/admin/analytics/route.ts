import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "30d";

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    switch (range) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "1y":
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get facility count
    const totalFacilities = await db.facility.count({
      where: { status: "APPROVED" },
    });

    // Get diagnosis reports
    const reports = await db.diagnosisReport.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      include: {
        facility: {
          include: {
            region: true,
          },
        },
      },
    });

    interface ReportWithFacility {
      id: string;
      diseaseCode: string;
      diseaseName: string;
      caseCount: number;
      isAnomalous: boolean;
      facilityId: string;
      createdAt: Date;
      facility: {
        region: { name: string };
      };
    }

    const totalReports = reports.length;
    const totalCases = reports.reduce((sum: number, r: ReportWithFacility) => sum + r.caseCount, 0);
    const anomaliesDetected = reports.filter((r: ReportWithFacility) => r.isAnomalous).length;

    // Group by disease
    const diseaseMap = new Map<string, { code: string; name: string; cases: number }>();
    reports.forEach((report: ReportWithFacility) => {
      const existing = diseaseMap.get(report.diseaseCode);
      if (existing) {
        existing.cases += report.caseCount;
      } else {
        diseaseMap.set(report.diseaseCode, {
          code: report.diseaseCode,
          name: report.diseaseName,
          cases: report.caseCount,
        });
      }
    });

    const topDiseases = Array.from(diseaseMap.values())
      .sort((a, b) => b.cases - a.cases)
      .slice(0, 10)
      .map(d => ({
        diseaseCode: d.code,
        diseaseName: d.name,
        totalCases: d.cases,
        trend: 0,
        regions: [],
      }));

    // Group by region
    const regionMap = new Map<string, { cases: number; facilities: Set<string> }>();
    reports.forEach((report: ReportWithFacility) => {
      const regionName = report.facility.region.name;
      const existing = regionMap.get(regionName);
      if (existing) {
        existing.cases += report.caseCount;
        existing.facilities.add(report.facilityId);
      } else {
        regionMap.set(regionName, {
          cases: report.caseCount,
          facilities: new Set([report.facilityId]),
        });
      }
    });

    const regionalBreakdown = Array.from(regionMap.entries())
      .map(([region, data]) => ({
        region,
        cases: data.cases,
        facilities: data.facilities.size,
      }))
      .sort((a, b) => b.cases - a.cases)
      .slice(0, 10);

    // Weekly trend (last 8 weeks)
    const weeklyTrend: { week: string; cases: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const weekCases = reports
        .filter((r: ReportWithFacility) => r.createdAt >= weekStart && r.createdAt < weekEnd)
        .reduce((sum: number, r: ReportWithFacility) => sum + r.caseCount, 0);
      weeklyTrend.push({
        week: `W${8 - i}`,
        cases: weekCases,
      });
    }

    return NextResponse.json({
      totalFacilities,
      totalReports,
      totalCases,
      anomaliesDetected,
      topDiseases,
      regionalBreakdown,
      weeklyTrend,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
