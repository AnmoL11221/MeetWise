/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateMeetingDto } from '../prisma/generated-dto/update-meeting.dto';
import { Meeting } from '../prisma/generated-dto/meeting.entity';
import { InviteUserDto } from './dto/invite-user.dto';
import { BodyCreateMeetingDto } from './dto/body-create-meeting.dto';

@Injectable()
export class MeetingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createMeetingDto: BodyCreateMeetingDto,
    creatorUserId: string,
  ): Promise<Meeting> {
    try {
      const createdMeeting = await this.prisma.meeting.create({
        data: {
          title: createMeetingDto.title,
          description: createMeetingDto.description,
          scheduledAt: createMeetingDto.scheduledAt ? new Date(createMeetingDto.scheduledAt) : null,
          isPrivate: createMeetingDto.isPrivate ?? true,
          roomAccess: createMeetingDto.roomAccess ?? 'INVITE_ONLY',
          agendaItems: (createMeetingDto.agendaItems as any) || undefined,
          creatorId: creatorUserId,
          attendees: {
            connect: { id: creatorUserId },
          },
        },
      });
      return createdMeeting as unknown as Meeting;
    } catch (error) {
      throw new Error(
        'Failed to create meeting: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    }
  }

  async findAllForUser(userId: string): Promise<Meeting[]> {
    return (this.prisma.meeting.findMany({
      where: {
        attendees: {
          some: {
            id: userId,
          },
        },
      },
      orderBy: [
        { scheduledAt: 'asc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        title: true,
        description: true,
        scheduledAt: true,
        isPrivate: true,
        roomAccess: true,
        agendaItems: true,
        createdAt: true,
        updatedAt: true,
        creatorId: true,
      },
    }) as unknown) as Meeting[];
  }

  async findOne(id: string, userId: string): Promise<Meeting> {
    const meetingWithAttendees = await this.prisma.meeting.findUnique({
      where: { id },
      include: {
        attendees: { select: { id: true } },
        creator: { select: { clerkId: true } },
      },
    });

    if (!meetingWithAttendees) {
      throw new NotFoundException(`Meeting with ID "${id}" not found`);
    }

    // Check if user has access to this meeting
    const isAuthorized = this.checkMeetingAccess(meetingWithAttendees, userId);

    if (!isAuthorized) {
      throw new UnauthorizedException(
        'You are not authorized to view this meeting.',
      );
    }

    const { attendees, creator, ...meetingData } = meetingWithAttendees as any;
    return { ...meetingData, creatorId: creator?.clerkId ?? meetingData.creatorId } as Meeting;
  }

  async inviteUser(
    meetingId: string,
    inviteUserDto: InviteUserDto,
    inviterUserId: string,
  ): Promise<Meeting> {
    // Check if inviter has permission to invite users
    const meeting = await this.findOne(meetingId, inviterUserId);
    
    if (meeting.creatorId !== inviterUserId && meeting.roomAccess === 'RESTRICTED') {
      throw new ForbiddenException('Only the meeting creator can invite users to this meeting.');
    }

    const userToInvite = await this.prisma.user.findUnique({
      where: { email: inviteUserDto.email },
    });

    if (!userToInvite) {
      throw new NotFoundException(
        `User with email "${inviteUserDto.email}" not found.`,
      );
    }

    // Check if user is already an attendee
    const existingAttendee = await this.prisma.meeting.findFirst({
      where: {
        id: meetingId,
        attendees: {
          some: {
            id: userToInvite.id,
          },
        },
      },
    });

    if (existingAttendee) {
      throw new Error('User is already an attendee of this meeting.');
    }

    return this.prisma.meeting.update({
      where: { id: meetingId },
      data: {
        attendees: {
          connect: {
            id: userToInvite.id,
          },
        },
      },
      include: {
        attendees: true,
      },
    });
  }

  async update(
    id: string,
    updateData: UpdateMeetingDto,
    userId: string,
  ): Promise<Meeting> {
    const meeting = await this.findOne(id, userId);
    
    // Only creator can update meeting settings
    if (meeting.creatorId !== userId) {
      throw new ForbiddenException('Only the meeting creator can update meeting settings.');
    }

    return this.prisma.meeting.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: string, userId: string): Promise<Meeting> {
    const meeting = await this.findOne(id, userId);
    if (meeting.creatorId !== userId) {
      throw new UnauthorizedException(
        'Only the meeting creator can delete it.',
      );
    }
    return this.prisma.meeting.delete({ where: { id } });
  }

  async getUpcomingMeetings(userId: string, limit: number = 5): Promise<Meeting[]> {
    const rows = await this.prisma.meeting.findMany({
      where: {
        attendees: {
          some: {
            id: userId,
          },
        },
        scheduledAt: {
          gte: new Date(),
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        scheduledAt: true,
        isPrivate: true,
        roomAccess: true,
        createdAt: true,
        updatedAt: true,
        creatorId: true,
        agendaItems: true,
      },
    });
    return rows as unknown as Meeting[];
  }

  private checkMeetingAccess(meeting: any, userId: string): boolean {
    // Creator always has access
    if (meeting.creatorId === userId) {
      return true;
    }

    // Check if user is an attendee
    const isAttendee = meeting.attendees.some((attendee: any) => attendee.id === userId);
    if (isAttendee) {
      return true;
    }

    // Public meetings are accessible to everyone
    if (!meeting.isPrivate && meeting.roomAccess === 'PUBLIC') {
      return true;
    }

    return false;
  }
}
