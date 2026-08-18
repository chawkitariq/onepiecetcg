import { Test, type TestingModule } from '@nestjs/testing';
jest.mock('@thallesp/nestjs-better-auth', () => ({
  AuthGuard: class AuthGuard {},
}));
import { PlayerAccountController } from './player-account.controller';
import { PlayerAccountService } from './player-account.service';

describe('PlayerAccountController', () => {
  let controller: PlayerAccountController;
  let accountsService: jest.Mocked<
    Pick<PlayerAccountService, 'findOrCreateForAuthUser' | 'deleteAccountForAuthUser'>
  >;

  beforeEach(async () => {
    accountsService = {
      findOrCreateForAuthUser: jest.fn(),
      deleteAccountForAuthUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayerAccountController],
      providers: [
        {
          provide: PlayerAccountService,
          useValue: accountsService,
        },
      ],
    }).compile();

    controller = module.get(PlayerAccountController);
  });

  it('hides anonymous emails from the /me payload', async () => {
    accountsService.findOrCreateForAuthUser.mockResolvedValue({
      id: 'player-1',
      authUserId: 'auth-user-guest',
      displayName: 'Q7mR2xK9vB4n',
      email: null,
      image: null,
      createdAt: new Date('2026-08-18T00:00:00.000Z'),
      updatedAt: new Date('2026-08-18T00:00:00.000Z'),
    } as never);

    const response = await controller.getCurrentProfile({
      user: {
        id: 'auth-user-guest',
        name: 'Q7mR2xK9vB4n',
        email: 'guest@local.dev',
        image: null,
        isAnonymous: true,
      },
    } as never);

    expect(response.user.email).toBeNull();
    expect(response.profile.email).toBeNull();
  });
});
