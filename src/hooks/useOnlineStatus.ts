"use client";

import { useState, useEffect, useCallback } from 'react';

interface UseOnlineStatusReturn {
  isOnline: boolean;
  isOffline: boolean;
  lastOnlineAt: Date | null;
  checkConnection: () => Promise<boolean>;
}

export function useOnlineStatus(): UseOnlineStatusReturn {
  const [isOnline, setIsOnline] = useState(true);
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set initial state
    setIsOnline(navigator.onLine);
    if (navigator.onLine) {
      setLastOnlineAt(new Date());
      localStorage.setItem('lastOnline', new Date().toISOString());
    }

    const handleOnline = () => {
      setIsOnline(true);
      const now = new Date();
      setLastOnlineAt(now);
      localStorage.setItem('lastOnline', now.toISOString());
      console.log('[Network] Back online');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('[Network] Gone offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Restore last online time from localStorage
    const storedLastOnline = localStorage.getItem('lastOnline');
    if (storedLastOnline) {
      setLastOnlineAt(new Date(storedLastOnline));
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/health', {
        method: 'HEAD',
        cache: 'no-store',
      });
      const online = response.ok;
      setIsOnline(online);
      if (online) {
        const now = new Date();
        setLastOnlineAt(now);
        localStorage.setItem('lastOnline', now.toISOString());
      }
      return online;
    } catch {
      setIsOnline(false);
      return false;
    }
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    lastOnlineAt,
    checkConnection,
  };
}
