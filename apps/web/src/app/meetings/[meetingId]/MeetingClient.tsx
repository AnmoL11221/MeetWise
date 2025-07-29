"use client";
import { MeetingRoom } from '@/components/MeetingRoom';
import AgendaManager from '@/components/AgendaManager';
import InviteManager from '@/components/InviteManager';
import { ActionItemManager } from '@/components/ActionItemManager';
import MeetingSettings from '@/components/MeetingSettings';
import AIBriefingDossier from '@/components/AIBriefingDossier';
import SharedResources from '@/components/SharedResources';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
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
  const [meetingData, setMeetingData] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const router = useRouter();

  const fetchMeeting = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3000/meetings/${meetingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        setMeetingData(null);
      } else {
        setMeetingData(await response.json());
      }
    } catch (error) {
      setMeetingData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!meetingId) return;
    fetchMeeting();
  }, [meetingId]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const token = await getToken();
      const res = await fetch(`http://localhost:3000/meetings/${meetingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to delete meeting');
      }
      router.push('/dashboard');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete meeting');
    } finally {
      setDeleteLoading(false);
    }
  };

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
    return new Date(scheduledAt).toLocaleString();
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
      return `${diffDays} days, ${diffHours % 24} hours`;
    }
    if (diffHours > 0) {
      return `${diffHours} hours, ${diffMinutes} minutes`;
    }
    return `${diffMinutes} minutes`;
  };

  if (!meetingId || loading) {
    return <div className="text-center mt-10 text-gray-400">Loading meeting...</div>;
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
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              <span>Created: {new Date(meetingData.createdAt).toLocaleDateString()}</span>
            </div>
            
            {meetingData.scheduledAt && (
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4" />
                <span>Scheduled: {formatScheduledDate(meetingData.scheduledAt)}</span>
                {timeUntil && (
                  <span className="text-blue-400">({timeUntil} from now)</span>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-2">
              {getAccessIcon(meetingData.roomAccess)}
              <span>{getAccessLabel(meetingData.roomAccess)}</span>
            </div>
            
            {meetingData.isPrivate && (
              <div className="flex items-center gap-2">
                <LockIcon className="w-4 h-4 text-yellow-500" />
                <span>Private Meeting</span>
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
        
        <AgendaManager />
        <ActionItemManager meetingId={meetingId} creatorId={meetingData.creatorId} />
      </div>
    </MeetingRoom>
  );
} 