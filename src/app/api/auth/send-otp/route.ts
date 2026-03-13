import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
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

    // TODO: Send OTP via SMS (Hubtel, Arkesel, or other Ghana SMS provider)
    // For demo purposes, we'll log it
    console.log(`OTP for ${phone}: ${otp}`);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
      // Remove this in production - only for demo
      demo_otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send OTP" },
      { status: 500 }
    );
  }
}
