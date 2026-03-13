import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        ghanaCardId: true,
        nhisNumber: true,
        dateOfBirth: true,
        gender: true,
        bloodType: true,
        notificationPreferences: true,
        emergencyContacts: {
          select: {
            id: true,
            name: true,
            phone: true,
            relationship: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...user,
      dateOfBirth: user.dateOfBirth?.toISOString().split("T")[0] || null,
      notificationPreferences: user.notificationPreferences || {
        sms: true,
        email: true,
        push: true,
        healthAlerts: true,
        facilityUpdates: false,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      ghanaCardId,
      nhisNumber,
      dateOfBirth,
      gender,
      bloodType,
      notificationPreferences,
    } = body;

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        ghanaCardId: ghanaCardId || null,
        nhisNumber: nhisNumber || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
        bloodType: bloodType || null,
        notificationPreferences: notificationPreferences || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        ghanaCardId: true,
        nhisNumber: true,
        dateOfBirth: true,
        gender: true,
        bloodType: true,
        notificationPreferences: true,
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        ...updatedUser,
        dateOfBirth: updatedUser.dateOfBirth?.toISOString().split("T")[0] || null,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
