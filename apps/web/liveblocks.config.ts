import { createClient, LiveList, LiveObject } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
});
export type Presence = {};
export type UserMeta = {
  id?: string;
  info: {
    name: string;
    avatar: string;
  };
};
export type AgendaItemData = {
  text: string;
  author: string;
};
export type ActionItemData = {
  id: string;
  text: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assigneeId?: string;
  dueDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
};
export type Storage = {
  agendaItems: LiveList<LiveObject<AgendaItemData>>;
  actionItems: LiveList<LiveObject<ActionItemData>>;
};
export const {
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useStorage,
  useOthers,
  useMutation,
  useUser,
  useHistory,
  useSelf,
} = createRoomContext<Presence, Storage, UserMeta>(client);