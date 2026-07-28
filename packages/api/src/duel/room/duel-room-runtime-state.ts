import { DuelCard } from '@onepiecetcg/shared';
import type { DuelPlayer, DuelState } from '@onepiecetcg/shared';

type FindCardResult = { card: DuelCard; index: number } | null;

/**
 * Dependencies required by the low-level duel runtime state helper.
 */
export type DuelRoomRuntimeStateDeps = {
  state: DuelState;
};

/**
 * Owns low-level state traversal and DON!! utility operations that are shared
 * across the realtime room and the extracted duel engines.
 */
export class DuelRoomRuntimeState {
  public constructor(private readonly deps: DuelRoomRuntimeStateDeps) {}

  /**
   * Recomputes replicated hand/deck/life counters for one player.
   */
  public syncZoneCounts(player: DuelPlayer): void {
    player.handCount = player.zones.hand.length;
    player.deckCount = player.zones.deck.length;
    player.lifeCount = player.zones.life.length;
  }

  /**
   * Returns the first opposing player session id, if any.
   */
  public getOpponentSessionId(sessionId: string): string | null {
    return (
      Array.from(this.deps.state.players.keys()).find(
        (candidate) => candidate !== sessionId,
      ) ?? null
    );
  }

  /**
   * Returns whether a combat currently exists in replicated state.
   */
  public isCombatInProgress(): boolean {
    return this.deps.state.combat.attackerInstanceId !== '';
  }

  /**
   * Finds one card and its index in a mutable player zone.
   */
  public findCardInZone(
    player: DuelPlayer,
    zone: 'characters' | 'cost' | 'hand',
    instanceId: string,
  ): FindCardResult {
    const cards = player.zones[zone];

    for (let index = 0; index < cards.length; index += 1) {
      const card = cards[index];

      if (card?.instanceId === instanceId) {
        return { card, index };
      }
    }

    return null;
  }

  /**
   * Taps and returns the requested number of untapped DON!! cards from cost.
   */
  public takeUntappedDonCards(
    player: DuelPlayer,
    amount: number,
  ): DuelCard[] | null {
    const untapped: Array<{ card: DuelCard; index: number }> = [];

    for (let index = 0; index < player.zones.cost.length; index += 1) {
      const card = player.zones.cost[index];

      if (card && !card.rested) {
        untapped.push({ card, index });
      }

      if (untapped.length === amount) {
        break;
      }
    }

    if (untapped.length < amount) {
      return null;
    }

    for (const entry of untapped) {
      entry.card.rested = true;
    }

    return untapped.map((entry) => entry.card);
  }

  /**
   * Returns up to `amount` DON!! cards from cost matching an optional rested
   * filter, without mutating the zone.
   */
  public takeAttachableDonCards(
    player: DuelPlayer,
    amount: number,
    rested?: boolean,
  ): DuelCard[] {
    const matches: DuelCard[] = [];

    for (const card of player.zones.cost) {
      if (rested !== undefined && card.rested !== rested) {
        continue;
      }

      matches.push(card);

      if (matches.length === amount) {
        break;
      }
    }

    return matches;
  }

  /**
   * A DON!! card loses all attachments and becomes a brand-new tapped card in
   * the Cost zone whenever the attached card changes zone.
   */
  public returnDonToCost(
    player: DuelPlayer,
    sessionId: string,
    count: number,
  ): void {
    for (let index = 0; index < count; index += 1) {
      const returnedCard = new DuelCard();
      returnedCard.instanceId = `${sessionId}:don-returned:${Date.now()}:${index}:${Math.random()}`;
      returnedCard.ownerSessionId = sessionId;
      returnedCard.cardId = 'DON!!';
      returnedCard.number = 'DON!!';
      returnedCard.name = 'DON!!';
      returnedCard.type = 'DON!!';
      returnedCard.rested = true;
      player.zones.cost.push(returnedCard);
    }
  }

  /**
   * Returns battle power including the "during your turn" DON!! bonus.
   */
  public cardPower(card: DuelCard): number {
    const donBonus =
      card.ownerSessionId === this.deps.state.activePlayerSessionId
        ? card.attachedDon * 1000
        : 0;

    return Math.max(card.power, 0) + donBonus;
  }
}
