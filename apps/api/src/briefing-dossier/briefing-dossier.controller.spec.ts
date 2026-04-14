import { Test, TestingModule } from '@nestjs/testing';
import { BriefingDossierController } from './briefing-dossier.controller';
import { BriefingDossierService } from './briefing-dossier.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ClerkUserService } from '../clerk/clerk-user.service';

describe('BriefingDossierController', () => {
  let controller: BriefingDossierController;

  const briefingDossierService = {
    getBriefingDossier: jest.fn(),
    generateBriefingDossier: jest.fn(),
  };

  const prismaService = {
    meeting: {
      findFirst: jest.fn(),
    },
  };

  const clerkUserService = {
    ensureUserExists: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BriefingDossierController],
      providers: [
        { provide: BriefingDossierService, useValue: briefingDossierService },
        { provide: PrismaService, useValue: prismaService },
        { provide: ClerkUserService, useValue: clerkUserService },
      ],
    }).compile();

    controller = module.get<BriefingDossierController>(BriefingDossierController);
    jest.clearAllMocks();
    clerkUserService.ensureUserExists.mockResolvedValue({ id: 'user-1' });
  });

  it('denies get dossier when user is not a meeting attendee', async () => {
    prismaService.meeting.findFirst.mockResolvedValue(null);

    const result = await controller.getBriefingDossier('meeting-1', {
      auth: { sub: 'clerk-1' },
    } as any);

    expect(result).toEqual({ statusCode: 403, message: 'Access denied' });
  });

  it('allows get dossier when user has access', async () => {
    prismaService.meeting.findFirst.mockResolvedValue({ id: 'meeting-1' });
    briefingDossierService.getBriefingDossier.mockResolvedValue({ id: 'dossier-1' });

    const result = await controller.getBriefingDossier('meeting-1', {
      auth: { sub: 'clerk-1' },
    } as any);

    expect(result).toEqual({ id: 'dossier-1' });
    expect(briefingDossierService.getBriefingDossier).toHaveBeenCalledWith(
      'meeting-1',
    );
  });
});
