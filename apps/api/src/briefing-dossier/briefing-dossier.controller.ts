import { Controller, Get, Post, Param, UseGuards, Req } from '@nestjs/common';
import { BriefingDossierService } from './briefing-dossier.service';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('briefing-dossier')
@UseGuards(ClerkAuthGuard)
export class BriefingDossierController {
  constructor(
    private readonly briefingDossierService: BriefingDossierService,
    private readonly prisma: PrismaService,
  ) {}

  @Get(':meetingId')
  async getBriefingDossier(@Param('meetingId') meetingId: string, @Req() req: Request) {
    const clerkId = req.auth.sub;
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    
    if (!user) {
      return { statusCode: 404, message: 'User not found' };
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
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    
    if (!user) {
      return { statusCode: 404, message: 'User not found' };
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