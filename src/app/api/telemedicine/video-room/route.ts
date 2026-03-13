import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createVideoRoom, createMeetingToken, deleteVideoRoom } from "@/lib/video-call";

// POST - Create a video room for an appointment
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { appointmentId, doctorName, patientName } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { error: "Appointment ID is required" },
        { status: 400 }
      );
    }

    // Create the video room
    const roomResult = await createVideoRoom({
      appointmentId,
      expiryMinutes: 60,
      maxParticipants: 2,
    });

    if (!roomResult.success) {
      return NextResponse.json(
        { error: roomResult.error || "Failed to create video room" },
        { status: 500 }
      );
    }

    // Create tokens for both participants
    const [doctorToken, patientToken] = await Promise.all([
      createMeetingToken({
        roomName: roomResult.roomName!,
        userName: doctorName || "Doctor",
        isOwner: true,
        expiryMinutes: 60,
      }),
      createMeetingToken({
        roomName: roomResult.roomName!,
        userName: patientName || "Patient",
        isOwner: false,
        expiryMinutes: 60,
      }),
    ]);

    return NextResponse.json({
      success: true,
      roomUrl: roomResult.roomUrl,
      roomName: roomResult.roomName,
      doctorToken: doctorToken.token,
      patientToken: patientToken.token,
    });
  } catch (error) {
    console.error("Error creating video room:", error);
    return NextResponse.json(
      { error: "Failed to create video room" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a video room
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomName = searchParams.get("roomName");

    if (!roomName) {
      return NextResponse.json(
        { error: "Room name is required" },
        { status: 400 }
      );
    }

    const deleted = await deleteVideoRoom(roomName);

    return NextResponse.json({
      success: deleted,
    });
  } catch (error) {
    console.error("Error deleting video room:", error);
    return NextResponse.json(
      { error: "Failed to delete video room" },
      { status: 500 }
    );
  }
}
