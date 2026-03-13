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

    const facility = await db.facility.findUnique({
      where: { id: facilityStaff.facilityId },
      select: {
        bedCount: true,
        icuBedsAvailable: true,
      },
    });

    // Return resource data (in production, this would come from a separate resources table)
    return NextResponse.json({
      resources: {
        bedCount: facility?.bedCount || 0,
        bedsAvailable: Math.floor((facility?.bedCount || 0) * 0.3),
        icuBeds: facility?.icuBedsAvailable || 0,
        icuBedsAvailable: Math.floor((facility?.icuBedsAvailable || 0) * 0.5),
        ventilators: 10,
        ventilatorsAvailable: 6,
        bloodBank: {
          "A+": 15, "A-": 5, "B+": 12, "B-": 3,
          "AB+": 8, "AB-": 2, "O+": 20, "O-": 7,
        },
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { error: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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
    const { bedCount, icuBeds, icuBedsAvailable } = body;

    // Update facility with new resource counts
    await db.facility.update({
      where: { id: facilityStaff.facilityId },
      data: {
        bedCount: bedCount || undefined,
        icuBedsAvailable: icuBedsAvailable || undefined,
      },
    });

    // Create audit log
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "RESOURCES_UPDATED",
        entityType: "Facility",
        entityId: facilityStaff.facilityId,
        details: body,
      },
    });

    return NextResponse.json({
      message: "Resources updated successfully",
    });
  } catch (error) {
    console.error("Error updating resources:", error);
    return NextResponse.json(
      { error: "Failed to update resources" },
      { status: 500 }
    );
  }
}
