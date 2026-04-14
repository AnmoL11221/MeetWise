import { Test, TestingModule } from '@nestjs/testing';
import { AISparringController } from './ai-sparring.controller';
import { AISparringService } from './ai-sparring.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ClerkUserService } from '../clerk/clerk-user.service';

describe('AISparringController', () => {
  let controller: AISparringController;

  const aiSparringService = {
    createPracticeSession: jest.fn(),
    getPracticeSession: jest.fn(),
    saveInteraction: jest.fn(),
    generateFollowUpQuestions: jest.fn(),
    analyzeDeliveryFeedback: jest.fn(),
    saveFeedback: jest.fn(),
  };

  const prismaService = {
    persona: {
      findUnique: jest.fn(),
    },
  };

  const clerkUserService = {
    ensureUserExists: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AISparringController],
      providers: [
        { provide: AISparringService, useValue: aiSparringService },
        { provide: PrismaService, useValue: prismaService },
        { provide: ClerkUserService, useValue: clerkUserService },
      ],
    }).compile();

    controller = module.get<AISparringController>(AISparringController);
    jest.clearAllMocks();
  });

  it('returns user not found response when user cannot be resolved', async () => {
    clerkUserService.ensureUserExists.mockResolvedValue(null);

    const result = await controller.createPracticeSession(
      {
        meetingId: 'meeting-1',
        userRole: 'Presenter',
        scenario: 'Pitch Presentation',
      },
      { auth: { sub: 'clerk-1' } } as any,
    );

    expect(result).toEqual({ statusCode: 404, message: 'User not found' });
    expect(aiSparringService.createPracticeSession).not.toHaveBeenCalled();
  });

  it('returns access denied for session owned by different user', async () => {
    clerkUserService.ensureUserExists.mockResolvedValue({ id: 'user-1' });
    aiSparringService.getPracticeSession.mockResolvedValue({
      id: 'session-1',
      userId: 'other-user',
    });

    const result = await controller.getPracticeSession(
      'session-1',
      { auth: { sub: 'clerk-1' } } as any,
    );

    expect(result).toEqual({ statusCode: 403, message: 'Access denied' });
  });
});
