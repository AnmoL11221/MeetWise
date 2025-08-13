import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

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

@Injectable()
export class BriefingDossierService {
  constructor(private readonly prisma: PrismaService) {}

  async generateBriefingDossier(meetingId: string): Promise<any> {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        attendees: true,
        creator: true,
        meetingNotes: true,
        sharedResources: true,
      },
    });

    if (!meeting) {
      throw new NotFoundException(`Meeting with ID "${meetingId}" not found`);
    }

    const attendeeProfiles = await this.generateAttendeeProfiles(meeting.attendees);

    const relevantDocuments = await this.findRelevantDocuments(meeting);

    const marketNews = await this.getMarketNews(meeting);

    const agendaAnalysis = await this.analyzeAgenda(meeting);

    const keyInsights = await this.generateInsights(meeting, attendeeProfiles, relevantDocuments, marketNews);
    const recommendations = await this.generateRecommendations(meeting, keyInsights);

    const briefingDossier = await this.prisma.briefingDossier.upsert({
      where: { meetingId },
      update: {
        attendeeProfiles: attendeeProfiles as unknown as any,
        relevantDocuments: relevantDocuments as unknown as any,
        marketNews: marketNews as unknown as any,
        agendaAnalysis: agendaAnalysis as unknown as any,
        keyInsights: keyInsights as unknown as any,
        recommendations: recommendations as unknown as any,
        updatedAt: new Date(),
      },
      create: {
        meetingId,
        attendeeProfiles: attendeeProfiles as unknown as any,
        relevantDocuments: relevantDocuments as unknown as any,
        marketNews: marketNews as unknown as any,
        agendaAnalysis: agendaAnalysis as unknown as any,
        keyInsights: keyInsights as unknown as any,
        recommendations: recommendations as unknown as any,
      },
    });

    return briefingDossier;
  }

  async getBriefingDossier(meetingId: string): Promise<any> {
    const briefingDossier = await this.prisma.briefingDossier.findUnique({
      where: { meetingId },
    });

    if (!briefingDossier) {
      return this.generateBriefingDossier(meetingId);
    }

    return briefingDossier;
  }

  private async generateAttendeeProfiles(attendees: any[]): Promise<AttendeeProfile[]> {
    const profiles: AttendeeProfile[] = [];

    for (const attendee of attendees) {
      const profile: AttendeeProfile = {
        name: attendee.name || 'Unknown',
        email: attendee.email,
        company: attendee.company || 'Unknown Company',
        jobTitle: attendee.jobTitle || 'Unknown Title',
        linkedinProfile: attendee.linkedinProfile,
        recentActivity: this.simulateRecentActivity(attendee),
        companyNews: this.simulateCompanyNews(attendee.company),
      };

      profiles.push(profile);
    }

    return profiles;
  }

  private async findRelevantDocuments(meeting: any): Promise<RelevantDocument[]> {
    const documents: RelevantDocument[] = [];

    for (const note of meeting.meetingNotes) {
      documents.push({
        title: note.title,
        type: 'meeting_note',
        content: note.content,
        date: note.createdAt.toISOString(),
        relevance: this.calculateRelevance(note.content, meeting.title, meeting.description),
      });
    }

    for (const resource of meeting.sharedResources) {
      if (resource.type === 'document') {
        documents.push({
          title: resource.title,
          type: 'document',
          content: resource.content || resource.description || '',
          date: resource.createdAt.toISOString(),
          relevance: this.calculateRelevance(resource.content || resource.description || '', meeting.title, meeting.description),
        });
      }
    }

    return documents.sort((a, b) => b.relevance - a.relevance);
  }

  private async getMarketNews(meeting: any): Promise<MarketNews[]> {
    const news: MarketNews[] = [];
    const companies = new Set<string>();

    meeting.attendees.forEach((attendee: any) => {
      if (attendee.company) {
        companies.add(attendee.company);
      }
    });

    for (const company of companies) {
      const companyNews = this.simulateCompanyNews(company);
      news.push(...companyNews);
    }

    return news.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  private async analyzeAgenda(meeting: any): Promise<any> {
    const agendaItems = meeting.agendaItems as any[] || [];
    const analysis = {
      topics: [],
      keyThemes: [],
      estimatedDuration: 0,
      complexity: 'medium',
    };

    for (const item of agendaItems) {
      analysis.topics.push({
        topic: item.text,
        complexity: this.assessTopicComplexity(item.text),
        estimatedTime: this.estimateTopicTime(item.text),
        keyPoints: this.extractKeyPoints(item.text),
      });
    }

    analysis.keyThemes = this.extractKeyThemes(agendaItems);
    analysis.estimatedDuration = analysis.topics.reduce((sum: number, topic: any) => sum + topic.estimatedTime, 0);
    analysis.complexity = this.assessOverallComplexity(analysis.topics);

    return analysis;
  }

  private async generateInsights(meeting: any, attendeeProfiles: any[], relevantDocuments: any[], marketNews: any[]): Promise<string> {
    const insights = [];

    const externalAttendees = attendeeProfiles.filter(profile => 
      profile.company && profile.company !== 'Unknown Company'
    );
    
    if (externalAttendees.length > 0) {
      insights.push(`Meeting includes ${externalAttendees.length} external attendees from ${externalAttendees.map(a => a.company).join(', ')}.`);
    }

    if (relevantDocuments.length > 0) {
      insights.push(`Found ${relevantDocuments.length} relevant documents from previous meetings and shared resources.`);
    }

    if (marketNews.length > 0) {
      insights.push(`Recent market news available for ${marketNews.length} companies involved in the meeting.`);
    }

    const agendaItems = meeting.agendaItems as any[] || [];
    if (agendaItems.length > 0) {
      insights.push(`Agenda covers ${agendaItems.length} topics with estimated duration of ${this.formatDuration(this.estimateTotalTime(agendaItems))}.`);
    }

    return insights.join(' ');
  }

  private async generateRecommendations(meeting: any, insights: string): Promise<string> {
    const recommendations = [];

    const agendaItems = meeting.agendaItems as any[] || [];
    const totalTime = this.estimateTotalTime(agendaItems);
    
    if (totalTime > 60) {
      recommendations.push('Consider breaking this into multiple meetings due to agenda length.');
    }

    if (meeting.meetingNotes && meeting.meetingNotes.length > 0) {
      recommendations.push('Review previous meeting notes for context and continuity.');
    }

    const hasExternalAttendees = meeting.attendees.some((attendee: any) => 
      attendee.company && attendee.company !== 'Unknown Company'
    );
    
    if (hasExternalAttendees) {
      recommendations.push('Prepare company-specific talking points for external attendees.');
    }

    return recommendations.join(' ');
  }

  private simulateRecentActivity(attendee: any): any[] {
    return [
      {
        type: 'post',
        content: `Shared insights about ${attendee.company || 'industry'} trends`,
        date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        type: 'article',
        content: 'Published article on professional development',
        date: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
  }

  private simulateCompanyNews(company: string): any[] {
    return [
      {
        title: `${company} announces new strategic initiatives`,
        source: 'Business News',
        date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        summary: 'Company announces new strategic direction and partnerships.',
        relevance: 'high',
      },
      {
        title: `${company} reports quarterly earnings`,
        source: 'Financial Times',
        date: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
        summary: 'Strong quarterly performance with growth in key areas.',
        relevance: 'medium',
      },
    ];
  }

  private calculateRelevance(content: string, title: string, description?: string): number {
    const searchTerms = [title, description].filter(Boolean).join(' ').toLowerCase();
    const contentLower = content.toLowerCase();
    
    let relevance = 0;
    const words = searchTerms.split(' ');
    
    for (const word of words) {
      if (word.length > 3 && contentLower.includes(word)) {
        relevance += 1;
      }
    }
    
    return Math.min(relevance / words.length, 1);
  }

  private assessTopicComplexity(topic: string): string {
    const complexKeywords = ['strategy', 'analysis', 'review', 'planning', 'assessment'];
    const simpleKeywords = ['update', 'status', 'check-in', 'brief'];
    
    const topicLower = topic.toLowerCase();
    
    if (complexKeywords.some(keyword => topicLower.includes(keyword))) {
      return 'high';
    } else if (simpleKeywords.some(keyword => topicLower.includes(keyword))) {
      return 'low';
    }
    
    return 'medium';
  }

  private estimateTopicTime(topic: string): number {
    const topicLower = topic.toLowerCase();
    
    if (topicLower.includes('brief') || topicLower.includes('update')) {
      return 5;
    } else if (topicLower.includes('discussion') || topicLower.includes('review')) {
      return 15;
    } else if (topicLower.includes('planning') || topicLower.includes('strategy')) {
      return 30;
    }
    
    return 10;
  }

  private extractKeyPoints(topic: string): string[] {
    const words = topic.split(' ').filter(word => word.length > 4);
    return words.slice(0, 3);
  }

  private extractKeyThemes(agendaItems: any[]): string[] {
    const themes = new Set<string>();
    
    for (const item of agendaItems) {
      const text = item.text.toLowerCase();
      if (text.includes('strategy')) themes.add('Strategic Planning');
      if (text.includes('review')) themes.add('Review & Assessment');
      if (text.includes('planning')) themes.add('Planning');
      if (text.includes('update')) themes.add('Status Updates');
    }
    
    return Array.from(themes);
  }

  private assessOverallComplexity(topics: any[]): string {
    const complexities = topics.map(topic => topic.complexity);
    const highCount = complexities.filter(c => c === 'high').length;
    const lowCount = complexities.filter(c => c === 'low').length;
    
    if (highCount > lowCount) return 'high';
    if (lowCount > highCount) return 'low';
    return 'medium';
  }

  private estimateTotalTime(agendaItems: any[]): number {
    return agendaItems.reduce((sum, item) => sum + this.estimateTopicTime(item.text), 0);
  }

  private formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
}