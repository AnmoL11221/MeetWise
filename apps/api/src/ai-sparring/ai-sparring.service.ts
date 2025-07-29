import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface PersonaConfig {
  name: string;
  role: string;
  company?: string;
  personality: string;
  background: string;
  expertise: string;
  communicationStyle: string;
  typicalQuestions: string[];
  skepticismLevel: number;
  technicalDepth: number;
  businessFocus: number;
}

interface PracticeScenario {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  personas: string[];
  focusAreas: string[];
  estimatedDuration: number;
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

@Injectable()
export class AISparringService {
  constructor(private readonly prisma: PrismaService) {}

  async createPracticeSession(meetingId: string, userId: string, userRole: string, scenario: string): Promise<any> {
    const meeting = await this.prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        attendees: true,
        agendaItems: true,
        briefingDossier: true,
      },
    });

    if (!meeting) {
      throw new NotFoundException(`Meeting with ID "${meetingId}" not found`);
    }

    const sessionTitle = `Practice Session: ${meeting.title}`;
    const personas = await this.generatePersonasForMeeting(meeting);
    const difficulty = this.assessDifficulty(meeting, userRole);
    const estimatedDuration = this.calculateSessionDuration(meeting);

    const practiceSession = await this.prisma.practiceSession.create({
      data: {
        meetingId,
        userId,
        title: sessionTitle,
        description: `Practice session for ${meeting.title} - Role: ${userRole}`,
        userRole,
        scenario,
        difficulty,
        duration: estimatedDuration,
        status: 'active',
      },
    });

    await this.seedPersonas(personas, practiceSession.id);

    return {
      ...practiceSession,
      personas,
      meeting: {
        title: meeting.title,
        description: meeting.description,
        agendaItems: meeting.agendaItems,
      },
    };
  }

  async generatePersonasForMeeting(meeting: any): Promise<PersonaConfig[]> {
    const personas: PersonaConfig[] = [];
    const agendaItems = meeting.agendaItems as any[] || [];

    const basePersonas = [
      {
        name: 'Sarah Chen',
        role: 'CFO',
        company: 'TechCorp',
        personality: 'Analytical and results-driven',
        background: '15+ years in finance, MBA from Harvard',
        expertise: 'Financial analysis, ROI calculations, budget management',
        communicationStyle: 'Direct, data-focused, asks tough questions',
        typicalQuestions: [
          'What\'s the ROI on this investment?',
          'How does this align with our quarterly targets?',
          'What are the risks and mitigation strategies?',
          'Can you break down the cost-benefit analysis?',
        ],
        skepticismLevel: 0.9,
        technicalDepth: 0.3,
        businessFocus: 0.9,
      },
      {
        name: 'Marcus Rodriguez',
        role: 'Engineering Lead',
        company: 'TechCorp',
        personality: 'Technical and detail-oriented',
        background: '10+ years in software engineering, CS degree',
        expertise: 'System architecture, technical feasibility, implementation',
        communicationStyle: 'Technical, thorough, focuses on implementation details',
        typicalQuestions: [
          'How will this integrate with our existing systems?',
          'What are the technical requirements and constraints?',
          'What\'s the implementation timeline?',
          'Have you considered the scalability implications?',
        ],
        skepticismLevel: 0.7,
        technicalDepth: 0.9,
        businessFocus: 0.4,
      },
      {
        name: 'Jennifer Park',
        role: 'Product Manager',
        company: 'TechCorp',
        personality: 'User-focused and strategic',
        background: '8+ years in product management, design background',
        expertise: 'User experience, market research, product strategy',
        communicationStyle: 'Collaborative, user-centric, strategic thinking',
        typicalQuestions: [
          'How does this solve the user\'s problem?',
          'What\'s the user feedback on this approach?',
          'How does this fit into our product roadmap?',
          'What are the success metrics we should track?',
        ],
        skepticismLevel: 0.5,
        technicalDepth: 0.6,
        businessFocus: 0.7,
      },
      {
        name: 'David Thompson',
        role: 'Sales Director',
        company: 'TechCorp',
        personality: 'Results-oriented and relationship-focused',
        background: '12+ years in sales, psychology degree',
        expertise: 'Customer relationships, market positioning, revenue growth',
        communicationStyle: 'Persuasive, relationship-focused, outcome-driven',
        typicalQuestions: [
          'How will this help us close more deals?',
          'What\'s the competitive advantage?',
          'How do we position this to customers?',
          'What\'s the revenue impact?',
        ],
        skepticismLevel: 0.4,
        technicalDepth: 0.2,
        businessFocus: 0.8,
      },
    ];

    const relevantPersonas = this.selectRelevantPersonas(basePersonas, agendaItems);
    return relevantPersonas;
  }

  private selectRelevantPersonas(personas: PersonaConfig[], agendaItems: any[]): PersonaConfig[] {
    const agendaText = agendaItems.map(item => item.text).join(' ').toLowerCase();
    
    const personaScores = personas.map(persona => {
      let score = 0;
      
      if (agendaText.includes('budget') || agendaText.includes('cost') || agendaText.includes('roi')) {
        score += persona.businessFocus;
      }
      
      if (agendaText.includes('technical') || agendaText.includes('implementation') || agendaText.includes('system')) {
        score += persona.technicalDepth;
      }
      
      if (agendaText.includes('user') || agendaText.includes('product') || agendaText.includes('feature')) {
        score += persona.businessFocus * 0.8;
      }
      
      if (agendaText.includes('sales') || agendaText.includes('market') || agendaText.includes('customer')) {
        score += persona.businessFocus * 0.9;
      }
      
      return { persona, score };
    });

    return personaScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(item => item.persona);
  }

  async generateFollowUpQuestions(practiceSessionId: string, currentTopic: string, userResponse: string): Promise<string[]> {
    const session = await this.prisma.practiceSession.findUnique({
      where: { id: practiceSessionId },
      include: {
        interactions: {
          include: { persona: true },
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
      },
    });

    if (!session) {
      throw new NotFoundException('Practice session not found');
    }

    const questions = this.generateContextualQuestions(currentTopic, userResponse, session.interactions);
    return questions;
  }

  private generateContextualQuestions(topic: string, response: string, interactions: any[]): string[] {
    const topicLower = topic.toLowerCase();
    const responseLower = response.toLowerCase();
    
    const questions = [];

    if (topicLower.includes('budget') || topicLower.includes('cost')) {
      questions.push(
        'Can you provide more specific cost breakdowns?',
        'What assumptions are you making in these estimates?',
        'How does this compare to alternative solutions?',
        'What\'s the payback period for this investment?'
      );
    }

    if (topicLower.includes('timeline') || topicLower.includes('schedule')) {
      questions.push(
        'What are the critical path dependencies?',
        'How will delays impact the overall project?',
        'What resources will be needed at each phase?',
        'Have you built in buffer time for unexpected issues?'
      );
    }

    if (topicLower.includes('technical') || topicLower.includes('implementation')) {
      questions.push(
        'What are the technical risks involved?',
        'How will this integrate with existing systems?',
        'What\'s the learning curve for the team?',
        'Have you considered the maintenance overhead?'
      );
    }

    if (topicLower.includes('user') || topicLower.includes('customer')) {
      questions.push(
        'How have you validated this with users?',
        'What\'s the user adoption strategy?',
        'How does this improve the user experience?',
        'What feedback have you received so far?'
      );
    }

    if (responseLower.includes('we think') || responseLower.includes('probably') || responseLower.includes('maybe')) {
      questions.push(
        'Can you provide more concrete evidence for that?',
        'What data supports this conclusion?',
        'Have you tested this assumption?',
        'What would you need to be more certain?'
      );
    }

    return questions.slice(0, 3);
  }

  async analyzeDeliveryFeedback(audioData: Buffer, transcript: string): Promise<DeliveryFeedback> {
    const words = transcript.toLowerCase().split(/\s+/);
    const fillerWords = this.detectFillerWords(words);
    const pacing = this.analyzePacing(audioData, words);
    const clarity = this.analyzeClarity(transcript);
    const confidence = this.analyzeConfidence(transcript);

    const overallScore = (pacing.score + clarity.score + confidence.score) / 3;

    return {
      pacing,
      clarity,
      fillerWords,
      confidence,
      overall: {
        score: overallScore,
        summary: this.generateOverallSummary(pacing, clarity, fillerWords, confidence),
        recommendations: this.generateRecommendations(pacing, clarity, fillerWords, confidence),
      },
    };
  }

  private detectFillerWords(words: string[]): { count: number; words: string[]; feedback: string } {
    const fillerWordList = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'literally', 'sort of', 'kind of'];
    const detected = words.filter(word => fillerWordList.includes(word));
    
    let feedback = '';
    if (detected.length > 10) {
      feedback = 'High use of filler words detected. Consider pausing instead of using filler words.';
    } else if (detected.length > 5) {
      feedback = 'Moderate use of filler words. Practice pausing to reduce them.';
    } else {
      feedback = 'Good control of filler words.';
    }

    return {
      count: detected.length,
      words: [...new Set(detected)],
      feedback,
    };
  }

  private analyzePacing(audioData: Buffer, words: string[]): { score: number; feedback: string; suggestions: string[] } {
    const wordCount = words.length;
    const estimatedDuration = audioData.length / 16000;
    const wordsPerMinute = (wordCount / estimatedDuration) * 60;

    let score = 0;
    let feedback = '';
    let suggestions: string[] = [];

    if (wordsPerMinute < 120) {
      score = 0.6;
      feedback = 'Speaking pace is slow. Consider picking up the pace slightly.';
      suggestions = ['Practice speaking at a moderate pace', 'Use more energy in your delivery'];
    } else if (wordsPerMinute > 200) {
      score = 0.7;
      feedback = 'Speaking pace is fast. Slow down for better comprehension.';
      suggestions = ['Take more pauses between points', 'Practice breathing exercises'];
    } else {
      score = 0.9;
      feedback = 'Good speaking pace. Maintain this rhythm.';
      suggestions = ['Continue with current pace', 'Use strategic pauses for emphasis'];
    }

    return { score, feedback, suggestions };
  }

  private analyzeClarity(transcript: string): { score: number; feedback: string; suggestions: string[] } {
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, sentence) => sum + sentence.split(' ').length, 0) / sentences.length;

    let score = 0;
    let feedback = '';
    let suggestions: string[] = [];

    if (avgSentenceLength > 25) {
      score = 0.6;
      feedback = 'Sentences are long and complex. Simplify for better clarity.';
      suggestions = ['Break down complex sentences', 'Use shorter, direct statements'];
    } else if (avgSentenceLength < 8) {
      score = 0.7;
      feedback = 'Sentences are very short. Vary sentence length for better flow.';
      suggestions = ['Combine related short sentences', 'Add transitional phrases'];
    } else {
      score = 0.9;
      feedback = 'Good sentence structure and clarity.';
      suggestions = ['Maintain current clarity', 'Use examples to illustrate points'];
    }

    return { score, feedback, suggestions };
  }

  private analyzeConfidence(transcript: string): { score: number; feedback: string } {
    const confidenceIndicators = {
      positive: ['confident', 'certain', 'definitely', 'clearly', 'obviously'],
      negative: ['maybe', 'perhaps', 'might', 'could', 'possibly', 'I think', 'we think'],
    };

    const words = transcript.toLowerCase().split(/\s+/);
    const positiveCount = words.filter(word => confidenceIndicators.positive.includes(word)).length;
    const negativeCount = words.filter(word => confidenceIndicators.negative.includes(word)).length;

    const score = Math.max(0.3, Math.min(1, 0.7 + (positiveCount * 0.1) - (negativeCount * 0.15)));

    let feedback = '';
    if (score > 0.8) {
      feedback = 'High confidence level detected. Maintain this assertive tone.';
    } else if (score > 0.6) {
      feedback = 'Moderate confidence level. Consider being more assertive.';
    } else {
      feedback = 'Low confidence indicators detected. Practice being more decisive.';
    }

    return { score, feedback };
  }

  private generateOverallSummary(pacing: any, clarity: any, fillerWords: any, confidence: any): string {
    const scores = [pacing.score, clarity.score, confidence.score];
    const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

    if (avgScore > 0.8) {
      return 'Excellent delivery! Your presentation was clear, well-paced, and confident.';
    } else if (avgScore > 0.6) {
      return 'Good delivery with room for improvement. Focus on the areas highlighted in feedback.';
    } else {
      return 'Delivery needs improvement. Practice the suggested techniques to enhance your presentation skills.';
    }
  }

  private generateRecommendations(pacing: any, clarity: any, fillerWords: any, confidence: any): string[] {
    const recommendations = [];

    if (pacing.score < 0.8) {
      recommendations.push(...pacing.suggestions);
    }

    if (clarity.score < 0.8) {
      recommendations.push(...clarity.suggestions);
    }

    if (fillerWords.count > 5) {
      recommendations.push('Practice pausing instead of using filler words');
      recommendations.push('Record yourself and identify filler word patterns');
    }

    if (confidence.score < 0.7) {
      recommendations.push('Use more assertive language');
      recommendations.push('Practice power poses before presenting');
      recommendations.push('Prepare thoroughly to boost confidence');
    }

    return recommendations.slice(0, 5);
  }

  private assessDifficulty(meeting: any, userRole: string): string {
    const agendaItems = meeting.agendaItems as any[] || [];
    const hasExternalAttendees = meeting.attendees.some((attendee: any) => 
      attendee.company && attendee.company !== 'Unknown Company'
    );

    let difficulty = 'beginner';

    if (agendaItems.length > 5 || hasExternalAttendees) {
      difficulty = 'advanced';
    } else if (agendaItems.length > 3) {
      difficulty = 'intermediate';
    }

    return difficulty;
  }

  private calculateSessionDuration(meeting: any): number {
    const agendaItems = meeting.agendaItems as any[] || [];
    const baseTime = 15;
    const itemTime = agendaItems.length * 5;
    return Math.min(baseTime + itemTime, 60);
  }

  private async seedPersonas(personas: PersonaConfig[], practiceSessionId: string): Promise<void> {
    for (const personaConfig of personas) {
      const persona = await this.prisma.persona.create({
        data: {
          name: personaConfig.name,
          role: personaConfig.role,
          company: personaConfig.company,
          personality: personaConfig.personality,
          background: personaConfig.background,
          expertise: personaConfig.expertise,
          communicationStyle: personaConfig.communicationStyle,
          typicalQuestions: personaConfig.typicalQuestions,
        },
      });

      await this.prisma.practiceInteraction.create({
        data: {
          practiceSessionId,
          speaker: persona.name,
          message: `Hello, I'm ${persona.name}, ${persona.role} at ${persona.company}. I'm ready to discuss ${persona.expertise.toLowerCase()}.`,
          messageType: 'introduction',
          personaId: persona.id,
          timestamp: new Date(),
        },
      });
    }
  }

  async getPracticeSession(sessionId: string): Promise<any> {
    return this.prisma.practiceSession.findUnique({
      where: { id: sessionId },
      include: {
        meeting: true,
        interactions: {
          include: { persona: true },
          orderBy: { timestamp: 'asc' },
        },
        feedback: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });
  }

  async saveInteraction(sessionId: string, speaker: string, message: string, messageType: string, personaId?: string): Promise<any> {
    return this.prisma.practiceInteraction.create({
      data: {
        practiceSessionId: sessionId,
        speaker,
        message,
        messageType,
        personaId,
        timestamp: new Date(),
      },
    });
  }

  async saveFeedback(sessionId: string, feedback: DeliveryFeedback): Promise<any> {
    const feedbackEntries = [];

    feedbackEntries.push({
      practiceSessionId: sessionId,
      type: 'delivery',
      category: 'pacing',
      score: feedback.pacing.score,
      feedback: feedback.pacing.feedback,
      suggestions: feedback.pacing.suggestions,
      timestamp: new Date(),
    });

    feedbackEntries.push({
      practiceSessionId: sessionId,
      type: 'delivery',
      category: 'clarity',
      score: feedback.clarity.score,
      feedback: feedback.clarity.feedback,
      suggestions: feedback.clarity.suggestions,
      timestamp: new Date(),
    });

    feedbackEntries.push({
      practiceSessionId: sessionId,
      type: 'delivery',
      category: 'filler_words',
      score: null,
      feedback: feedback.fillerWords.feedback,
      suggestions: feedback.fillerWords.words,
      timestamp: new Date(),
    });

    feedbackEntries.push({
      practiceSessionId: sessionId,
      type: 'delivery',
      category: 'confidence',
      score: feedback.confidence.score,
      feedback: feedback.confidence.feedback,
      suggestions: [],
      timestamp: new Date(),
    });

    feedbackEntries.push({
      practiceSessionId: sessionId,
      type: 'delivery',
      category: 'overall',
      score: feedback.overall.score,
      feedback: feedback.overall.summary,
      suggestions: feedback.overall.recommendations,
      timestamp: new Date(),
    });

    return this.prisma.practiceFeedback.createMany({
      data: feedbackEntries,
    });
  }
}