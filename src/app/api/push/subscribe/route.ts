import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const subscription = await request.json();

    // Store subscription in user's notification preferences
    await db.user.update({
      where: { id: session.user.id },
      data: {
        notificationPreferences: {
          pushSubscription: subscription,
          pushEnabled: true,
        },
      },
    });

    return NextResponse.json({ message: "Subscribed successfully" });
  } catch (error) {
    console.error("Error subscribing to push:", error);
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}
