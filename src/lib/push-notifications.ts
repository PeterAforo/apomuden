// Push Notification Service
// Supports both VAPID (web-push) and Pusher Beams

const PUBLIC_VAPID_KEY = process.env.NEXT_PUBLIC_VAPID_KEY || '';
const PUSHER_BEAMS_INSTANCE_ID = process.env.NEXT_PUBLIC_PUSHER_BEAMS_INSTANCE_ID || '';

// Pusher Beams client instance
let beamsClient: any = null;

// Initialize Pusher Beams
export async function initializePusherBeams(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  if (!PUSHER_BEAMS_INSTANCE_ID) {
    console.log('Pusher Beams instance ID not configured');
    return false;
  }

  try {
    // Load Pusher Beams SDK dynamically
    if (!(window as any).PusherPushNotifications) {
      await loadPusherBeamsScript();
    }

    const PusherPushNotifications = (window as any).PusherPushNotifications;
    
    beamsClient = new PusherPushNotifications.Client({
      instanceId: PUSHER_BEAMS_INSTANCE_ID,
    });

    await beamsClient.start();
    console.log('Pusher Beams initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Pusher Beams:', error);
    return false;
  }
}

// Load Pusher Beams script dynamically
function loadPusherBeamsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).PusherPushNotifications) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.pusher.com/beams/2.1.0/push-notifications-cdn.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Pusher Beams SDK'));
    document.head.appendChild(script);
  });
}

// Subscribe to Pusher Beams interests (topics)
export async function subscribeToBeamsInterests(interests: string[]): Promise<boolean> {
  if (!beamsClient) {
    const initialized = await initializePusherBeams();
    if (!initialized) return false;
  }

  try {
    await beamsClient.setDeviceInterests(interests);
    console.log('Subscribed to interests:', interests);
    return true;
  } catch (error) {
    console.error('Failed to subscribe to interests:', error);
    return false;
  }
}

// Add a single interest
export async function addBeamsInterest(interest: string): Promise<boolean> {
  if (!beamsClient) {
    const initialized = await initializePusherBeams();
    if (!initialized) return false;
  }

  try {
    await beamsClient.addDeviceInterest(interest);
    console.log('Added interest:', interest);
    return true;
  } catch (error) {
    console.error('Failed to add interest:', error);
    return false;
  }
}

// Remove an interest
export async function removeBeamsInterest(interest: string): Promise<boolean> {
  if (!beamsClient) return false;

  try {
    await beamsClient.removeDeviceInterest(interest);
    console.log('Removed interest:', interest);
    return true;
  } catch (error) {
    console.error('Failed to remove interest:', error);
    return false;
  }
}

// Get current interests
export async function getBeamsInterests(): Promise<string[]> {
  if (!beamsClient) return [];

  try {
    return await beamsClient.getDeviceInterests();
  } catch (error) {
    console.error('Failed to get interests:', error);
    return [];
  }
}

// Stop Pusher Beams
export async function stopPusherBeams(): Promise<void> {
  if (beamsClient) {
    try {
      await beamsClient.stop();
      beamsClient = null;
    } catch (error) {
      console.error('Failed to stop Pusher Beams:', error);
    }
  }
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
}

export async function subscribeToPushNotifications(
  registration: ServiceWorkerRegistration
): Promise<PushSubscription | null> {
  try {
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: PUBLIC_VAPID_KEY,
    });

    // Send subscription to server
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(subscription),
    });

    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
}

export async function unsubscribeFromPushNotifications(
  registration: ServiceWorkerRegistration
): Promise<boolean> {
  try {
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      
      // Notify server
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
    }
    return true;
  } catch (error) {
    console.error('Failed to unsubscribe:', error);
    return false;
  }
}

export function showLocalNotification(
  title: string,
  options?: NotificationOptions
): void {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      ...options,
    });
  }
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
