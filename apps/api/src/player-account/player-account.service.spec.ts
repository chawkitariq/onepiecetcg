import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, type EntityManager, type Repository } from 'typeorm';
import { BetterAuthAccount } from '../better-auth/better-auth-account.entity';
import { BetterAuthSession } from '../better-auth/better-auth-session.entity';
import { BetterAuthUser } from '../better-auth/better-auth-user.entity';
import { BetterAuthVerification } from '../better-auth/better-auth-verification.entity';
import { createRandomDisplayName } from '../common/display-name';
import { PlayerAccountService } from './player-account.service';
import { PlayerAccount } from './player-account.entity';

jest.mock('../common/display-name', () => ({
  createRandomDisplayName: jest.fn(() => 'K7x9Q2mL4vP8'),
}));

describe('PlayerAccountService', () => {
  let service: PlayerAccountService;
  let repository: jest.Mocked<
    Pick<Repository<PlayerAccount>, 'create' | 'findOne' | 'save'>
  >;
  let dataSource: jest.Mocked<Pick<DataSource, 'transaction'>>;
  let manager: jest.Mocked<
    Pick<EntityManager, 'delete' | 'createQueryBuilder'>
  >;
  let verificationDeleteBuilder: {
    delete: jest.Mock;
    from: jest.Mock;
    where: jest.Mock;
    execute: jest.Mock;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    repository = {
      create: jest.fn(
        (account: Partial<PlayerAccount>) => account as PlayerAccount,
      ),
      findOne: jest.fn(),
      save: jest.fn((account: PlayerAccount) => Promise.resolve(account)),
    };
    verificationDeleteBuilder = {
      delete: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue(undefined),
    };
    manager = {
      delete: jest.fn().mockResolvedValue({ affected: 1 }),
      createQueryBuilder: jest.fn(() => verificationDeleteBuilder),
    };
    dataSource = {
      transaction: jest.fn(
        async (callback: (entityManager: EntityManager) => Promise<unknown>) =>
          await callback(manager as unknown as EntityManager),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayerAccountService,
        {
          provide: getRepositoryToken(PlayerAccount),
          useValue: repository,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = module.get(PlayerAccountService);
  });

  it('creates a persistent player account for a new auth user', async () => {
    repository.findOne.mockResolvedValue(null);

    const account = await service.findOrCreateForAuthUser({
      id: 'auth-user-1',
      name: 'Monkey D. Luffy',
      email: 'luffy@example.test',
      image: 'https://example.test/luffy.png',
    });

    expect(repository.create).toHaveBeenCalledWith({
      authUserId: 'auth-user-1',
      displayName: 'Monkey D. Luffy',
      email: 'luffy@example.test',
      image: 'https://example.test/luffy.png',
    });
    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(account.displayName).toBe('Monkey D. Luffy');
  });

  it('reuses and refreshes the existing player account on reconnect', async () => {
    const existing = {
      id: 'account-1',
      authUserId: 'auth-user-1',
      displayName: 'Old name',
      email: null,
      image: null,
    } as PlayerAccount;
    repository.findOne.mockResolvedValue(existing);

    const account = await service.findOrCreateForAuthUser({
      id: 'auth-user-1',
      name: 'Roronoa Zoro',
      email: 'zoro@example.test',
    });

    expect(repository.create).not.toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledWith(existing);
    expect(account.displayName).toBe('Roronoa Zoro');
    expect(account.email).toBe('zoro@example.test');
  });

  it('assigns a coherent random display name to a new anonymous user', async () => {
    repository.findOne.mockResolvedValue(null);

    const account = await service.findOrCreateForAuthUser({
      id: 'auth-user-guest',
      email: 'guest@local.dev',
      isAnonymous: true,
    });

    expect(createRandomDisplayName).toHaveBeenCalledTimes(1);
    expect(repository.create).toHaveBeenCalledWith({
      authUserId: 'auth-user-guest',
      displayName: 'K7x9Q2mL4vP8',
      email: null,
      image: null,
    });
    expect(account.displayName).toBe('K7x9Q2mL4vP8');
  });

  it('keeps the existing anonymous display name on reconnect', async () => {
    const existing = {
      id: 'account-guest',
      authUserId: 'auth-user-guest',
      displayName: 'Silver Tide',
      email: null,
      image: null,
    } as PlayerAccount;
    repository.findOne.mockResolvedValue(existing);

    const account = await service.findOrCreateForAuthUser({
      id: 'auth-user-guest',
      email: 'guest@local.dev',
      isAnonymous: true,
    });

    expect(createRandomDisplayName).not.toHaveBeenCalled();
    expect(repository.save).toHaveBeenCalledWith(existing);
    expect(account.displayName).toBe('Silver Tide');
  });

  it('clears any anonymous email before persisting the account', async () => {
    repository.findOne.mockResolvedValue(null);

    await service.findOrCreateForAuthUser({
      id: 'auth-user-guest',
      name: null,
      email: 'guest@local.dev',
      isAnonymous: true,
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        authUserId: 'auth-user-guest',
        email: null,
      }),
    );
  });

  it('deletes auth rows and the persistent account in one transaction', async () => {
    await expect(
      service.deleteAccountForAuthUser({
        id: 'auth-user-1',
        email: 'nami@example.test',
      }),
    ).resolves.toEqual({ deleted: true });

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(verificationDeleteBuilder.delete).toHaveBeenCalledTimes(1);
    expect(verificationDeleteBuilder.from).toHaveBeenCalledWith(
      BetterAuthVerification,
    );
    expect(verificationDeleteBuilder.where).toHaveBeenCalledWith(
      'identifier IN (:...identifiers)',
      { identifiers: ['auth-user-1', 'nami@example.test'] },
    );
    expect(manager.delete).toHaveBeenNthCalledWith(1, PlayerAccount, {
      authUserId: 'auth-user-1',
    });
    expect(manager.delete).toHaveBeenNthCalledWith(2, BetterAuthSession, {
      userId: 'auth-user-1',
    });
    expect(manager.delete).toHaveBeenNthCalledWith(3, BetterAuthAccount, {
      userId: 'auth-user-1',
    });
    expect(manager.delete).toHaveBeenNthCalledWith(4, BetterAuthUser, {
      id: 'auth-user-1',
    });
  });

  it('deletes anonymous accounts through the same transactional cleanup flow', async () => {
    await expect(
      service.deleteAccountForAuthUser({
        id: 'auth-user-guest',
        email: 'guest@local.dev',
        isAnonymous: true,
      }),
    ).resolves.toEqual({ deleted: true });

    expect(dataSource.transaction).toHaveBeenCalledTimes(1);
    expect(verificationDeleteBuilder.delete).toHaveBeenCalledTimes(1);
    expect(verificationDeleteBuilder.from).toHaveBeenCalledWith(
      BetterAuthVerification,
    );
    expect(verificationDeleteBuilder.where).toHaveBeenCalledWith(
      'identifier IN (:...identifiers)',
      { identifiers: ['auth-user-guest', 'guest@local.dev'] },
    );
    expect(manager.delete).toHaveBeenNthCalledWith(1, PlayerAccount, {
      authUserId: 'auth-user-guest',
    });
    expect(manager.delete).toHaveBeenNthCalledWith(2, BetterAuthSession, {
      userId: 'auth-user-guest',
    });
    expect(manager.delete).toHaveBeenNthCalledWith(3, BetterAuthAccount, {
      userId: 'auth-user-guest',
    });
    expect(manager.delete).toHaveBeenNthCalledWith(4, BetterAuthUser, {
      id: 'auth-user-guest',
    });
  });
});
