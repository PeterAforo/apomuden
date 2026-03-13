import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { phone, otp } = await request.json();

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, message: "Phone and OTP are required" },
        { status: 400 }
      );
    }

    // Find the verification token
    const verificationToken = await db.verificationToken.findFirst({
      where: {
        identifier: phone,
        token: otp,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired OTP" },
        { status: 400 }
      );
    }

    // Update user as verified
    await db.user.update({
      where: { phone },
      data: {
        emailVerified: new Date(),
      },
    });

    // Delete the used token
    await db.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationToken.identifier,
          token: verificationToken.token,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Verification failed" },
      { status: 500 }
    );
  }
}
