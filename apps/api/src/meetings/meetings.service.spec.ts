import { Test, TestingModule } from '@nestjs/testing';
import { MeetingsService } from './meetings.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';

describe('MeetingsService', () => {
  let service: MeetingsService;
  let prisma: {
    meeting: {
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    user: {
      findUnique: jest.Mock;
    };
  };
  const notificationsService = {
    createForUser: jest.fn(),
  };

  beforeEach(async () => {
    prisma = {
      meeting: {
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingsService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: NotificationsService,
          useValue: notificationsService,
        },
      ],
    }).compile();

    service = module.get<MeetingsService>(MeetingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('denies updates by non-creators', async () => {
    prisma.meeting.findUnique.mockResolvedValue({
      id: 'meeting-1',
      creatorId: 'creator-user',
      roomAccess: 'INVITE_ONLY',
      isPrivate: true,
      attendees: [{ id: 'member-user' }],
      creator: { clerkId: 'creator-clerk' },
    });

    await expect(
      service.update('meeting-1', { title: 'Updated' } as any, 'member-user'),
    ).rejects.toThrow(ForbiddenException);
  });

  it('allows updates by creator', async () => {
    prisma.meeting.findUnique.mockResolvedValue({
      id: 'meeting-1',
      creatorId: 'creator-user',
      roomAccess: 'INVITE_ONLY',
      isPrivate: true,
      attendees: [{ id: 'creator-user' }],
      creator: { clerkId: 'creator-clerk' },
    });
    prisma.meeting.update.mockResolvedValue({ id: 'meeting-1', title: 'Updated' });

    const result = await service.update(
      'meeting-1',
      { title: 'Updated' } as any,
      'creator-user',
    );

    expect(result).toEqual({ id: 'meeting-1', title: 'Updated' });
    expect(prisma.meeting.update).toHaveBeenCalledWith({
      where: { id: 'meeting-1' },
      data: { title: 'Updated' },
    });
  });

  it('denies delete for non-creators', async () => {
    prisma.meeting.findUnique.mockResolvedValue({
      id: 'meeting-1',
      creatorId: 'creator-user',
      roomAccess: 'INVITE_ONLY',
      isPrivate: true,
      attendees: [{ id: 'member-user' }],
      creator: { clerkId: 'creator-clerk' },
    });

    await expect(service.remove('meeting-1', 'member-user')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('returns creatorClerkId in findOne response', async () => {
    prisma.meeting.findUnique.mockResolvedValue({
      id: 'meeting-1',
      title: 'Planning',
      creatorId: 'creator-user',
      roomAccess: 'INVITE_ONLY',
      isPrivate: true,
      attendees: [{ id: 'creator-user' }],
      creator: { clerkId: 'creator-clerk' },
    });

    const result = await service.findOne('meeting-1', 'creator-user');

    expect((result as any).creatorId).toBe('creator-user');
    expect((result as any).creatorClerkId).toBe('creator-clerk');
  });
});
