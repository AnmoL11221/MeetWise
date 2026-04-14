import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { BriefingDossierService } from './briefing-dossier.service';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { ClerkUserService } from '../clerk/clerk-user.service';

@Controller('briefing-dossier')
@UseGuards(ClerkAuthGuard)
export class BriefingDossierController {
  constructor(
    private readonly briefingDossierService: BriefingDossierService,
    private readonly prisma: PrismaService,
    private readonly clerkUserService: ClerkUserService,
  ) {}

  private async ensureMeetingAccess(meetingId: string, userId: string) {
    const meeting = await this.prisma.meeting.findFirst({
      where: {
        id: meetingId,
        attendees: {
          some: {
            id: userId,
          },
        },
      },
      select: { id: true },
    });
    return !!meeting;
  }

  @Get(':meetingId')
  async getBriefingDossier(@Param('meetingId') meetingId: string, @Req() req: Request) {
    const clerkId = req.auth.sub;
    const user = await this.clerkUserService.ensureUserExists(clerkId);
    
    if (!user) {
      return { statusCode: 404, message: 'User not found' };
    }

    const hasAccess = await this.ensureMeetingAccess(meetingId, user.id);
    if (!hasAccess) {
      return { statusCode: 403, message: 'Access denied' };
    }

    try {
      return await this.briefingDossierService.getBriefingDossier(meetingId);
    } catch (error) {
      return {
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Failed to get briefing dossier',
      };
    }
  }

  @Post(':meetingId/generate')
  async generateBriefingDossier(@Param('meetingId') meetingId: string, @Req() req: Request) {
    const clerkId = req.auth.sub;
    const user = await this.clerkUserService.ensureUserExists(clerkId);
    
    if (!user) {
      return { statusCode: 404, message: 'User not found' };
    }

    const hasAccess = await this.ensureMeetingAccess(meetingId, user.id);
    if (!hasAccess) {
      return { statusCode: 403, message: 'Access denied' };
    }

    try {
      return await this.briefingDossierService.generateBriefingDossier(meetingId);
    } catch (error) {
      return {
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Failed to generate briefing dossier',
      };
    }
  }
}