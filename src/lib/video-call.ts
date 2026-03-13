// Video Call Service using Daily.co
// Documentation: https://docs.daily.co/

interface DailyRoomResponse {
  id: string;
  name: string;
  url: string;
  created_at: string;
  config: {
    exp?: number;
    nbf?: number;
    max_participants?: number;
  };
}

interface CreateRoomOptions {
  appointmentId: string;
  expiryMinutes?: number;
  maxParticipants?: number;
}

interface JoinTokenOptions {
  roomName: string;
  userName: string;
  isOwner?: boolean;
  expiryMinutes?: number;
}

const DAILY_API_KEY = process.env.DAILY_API_KEY || "";
const DAILY_DOMAIN = process.env.NEXT_PUBLIC_DAILY_DOMAIN || "apomuden";
const DAILY_BASE_URL = "https://api.daily.co/v1";

// Create a video room for a telemedicine appointment
export async function createVideoRoom(options: CreateRoomOptions): Promise<{
  success: boolean;
  roomUrl?: string;
  roomName?: string;
  error?: string;
}> {
  const { appointmentId, expiryMinutes = 60, maxParticipants = 2 } = options;

  // If no API key, return mock room
  if (!DAILY_API_KEY) {
    const mockRoomName = `apomuden-${appointmentId}`;
    console.log(`[Video Mock] Created room: ${mockRoomName}`);
    return {
      success: true,
      roomUrl: `https://${DAILY_DOMAIN}.daily.co/${mockRoomName}`,
      roomName: mockRoomName,
    };
  }

  try {
    const expiryTime = Math.floor(Date.now() / 1000) + expiryMinutes * 60;
    
    const response = await fetch(`${DAILY_BASE_URL}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: `apomuden-${appointmentId}`,
        privacy: "private",
        properties: {
          exp: expiryTime,
          max_participants: maxParticipants,
          enable_chat: true,
          enable_screenshare: true,
          enable_recording: false,
          start_video_off: false,
          start_audio_off: false,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create room");
    }

    const room: DailyRoomResponse = await response.json();

    return {
      success: true,
      roomUrl: room.url,
      roomName: room.name,
    };
  } catch (error) {
    console.error("[Daily.co Error]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create video room",
    };
  }
}

// Generate a meeting token for a participant
export async function createMeetingToken(options: JoinTokenOptions): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> {
  const { roomName, userName, isOwner = false, expiryMinutes = 60 } = options;

  // If no API key, return mock token
  if (!DAILY_API_KEY) {
    const mockToken = `mock-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log(`[Video Mock] Created token for ${userName} in ${roomName}`);
    return {
      success: true,
      token: mockToken,
    };
  }

  try {
    const expiryTime = Math.floor(Date.now() / 1000) + expiryMinutes * 60;

    const response = await fetch(`${DAILY_BASE_URL}/meeting-tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          room_name: roomName,
          user_name: userName,
          is_owner: isOwner,
          exp: expiryTime,
          enable_screenshare: true,
          start_video_off: false,
          start_audio_off: false,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create meeting token");
    }

    const data = await response.json();

    return {
      success: true,
      token: data.token,
    };
  } catch (error) {
    console.error("[Daily.co Error]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create meeting token",
    };
  }
}

// Delete a video room
export async function deleteVideoRoom(roomName: string): Promise<boolean> {
  if (!DAILY_API_KEY) {
    console.log(`[Video Mock] Deleted room: ${roomName}`);
    return true;
  }

  try {
    const response = await fetch(`${DAILY_BASE_URL}/rooms/${roomName}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${DAILY_API_KEY}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error("[Daily.co Error]", error);
    return false;
  }
}

// Get room details
export async function getRoomDetails(roomName: string): Promise<DailyRoomResponse | null> {
  if (!DAILY_API_KEY) {
    return {
      id: `mock-${roomName}`,
      name: roomName,
      url: `https://${DAILY_DOMAIN}.daily.co/${roomName}`,
      created_at: new Date().toISOString(),
      config: {},
    };
  }

  try {
    const response = await fetch(`${DAILY_BASE_URL}/rooms/${roomName}`, {
      headers: {
        "Authorization": `Bearer ${DAILY_API_KEY}`,
      },
    });

    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    console.error("[Daily.co Error]", error);
    return null;
  }
}

// Generate a simple join URL (for sharing)
export function getJoinUrl(roomName: string): string {
  return `https://${DAILY_DOMAIN}.daily.co/${roomName}`;
}
