import { NextResponse } from "next/server";
import webpush from "@/lib/webpush";

type PushSubscriptionJSON = {
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
};

const subscriptions: PushSubscriptionJSON[] = (globalThis as any).__pushSubs ?? [];
(globalThis as any).__pushSubs = subscriptions;

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const title = body?.title || "New Notification";
    const message = body?.message || "Hello from Apomuden.";
    const url = body?.url || "/";

    if (!subscriptions.length) {
      return NextResponse.json(
        { success: false, message: "No subscriptions available." },
        { status: 400 }
      );
    }

    const payload = JSON.stringify({
      title,
      message,
      url,
    });

    const results = await Promise.allSettled(
      subscriptions.map((sub) => webpush.sendNotification(sub as any, payload))
    );

    const delivered = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.length - delivered;

    return NextResponse.json({
      success: true,
      delivered,
      failed,
    });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to send notifications." },
      { status: 500 }
    );
  }
}
