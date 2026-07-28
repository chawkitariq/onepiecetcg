import type {
  DuelCard,
  DuelState,
  EffectTargetSelector,
} from '@onepiecetcg/shared';

/**
 * Dependencies required to resolve cards and selectors against the replicated
 * duel state without coupling that traversal logic to the Colyseus room.
 */
export type DuelCardQueryEngineDeps = {
  state: DuelState;
  getOpponentSessionId: (sessionId: string) => string | null;
  cardPower: (card: DuelCard) => number;
};

/**
 * Owns read-only board traversal and selector filtering for effect targeting
 * and card lookups.
 */
export class DuelCardQueryEngine {
  public constructor(private readonly deps: DuelCardQueryEngineDeps) {}

  /**
   * Returns a card by runtime instance id, regardless of its current zone.
   */
  public getCardByInstanceId(instanceId: string): DuelCard | null {
    for (const player of this.deps.state.players.values()) {
      if (player.zones.leader.instanceId === instanceId) {
        return player.zones.leader;
      }

      if (player.zones.stage.instanceId === instanceId) {
        return player.zones.stage;
      }

      for (const zone of [
        'deck',
        'donDeck',
        'hand',
        'life',
        'characters',
        'cost',
        'trash',
      ] as const) {
        const found = player.zones[zone].find(
          (card) => card.instanceId === instanceId,
        );

        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  /**
   * Resolves an authored effect selector against the current duel state.
   */
  public getCardsForSelector(
    selector: EffectTargetSelector,
    controllerSessionId: string,
  ): DuelCard[] {
    const sessionIds =
      selector.player === 'self'
        ? [controllerSessionId]
        : selector.player === 'opponent'
          ? [this.deps.getOpponentSessionId(controllerSessionId)].filter(
              Boolean,
            )
          : Array.from(this.deps.state.players.keys());

    const matches: DuelCard[] = [];

    for (const sessionId of sessionIds) {
      const player = sessionId
        ? this.deps.state.players.get(sessionId)
        : undefined;

      if (!player) {
        continue;
      }

      for (const zone of selector.zones) {
        const cards =
          zone === 'leader'
            ? [player.zones.leader]
            : zone === 'stage'
              ? player.zones.stage.instanceId
                ? [player.zones.stage]
                : []
              : Array.from(player.zones[zone] ?? []);

        for (const card of cards) {
          if (
            this.cardMatchesSelectorFilter(
              card,
              selector.filter,
              controllerSessionId,
            )
          ) {
            matches.push(card);
          }
        }
      }
    }

    return matches;
  }

  private cardMatchesSelectorFilter(
    card: DuelCard,
    filter: EffectTargetSelector['filter'],
    controllerSessionId: string,
  ): boolean {
    if (!filter) {
      return true;
    }

    if (filter.cardCategory && !filter.cardCategory.includes(card.type)) {
      return false;
    }

    if (typeof filter.costMax === 'number' && card.cost > filter.costMax) {
      return false;
    }

    if (typeof filter.costMin === 'number' && card.cost < filter.costMin) {
      return false;
    }

    if (
      typeof filter.powerMax === 'number' &&
      this.deps.cardPower(card) > filter.powerMax
    ) {
      return false;
    }

    if (
      typeof filter.powerMin === 'number' &&
      this.deps.cardPower(card) < filter.powerMin
    ) {
      return false;
    }

    if (
      filter.color &&
      !filter.color.some((color: string) =>
        card.colors.includes(color as never),
      )
    ) {
      return false;
    }

    if (
      filter.trait &&
      !filter.trait.some((trait: string) => card.families.includes(trait))
    ) {
      return false;
    }

    if (filter.name && !filter.name.includes(card.name)) {
      return false;
    }

    if (filter.excludeName && filter.excludeName.includes(card.name)) {
      return false;
    }

    if (typeof filter.rested === 'boolean' && card.rested !== filter.rested) {
      return false;
    }

    if (
      filter.owner === 'self' &&
      card.ownerSessionId !== controllerSessionId
    ) {
      return false;
    }

    if (
      filter.owner === 'opponent' &&
      card.ownerSessionId === controllerSessionId
    ) {
      return false;
    }

    return true;
  }
}
