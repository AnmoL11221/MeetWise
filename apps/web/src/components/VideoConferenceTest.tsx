'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Video, Settings } from 'lucide-react';
import { dailyConfig, validateDailyConfig } from '@/config/daily';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

const VideoConferenceTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Configuration validation
    const configErrors = validateDailyConfig();
    if (configErrors.length === 0) {
      results.push({
        name: 'Configuration',
        status: 'pass',
        message: 'All configuration values are valid',
      });
    } else {
      results.push({
        name: 'Configuration',
        status: 'fail',
        message: `Configuration errors: ${configErrors.join(', ')}`,
      });
    }

    // Test 2: API Key
    if (dailyConfig.apiKey) {
      results.push({
        name: 'API Key',
        status: 'pass',
        message: 'Daily.co API key is configured',
      });
    } else {
      results.push({
        name: 'API Key',
        status: 'fail',
        message: 'Daily.co API key is missing',
      });
    }

    // Test 3: Domain configuration
    if (dailyConfig.domain) {
      results.push({
        name: 'Domain',
        status: 'pass',
        message: `Domain configured: ${dailyConfig.domain}`,
      });
    } else {
      results.push({
        name: 'Domain',
        status: 'fail',
        message: 'Daily.co domain is not configured',
      });
    }

    // Test 4: Feature flags
    const enabledFeatures = [];
    const disabledFeatures = [];

    if (dailyConfig.enableChat) enabledFeatures.push('Chat');
    else disabledFeatures.push('Chat');

    if (dailyConfig.enableRecording) enabledFeatures.push('Recording');
    else disabledFeatures.push('Recording');

    if (dailyConfig.enableScreenshare) enabledFeatures.push('Screen Sharing');
    else disabledFeatures.push('Screen Sharing');

    if (dailyConfig.enableVirtualBackgrounds) enabledFeatures.push('Virtual Backgrounds');
    else disabledFeatures.push('Virtual Backgrounds');

    results.push({
      name: 'Features',
      status: enabledFeatures.length > 0 ? 'pass' : 'warning',
      message: `Enabled: ${enabledFeatures.join(', ')} | Disabled: ${disabledFeatures.join(', ')}`,
    });

    // Test 5: API connectivity
    try {
      const response = await fetch('/api/daily/rooms', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        results.push({
          name: 'API Connectivity',
          status: 'pass',
          message: 'Successfully connected to Daily.co API',
        });
      } else {
        results.push({
          name: 'API Connectivity',
          status: 'fail',
          message: `API request failed with status: ${response.status}`,
        });
      }
    } catch (error: any) {
      results.push({
        name: 'API Connectivity',
        status: 'fail',
        message: `API connection error: ${error.message}`,
      });
    }

    // Test 6: Browser compatibility
    const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasWebRTC = !!(window.RTCPeerConnection || (window as any).webkitRTCPeerConnection);

    if (hasGetUserMedia && hasWebRTC) {
      results.push({
        name: 'Browser Support',
        status: 'pass',
        message: 'Browser supports WebRTC and getUserMedia',
      });
    } else {
      results.push({
        name: 'Browser Support',
        status: 'fail',
        message: 'Browser does not support required WebRTC features',
      });
    }

    // Test 7: HTTPS requirement
    if (window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
      results.push({
        name: 'HTTPS',
        status: 'pass',
        message: 'Running on HTTPS or localhost (required for camera access)',
      });
    } else {
      results.push({
        name: 'HTTPS',
        status: 'fail',
        message: 'HTTPS is required for camera and microphone access',
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'border-green-500 bg-green-500/10';
      case 'fail':
        return 'border-red-500 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500 bg-yellow-500/10';
      default:
        return 'border-gray-500 bg-gray-500/10';
    }
  };

  const passedTests = testResults.filter(r => r.status === 'pass').length;
  const totalTests = testResults.length;

  return (
    <div className="p-6 bg-gray-900 rounded-lg border border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Video className="w-6 h-6 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Video Conference System Test</h3>
        </div>
        <button
          onClick={runTests}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isRunning ? 'Running...' : 'Run Tests'}
        </button>
      </div>

      <div className="mb-4 p-3 bg-gray-800 rounded">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium">Test Results</span>
          <span className="text-sm text-gray-400">
            {passedTests}/{totalTests} tests passed
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(passedTests / totalTests) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="space-y-3">
        {testResults.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
          >
            <div className="flex items-start gap-3">
              {getStatusIcon(result.status)}
              <div className="flex-1">
                <h4 className="text-white font-medium">{result.name}</h4>
                <p className="text-sm text-gray-300 mt-1">{result.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {testResults.length > 0 && (
        <div className="mt-6 p-4 bg-gray-800 rounded">
          <h4 className="text-white font-medium mb-2">Configuration Summary</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Domain:</span>
              <span className="text-white ml-2">{dailyConfig.domain || 'Not set'}</span>
            </div>
            <div>
              <span className="text-gray-400">Max Participants:</span>
              <span className="text-white ml-2">{dailyConfig.maxParticipants}</span>
            </div>
            <div>
              <span className="text-gray-400">Room Expiration:</span>
              <span className="text-white ml-2">{Math.floor(dailyConfig.roomExpiration / 3600)} hours</span>
            </div>
            <div>
              <span className="text-gray-400">File Upload Limit:</span>
              <span className="text-white ml-2">{Math.floor(dailyConfig.maxFileSize / 1024 / 1024)}MB</span>
            </div>
          </div>
        </div>
      )}

      {testResults.some(r => r.status === 'fail') && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-500/20 rounded">
          <h4 className="text-red-400 font-medium mb-2">Issues Found</h4>
          <p className="text-sm text-red-300">
            Some tests failed. Please check the configuration and ensure all requirements are met.
            Refer to the setup guide for detailed instructions.
          </p>
        </div>
      )}
    </div>
  );
};

export default VideoConferenceTest; 