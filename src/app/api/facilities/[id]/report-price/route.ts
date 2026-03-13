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
        { error: "You must be logged in to report a price discrepancy" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { serviceId, reportedPrice, description } = body;

    if (!serviceId || !reportedPrice) {
      return NextResponse.json(
        { error: "Service ID and reported price are required" },
        { status: 400 }
      );
    }

    // Verify service exists and belongs to facility
    const service = await db.service.findFirst({
      where: {
        id: serviceId,
        facilityId: params.id,
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: "Service not found" },
        { status: 404 }
      );
    }

    // Create audit log for price discrepancy report
    await db.auditLog.create({
      data: {
        userId: session.user.id,
        action: "PRICE_DISCREPANCY_REPORTED",
        entityType: "Service",
        entityId: serviceId,
        details: {
          facilityId: params.id,
          serviceName: service.name,
          listedPrice: service.priceGhs.toString(),
          reportedPrice: reportedPrice.toString(),
          description: description || null,
          reportedAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      message: "Price discrepancy reported successfully. Thank you for helping keep our data accurate.",
    }, { status: 201 });
  } catch (error) {
    console.error("Error reporting price discrepancy:", error);
    return NextResponse.json(
      { error: "Failed to report price discrepancy" },
      { status: 500 }
    );
  }
}
