import type {
  EffectCardFilter,
  EffectOwnerSelector,
  EffectTargetSelector,
} from '@onepiecetcg/shared';
import type { DuelCard, DuelPlayer } from '@onepiecetcg/shared';
import type {
  EffectEngineHost,
  EffectResolutionContext,
} from './effect-engine-types';

/**
 * Resolves authored selectors and filters against the live duel state.
 */
export class EffectSelectorResolver {
  public constructor(private readonly host: EffectEngineHost) {}

  /** Resolves a player selector into a concrete session id when possible. */
  public resolvePlayer(
    selector: EffectOwnerSelector,
    controllerSessionId: string,
  ): string | null {
    if (selector === 'self') {
      return controllerSessionId;
    }

    if (selector === 'opponent') {
      return this.host.getOpponentSessionId(controllerSessionId);
    }

    return controllerSessionId;
  }

  /** Resolves which player must answer a selection prompt. */
  public resolveSelectorChooser(
    selector: EffectTargetSelector,
    controllerSessionId: string,
  ): string {
    return (
      this.resolvePlayer(selector.chooser ?? 'self', controllerSessionId) ??
      controllerSessionId
    );
  }

  /** Returns cards matching a selector after local filter refinements. */
  public getSelectableCards(
    selector: EffectTargetSelector,
    controllerSessionId: string,
    context: EffectResolutionContext,
  ): DuelCard[] {
    return this.host
      .getCards(selector, controllerSessionId)
      .filter((card) =>
        this.matchesSelector(card, selector, controllerSessionId, context),
      );
  }

  /** Checks whether a selector currently has enough valid candidates. */
  public hasSelectableCards(
    selector: EffectTargetSelector,
    controllerSessionId: string,
  ): boolean {
    const available = this.host.getCards(selector, controllerSessionId).length;
    const count = selector.count ?? {
      kind: 'exact' as const,
      value: available,
    };

    if (count.kind === 'upTo') {
      return available > 0 || count.value === 0;
    }

    return available >= count.value;
  }

