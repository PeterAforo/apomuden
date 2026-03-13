// SMS Service using Hubtel API (mock implementation)
// In production, replace with actual Hubtel API calls

interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface SMSMessage {
  to: string;
  message: string;
  senderId?: string;
}

// Mock SMS sending - In production, use actual Hubtel API
export async function sendSMS(params: SMSMessage): Promise<SMSResponse> {
  const { to, message, senderId = "Apomuden" } = params;

  // Validate phone number (Ghana format)
  const phoneRegex = /^(\+233|0)(2[0-9]|5[0-9])[0-9]{7}$/;
  if (!phoneRegex.test(to)) {
    return {
      success: false,
      error: "Invalid phone number format",
    };
  }

  // In production, this would call Hubtel API:
  // const response = await fetch('https://sms.hubtel.com/v1/messages/send', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Basic ${Buffer.from(`${process.env.HUBTEL_API_KEY}:${process.env.HUBTEL_API_SECRET}`).toString('base64')}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     From: senderId,
  //     To: to,
  //     Content: message,
  //   }),
  // });

  // Mock successful response
  console.log(`[SMS Mock] To: ${to}, From: ${senderId}, Message: ${message}`);
  
  return {
    success: true,
    messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  };
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
