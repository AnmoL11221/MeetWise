import { dailyConfig, getDailyApiUrl, validateDailyConfig } from '@/config/daily';

interface DailyRoom {
  id: string;
  name: string;
  url: string;
  privacy: 'public' | 'private';
  properties: {
    exp?: number;
    max_participants?: number;
    enable_chat?: boolean;
    enable_recording?: boolean;
    enable_screenshare?: boolean;
    enable_virtual_backgrounds?: boolean;
  };
}

interface CreateRoomOptions {
  name?: string;
  privacy?: 'public' | 'private';
  maxParticipants?: number;
  enableChat?: boolean;
  enableRecording?: boolean;
  enableScreenshare?: boolean;
  enableVirtualBackgrounds?: boolean;
  exp?: number; // Expiration time in seconds
}

class DailyService {
  private apiKey: string;
  private baseUrl = 'https://api.daily.co/v1';

  constructor() {
    this.apiKey = dailyConfig.apiKey;
    if (!this.apiKey) {
      console.warn('Daily.co API key not found. Please set DAILY_API_KEY environment variable.');
    }
    
    const errors = validateDailyConfig();
    if (errors.length > 0) {
      console.error('Daily.co configuration errors:', errors);
    }
  }

  async createRoom(options: CreateRoomOptions = {}): Promise<DailyRoom> {
    const {
      name = `meeting-${Date.now()}`,
      privacy = 'private',
      maxParticipants = dailyConfig.maxParticipants,
      enableChat = dailyConfig.enableChat,
      enableRecording = dailyConfig.enableRecording,
      enableScreenshare = dailyConfig.enableScreenshare,
      enableVirtualBackgrounds = dailyConfig.enableVirtualBackgrounds,
      exp = dailyConfig.roomExpiration,
    } = options;

    // Daily's API expects properties.exp as a UNIX timestamp (seconds since epoch).
    // Our config provides a TTL in seconds. Convert TTL to absolute timestamp.
    const nowSec = Math.floor(Date.now() / 1000);
    const expTimestamp = exp > nowSec ? exp : nowSec + exp;

    const response = await fetch(`${this.baseUrl}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        name,
        privacy,
        properties: {
          exp: expTimestamp,
          max_participants: maxParticipants,
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to create Daily.co room: ${response.status} ${text}`);
    }

    return response.json();
  }

  async getRoom(roomName: string): Promise<DailyRoom> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomName}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get Daily.co room: ${error.error || response.statusText}`);
    }

    return response.json();
  }

  async deleteRoom(roomName: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/rooms/${roomName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to delete Daily.co room: ${error.error || response.statusText}`);
    }
  }

  async listRooms(): Promise<DailyRoom[]> {
    const response = await fetch(`${this.baseUrl}/rooms`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to list Daily.co rooms: ${error.error || response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  async getMeetingToken(roomName: string, userId: string, userName?: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/meeting-tokens`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        room: roomName,
        user_id: userId,
        user_name: userName || userId,
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to create meeting token: ${error.error || response.statusText}`);
    }

    const data = await response.json();
    return data.token;
  }

  async getRecordingUrl(recordingId: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/recordings/${recordingId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to get recording: ${error.error || response.statusText}`);
    }

    const data = await response.json();
    return data.download_url;
  }

  async listRecordings(roomName?: string): Promise<any[]> {
    const url = roomName 
      ? `${this.baseUrl}/recordings?room=${roomName}`
      : `${this.baseUrl}/recordings`;

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to list recordings: ${error.error || response.statusText}`);
    }

    const data = await response.json();
    return data.data || [];
  }

  generateRoomUrl(meetingId: string): string {
    return `https://${dailyConfig.roomDomain}/${meetingId}`;
  }

  // Helper method to check if a room exists
  async roomExists(roomName: string): Promise<boolean> {
    try {
      await this.getRoom(roomName);
      return true;
    } catch (error) {
      return false;
    }
  }

  async createOrGetRoom(meetingId: string, options: CreateRoomOptions = {}): Promise<DailyRoom> {
    const roomName = meetingId;
    
    try {
      return await this.getRoom(roomName);
    } catch (error) {
      try {
        return await this.createRoom({ name: roomName, ...options });
      } catch (err) {
        // Fallback to public room if private creation fails due to account settings
        return await this.createRoom({ name: roomName, privacy: 'public', maxParticipants: options.maxParticipants, exp: options.exp });
      }
    }
  }
}

export const dailyService = new DailyService();
export default dailyService; 