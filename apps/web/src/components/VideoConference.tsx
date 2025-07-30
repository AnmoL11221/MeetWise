'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  DailyProvider,
  useDaily,
  useDailyEvent,
  useLocalParticipant,
  useParticipantIds,
  useScreenShare,
  useVideoTrack,
  useAudioTrack,
} from '@daily-co/daily-react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  MonitorOff,
  Phone,
  PhoneOff,
  Settings,
  Users,
  Record,
  Square,
  MoreVertical,
  Volume2,
  VolumeX,
  Camera,
  CameraOff,
  Share,
  Download,
  Background,
  Grid3X3,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface VideoConferenceProps {
  roomUrl: string;
  onLeave?: () => void;
}

interface ParticipantVideoProps {
  participantId: string;
  isLocal?: boolean;
}

const ParticipantVideo: React.FC<ParticipantVideoProps> = ({ participantId, isLocal = false }) => {
  const videoTrack = useVideoTrack(participantId);
  const audioTrack = useAudioTrack(participantId);
  const { localParticipant } = useLocalParticipant();
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (videoRef.current && videoTrack?.persistentTrack) {
      videoRef.current.srcObject = new MediaStream([videoTrack.persistentTrack]);
    }
  }, [videoTrack]);

  useEffect(() => {
    if (audioRef.current && audioTrack?.persistentTrack) {
      audioRef.current.srcObject = new MediaStream([audioTrack.persistentTrack]);
    }
  }, [audioTrack]);

  const toggleAudio = useCallback(async () => {
    if (isLocal) {
      if (localParticipant.audio) {
        await localParticipant.setLocalAudio(false);
      } else {
        await localParticipant.setLocalAudio(true);
      }
    }
    setIsAudioMuted(!isAudioMuted);
  }, [isLocal, localParticipant, isAudioMuted]);

  const toggleVideo = useCallback(async () => {
    if (isLocal) {
      if (localParticipant.video) {
        await localParticipant.setLocalVideo(false);
      } else {
        await localParticipant.setLocalVideo(true);
      }
    }
    setIsVideoMuted(!isVideoMuted);
  }, [isLocal, localParticipant, isVideoMuted]);

  return (
    <div
      className="relative bg-gray-900 rounded-lg overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className="w-full h-full object-cover"
      />
      <audio ref={audioRef} autoPlay playsInline muted={isLocal} />
      
      {isVideoMuted && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
          <CameraOff className="w-16 h-16 text-gray-400" />
        </div>
      )}

      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="flex items-center justify-between">
            <span className="text-white text-sm font-medium">
              {isLocal ? 'You' : `Participant ${participantId}`}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleAudio}
                className={`p-2 rounded-full ${
                  isAudioMuted ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'
                } text-white transition-colors`}
              >
                {isAudioMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleVideo}
                className={`p-2 rounded-full ${
                  isVideoMuted ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'
                } text-white transition-colors`}
              >
                {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const VideoConferenceControls: React.FC = () => {
  const daily = useDaily();
  const { localParticipant } = useLocalParticipant();
  const { isSharingScreen, startScreenShare, stopScreenShare } = useScreenShare();
  const [isRecording, setIsRecording] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [virtualBackground, setVirtualBackground] = useState<string | null>(null);

  const toggleAudio = useCallback(async () => {
    if (localParticipant.audio) {
      await localParticipant.setLocalAudio(false);
    } else {
      await localParticipant.setLocalAudio(true);
    }
  }, [localParticipant]);

  const toggleVideo = useCallback(async () => {
    if (localParticipant.video) {
      await localParticipant.setLocalVideo(false);
    } else {
      await localParticipant.setLocalVideo(true);
    }
  }, [localParticipant]);

  const toggleScreenShare = useCallback(async () => {
    if (isSharingScreen) {
      await stopScreenShare();
    } else {
      await startScreenShare();
    }
  }, [isSharingScreen, startScreenShare, stopScreenShare]);

  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      await daily?.stopRecording();
      setIsRecording(false);
    } else {
      await daily?.startRecording();
      setIsRecording(true);
    }
  }, [daily, isRecording]);

  const leaveCall = useCallback(async () => {
    await daily?.leave();
  }, [daily]);

  const applyVirtualBackground = useCallback(async (backgroundUrl: string | null) => {
    if (backgroundUrl) {
      await daily?.setVirtualBackground({
        sourceType: 'image',
        source: backgroundUrl,
      });
    } else {
      await daily?.setVirtualBackground(null);
    }
    setVirtualBackground(backgroundUrl);
  }, [daily]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4">
      <div className="flex items-center justify-center gap-4">
        {/* Audio Control */}
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full ${
            localParticipant.audio ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500'
          } text-white transition-colors`}
          title={localParticipant.audio ? 'Mute Audio' : 'Unmute Audio'}
        >
          {localParticipant.audio ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        {/* Video Control */}
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${
            localParticipant.video ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500'
          } text-white transition-colors`}
          title={localParticipant.video ? 'Turn Off Video' : 'Turn On Video'}
        >
          {localParticipant.video ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        {/* Screen Share */}
        <button
          onClick={toggleScreenShare}
          className={`p-3 rounded-full ${
            isSharingScreen ? 'bg-blue-500' : 'bg-gray-700 hover:bg-gray-600'
          } text-white transition-colors`}
          title={isSharingScreen ? 'Stop Screen Sharing' : 'Start Screen Sharing'}
        >
          {isSharingScreen ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
        </button>

        {/* Recording */}
        <button
          onClick={toggleRecording}
          className={`p-3 rounded-full ${
            isRecording ? 'bg-red-500' : 'bg-gray-700 hover:bg-gray-600'
          } text-white transition-colors`}
          title={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
          {isRecording ? <Square className="w-5 h-5" /> : <Record className="w-5 h-5" />}
        </button>

        {/* Virtual Background */}
        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            title="Settings"
          >
            <Background className="w-5 h-5" />
          </button>
          
          {showSettings && (
            <div className="absolute bottom-full mb-2 left-0 bg-gray-800 rounded-lg p-4 min-w-[200px]">
              <h3 className="text-white font-medium mb-2">Virtual Background</h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => applyVirtualBackground(null)}
                  className={`p-2 rounded ${
                    virtualBackground === null ? 'bg-blue-500' : 'bg-gray-700'
                  } text-white text-xs`}
                >
                  None
                </button>
                <button
                  onClick={() => applyVirtualBackground('/api/virtual-backgrounds/office.jpg')}
                  className={`p-2 rounded ${
                    virtualBackground === '/api/virtual-backgrounds/office.jpg' ? 'bg-blue-500' : 'bg-gray-700'
                  } text-white text-xs`}
                >
                  Office
                </button>
                <button
                  onClick={() => applyVirtualBackground('/api/virtual-backgrounds/nature.jpg')}
                  className={`p-2 rounded ${
                    virtualBackground === '/api/virtual-backgrounds/nature.jpg' ? 'bg-blue-500' : 'bg-gray-700'
                  } text-white text-xs`}
                >
                  Nature
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Participants */}
        <button
          onClick={() => setShowParticipants(!showParticipants)}
          className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
          title="Participants"
        >
          <Users className="w-5 h-5" />
        </button>

        {/* Leave Call */}
        <button
          onClick={leaveCall}
          className="p-3 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
          title="Leave Call"
        >
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>

      {/* Participants Panel */}
      {showParticipants && (
        <div className="absolute bottom-full mb-2 right-0 bg-gray-800 rounded-lg p-4 min-w-[250px]">
          <h3 className="text-white font-medium mb-2">Participants</h3>
          <ParticipantsList />
        </div>
      )}
    </div>
  );
};

const ParticipantsList: React.FC = () => {
  const participantIds = useParticipantIds();
  const { localParticipant } = useLocalParticipant();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-white text-sm">
        <span>You</span>
        {localParticipant.audio && <Mic className="w-3 h-3" />}
        {localParticipant.video && <Video className="w-3 h-3" />}
      </div>
      {participantIds
        .filter(id => id !== localParticipant.session_id)
        .map(id => (
          <div key={id} className="flex items-center gap-2 text-white text-sm">
            <span>Participant {id.slice(0, 8)}</span>
          </div>
        ))}
    </div>
  );
};

