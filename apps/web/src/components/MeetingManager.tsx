'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusIcon, FileTextIcon, HourglassIcon } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
interface Meeting {
  id: string;
  title: string;
  agenda: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function MeetingManager() {
  const { getToken } = useAuth();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!newMeetingTitle.trim() || isCreating) return;
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
        body: JSON.stringify({ title: newMeetingTitle }),
      });
      if (!response.ok) {
        throw new Error(`Failed to create meeting. Server responded with ${response.status}.`);
      }
      setNewMeetingTitle('');
      await fetchMeetings();
    } catch (err: any) {
      console.error(err);
      setError('Failed to create the meeting. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="mt-8">
      <div className="mb-10 p-6 bg-gray-900/50 border border-gray-700 rounded-lg shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-white flex items-center">
          <PlusIcon className="w-6 h-6 mr-3 text-blue-400" />
          Create a New Meeting
        </h2>
        <form onSubmit={handleCreateMeeting} className="flex gap-4">
          <input
            type="text"
            value={newMeetingTitle}
            onChange={(e) => setNewMeetingTitle(e.target.value)}
            placeholder="Enter meeting title..."
            className="flex-grow p-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            required
            disabled={isCreating}
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
            disabled={isCreating || !newMeetingTitle.trim()}
          >
            {isCreating ? (
              <>
                <HourglassIcon className="w-4 h-4 animate-spin" /> Creating...
              </>
            ) : (
              'Create'
            )}
          </button>
        </form>
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
                      <div>
                        <p className="font-semibold text-lg">{meeting.title}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          Created: {new Date(meeting.createdAt).toLocaleDateString()}
                        </p>
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