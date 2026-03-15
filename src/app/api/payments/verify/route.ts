import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyPayment } from "@/lib/payment";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Payment reference is required" },
        { status: 400 }
      );
    }

    const result = await verifyPayment(reference);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Payment verification failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        status: result.data?.status,
        reference: result.data?.reference,
        amount: result.data?.amount,
        currency: result.data?.currency,
        paidAt: result.data?.paid_at,
      },
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
