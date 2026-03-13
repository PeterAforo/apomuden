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
    const facilityId = searchParams.get("facilityId");
    const regionId = searchParams.get("regionId");
    const diseaseCode = searchParams.get("diseaseCode");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: Record<string, unknown> = {};

    if (facilityId) where.facilityId = facilityId;
    if (diseaseCode) where.diseaseCode = diseaseCode;
    if (startDate && endDate) {
      where.periodStart = { gte: new Date(startDate) };
      where.periodEnd = { lte: new Date(endDate) };
    }

    const reports = await db.diagnosisReport.findMany({
      where,
      include: {
        facility: {
          select: {
            id: true,
            name: true,
            region: { select: { id: true, name: true } },
            district: { select: { id: true, name: true } },
          },
        },
        submittedBy: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Error fetching diagnosis reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      facilityId,
      diseaseCode,
      diseaseName,
      caseCount,
      periodType,
      periodStart,
      periodEnd,
      demographics,
      genderBreakdown,
      severity,
      outcomes,
    } = body;

    // Get user's facility if not provided
    let targetFacilityId = facilityId;
    if (!targetFacilityId) {
      const facilityStaff = await db.facilityStaff.findFirst({
        where: { userId: session.user.id, isActive: true },
        select: { facilityId: true },
      });
      targetFacilityId = facilityStaff?.facilityId;
    }

    if (!targetFacilityId) {
      return NextResponse.json(
        { error: "No facility associated with your account" },
        { status: 400 }
      );
    }

    if (!diseaseCode || !diseaseName || !periodStart || !periodEnd) {
      return NextResponse.json(
        { error: "Disease code, name, and reporting period are required" },
        { status: 400 }
      );
    }

    // Check for anomalous case count (simple threshold-based detection)
    const recentReports = await db.diagnosisReport.findMany({
      where: {
        facilityId: targetFacilityId,
        diseaseCode,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      select: { caseCount: true },
    });

    const avgCases = recentReports.length > 0
      ? recentReports.reduce((sum: number, r: { caseCount: number }) => sum + r.caseCount, 0) / recentReports.length
      : 0;
    
    const isAnomalous = avgCases > 0 && caseCount > avgCases * 2;

    if (!session.user.id) {
      return NextResponse.json(
        { error: "User ID not found" },
        { status: 401 }
      );
    }

    const report = await db.diagnosisReport.create({
      data: {
        facilityId: targetFacilityId,
        diseaseCode,
        diseaseName,
        caseCount: caseCount || 0,
        periodType: periodType || "WEEKLY",
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        demographics: { age_groups: demographics, gender: genderBreakdown },
        severity,
        outcomes,
        isAnomalous,
        submittedById: session.user.id,
      },
      include: {
        facility: {
          select: { name: true },
        },
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "DIAGNOSIS_REPORT_SUBMITTED",
        entityType: "DiagnosisReport",
        entityId: report.id,
        details: {
          diseaseCode,
          diseaseName,
          caseCount,
          isAnomalous,
        },
      },
    });

    return NextResponse.json({
      message: "Report submitted successfully",
      report,
      isAnomalous,
    }, { status: 201 });
  } catch (error) {
    console.error("Error submitting diagnosis report:", error);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}
