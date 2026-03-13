// Pusher Beams Server-side Push Notifications
// Used to send push notifications from the server

const BEAMS_INSTANCE_ID = process.env.NEXT_PUBLIC_PUSHER_BEAMS_INSTANCE_ID || '';
const BEAMS_SECRET_KEY = process.env.PUSHER_BEAMS_SECRET_KEY || '';

interface WebNotification {
  title: string;
  body: string;
  icon?: string;
  deep_link?: string;
  hide_notification_if_site_has_focus?: boolean;
}

interface PublishRequest {
  interests: string[];
  web: {
    notification: WebNotification;
    data?: Record<string, any>;
  };
}

interface PublishResponse {
  publishId: string;
}

// Send push notification to interests (topics)
export async function sendPushNotification(
  interests: string[],
  title: string,
  body: string,
  options?: {
    icon?: string;
    deepLink?: string;
    data?: Record<string, any>;
  }
): Promise<{ success: boolean; publishId?: string; error?: string }> {
  if (!BEAMS_INSTANCE_ID || !BEAMS_SECRET_KEY) {
    console.log('[Pusher Beams] Not configured, skipping push notification');
    return { success: false, error: 'Pusher Beams not configured' };
  }

  const payload: PublishRequest = {
    interests,
    web: {
      notification: {
        title,
        body,
        icon: options?.icon || '/icons/icon-192x192.png',
        deep_link: options?.deepLink,
        hide_notification_if_site_has_focus: true,
      },
      data: options?.data,
    },
  };

  try {
    const response = await fetch(
      `https://${BEAMS_INSTANCE_ID}.pushnotifications.pusher.com/publish_api/v1/instances/${BEAMS_INSTANCE_ID}/publishes`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BEAMS_SECRET_KEY}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('[Pusher Beams] Error:', error);
      return { success: false, error };
    }

    const data: PublishResponse = await response.json();
    console.log('[Pusher Beams] Notification sent:', data.publishId);
    return { success: true, publishId: data.publishId };
  } catch (error) {
    console.error('[Pusher Beams] Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Send health alert notification
export async function sendHealthAlert(
  title: string,
  body: string,
  region?: string
): Promise<{ success: boolean; publishId?: string; error?: string }> {
  const interests = ['health-alerts'];
  if (region) {
    interests.push(`health-alerts-${region.toLowerCase().replace(/\s+/g, '-')}`);
  }

  return sendPushNotification(interests, `🏥 ${title}`, body, {
    icon: '/icons/health-alert.png',
    deepLink: '/dashboard/alerts',
  });
}

// Send emergency notification
export async function sendEmergencyNotification(
  title: string,
  body: string,
  emergencyId: string
): Promise<{ success: boolean; publishId?: string; error?: string }> {
  return sendPushNotification(['emergency-updates'], `🚨 ${title}`, body, {
    icon: '/icons/emergency.png',
    deepLink: `/emergency/${emergencyId}`,
    data: { emergencyId },
  });
}

// Send ambulance dispatch notification
export async function sendAmbulanceDispatchNotification(
  userId: string,
  ambulanceReg: string,
  eta: number
): Promise<{ success: boolean; publishId?: string; error?: string }> {
  return sendPushNotification(
    [`user-${userId}`],
    '🚑 Ambulance Dispatched',
    `Ambulance ${ambulanceReg} is on the way. ETA: ${eta} minutes.`,
    {
      icon: '/icons/ambulance.png',
      deepLink: '/dashboard/track-ambulance',
    }
  );
}

// Send telemedicine appointment reminder
export async function sendAppointmentReminder(
  userId: string,
  doctorName: string,
  appointmentTime: string
): Promise<{ success: boolean; publishId?: string; error?: string }> {
  return sendPushNotification(
    [`user-${userId}`],
    '📅 Appointment Reminder',
    `Your telemedicine appointment with ${doctorName} is at ${appointmentTime}.`,
    {
      icon: '/icons/appointment.png',
      deepLink: '/dashboard/telemedicine',
    }
  );
}
