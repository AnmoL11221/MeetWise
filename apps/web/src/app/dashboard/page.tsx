import { currentUser } from '@clerk/nextjs/server';
import MeetingManager from '@/components/MeetingManager';

export default async function DashboardPage() {
  const user = await currentUser();
  if (!user) {
    return <div>Redirecting...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">
        Welcome, {user.firstName || 'User'}!
      </h1>
      <p className="mt-2 text-lg text-gray-600">
        Here are your upcoming meetings and action items.
      </p>

      <MeetingManager />
    </div>
  );
}