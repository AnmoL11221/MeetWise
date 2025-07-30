'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image, Settings } from 'lucide-react';

interface VirtualBackgroundManagerProps {
  onBackgroundSelect: (backgroundUrl: string | null) => void;
  currentBackground: string | null;
}

const VirtualBackgroundManager: React.FC<VirtualBackgroundManagerProps> = ({
  onBackgroundSelect,
  currentBackground,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultBackgrounds = [
    {
      id: 'none',
      name: 'None',
      url: null,
      thumbnail: '/api/virtual-backgrounds/none.jpg',
    },
    {
      id: 'office',
      name: 'Office',
      url: '/api/virtual-backgrounds/office.jpg',
      thumbnail: '/api/virtual-backgrounds/office-thumb.jpg',
    },
    {
      id: 'nature',
      name: 'Nature',
      url: '/api/virtual-backgrounds/nature.jpg',
      thumbnail: '/api/virtual-backgrounds/nature-thumb.jpg',
    },
    {
      id: 'beach',
      name: 'Beach',
      url: '/api/virtual-backgrounds/beach.jpg',
      thumbnail: '/api/virtual-backgrounds/beach-thumb.jpg',
    },
    {
      id: 'city',
      name: 'City',
      url: '/api/virtual-backgrounds/city.jpg',
      thumbnail: '/api/virtual-backgrounds/city-thumb.jpg',
    },
    {
      id: 'abstract',
      name: 'Abstract',
      url: '/api/virtual-backgrounds/abstract.jpg',
      thumbnail: '/api/virtual-backgrounds/abstract-thumb.jpg',
    },
  ];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('background', file);

      const response = await fetch('/api/virtual-backgrounds/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload background');
      }

      const { url } = await response.json();
      onBackgroundSelect(url);
    } catch (error) {
      console.error('Error uploading background:', error);
      alert('Failed to upload background. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleBackgroundSelect = (backgroundUrl: string | null) => {
    onBackgroundSelect(backgroundUrl);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors"
        title="Virtual Background"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 left-0 bg-gray-800 rounded-lg p-4 min-w-[300px] shadow-xl border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-medium">Virtual Background</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Upload Section */}
          <div className="mb-4">
            <label className="block text-sm text-gray-300 mb-2">Upload Custom Background</label>
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-gray-500 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center justify-center gap-2 text-gray-400 hover:text-white disabled:opacity-50"
              >
                {uploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {uploading ? 'Uploading...' : 'Choose Image'}
              </button>
              <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
            </div>
          </div>

          {/* Default Backgrounds */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">Default Backgrounds</label>
            <div className="grid grid-cols-3 gap-2">
              {defaultBackgrounds.map((background) => (
                <button
                  key={background.id}
                  onClick={() => handleBackgroundSelect(background.url)}
                  className={`relative group rounded-lg overflow-hidden border-2 transition-all ${
                    currentBackground === background.url
                      ? 'border-blue-500'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="aspect-video bg-gray-700 flex items-center justify-center">
                    {background.thumbnail ? (
                      <img
                        src={background.thumbnail}
                        alt={background.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white text-xs font-medium">{background.name}</span>
                  </div>
                  {currentBackground === background.url && (
                    <div className="absolute top-1 right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="mt-4 p-3 bg-gray-700/50 rounded text-xs text-gray-400">
            <p className="font-medium mb-1">Tips for best results:</p>
            <ul className="space-y-1">
              <li>• Use high-contrast backgrounds</li>
              <li>• Ensure good lighting on your face</li>
              <li>• Avoid wearing clothes that match the background</li>
              <li>• Keep your camera at eye level</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualBackgroundManager; 