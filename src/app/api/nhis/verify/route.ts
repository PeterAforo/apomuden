import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Mock NHIS verification - In production, this would call the actual NHIA API
const MOCK_NHIS_DATA: Record<string, {
  status: "ACTIVE" | "EXPIRED" | "SUSPENDED";
  memberName: string;
  memberType: "INFORMAL" | "SSNIT" | "EXEMPT";
  expiryDate: string;
  dependents: number;
  coverageLevel: "BASIC" | "PREMIUM";
}> = {
  "GHA-123456789-0": {
    status: "ACTIVE",
    memberName: "Kwame Asante",
    memberType: "SSNIT",
    expiryDate: "2025-12-31",
    dependents: 3,
    coverageLevel: "PREMIUM",
  },
  "GHA-987654321-0": {
    status: "EXPIRED",
    memberName: "Ama Serwaa",
    memberType: "INFORMAL",
    expiryDate: "2024-06-30",
    dependents: 0,
    coverageLevel: "BASIC",
  },
};

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
    const { nhisNumber } = body;

    if (!nhisNumber) {
      return NextResponse.json(
        { error: "NHIS number is required" },
        { status: 400 }
      );
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check mock data first
    const mockData = MOCK_NHIS_DATA[nhisNumber];
    
    if (mockData) {
      // Update user's NHIS number if verified
      if (mockData.status === "ACTIVE") {
        await db.user.update({
          where: { id: session.user.id },
          data: { nhisNumber },
        });
      }

      return NextResponse.json({
        verified: mockData.status === "ACTIVE",
        data: {
          nhisNumber,
          ...mockData,
        },
      });
    }

    // For any other number, generate random verification
    const isValid = nhisNumber.startsWith("GHA-") && nhisNumber.length >= 10;
    
    if (!isValid) {
      return NextResponse.json({
        verified: false,
        error: "Invalid NHIS number format. Expected: GHA-XXXXXXXXX-X",
      });
    }

    // Simulate successful verification for valid format
    const simulatedData = {
      nhisNumber,
      status: "ACTIVE" as const,
      memberName: session.user.name || "Member",
      memberType: "INFORMAL" as const,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      dependents: 0,
      coverageLevel: "BASIC" as const,
    };

    // Update user's NHIS number
    await db.user.update({
      where: { id: session.user.id },
      data: { nhisNumber },
    });

    return NextResponse.json({
      verified: true,
      data: simulatedData,
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
