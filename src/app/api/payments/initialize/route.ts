import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { initializePayment, generateReference, toPesewas } from "@/lib/payment";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, email, appointmentId, description } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Valid amount is required" },
        { status: 400 }
      );
    }

    const userEmail = email || session.user.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: "Email is required for payment" },
        { status: 400 }
      );
    }

    const reference = generateReference("APO");
    const amountInPesewas = toPesewas(amount);

    const result = await initializePayment({
      email: userEmail,
      amount: amountInPesewas,
      reference,
      metadata: {
        userId: session.user.id,
        appointmentId,
        description: description || "Apomuden Health Service",
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to initialize payment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        authorizationUrl: result.data?.authorization_url,
        accessCode: result.data?.access_code,
        reference: result.data?.reference,
      },
    });
  } catch (error) {
    console.error("Error initializing payment:", error);
    return NextResponse.json(
      { error: "Failed to initialize payment" },
      { status: 500 }
    );
  }
}
