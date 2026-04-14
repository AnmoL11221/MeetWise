/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateMeetingDto } from '../prisma/generated-dto/update-meeting.dto';
import { Meeting } from '../prisma/generated-dto/meeting.entity';
import { InviteUserDto } from './dto/invite-user.dto';
import { BodyCreateMeetingDto } from './dto/body-create-meeting.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MeetingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(
    createMeetingDto: BodyCreateMeetingDto,
    creatorUserId: string,
  ): Promise<Meeting> {
    const createdMeeting = await this.prisma.meeting.create({
      data: {
        title: createMeetingDto.title,
        description: createMeetingDto.description,
        scheduledAt: createMeetingDto.scheduledAt
          ? new Date(createMeetingDto.scheduledAt)
          : null,
        isPrivate: createMeetingDto.isPrivate ?? true,
        roomAccess: createMeetingDto.roomAccess ?? 'INVITE_ONLY',
        agendaItems: (createMeetingDto.agendaItems as any) || undefined,
        creatorId: creatorUserId,
        recurrencePattern: createMeetingDto.recurrencePattern ?? null,
        recurrenceInterval: createMeetingDto.recurrenceInterval ?? null,
        recurrenceEndDate: createMeetingDto.recurrenceEndDate
          ? new Date(createMeetingDto.recurrenceEndDate)
          : null,
        attendees: {
          connect: { id: creatorUserId },
        },
      },
    });
    return createdMeeting as unknown as Meeting;
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
    return {
      ...meetingData,
      creatorClerkId: creator?.clerkId,
    } as Meeting;
  }

  async inviteUser(
    meetingId: string,
    inviteUserDto: InviteUserDto,
    inviterUserId: string,
  ): Promise<Meeting> {
    // Check if inviter has permission to invite users
    const meeting = await this.findOne(meetingId, inviterUserId);
    
    if (
      meeting.creatorId !== inviterUserId &&
      meeting.roomAccess === 'RESTRICTED'
    ) {
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
      throw new BadRequestException('User is already an attendee of this meeting.');
    }

    const updated = await this.prisma.meeting.update({
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

    await this.createInviteNotification(
      userToInvite.id,
      userToInvite.email,
      meeting.title,
    );

    return updated;
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

  async createTemplate(userId: string, input: {
    title: string;
    description?: string;
    agendaItems?: unknown;
    isPrivate?: boolean;
    roomAccess?: string;
  }) {
    return this.prisma.meetingTemplate.create({
      data: {
        creatorId: userId,
        title: input.title,
        description: input.description,
        agendaItems: (input.agendaItems as any) ?? undefined,
        isPrivate: input.isPrivate ?? true,
        roomAccess: input.roomAccess ?? 'INVITE_ONLY',
      },
    });
  }

  async listTemplates(userId: string) {
    return this.prisma.meetingTemplate.findMany({
      where: { creatorId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateTemplate(
    templateId: string,
    userId: string,
    input: {
      title?: string;
      description?: string;
      agendaItems?: unknown;
      isPrivate?: boolean;
      roomAccess?: string;
    },
  ) {
    const template = await this.prisma.meetingTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template || template.creatorId !== userId) {
      throw new ForbiddenException('Template not found or access denied.');
    }
    return this.prisma.meetingTemplate.update({
      where: { id: templateId },
      data: {
        ...(input.title !== undefined ? { title: input.title } : {}),
        ...(input.description !== undefined ? { description: input.description } : {}),
        ...(input.agendaItems !== undefined
          ? { agendaItems: input.agendaItems as any }
          : {}),
        ...(input.isPrivate !== undefined ? { isPrivate: input.isPrivate } : {}),
        ...(input.roomAccess !== undefined ? { roomAccess: input.roomAccess } : {}),
      },
    });
  }

  async deleteTemplate(templateId: string, userId: string) {
    const template = await this.prisma.meetingTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template || template.creatorId !== userId) {
      throw new ForbiddenException('Template not found or access denied.');
    }
    return this.prisma.meetingTemplate.delete({
      where: { id: templateId },
    });
  }

  async createFromTemplate(
    templateId: string,
    userId: string,
    scheduledAt?: string,
  ) {
    const template = await this.prisma.meetingTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template || template.creatorId !== userId) {
      throw new ForbiddenException('Template not found or access denied.');
    }

    return this.prisma.meeting.create({
      data: {
        title: template.title,
        description: template.description,
        agendaItems: (template.agendaItems as any) ?? undefined,
        isPrivate: template.isPrivate,
        roomAccess: template.roomAccess,
        creatorId: userId,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        attendees: {
          connect: { id: userId },
        },
      },
    });
  }

  async generateRecurringMeetings(
    meetingId: string,
    userId: string,
    count = 5,
  ) {
    const meeting = await this.findOne(meetingId, userId);
    if (meeting.creatorId !== userId) {
      throw new ForbiddenException(
        'Only the meeting creator can generate recurring meetings.',
      );
    }
    if (!meeting.scheduledAt || !meeting.recurrencePattern) {
      throw new BadRequestException(
        'Meeting must have a schedule and recurrence pattern.',
      );
    }

    const interval = meeting.recurrenceInterval || 1;
    const createdMeetings: Meeting[] = [];
    let current = new Date(meeting.scheduledAt);

    for (let i = 0; i < count; i++) {
      current = this.getNextRecurringDate(
        current,
        meeting.recurrencePattern as string,
        interval,
      );

      if (meeting.recurrenceEndDate && current > new Date(meeting.recurrenceEndDate)) {
        break;
      }

      const created = await this.prisma.meeting.create({
        data: {
          title: meeting.title,
          description: meeting.description,
          agendaItems: (meeting.agendaItems as any) ?? undefined,
          isPrivate: meeting.isPrivate,
          roomAccess: meeting.roomAccess,
          creatorId: userId,
          scheduledAt: current,
          parentMeetingId: meeting.id,
          attendees: {
            connect: { id: userId },
          },
        },
      });
      createdMeetings.push(created as unknown as Meeting);
    }

    return createdMeetings;
  }

  async generateSummary(meetingId: string, userId: string) {
    const meeting = await this.findOne(meetingId, userId);
    const actionItems = await this.prisma.actionItem.findMany({
      where: { meetingId },
      orderBy: { createdAt: 'asc' },
    });

    const agenda = Array.isArray(meeting.agendaItems) ? meeting.agendaItems : [];
    const decisions = agenda
      .slice(0, 3)
      .map((item: any, idx: number) => `Decision ${idx + 1}: ${item?.text || 'Agenda alignment confirmed'}`);
    const nextSteps = actionItems.slice(0, 5).map((item) => ({
      description: item.description,
      status: item.status,
      dueDate: item.dueDate,
    }));

    const summaryText = [
      `Meeting "${meeting.title}" was reviewed with ${agenda.length} agenda item(s).`,
      meeting.description ? `Context: ${meeting.description}` : 'Context: No description provided.',
      `Generated ${nextSteps.length} actionable next step(s).`,
    ].join(' ');

    return this.prisma.meetingSummary.upsert({
      where: { meetingId },
      update: {
        summaryText,
        decisions,
        actionItems: nextSteps,
        generatedBy: userId,
      },
      create: {
        meetingId,
        summaryText,
        decisions,
        actionItems: nextSteps,
        generatedBy: userId,
      },
    });
  }

  async getSummary(meetingId: string, userId: string) {
    await this.findOne(meetingId, userId);
    return this.prisma.meetingSummary.findUnique({
      where: { meetingId },
    });
  }

  async createInviteNotification(
    invitedUserId: string,
    invitedUserEmail: string,
    meetingTitle: string,
  ) {
    return this.notificationsService.createForUser(invitedUserId, {
      type: 'MEETING_INVITE',
      title: 'You were invited to a meeting',
      body: `You have been invited to "${meetingTitle}".`,
      metadata: { meetingTitle },
      email: invitedUserEmail,
    });
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

  private getNextRecurringDate(
    date: Date,
    pattern: string,
    interval: number,
  ): Date {
    const next = new Date(date);
    if (pattern === 'DAILY') {
      next.setDate(next.getDate() + interval);
    } else if (pattern === 'WEEKLY') {
      next.setDate(next.getDate() + interval * 7);
    } else if (pattern === 'MONTHLY') {
      next.setMonth(next.getMonth() + interval);
    }
    return next;
  }
}
