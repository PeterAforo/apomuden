import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac";

export async function GET(request: NextRequest) {
  try {
    // Require EXPORT_DATA permission
    const { authorized, response } = await requirePermission("EXPORT_DATA");
    if (!authorized) return response!;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // facilities, reports, alerts
    const format = searchParams.get("format") || "csv"; // csv or json
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let data: unknown[] = [];
    let filename = "";

    const dateFilter = startDate && endDate ? {
      createdAt: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    } : {};

    switch (type) {
      case "facilities":
        data = await db.facility.findMany({
          where: { status: "APPROVED" },
          select: {
            name: true,
            type: true,
            phone: true,
            email: true,
            address: true,
            region: { select: { name: true } },
            district: { select: { name: true } },
            nhisAccepted: true,
            emergencyCapable: true,
            bedCount: true,
            averageRating: true,
            totalReviews: true,
            createdAt: true,
          },
        });
        filename = `facilities-export-${new Date().toISOString().split("T")[0]}`;
        break;

      case "reports":
        data = await db.diagnosisReport.findMany({
          where: dateFilter,
          select: {
            diseaseCode: true,
            diseaseName: true,
            caseCount: true,
            periodType: true,
            periodStart: true,
            periodEnd: true,
            severity: true,
            isAnomalous: true,
            facility: { select: { name: true, region: { select: { name: true } } } },
            createdAt: true,
          },
          orderBy: { createdAt: "desc" },
        });
        filename = `diagnosis-reports-${new Date().toISOString().split("T")[0]}`;
        break;

      case "alerts":
        data = await db.alert.findMany({
          where: dateFilter,
          select: {
            title: true,
            body: true,
            severity: true,
            scope: true,
            status: true,
            createdAt: true,
            sentAt: true,
          },
          orderBy: { createdAt: "desc" },
        });
        filename = `alerts-export-${new Date().toISOString().split("T")[0]}`;
        break;

      case "audit":
        data = await db.auditLog.findMany({
          where: dateFilter,
          select: {
            action: true,
            entityType: true,
            entityId: true,
            details: true,
            createdAt: true,
            user: { select: { name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 1000,
        });
        filename = `audit-logs-${new Date().toISOString().split("T")[0]}`;
        break;

      default:
        return NextResponse.json(
          { error: "Invalid export type. Use: facilities, reports, alerts, audit" },
          { status: 400 }
        );
    }

    if (format === "json") {
      return new NextResponse(JSON.stringify(data, null, 2), {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": `attachment; filename="${filename}.json"`,
        },
      });
    }

    // Convert to CSV
    const csv = convertToCSV(data);
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}

function convertToCSV(data: unknown[]): string {
  if (data.length === 0) return "";

  // Flatten nested objects
  const flattenedData = data.map((item) => flattenObject(item as Record<string, unknown>));

  // Get all unique keys
  const headers = Array.from(new Set(flattenedData.flatMap((item) => Object.keys(item))));

  // Create CSV rows
  const rows = flattenedData.map((item) =>
    headers.map((header) => {
      const value = item[header];
      if (value === null || value === undefined) return "";
      if (typeof value === "string" && (value.includes(",") || value.includes('"') || value.includes("\n"))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value);
    }).join(",")
  );

  return [headers.join(","), ...rows].join("\n");
}

function flattenObject(obj: Record<string, unknown>, prefix = ""): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}_${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
    } else if (value instanceof Date) {
      result[newKey] = value.toISOString();
    } else if (Array.isArray(value)) {
      result[newKey] = JSON.stringify(value);
    } else {
      result[newKey] = value;
    }
  }

  return result;
}
