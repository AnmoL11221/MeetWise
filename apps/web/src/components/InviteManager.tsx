'use client';
import { FormEvent, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { UserPlusIcon, HourglassIcon } from 'lucide-react';

export default function InviteManager({ meetingId }: { meetingId: string }) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { getToken } = useAuth();

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || isInviting) return;

    setIsInviting(true);
    setError(null);
    setSuccess(null);

    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3000/meetings/${meetingId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ email: inviteEmail }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Use the error message from the backend if available
        throw new Error(result.message || 'Failed to send invite.');
      }

      setSuccess(`Successfully invited ${inviteEmail}!`);
      setInviteEmail('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="mt-10 p-6 bg-gray-900/50 border border-gray-800 rounded-lg">
      <h3 className="font-semibold mb-4 flex items-center text-white">
        <UserPlusIcon className="w-5 h-5 mr-2 text-gray-400" />
        Invite an Attendee
      </h3>
      <form onSubmit={handleInvite} className="flex gap-2">
        <input
          type="email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          placeholder="Enter user's email address..."
          className="flex-grow p-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
          disabled={isInviting}
        />
        <button
          type="submit"
          className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          disabled={isInviting || !inviteEmail.trim()}
        >
          {isInviting ? (
            <>
              <HourglassIcon className="w-4 h-4 animate-spin" /> Sending...
            </>
          ) : (
            'Send Invite'
          )}
        </button>
      </form>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      {success && <p className="mt-3 text-sm text-green-400">{success}</p>}
    </div>
  );
}