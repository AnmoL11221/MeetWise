import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { BodyCreateMeetingDto } from './dto/body-create-meeting.dto';
import { UpdateMeetingDto } from '../prisma/generated-dto/update-meeting.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { ClerkUserService } from '../clerk/clerk-user.service';

@Controller('meetings')
@UseGuards(ClerkAuthGuard)
export class MeetingsController {
  constructor(
    private readonly meetingsService: MeetingsService,
    private readonly prisma: PrismaService,
    private readonly clerkUserService: ClerkUserService,
  ) {}

  @Post()
  async create(@Body() createMeetingDto: BodyCreateMeetingDto, @Req() req: Request) {
    const clerkId = req.auth.sub;
    const user = await this.clerkUserService.ensureUserExists(clerkId);
    if (!user) return null;
    return this.meetingsService.create(createMeetingDto, user.id);
  }

  @Get()
  async findAllForUser(@Req() req: Request) {
    const clerkId = req.auth.sub;
    const user = await this.clerkUserService.ensureUserExists(clerkId);
    if (!user) return [];
    return this.meetingsService.findAllForUser(user.id);
  }

  @Get('upcoming')
  async getUpcomingMeetings(
    @Req() req: Request,
    @Query('limit') limit?: string,
  ) {
    const clerkId = req.auth.sub;
    const user = await this.clerkUserService.ensureUserExists(clerkId);
    if (!user) return [];
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.meetingsService.getUpcomingMeetings(user.id, limitNum);
  }

  @Post(':id/invite')
  async inviteUser(
    @Param('id') id: string,
    @Body() inviteUserDto: InviteUserDto,
    @Req() req: Request,
  ) {
    const clerkId = req.auth.sub;
    const user = await this.clerkUserService.ensureUserExists(clerkId);
    if (!user) return null;
    return this.meetingsService.inviteUser(id, inviteUserDto, user.id);
  }

  @Post('templates')
  async createTemplate(
    @Body()
    body: {
      title: string;
      description?: string;
      agendaItems?: unknown;
      isPrivate?: boolean;
      roomAccess?: string;
    },
    @Req() req: Request,
  ) {
    const user = await this.clerkUserService.ensureUserExists(req.auth.sub);
    if (!user) return null;
    return this.meetingsService.createTemplate(user.id, body);
  }

  @Get('templates')
  async listTemplates(@Req() req: Request) {
    const user = await this.clerkUserService.ensureUserExists(req.auth.sub);
    if (!user) return [];
    return this.meetingsService.listTemplates(user.id);
  }

  @Patch('templates/:templateId')
  async updateTemplate(
    @Param('templateId') templateId: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      agendaItems?: unknown;
      isPrivate?: boolean;
      roomAccess?: string;
    },
    @Req() req: Request,
  ) {
    const user = await this.clerkUserService.ensureUserExists(req.auth.sub);
    if (!user) return null;
    return this.meetingsService.updateTemplate(templateId, user.id, body);
  }

  @Delete('templates/:templateId')
  async deleteTemplate(
    @Param('templateId') templateId: string,
    @Req() req: Request,
  ) {
    const user = await this.clerkUserService.ensureUserExists(req.auth.sub);
    if (!user) return null;
    return this.meetingsService.deleteTemplate(templateId, user.id);
  }

  @Post('templates/:templateId/create')
  async createFromTemplate(
    @Param('templateId') templateId: string,
    @Body() body: { scheduledAt?: string },
    @Req() req: Request,
  ) {
    const user = await this.clerkUserService.ensureUserExists(req.auth.sub);
    if (!user) return null;
    return this.meetingsService.createFromTemplate(
      templateId,
      user.id,
      body?.scheduledAt,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const clerkId = req.auth.sub;
    const user = await this.clerkUserService.ensureUserExists(clerkId);
    if (!user) return null;
    return this.meetingsService.findOne(id, user.id);
  }

  @Get(':id/attendees')
  async getAttendees(@Param('id') id: string, @Req() req: Request) {
    const clerkId = req.auth.sub;
    const user = await this.clerkUserService.ensureUserExists(clerkId);
    if (!user) return [];

    await this.meetingsService.findOne(id, user.id);

    const meeting = await this.prisma.meeting.findUnique({
      where: { id },
      include: { attendees: { select: { id: true, name: true, email: true } } },
    });
    return meeting?.attendees ?? [];
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateData: UpdateMeetingDto,
    @Req() req: Request,
  ) {
    const clerkId = req.auth.sub;
    const user = await this.clerkUserService.ensureUserExists(clerkId);
    if (!user) return null;
    return this.meetingsService.update(id, updateData, user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const clerkId = req.auth.sub;
    const user = await this.clerkUserService.ensureUserExists(clerkId);
    if (!user) return null;
    return this.meetingsService.remove(id, user.id);
  }

  @Post(':id/recurring/generate')
  async generateRecurring(
    @Param('id') id: string,
    @Req() req: Request,
    @Query('count') count?: string,
  ) {
    const user = await this.clerkUserService.ensureUserExists(req.auth.sub);
    if (!user) return [];
    return this.meetingsService.generateRecurringMeetings(
      id,
      user.id,
      count ? parseInt(count, 10) : 5,
    );
  }

  @Post(':id/summary/generate')
  async generateSummary(@Param('id') id: string, @Req() req: Request) {
    const user = await this.clerkUserService.ensureUserExists(req.auth.sub);
    if (!user) return null;
    return this.meetingsService.generateSummary(id, user.id);
  }

  @Get(':id/summary')
  async getSummary(@Param('id') id: string, @Req() req: Request) {
    const user = await this.clerkUserService.ensureUserExists(req.auth.sub);
    if (!user) return null;
    return this.meetingsService.getSummary(id, user.id);
  }
}
