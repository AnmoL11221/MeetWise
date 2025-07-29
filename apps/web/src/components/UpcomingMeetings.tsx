'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CalendarIcon, ClockIcon, LockIcon, UsersIcon, GlobeIcon, ChevronRightIcon } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';

interface Meeting {
  id: string;
  title: string;
  description?: string;
  scheduledAt?: string;
  isPrivate: boolean;
  roomAccess: 'INVITE_ONLY' | 'PUBLIC' | 'RESTRICTED';
  createdAt: string;
  updatedAt: string;
}

export default function UpcomingMeetings() {
  const { getToken } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUpcomingMeetings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const response = await fetch('http://localhost:3000/meetings/upcoming?limit=3', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch upcoming meetings. Server responded with ${response.status}.`);
        }
        const data = await response.json();
        setMeetings(data);
      } catch (err: any) {
        console.error(err);
        setError('Could not load upcoming meetings.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpcomingMeetings();
  }, [getToken]);

  const getAccessIcon = (roomAccess: string) => {
    switch (roomAccess) {
      case 'INVITE_ONLY':
        return <LockIcon className="w-4 h-4 text-yellow-500" />;
      case 'PUBLIC':
        return <GlobeIcon className="w-4 h-4 text-green-500" />;
      case 'RESTRICTED':
        return <UsersIcon className="w-4 h-4 text-blue-500" />;
      default:
        return <LockIcon className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getAccessLabel = (roomAccess: string) => {
    switch (roomAccess) {
      case 'INVITE_ONLY':
        return 'Invite Only';
      case 'PUBLIC':
        return 'Public';
      case 'RESTRICTED':
        return 'Restricted';
      default:
        return 'Invite Only';
    }
  };

  const formatScheduledDate = (scheduledAt?: string) => {
    if (!scheduledAt) return 'Not scheduled';
    const date = new Date(scheduledAt);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Past due';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    
    return date.toLocaleDateString();
  };

  const getTimeUntilMeeting = (scheduledAt?: string) => {
    if (!scheduledAt) return null;
    const date = new Date(scheduledAt);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    
    if (diffTime < 0) return null;
    
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 24) {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ${diffHours % 24}h`;
    }
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  if (isLoading) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <CalendarIcon className="w-5 h-5 mr-2 text-blue-400" />
          Upcoming Meetings
        </h3>
        <div className="space-y-3 animate-pulse">
          <div className="h-16 bg-gray-800 rounded-lg"></div>
          <div className="h-16 bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
          <CalendarIcon className="w-5 h-5 mr-2 text-blue-400" />
          Upcoming Meetings
        </h3>
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <CalendarIcon className="w-5 h-5 mr-2 text-blue-400" />
          Upcoming Meetings
        </h3>
        <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 text-sm">
          View All
        </Link>
      </div>

      {meetings.length > 0 ? (
        <div className="space-y-3">
          {meetings.map((meeting) => {
            const timeUntil = getTimeUntilMeeting(meeting.scheduledAt);
            return (
              <Link href={`/meetings/${meeting.id}`} key={meeting.id}>
                <div className="p-4 bg-gray-800/50 border border-gray-600 rounded-lg hover:bg-gray-700/50 transition-colors group cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-white truncate">{meeting.title}</h4>
                        <div className="flex items-center gap-1 text-xs">
                          {getAccessIcon(meeting.roomAccess)}
                          <span className="text-gray-400">{getAccessLabel(meeting.roomAccess)}</span>
                        </div>
                      </div>
                      
                      {meeting.description && (
                        <p className="text-sm text-gray-400 mb-2 line-clamp-1">{meeting.description}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3 h-3" />
                          {formatScheduledDate(meeting.scheduledAt)}
                        </span>
                        {timeUntil && (
                          <span className="flex items-center gap-1 text-blue-400">
                            <ClockIcon className="w-3 h-3" />
                            {timeUntil}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRightIcon className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <CalendarIcon className="mx-auto w-8 h-8 text-gray-600 mb-2" />
          <p className="text-gray-400 text-sm">No upcoming meetings</p>
          <p className="text-gray-500 text-xs mt-1">Create a meeting to get started</p>
        </div>
      )}
    </div>
  );
}