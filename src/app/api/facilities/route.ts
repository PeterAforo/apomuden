import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const query = searchParams.get("query") || "";
    const type = searchParams.get("type") || "";
    const region = searchParams.get("region") || "";
    const nhisOnly = searchParams.get("nhis") === "true";
    const emergencyOnly = searchParams.get("emergency") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const where: any = {
      status: "APPROVED",
    };

    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { address: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

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

    const [facilities, total] = await Promise.all([
      db.facility.findMany({
        where,
        include: {
          region: true,
          district: true,
        },
        orderBy: [
          { tier: "asc" },
          { averageRating: "desc" },
        ],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.facility.count({ where }),
    ]);

    // Add imageUrl from photos array
    const facilitiesWithImages = facilities.map((facility: { photos?: string[] }) => ({
      ...facility,
      imageUrl: facility.photos && facility.photos.length > 0 ? facility.photos[0] : null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        items: facilitiesWithImages,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching facilities:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch facilities" },
      { status: 500 }
    );
  }
}
