import { NextRequest, NextResponse } from "next/server";

// In-memory store for demo (in production, use database)
const subscriptions: Array<{
  email?: string;
  phone?: string;
  method: string;
  createdAt: Date;
}> = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, phone, method } = body;

    // Validation
    if (method === "email" || method === "both") {
      if (!email || !email.includes("@")) {
        return NextResponse.json(
          { error: "Valid email address is required" },
          { status: 400 }
        );
      }
    }

    if (method === "phone" || method === "both") {
      if (!phone || phone.length < 10) {
        return NextResponse.json(
          { error: "Valid phone number is required" },
          { status: 400 }
        );
      }
    }

    // Check if already subscribed (in-memory for demo)
    const existingIndex = subscriptions.findIndex(
      (s) => (email && s.email === email) || (phone && s.phone === phone)
    );

    if (existingIndex >= 0) {
      // Update existing
      subscriptions[existingIndex] = {
        email: email || subscriptions[existingIndex].email,
        phone: phone || subscriptions[existingIndex].phone,
        method,
        createdAt: subscriptions[existingIndex].createdAt,
      };
      console.log("[Newsletter] Updated subscription:", { email, phone, method });
    } else {
      // Add new subscription
      subscriptions.push({
        email,
        phone,
        method,
        createdAt: new Date(),
      });
      console.log("[Newsletter] New subscription:", { email, phone, method });
    }

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to newsletter",
    });
  } catch (error) {
    console.error("[Newsletter] Subscription error:", error);
    return NextResponse.json(
      { error: "Failed to subscribe. Please try again." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");

    if (!email && !phone) {
      return NextResponse.json(
        { error: "Email or phone required to unsubscribe" },
        { status: 400 }
      );
    }

    // Remove from in-memory store
    const index = subscriptions.findIndex(
      (s) => (email && s.email === email) || (phone && s.phone === phone)
    );

    if (index >= 0) {
      subscriptions.splice(index, 1);
    }

    return NextResponse.json({
      success: true,
      message: "Successfully unsubscribed",
    });
  } catch (error) {
    console.error("[Newsletter] Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}
