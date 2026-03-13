// SMS Service using mNotify API
// Documentation: https://docs.mnotify.com/

interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  balance?: number;
}

interface SMSMessage {
  to: string;
  message: string;
  senderId?: string;
}

interface MNotifyResponse {
  status: string;
  code: string;
  message: string;
  summary?: {
    total: number;
    sent: number;
    failed: number;
    balance: number;
  };
}

const MNOTIFY_API_KEY = process.env.MNOTIFY_API_KEY || "";
const MNOTIFY_SENDER_ID = process.env.MNOTIFY_SENDER_ID || "Apomuden";
const MNOTIFY_BASE_URL = "https://api.mnotify.com/api";

// Format phone number to mNotify format (233XXXXXXXXX)
function formatPhoneNumber(phone: string): string {
  let formatted = phone.replace(/\s+/g, "").replace(/-/g, "");
  
  if (formatted.startsWith("+233")) {
    formatted = formatted.substring(1); // Remove +
  } else if (formatted.startsWith("0")) {
    formatted = "233" + formatted.substring(1);
  } else if (!formatted.startsWith("233")) {
    formatted = "233" + formatted;
  }
  
  return formatted;
}

// Send SMS using mNotify API
export async function sendSMS(params: SMSMessage): Promise<SMSResponse> {
  const { to, message, senderId = MNOTIFY_SENDER_ID } = params;

  // Validate phone number (Ghana format)
  const phoneRegex = /^(\+233|233|0)(2[0-9]|5[0-9])[0-9]{7}$/;
  if (!phoneRegex.test(to.replace(/\s+/g, "").replace(/-/g, ""))) {
    return {
      success: false,
      error: "Invalid phone number format. Use Ghana format: 0XX XXX XXXX or +233 XX XXX XXXX",
    };
  }

  const formattedPhone = formatPhoneNumber(to);

  // If no API key, use mock mode
  if (!MNOTIFY_API_KEY) {
    console.log(`[SMS Mock] To: ${formattedPhone}, From: ${senderId}, Message: ${message}`);
    return {
      success: true,
      messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  try {
    const response = await fetch(`${MNOTIFY_BASE_URL}/sms/quick`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        key: MNOTIFY_API_KEY,
        to: formattedPhone,
        msg: message,
        sender_id: senderId,
        is_schedule: false,
      }),
    });

    const data: MNotifyResponse = await response.json();

    if (data.status === "success" || data.code === "1000") {
      return {
        success: true,
        messageId: `mnotify-${Date.now()}`,
        balance: data.summary?.balance,
      };
    } else {
      console.error("[mNotify Error]", data);
      return {
        success: false,
        error: data.message || "Failed to send SMS",
      };
    }
  } catch (error) {
    console.error("[mNotify Error]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

export async function sendOTP(phone: string, otp: string): Promise<SMSResponse> {
  return sendSMS({
    to: phone,
    message: `Your Apomuden verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`,
  });
}

export async function sendAlertSMS(phone: string, alertTitle: string, alertBody: string): Promise<SMSResponse> {
  const message = `HEALTH ALERT: ${alertTitle}\n${alertBody.substring(0, 120)}...\nVisit apomuden.vercel.app for details.`;
  return sendSMS({
    to: phone,
    message: message.substring(0, 160), // SMS limit
  });
}

export async function sendEmergencyConfirmation(phone: string, requestId: string): Promise<SMSResponse> {
  return sendSMS({
    to: phone,
    message: `Your emergency request #${requestId.substring(0, 8)} has been received. Help is on the way. Stay calm and keep your phone accessible.`,
  });
}

export async function sendAmbulanceDispatchNotification(
  phone: string, 
  ambulanceReg: string, 
  driverPhone: string
): Promise<SMSResponse> {
  return sendSMS({
    to: phone,
    message: `Ambulance ${ambulanceReg} has been dispatched to your location. Driver contact: ${driverPhone}. ETA: 10-15 mins.`,
  });
}

// Bulk SMS for alerts
export async function sendBulkSMS(
  recipients: string[], 
  message: string
): Promise<{ sent: number; failed: number; errors: string[] }> {
  const results = await Promise.allSettled(
    recipients.map(phone => sendSMS({ to: phone, message }))
  );

  const sent = results.filter(r => r.status === "fulfilled" && (r.value as SMSResponse).success).length;
  const failed = results.length - sent;
  const errors = results
    .filter(r => r.status === "rejected" || (r.status === "fulfilled" && !(r.value as SMSResponse).success))
    .map((r, i) => `${recipients[i]}: ${r.status === "rejected" ? "Failed" : (r as PromiseFulfilledResult<SMSResponse>).value.error}`);

  return { sent, failed, errors };
}
