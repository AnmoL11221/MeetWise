import { MeetingRoom } from '@/components/MeetingRoom';
import AgendaManager from '@/components/AgendaManager';
import InviteManager from '@/components/InviteManager';
import Link from 'next/link';

interface Meeting {
  id: string;
  title: string;
  agenda: string | null;
  createdAt: string;
  updatedAt: string;
}

async function getMeetingData(meetingId: string): Promise<Meeting | null> {
  try {
    const response = await fetch(`http://localhost:3000/meetings/${meetingId}`, {
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

type MeetingPageProps = {
  params: {
    meetingId: string;
  };
};

export default async function MeetingPage({ params }: MeetingPageProps) {
  const meetingId = params.meetingId;
  const meetingData = await getMeetingData(meetingId);

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