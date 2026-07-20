import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerAccount } from './player-account.entity';

export type AuthenticatedUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(PlayerAccount)
    private readonly accounts: Repository<PlayerAccount>,
  ) {}

  async findOrCreateForAuthUser(
    user: AuthenticatedUser,
  ): Promise<PlayerAccount> {
    const displayName = this.toDisplayName(user);
    const existing = await this.accounts.findOne({
      where: { authUserId: user.id },
    });

    if (!existing) {
      return this.accounts.save(
        this.accounts.create({
          authUserId: user.id,
          displayName,
          email: user.email ?? null,
          image: user.image ?? null,
        }),
      );
    }

    existing.displayName = displayName;
    existing.email = user.email ?? null;
    existing.image = user.image ?? null;

    return this.accounts.save(existing);
  }

  private toDisplayName(user: AuthenticatedUser): string {
    const trimmedName = user.name?.trim();

    if (trimmedName) {
      return trimmedName;
    }

    return user.email?.split('@')[0] || `Player ${user.id.slice(0, 8)}`;
  }
}
