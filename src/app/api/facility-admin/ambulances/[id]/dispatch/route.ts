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

    const body = await request.json();
    const { emergencyRequestId } = body;

    if (!emergencyRequestId) {
      return NextResponse.json(
        { error: "Emergency request ID is required" },
        { status: 400 }
      );
    }

    if (!session.user.id) {
      return NextResponse.json(
        { error: "User ID not found" },
        { status: 401 }
      );
    }

    // Update ambulance status
    await db.ambulance.update({
      where: { id: params.id },
      data: { status: "ON_CALL" },
    });

    // Update emergency request
    await db.emergencyRequest.update({
      where: { id: emergencyRequestId },
      data: {
        status: "DISPATCHED",
        assignedAmbulanceId: params.id,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "AMBULANCE_DISPATCHED",
        entityType: "Ambulance",
        entityId: params.id,
        details: { emergencyRequestId },
      },
    });

    return NextResponse.json({
      message: "Ambulance dispatched successfully",
    });
  } catch (error) {
    console.error("Error dispatching ambulance:", error);
    return NextResponse.json(
      { error: "Failed to dispatch ambulance" },
      { status: 500 }
    );
  }
}
