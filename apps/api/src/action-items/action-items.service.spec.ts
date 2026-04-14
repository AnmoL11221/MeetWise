import { Test, TestingModule } from '@nestjs/testing';
import { ActionItemsService } from './action-items.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ForbiddenException } from '@nestjs/common';
import { NotificationsService } from '../notifications/notifications.service';

describe('ActionItemsService', () => {
  let service: ActionItemsService;
  let prisma: {
    meeting: { findUnique: jest.Mock };
    user: { findUnique: jest.Mock };
    actionItem: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };
  const notificationsService = {
    createForUser: jest.fn(),
  };

  beforeEach(async () => {
    prisma = {
      meeting: {
        findUnique: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
      },
      actionItem: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActionItemsService,
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

    service = module.get<ActionItemsService>(ActionItemsService);
  });

  it('blocks creating action items for non-members', async () => {
    prisma.meeting.findUnique.mockResolvedValue({
      id: 'meeting-1',
      creatorId: 'creator-user',
      attendees: [{ id: 'member-user' }],
    });

    await expect(
      service.create(
        {
          meetingId: 'meeting-1',
          description: 'Follow up',
        },
        'outsider-user',
      ),
    ).rejects.toThrow(ForbiddenException);
  });

  it('allows member to fetch action items', async () => {
    prisma.meeting.findUnique.mockResolvedValue({
      id: 'meeting-1',
      creatorId: 'creator-user',
      attendees: [{ id: 'member-user' }],
    });
    prisma.actionItem.findMany.mockResolvedValue([{ id: 'ai-1' }]);

    const result = await service.findAllForMeeting('meeting-1', 'member-user');

    expect(result).toEqual([{ id: 'ai-1' }]);
    expect(prisma.actionItem.findMany).toHaveBeenCalledWith({
      where: { meetingId: 'meeting-1' },
      include: {
        assignee: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('blocks updating action item for users outside the meeting', async () => {
    prisma.actionItem.findUnique.mockResolvedValue({
      id: 'ai-1',
      meetingId: 'meeting-1',
    });
    prisma.meeting.findUnique.mockResolvedValue({
      id: 'meeting-1',
      creatorId: 'creator-user',
      attendees: [{ id: 'member-user' }],
    });

    await expect(
      service.update('ai-1', { status: 'DONE' } as any, 'outsider-user'),
    ).rejects.toThrow(ForbiddenException);
  });
});
