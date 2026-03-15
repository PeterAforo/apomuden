import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";

    if (query.length < 2) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const facilities = await db.facility.findMany({
      where: {
        status: "APPROVED",
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { address: { contains: query, mode: "insensitive" } },
        ],
      },
      include: {
        region: {
          select: { name: true },
        },
        district: {
          select: { name: true },
        },
        services: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            category: true,
            priceGhs: true,
            nhisCovered: true,
          },
        },
      },
      take: 10,
      orderBy: { name: "asc" },
    });

    // Transform the data to include all needed fields
    const transformedFacilities = facilities.map((facility) => ({
      id: facility.id,
      name: facility.name,
      slug: facility.slug,
      type: facility.type,
      tier: facility.tier,
      region: facility.region,
      district: facility.district,
      averageRating: facility.averageRating,
      totalReviews: facility.totalReviews,
      nhisAccepted: facility.nhisAccepted,
      emergencyCapable: facility.emergencyCapable,
      ambulanceAvailable: facility.ambulanceAvailable,
      bedCount: facility.bedCount,
      availableBeds: facility.availableBeds,
      icuBedsAvailable: facility.icuBedsAvailable,
      availableIcuBeds: facility.availableIcuBeds,
      services: facility.services.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        priceGhs: Number(s.priceGhs),
        nhisCovered: s.nhisCovered,
      })),
      equipment: facility.equipment || [],
      amenities: facility.amenities || [],
      specializations: facility.specializations || [],
      photos: facility.photos || [],
    }));

    return NextResponse.json({
      success: true,
      data: transformedFacilities,
    });
  } catch (error) {
    console.error("Error searching facilities for comparison:", error);
    return NextResponse.json(
      { success: false, error: "Failed to search facilities" },
      { status: 500 }
    );
  }
}
