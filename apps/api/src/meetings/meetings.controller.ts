import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, Query, ForbiddenException } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { BodyCreateMeetingDto } from './dto/body-create-meeting.dto';
import { UpdateMeetingDto } from '../prisma/generated-dto/update-meeting.dto';
import { InviteUserDto } from './dto/invite-user.dto';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Controller('meetings')
@UseGuards(ClerkAuthGuard)
export class MeetingsController {
  constructor(
    private readonly meetingsService: MeetingsService,
    private readonly prisma: PrismaService,
  ) {}

  private async ensureUserExists(clerkId: string) {
    let user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      // Try to get user info from Clerk
      try {
        const { clerkClient } = await import('@clerk/clerk-sdk-node');
        const clerkUser = await clerkClient.users.getUser(clerkId);
        if (clerkUser && clerkUser.emailAddresses.length > 0) {
          user = await this.prisma.user.create({
            data: {
              clerkId: clerkId,
              email: clerkUser.emailAddresses[0].emailAddress,
              name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'New User',
            },
          });
        }
      } catch (error) {
        console.error('Failed to create user from Clerk:', error);
        throw new Error('User not found and could not be created');
      }
    }
    return user;
  }

  @Post()
  async create(@Body() createMeetingDto: BodyCreateMeetingDto, @Req() req: Request) {
    const clerkId = req.auth.sub;
    const user = await this.ensureUserExists(clerkId);
    if (!user) return null;
    return this.meetingsService.create(createMeetingDto, user.id);
  }

  @Get()
  async findAllForUser(@Req() req: Request) {
    const clerkId = req.auth.sub;
    const user = await this.ensureUserExists(clerkId);
    if (!user) return [];
    return this.meetingsService.findAllForUser(user.id);
  }

  @Get('upcoming')
  async getUpcomingMeetings(
    @Req() req: Request,
    @Query('limit') limit?: string
  ) {
    const clerkId = req.auth.sub;
    const user = await this.ensureUserExists(clerkId);
    if (!user) return [];
    const limitNum = limit ? parseInt(limit, 10) : 5;
    return this.meetingsService.getUpcomingMeetings(user.id, limitNum);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const clerkId = req.auth.sub;
    const user = await this.ensureUserExists(clerkId);
    if (!user) return null;
    return this.meetingsService.findOne(id, user.id);
  }

  @Post(':id/invite')
  async inviteUser(
    @Param('id') id: string,
    @Body() inviteUserDto: InviteUserDto,
    @Req() req: Request
  ) {
    const clerkId = req.auth.sub;
    const user = await this.ensureUserExists(clerkId);
    if (!user) return null;
    return this.meetingsService.inviteUser(id, inviteUserDto, user.id);
  }

  @Get(':id/attendees')
  async getAttendees(@Param('id') id: string) {
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
    const user = await this.ensureUserExists(clerkId);
    if (!user) return null;
    return this.meetingsService.update(id, updateData, user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const clerkId = req.auth.sub;
    const user = await this.ensureUserExists(clerkId);
    if (!user) return null;
    return this.meetingsService.remove(id, user.id);
  }
}
