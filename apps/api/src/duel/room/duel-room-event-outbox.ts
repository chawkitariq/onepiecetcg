import type { DuelState } from '@onepiecetcg/shared';
import type { DomainEventDraft, PlayerId } from '../../duel-events/duel-domain-event.types';
import type { DuelDomainEventsService } from '../../duel-events/duel-domain-events.service';
import { buildInitialEventStreamDrafts } from './duel-room-event-drafts';

export type DuelRoomEventOutboxDeps = {
  duelEventsService?: DuelDomainEventsService;
  roomId: string;
  getPlayerId: (sessionId: string) => PlayerId;
  listParticipants: () => Array<{ authUserId: string; playerId: string }>;
  createCommandId: () => string;
  createActionId: () => string;
  reportPersistError: (error: unknown) => void;
};

/**
 * Owns duel event-stream initialization and outbox persistence, independent of
 * gameplay orchestration details.
 */
export class DuelRoomEventOutbox {
  private eventStreamCreated = false;

  public constructor(private readonly deps: DuelRoomEventOutboxDeps) {}

  /**
   * Returns whether the persistent event stream already exists for the room.
   */
  public hasStream(): boolean {
    return this.eventStreamCreated;
  }

  /**
   * Marks the event stream as already created, mainly for tests or recovered
   * room state.
   */
  public markStreamCreated(): void {
    this.eventStreamCreated = true;
  }

  /**
   * Ensures the persistent event stream exists, then emits the initial joined
   * players / locked decks / opening hand events.
   */
  public async ensureInitialized(state: DuelState): Promise<void> {
    if (this.eventStreamCreated || !this.deps.duelEventsService) {
      return;
    }

    await this.deps.duelEventsService.createStream({
      matchId: this.deps.roomId,
      actorPlayerId: undefined,
      engineVersion: 'duel-room-v1',
      rulesetVersion: '2026.07',
      matchCreatedPayload: {
        roomId: this.deps.roomId,
        createdAt: new Date().toISOString(),
      },
      participants: this.deps.listParticipants(),
    });

    this.eventStreamCreated = true;
    await this.recordOrThrow(
      undefined,
      buildInitialEventStreamDrafts(
        { getPlayerId: (sessionId) => this.deps.getPlayerId(sessionId) },
        state,
      ),
    );
  }

  /**
   * Persists events and swallows errors after reporting them.
   */
  public async record(
    actorSessionId: string | undefined,
    eventDrafts: DomainEventDraft[],
  ): Promise<void> {
    if (
      !this.deps.duelEventsService ||
      eventDrafts.length === 0 ||
      !this.eventStreamCreated
    ) {
      return;
    }

    try {
      await this.recordOrThrow(actorSessionId, eventDrafts);
    } catch (error) {
      this.deps.reportPersistError(error);
    }
  }

  /**
   * Persists events or throws when the underlying outbox operation fails.
   */
  public async recordOrThrow(
    actorSessionId: string | undefined,
    eventDrafts: DomainEventDraft[],
  ): Promise<void> {
    if (
      !this.deps.duelEventsService ||
      eventDrafts.length === 0 ||
      !this.eventStreamCreated
    ) {
      return;
    }

    await this.deps.duelEventsService.record({
      matchId: this.deps.roomId,
      actorPlayerId: actorSessionId
        ? this.deps.getPlayerId(actorSessionId)
        : undefined,
      commandId: this.deps.createCommandId(),
      actionId: this.deps.createActionId(),
      eventDrafts,
      engineVersion: 'duel-room-v1',
      rulesetVersion: '2026.07',
    });
  }
}
