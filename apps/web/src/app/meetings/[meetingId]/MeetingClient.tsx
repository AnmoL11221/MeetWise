"use client";
import { MeetingRoom } from '@/components/MeetingRoom';
import AgendaManager from '@/components/AgendaManager';
import InviteManager from '@/components/InviteManager';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

interface Meeting {
  id: string;
  title: string;
  agenda: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function MeetingClient({ meetingId }: { meetingId: string }) {
  const { getToken } = useAuth();
  const [meetingData, setMeetingData] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);

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
        <InviteManager meetingId={meetingId} />
        <AgendaManager />
      </div>
    </MeetingRoom>
  );
} 