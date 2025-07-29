"use client";
import { MeetingRoom } from '@/components/MeetingRoom';
import AgendaManager from '@/components/AgendaManager';
import InviteManager from '@/components/InviteManager';
import { ActionItemManager } from '@/components/ActionItemManager';
import MeetingSettings from '@/components/MeetingSettings';
import AIBriefingDossier from '@/components/AIBriefingDossier';
import SharedResources from '@/components/SharedResources';
import AISparringPartner from '@/components/AISparringPartner';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarIcon, LockIcon, UsersIcon, GlobeIcon, ClockIcon } from 'lucide-react';

interface Meeting {
  id: string;
  title: string;
  description?: string;
  scheduledAt?: string;
  isPrivate: boolean;
  roomAccess: 'INVITE_ONLY' | 'PUBLIC' | 'RESTRICTED';
  createdAt: string;
  updatedAt: string;
  creatorId: string;
}

export default function MeetingClient({ meetingId }: { meetingId: string }) {
  const { getToken, userId } = useAuth();
  const router = useRouter();
  const [meetingData, setMeetingData] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchMeeting = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3000/meetings/${meetingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch meeting details.');
      }

      const data = await response.json();
      setMeetingData(data);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, [meetingId, getToken]);

  useEffect(() => {
    if (!meetingId) return;
    fetchMeeting();
  }, [meetingId, fetchMeeting]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this meeting? This action cannot be undone.')) {
      return;
    }
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3000/meetings/${meetingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete meeting.');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setDeleteError(err.message || 'An unexpected error occurred during deletion.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getAccessIcon = (roomAccess: string) => {
    switch (roomAccess) {
      case 'INVITE_ONLY':
        return <LockIcon className="w-4 h-4 text-red-400" />;
      case 'PUBLIC':
        return <GlobeIcon className="w-4 h-4 text-green-400" />;
      case 'RESTRICTED':
        return <UsersIcon className="w-4 h-4 text-yellow-400" />;
      default:
        return null;
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
        return '';
    }
  };

  const formatScheduledDate = (scheduledAt?: string) => {
    if (!scheduledAt) return 'Not Scheduled';
    const date = new Date(scheduledAt);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeUntilMeeting = (scheduledAt?: string) => {
    if (!scheduledAt) return null;
    const now = new Date();
    const meetingTime = new Date(scheduledAt);
    const diffMs = meetingTime.getTime() - now.getTime();

    if (diffMs < 0) return 'Meeting has passed';

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} away`;
    if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} away`;
    if (diffMinutes > 0) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} away`;
    return 'Starting soon';
  };

  if (loading) {
    return (
      <div className="text-center mt-10">
        <h1 className="text-4xl font-bold text-white">Loading Meeting...</h1>
        <p className="mt-4 text-gray-400">Please wait while we fetch meeting details.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-10">
        <h1 className="text-4xl font-bold text-white">Error</h1>
        <p className="mt-4 text-red-400">{error}</p>
        <Link href="/dashboard" className="mt-6 inline-block text-blue-400 hover:text-blue-300">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  if (!meetingData) {
    return (
      <div className="text-center mt-10">
        <h1 className="text-4xl font-bold text-white">Meeting Not Found</h1>
        <p className="mt-4 text-gray-400">The meeting you are looking for does not exist.</p>
        <Link href="/dashboard" className="mt-6 inline-block text-blue-400 hover:text-blue-300">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const isCreator = userId === meetingData.creatorId;
  const timeUntil = getTimeUntilMeeting(meetingData.scheduledAt);

  return (
    <MeetingRoom roomId={meetingId}>
      <div>
        <Link href="/dashboard" className="mb-8 inline-block text-blue-400 hover:text-blue-300">
          ← Back to Dashboard
        </Link>
        
        <div className="mb-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">{meetingData.title}</h1>
          
          {meetingData.description && (
            <p className="mt-3 text-lg text-gray-300">{meetingData.description}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              <span>Created: {new Date(meetingData.createdAt).toLocaleDateString()}</span>
            </div>
            {meetingData.scheduledAt && (
              <div className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                <span>Scheduled: {formatScheduledDate(meetingData.scheduledAt)}</span>
              </div>
            )}
            {timeUntil && timeUntil !== 'Meeting has passed' && (
              <div className="flex items-center gap-1 text-blue-400">
                <ClockIcon className="w-4 h-4" />
                <span>{timeUntil}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              {getAccessIcon(meetingData.roomAccess)}
              <span>{getAccessLabel(meetingData.roomAccess)}</span>
            </div>
            {meetingData.isPrivate && (
              <div className="flex items-center gap-1">
                <LockIcon className="w-4 h-4 text-red-400" />
                <span>Private</span>
              </div>
            )}
          </div>
        </div>

        {isCreator && (
          <div className="my-6 flex gap-4">
            <MeetingSettings
              meetingId={meetingId}
              initialSettings={{
                title: meetingData.title,
                description: meetingData.description,
                scheduledAt: meetingData.scheduledAt,
                isPrivate: meetingData.isPrivate,
                roomAccess: meetingData.roomAccess,
              }}
              onSettingsUpdate={fetchMeeting}
            />
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700 transition disabled:opacity-50"
              disabled={deleteLoading}
            >
              {deleteLoading ? 'Deleting...' : 'Delete Meeting'}
            </button>
            {deleteError && <div className="text-red-400 mt-2">{deleteError}</div>}
          </div>
        )}
        
        <InviteManager meetingId={meetingId} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AIBriefingDossier meetingId={meetingId} />
          <SharedResources meetingId={meetingId} />
        </div>
        
        <AISparringPartner meetingId={meetingId} />
        
        <AgendaManager />
        <ActionItemManager meetingId={meetingId} creatorId={meetingData.creatorId} />
      </div>
    </MeetingRoom>
  );
} 