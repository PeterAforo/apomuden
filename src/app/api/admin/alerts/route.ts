import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/rbac";

export async function GET() {
  try {
    // Require MANAGE_ALERTS permission
    const { authorized, response } = await requirePermission("MANAGE_ALERTS");
    if (!authorized) return response!;

    const alerts = await db.alert.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        createdBy: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require MANAGE_ALERTS permission
    const { authorized, user, response } = await requirePermission("MANAGE_ALERTS");
    if (!authorized || !user) return response!;

    const body = await request.json();
    const { title, body: alertBody, severity, scope, precautions, smsMessage } = body;

    if (!title || !alertBody || !severity || !scope) {
      return NextResponse.json(
        { error: "Title, body, severity, and scope are required" },
        { status: 400 }
      );
    }

    const alert = await db.alert.create({
      data: {
        title,
        body: alertBody,
        severity,
        scope,
        precautions: precautions || null,
        smsMessage: smsMessage || null,
        status: "DRAFT",
        channels: ["push", "sms", "portal"],
        createdById: user.id,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: user.id,
        action: "ALERT_CREATED",
        entityType: "Alert",
        entityId: alert.id,
        details: { title, severity, scope },
      },
    });

    return NextResponse.json({
      message: "Alert created successfully",
      alert,
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating alert:", error);
    return NextResponse.json(
      { error: "Failed to create alert" },
      { status: 500 }
    );
  }
}
