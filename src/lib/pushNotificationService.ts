/**
 * Apomuden Push Notification Service
 * Server-side service for sending push notifications
 */

import webpush from 'web-push';
import { db } from '@/lib/db';

// Configure VAPID keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@apomuden.gov.gh';

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: {
    url?: string;
    deep_link?: string;
    type?: string;
    resource_id?: string;
  };
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
}

export const NOTIFICATION_TYPES = {
  HEALTH_ALERT: 'health_alert',
  EMERGENCY_UPDATE: 'emergency_update',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  FACILITY_UPDATE: 'facility_update',
  SYSTEM_UPDATE: 'system_update',
  PROMOTIONAL: 'promotional',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

/**
 * Send push notification to a specific user
 */
export async function sendPushNotification(
  userId: string,
  payload: PushPayload
): Promise<{ success: boolean; sent: number; failed: number }> {
  try {
    const subscriptions = await db.pushSubscription.findMany({
      where: { userId },
    });

    if (subscriptions.length === 0) {
      console.log('[Push] No subscriptions found for user:', userId);
      return { success: true, sent: 0, failed: 0 };
    }

    let sent = 0;
    let failed = 0;

    for (const subscription of subscriptions) {
      try {
        await webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          },
          JSON.stringify(payload)
        );
        sent++;
      } catch (error: any) {
        failed++;
        console.error('[Push] Failed to send to subscription:', subscription.id, error.message);

        // If subscription is expired or invalid, remove it
        if (error.statusCode === 410 || error.statusCode === 404) {
          await db.pushSubscription.delete({
            where: { id: subscription.id },
          });
          console.log('[Push] Removed expired subscription:', subscription.id);
        }
      }
    }

    return { success: true, sent, failed };
  } catch (error) {
    console.error('[Push] Error sending notification:', error);
    return { success: false, sent: 0, failed: 0 };
  }
}

/**
 * Send push notification to multiple users
 */
export async function broadcastPushNotification(
  userIds: string[],
  payload: PushPayload
): Promise<{ success: boolean; totalSent: number; totalFailed: number }> {
  let totalSent = 0;
  let totalFailed = 0;

  for (const userId of userIds) {
    const result = await sendPushNotification(userId, payload);
    totalSent += result.sent;
    totalFailed += result.failed;
  }

  return { success: true, totalSent, totalFailed };
}

/**
 * Send push notification to all users with a specific role
 */
export async function sendPushToRole(
  role: 'USER' | 'ADMIN' | 'FACILITY_ADMIN' | 'MINISTRY',
  payload: PushPayload
): Promise<{ success: boolean; totalSent: number; totalFailed: number }> {
  try {
    const users = await db.user.findMany({
      where: { role: role as any },
      select: { id: true },
    });

    const userIds = users.map((u) => u.id);
    return broadcastPushNotification(userIds, payload);
  } catch (error) {
    console.error('[Push] Error sending to role:', error);
    return { success: false, totalSent: 0, totalFailed: 0 };
  }
}

/**
 * Create notification payload for health alerts
 */
export function createHealthAlertPayload(
  title: string,
  body: string,
  alertId?: string
): PushPayload {
  return {
    title,
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: 'health-alert',
    data: {
      type: NOTIFICATION_TYPES.HEALTH_ALERT,
      url: alertId ? `/alerts/${alertId}` : '/alerts',
      resource_id: alertId,
    },
    actions: [
      { action: 'view', title: 'View Alert' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
    requireInteraction: true,
  };
}

/**
 * Create notification payload for emergency updates
 */
export function createEmergencyUpdatePayload(
  title: string,
  body: string,
  emergencyId: string
): PushPayload {
  return {
    title,
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: `emergency-${emergencyId}`,
    data: {
      type: NOTIFICATION_TYPES.EMERGENCY_UPDATE,
      url: `/emergency/track/${emergencyId}`,
      resource_id: emergencyId,
    },
    actions: [
      { action: 'view', title: 'Track Emergency' },
    ],
    requireInteraction: true,
  };
}

/**
 * Create notification payload for appointment reminders
 */
export function createAppointmentReminderPayload(
  doctorName: string,
  appointmentTime: string,
  appointmentId: string
): PushPayload {
  return {
    title: 'Appointment Reminder',
    body: `Your appointment with ${doctorName} is at ${appointmentTime}`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    tag: `appointment-${appointmentId}`,
    data: {
      type: NOTIFICATION_TYPES.APPOINTMENT_REMINDER,
      url: `/dashboard/appointments/${appointmentId}`,
      resource_id: appointmentId,
    },
    actions: [
      { action: 'view', title: 'View Details' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };
}
