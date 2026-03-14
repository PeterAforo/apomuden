import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { verifyNHISMember, checkServiceCoverage, getNHISCoveredServices } from "@/lib/nhis";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nhisNumber, serviceCode, servicePriceGhs } = body;

    if (!nhisNumber) {
      return NextResponse.json(
        { error: "NHIS number is required" },
        { status: 400 }
      );
    }

    // If checking service coverage
    if (serviceCode && servicePriceGhs) {
      const coverage = await checkServiceCoverage(nhisNumber, serviceCode, servicePriceGhs);
      return NextResponse.json(coverage);
    }

    // Verify NHIS membership
    const result = await verifyNHISMember(nhisNumber);

    if (!result.success) {
      return NextResponse.json({
        verified: false,
        error: result.error,
      });
    }

    // Update user's NHIS number if verified
    if (result.verified && result.member) {
      await db.user.update({
        where: { id: session.user.id },
        data: { nhisNumber },
      });
    }

    return NextResponse.json({
      verified: result.verified,
      data: result.member,
    });
  } catch (error) {
    console.error("Error verifying NHIS:", error);
    return NextResponse.json(
      { error: "Failed to verify NHIS number" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId");

    // Get user's NHIS status
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { nhisNumber: true },
    });

    if (!user?.nhisNumber) {
      return NextResponse.json({
        hasNhis: false,
        message: "No NHIS number registered",
      });
    }

    // If checking coverage for a specific service
    if (serviceId) {
      const service = await db.service.findUnique({
        where: { id: serviceId },
        select: { nhisCovered: true, name: true, priceGhs: true },
      });

      if (!service) {
        return NextResponse.json(
          { error: "Service not found" },
          { status: 404 }
        );
      }

      const isCovered = service.nhisCovered === "YES" || service.nhisCovered === "PARTIAL";
      const coveragePercent = service.nhisCovered === "YES" ? 100 : service.nhisCovered === "PARTIAL" ? 70 : 0;

      return NextResponse.json({
        hasNhis: true,
        nhisNumber: user.nhisNumber,
        serviceCoverage: {
          serviceName: service.name,
          isCovered,
          coverageType: service.nhisCovered,
          coveragePercent,
          estimatedCost: isCovered 
            ? Number(service.priceGhs) * (1 - coveragePercent / 100)
            : Number(service.priceGhs),
        },
      });
    }

    return NextResponse.json({
      hasNhis: true,
      nhisNumber: user.nhisNumber,
      status: "ACTIVE",
    });
  } catch (error) {
    console.error("Error checking NHIS:", error);
    return NextResponse.json(
      { error: "Failed to check NHIS status" },
      { status: 500 }
    );
  }
}
