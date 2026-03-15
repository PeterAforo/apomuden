import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// GET - Fetch health alerts for a location
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get("lat") || "5.6037");
    const lng = parseFloat(searchParams.get("lng") || "-0.1870");
    const region = searchParams.get("region") || "Greater Accra";

    // Fetch active alerts from database
    const alerts = await db.alert.findMany({
      where: {
        status: "SENT",
        OR: [
          { scope: "NATIONAL" },
          { scope: "REGIONAL" },
        ],
        expiresAt: {
          gte: new Date(),
        },
      },
      orderBy: [
        { severity: "desc" },
        { createdAt: "desc" },
      ],
      take: 10,
    });

    // Transform to frontend format
    const formattedAlerts = alerts.map((alert) => ({
      id: alert.id,
      type: alert.scope.toLowerCase(),
      severity: alert.severity.toLowerCase(),
      title: alert.title,
      message: alert.body,
      recommendations: alert.precautions ? [alert.precautions] : [],
      source: "Ghana Health Service",
      timestamp: alert.createdAt,
      expiresAt: alert.expiresAt,
    }));

    return NextResponse.json({
      success: true,
      alerts: formattedAlerts,
      location: { lat, lng, region },
    });
  } catch (error) {
    console.error("[HealthAlerts] Error fetching alerts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

// POST - Create a new health alert (Ministry/Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user has admin/ministry role
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!user || !["ADMIN", "MINISTRY"].includes(user.role)) {
      return NextResponse.json(
        { error: "Unauthorized - Ministry or Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, message, severity, scope, precautions, expiresAt } = body;

    const alert = await db.alert.create({
      data: {
        title,
        body: message,
        severity: severity?.toUpperCase() || "WARNING",
        scope: scope?.toUpperCase() || "REGIONAL",
        precautions,
        status: "SENT",
        expiresAt: expiresAt ? new Date(expiresAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdById: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      alert,
      message: "Health alert created successfully",
    });
  } catch (error) {
    console.error("[HealthAlerts] Error creating alert:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create alert" },
      { status: 500 }
    );
  }
}
