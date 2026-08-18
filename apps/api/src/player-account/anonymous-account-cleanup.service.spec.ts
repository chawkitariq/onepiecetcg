import { Test, type TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { BetterAuthSession } from '../better-auth/better-auth-session.entity';
import { BetterAuthUser } from '../better-auth/better-auth-user.entity';
import { PlayerAccountService } from './player-account.service';
import { AnonymousAccountCleanupService } from './anonymous-account-cleanup.service';

describe('AnonymousAccountCleanupService', () => {
  let service: AnonymousAccountCleanupService;
  let dataSource: jest.Mocked<Pick<DataSource, 'getRepository'>>;
  let playerAccountService: jest.Mocked<
    Pick<PlayerAccountService, 'deleteAccountForAuthUser'>
  >;
  let userRepository: {
    find: jest.Mock;
  };
  let sessionRepository: {
    find: jest.Mock;
  };

  beforeEach(async () => {
    userRepository = {
      find: jest.fn(),
    };
    sessionRepository = {
      find: jest.fn(),
    };
    dataSource = {
      getRepository: jest.fn((entity) => {
        if (entity === BetterAuthUser) {
          return userRepository as never;
        }

        if (entity === BetterAuthSession) {
          return sessionRepository as never;
        }

        throw new Error(
          'Unexpected repository requested in AnonymousAccountCleanupService test',
        );
      }),
    };
    playerAccountService = {
      deleteAccountForAuthUser: jest.fn().mockResolvedValue({
        deleted: true as const,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnonymousAccountCleanupService,
        {
          provide: DataSource,
          useValue: dataSource,
        },
        {
          provide: PlayerAccountService,
          useValue: playerAccountService,
        },
      ],
    }).compile();

    service = module.get(AnonymousAccountCleanupService);
  });

  it('deletes anonymous users from expired sessions', async () => {
    const now = new Date();
    const expiredAt = new Date(now.getTime() - 60_000);
    const activeUntil = new Date(now.getTime() + 60_000);

    sessionRepository.find.mockResolvedValueOnce([
      { userId: 'anon-1', expiresAt: expiredAt },
      { userId: 'anon-2', expiresAt: expiredAt },
      { userId: 'anon-2', expiresAt: activeUntil },
    ]);
    userRepository.find.mockResolvedValueOnce([
      { id: 'anon-1', email: 'anon-1@local.dev' },
      { id: 'anon-2', email: 'anon-2@local.dev' },
      { id: 'anon-3', email: 'anon-3@local.dev' },
    ]);
    sessionRepository.find.mockResolvedValueOnce([
      { userId: 'anon-1', expiresAt: expiredAt },
      { userId: 'anon-2', expiresAt: expiredAt },
      { userId: 'anon-2', expiresAt: activeUntil },
    ]);

    await service.cleanupExpiredAnonymousAccounts();

    expect(sessionRepository.find).toHaveBeenCalledTimes(2);
    expect(userRepository.find).toHaveBeenCalledTimes(1);
    expect(sessionRepository.find.mock.invocationCallOrder[0]).toBeLessThan(
      userRepository.find.mock.invocationCallOrder[0],
    );
    expect(playerAccountService.deleteAccountForAuthUser).toHaveBeenCalledTimes(
      1,
    );
    expect(playerAccountService.deleteAccountForAuthUser).toHaveBeenCalledWith({
      id: 'anon-1',
      email: 'anon-1@local.dev',
      isAnonymous: true,
    });
  });

  it('skips cleanup when no expired sessions exist', async () => {
    sessionRepository.find.mockResolvedValueOnce([]);

    await service.cleanupExpiredAnonymousAccounts();

    expect(userRepository.find).not.toHaveBeenCalled();
    expect(
      playerAccountService.deleteAccountForAuthUser,
    ).not.toHaveBeenCalled();
  });
});
