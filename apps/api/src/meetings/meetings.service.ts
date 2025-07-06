import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateMeetingDto } from 'src/prisma/generated-dto/create-meeting.dto';
import { UpdateMeetingDto } from 'src/prisma/generated-dto/update-meeting.dto';
import { Meeting } from 'src/prisma/generated-dto/meeting.entity';
import { InviteUserDto } from './dto/invite-user.dto';

@Injectable()
export class MeetingsService {
  constructor(private readonly prisma: PrismaService) {}
  async inviteUser(
    meetingId: string,
    inviteUserDto: InviteUserDto,
  ): Promise<Meeting> {
    const { email } = inviteUserDto;
    const userToInvite = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!userToInvite) {
      throw new NotFoundException(`User with email "${email}" not found.`);
    }
    await this.findOne(meetingId);
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
  // eslint-disable-next-line prettier/prettier
  async create(createMeetingDto: CreateMeetingDto,creatorId: string): Promise<Meeting> {
    const { title } = createMeetingDto;

    const userExists = await this.prisma.user.findUnique({
      where: { clerkId: creatorId },
    });

    if (!userExists) {
      // eslint-disable-next-line prettier/prettier
      throw new NotFoundException(`User with Clerk ID "${creatorId}" not found.`);
    }
    return this.prisma.meeting.create({
      data: {
        title: title,
        creator: {
          connect: {
            clerkId: creatorId,
          },
        },
        attendees: {
          connect: {
            clerkId: creatorId,
          },
        },
      },
    });
  }
  async findAllForUser(userId: string): Promise<Meeting[]> {
    return this.prisma.meeting.findMany({
      where: {
        attendees: {
          some: {
            clerkId: userId,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string): Promise<Meeting> {
    const meeting = await this.prisma.meeting.findUnique({ where: { id } });
    if (!meeting) {
      throw new NotFoundException(`Meeting with ID "${id}" not found`);
    }
    return meeting;
  }
  // eslint-disable-next-line prettier/prettier
  async update(id: string, updateMeetingDto: UpdateMeetingDto): Promise<Meeting> {
    await this.findOne(id); // Ensure meeting exists
    return this.prisma.meeting.update({
      where: { id },
      data: updateMeetingDto,
    });
  }

  async remove(id: string): Promise<Meeting> {
    await this.findOne(id); // Ensure meeting exists
    return this.prisma.meeting.delete({ where: { id } });
  }
}
