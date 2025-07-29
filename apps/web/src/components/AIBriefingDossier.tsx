'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { 
  FileTextIcon, 
  UsersIcon, 
  NewspaperIcon, 
  LightbulbIcon, 
  ClockIcon, 
  BuildingIcon,
  ExternalLinkIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  CalendarIcon,
  BriefcaseIcon,
  GlobeIcon
} from 'lucide-react';

interface AttendeeProfile {
  name: string;
  email: string;
  company?: string;
  jobTitle?: string;
  linkedinProfile?: string;
  recentActivity?: any[];
  companyNews?: any[];
}

interface RelevantDocument {
  title: string;
  type: 'meeting_note' | 'document' | 'decision';
  content: string;
  date: string;
  relevance: number;
}

interface MarketNews {
  title: string;
  source: string;
  date: string;
  summary: string;
  relevance: string;
}

interface AgendaTopic {
  topic: string;
  complexity: string;
  estimatedTime: number;
  keyPoints: string[];
}

interface BriefingDossier {
  id: string;
  meetingId: string;
  attendeeProfiles: AttendeeProfile[];
  relevantDocuments: RelevantDocument[];
  marketNews: MarketNews[];
  agendaAnalysis: {
    topics: AgendaTopic[];
    keyThemes: string[];
    estimatedDuration: number;
    complexity: string;
  };
  keyInsights: string;
  recommendations: string;
  createdAt: string;
  updatedAt: string;
}

interface AIBriefingDossierProps {
  meetingId: string;
}

