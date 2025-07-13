/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { UpdateMeetingDto } from '../prisma/generated-dto/update-meeting.dto';
import { Meeting } from '../prisma/generated-dto/meeting.entity';
import { InviteUserDto } from './dto/invite-user.dto';

@Injectable()
export class MeetingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(title: string, creatorClerkId: string, agendaItems?: any): Promise<Meeting> {
    // Find user by clerkId instead of id
    const user = await this.prisma.user.findUnique({
      where: { clerkId: creatorClerkId },
    });

    if (!user) {
      throw new NotFoundException(`User with Clerk ID "${creatorClerkId}" not found. Please ensure your account is synced.`);
    }

    try {
      return await this.prisma.meeting.create({
        data: {
          title,
          agendaItems: agendaItems || undefined,
          creator: {
            connect: { id: user.id },
          },
          attendees: {
            connect: { id: user.id },
          },
        },
      });
    } catch (error) {
      // Enhanced error handling
      throw new Error('Failed to create meeting: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  async findAllForUser(userId: string): Promise<Meeting[]> {
    return this.prisma.meeting.findMany({
      where: {
        attendees: {
          some: {
            id: userId,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string): Promise<Meeting> {
    const meetingWithAttendees = await this.prisma.meeting.findUnique({
      where: { id },
      include: {
        attendees: { select: { id: true } },
      },
    });

    if (!meetingWithAttendees) {
      throw new NotFoundException(`Meeting with ID "${id}" not found`);
    }

    const isAuthorized =
      meetingWithAttendees.creatorId === userId ||
      meetingWithAttendees.attendees.some((attendee) => attendee.id === userId);

    if (!isAuthorized) {
      throw new UnauthorizedException(
        'You are not authorized to view this meeting.',
      );
    }

    const { attendees, ...meetingData } = meetingWithAttendees;
    return meetingData;
  }

  async inviteUser(
    meetingId: string,
    inviteUserDto: InviteUserDto,
  ): Promise<Meeting> {
    const userToInvite = await this.prisma.user.findUnique({
      where: { email: inviteUserDto.email },
    });

    if (!userToInvite) {
      throw new NotFoundException(
        `User with email "${inviteUserDto.email}" not found.`,
      );
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
    await this.findOne(id, userId);
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
}
