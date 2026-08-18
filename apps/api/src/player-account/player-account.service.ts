import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, type EntityManager, Repository } from 'typeorm';
import { BetterAuthAccount } from '../better-auth/better-auth-account.entity';
import { BetterAuthSession } from '../better-auth/better-auth-session.entity';
import { BetterAuthUser } from '../better-auth/better-auth-user.entity';
import { BetterAuthVerification } from '../better-auth/better-auth-verification.entity';
import { createRandomDisplayName } from '../common/display-name';
import { PlayerAccount } from './player-account.entity';

export type AuthenticatedUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  isAnonymous?: boolean;
};

@Injectable()
export class PlayerAccountService {
  constructor(
    @InjectRepository(PlayerAccount)
    private readonly accounts: Repository<PlayerAccount>,
    private readonly dataSource: DataSource,
  ) {}

  async findOrCreateForAuthUser(
    user: AuthenticatedUser,
  ): Promise<PlayerAccount> {
    const existing = await this.accounts.findOne({
      where: { authUserId: user.id },
    });
    const displayName = this.toDisplayName(user, existing?.displayName);

    if (!existing) {
      return this.accounts.save(
        this.accounts.create({
          authUserId: user.id,
          displayName,
          email: this.toPersistedEmail(user),
          image: user.image ?? null,
        }),
      );
    }

    existing.displayName = displayName;
    existing.email = this.toPersistedEmail(user);
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
    if (user.isAnonymous) {
      throw new ForbiddenException(
        'Les comptes anonymes ne peuvent pas etre supprimes.',
      );
    }

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

  private toDisplayName(
    user: AuthenticatedUser,
    existingDisplayName?: string | null,
  ): string {
    const trimmedName = user.name?.trim();

    if (trimmedName) {
      return trimmedName;
    }

    if (user.isAnonymous) {
      return existingDisplayName?.trim() || createRandomDisplayName();
    }

    return user.email?.split('@')[0] || `Player ${user.id.slice(0, 8)}`;
  }

  private toPersistedEmail(user: AuthenticatedUser): string | null {
    if (user.isAnonymous) {
      return null;
    }

    return user.email?.trim() || null;
  }
}
