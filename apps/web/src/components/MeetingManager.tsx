'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusIcon, FileTextIcon, HourglassIcon, CalendarIcon, LockIcon, UsersIcon, GlobeIcon } from 'lucide-react';
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

export default function MeetingManager() {
  const { getToken } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    description: '',
    scheduledAt: '',
    isPrivate: true,
    roomAccess: 'INVITE_ONLY' as const,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchMeetings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:3000/meetings', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch meetings. Server responded with ${response.status}.`);
      }
      const data = await response.json();
      setMeetings(data);
    } catch (err: any) {
      console.error(err);
      setError('Could not load your meetings. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.title.trim() || isCreating) return;
    setIsCreating(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:3000/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newMeeting),
      });
      if (!response.ok) {
        throw new Error(`Failed to create meeting. Server responded with ${response.status}.`);
      }
      setNewMeeting({
        title: '',
        description: '',
        scheduledAt: '',
        isPrivate: true,
        roomAccess: 'INVITE_ONLY',
      });
      setShowCreateForm(false);
      await fetchMeetings();
    } catch (err: any) {
      console.error(err);
      setError('Failed to create the meeting. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const getAccessIcon = (roomAccess: string) => {
    switch (roomAccess) {
      case 'INVITE_ONLY':
        return <LockIcon className="w-4 h-4" />;
      case 'PUBLIC':
        return <GlobeIcon className="w-4 h-4" />;
      case 'RESTRICTED':
        return <UsersIcon className="w-4 h-4" />;
      default:
        return <LockIcon className="w-4 h-4" />;
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

  return (
    <div className="mt-8">
      <div className="mb-10 p-6 bg-gray-900/50 border border-gray-700 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-white flex items-center">
            <PlusIcon className="w-6 h-6 mr-3 text-blue-400" />
            Create a New Meeting
          </h2>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
          >
            {showCreateForm ? 'Cancel' : 'Create Meeting'}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateMeeting} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  placeholder="Enter meeting title..."
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  required
                  disabled={isCreating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Scheduled Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={newMeeting.scheduledAt}
                  onChange={(e) => setNewMeeting({ ...newMeeting, scheduledAt: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  disabled={isCreating}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={newMeeting.description}
                onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                placeholder="Describe the meeting purpose and agenda..."
                rows={3}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none"
                disabled={isCreating}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Privacy Settings
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newMeeting.isPrivate}
                      onChange={(e) => setNewMeeting({ ...newMeeting, isPrivate: e.target.checked })}
                      className="mr-2"
                      disabled={isCreating}
                    />
                    <span className="text-gray-300">Private Meeting</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Access Control
                </label>
                <select
                  value={newMeeting.roomAccess}
                  onChange={(e) => setNewMeeting({ ...newMeeting, roomAccess: e.target.value as any })}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  disabled={isCreating}
                >
                  <option value="INVITE_ONLY">Invite Only</option>
                  <option value="PUBLIC">Public</option>
                  <option value="RESTRICTED">Restricted</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                disabled={isCreating || !newMeeting.title.trim()}
              >
                {isCreating ? (
                  <>
                    <HourglassIcon className="w-4 h-4 animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <CalendarIcon className="w-4 h-4" /> Create Meeting
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition-colors"
                disabled={isCreating}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {error && <p className="mb-4 text-center text-red-400">{error}</p>}

      <div>
        <h2 className="text-2xl font-semibold text-white">Your Meetings</h2>
        {isLoading ? (
          <div className="mt-4 space-y-3 animate-pulse">
            <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg h-20"></div>
            <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg h-20"></div>
          </div>
        ) : (
          <ul className="mt-4 space-y-3">
            {meetings.length > 0 ? (
              meetings.map((meeting) => (
                <Link href={`/meetings/${meeting.id}`} key={meeting.id}>
                  <li className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg text-white hover:bg-gray-800/80 cursor-pointer transition-colors group">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-lg">{meeting.title}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            {getAccessIcon(meeting.roomAccess)}
                            <span>{getAccessLabel(meeting.roomAccess)}</span>
                          </div>
                        </div>
                        {meeting.description && (
                          <p className="text-sm text-gray-400 mb-2 line-clamp-2">{meeting.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" />
                            {formatScheduledDate(meeting.scheduledAt)}
                          </span>
                          <span>Created: {new Date(meeting.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className="text-gray-500 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </li>
                </Link>
              ))
            ) : (
              <div className="mt-8 text-center p-8 bg-gray-900/50 border-2 border-dashed border-gray-700 rounded-lg">
                <FileTextIcon className="mx-auto w-12 h-12 text-gray-600" />
                <h3 className="mt-4 text-lg font-semibold text-white">No Meetings Found</h3>
                <p className="mt-2 text-gray-400">Create your first meeting above to get started!</p>
              </div>
            )}
          </ul>
        )}
      </div>
    </div>
  );
}