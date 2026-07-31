import { Injectable, Logger } from '@nestjs/common';
import type { CanonicalDomainEvent } from './duel-domain-event.types';

/**
 * Placeholder canonical bus publisher. The outbox/relay contract is live even
 * before external consumers are connected; integrations can replace this
 * implementation later without changing gameplay code.
 */
@Injectable()
export class DuelEventBusService {
  private readonly logger = new Logger(DuelEventBusService.name);

  /** Publishes a batch of canonical events to the current downstream bus. */
  public publish(events: CanonicalDomainEvent[]): Promise<void> {
    if (events.length === 0) {
      return Promise.resolve();
    }

    this.logger.debug(
      `Published ${events.length} duel event(s) for match ${events[0]?.matchId ?? 'unknown'}.`,
    );

    return Promise.resolve();
  }
}
