'use client';

import { ReactNode } from 'react';
import { RoomProvider } from '../../liveblocks.config';
import { ClientSideSuspense } from '@liveblocks/react';
import { LiveList, LiveObject } from '@liveblocks/client';

export function MeetingRoom({ roomId, children }: { roomId: string; children: ReactNode }) {
  return (
    <RoomProvider
      id={roomId}
      initialPresence={{}}
      initialStorage={{
        agendaItems: new LiveList<LiveObject<{ text: string; author: string }>>([]),
      }}
    >
      <ClientSideSuspense fallback={
        <div className="text-center text-gray-400 mt-10">
          Loading collaboration room...
        </div>
      }>
        {() => children}
      </ClientSideSuspense>
    </RoomProvider>
  );
}