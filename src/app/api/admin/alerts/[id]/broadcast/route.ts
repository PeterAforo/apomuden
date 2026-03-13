import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const alert = await db.alert.findUnique({
      where: { id: params.id },
    });

    if (!alert) {
      return NextResponse.json(
        { error: "Alert not found" },
        { status: 404 }
      );
    }

    if (alert.status === "SENT") {
      return NextResponse.json(
        { error: "Alert has already been sent" },
        { status: 400 }
      );
    }

    // Update alert status
    const updatedAlert = await db.alert.update({
      where: { id: params.id },
      data: {
        status: "SENT",
        sentAt: new Date(),
        approvedById: session.user.id,
      },
    });

    // Create notifications for all citizens
    const citizens = await db.user.findMany({
      where: { role: "CITIZEN" },
      select: { id: true },
    });

    // Batch create notifications
    if (citizens.length > 0) {
      await db.notification.createMany({
        data: citizens.map((citizen: { id: string }) => ({
          userId: citizen.id,
          alertId: params.id,
          title: alert.title,
          body: alert.body,
          channel: "IN_APP",
          status: "PENDING",
        })),
      });
    }

    // Create audit log
    if (session.user.id) {
      await db.auditLog.create({
        data: {
          userId: session.user.id,
          action: "ALERT_BROADCAST",
          entityType: "Alert",
          entityId: params.id,
          details: {
            title: alert.title,
            recipientCount: citizens.length,
          },
        },
      });
    }

    return NextResponse.json({
      message: "Alert broadcast successfully",
      alert: updatedAlert,
      recipientCount: citizens.length,
    });
  } catch (error) {
    console.error("Error broadcasting alert:", error);
    return NextResponse.json(
      { error: "Failed to broadcast alert" },
      { status: 500 }
    );
  }
}