  /** Evaluates the filter part of a selector against a concrete card. */
  public matchesFilter(
    card: DuelCard,
    filter: EffectCardFilter | undefined,
    controllerSessionId: string,
    context?: EffectResolutionContext,
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

    if (filter.costMaxFromLifeOf) {
      const playerId = this.resolvePlayer(
        filter.costMaxFromLifeOf,
        controllerSessionId,
      );
      const player = playerId ? this.host.getPlayer(playerId) : undefined;
      const maxCost = player?.zones.life.length ?? -1;

      if (card.cost > maxCost) {
        return false;
      }
    }

    if (typeof filter.costMin === 'number' && card.cost < filter.costMin) {
      return false;
    }

    if (
      typeof filter.baseCostMax === 'number' &&
      card.baseCost > filter.baseCostMax
    ) {
      return false;
    }

    if (
      typeof filter.baseCostMin === 'number' &&
      card.baseCost < filter.baseCostMin
    ) {
      return false;
    }

    if (typeof filter.powerMax === 'number' && card.power > filter.powerMax) {
      return false;
    }

    if (typeof filter.powerMin === 'number' && card.power < filter.powerMin) {
      return false;
    }

    if (
      typeof filter.basePowerMax === 'number' &&
      card.basePower > filter.basePowerMax
    ) {
      return false;
    }

    if (
      typeof filter.basePowerMin === 'number' &&
      card.basePower < filter.basePowerMin
    ) {
      return false;
    }

    if (
      filter.color &&
      !filter.color.some((color) => card.colors.includes(color))
    ) {
      return false;
    }

    if (
      filter.attribute &&
      !filter.attribute.some((attribute) => card.attributes.includes(attribute))
    ) {
      return false;
    }

    if (filter.differentColorThanStoredSelection) {
      const storedCard =
        context?.storedSelections[
          filter.differentColorThanStoredSelection
        ]?.[0];

      if (
        storedCard &&
        card.colors.some((color) => storedCard.colors.includes(color))
      ) {
        return false;
      }
    }

    if (
      filter.trait &&
      !filter.trait.some((trait) => card.families.includes(trait))
    ) {
      return false;
    }

    if (filter.name && !filter.name.includes(card.name)) {
      return false;
    }

    if (filter.excludeName && filter.excludeName.includes(card.name)) {
      return false;
    }

    if (filter.hasNoBaseEffect === true && (card.text.length > 0 || card.trigger.length > 0)) {
      return false;
    }

    if (filter.hasTrigger === true && card.trigger.length === 0) {
      return false;
    }

    if (filter.hasTrigger === false && card.trigger.length > 0) {
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

    if (filter.zonePosition) {
      const located = this.findZoneOfCard(card);

      if (!located) {
        return false;
      }

      const zoneCards = located.player.zones[
        located.zone as keyof typeof located.player.zones
      ];

      if (
        !zoneCards ||
        typeof (zoneCards as { length?: number }).length !== 'number'
      ) {
        return false;
      }

      const orderedCards = Array.from(zoneCards as Iterable<DuelCard>);

      const isTop = orderedCards[0]?.instanceId === card.instanceId;
      const isBottom =
        orderedCards[orderedCards.length - 1]?.instanceId === card.instanceId;

      if (filter.zonePosition === 'top' && !isTop) {
        return false;
      }

      if (filter.zonePosition === 'bottom' && !isBottom) {
        return false;
      }

      if (filter.zonePosition === 'topOrBottom' && !isTop && !isBottom) {
        return false;
      }
    }

    return true;
  }

  /** Collects every card currently in play for observer-style trigger scans. */
  public collectInPlayCards(): DuelCard[] {
    const cards: DuelCard[] = [];

    for (const player of this.host.state.players.values()) {
      cards.push(player.zones.leader, ...player.zones.characters);

      if (player.zones.stage.instanceId) {
        cards.push(player.zones.stage);
      }
    }

    return cards;
  }

  /** Collects every card owned by one player across every gameplay zone. */
  public collectPlayerCards(player: DuelPlayer): DuelCard[] {
    return [
      player.zones.leader,
      ...(player.zones.stage.instanceId ? [player.zones.stage] : []),
      ...player.zones.deck,
      ...player.zones.donDeck,
      ...player.zones.hand,
      ...player.zones.life,
      ...player.zones.characters,
      ...player.zones.cost,
      ...player.zones.trash,
    ];
  }

  /** Counts DON!! both in cost and attached to cards on the owner's field. */
  public countTotalDonOnField(playerSessionId: string | null): number {
    if (!playerSessionId) {
      return 0;
    }

    const player = this.host.getPlayer(playerSessionId);

    if (!player) {
      return 0;
    }

    const inPlayCards = [
      player.zones.leader,
      ...player.zones.characters,
      ...(player.zones.stage.instanceId ? [player.zones.stage] : []),
    ];

    return (
      player.zones.cost.length +
      inPlayCards.reduce((sum, card) => sum + card.attachedDon, 0)
    );
  }

  /** Finds the zone that currently contains the given card instance. */
  public findZoneOfCard(
    card: DuelCard,
  ): { player: DuelPlayer; zone: string } | null {
    for (const player of this.host.state.players.values()) {
      if (player.zones.leader.instanceId === card.instanceId) {
        return { player, zone: 'leader' };
      }

      if (player.zones.stage.instanceId === card.instanceId) {
        return { player, zone: 'stage' };
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
        if (
          player.zones[zone].some(
            (candidate) => candidate.instanceId === card.instanceId,
          )
        ) {
          return { player, zone };
        }
      }
    }

    return null;
  }

  private matchesSelector(
    card: DuelCard,
    selector: EffectTargetSelector,
    controllerSessionId: string,
    context: EffectResolutionContext,
  ): boolean {
    if (
      selector.source === 'effectSource' &&
      card.instanceId !== context.sourceInstanceId
    ) {
      return false;
    }

    return this.matchesFilter(
      card,
      selector.filter,
      controllerSessionId,
      context,
    );
  }
}
