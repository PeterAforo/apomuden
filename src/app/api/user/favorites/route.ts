import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Note: Favorites are stored in user's notificationPreferences JSON field as a workaround
// until a proper UserFavorite model is added to the schema

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
        notificationPreferences: true,
      },
    });

    const prefs = user?.notificationPreferences as { favoriteIds?: string[] } | null;
    const favoriteIds = prefs?.favoriteIds || [];

    if (favoriteIds.length === 0) {
      return NextResponse.json({ favorites: [] });
    }

    const favorites = await db.facility.findMany({
      where: { id: { in: favoriteIds } },
      include: {
        region: { select: { name: true } },
        district: { select: { name: true } },
      },
    });

    return NextResponse.json({ favorites });
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

    if (!session?.user?.id) {
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

    // Get current favorites
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { notificationPreferences: true },
    });

    const prefs = (user?.notificationPreferences as { favoriteIds?: string[] } | null) || {};
    const favoriteIds = prefs.favoriteIds || [];

    if (!favoriteIds.includes(facilityId)) {
      favoriteIds.push(facilityId);
    }

    // Update favorites
    await db.user.update({
      where: { id: session.user.id },
      data: {
        notificationPreferences: { ...prefs, favoriteIds },
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

    if (!session?.user?.id) {
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

    // Get current favorites
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { notificationPreferences: true },
    });

    const prefs = (user?.notificationPreferences as { favoriteIds?: string[] } | null) || {};
    const favoriteIds = (prefs.favoriteIds || []).filter((id: string) => id !== facilityId);

    // Update favorites
    await db.user.update({
      where: { id: session.user.id },
      data: {
        notificationPreferences: { ...prefs, favoriteIds },
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
