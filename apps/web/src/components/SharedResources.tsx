'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { 
  FileTextIcon, 
  LinkIcon, 
  UploadIcon, 
  EditIcon, 
  Trash2Icon, 
  PlusIcon,
  ExternalLinkIcon,
  SaveIcon,
  XIcon,
  FileIcon,
  ImageIcon,
  DocumentIcon
} from 'lucide-react';

interface SharedResource {
  id: string;
  title: string;
  description?: string;
  type: 'document' | 'link' | 'file' | 'scratchpad';
  url?: string;
  content?: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

interface SharedResourcesProps {
  meetingId: string;
}

export default function SharedResources({ meetingId }: SharedResourcesProps) {
  const { getToken, userId } = useAuth();
  const [resources, setResources] = useState<SharedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingResource, setEditingResource] = useState<SharedResource | null>(null);
  const [newResource, setNewResource] = useState({
    title: '',
    description: '',
    type: 'document' as const,
    url: '',
    content: '',
  });

  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3000/meetings/${meetingId}/resources`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch shared resources');
      }
      
      const data = await response.json();
      setResources(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load shared resources');
    } finally {
      setLoading(false);
    }
  };

  const createResource = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3000/meetings/${meetingId}/resources`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newResource),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create resource');
      }
      
      setNewResource({
        title: '',
        description: '',
        type: 'document',
        url: '',
        content: '',
      });
      setShowAddForm(false);
      await fetchResources();
    } catch (err: any) {
      setError(err.message || 'Failed to create resource');
    }
  };

  const updateResource = async () => {
    if (!editingResource) return;
    
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3000/meetings/${meetingId}/resources/${editingResource.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newResource),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update resource');
      }
      
      setEditingResource(null);
      setNewResource({
        title: '',
        description: '',
        type: 'document',
        url: '',
        content: '',
      });
      await fetchResources();
    } catch (err: any) {
      setError(err.message || 'Failed to update resource');
    }
  };

  const deleteResource = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;
    
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3000/meetings/${meetingId}/resources/${resourceId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete resource');
      }
      
      await fetchResources();
    } catch (err: any) {
      setError(err.message || 'Failed to delete resource');
    }
  };

  const startEditing = (resource: SharedResource) => {
    setEditingResource(resource);
    setNewResource({
      title: resource.title,
      description: resource.description || '',
      type: resource.type,
      url: resource.url || '',
      content: resource.content || '',
    });
  };

  const cancelEditing = () => {
    setEditingResource(null);
    setNewResource({
      title: '',
      description: '',
      type: 'document',
      url: '',
      content: '',
    });
  };

  useEffect(() => {
    fetchResources();
  }, [meetingId]);

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document': return <DocumentIcon className="w-5 h-5" />;
      case 'link': return <LinkIcon className="w-5 h-5" />;
      case 'file': return <FileIcon className="w-5 h-5" />;
      case 'scratchpad': return <EditIcon className="w-5 h-5" />;
      default: return <FileTextIcon className="w-5 h-5" />;
    }
  };

  const getResourceTypeLabel = (type: string) => {
    switch (type) {
      case 'document': return 'Document';
      case 'link': return 'Link';
      case 'file': return 'File';
      case 'scratchpad': return 'Scratchpad';
      default: return 'Resource';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileTextIcon className="w-6 h-6 text-blue-400" />
            Shared Resources
          </h2>
        </div>
        <div className="space-y-4 animate-pulse">
          <div className="h-20 bg-gray-800 rounded-lg"></div>
          <div className="h-20 bg-gray-800 rounded-lg"></div>
          <div className="h-20 bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileTextIcon className="w-6 h-6 text-blue-400" />
          Shared Resources
        </h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition flex items-center gap-2"
        >
          <PlusIcon className="w-4 h-4" />
          Add Resource
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {(showAddForm || editingResource) && (
        <div className="mb-6 p-4 bg-gray-800/50 border border-gray-600 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingResource ? 'Edit Resource' : 'Add New Resource'}
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={newResource.title}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                placeholder="Enter resource title..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={newResource.description}
                onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                rows={2}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none"
                placeholder="Describe the resource..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Type *
              </label>
              <select
                value={newResource.type}
                onChange={(e) => setNewResource({ ...newResource, type: e.target.value as any })}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              >
                <option value="document">Document</option>
                <option value="link">Link</option>
                <option value="file">File</option>
                <option value="scratchpad">Scratchpad</option>
              </select>
            </div>

            {newResource.type === 'link' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL *
                </label>
                <input
                  type="url"
                  value={newResource.url}
                  onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  placeholder="https://..."
                  required
                />
              </div>
            )}

            {newResource.type === 'scratchpad' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={newResource.content}
                  onChange={(e) => setNewResource({ ...newResource, content: e.target.value })}
                  rows={6}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none"
                  placeholder="Add your notes, ideas, or brainstorming content..."
                />
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                onClick={editingResource ? updateResource : createResource}
                disabled={!newResource.title.trim()}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
              >
                <SaveIcon className="w-4 h-4" />
                {editingResource ? 'Update' : 'Create'}
              </button>
              <button
                onClick={cancelEditing}
                className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <XIcon className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {resources.length > 0 ? (
          resources.map((resource) => (
            <div key={resource.id} className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="text-blue-400">
                    {getResourceIcon(resource.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white">{resource.title}</h4>
                    {resource.description && (
                      <p className="text-gray-400 mt-1">{resource.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="capitalize">{getResourceTypeLabel(resource.type)}</span>
                      <span>Added by {resource.uploadedBy}</span>
                      <span>{formatDate(resource.createdAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {resource.type === 'link' && resource.url && (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 p-2"
                    >
                      <ExternalLinkIcon className="w-4 h-4" />
                    </a>
                  )}
                  
                  {resource.type === 'scratchpad' && resource.content && (
                    <button
                      onClick={() => {
                        setEditingResource(resource);
                        setNewResource({
                          title: resource.title,
                          description: resource.description || '',
                          type: resource.type,
                          url: resource.url || '',
                          content: resource.content || '',
                        });
                      }}
                      className="text-gray-400 hover:text-white p-2"
                    >
                      <EditIcon className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteResource(resource.id)}
                    className="text-red-400 hover:text-red-300 p-2"
                  >
                    <Trash2Icon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {resource.type === 'scratchpad' && resource.content && (
                <div className="mt-3 p-3 bg-gray-700/50 rounded-md">
                  <h5 className="text-sm font-medium text-gray-300 mb-2">Content</h5>
                  <p className="text-gray-300 text-sm whitespace-pre-wrap">{resource.content}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <FileTextIcon className="mx-auto w-12 h-12 text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Shared Resources</h3>
            <p className="text-gray-400 mb-4">Add documents, links, and collaborative materials for your meeting.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition flex items-center gap-2 mx-auto"
            >
              <PlusIcon className="w-4 h-4" />
              Add Your First Resource
            </button>
          </div>
        )}
      </div>
    </div>
  );
}