# Video Conferencing Setup Guide

This guide will help you set up the integrated video conferencing system for MeetWise using Daily.co.

## Features

- **High-Fidelity Video & Audio**: Crystal-clear WebRTC-based video calls
- **Screen Sharing**: Share your screen with participants
- **Virtual Backgrounds**: Upload custom backgrounds or use built-in options
- **Meeting Recording**: Record meetings for later review
- **Real-time Chat**: Built-in chat functionality
- **Participant Management**: View and manage meeting participants
- **Responsive Design**: Works on desktop and mobile devices

## Prerequisites

1. A Daily.co account (free tier available)
2. Node.js 18+ and pnpm
3. Environment variables configured

## Setup Instructions

### 1. Daily.co Account Setup

1. Go to [Daily.co](https://daily.co) and create an account
2. Navigate to your dashboard
3. Go to "Developers" → "API Keys"
4. Create a new API key with the following permissions:
   - `rooms:write` - Create and manage rooms
   - `meeting-tokens:write` - Generate meeting tokens
   - `recordings:read` - Access recordings

### 2. Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Daily.co Configuration
DAILY_API_KEY=your_daily_api_key_here
DAILY_DOMAIN=meetwise.daily.co

# Optional: Custom domain for Daily.co rooms
DAILY_ROOM_DOMAIN=meetwise.daily.co
```

### 3. Daily.co Domain Configuration

1. In your Daily.co dashboard, go to "Settings" → "Domains"
2. Add a custom domain (e.g., `meetwise.daily.co`)
3. Configure DNS records as instructed by Daily.co
4. Set this domain as your default domain

### 4. Install Dependencies

The required dependencies are already installed:

```bash
# Daily.co React components
@daily-co/daily-react
@daily-co/daily-js
```

### 5. Virtual Backgrounds Setup

Create the following directory structure for virtual backgrounds:

```
public/
  uploads/
    virtual-backgrounds/  # User-uploaded backgrounds
  api/
    virtual-backgrounds/   # Default backgrounds
      office.jpg
      nature.jpg
      beach.jpg
      city.jpg
      abstract.jpg
      office-thumb.jpg
      nature-thumb.jpg
      beach-thumb.jpg
      city-thumb.jpg
      abstract-thumb.jpg
```

### 6. API Routes

The following API routes are automatically created:

- `/api/daily/rooms` - Room management
- `/api/daily/tokens` - Meeting token generation
- `/api/daily/recordings` - Recording management
- `/api/virtual-backgrounds/upload` - Background upload

## Usage

### Starting a Video Conference

1. Navigate to any meeting in MeetWise
2. Click the "Video Conference" tab
3. Click "Join Video Call"
4. Grant camera and microphone permissions
5. Start your video conference!

### Controls

- **Audio/Video Toggle**: Mute/unmute audio and video
- **Screen Share**: Share your screen or specific applications
- **Virtual Background**: Apply custom or built-in backgrounds
- **Recording**: Start/stop meeting recording
- **Participants**: View meeting participants
- **Leave Call**: Exit the video conference

### Virtual Backgrounds

1. Click the background icon in the video controls
2. Choose from built-in backgrounds or upload your own
3. Uploaded backgrounds are automatically saved for future use

### Screen Sharing

1. Click the screen share button
2. Choose to share your entire screen or specific applications
3. Click "Stop Sharing" to end screen sharing

### Recording

1. Click the record button to start recording
2. The recording indicator will show when active
3. Click again to stop recording
4. Recordings are automatically processed and available for download

## Configuration Options

### Room Settings

You can customize room settings when creating a video conference:

```typescript
{
  privacy: 'private' | 'public',
  maxParticipants: 20,
  enableChat: true,
  enableRecording: true,
  enableScreenshare: true,
  enableVirtualBackgrounds: true,
  exp: 86400
}
```

### Video Quality Settings

The system automatically adjusts video quality based on:
- Network conditions
- Device capabilities
- Number of participants

### Audio Settings

- Automatic noise suppression
- Echo cancellation
- Audio level indicators

## Troubleshooting

### Common Issues

1. **Camera/Microphone not working**
   - Check browser permissions
   - Ensure no other applications are using the camera
   - Try refreshing the page

2. **Poor video quality**
   - Check your internet connection
   - Close other bandwidth-intensive applications
   - Try reducing the number of participants

3. **Can't join the meeting**
   - Verify the room URL is correct
   - Check if the meeting has ended
   - Ensure you have the necessary permissions

4. **Recording not working**
   - Verify Daily.co recording is enabled
   - Check your Daily.co account permissions
   - Ensure the meeting is active

### Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Mobile Support

- iOS Safari 13+
- Android Chrome 80+
- Responsive design for mobile devices

## Security Considerations

1. **Room Privacy**: All rooms are private by default
2. **Token-based Access**: Secure meeting tokens for authentication
3. **File Upload Validation**: Virtual backgrounds are validated for type and size
4. **HTTPS Required**: All connections use secure protocols

## Performance Optimization

1. **Automatic Quality Adjustment**: Video quality adjusts based on network conditions
2. **Efficient Encoding**: Uses modern video codecs for optimal performance
3. **Bandwidth Management**: Automatic bandwidth optimization
4. **Resource Cleanup**: Proper cleanup of media streams and connections

## Support

For technical support:
1. Check the Daily.co documentation
2. Review browser console for errors
3. Verify environment variables are set correctly
4. Test with different browsers/devices

## Future Enhancements

- AI-powered background removal
- Advanced audio processing
- Meeting analytics and insights
- Integration with calendar systems
- Advanced recording features
- Custom branding options 