const VideoConferenceInner: React.FC<VideoConferenceProps> = ({ roomUrl, onLeave }) => {
  const daily = useDaily();
  const [isJoining, setIsJoining] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useDailyEvent('joined-meeting', () => {
    setIsJoining(false);
  });

  useDailyEvent('left-meeting', () => {
    onLeave?.();
  });

  useDailyEvent('error', (event) => {
    setError(event.errorMsg);
  });

  useEffect(() => {
    if (daily) {
      daily.join({ url: roomUrl });
    }
  }, [daily, roomUrl]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Connection Error</h2>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => daily?.join({ url: roomUrl })}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (isJoining) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Joining meeting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <VideoGrid />
      <VideoConferenceControls />
    </div>
  );
};

const VideoGrid: React.FC = () => {
  const participantIds = useParticipantIds();
  const { localParticipant } = useLocalParticipant();
  const [layout, setLayout] = useState<'grid' | 'speaker'>('grid');

  const remoteParticipants = participantIds.filter(id => id !== localParticipant.session_id);

  if (layout === 'speaker' && remoteParticipants.length > 0) {
    return (
      <div className="flex-1 flex gap-4 p-4">
        <div className="flex-1">
          <ParticipantVideo participantId={remoteParticipants[0]} />
        </div>
        <div className="w-64 space-y-2">
          <ParticipantVideo participantId={localParticipant.session_id} isLocal />
          {remoteParticipants.slice(1).map(id => (
            <ParticipantVideo key={id} participantId={id} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 h-full">
        <ParticipantVideo participantId={localParticipant.session_id} isLocal />
        {remoteParticipants.map(id => (
          <ParticipantVideo key={id} participantId={id} />
        ))}
      </div>
    </div>
  );
};

const VideoConference: React.FC<VideoConferenceProps> = ({ roomUrl, onLeave }) => {
  return (
    <DailyProvider>
      <VideoConferenceInner roomUrl={roomUrl} onLeave={onLeave} />
    </DailyProvider>
  );
};

export default VideoConference; 