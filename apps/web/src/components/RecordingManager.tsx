'use client';

import React, { useState, useEffect } from 'react';
import { Download, Play, Trash2, Calendar, Clock, FileVideo } from 'lucide-react';

interface Recording {
  id: string;
  room_name: string;
  duration: number;
  created_at: string;
  download_url: string;
  status: 'ready' | 'processing' | 'failed';
}

interface RecordingManagerProps {
  meetingId: string;
}

const RecordingManager: React.FC<RecordingManagerProps> = ({ meetingId }) => {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecordings();
  }, [meetingId]);

  const fetchRecordings = async () => {
    try {
      const response = await fetch(`/api/daily/recordings?room=${meetingId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch recordings');
      }
      const data = await response.json();
      setRecordings(data.recordings || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (recordingId: string) => {
    try {
      const response = await fetch(`/api/daily/recordings?id=${recordingId}`);
      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }
      const { downloadUrl } = await response.json();
      
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `meeting-recording-${recordingId}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      console.error('Error downloading recording:', err);
      alert('Failed to download recording. Please try again.');
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'text-green-400';
      case 'processing':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready':
        return 'Ready';
      case 'processing':
        return 'Processing';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-400 mb-2">{error}</p>
        <button
          onClick={fetchRecordings}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Meeting Recordings</h3>
        <button
          onClick={fetchRecordings}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          Refresh
        </button>
      </div>

      {recordings.length === 0 ? (
        <div className="text-center py-8">
          <FileVideo className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No recordings found for this meeting.</p>
          <p className="text-sm text-gray-500 mt-2">
            Recordings will appear here after the meeting is recorded.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recordings.map((recording) => (
            <div
              key={recording.id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileVideo className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-medium">
                      Recording {recording.id.slice(0, 8)}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(recording.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{formatDuration(recording.duration)}</span>
                      </div>
                      <span className={getStatusColor(recording.status)}>
                        {getStatusText(recording.status)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {recording.status === 'ready' && (
                    <>
                      <button
                        onClick={() => handleDownload(recording.id)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors"
                        title="Download Recording"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => window.open(recording.download_url, '_blank')}
                        className="p-2 text-green-400 hover:text-green-300 hover:bg-green-400/10 rounded transition-colors"
                        title="Play Recording"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
        <h4 className="text-sm font-medium text-white mb-2">Recording Information</h4>
        <ul className="text-xs text-gray-400 space-y-1">
          <li>• Recordings are automatically saved when you start recording</li>
          <li>• Processing may take a few minutes after the meeting ends</li>
          <li>• Recordings are available for 30 days</li>
          <li>• You can download recordings in MP4 format</li>
        </ul>
      </div>
    </div>
  );
};

export default RecordingManager; 