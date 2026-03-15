import { NextResponse, NextRequest } from "next/server";

type PushSubscriptionJSON = {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

// Demo in-memory store
const subscriptions: PushSubscriptionJSON[] = (globalThis as any).__pushSubs ?? [];
(globalThis as any).__pushSubs = subscriptions;

export async function POST(request: NextRequest) {
  try {
    const subscription = (await request.json()) as PushSubscriptionJSON;

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json(
        { success: false, message: "Invalid subscription payload." },
        { status: 400 }
      );
    }

    const exists = subscriptions.some((sub) => sub.endpoint === subscription.endpoint);

    if (!exists) {
      subscriptions.push(subscription);
    }

    return NextResponse.json({
      success: true,
      message: "Subscription saved.",
      count: subscriptions.length,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to save subscription." },
      { status: 500 }
    );
  }
}

// GET - Check subscription status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint");

    if (!endpoint) {
      return NextResponse.json(
        { success: false, message: "Endpoint required" },
        { status: 400 }
      );
    }

    const exists = subscriptions.some((sub) => sub.endpoint === endpoint);

    return NextResponse.json({
      subscribed: exists,
      count: subscriptions.length,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to check subscription status" },
      { status: 500 }
    );
  }
}
