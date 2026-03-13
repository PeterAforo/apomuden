import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to view favorites" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        favouriteFacilities: {
          include: {
            region: {
              select: { name: true },
            },
            district: {
              select: { name: true },
            },
          },
        },
      },
    });

    return NextResponse.json({
      favorites: user?.favouriteFacilities || [],
    });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to add favorites" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { facilityId } = body;

    if (!facilityId) {
      return NextResponse.json(
        { error: "Facility ID is required" },
        { status: 400 }
      );
    }

    // Check if facility exists
    const facility = await db.facility.findUnique({
      where: { id: facilityId },
    });

    if (!facility) {
      return NextResponse.json(
        { error: "Facility not found" },
        { status: 404 }
      );
    }

    // Add to favorites
    await db.user.update({
      where: { id: session.user.id },
      data: {
        favouriteFacilities: {
          connect: { id: facilityId },
        },
      },
    });

    return NextResponse.json({
      message: "Facility added to favorites",
    });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return NextResponse.json(
      { error: "Failed to add favorite" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to remove favorites" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const facilityId = searchParams.get("facilityId");

    if (!facilityId) {
      return NextResponse.json(
        { error: "Facility ID is required" },
        { status: 400 }
      );
    }

    // Remove from favorites
    await db.user.update({
      where: { id: session.user.id },
      data: {
        favouriteFacilities: {
          disconnect: { id: facilityId },
        },
      },
    });

    return NextResponse.json({
      message: "Facility removed from favorites",
    });
  } catch (error) {
    console.error("Error removing favorite:", error);
    return NextResponse.json(
      { error: "Failed to remove favorite" },
      { status: 500 }
    );
  }
}
