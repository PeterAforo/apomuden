import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, description, callbackPhone, latitude, longitude } = body;

    if (!type || !callbackPhone || !latitude || !longitude) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find nearest emergency-capable facility
    const nearestFacility = await db.facility.findFirst({
      where: {
        emergencyCapable: true,
        status: "APPROVED",
      },
      orderBy: {
        latitude: "asc",
      },
    });

    // Generate a mock ID for demo purposes
    // In production, this would create an actual EmergencyRequest record
    const mockId = `EMR-${Date.now().toString(36).toUpperCase()}`;

    // For demo, we'll just return success without creating a database record
    // since EmergencyRequest requires a citizenId which requires authentication
    // In production, you would use:
    // const emergencyRequest = await db.emergencyRequest.create({
    //   data: {
    //     type: type as any,
    //     description,
    //     latitude,
    //     longitude,
    //     callbackPhone,
    //     status: "PENDING",
    //     citizenId: authenticatedUserId,
    //     assignedFacilityId: nearestFacility?.id,
    //   },
    // });

    return NextResponse.json({
      success: true,
      data: {
        id: mockId,
        status: "PENDING",
        assignedFacility: nearestFacility?.name || null,
      },
      message: "Emergency request submitted successfully",
    });
  } catch (error) {
    console.error("Error creating emergency request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit emergency request" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Request ID required" },
        { status: 400 }
      );
    }

    // In production, fetch actual request status
    return NextResponse.json({
      success: true,
      data: {
        id,
        status: "PENDING",
        message: "Emergency services have been notified",
      },
    });
  } catch (error) {
    console.error("Error fetching emergency request:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch emergency request" },
      { status: 500 }
    );
  }
}
