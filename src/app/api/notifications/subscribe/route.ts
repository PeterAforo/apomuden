import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { subscription } = body;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: "Invalid subscription data" },
        { status: 400 }
      );
    }

    // Extract keys from subscription
    const { endpoint, keys } = subscription;
    const p256dh = keys?.p256dh || "";
    const auth_key = keys?.auth || "";

    // Check if subscription already exists
    const existingSubscription = await db.pushSubscription.findUnique({
      where: { endpoint },
    });

    if (existingSubscription) {
      // Update existing subscription
      await db.pushSubscription.update({
        where: { endpoint },
        data: {
          userId: session.user.id,
          p256dh,
          auth: auth_key,
          userAgent: request.headers.get("user-agent") || undefined,
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new subscription
      await db.pushSubscription.create({
        data: {
          userId: session.user.id,
          endpoint,
          p256dh,
          auth: auth_key,
          userAgent: request.headers.get("user-agent") || undefined,
        },
      });
    }

    console.log("[Push] Subscription saved for user:", session.user.id);

    return NextResponse.json({
      success: true,
      message: "Push subscription saved successfully",
    });
  } catch (error) {
    console.error("[Push] Error saving subscription:", error);
    return NextResponse.json(
      { error: "Failed to save subscription" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const subscriptions = await db.pushSubscription.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        endpoint: true,
        createdAt: true,
        userAgent: true,
      },
    });

    return NextResponse.json({
      success: true,
      subscriptions,
      count: subscriptions.length,
    });
  } catch (error) {
    console.error("[Push] Error fetching subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}
