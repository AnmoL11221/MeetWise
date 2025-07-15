"use client";
import { MeetingRoom } from '@/components/MeetingRoom';
import AgendaManager from '@/components/AgendaManager';
import InviteManager from '@/components/InviteManager';
import { ActionItemManager } from '@/components/ActionItemManager';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Meeting {
  id: string;
  title: string;
  agenda: string | null;
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

  useEffect(() => {
    if (!meetingId) return;
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
    fetchMeeting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <MeetingRoom roomId={meetingId}>
      <div>
        <Link href="/dashboard" className="mb-8 inline-block text-blue-400 hover:text-blue-300">
          ← Back to Dashboard
        </Link>
        <h1 className="text-4xl font-extrabold tracking-tight">{meetingData.title}</h1>
        <p className="mt-2 text-sm text-gray-400">
          Created on: {new Date(meetingData.createdAt).toLocaleString()}
        </p>
        {isCreator && (
          <div className="my-4">
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
        <AgendaManager />
        <ActionItemManager meetingId={meetingId} creatorId={meetingData.creatorId} />
      </div>
    </MeetingRoom>
  );
} 