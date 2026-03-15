import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Return demo appointments for now
    const appointments = [
      {
        id: "apt-demo-1",
        doctorName: "Dr. Kwame Asante",
        specialty: "General Practice",
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        time: "10:00",
        status: "SCHEDULED",
        roomName: null,
        roomUrl: null,
      },
    ];

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 }
    );
  }
}
