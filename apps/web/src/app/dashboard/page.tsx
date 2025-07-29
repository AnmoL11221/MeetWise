import { currentUser } from '@clerk/nextjs/server';
import MeetingManager from '@/components/MeetingManager';
import UpcomingMeetings from '@/components/UpcomingMeetings';

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Welcome, {user.firstName || 'User'}!
        </h1>
        <p className="mt-2 text-lg text-gray-400">
          Here are your upcoming meetings and dedicated spaces.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MeetingManager />
        </div>
        <div>
          <UpcomingMeetings />
        </div>
      </div>
    </div>
  );
}