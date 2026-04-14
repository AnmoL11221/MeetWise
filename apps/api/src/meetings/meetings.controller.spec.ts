import { Test, TestingModule } from '@nestjs/testing';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './meetings.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ClerkUserService } from '../clerk/clerk-user.service';

describe('MeetingsController', () => {
  let controller: MeetingsController;
  const meetingsService = {
    create: jest.fn(),
    findAllForUser: jest.fn(),
    getUpcomingMeetings: jest.fn(),
    findOne: jest.fn(),
    inviteUser: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const prismaService = {
    meeting: {
      findUnique: jest.fn(),
    },
  };
  const clerkUserService = {
    ensureUserExists: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeetingsController],
      providers: [
        { provide: MeetingsService, useValue: meetingsService },
        { provide: PrismaService, useValue: prismaService },
        { provide: ClerkUserService, useValue: clerkUserService },
      ],
    }).compile();

    controller = module.get<MeetingsController>(MeetingsController);
    jest.clearAllMocks();
    clerkUserService.ensureUserExists.mockResolvedValue({
      id: 'internal-user',
      clerkId: 'clerk-user',
      email: 'user@example.com',
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('passes internal user id to meetings service', async () => {
    meetingsService.findAllForUser.mockResolvedValue([]);

    await controller.findAllForUser({
      auth: { sub: 'clerk-user' },
    } as any);

    expect(meetingsService.findAllForUser).toHaveBeenCalledWith('internal-user');
  });

  it('authorizes attendee fetch through meetings service before querying attendees', async () => {
    meetingsService.findOne.mockResolvedValue({ id: 'meeting-1' });
    prismaService.meeting.findUnique.mockResolvedValue({
      attendees: [{ id: 'a1', name: 'Alex', email: 'alex@example.com' }],
    });

    const attendees = await controller.getAttendees('meeting-1', {
      auth: { sub: 'clerk-user' },
    } as any);

    expect(meetingsService.findOne).toHaveBeenCalledWith(
      'meeting-1',
      'internal-user',
    );
    expect(attendees).toHaveLength(1);
  });
});