export default function AIBriefingDossier({ meetingId }: AIBriefingDossierProps) {
  const { getToken } = useAuth();
  const [dossier, setDossier] = useState<BriefingDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendees' | 'documents' | 'news' | 'agenda'>('overview');

  const fetchDossier = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3000/briefing-dossier/${meetingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch briefing dossier');
      }
      
      const data = await response.json();
      setDossier(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load briefing dossier');
    } finally {
      setLoading(false);
    }
  };

  const generateDossier = async () => {
    setGenerating(true);
    setError(null);
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:3000/briefing-dossier/${meetingId}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate briefing dossier');
      }
      
      const data = await response.json();
      setDossier(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate briefing dossier');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchDossier();
  }, [meetingId]);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getRelevanceColor = (relevance: string) => {
    switch (relevance) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileTextIcon className="w-6 h-6 text-blue-400" />
            AI Briefing Dossier
          </h2>
        </div>
        <div className="space-y-4 animate-pulse">
          <div className="h-32 bg-gray-800 rounded-lg"></div>
          <div className="h-24 bg-gray-800 rounded-lg"></div>
          <div className="h-40 bg-gray-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileTextIcon className="w-6 h-6 text-blue-400" />
            AI Briefing Dossier
          </h2>
          <button
            onClick={generateDossier}
            disabled={generating}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {generating ? (
              <>
                <RefreshCwIcon className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCwIcon className="w-4 h-4" />
                Generate
              </>
            )}
          </button>
        </div>
        <div className="text-center py-8">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchDossier}
            className="px-4 py-2 bg-gray-600 text-white font-semibold rounded hover:bg-gray-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dossier) {
    return (
      <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FileTextIcon className="w-6 h-6 text-blue-400" />
            AI Briefing Dossier
          </h2>
          <button
            onClick={generateDossier}
            disabled={generating}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {generating ? (
              <>
                <RefreshCwIcon className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCwIcon className="w-4 h-4" />
                Generate Dossier
              </>
            )}
          </button>
        </div>
        <div className="text-center py-8">
          <FileTextIcon className="mx-auto w-12 h-12 text-gray-600 mb-4" />
          <p className="text-gray-400 mb-4">No briefing dossier available</p>
          <p className="text-gray-500 text-sm">Generate an AI-powered briefing with attendee profiles, relevant documents, and market insights.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <FileTextIcon className="w-6 h-6 text-blue-400" />
          AI Briefing Dossier
        </h2>
        <div className="flex gap-2">
          <button
            onClick={fetchDossier}
            className="px-3 py-2 bg-gray-600 text-white font-semibold rounded hover:bg-gray-700 transition flex items-center gap-2"
          >
            <RefreshCwIcon className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={generateDossier}
            disabled={generating}
            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {generating ? (
              <>
                <RefreshCwIcon className="w-4 h-4 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <RefreshCwIcon className="w-4 h-4" />
                Regenerate
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex space-x-1 mb-6 bg-gray-800 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: FileTextIcon },
          { id: 'attendees', label: 'Attendees', icon: UsersIcon },
          { id: 'documents', label: 'Documents', icon: FileTextIcon },
          { id: 'news', label: 'Market News', icon: NewspaperIcon },
          { id: 'agenda', label: 'Agenda Analysis', icon: ClockIcon },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
                <LightbulbIcon className="w-5 h-5 text-yellow-400" />
                Key Insights
              </h3>
              <p className="text-gray-300">{dossier.keyInsights}</p>
            </div>

            <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
                <TrendingUpIcon className="w-5 h-5 text-green-400" />
                AI Recommendations
              </h3>
              <p className="text-gray-300">{dossier.recommendations}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <UsersIcon className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-gray-400">Attendees</span>
                </div>
                <p className="text-2xl font-bold text-white">{dossier.attendeeProfiles.length}</p>
              </div>
              
              <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileTextIcon className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-gray-400">Documents</span>
                </div>
                <p className="text-2xl font-bold text-white">{dossier.relevantDocuments.length}</p>
              </div>
              
              <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ClockIcon className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-gray-400">Duration</span>
                </div>
                <p className="text-2xl font-bold text-white">{formatDuration(dossier.agendaAnalysis.estimatedDuration)}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'attendees' && (
          <div className="space-y-4">
            {dossier.attendeeProfiles.map((profile, index) => (
              <div key={index} className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold text-white">{profile.name}</h4>
                    <p className="text-gray-400">{profile.email}</p>
                    {profile.jobTitle && (
                      <p className="text-sm text-gray-500">{profile.jobTitle}</p>
                    )}
                  </div>
                  {profile.linkedinProfile && (
                    <a
                      href={profile.linkedinProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <ExternalLinkIcon className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                </div>
                
                {profile.company && (
                  <div className="flex items-center gap-2 mb-3">
                    <BuildingIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{profile.company}</span>
                  </div>
                )}

                {profile.recentActivity && profile.recentActivity.length > 0 && (
                  <div className="mb-3">
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Recent Activity</h5>
                    <div className="space-y-2">
                      {profile.recentActivity.map((activity, idx) => (
                        <div key={idx} className="text-sm text-gray-400">
                          <span className="capitalize">{activity.type}</span>: {activity.content}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {profile.companyNews && profile.companyNews.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-gray-300 mb-2">Company News</h5>
                    <div className="space-y-2">
                      {profile.companyNews.map((news, idx) => (
                        <div key={idx} className="text-sm">
                          <div className="text-gray-300 font-medium">{news.title}</div>
                          <div className="text-gray-400">{news.summary}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            {dossier.relevantDocuments.length > 0 ? (
              dossier.relevantDocuments.map((doc, index) => (
                <div key={index} className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-semibold text-white">{doc.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      doc.relevance > 0.7 ? 'bg-green-900/50 text-green-400' :
                      doc.relevance > 0.4 ? 'bg-yellow-900/50 text-yellow-400' :
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {Math.round(doc.relevance * 100)}% relevant
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    <span className="capitalize">{doc.type.replace('_', ' ')}</span>
                    <span>{formatDate(doc.date)}</span>
                  </div>
                  <p className="text-gray-300 text-sm line-clamp-3">{doc.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileTextIcon className="mx-auto w-8 h-8 text-gray-600 mb-2" />
                <p className="text-gray-400">No relevant documents found</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'news' && (
          <div className="space-y-4">
            {dossier.marketNews.length > 0 ? (
              dossier.marketNews.map((news, index) => (
                <div key={index} className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-semibold text-white">{news.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      news.relevance === 'high' ? 'bg-green-900/50 text-green-400' :
                      news.relevance === 'medium' ? 'bg-yellow-900/50 text-yellow-400' :
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {news.relevance} relevance
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    <span>{news.source}</span>
                    <span>{formatDate(news.date)}</span>
                  </div>
                  <p className="text-gray-300">{news.summary}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <NewspaperIcon className="mx-auto w-8 h-8 text-gray-600 mb-2" />
                <p className="text-gray-400">No market news available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'agenda' && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Agenda Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-400">Total Duration</span>
                  <p className="text-xl font-bold text-white">{formatDuration(dossier.agendaAnalysis.estimatedDuration)}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Complexity</span>
                  <p className={`text-xl font-bold ${getComplexityColor(dossier.agendaAnalysis.complexity)}`}>
                    {dossier.agendaAnalysis.complexity}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-400">Topics</span>
                  <p className="text-xl font-bold text-white">{dossier.agendaAnalysis.topics.length}</p>
                </div>
              </div>
            </div>

            {dossier.agendaAnalysis.keyThemes.length > 0 && (
              <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Key Themes</h3>
                <div className="flex flex-wrap gap-2">
                  {dossier.agendaAnalysis.keyThemes.map((theme, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-900/50 text-blue-400 rounded-full text-sm">
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Topic Breakdown</h3>
              {dossier.agendaAnalysis.topics.map((topic, index) => (
                <div key={index} className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-lg font-semibold text-white">{topic.topic}</h4>
                    <div className="flex items-center gap-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getComplexityColor(topic.complexity)}`}>
                        {topic.complexity} complexity
                      </span>
                      <span className="text-sm text-gray-400">{topic.estimatedTime} min</span>
                    </div>
                  </div>
                  {topic.keyPoints.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-300 mb-2">Key Points</h5>
                      <div className="flex flex-wrap gap-2">
                        {topic.keyPoints.map((point, idx) => (
                          <span key={idx} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                            {point}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}