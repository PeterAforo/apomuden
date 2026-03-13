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

    // Mock active emergency request with ambulance
    // In production, this would query the database for the user's active request
    const mockRequest = {
      id: "emg-" + Date.now(),
      type: "MEDICAL",
      status: "DISPATCHED",
      createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      ambulance: {
        id: "amb-001",
        registrationNumber: "GR-1234-20",
        driverName: "Kwame Mensah",
        driverPhone: "0201234567",
        latitude: 5.6034 + (Math.random() - 0.5) * 0.01,
        longitude: -0.1870 + (Math.random() - 0.5) * 0.01,
        eta: Math.floor(Math.random() * 10) + 5,
        status: "EN_ROUTE",
        lastUpdated: new Date().toISOString(),
      },
    };

    return NextResponse.json({ request: mockRequest });
  } catch (error) {
    console.error("Error fetching active emergency:", error);
    return NextResponse.json(
      { error: "Failed to fetch emergency request" },
      { status: 500 }
    );
  }
}
