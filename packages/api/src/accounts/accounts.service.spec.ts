import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { AccountsService } from './accounts.service';
import { PlayerAccount } from './player-account.entity';

describe('AccountsService', () => {
  let service: AccountsService;
  let repository: jest.Mocked<
    Pick<Repository<PlayerAccount>, 'create' | 'findOne' | 'save'>
  >;

  beforeEach(async () => {
    repository = {
      create: jest.fn(
        (account: Partial<PlayerAccount>) => account as PlayerAccount,
      ),
      findOne: jest.fn(),
      save: jest.fn((account: PlayerAccount) => Promise.resolve(account)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountsService,
        {
          provide: getRepositoryToken(PlayerAccount),
          useValue: repository,
        },
      ],
    }).compile();

    service = module.get(AccountsService);
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
});
