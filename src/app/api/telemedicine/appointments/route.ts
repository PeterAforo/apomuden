import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Mock appointments - In production, this would come from the database
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Return mock appointments for demo
    const appointments = [
      {
        id: "apt-1",
        doctorName: "Dr. Kwame Asante",
        specialty: "General Practice",
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        time: "10:00",
        status: "SCHEDULED",
        meetingLink: "https://meet.google.com/abc-defg-hij",
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
