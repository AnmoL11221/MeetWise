import MeetingClient from './MeetingClient';

export default async function MeetingPage({ params }: { params: Promise<{ meetingId: string }> }) {
  const { meetingId } = await params;
  return <MeetingClient meetingId={meetingId} />;
}