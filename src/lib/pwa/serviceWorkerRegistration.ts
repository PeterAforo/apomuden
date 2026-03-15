/**
 * Apomuden Service Worker Registration Module
 * Handles SW registration, updates, and lifecycle events
 */

export interface SWConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOffline?: () => void;
  onOnline?: () => void;
}

const isLocalhost = Boolean(
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/))
);

export function register(config?: SWConfig): void {
  if (typeof window === 'undefined') return;
  
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const publicUrl = new URL(process.env.NEXT_PUBLIC_URL || window.location.origin);
    
    if (publicUrl.origin !== window.location.origin) {
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = '/sw.js';

      if (isLocalhost) {
        checkValidServiceWorker(swUrl, config);
        navigator.serviceWorker.ready.then(() => {
          console.log('[PWA] Service worker is ready (localhost)');
        });
      } else {
        registerValidSW(swUrl, config);
      }
    });

    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('[PWA] Back online');
      config?.onOnline?.();
    });

    window.addEventListener('offline', () => {
      console.log('[PWA] Gone offline');
      config?.onOffline?.();
    });
  }
}

async function registerValidSW(swUrl: string, config?: SWConfig): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.register(swUrl);
    
    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      if (!installingWorker) return;

      installingWorker.onstatechange = () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            console.log('[PWA] New content available; please refresh.');
            config?.onUpdate?.(registration);
            
            // Dispatch custom event for UI components
            window.dispatchEvent(new CustomEvent('swUpdate', { detail: registration }));
          } else {
            console.log('[PWA] Content cached for offline use.');
            config?.onSuccess?.(registration);
          }
        }
      };
    };
  } catch (error) {
    console.error('[PWA] Error during service worker registration:', error);
  }
}

async function checkValidServiceWorker(swUrl: string, config?: SWConfig): Promise<void> {
  try {
    const response = await fetch(swUrl, {
      headers: { 'Service-Worker': 'script' },
    });

    const contentType = response.headers.get('content-type');
    
    if (
      response.status === 404 ||
      (contentType != null && contentType.indexOf('javascript') === -1)
    ) {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      window.location.reload();
    } else {
      registerValidSW(swUrl, config);
    }
  } catch {
    console.log('[PWA] No internet connection. App is running in offline mode.');
    config?.onOffline?.();
  }
}

export async function unregister(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      console.log('[PWA] Service worker unregistered');
    } catch (error) {
      console.error('[PWA] Error unregistering service worker:', error);
    }
  }
}

export async function checkForUpdates(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.update();
      console.log('[PWA] Checked for updates');
    } catch (error) {
      console.error('[PWA] Error checking for updates:', error);
    }
  }
}

export async function skipWaiting(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }
}

export async function clearCache(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data?.success || false);
      };
      registration.active?.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
    });
  }
  return false;
}

export async function getServiceWorkerVersion(): Promise<string | null> {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready;
    return new Promise((resolve) => {
      const messageChannel = new MessageChannel();
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data?.version || null);
      };
      registration.active?.postMessage(
        { type: 'GET_VERSION' },
        [messageChannel.port2]
      );
    });
  }
  return null;
}
