import MeetingClient from './MeetingClient';

export default function MeetingPage({ params }: { params: { meetingId: string } }) {
  return <MeetingClient meetingId={params.meetingId} />;
}