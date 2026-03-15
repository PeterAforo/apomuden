import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// POST - Healthcare facility submits diagnosis data
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user has facility admin role
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !["FACILITY_ADMIN", "ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { error: "Unauthorized - Facility access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      diseaseCode, 
      diseaseName, 
      caseCount,
      periodStart,
      periodEnd,
      periodType,
      demographics,
      severity,
      outcomes,
      facilityId 
    } = body;

    if (!facilityId || !diseaseCode || !diseaseName) {
      return NextResponse.json(
        { error: "Missing required fields: facilityId, diseaseCode, diseaseName" },
        { status: 400 }
      );
    }

    // Create diagnosis report matching the schema
    const report = await db.diagnosisReport.create({
      data: {
        facilityId,
        diseaseCode,
        diseaseName,
        caseCount: caseCount || 1,
        periodStart: periodStart ? new Date(periodStart) : new Date(),
        periodEnd: periodEnd ? new Date(periodEnd) : new Date(),
        periodType: periodType || "DAILY",
        demographics: demographics || null,
        severity: severity || null,
        outcomes: outcomes || null,
        submittedById: session.user.id,
      },
    });

    // Trigger epidemic analysis (async)
    analyzeForEpidemic(diseaseName, facilityId).catch(console.error);

    return NextResponse.json({
      success: true,
      report: { id: report.id },
      message: "Diagnosis submitted successfully",
    });
  } catch (error) {
    console.error("[Diagnoses] Error submitting diagnosis:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit diagnosis" },
      { status: 500 }
    );
  }
}

// Analyze diagnosis data for potential epidemic/pandemic
async function analyzeForEpidemic(diseaseName: string, facilityId: string) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Count cases in the last 30 days for this disease
    const totalReports = await db.diagnosisReport.findMany({
      where: {
        diseaseName,
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { caseCount: true, createdAt: true },
    });

    const totalCases = totalReports.reduce((sum, r) => sum + r.caseCount, 0);
    
    // Count cases in the last 7 days
    const recentReports = totalReports.filter(r => r.createdAt >= sevenDaysAgo);
    const recentCases = recentReports.reduce((sum, r) => sum + r.caseCount, 0);

    // Calculate trend (is it increasing?)
    const previousWeekCases = totalCases - recentCases;
    const growthRate = previousWeekCases > 0 ? (recentCases / previousWeekCases) : recentCases;

    // Determine alert level
    let alertLevel: "REGIONAL" | "NATIONAL" | null = null;
    let severityLevel: "INFO" | "WARNING" | "CRITICAL" = "INFO";

    if (recentCases >= 100 && growthRate >= 2) {
      alertLevel = "NATIONAL";
      severityLevel = "CRITICAL";
    } else if (recentCases >= 50 && growthRate >= 1.5) {
      alertLevel = "REGIONAL";
      severityLevel = "WARNING";
    }

    if (alertLevel) {
      // Check if similar alert already exists
      const existingAlert = await db.alert.findFirst({
        where: {
          scope: alertLevel,
          diseaseCode: diseaseName,
          createdAt: { gte: sevenDaysAgo },
        },
      });

      if (!existingAlert) {
        console.log(`[AI Analysis] Would create ${alertLevel} alert for ${diseaseName} - ${recentCases} cases, growth rate: ${(growthRate * 100).toFixed(0)}%`);
        // Alert creation would require a createdById which needs admin user
        // This is logged for now, actual alert creation should be done by ministry
      }
    }
  } catch (error) {
    console.error("[AI Analysis] Error analyzing epidemic data:", error);
  }
}
