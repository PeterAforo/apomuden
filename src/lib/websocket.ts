// WebSocket service for real-time features
// Uses Pusher for production, falls back to polling for development

import Pusher from "pusher-js";

// Pusher configuration
const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY || "";
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu";

let pusherClient: Pusher | null = null;

// Initialize Pusher client (singleton)
export function getPusherClient(): Pusher | null {
  if (!PUSHER_KEY) {
    console.warn("[WebSocket] No Pusher key configured, using polling fallback");
    return null;
  }

  if (!pusherClient) {
    pusherClient = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      forceTLS: true,
    });
  }

  return pusherClient;
}

// Subscribe to ambulance location updates
export function subscribeToAmbulanceLocation(
  ambulanceId: string,
  onLocationUpdate: (data: AmbulanceLocation) => void
): () => void {
  const pusher = getPusherClient();

  if (pusher) {
    const channel = pusher.subscribe(`ambulance-${ambulanceId}`);
    channel.bind("location-update", onLocationUpdate);

    return () => {
      channel.unbind("location-update", onLocationUpdate);
      pusher.unsubscribe(`ambulance-${ambulanceId}`);
    };
  }

  // Fallback: Polling simulation
  let isActive = true;
  const pollInterval = setInterval(() => {
    if (!isActive) return;

    // Simulate location update
    const mockLocation: AmbulanceLocation = {
      ambulanceId,
      latitude: 5.6037 + (Math.random() - 0.5) * 0.01,
      longitude: -0.187 + (Math.random() - 0.5) * 0.01,
      speed: Math.floor(Math.random() * 60) + 20,
      heading: Math.floor(Math.random() * 360),
      timestamp: new Date().toISOString(),
    };

    onLocationUpdate(mockLocation);
  }, 3000);

  return () => {
    isActive = false;
    clearInterval(pollInterval);
  };
}

// Subscribe to emergency request updates
export function subscribeToEmergencyUpdates(
  requestId: string,
  onUpdate: (data: EmergencyUpdate) => void
): () => void {
  const pusher = getPusherClient();

  if (pusher) {
    const channel = pusher.subscribe(`emergency-${requestId}`);
    channel.bind("status-update", onUpdate);

    return () => {
      channel.unbind("status-update", onUpdate);
      pusher.unsubscribe(`emergency-${requestId}`);
    };
  }

  // Fallback: No polling for emergency updates
  return () => {};
}

// Subscribe to telemedicine call events
export function subscribeToCallEvents(
  appointmentId: string,
  callbacks: {
    onCallStarted?: () => void;
    onCallEnded?: () => void;
    onParticipantJoined?: (participant: string) => void;
  }
): () => void {
  const pusher = getPusherClient();

  if (pusher) {
    const channel = pusher.subscribe(`call-${appointmentId}`);
    
    if (callbacks.onCallStarted) {
      channel.bind("call-started", callbacks.onCallStarted);
    }
    if (callbacks.onCallEnded) {
      channel.bind("call-ended", callbacks.onCallEnded);
    }
    if (callbacks.onParticipantJoined) {
      channel.bind("participant-joined", callbacks.onParticipantJoined);
    }

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`call-${appointmentId}`);
    };
  }

  return () => {};
}

// Types
export interface AmbulanceLocation {
  ambulanceId: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: string;
}

export interface EmergencyUpdate {
  requestId: string;
  status: string;
  message?: string;
  eta?: number;
  ambulanceLocation?: AmbulanceLocation;
}

// Disconnect Pusher
export function disconnectPusher(): void {
  if (pusherClient) {
    pusherClient.disconnect();
    pusherClient = null;
  }
}
