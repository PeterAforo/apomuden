import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
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

    // Get user's facility
    const facilityStaff = await db.facilityStaff.findFirst({
      where: { userId: session.user.id, isActive: true },
      select: { facilityId: true },
    });

    if (!facilityStaff) {
      return NextResponse.json(
        { error: "No facility associated with your account" },
        { status: 400 }
      );
    }

    const ambulances = await db.ambulance.findMany({
      where: { facilityId: facilityStaff.facilityId },
      orderBy: { registrationNumber: "asc" },
    });

    return NextResponse.json({ ambulances });
  } catch (error) {
    console.error("Error fetching ambulances:", error);
    return NextResponse.json(
      { error: "Failed to fetch ambulances" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const facilityStaff = await db.facilityStaff.findFirst({
      where: { userId: session.user.id, isActive: true },
      select: { facilityId: true },
    });

    if (!facilityStaff) {
      return NextResponse.json(
        { error: "No facility associated with your account" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { registrationNumber, type, driverName, driverPhone } = body;

    if (!registrationNumber || !type) {
      return NextResponse.json(
        { error: "Registration number and type are required" },
        { status: 400 }
      );
    }

    const ambulance = await db.ambulance.create({
      data: {
        facilityId: facilityStaff.facilityId,
        registrationNumber,
        type,
        status: "AVAILABLE",
        driverName: driverName || null,
        driverPhone: driverPhone || null,
      },
    });

    return NextResponse.json({
      message: "Ambulance added successfully",
      ambulance,
    }, { status: 201 });
  } catch (error) {
    console.error("Error adding ambulance:", error);
    return NextResponse.json(
      { error: "Failed to add ambulance" },
      { status: 500 }
    );
  }
}
