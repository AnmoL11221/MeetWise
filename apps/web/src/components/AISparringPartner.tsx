'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { 
  MicIcon, 
  MicOffIcon, 
  PlayIcon, 
  PauseIcon, 
  SquareIcon,
  UsersIcon,
  MessageSquareIcon,
  TargetIcon,
  TrendingUpIcon,
  ClockIcon,
  Volume2Icon,
  SettingsIcon,
  RefreshCwIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  UserIcon,
  BotIcon
} from 'lucide-react';

interface Persona {
  id: string;
  name: string;
  role: string;
  company?: string;
  personality: string;
  background: string;
  expertise: string;
  communicationStyle: string;
  typicalQuestions: string[];
}

interface PracticeSession {
  id: string;
  title: string;
  description?: string;
  userRole: string;
  scenario: string;
  difficulty: string;
  duration: number;
  status: string;
  personas: Persona[];
  meeting: {
    title: string;
    description?: string;
    agendaItems: any[];
  };
}

interface Interaction {
  id: string;
  speaker: string;
  message: string;
  messageType: string;
  timestamp: string;
  persona?: Persona;
}

interface DeliveryFeedback {
  pacing: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  clarity: {
    score: number;
    feedback: string;
    suggestions: string[];
  };
  fillerWords: {
    count: number;
    words: string[];
    feedback: string;
  };
  confidence: {
    score: number;
    feedback: string;
  };
  overall: {
    score: number;
    summary: string;
    recommendations: string[];
  };
}

interface AISparringPartnerProps {
  meetingId: string;
}

