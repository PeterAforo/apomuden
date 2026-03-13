import { NextResponse } from "next/server";
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

    // Get pending emergency requests assigned to this facility or nearby
    const requests = await db.emergencyRequest.findMany({
      where: {
        OR: [
          { assignedFacilityId: facilityStaff.facilityId },
          { 
            status: "PENDING",
            assignedFacilityId: null,
          },
        ],
      },
      include: {
        citizen: {
          select: { id: true, name: true, phone: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Error fetching emergency requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch emergency requests" },
      { status: 500 }
    );
  }
}
