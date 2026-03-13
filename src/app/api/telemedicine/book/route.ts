import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { doctorId, slot } = body;

    if (!doctorId || !slot) {
      return NextResponse.json(
        { error: "Doctor ID and time slot are required" },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Create a booking record in the database
    // 2. Generate a video meeting link (Zoom, Google Meet, etc.)
    // 3. Send confirmation emails/SMS
    // 4. Update doctor's availability

    // Mock booking response
    const booking = {
      id: `booking-${Date.now()}`,
      doctorId,
      patientId: session.user.id,
      date: new Date().toISOString().split("T")[0],
      time: slot,
      status: "SCHEDULED",
      meetingLink: `https://meet.google.com/${Math.random().toString(36).substring(7)}`,
      createdAt: new Date().toISOString(),
    };

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "TELEMEDICINE_BOOKING",
        entityType: "Appointment",
        entityId: booking.id,
        details: { doctorId, slot, meetingLink: booking.meetingLink },
      },
    });

    return NextResponse.json({
      message: "Appointment booked successfully",
      booking,
    }, { status: 201 });
  } catch (error) {
    console.error("Error booking appointment:", error);
    return NextResponse.json(
      { error: "Failed to book appointment" },
      { status: 500 }
    );
  }
}
