import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword, validatePasswordStrength } from "@/lib/password";
import { sendOTP } from "@/lib/sms";

export async function POST(request: NextRequest) {
  try {
    const { name, phone, email, password, method } = await request.json();

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Name is required" },
        { status: 400 }
      );
    }

    if (method === "phone") {
      if (!phone) {
        return NextResponse.json(
          { success: false, message: "Phone number is required" },
          { status: 400 }
        );
      }

      // Check if phone already exists
      const existingUser = await db.user.findUnique({
        where: { phone },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "An account with this phone number already exists" },
          { status: 409 }
        );
      }

      // Create user (unverified)
      const user = await db.user.create({
        data: {
          name,
          phone,
          role: "CITIZEN",
          isVerified: false,
        },
      });

      // Generate and store OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      await db.verificationToken.create({
        data: {
          identifier: phone,
          token: otp,
          expires: new Date(Date.now() + 5 * 60 * 1000),
        },
      });

      // Send OTP via SMS
      const smsResult = await sendOTP(phone, otp);
      if (!smsResult.success) {
        console.error("Failed to send OTP SMS:", smsResult.error);
      }

      return NextResponse.json({
        success: true,
        message: "Account created. Please verify your phone number.",
        userId: user.id,
        // Only expose OTP in development for testing
        ...(process.env.NODE_ENV === "development" && { demo_otp: otp }),
      });

    } else if (method === "email") {
      if (!email || !password) {
        return NextResponse.json(
          { success: false, message: "Email and password are required" },
          { status: 400 }
        );
      }

      // Check if email already exists
      const existingUser = await db.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        return NextResponse.json(
          { success: false, message: "An account with this email already exists" },
          { status: 409 }
        );
      }

      // Validate password strength
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        return NextResponse.json(
          { success: false, message: passwordValidation.errors[0] },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Create user
      const user = await db.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword,
          phone: `temp_${Date.now()}`, // Temporary phone - user should add real one later
          role: "CITIZEN",
          isVerified: true, // Auto-verify for email registration
        },
      });

      return NextResponse.json({
        success: true,
        message: "Account created successfully",
        userId: user.id,
      });

    } else {
      return NextResponse.json(
        { success: false, message: "Invalid registration method" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Registration failed" },
      { status: 500 }
    );
  }
}
