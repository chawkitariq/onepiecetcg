import type { DuelState } from '@onepiecetcg/shared';
import type { DomainEventDraft } from '../../duel-events/duel-domain-event.types';
import { DuelRoomEventOutbox } from './duel-room-event-outbox';

/**
 * Room-scoped facade over the duel event outbox.
 */
export class DuelRoomEventStream {
  public constructor(private readonly outbox: DuelRoomEventOutbox) {}

  /**
   * Ensures the persistent event stream exists for the provided state.
   */
  public async ensureInitialized(state: DuelState): Promise<void> {
    await this.outbox.ensureInitialized(state);
  }

  /**
   * Persists event drafts while letting the outbox report internal failures.
   */
  public async record(
    actorSessionId: string | undefined,
    eventDrafts: DomainEventDraft[],
  ): Promise<void> {
    await this.outbox.record(actorSessionId, eventDrafts);
  }

  /**
   * Persists event drafts and surfaces outbox failures to the caller.
   */
  public async recordOrThrow(
    actorSessionId: string | undefined,
    eventDrafts: DomainEventDraft[],
  ): Promise<void> {
    await this.outbox.recordOrThrow(actorSessionId, eventDrafts);
  }
}
