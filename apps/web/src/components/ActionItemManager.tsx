import React, { useEffect, useState, useCallback } from 'react';
import { useStorage, useMutation } from '../../liveblocks.config';
import { useStatus } from '@liveblocks/react';
import { LiveObject } from '@liveblocks/client';
import { CheckCircleIcon, PencilIcon, Trash2Icon, Loader2Icon, UserIcon } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface ActionItemData {
  id: string;
  text: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assigneeId?: string;
  dueDate?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface Attendee {
  id: string;
  name?: string;
  email?: string;
}

interface ActionItemManagerProps {
  meetingId: string;
  creatorId: string;
}

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do', color: 'bg-gray-500' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'bg-yellow-500' },
  { value: 'DONE', label: 'Done', color: 'bg-green-600' },
];

export const ActionItemManager: React.FC<ActionItemManagerProps> = ({ meetingId, creatorId }) => {
  const actionItems = useStorage((root) => root.actionItems);
  const status = useStatus();
  const isConnected = status === 'connected';
  const storageReady = Array.isArray(actionItems);
  console.log('actionItems', actionItems, 'isConnected', isConnected);
  const { getToken, userId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newItem, setNewItem] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [newStatus, setNewStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editFields, setEditFields] = useState<Partial<ActionItemData>>({});
  const [editStatus, setEditStatus] = useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');
  const [editAssignee, setEditAssignee] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'TODO' | 'IN_PROGRESS' | 'DONE'>('ALL');
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [optimisticLoading, setOptimisticLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');

  // Add state for which column is adding a task
  const [addingColumn, setAddingColumn] = useState<null | 'TODO' | 'IN_PROGRESS' | 'DONE'>(null);
  const [addTaskFields, setAddTaskFields] = useState({ text: '', dueDate: '', assigneeId: '', priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' });

  const isCreator = userId === creatorId;

  // Fetch attendees
  useEffect(() => {
    const fetchAttendees = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`http://localhost:3000/meetings/${meetingId}/attendees`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch attendees');
        const data = await res.json();
        setAttendees(data);
      } catch {
        setAttendees([]);
      }
    };
    fetchAttendees();
  }, [meetingId, getToken]);

  // Mutation to hydrate action items from backend
  const hydrateActionItems = useMutation(
    (ctx, items: ActionItemData[]) => {
      const liveList = ctx.storage.get('actionItems');
      for (let i = liveList.length - 1; i >= 0; i--) {
        liveList.delete(i);
      }
      items.forEach((item) => {
        liveList.push(
          new LiveObject({
            id: item.id,
            text: item.description || item.text,
            status: item.status,
            assigneeId: item.assigneeId,
            dueDate: item.dueDate,
            priority: ensurePriority(item.priority),
          })
        );
      });
    },
    []
  );

  // Fetch existing action items from backend on mount
  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const res = await fetch(`http://localhost:3000/action-items/meeting/${meetingId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch action items');
        const items: ActionItemData[] = await res.json();
        hydrateActionItems(items);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId, getToken]);

  // Mutation to add a new action item
  const addActionItem = useMutation(
    async (ctx, { text, dueDate, assigneeId, status, priority }: { text: string; dueDate?: string; assigneeId?: string; status: 'TODO' | 'IN_PROGRESS' | 'DONE'; priority: 'LOW' | 'MEDIUM' | 'HIGH' }) => {
      setOptimisticLoading(true);
      const token = await getToken();
      if (!token) {
        setError('You must be signed in to add action items.');
        setOptimisticLoading(false);
        return;
      }
      const payload: any = {
        description: text,
        meetingId,
        status,
        priority,
      };
      if (dueDate) payload.dueDate = new Date(dueDate).toISOString();
      if (assigneeId) payload.assigneeId = assigneeId;
      try {
        const res = await fetch('http://localhost:3000/action-items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create action item');
        const item: any = await res.json();
        console.log('Created action item from backend:', item); // <-- debug log
        // Fallback logic for new item fields
        const newItem: ActionItemData = {
          id: item.id,
          text: item.description || item.text || text,
          status: item.status || status || 'TODO',
          assigneeId: item.assigneeId || assigneeId,
          dueDate: item.dueDate || dueDate,
          priority: ensurePriority(item.priority || priority),
        };
        console.log('Pushing new item to Liveblocks:', newItem); // <-- debug log
        ctx.storage.get('actionItems').push(new LiveObject(newItem as any));
        setSuccess('Action item added!');
        setTimeout(() => setSuccess(null), 1500);
        // Log the updated actionItems array
        setTimeout(() => {
          const updated = ctx.storage.get('actionItems').toArray();
          console.log('Updated actionItems after add:', updated);
        }, 500);
      } catch (err: any) {
        setError(err.message || 'Failed to add action item');
      } finally {
        setOptimisticLoading(false);
      }
    },
    [meetingId, getToken]
  );

  // Mutation to update status
  const updateStatus = useMutation(
    async (ctx, { index, id, newStatus }: { index: number; id: string; newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE' }) => {
      setOptimisticLoading(true);
      const token = await getToken();
      const res = await fetch(`http://localhost:3000/action-items/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const item = ctx.storage.get('actionItems').get(index);
      if (item) item.set('status', newStatus);
      setOptimisticLoading(false);
      setSuccess('Status updated!');
      setTimeout(() => setSuccess(null), 1500);
    },
    [getToken]
  );

  // Mutation to delete action item
  const deleteActionItem = useMutation(
    async (ctx, { index, id }: { index: number; id: string }) => {
      if (!storageReady || !isConnected) {
        setError('Action items storage is not ready. Please wait for initial load.');
        setOptimisticLoading(false);
        return;
      }
      setOptimisticLoading(true);
      const token = await getToken();
      const res = await fetch(`http://localhost:3000/action-items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (res.status === 404) {
        ctx.storage.get('actionItems').delete(index);
        setWarning('Action item not found in backend. Removed from UI.');
        setOptimisticLoading(false);
        setTimeout(() => setWarning(null), 2000);
        return;
      }
      if (!res.ok) {
        setOptimisticLoading(false);
        throw new Error('Failed to delete action item');
      }
      ctx.storage.get('actionItems').delete(index);
      setOptimisticLoading(false);
      setSuccess('Action item deleted!');
      setTimeout(() => setSuccess(null), 1500);
    },
    [getToken, storageReady, isConnected]
  );

  // Mutation to edit action item
  const editActionItem = useMutation(
    async (
      ctx,
      { index, id, text, dueDate, assigneeId, status, priority }: { index: number; id: string; text: string; dueDate?: string; assigneeId?: string; status: 'TODO' | 'IN_PROGRESS' | 'DONE'; priority: 'LOW' | 'MEDIUM' | 'HIGH' }
    ) => {
      setOptimisticLoading(true);
      const token = await getToken();
      const res = await fetch(`http://localhost:3000/action-items/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          description: text,
          dueDate: dueDate ? new Date(dueDate).toISOString() : null,
          assigneeId: assigneeId || null,
          status,
          priority,
        }),
      });
      if (!res.ok) throw new Error('Failed to update action item');
      const item = ctx.storage.get('actionItems').get(index);
      if (item) {
        item.set('text', text);
        item.set('dueDate', dueDate || undefined);
        item.set('assigneeId', assigneeId || undefined);
        item.set('status', status);
        item.set('priority', priority);
      }
      setOptimisticLoading(false);
      setSuccess('Action item updated!');
      setTimeout(() => setSuccess(null), 1500);
    },
    [getToken]
  );

  // Add a mutation to clear all action items
  const clearActionItems = useMutation((ctx) => {
    const liveList = ctx.storage.get('actionItems');
    for (let i = liveList.length - 1; i >= 0; i--) {
      liveList.delete(i);
    }
  }, []);

  // Add a handler to reset and re-hydrate
  const handleReset = useCallback(async () => {
    clearActionItems();
    setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const token = await getToken();
        const res = await fetch(`http://localhost:3000/action-items/meeting/${meetingId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error('Failed to fetch action items');
        const items: ActionItemData[] = await res.json();
        hydrateActionItems(items);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }, 100); // Give Liveblocks a moment to process clear
  }, [clearActionItems, hydrateActionItems, getToken, meetingId]);

  // Filtering
  const filteredItems =
    filterStatus === 'ALL'
      ? (actionItems || [])
      : (actionItems || []).filter((item) => item.status === filterStatus);

  // Helper to ensure priority is always set
  const ensurePriority = (priority: any): 'LOW' | 'MEDIUM' | 'HIGH' => {
    if (priority === 'LOW' || priority === 'MEDIUM' || priority === 'HIGH') return priority;
    return 'MEDIUM';
  };

  // Kanban columns
  const columns: { key: keyof typeof itemsByStatus; label: string; color: string }[] = [
    { key: 'TODO', label: 'To do', color: 'border-blue-500' },
    { key: 'IN_PROGRESS', label: 'In Progress', color: 'border-yellow-500' },
    { key: 'DONE', label: 'Done', color: 'border-green-500' },
  ];
  const itemsByStatus = {
    TODO: (actionItems || []).filter((item: any) => ensurePriority(item.priority) && item.status === 'TODO') as ActionItemData[],
    IN_PROGRESS: (actionItems || []).filter((item: any) => ensurePriority(item.priority) && item.status === 'IN_PROGRESS') as ActionItemData[],
    DONE: (actionItems || []).filter((item: any) => ensurePriority(item.priority) && item.status === 'DONE') as ActionItemData[],
  };

  // Handlers for editing
  const startEdit = (idx: number, item: ActionItemData) => {
    setEditingIndex(idx);
    setEditFields({
      text: item.text,
      dueDate: item.dueDate,
      assigneeId: item.assigneeId,
      priority: item.priority,
    });
    setEditStatus(item.status);
    setEditAssignee(item.assigneeId || '');
    setEditDueDate(item.dueDate || '');
  };
  const cancelEdit = () => {
    setEditingIndex(null);
    setEditFields({});
    setEditStatus('TODO');
    setEditAssignee('');
    setEditDueDate('');
  };
  const handleEditChange = (field: keyof ActionItemData, value: string) => {
    setEditFields((prev) => ({ ...prev, [field]: value }));
  };
  const saveEdit = async (idx: number, id: string) => {
    try {
      await editActionItem({
        index: idx,
        id,
        text: editFields.text || '',
        dueDate: editDueDate,
        assigneeId: editAssignee,
        status: editStatus,
        priority: editFields.priority || 'MEDIUM',
      });
      setEditingIndex(null);
      setEditFields({});
      setEditStatus('TODO');
      setEditAssignee('');
      setEditDueDate('');
    } catch (err: any) {
      setError(err.message || 'Failed to edit action item');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    if (!storageReady) {
      setError('Action items storage is not ready. Please wait for initial load.');
      return;
    }
    try {
      await addActionItem({ text: newItem, dueDate, assigneeId, status: newStatus, priority: newPriority });
      setNewItem('');
      setDueDate('');
      setAssigneeId('');
      setNewStatus('TODO');
      setNewPriority('MEDIUM');
    } catch (err: any) {
      setError(err.message || 'Failed to add action item');
    }
  };

  // Handler for add task form submit
  const handleAddTask = async (status: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    if (!addTaskFields.text.trim()) return;
    await addActionItem({
      text: addTaskFields.text,
      dueDate: addTaskFields.dueDate,
      assigneeId: addTaskFields.assigneeId,
      status,
      priority: addTaskFields.priority,
    });
    setAddTaskFields({ text: '', dueDate: '', assigneeId: '', priority: 'MEDIUM' });
    setAddingColumn(null);
  };

  // Helper to get attendee display
  const getAssigneeDisplay = (id?: string) => {
    if (!id) return null;
    const user = attendees.find((a) => a.id === id);
    if (!user) return id;
    return (
      <span className="inline-flex items-center gap-1">
        <UserIcon className="w-4 h-4 inline-block text-blue-400" />
        {user.name || user.email || user.id}
      </span>
    );
  };

  // Helper for status badge
  const getStatusBadge = (status: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    const opt = STATUS_OPTIONS.find((o) => o.value === status);
    return (
      <span className={`ml-2 text-xs px-2 py-1 rounded ${opt?.color || 'bg-gray-500'} text-white font-semibold flex items-center gap-1`}>
        {opt?.label || status}
        <CheckCircleIcon className={`w-3 h-3 ${opt?.color === 'bg-green-600' ? 'text-green-400' : opt?.color === 'bg-yellow-500' ? 'text-yellow-400' : 'text-gray-400'}`} />
      </span>
    );
  };

  // Show priority badge on each card
  const getPriorityBadge = (priority: 'LOW' | 'MEDIUM' | 'HIGH') => {
    const color =
      priority === 'HIGH' ? 'bg-red-600 text-white' :
      priority === 'MEDIUM' ? 'bg-yellow-500 text-zinc-900' :
      'bg-green-600 text-white';
    const label =
      priority === 'HIGH' ? 'High' :
      priority === 'MEDIUM' ? 'Medium' :
      'Low';
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${color} ml-2`}>
        {label} Priority
      </span>
    );
  };

  // Add a timeout for storage loading error
  const [storageTimeout, setStorageTimeout] = useState(false);
  useEffect(() => {
    if (!storageReady || !isConnected) {
      const timer = setTimeout(() => setStorageTimeout(true), 8000);
      return () => clearTimeout(timer);
    } else {
      setStorageTimeout(false);
    }
  }, [storageReady, isConnected]);

  // Add debug logging for Liveblocks connection and storage state
  useEffect(() => {
    console.log('[DEBUG] isConnected:', isConnected, 'storageReady:', storageReady, 'actionItems:', actionItems, 'userId:', userId);
  }, [isConnected, storageReady, actionItems, userId]);

  // Clear error state as soon as storage is ready
  useEffect(() => {
    if (storageReady && isConnected && error) {
      setError(null);
    }
  }, [storageReady, isConnected]);

  // Drag-and-drop handler
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;
    const sourceStatus = source.droppableId as 'TODO' | 'IN_PROGRESS' | 'DONE';
    const destStatus = destination.droppableId as 'TODO' | 'IN_PROGRESS' | 'DONE';
    if (!actionItems) return;
    // Find the item being moved
    const item = actionItems.find((ai: ActionItemData) => ai.id === draggableId);
    if (!item) return;
    // If status changed, update it
    if (sourceStatus !== destStatus) {
      await updateStatus({
        index: actionItems.findIndex((ai: ActionItemData) => ai.id === draggableId),
        id: draggableId,
        newStatus: destStatus,
      });
    }
    // Reorder within the same column (optional, for now just update status)
  };

  if (!storageReady || !isConnected) {
    return (
      <div className="rounded-2xl bg-zinc-900/80 shadow-2xl p-6 md:p-8 w-full flex flex-col items-center justify-center min-h-[300px]">
        <div className="flex items-center gap-2 text-blue-400 mb-2">
          <Loader2Icon className="animate-spin w-6 h-6" />
          <span className="font-semibold text-base">Connecting to collaboration service...</span>
        </div>
        <div className="text-zinc-400 text-sm">Please wait while we connect you to the real-time workspace.</div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-2xl p-6 md:p-8 w-full max-w-7xl mx-auto my-12 min-h-[500px] flex flex-col" style={{ boxSizing: 'border-box' }}>
      <div className="flex items-center gap-4 mb-4">
        <CheckCircleIcon className="w-8 h-8 text-green-400" />
        <h2 className="text-2xl font-extrabold text-white tracking-tight relative">
          Action Items
          <span className="block h-1 w-20 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-400 rounded-full mt-1 absolute left-0 -bottom-2 opacity-70 animate-pulse" />
        </h2>
      </div>
      <div className="mb-4 flex items-center gap-3 justify-between">
        <button
          type="button"
          className="px-2 py-1 rounded text-xs font-semibold bg-gray-700 text-white hover:bg-gray-600 transition-colors border border-gray-600"
          onClick={handleReset}
          disabled={loading || optimisticLoading}
          aria-label="Reset Action Items"
        >
          Reset
        </button>
      </div>
      {warning && <div className="text-yellow-400 mb-2">{warning}</div>}
      {!storageReady || !isConnected ? (
        storageTimeout ? (
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <span className="text-red-400 font-semibold mb-2">Unable to load action items. Please refresh or check your connection.</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[200px]">
            <Loader2Icon className="animate-spin w-8 h-8 text-blue-400 mb-2" />
            <span className="text-blue-300 font-semibold">Connecting to collaboration service...</span>
            <span className="text-zinc-400 text-sm mt-1">Please wait while we connect you to the real-time workspace.</span>
          </div>
        )
      ) : (!storageReady || !isConnected) && error ? (
        <div className="text-red-400">{error}</div>
      ) : (
        <>
          {success && <div className="text-green-400 mb-2">{success}</div>}
          {optimisticLoading && <div className="text-blue-400 mb-2 flex items-center gap-2"><Loader2Icon className="animate-spin w-4 h-4" /> Saving...</div>}
          <div className="flex flex-col gap-8 mt-10">
            {/* Kanban Board with DragDropContext */}
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="flex gap-6 pb-2 w-full overflow-x-auto md:overflow-x-visible" style={{ minHeight: '420px', maxWidth: '100%' }}>
                {columns.map((col) => (
                  <Droppable droppableId={col.key} key={col.key}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`rounded-xl bg-zinc-900 border border-zinc-800 shadow-md p-6 flex flex-col min-h-[340px] min-w-[320px] max-w-[350px] w-full flex-shrink-0 justify-start items-center transition-all ${snapshot.isDraggingOver ? 'ring-2 ring-blue-400' : ''}`}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <span className="font-bold text-base text-white">{col.label}</span>
                          <span className="bg-zinc-800 text-xs text-zinc-300 rounded-full px-2 py-0.5 ml-1">{itemsByStatus[col.key].length}</span>
                        </div>
                        {/* Add Task Input at the top */}
                        {addingColumn === col.key ? (
                          <form
                            onSubmit={e => { e.preventDefault(); handleAddTask(col.key as 'TODO' | 'IN_PROGRESS' | 'DONE'); }}
                            className="mb-4 w-full flex flex-col gap-3 bg-zinc-950 border border-zinc-800 rounded-lg p-4 shadow"
                            autoComplete="off"
                          >
                            <input
                              type="text"
                              className="bg-zinc-900 text-white rounded px-3 py-2 text-sm border border-zinc-800 focus:ring-2 focus:ring-blue-500 w-full"
                              placeholder="Task name..."
                              value={addTaskFields.text}
                              onChange={e => setAddTaskFields(f => ({ ...f, text: e.target.value }))}
                              required
                              autoFocus
                            />
                            <input
                              type="date"
                              className="bg-zinc-900 text-white rounded px-3 py-2 text-xs border border-zinc-800 focus:ring-2 focus:ring-blue-500 w-full"
                              value={addTaskFields.dueDate}
                              onChange={e => setAddTaskFields(f => ({ ...f, dueDate: e.target.value }))}
                            />
                            <select
                              className="bg-zinc-900 text-white rounded px-3 py-2 text-xs border border-zinc-800 focus:ring-2 focus:ring-blue-500 w-full"
                              value={addTaskFields.assigneeId}
                              onChange={e => setAddTaskFields(f => ({ ...f, assigneeId: e.target.value }))}
                            >
                              <option value="">Unassigned</option>
                              {attendees.map(a => (
                                <option key={a.id} value={a.id}>{a.name || a.email || a.id}</option>
                              ))}
                            </select>
                            <select
                              className="bg-zinc-900 text-white rounded px-3 py-2 text-xs border border-zinc-800 focus:ring-2 focus:ring-blue-500 w-full"
                              value={addTaskFields.priority}
                              onChange={e => setAddTaskFields(f => ({ ...f, priority: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' }))}
                            >
                              <option value="LOW">Low</option>
                              <option value="MEDIUM">Medium</option>
                              <option value="HIGH">High</option>
                            </select>
                            <div className="flex gap-2 mt-2 justify-end">
                              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-1 text-sm font-semibold" disabled={!storageReady || !isConnected}>Add</button>
                              <button type="button" className="text-zinc-400 hover:text-zinc-200 text-sm" onClick={() => setAddingColumn(null)}>Cancel</button>
                            </div>
                          </form>
                        ) : (
                          <button
                            className="mb-4 text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1 self-start"
                            onClick={() => setAddingColumn(col.key)}
                            disabled={addingColumn !== null && addingColumn !== col.key}
                          >
                            + Add task
                          </button>
                        )}
                        <div className="flex-1 flex flex-col gap-4 w-full">
                          {itemsByStatus[col.key].length === 0 ? (
                            <div className="flex flex-col items-center justify-center text-zinc-500 py-12 h-full min-h-[200px]">
                              <span className="text-5xl mb-2" style={{ opacity: 0.15 }}>🗂️</span>
                              <span className="mt-2 text-base font-medium">No tasks</span>
                              <span className="text-xs text-zinc-600 mt-1">Add your first action item!</span>
                            </div>
                          ) : (
                            <>
                              {itemsByStatus[col.key].map((item: ActionItemData, idx: number) => (
                                <Draggable draggableId={item.id} index={idx} key={item.id}>
                                  {(provided, snapshot) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`relative rounded-lg bg-zinc-950 border border-zinc-800 shadow-sm p-4 flex flex-col gap-3 w-full group transition-all ${snapshot.isDragging ? 'ring-2 ring-blue-400 scale-105' : ''}`}
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-white font-medium text-base flex-1 truncate">{item.text}</span>
                                        {/* Quick actions: edit, delete */}
                                        <button
                                          className="p-1 rounded-full bg-zinc-800 text-zinc-400 hover:text-blue-400 hover:bg-zinc-900 transition-colors focus:outline-none"
                                          title="Edit task"
                                          aria-label="Edit task"
                                          onClick={() => startEdit(actionItems.findIndex((ai: ActionItemData) => ai.id === item.id), item)}
                                        >
                                          <PencilIcon className="w-4 h-4" />
                                        </button>
                                        <button
                                          className="p-1 rounded-full bg-zinc-800 text-zinc-400 hover:text-red-500 hover:bg-zinc-900 transition-colors focus:outline-none"
                                          title="Delete task"
                                          aria-label="Delete task"
                                          onClick={() => deleteActionItem({ index: actionItems.findIndex((ai: ActionItemData) => ai.id === item.id), id: item.id })}
                                          disabled={!storageReady || !isConnected}
                                        >
                                          <Trash2Icon className="w-4 h-4" />
                                        </button>
                                      </div>
                                      <div className="flex items-center gap-2 flex-wrap">
                                        {/* Priority badge */}
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${item.priority === 'HIGH' ? 'bg-red-600 text-white' : item.priority === 'MEDIUM' ? 'bg-yellow-500 text-zinc-900' : 'bg-blue-600 text-white'}`}>{item.priority.charAt(0) + item.priority.slice(1).toLowerCase()}</span>
                                        {/* Status badge */}
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${item.status === 'TODO' ? 'bg-blue-700 text-white' : item.status === 'IN_PROGRESS' ? 'bg-yellow-600 text-zinc-900' : 'bg-green-600 text-white'}`}>{col.label}</span>
                                        {/* Due date */}
                                        {item.dueDate && <span className="text-xs text-zinc-400 ml-2">{new Date(item.dueDate).toLocaleDateString()}</span>}
                                        {/* Assignee avatar/initials */}
                                        {item.assigneeId && (
                                          <span className="ml-auto flex items-center">
                                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-900 text-blue-300 font-bold text-xs border border-blue-700">
                                              {(() => {
                                                const user = attendees.find((a) => a.id === item.assigneeId);
                                                if (user) {
                                                  if (user.name) return user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
                                                  if (user.email) return user.email[0].toUpperCase();
                                                }
                                                return '?';
                                              })()}
                                            </span>
                                          </span>
                                        )}
                                      </div>
                                      {/* Inline edit form (optional, for now just quick actions) */}
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </Droppable>
                ))}
              </div>
            </DragDropContext>
          </div>
          <div className="mt-6 p-2 bg-zinc-950/80 rounded text-xs text-zinc-400 border border-zinc-800">
            <strong>Debug Info:</strong> isConnected: {String(isConnected)} | storageReady: {String(storageReady)} | userId: {String(userId)}
          </div>
        </>
      )}
    </div>
  );
};