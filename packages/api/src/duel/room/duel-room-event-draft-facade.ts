import type { DuelCard, DuelState } from '@onepiecetcg/shared';
import type { DomainEventDraft } from '../../duel-events/duel-domain-event.types';
import {
  buildCardMovementDrafts,
  buildMulliganEventDrafts,
  buildTerminalEventDrafts,
  buildTurnStepDrafts,
  buildTurnTransitionDrafts,
} from './duel-room-event-drafts';
import {
  captureCardLocations,
  captureCostZoneRestSnapshot,
  captureDuelStateSnapshot,
  captureOrderedZoneSnapshot,
  captureRefreshStepSnapshot,
  countNewlyRestedCostDonCards,
  findCardByInstanceId,
  type CardLocation,
  type CostZoneRestSnapshot,
  type DuelStateSnapshot,
  type OrderedZoneSnapshot,
  type RefreshStepSnapshot,
} from './duel-room-state-snapshot';

/**
 * Facade that groups the room-level snapshot capture and domain-event draft
 * helpers behind one player-id resolver.
 */
export class DuelRoomEventDraftFacade {
  public constructor(
    private readonly getPlayerId: (sessionId: string) => string,
  ) {}

  /**
   * Captures the minimal duel-state snapshot used for structural comparisons.
   */
  public captureStateSnapshot(state: DuelState): DuelStateSnapshot {
    return captureDuelStateSnapshot(state);
  }

  /**
   * Captures the current zone/location of every card in the duel state.
   */
  public captureCardLocations(state: DuelState): Map<string, CardLocation> {
    return captureCardLocations(state);
  }

  /**
   * Captures the refresh-step structural snapshot for a duel state.
   */
  public captureRefreshStepSnapshot(state: DuelState): RefreshStepSnapshot {
    return captureRefreshStepSnapshot(state);
  }

  /**
   * Captures the ordered card instance ids for one hidden ordered zone.
   */
  public captureOrderedZoneSnapshot(
    state: DuelState,
    zone: 'deck' | 'life',
  ): OrderedZoneSnapshot {
    return captureOrderedZoneSnapshot(state, zone);
  }

  /**
   * Captures the rested state of DON!! cards in cost areas.
   */
  public captureCostZoneRestSnapshot(state: DuelState): CostZoneRestSnapshot {
    return captureCostZoneRestSnapshot(state);
  }

  /**
   * Counts DON!! cards that became rested for one player between snapshots.
   */
  public countNewlyRestedCostDonCards(
    before: CostZoneRestSnapshot,
    state: DuelState,
    ownerSessionId: string,
  ): number {
    return countNewlyRestedCostDonCards(before, state, ownerSessionId);
  }

  /**
   * Finds a card by instance id within one duel state.
   */
  public findCardByInstanceId(
    state: DuelState,
    instanceId: string,
  ): DuelCard | null {
    return findCardByInstanceId(state, instanceId);
  }

  /**
   * Builds mulligan-related event drafts between two states.
   */
  public buildMulliganEventDrafts(
    before: DuelStateSnapshot,
    state: DuelState,
    actorSessionId: string,
    tookMulligan: boolean,
  ): DomainEventDraft[] {
    return buildMulliganEventDrafts(
      { getPlayerId: (sessionId) => this.getPlayerId(sessionId) },
      before,
      state,
      actorSessionId,
      tookMulligan,
    );
  }

  /**
   * Builds turn/phase transition event drafts.
   */
  public buildTurnTransitionDrafts(
    before: DuelStateSnapshot,
    state: DuelState,
  ): DomainEventDraft[] {
    return buildTurnTransitionDrafts(
      { getPlayerId: (sessionId) => this.getPlayerId(sessionId) },
      before,
      state,
    );
  }

  /**
   * Builds structural step event drafts for refresh/draw/DON!! transitions.
   */
  public buildTurnStepDrafts(
    before: DuelStateSnapshot,
    beforeLocations: Map<string, CardLocation>,
    beforeRefresh: RefreshStepSnapshot,
    state: DuelState,
  ): DomainEventDraft[] {
    return buildTurnStepDrafts(
      { getPlayerId: (sessionId) => this.getPlayerId(sessionId) },
      before,
      beforeLocations,
      beforeRefresh,
      state,
    );
  }

  /**
   * Builds card-movement event drafts across ordered hidden/public zones.
   */
  public buildCardMovementDrafts(
    beforeLocations: Map<string, CardLocation>,
    beforeDeckOrder: OrderedZoneSnapshot,
    beforeLifeOrder: OrderedZoneSnapshot,
    state: DuelState,
  ): DomainEventDraft[] {
    return buildCardMovementDrafts(
      { getPlayerId: (sessionId) => this.getPlayerId(sessionId) },
      beforeLocations,
      beforeDeckOrder,
      beforeLifeOrder,
      state,
    );
  }

  /**
   * Builds terminal game-end event drafts.
   */
  public buildTerminalEventDrafts(
    before: DuelStateSnapshot,
    state: DuelState,
  ): DomainEventDraft[] {
    return buildTerminalEventDrafts(
      { getPlayerId: (sessionId) => this.getPlayerId(sessionId) },
      before,
      state,
    );
  }
}
