import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DataSource, In, LessThanOrEqual } from 'typeorm';
import { BetterAuthSession } from '../better-auth/better-auth-session.entity';
import { BetterAuthUser } from '../better-auth/better-auth-user.entity';
import { PlayerAccountService } from './player-account.service';

type AnonymousAuthUser = Pick<BetterAuthUser, 'id' | 'email'>;

/**
 * Removes anonymous accounts whose Better Auth sessions have expired.
 */
@Injectable()
export class AnonymousAccountCleanupService {
  private readonly logger = new Logger(AnonymousAccountCleanupService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly playerAccountService: PlayerAccountService,
  ) {}

  /**
   * Cleans up anonymous users that no longer have an active session.
   */
  @Cron(CronExpression.EVERY_HOUR, {
    name: 'anonymous-account-cleanup',
  })
  async cleanupExpiredAnonymousAccounts(): Promise<void> {
    const expiredSessions = await this.getExpiredSessions();
    const anonymousUsers =
      await this.getAnonymousUsersForExpiredSessions(expiredSessions);

    for (const user of anonymousUsers) {
      await this.playerAccountService.deleteAccountForAuthUser({
        id: user.id,
        email: user.email,
        isAnonymous: true,
      });
    }

    if (anonymousUsers.length > 0) {
      this.logger.log(
        `Deleted ${anonymousUsers.length} expired anonymous accounts.`,
      );
    }
  }

  private async getExpiredSessions(): Promise<ExpiredSession[]> {
    return await this.dataSource.getRepository(BetterAuthSession).find({
      select: {
        userId: true,
        expiresAt: true,
      },
      where: {
        expiresAt: LessThanOrEqual(new Date()),
      },
    });
  }

  private async getAnonymousUsersForExpiredSessions(
    expiredSessions: ExpiredSession[],
  ): Promise<AnonymousAuthUser[]> {
    if (expiredSessions.length === 0) {
      return [];
    }

    const userIds = [
      ...new Set(expiredSessions.map((session) => session.userId)),
    ];
    const anonymousUsers = await this.dataSource
      .getRepository(BetterAuthUser)
      .find({
        select: {
          id: true,
          email: true,
        },
        where: {
          isAnonymous: true,
          id: In(userIds),
        },
      });

    if (anonymousUsers.length === 0) {
      return [];
    }

    const sessions = await this.dataSource
      .getRepository(BetterAuthSession)
      .find({
        select: {
          userId: true,
          expiresAt: true,
        },
        where: {
          userId: In(anonymousUsers.map((user) => user.id)),
        },
      });

    const now = new Date();
    const sessionsByUserId = new Map<string, Date[]>();

    for (const session of sessions) {
      const userSessions = sessionsByUserId.get(session.userId) ?? [];
      userSessions.push(session.expiresAt);
      sessionsByUserId.set(session.userId, userSessions);
    }

    return anonymousUsers.filter((user) => {
      const userSessions = sessionsByUserId.get(user.id);

      if (!userSessions || userSessions.length === 0) {
        return false;
      }

      return userSessions.every((expiresAt) => expiresAt <= now);
    });
  }
}

type ExpiredSession = Pick<BetterAuthSession, 'userId' | 'expiresAt'>;
