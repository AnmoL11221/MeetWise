'use client';

import React, { useState, useEffect } from 'react';
import { Video, Users, Monitor, Record, Settings } from 'lucide-react';
import VideoConference from './VideoConference';
import dailyService from '@/services/dailyService';

interface VideoConferenceTabProps {
  meetingId: string;
  meetingTitle?: string;
}

const VideoConferenceTab: React.FC<VideoConferenceTabProps> = ({ meetingId, meetingTitle }) => {
  const [isVideoActive, setIsVideoActive] = useState(false);
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participantCount, setParticipantCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  const initializeVideoRoom = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create or get the Daily.co room
      const response = await fetch('/api/daily/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingId,
          name: meetingTitle || `Meeting ${meetingId}`,
          privacy: 'private',
          maxParticipants: 20,
          enableChat: true,
          enableRecording: true,
          enableScreenshare: true,
          enableVirtualBackgrounds: true,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create video room');
      }

      const { room } = await response.json();
      setRoomUrl(room.url);
      setIsVideoActive(true);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize video conference');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveVideo = () => {
    setIsVideoActive(false);
    setRoomUrl(null);
  };

  const handleJoinVideo = () => {
    initializeVideoRoom();
  };

  if (isVideoActive && roomUrl) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <Video className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Video Conference</h2>
            {participantCount > 0 && (
              <span className="text-sm text-gray-400">
                {participantCount} participant{participantCount !== 1 ? 's' : ''}
              </span>
            )}
            {isRecording && (
              <div className="flex items-center gap-1 text-red-400">
                <Record className="w-4 h-4" />
                <span className="text-sm">Recording</span>
              </div>
            )}
          </div>
          <button
            onClick={handleLeaveVideo}
            className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Exit Video
          </button>
        </div>
        
        <div className="flex-1 relative">
          <VideoConference roomUrl={roomUrl} onLeave={handleLeaveVideo} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Video className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-semibold text-white">Video Conference</h2>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Start Video Conference
            </h3>
            <p className="text-gray-400 mb-6">
              Join a high-quality video call with crystal-clear audio, screen sharing, and virtual backgrounds.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/20 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button
              onClick={handleJoinVideo}
              disabled={isLoading}
              className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Initializing...
                </div>
              ) : (
                'Join Video Call'
              )}
            </button>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <Users className="w-4 h-4" />
                <span>Up to 20 participants</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Monitor className="w-4 h-4" />
                <span>Screen sharing</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Record className="w-4 h-4" />
                <span>Meeting recording</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Settings className="w-4 h-4" />
                <span>Virtual backgrounds</span>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-2">Features included:</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• High-definition video and audio</li>
              <li>• Crystal-clear screen sharing</li>
              <li>• Virtual backgrounds and filters</li>
              <li>• Meeting recording and playback</li>
              <li>• Real-time chat and reactions</li>
              <li>• Automatic noise suppression</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoConferenceTab; 