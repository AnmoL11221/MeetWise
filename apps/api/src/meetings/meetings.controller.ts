import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { ClerkAuthGuard } from '../guards/clerk-auth.guard';
import { BodyCreateMeetingDto } from './dto/body-create-meeting.dto';
import { UpdateMeetingDto } from '../prisma/generated-dto/update-meeting.dto';
import { Request } from 'express';
import { PrismaService } from 'prisma/prisma.service';
import { InviteUserDto } from './dto/invite-user.dto';

@Controller('meetings')
@UseGuards(ClerkAuthGuard)
export class MeetingsController {
  constructor(
    private readonly meetingsService: MeetingsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(@Body() body: BodyCreateMeetingDto, @Req() req: Request) {
    const clerkId = req.auth.sub;
    try {
      return await this.meetingsService.create(
        body.title,
        clerkId,
        body.agendaItems,
      );
    } catch (error) {
      return {
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Failed to create meeting',
      };
    }
  }

  @Post(':id/invite')
  async inviteUser(
    @Param('id') id: string,
    @Body() inviteUserDto: InviteUserDto,
    @Req() req: Request
  ) {
    const clerkId = req.auth.sub;
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) {
      return { statusCode: 404, message: 'User not found' };
    }
    return this.meetingsService.inviteUser(id, inviteUserDto);
  }

  @Get()
  async findAllForUser(@Req() req: Request) {
    const clerkId = req.auth.sub;
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    console.log('User lookup for clerkId', clerkId, '=>', user);
    if (!user) return [];
    return this.meetingsService.findAllForUser(user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const clerkId = req.auth.sub;
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) return null;
    return this.meetingsService.findOne(id, user.id);
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
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) return null;
    return this.meetingsService.update(id, updateData, user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: Request) {
    const clerkId = req.auth.sub;
    const user = await this.prisma.user.findUnique({ where: { clerkId } });
    if (!user) return null;
    return this.meetingsService.remove(id, user.id);
  }
}
