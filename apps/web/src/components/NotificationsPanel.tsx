'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { BellIcon } from 'lucide-react';
import { apiUrl } from '@/lib/api';

interface Notification {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPanel() {
  const { getToken } = useAuth();
  const [items, setItems] = useState<Notification[]>([]);

  const load = async () => {
    const token = await getToken();
    const res = await fetch(apiUrl('/notifications'), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return;
    setItems(await res.json());
  };

  const markRead = async (id: string) => {
    const token = await getToken();
    await fetch(apiUrl(`/notifications/${id}/read`), {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    await load();
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <BellIcon className="w-5 h-5 text-blue-400" />
        Notifications
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-gray-400">No notifications yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`p-3 border rounded-md ${item.isRead ? 'border-gray-700' : 'border-blue-500/50'}`}
            >
              <p className="text-sm text-white font-medium">{item.title}</p>
              <p className="text-xs text-gray-400 mt-1">{item.body}</p>
              <div className="flex justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
                {!item.isRead && (
                  <button
                    className="text-xs text-blue-400 hover:text-blue-300"
                    onClick={() => markRead(item.id)}
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
