// Payment Service using Paystack API
// Documentation: https://paystack.com/docs/api/

interface PaystackInitResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    channel: string;
    paid_at: string;
    customer: {
      email: string;
      phone: string;
    };
    metadata: Record<string, unknown>;
  };
}

interface InitializePaymentParams {
  email: string;
  amount: number; // in pesewas (GHS * 100)
  reference?: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
  channels?: string[];
}

interface MobileMoneyParams {
  email: string;
  amount: number;
  phone: string;
  provider: "mtn" | "vod" | "tgo"; // MTN, Vodafone, AirtelTigo
  reference?: string;
  metadata?: Record<string, unknown>;
}

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";
const PAYSTACK_BASE_URL = "https://api.paystack.co";

// Generate unique reference
export function generateReference(prefix: string = "APO"): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`.toUpperCase();
}

// Initialize payment transaction
export async function initializePayment(
  params: InitializePaymentParams
): Promise<{ success: boolean; data?: PaystackInitResponse["data"]; error?: string }> {
  const { email, amount, reference, callback_url, metadata, channels } = params;

  // Mock mode if no API key
  if (!PAYSTACK_SECRET_KEY) {
    const mockRef = reference || generateReference();
    console.log(`[Payment Mock] Initializing payment: ${amount} pesewas for ${email}`);
    return {
      success: true,
      data: {
        authorization_url: `https://checkout.paystack.com/mock/${mockRef}`,
        access_code: `mock_${mockRef}`,
        reference: mockRef,
      },
    };
  }

  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount,
        reference: reference || generateReference(),
        callback_url: callback_url || `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
        metadata: {
          ...metadata,
          platform: "apomuden",
        },
        channels: channels || ["card", "mobile_money", "bank"],
        currency: "GHS",
      }),
    });

    const data: PaystackInitResponse = await response.json();

    if (data.status) {
      return { success: true, data: data.data };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error("[Paystack Error]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Payment initialization failed",
    };
  }
}

// Verify payment transaction
export async function verifyPayment(
  reference: string
): Promise<{ success: boolean; data?: PaystackVerifyResponse["data"]; error?: string }> {
  // Mock mode
  if (!PAYSTACK_SECRET_KEY) {
    console.log(`[Payment Mock] Verifying payment: ${reference}`);
    return {
      success: true,
      data: {
        id: 12345,
        status: "success",
        reference,
        amount: 5000,
        currency: "GHS",
        channel: "mobile_money",
        paid_at: new Date().toISOString(),
        customer: {
          email: "test@example.com",
          phone: "+233200000000",
        },
        metadata: {},
      },
    };
  }

  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const data: PaystackVerifyResponse = await response.json();

    if (data.status && data.data.status === "success") {
      return { success: true, data: data.data };
    } else {
      return { success: false, error: data.message || "Payment verification failed" };
    }
  } catch (error) {
    console.error("[Paystack Error]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Payment verification failed",
    };
  }
}

// Charge mobile money directly
export async function chargeMobileMoney(
  params: MobileMoneyParams
): Promise<{ success: boolean; reference?: string; error?: string }> {
  const { email, amount, phone, provider, reference, metadata } = params;

  // Mock mode
  if (!PAYSTACK_SECRET_KEY) {
    const mockRef = reference || generateReference("MOMO");
    console.log(`[Payment Mock] Mobile money charge: ${amount} pesewas from ${phone} (${provider})`);
    return { success: true, reference: mockRef };
  }

  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/charge`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount,
        mobile_money: {
          phone,
          provider,
        },
        reference: reference || generateReference("MOMO"),
        metadata: {
          ...metadata,
          platform: "apomuden",
        },
        currency: "GHS",
      }),
    });

    const data = await response.json();

    if (data.status) {
      return { success: true, reference: data.data.reference };
    } else {
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.error("[Paystack Error]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Mobile money charge failed",
    };
  }
}

// Create refund
export async function createRefund(
  transactionReference: string,
  amount?: number
): Promise<{ success: boolean; error?: string }> {
  // Mock mode
  if (!PAYSTACK_SECRET_KEY) {
    console.log(`[Payment Mock] Refund for: ${transactionReference}`);
    return { success: true };
  }

  try {
    const response = await fetch(`${PAYSTACK_BASE_URL}/refund`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transaction: transactionReference,
        ...(amount && { amount }),
      }),
    });

    const data = await response.json();
    return { success: data.status, error: data.message };
  } catch (error) {
    console.error("[Paystack Error]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Refund failed",
    };
  }
}

// Get Paystack public key for frontend
export function getPaystackPublicKey(): string {
  return PAYSTACK_PUBLIC_KEY;
}

// Format amount for display (pesewas to GHS)
export function formatAmount(pesewas: number): string {
  return `GH₵ ${(pesewas / 100).toFixed(2)}`;
}

// Convert GHS to pesewas
export function toPesewas(ghs: number): number {
  return Math.round(ghs * 100);
}
