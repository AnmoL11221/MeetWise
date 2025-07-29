import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  UseGuards, 
  Req, 
  UploadedFile, 
  UseInterceptors,
  BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AISparringService } from './ai-sparring.service';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

interface CreatePracticeSessionDto {
  meetingId: string;
  userRole: string;
  scenario: string;
}

interface SaveInteractionDto {
  speaker: string;
  message: string;
  messageType: string;
  personaId?: string;
}

@Controller('ai-sparring')
@UseGuards(ClerkAuthGuard)
export class AISparringController {
  constructor(
    private readonly aiSparringService: AISparringService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('practice-session')
  async createPracticeSession(
    @Body() createPracticeSessionDto: CreatePracticeSessionDto,
    @Req() req: Request
  ) {
    const clerkId = req.auth.sub;
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    
    if (!user) {
      return { statusCode: 404, message: 'User not found' };
    }

    try {
      const session = await this.aiSparringService.createPracticeSession(
        createPracticeSessionDto.meetingId,
        user.id,
        createPracticeSessionDto.userRole,
        createPracticeSessionDto.scenario
      );
      
      return session;
    } catch (error) {
      return {
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Failed to create practice session',
      };
    }
  }

  @Get('practice-session/:sessionId')
  async getPracticeSession(
    @Param('sessionId') sessionId: string,
    @Req() req: Request
  ) {
    const clerkId = req.auth.sub;
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    
    if (!user) {
      return { statusCode: 404, message: 'User not found' };
    }

    try {
      const session = await this.aiSparringService.getPracticeSession(sessionId);
      
      if (!session) {
        return { statusCode: 404, message: 'Practice session not found' };
      }

      if (session.userId !== user.id) {
        return { statusCode: 403, message: 'Access denied' };
      }

      return session;
    } catch (error) {
      return {
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Failed to get practice session',
      };
    }
  }

  @Post('practice-session/:sessionId/interaction')
  async saveInteraction(
    @Param('sessionId') sessionId: string,
    @Body() saveInteractionDto: SaveInteractionDto,
    @Req() req: Request
  ) {
    const clerkId = req.auth.sub;
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    
    if (!user) {
      return { statusCode: 404, message: 'User not found' };
    }

    try {
      const session = await this.aiSparringService.getPracticeSession(sessionId);
      
      if (!session) {
        return { statusCode: 404, message: 'Practice session not found' };
      }

      if (session.userId !== user.id) {
        return { statusCode: 403, message: 'Access denied' };
      }

      const interaction = await this.aiSparringService.saveInteraction(
        sessionId,
        saveInteractionDto.speaker,
        saveInteractionDto.message,
        saveInteractionDto.messageType,
        saveInteractionDto.personaId
      );

      return interaction;
    } catch (error) {
      return {
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Failed to save interaction',
      };
    }
  }

  @Post('practice-session/:sessionId/follow-up-questions')
  async generateFollowUpQuestions(
    @Param('sessionId') sessionId: string,
    @Body() body: { currentTopic: string; userResponse: string },
    @Req() req: Request
  ) {
    const clerkId = req.auth.sub;
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    
    if (!user) {
      return { statusCode: 404, message: 'User not found' };
    }

    try {
      const session = await this.aiSparringService.getPracticeSession(sessionId);
      
      if (!session) {
        return { statusCode: 404, message: 'Practice session not found' };
      }

      if (session.userId !== user.id) {
        return { statusCode: 403, message: 'Access denied' };
      }

      const questions = await this.aiSparringService.generateFollowUpQuestions(
        sessionId,
        body.currentTopic,
        body.userResponse
      );

      return { questions };
    } catch (error) {
      return {
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Failed to generate follow-up questions',
      };
    }
  }

  @Post('practice-session/:sessionId/analyze-delivery')
  @UseInterceptors(FileInterceptor('audio'))
  async analyzeDelivery(
    @Param('sessionId') sessionId: string,
    @UploadedFile() audioFile: Express.Multer.File,
    @Body() body: { transcript: string },
    @Req() req: Request
  ) {
    const clerkId = req.auth.sub;
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    
    if (!user) {
      return { statusCode: 404, message: 'User not found' };
    }

    if (!audioFile) {
      throw new BadRequestException('Audio file is required');
    }

    if (!body.transcript) {
      throw new BadRequestException('Transcript is required');
    }

    try {
      const session = await this.aiSparringService.getPracticeSession(sessionId);
      
      if (!session) {
        return { statusCode: 404, message: 'Practice session not found' };
      }

      if (session.userId !== user.id) {
        return { statusCode: 403, message: 'Access denied' };
      }

      const feedback = await this.aiSparringService.analyzeDeliveryFeedback(
        audioFile.buffer,
        body.transcript
      );

      await this.aiSparringService.saveFeedback(sessionId, feedback);

      return feedback;
    } catch (error) {
      return {
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Failed to analyze delivery',
      };
    }
  }

  @Post('practice-session/:sessionId/ai-response')
  async generateAIResponse(
    @Param('sessionId') sessionId: string,
    @Body() body: { personaId: string; context: string; userMessage: string },
    @Req() req: Request
  ) {
    const clerkId = req.auth.sub;
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    
    if (!user) {
      return { statusCode: 404, message: 'User not found' };
    }

    try {
      const session = await this.aiSparringService.getPracticeSession(sessionId);
      
      if (!session) {
        return { statusCode: 404, message: 'Practice session not found' };
      }

      if (session.userId !== user.id) {
        return { statusCode: 403, message: 'Access denied' };
      }

      const persona = await this.prisma.persona.findUnique({
        where: { id: body.personaId },
      });

      if (!persona) {
        return { statusCode: 404, message: 'Persona not found' };
      }

      const aiResponse = this.generatePersonaResponse(persona, body.context, body.userMessage);

      await this.aiSparringService.saveInteraction(
        sessionId,
        persona.name,
        aiResponse,
        'ai_response',
        persona.id
      );

      return { 
        speaker: persona.name,
        message: aiResponse,
        persona: {
          name: persona.name,
          role: persona.role,
          company: persona.company,
          expertise: persona.expertise,
        }
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Failed to generate AI response',
      };
    }
  }

  private generatePersonaResponse(persona: any, context: string, userMessage: string): string {
    const contextLower = context.toLowerCase();
    const userMessageLower = userMessage.toLowerCase();

    if (persona.role === 'CFO') {
      if (contextLower.includes('budget') || contextLower.includes('cost') || contextLower.includes('roi')) {
        return `As CFO, I need to see concrete numbers. ${userMessage} sounds promising, but what's the exact ROI calculation? What assumptions are you making about revenue growth and cost savings?`;
      }
      if (contextLower.includes('timeline') || contextLower.includes('schedule')) {
        return `Time is money. ${userMessage} - but how does this timeline impact our quarterly targets? What are the opportunity costs of this timeline?`;
      }
      return `I appreciate ${userMessage}, but I need to understand the financial implications. How does this align with our strategic objectives and what's the risk-adjusted return?`;
    }

    if (persona.role === 'Engineering Lead') {
      if (contextLower.includes('technical') || contextLower.includes('implementation')) {
        return `From a technical perspective, ${userMessage} raises some questions. How will this integrate with our existing architecture? What are the technical debt implications?`;
      }
      if (contextLower.includes('timeline') || contextLower.includes('schedule')) {
        return `The timeline for ${userMessage} seems aggressive. Have you considered the technical complexity and learning curve for the team? What about testing and deployment overhead?`;
      }
      return `I see the value in ${userMessage}, but I need to understand the technical feasibility. What are the system requirements and potential bottlenecks?`;
    }

    if (persona.role === 'Product Manager') {
      if (contextLower.includes('user') || contextLower.includes('customer')) {
        return `I like the direction of ${userMessage}, but how does this solve the user's core problem? What user research supports this approach?`;
      }
      if (contextLower.includes('feature') || contextLower.includes('product')) {
        return `${userMessage} sounds interesting, but how does this fit into our product roadmap? What are the success metrics we should track?`;
      }
      return `I appreciate ${userMessage}, but I need to understand the user impact. How does this improve the user experience and what's the adoption strategy?`;
    }

    if (persona.role === 'Sales Director') {
      if (contextLower.includes('sales') || contextLower.includes('customer')) {
        return `From a sales perspective, ${userMessage} could be compelling. How do we position this to customers? What's the competitive advantage?`;
      }
      if (contextLower.includes('market') || contextLower.includes('revenue')) {
        return `I see the potential in ${userMessage}, but how does this help us close more deals? What's the revenue impact and market opportunity?`;
      }
      return `I like ${userMessage}, but I need to understand how this helps our sales team. How do we communicate this value proposition to prospects?`;
    }

    return `Thank you for ${userMessage}. I'd like to understand more about how this aligns with our objectives and what the next steps would be.`;
  }
}