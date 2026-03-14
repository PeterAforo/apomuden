import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendOTP } from "@/lib/sms";
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Apply rate limiting (3 requests per 5 minutes for OTP)
  const rateLimit = checkRateLimit(request, RATE_LIMITS.OTP);
  if (rateLimit.limited) {
    return rateLimitResponse(rateLimit.resetIn);
  }

  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { success: false, message: "Phone number is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await db.user.findUnique({
      where: { phone },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "No account found with this phone number" },
        { status: 404 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in database with expiry (5 minutes)
    await db.verificationToken.create({
      data: {
        identifier: phone,
        token: otp,
        expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
      },
    });

    // Send OTP via SMS using mNotify
    const smsResult = await sendOTP(phone, otp);
    if (!smsResult.success) {
      console.error("Failed to send OTP SMS:", smsResult.error);
    }

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      // Only expose OTP in development for testing
      ...(process.env.NODE_ENV === "development" && { demo_otp: otp }),
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
