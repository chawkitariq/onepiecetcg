import { ArraySchema } from '@colyseus/schema';
import { DuelCard } from '@onepiecetcg/shared';
import type { DuelPlayer, DuelState } from '@onepiecetcg/shared';

type FindCardResult = { card: DuelCard; index: number } | null;

type ZoneEngineEffectBoundary = {
  reapplyContinuousEffects(): void;
  applyMoveReplacement(
    playerSessionId: string,
    sourceInstanceId: string,
    destinationPlayerSessionId: string,
    destinationZone: string,
  ): boolean;
};

/**
 * Dependencies required by the structural zone/state mutation engine.
 */
export type DuelZoneEngineDeps = {
  state: DuelState;
  effectBoundary: ZoneEngineEffectBoundary;
  broadcastCardView: (card: DuelCard) => void;
  syncZoneCounts: (player: DuelPlayer) => void;
  findCardInZone: (
    player: DuelPlayer,
    zone: 'characters' | 'cost',
    instanceId: string,
  ) => FindCardResult;
  takeAttachableDonCards: (
    player: DuelPlayer,
    amount: number,
    rested?: boolean,
  ) => DuelCard[];
};

/**
 * Owns low-level duel state mutations shared by the realtime room and the
 * effect boundary: moving cards, drawing, trashing, and DON!! transfers.
 */
export class DuelZoneEngine {
  public constructor(private readonly deps: DuelZoneEngineDeps) {}

  /**
   * Moves a card from its current zone to another owned zone and refreshes
   * replicated visibility/counts accordingly.
   */
  public moveCardToZone(
    card: DuelCard,
    destinationPlayerSessionId: string,
    destinationZone: string,
    options?: { faceDown?: boolean; rested?: boolean; toBottom?: boolean },
  ): void {
    if (
      this.deps.effectBoundary.applyMoveReplacement(
        card.ownerSessionId,
        card.instanceId,
        destinationPlayerSessionId,
        destinationZone,
      )
    ) {
      return;
    }

    this.removeCardFromCurrentZone(card.instanceId);
    const destinationPlayer = this.deps.state.players.get(
      destinationPlayerSessionId,
    );

    if (!destinationPlayer) {
      return;
    }

    card.ownerSessionId = destinationPlayerSessionId;
    card.faceDown = options?.faceDown ?? false;
    card.rested = options?.rested ?? false;
    card.playedThisTurn = false;

    if (destinationZone === 'leader') {
      destinationPlayer.zones.leader = card;
    } else if (destinationZone === 'stage') {
      destinationPlayer.zones.stage = card;
    } else {
      const zone =
        destinationPlayer.zones[
          destinationZone as keyof typeof destinationPlayer.zones
        ];

      if (zone instanceof ArraySchema) {
        if (destinationZone === 'trash') {
          this.unshiftIntoZone(zone, card);
        } else if (destinationZone === 'life' && options?.toBottom) {
          zone.push(card);
        } else if (destinationZone === 'life') {
          this.unshiftIntoZone(zone, card);
        } else if (destinationZone === 'deck' && options?.toBottom) {
          zone.push(card);
        } else if (destinationZone === 'deck') {
          this.unshiftIntoZone(zone, card);
        } else {
          zone.push(card);
        }
      }
    }

    this.deps.broadcastCardView(card);
    this.deps.syncZoneCounts(destinationPlayer);
    this.deps.effectBoundary.reapplyContinuousEffects();
  }

  /**
   * Draws one card from deck to hand for effect resolution only.
   */
  public drawCardForEffect(playerSessionId: string): DuelCard | null {
    const player = this.deps.state.players.get(playerSessionId);
    const card = player?.zones.deck.shift();

    if (!player || !card) {
      return null;
    }

    card.faceDown = false;
    player.zones.hand.push(card);
    this.deps.syncZoneCounts(player);
    return card;
  }

