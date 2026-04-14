'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PlusIcon, FileTextIcon, HourglassIcon, CalendarIcon, LockIcon, UsersIcon, GlobeIcon } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { apiUrl, getApiErrorMessage } from '@/lib/api';

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

interface MeetingTemplate {
  id: string;
  title: string;
  description?: string;
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
    recurrencePattern: '' as '' | 'DAILY' | 'WEEKLY' | 'MONTHLY',
    recurrenceInterval: 1,
    recurrenceEndDate: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [templates, setTemplates] = useState<MeetingTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [editingTemplateId, setEditingTemplateId] = useState('');
  const [editingTemplateTitle, setEditingTemplateTitle] = useState('');

  const fetchMeetings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch(apiUrl('/meetings'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Failed to fetch meetings.'));
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
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const token = await getToken();
      const response = await fetch(apiUrl('/meetings/templates'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) return;
      setTemplates(await response.json());
    } catch {
      setTemplates([]);
    }
  };

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.title.trim() || isCreating) return;
    if (newMeeting.recurrencePattern && !newMeeting.scheduledAt) {
      setError('Please set a scheduled date/time when recurrence is enabled.');
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      const token = await getToken();
      const payload = {
        title: newMeeting.title.trim(),
        isPrivate: newMeeting.isPrivate,
        roomAccess: newMeeting.roomAccess,
        ...(newMeeting.description.trim()
          ? { description: newMeeting.description.trim() }
          : {}),
        ...(newMeeting.scheduledAt
          ? { scheduledAt: new Date(newMeeting.scheduledAt).toISOString() }
          : {}),
        ...(newMeeting.recurrencePattern
          ? {
              recurrencePattern: newMeeting.recurrencePattern,
              recurrenceInterval: newMeeting.recurrenceInterval,
              ...(newMeeting.recurrenceEndDate
                ? {
                    recurrenceEndDate: new Date(
                      newMeeting.recurrenceEndDate,
                    ).toISOString(),
                  }
                : {}),
            }
          : {}),
      };
      const response = await fetch(apiUrl('/meetings'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Failed to create meeting.'));
      }
      setNewMeeting({
        title: '',
        description: '',
        scheduledAt: '',
        isPrivate: true,
        roomAccess: 'INVITE_ONLY',
        recurrencePattern: '',
        recurrenceInterval: 1,
        recurrenceEndDate: '',
      });
      setShowCreateForm(false);
      await fetchMeetings();
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to create the meeting. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!newMeeting.title.trim()) return;
    try {
      const token = await getToken();
      const response = await fetch(apiUrl('/meetings/templates'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newMeeting.title.trim(),
          description: newMeeting.description.trim() || undefined,
          isPrivate: newMeeting.isPrivate,
          roomAccess: newMeeting.roomAccess,
        }),
      });
      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Failed to save template.'));
      }
      await fetchTemplates();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save template.');
    }
  };

  const handleUseTemplate = async () => {
    if (!selectedTemplateId) return;
    try {
      const token = await getToken();
      const response = await fetch(
        apiUrl(`/meetings/templates/${selectedTemplateId}/create`),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        },
      );
      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Failed to create from template.'));
      }
      setSelectedTemplateId('');
      await fetchMeetings();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to create from template.',
      );
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      const token = await getToken();
      const response = await fetch(apiUrl(`/meetings/templates/${templateId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Failed to delete template.'));
      }
      if (selectedTemplateId === templateId) {
        setSelectedTemplateId('');
      }
      await fetchTemplates();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete template.');
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplateId || !editingTemplateTitle.trim()) return;
    try {
      const token = await getToken();
      const response = await fetch(apiUrl(`/meetings/templates/${editingTemplateId}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editingTemplateTitle.trim(),
        }),
      });
      if (!response.ok) {
        throw new Error(await getApiErrorMessage(response, 'Failed to update template.'));
      }
      setEditingTemplateId('');
      setEditingTemplateTitle('');
      await fetchTemplates();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update template.');
    }
  };

  const getRecurringPreview = () => {
    if (!newMeeting.recurrencePattern || !newMeeting.scheduledAt) return [];
    const preview: string[] = [];
    let current = new Date(newMeeting.scheduledAt);
    const interval = Math.max(1, Number(newMeeting.recurrenceInterval) || 1);
    for (let i = 0; i < 3; i++) {
      if (newMeeting.recurrencePattern === 'DAILY') {
        current.setDate(current.getDate() + interval);
      } else if (newMeeting.recurrencePattern === 'WEEKLY') {
        current.setDate(current.getDate() + interval * 7);
      } else if (newMeeting.recurrencePattern === 'MONTHLY') {
        current.setMonth(current.getMonth() + interval);
      }
      preview.push(new Date(current).toLocaleString());
    }
    return preview;
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
        {templates.length > 0 && (
          <div className="mb-4 space-y-3">
            <div className="flex gap-2">
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="flex-1 p-3 bg-gray-800 border border-gray-600 rounded-md text-white"
            >
              <option value="">Create from template...</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleUseTemplate}
              disabled={!selectedTemplateId}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:bg-opacity-50"
            >
              Create
            </button>
            </div>
            <div className="space-y-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="p-2 border border-gray-700 rounded-md flex items-center justify-between gap-2"
                >
                  {editingTemplateId === template.id ? (
                    <input
                      value={editingTemplateTitle}
                      onChange={(e) => setEditingTemplateTitle(e.target.value)}
                      className="flex-1 p-2 bg-gray-800 border border-gray-600 rounded-md text-white text-sm"
                    />
                  ) : (
                    <div className="text-sm text-gray-300">{template.title}</div>
                  )}
                  <div className="flex gap-2">
                    {editingTemplateId === template.id ? (
                      <button
                        type="button"
                        onClick={handleUpdateTemplate}
                        className="text-xs px-2 py-1 bg-blue-600 rounded text-white"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTemplateId(template.id);
                          setEditingTemplateTitle(template.title);
                        }}
                        className="text-xs px-2 py-1 bg-gray-700 rounded text-white"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-xs px-2 py-1 bg-red-700 rounded text-white"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Recurrence
                </label>
                <select
                  value={newMeeting.recurrencePattern}
                  onChange={(e) =>
                    setNewMeeting({
                      ...newMeeting,
                      recurrencePattern: e.target.value as any,
                    })
                  }
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white"
                  disabled={isCreating}
                >
                  <option value="">None</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Every
                </label>
                <input
                  type="number"
                  min={1}
                  value={newMeeting.recurrenceInterval}
                  onChange={(e) =>
                    setNewMeeting({
                      ...newMeeting,
                      recurrenceInterval: Math.max(1, Number(e.target.value) || 1),
                    })
                  }
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white"
                  disabled={isCreating || !newMeeting.recurrencePattern}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End date
                </label>
                <input
                  type="datetime-local"
                  value={newMeeting.recurrenceEndDate}
                  onChange={(e) =>
                    setNewMeeting({
                      ...newMeeting,
                      recurrenceEndDate: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white"
                  disabled={isCreating || !newMeeting.recurrencePattern}
                />
              </div>
            </div>
            {newMeeting.recurrencePattern && (
              <div className="p-3 bg-gray-800/60 border border-gray-700 rounded-md">
                <p className="text-sm text-gray-300 font-medium mb-1">
                  Recurrence preview (next 3):
                </p>
                <ul className="text-xs text-gray-400 space-y-1">
                  {getRecurringPreview().length > 0 ? (
                    getRecurringPreview().map((value, idx) => (
                      <li key={idx}>- {value}</li>
                    ))
                  ) : (
                    <li>- Set a scheduled date/time to preview recurrence.</li>
                  )}
                </ul>
              </div>
            )}

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
                onClick={handleSaveTemplate}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 transition-colors"
                disabled={isCreating || !newMeeting.title.trim()}
              >
                Save Template
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