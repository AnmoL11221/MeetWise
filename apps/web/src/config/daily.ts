export const dailyConfig = {
  apiKey: process.env.DAILY_API_KEY || '',
  domain: process.env.DAILY_DOMAIN || 'meetwise.daily.co',
  roomDomain: process.env.DAILY_ROOM_DOMAIN || process.env.DAILY_DOMAIN || 'meetwise.daily.co',
  
  maxParticipants: parseInt(process.env.DAILY_MAX_PARTICIPANTS || '20'),
  roomExpiration: parseInt(process.env.DAILY_ROOM_EXPIRATION || '86400'),
  
  enableChat: process.env.DAILY_ENABLE_CHAT !== 'false',
  enableRecording: process.env.DAILY_ENABLE_RECORDING !== 'false',
  enableScreenshare: process.env.DAILY_ENABLE_SCREENSHARE !== 'false',
  enableVirtualBackgrounds: process.env.DAILY_ENABLE_VIRTUAL_BACKGROUNDS !== 'false',
  
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'),
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(','),
  
  recordingRetentionDays: parseInt(process.env.RECORDING_RETENTION_DAYS || '30'),
  
  defaultBackgrounds: [
    {
      id: 'none',
      name: 'None',
      url: null,
      thumbnail: '/api/virtual-backgrounds/none.jpg',
    },
    {
      id: 'office',
      name: 'Office',
      url: '/api/virtual-backgrounds/office.jpg',
      thumbnail: '/api/virtual-backgrounds/office-thumb.jpg',
    },
    {
      id: 'nature',
      name: 'Nature',
      url: '/api/virtual-backgrounds/nature.jpg',
      thumbnail: '/api/virtual-backgrounds/nature-thumb.jpg',
    },
    {
      id: 'beach',
      name: 'Beach',
      url: '/api/virtual-backgrounds/beach.jpg',
      thumbnail: '/api/virtual-backgrounds/beach-thumb.jpg',
    },
    {
      id: 'city',
      name: 'City',
      url: '/api/virtual-backgrounds/city.jpg',
      thumbnail: '/api/virtual-backgrounds/city-thumb.jpg',
    },
    {
      id: 'abstract',
      name: 'Abstract',
      url: '/api/virtual-backgrounds/abstract.jpg',
      thumbnail: '/api/virtual-backgrounds/abstract-thumb.jpg',
    },
  ],
  
  videoQuality: {
    low: {
      width: 640,
      height: 480,
      frameRate: 15,
      bitrate: 500,
    },
    medium: {
      width: 1280,
      height: 720,
      frameRate: 30,
      bitrate: 1500,
    },
    high: {
      width: 1920,
      height: 1080,
      frameRate: 30,
      bitrate: 3000,
    },
  },
  
  audioSettings: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  
  ui: {
    showParticipantCount: true,
    showRecordingIndicator: true,
    showNetworkQuality: true,
    showAudioLevels: true,
    enableFullscreen: true,
    enablePictureInPicture: true,
  },
};

export const validateDailyConfig = () => {
  const errors: string[] = [];
  
  if (!dailyConfig.apiKey) {
    errors.push('DAILY_API_KEY is required');
  }
  
  if (!dailyConfig.domain) {
    errors.push('DAILY_DOMAIN is required');
  }
  
  if (dailyConfig.maxParticipants < 1 || dailyConfig.maxParticipants > 100) {
    errors.push('DAILY_MAX_PARTICIPANTS must be between 1 and 100');
  }
  
  if (dailyConfig.roomExpiration < 300 || dailyConfig.roomExpiration > 604800) {
    errors.push('DAILY_ROOM_EXPIRATION must be between 300 (5 minutes) and 604800 (7 days)');
  }
  
  return errors;
};

export const getDailyRoomUrl = (roomName: string) => {
  return `https://${dailyConfig.roomDomain}/${roomName}`;
};

export const getDailyApiUrl = (endpoint: string) => {
  return `https://api.daily.co/v1${endpoint}`;
}; 