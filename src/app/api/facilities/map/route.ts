import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const type = searchParams.get("type") || "";
    const region = searchParams.get("region") || "";
    const nhisOnly = searchParams.get("nhis") === "true";
    const emergencyOnly = searchParams.get("emergency") === "true";

    const where: Record<string, unknown> = {
      status: "APPROVED",
    };

    if (type) {
      where.type = type;
    }

    if (region) {
      where.region = { code: region };
    }

    if (nhisOnly) {
      where.nhisAccepted = true;
    }

    if (emergencyOnly) {
      where.emergencyCapable = true;
    }

    // Fetch all facilities for map (no pagination, only essential fields)
    const facilities = await db.facility.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        tier: true,
        latitude: true,
        longitude: true,
        address: true,
        phone: true,
        nhisAccepted: true,
        emergencyCapable: true,
        ambulanceAvailable: true,
        averageRating: true,
        totalReviews: true,
        region: {
          select: {
            name: true,
            code: true,
          },
        },
        district: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Group by region for stats
    const regionStats = facilities.reduce((acc, f) => {
      const regionName = f.region?.name || "Unknown";
      if (!acc[regionName]) {
        acc[regionName] = { count: 0, code: f.region?.code || "" };
      }
      acc[regionName].count++;
      return acc;
    }, {} as Record<string, { count: number; code: string }>);

    // Group by type for stats
    const typeStats = facilities.reduce((acc, f) => {
      if (!acc[f.type]) {
        acc[f.type] = 0;
      }
      acc[f.type]++;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      data: {
        facilities,
        total: facilities.length,
        stats: {
          byRegion: regionStats,
          byType: typeStats,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching facilities for map:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch facilities" },
      { status: 500 }
    );
  }
}
