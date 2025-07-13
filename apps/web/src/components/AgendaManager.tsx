'use client';

import { FormEvent, useState } from 'react';
import { useStorage, useMutation, useSelf, useOthers } from '../../liveblocks.config';
import { LiveObject } from '@liveblocks/client';
import { Trash2Icon, UsersIcon, SendIcon, ListTodoIcon } from 'lucide-react';

function WhoIsHere() {
  const others = useOthers();
  const currentUser = useSelf();

  return (
    <div className="p-4 bg-gray-900/50 border border-gray-800 rounded-lg">
      <h3 className="font-semibold mb-3 flex items-center text-white">
        <UsersIcon className="w-5 h-5 mr-2 text-gray-400" />
        Who's Here
      </h3>
      <div className="flex -space-x-2 overflow-hidden h-16">
        {currentUser?.info && (
          <img
            src={currentUser.info.avatar || '/default-avatar.png'}
            onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
            title={`${currentUser.info.name} (You)`}
            className="w-16 h-16 rounded-full border-2 border-blue-400"
          />
        )}
        {others.map(({ connectionId, info }) =>
          info ? (
            <img
              key={connectionId}
              src={info.avatar || '/default-avatar.png'}
              onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
              title={info.name}
              className="w-16 h-16 rounded-full border-2 border-gray-600"
            />
          ) : null
        )}
      </div>
    </div>
  );
}

export default function AgendaManager() {
  const [newItemText, setNewItemText] = useState('');
  const agendaItems = useStorage((root) => root.agendaItems);
  const currentUser = useSelf();
  const addAgendaItem = useMutation(({ storage }, text: string) => {
    if (!currentUser?.info) return;

    const newAgendaItem = new LiveObject({
      text,
      author: currentUser.info.name,
    });
    storage.get('agendaItems').push(newAgendaItem);
  }, [currentUser]);

  const deleteAgendaItem = useMutation(({ storage }, index: number) => {
    storage.get('agendaItems').delete(index);
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    addAgendaItem(newItemText);
    setNewItemText('');
  };

  return (
    <div className="mt-10">
      <WhoIsHere />
      <h2 className="text-2xl font-bold mt-8 flex items-center">
        <ListTodoIcon className="w-6 h-6 mr-3 text-blue-400" />
        Agenda
      </h2>
      <div className="mt-4 p-4 bg-gray-900/50 border border-gray-800 rounded-lg min-h-[200px]">
        {agendaItems && agendaItems.length > 0 ? (
          <ul className="space-y-3">
            {agendaItems.map((item, index) => {
              if (!item) return null;
              return (
                <li
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-md group animate-in fade-in slide-in-from-bottom-2 duration-500"
                >
                  <div className="flex-grow">
                    <p className="text-white text-lg">{item.text}</p>
                    <p className="text-xs text-gray-400">added by {item.author}</p>
                  </div>
                  <button
                    onClick={() => deleteAgendaItem(index)}
                    className="p-2 rounded-md text-gray-500 hover:bg-red-900/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 py-10">
            <ListTodoIcon className="w-12 h-12 text-gray-600" />
            <h3 className="mt-4 text-lg font-semibold">The agenda is empty.</h3>
            <p className="mt-2">Add the first item below to get started.</p>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => setNewItemText(e.target.value)}
          placeholder="Type an agenda item and press Enter..."
          className="flex-grow p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-opacity-50 disabled:cursor-not-allowed transition-colors"
          disabled={!newItemText.trim()}
        >
          <SendIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}