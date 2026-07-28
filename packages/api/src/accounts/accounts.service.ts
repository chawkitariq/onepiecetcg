import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, type EntityManager, Repository } from 'typeorm';
import { BetterAuthAccount } from '../auth/better-auth-account.entity';
import { BetterAuthSession } from '../auth/better-auth-session.entity';
import { BetterAuthUser } from '../auth/better-auth-user.entity';
import { BetterAuthVerification } from '../auth/better-auth-verification.entity';
import { PlayerAccount } from './player-account.entity';

export type AuthenticatedUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isAnonymous?: boolean;
};

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(PlayerAccount)
    private readonly accounts: Repository<PlayerAccount>,
    private readonly dataSource: DataSource,
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

  /**
   * Deletes the authenticated account and all owned data in one transaction.
   *
   * Shared match-result rows are preserved for the surviving opponent by
   * nulling the deleted side's foreign keys instead of cascading the entire
   * record away.
   */
  async deleteAccountForAuthUser(
    user: AuthenticatedUser,
  ): Promise<{ deleted: true }> {
    await this.dataSource.transaction(async (manager) => {
      await this.deleteBetterAuthVerifications(manager, user);
      await manager.delete(PlayerAccount, { authUserId: user.id });
      await manager.delete(BetterAuthSession, { userId: user.id });
      await manager.delete(BetterAuthAccount, { userId: user.id });
      await manager.delete(BetterAuthUser, { id: user.id });
    });

    return { deleted: true };
  }

  private async deleteBetterAuthVerifications(
    manager: EntityManager,
    user: AuthenticatedUser,
  ): Promise<void> {
    const identifiers = [user.id, user.email?.trim()].filter(
      (identifier): identifier is string => Boolean(identifier),
    );

    if (identifiers.length === 0) {
      return;
    }

    await manager
      .createQueryBuilder()
      .delete()
      .from(BetterAuthVerification)
      .where('identifier IN (:...identifiers)', { identifiers })
      .execute();
  }

  private toDisplayName(user: AuthenticatedUser): string {
    const trimmedName = user.name?.trim();

    if (trimmedName) {
      return trimmedName;
    }

    if (user.isAnonymous) {
      return `Guest ${user.id.slice(0, 8)}`;
    }

    return user.email?.split('@')[0] || `Player ${user.id.slice(0, 8)}`;
  }
}