export default function AISparringPartner({ meetingId }: AISparringPartnerProps) {
  const { getToken, userId } = useAuth();
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(true);
  const [userRole, setUserRole] = useState('');
  const [scenario, setScenario] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState<DeliveryFeedback | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [activePersona, setActivePersona] = useState<Persona | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const userRoles = [
    'Presenter',
    'Facilitator',
    'Subject Matter Expert',
    'Project Manager',
    'Team Lead',
    'Stakeholder'
  ];

  const scenarios = [
    'Pitch Presentation',
    'Status Update',
    'Problem Discussion',
    'Decision Making',
    'Planning Session',
    'Review Meeting'
  ];

  const createPracticeSession = async () => {
    if (!userRole || !scenario) {
      setError('Please select both your role and scenario');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch('http://localhost:3000/ai-sparring/practice-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          meetingId,
          userRole,
          scenario,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create practice session');
      }

      const sessionData = await response.json();
      setSession(sessionData);
      setInteractions(sessionData.interactions || []);
      setShowSetup(false);
    } catch (err: any) {
      setError(err.message || 'Failed to create practice session');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!currentMessage.trim() || !session) return;

    const userMessage = currentMessage.trim();
    setCurrentMessage('');

    // Add user message to interactions
    const userInteraction: Interaction = {
      id: Date.now().toString(),
      speaker: 'You',
      message: userMessage,
      messageType: 'user_message',
      timestamp: new Date().toISOString(),
    };

    setInteractions(prev => [...prev, userInteraction]);

    // Save interaction to backend
    try {
      const token = await getToken();
      await fetch(`http://localhost:3000/ai-sparring/practice-session/${session.id}/interaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          speaker: 'You',
          message: userMessage,
          messageType: 'user_message',
        }),
      });
    } catch (err) {
      console.error('Failed to save interaction:', err);
    }

    // Generate AI response
    if (session.personas.length > 0) {
      const selectedPersona = activePersona || session.personas[0];
      generateAIResponse(selectedPersona, userMessage);
    }
  };

  const generateAIResponse = async (persona: Persona, userMessage: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3000/ai-sparring/practice-session/${session!.id}/ai-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          personaId: persona.id,
          context: session!.meeting.title,
          userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI response');
      }

      const aiResponse = await response.json();
      
      const aiInteraction: Interaction = {
        id: Date.now().toString(),
        speaker: aiResponse.speaker,
        message: aiResponse.message,
        messageType: 'ai_response',
        timestamp: new Date().toISOString(),
        persona: aiResponse.persona,
      };

      setInteractions(prev => [...prev, aiInteraction]);
    } catch (err) {
      console.error('Failed to generate AI response:', err);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const analyzeDelivery = async () => {
    if (!audioBlob || !transcript || !session) return;

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      formData.append('transcript', transcript);

      const response = await fetch(`http://localhost:3000/ai-sparring/practice-session/${session.id}/analyze-delivery`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze delivery');
      }

      const feedbackData = await response.json();
      setFeedback(feedbackData);
      setShowFeedback(true);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze delivery');
    } finally {
      setLoading(false);
    }
  };

  const generateFollowUpQuestions = async () => {
    if (!session || interactions.length === 0) return;

    const lastUserMessage = interactions
      .filter(i => i.speaker === 'You')
      .pop()?.message || '';

    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3000/ai-sparring/practice-session/${session.id}/follow-up-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentTopic: session.meeting.title,
          userResponse: lastUserMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate follow-up questions');
      }

      const data = await response.json();
      setFollowUpQuestions(data.questions);
    } catch (err) {
      console.error('Failed to generate follow-up questions:', err);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-400';
    if (score >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    return 'Needs Improvement';
  };

  if (showSetup) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <TargetIcon className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">AI Sparring Partner</h2>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Practice Session Setup</h3>
            <p className="text-gray-400 mb-6">
              Configure your practice session to simulate realistic meeting scenarios with AI personas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Role *
              </label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
              >
                <option value="">Select your role</option>
                {userRoles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Scenario *
              </label>
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
              >
                <option value="">Select scenario</option>
                {scenarios.map(scenario => (
                  <option key={scenario} value={scenario}>{scenario}</option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            onClick={createPracticeSession}
            disabled={loading || !userRole || !scenario}
            className="w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 disabled:bg-opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <>
                <RefreshCwIcon className="w-4 h-4 animate-spin" />
                Creating Session...
              </>
            ) : (
              <>
                <TargetIcon className="w-4 h-4" />
                Start Practice Session
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <div className="text-center py-8">
          <TargetIcon className="mx-auto w-12 h-12 text-gray-600 mb-4" />
          <p className="text-gray-400">No practice session available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TargetIcon className="w-6 h-6 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">AI Sparring Partner</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            session.difficulty === 'advanced' ? 'bg-red-900/50 text-red-400' :
            session.difficulty === 'intermediate' ? 'bg-yellow-900/50 text-yellow-400' :
            'bg-green-900/50 text-green-400'
          }`}>
            {session.difficulty}
          </span>
          <span className="text-sm text-gray-400">{session.duration} min</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Practice Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Session Info */}
          <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-2">{session.title}</h3>
            <p className="text-gray-400 text-sm mb-3">{session.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>Role: {session.userRole}</span>
              <span>Scenario: {session.scenario}</span>
            </div>
          </div>

          {/* Personas */}
          <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <UsersIcon className="w-5 h-5 text-blue-400" />
              AI Personas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {session.personas.map((persona) => (
                <div
                  key={persona.id}
                  onClick={() => setActivePersona(persona)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    activePersona?.id === persona.id
                      ? 'border-purple-500 bg-purple-900/20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{persona.name}</h4>
                      <p className="text-sm text-gray-400">{persona.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-300 mb-2">{persona.expertise}</p>
                  <p className="text-xs text-gray-500">{persona.communicationStyle}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Interface */}
          <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquareIcon className="w-5 h-5 text-green-400" />
              Practice Conversation
            </h3>
            
            <div className="h-64 overflow-y-auto mb-4 space-y-3">
              {interactions.map((interaction) => (
                <div
                  key={interaction.id}
                  className={`flex ${interaction.speaker === 'You' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                      interaction.speaker === 'You'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {interaction.speaker === 'You' ? (
                        <UserIcon className="w-3 h-3" />
                      ) : (
                        <BotIcon className="w-3 h-3" />
                      )}
                      <span className="text-xs font-medium">
                        {interaction.speaker}
                        {interaction.persona && ` (${interaction.persona.role})`}
                      </span>
                    </div>
                    <p className="text-sm">{interaction.message}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message..."
                className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={!currentMessage.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </div>

          {/* Follow-up Questions */}
          {followUpQuestions.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertCircleIcon className="w-5 h-5 text-yellow-400" />
                Follow-up Questions
              </h3>
              <div className="space-y-2">
                {followUpQuestions.map((question, index) => (
                  <div key={index} className="p-3 bg-gray-700 rounded-lg">
                    <p className="text-gray-300">{question}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recording Controls */}
          <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Volume2Icon className="w-5 h-5 text-red-400" />
              Delivery Practice
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-2">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center gap-2"
                  >
                    <MicIcon className="w-4 h-4" />
                    Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center justify-center gap-2"
                  >
                    <SquareIcon className="w-4 h-4" />
                    Stop Recording
                  </button>
                )}
              </div>

              {audioBlob && (
                <div className="space-y-2">
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    placeholder="Enter or edit your transcript..."
                    rows={4}
                    className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none"
                  />
                  <button
                    onClick={analyzeDelivery}
                    disabled={loading || !transcript.trim()}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCwIcon className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <TrendingUpIcon className="w-4 h-4" />
                        Analyze Delivery
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-gray-400" />
              Quick Actions
            </h3>
            
            <div className="space-y-2">
              <button
                onClick={generateFollowUpQuestions}
                className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 flex items-center justify-center gap-2"
              >
                <AlertCircleIcon className="w-4 h-4" />
                Generate Follow-up Questions
              </button>
            </div>
          </div>

          {/* Session Stats */}
          <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-blue-400" />
              Session Stats
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Messages</span>
                <span className="text-white">{interactions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Personas</span>
                <span className="text-white">{session.personas.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className="text-green-400">{session.status}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedback && feedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Delivery Feedback</h2>
              <button
                onClick={() => setShowFeedback(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Overall Score */}
              <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Overall Performance</h3>
                <div className="flex items-center gap-4">
                  <div className={`text-3xl font-bold ${getScoreColor(feedback.overall.score)}`}>
                    {Math.round(feedback.overall.score * 100)}%
                  </div>
                  <div>
                    <p className="text-white font-medium">{getScoreLabel(feedback.overall.score)}</p>
                    <p className="text-gray-400 text-sm">{feedback.overall.summary}</p>
                  </div>
                </div>
              </div>

              {/* Detailed Feedback */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Pacing</h4>
                  <div className={`text-2xl font-bold ${getScoreColor(feedback.pacing.score)} mb-2`}>
                    {Math.round(feedback.pacing.score * 100)}%
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{feedback.pacing.feedback}</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {feedback.pacing.suggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Clarity</h4>
                  <div className={`text-2xl font-bold ${getScoreColor(feedback.clarity.score)} mb-2`}>
                    {Math.round(feedback.clarity.score * 100)}%
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{feedback.clarity.feedback}</p>
                  <ul className="text-xs text-gray-400 space-y-1">
                    {feedback.clarity.suggestions.map((suggestion, index) => (
                      <li key={index}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Confidence</h4>
                  <div className={`text-2xl font-bold ${getScoreColor(feedback.confidence.score)} mb-2`}>
                    {Math.round(feedback.confidence.score * 100)}%
                  </div>
                  <p className="text-gray-300 text-sm">{feedback.confidence.feedback}</p>
                </div>

                <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Filler Words</h4>
                  <div className="text-2xl font-bold text-white mb-2">
                    {feedback.fillerWords.count}
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{feedback.fillerWords.feedback}</p>
                  {feedback.fillerWords.words.length > 0 && (
                    <div className="text-xs text-gray-400">
                      Detected: {feedback.fillerWords.words.join(', ')}
                    </div>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Recommendations</h3>
                <ul className="space-y-2">
                  {feedback.overall.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}