  /**
   * Moves cards from the top of deck to trash, revealing them publicly.
   */
  public trashTopDeckCards(
    playerSessionId: string,
    amount: number,
  ): DuelCard[] {
    const player = this.deps.state.players.get(playerSessionId);
    const moved: DuelCard[] = [];

    if (!player) {
      return moved;
    }

    for (let index = 0; index < amount; index += 1) {
      const card = player.zones.deck.shift();

      if (!card) {
        break;
      }

      card.faceDown = false;
      this.unshiftIntoZone(player.zones.trash, card);
      this.deps.broadcastCardView(card);
      moved.push(card);
    }

    this.deps.syncZoneCounts(player);
    return moved;
  }

  /**
   * Moves DON!! cards from the DON!! deck into the cost area.
   */
  public addDonToCost(
    playerSessionId: string,
    amount: number,
    rested: boolean,
  ): number {
    const player = this.deps.state.players.get(playerSessionId);

    if (!player) {
      return 0;
    }

    let moved = 0;

    for (let index = 0; index < amount; index += 1) {
      const card = player.zones.donDeck.shift();

      if (!card) {
        break;
      }

      card.rested = rested;
      player.zones.cost.push(card);
      moved += 1;
    }

    return moved;
  }

  /**
   * Attaches DON!! from the cost area to a leader or character.
   */
  public attachDonFromCost(
    playerSessionId: string,
    targetInstanceId: string,
    amount: number,
    options?: { rested?: boolean },
  ): number {
    const player = this.deps.state.players.get(playerSessionId);

    if (!player || amount <= 0) {
      return 0;
    }

    const target =
      player.zones.leader.instanceId === targetInstanceId
        ? player.zones.leader
        : this.deps.findCardInZone(player, 'characters', targetInstanceId)
            ?.card;

    if (!target) {
      return 0;
    }

    const donCards = this.deps.takeAttachableDonCards(
      player,
      amount,
      options?.rested,
    );

    if (donCards.length === 0) {
      return 0;
    }

    let attached = 0;

    for (const donCard of donCards) {
      const index = player.zones.cost.indexOf(donCard);

      if (index >= 0) {
        player.zones.cost.splice(index, 1);
        attached += 1;
      }
    }

    target.attachedDon += attached;
    return attached;
  }

  /**
   * Returns DON!! cards from the cost area back to the DON!! deck.
   */
  public returnEffectDonToDeck(
    playerSessionId: string,
    amount: number,
  ): number {
    const player = this.deps.state.players.get(playerSessionId);

    if (!player) {
      return 0;
    }

    let removed = 0;

    while (removed < amount && player.zones.cost.length > 0) {
      const card = player.zones.cost.pop();

      if (!card) {
        break;
      }

      card.rested = false;
      player.zones.donDeck.push(card);
      removed += 1;
    }

    return removed;
  }

  /**
   * Inserts a card at the front of a Colyseus ArraySchema without detaching its
   * change tree, which can happen with `ArraySchema#unshift()` on moved cards.
   */
  private unshiftIntoZone(zone: ArraySchema<DuelCard>, card: DuelCard): void {
    zone.push(card);
    zone.move(() => {
      for (let index = zone.length - 1; index > 0; index -= 1) {
        [zone[index], zone[index - 1]] = [zone[index - 1], zone[index]];
      }
    });
  }

  private removeCardFromCurrentZone(instanceId: string): DuelCard | null {
    for (const player of this.deps.state.players.values()) {
      for (const zone of [
        'deck',
        'donDeck',
        'hand',
        'life',
        'characters',
        'cost',
        'trash',
      ] as const) {
        const index = player.zones[zone].findIndex(
          (card) => card.instanceId === instanceId,
        );

        if (index >= 0) {
          return player.zones[zone].splice(index, 1)[0] ?? null;
        }
      }

      if (player.zones.stage.instanceId === instanceId) {
        const stage = player.zones.stage;
        player.zones.stage = new DuelCard();
        return stage;
      }
    }

    return null;
  }
}
