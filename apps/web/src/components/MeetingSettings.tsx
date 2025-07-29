'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { SettingsIcon, LockIcon, UsersIcon, GlobeIcon, CalendarIcon, SaveIcon, XIcon } from 'lucide-react';

interface MeetingSettingsProps {
  meetingId: string;
  initialSettings: {
    title: string;
    description?: string;
    scheduledAt?: string;
    isPrivate: boolean;
    roomAccess: 'INVITE_ONLY' | 'PUBLIC' | 'RESTRICTED';
  };
  onSettingsUpdate?: () => void;
}

export default function MeetingSettings({ meetingId, initialSettings, onSettingsUpdate }: MeetingSettingsProps) {
  const { getToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [settings, setSettings] = useState(initialSettings);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3000/meetings/${meetingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: settings.title,
          description: settings.description,
          scheduledAt: settings.scheduledAt,
          isPrivate: settings.isPrivate,
          roomAccess: settings.roomAccess,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to update meeting settings');
      }

      setSuccess('Meeting settings updated successfully!');
      onSettingsUpdate?.();
      
      // Close modal after a short delay
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update meeting settings');
    } finally {
      setIsLoading(false);
    }
  };

  const getAccessDescription = (roomAccess: string) => {
    switch (roomAccess) {
      case 'INVITE_ONLY':
        return 'Only invited users can join this meeting';
      case 'PUBLIC':
        return 'Anyone with the link can join this meeting';
      case 'RESTRICTED':
        return 'Only the creator can invite users to this meeting';
      default:
        return '';
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-gray-700 text-white font-semibold rounded hover:bg-gray-600 transition-colors flex items-center gap-2"
      >
        <SettingsIcon className="w-4 h-4" />
        Settings
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                Meeting Settings
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Meeting Title *
                    </label>
                    <input
                      type="text"
                      value={settings.title}
                      onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={settings.description || ''}
                      onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                      rows={3}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none"
                      placeholder="Describe the meeting purpose and agenda..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Scheduled Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={settings.scheduledAt || ''}
                      onChange={(e) => setSettings({ ...settings, scheduledAt: e.target.value })}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    />
                  </div>
                </div>
              </div>

              {/* Privacy Settings */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <LockIcon className="w-5 h-5" />
                  Privacy & Access Control
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={settings.isPrivate}
                        onChange={(e) => setSettings({ ...settings, isPrivate: e.target.checked })}
                        className="mr-3"
                      />
                      <span className="text-gray-300">Private Meeting</span>
                    </label>
                    <p className="text-sm text-gray-500 mt-1 ml-6">
                      Private meetings are only visible to invited participants
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Access Control
                    </label>
                    <select
                      value={settings.roomAccess}
                      onChange={(e) => setSettings({ ...settings, roomAccess: e.target.value as any })}
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    >
                      <option value="INVITE_ONLY">Invite Only</option>
                      <option value="PUBLIC">Public</option>
                      <option value="RESTRICTED">Restricted</option>
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                      {getAccessDescription(settings.roomAccess)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Error and Success Messages */}
              {error && (
                <div className="p-3 bg-red-900/50 border border-red-700 rounded-md">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-900/50 border border-green-700 rounded-md">
                  <p className="text-green-400 text-sm">{success}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={handleSave}
                  disabled={isLoading || !settings.title.trim()}
                  className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <SaveIcon className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition-colors"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}