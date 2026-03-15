"use client";

import { useState, useEffect, useCallback } from 'react';

interface UseServiceWorkerReturn {
  isUpdateAvailable: boolean;
  isRegistered: boolean;
  registration: ServiceWorkerRegistration | null;
  updateServiceWorker: () => void;
  checkForUpdates: () => Promise<void>;
}

export function useServiceWorker(): UseServiceWorkerReturn {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const handleUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<ServiceWorkerRegistration>;
      setRegistration(customEvent.detail);
      setIsUpdateAvailable(true);
    };

    window.addEventListener('swUpdate', handleUpdate);

    // Check current registration status
    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg);
      setIsRegistered(true);
      
      // Check if there's already a waiting worker
      if (reg.waiting) {
        setIsUpdateAvailable(true);
      }
    });

    // Listen for controller change (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });

    return () => {
      window.removeEventListener('swUpdate', handleUpdate);
    };
  }, []);

  const updateServiceWorker = useCallback(() => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [registration]);

  const checkForUpdates = useCallback(async () => {
    if (registration) {
      await registration.update();
    }
  }, [registration]);

  return {
    isUpdateAvailable,
    isRegistered,
    registration,
    updateServiceWorker,
    checkForUpdates,
  };
}
