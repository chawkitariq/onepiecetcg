import {
  DuelCard,
  DuelPlayer,
  DuelState,
  createDuelCard,
  type Card,
  type CardEffectDefinition,
} from '@onepiecetcg/shared';
import { EffectEngine, type EffectEngineHost } from '../effect-engine';
import { buildEffectIndexes } from '../effect-indexes';
import type {
  EffectRegistry,
  SpecialHandlerDefinition,
} from '../types/effect-registry';
import type { EditionEffectDefinitions } from '../types/effect-definition-source';

export const makeCard = (
  overrides: Partial<Card> & Pick<Card, 'id' | 'number' | 'name' | 'type'>,
): Card => ({
  id: overrides.id,
  number: overrides.number,
  name: overrides.name,
  type: overrides.type,
  colors: overrides.colors ?? ['Red'],
  cost: overrides.cost ?? 1,
  power: overrides.power ?? 1000,
  life: overrides.life ?? null,
  counter: overrides.counter ?? 1000,
  attributes: overrides.attributes ?? [],
  families: overrides.families ?? [],
  text: overrides.text ?? '',
  trigger: overrides.trigger ?? null,
  imageUrl: overrides.imageUrl ?? null,
  set: overrides.set ?? { id: 'test', name: 'Test' },
  rarity: overrides.rarity ?? null,
});

export const createRegistry = (
  definitions: readonly EditionEffectDefinitions[] = [],
  specialHandlers: readonly SpecialHandlerDefinition[] = [],
): EffectRegistry => {
  const effectsByCardId: Record<string, CardEffectDefinition> = {};
  const specialHandlersByCardId: Record<string, SpecialHandlerDefinition> = {};

  for (const definition of definitions) {
    for (const card of definition.cards) {
      const resolved: CardEffectDefinition = { cardId: card.cardId };

      for (const entry of card.effects ?? []) {
        switch (entry.kind) {
          case 'standard':
            resolved.standard = [...(resolved.standard ?? []), entry.effect];
            break;
          case 'continuous':
            resolved.continuous = [
              ...(resolved.continuous ?? []),
              entry.effect,
            ];
            break;
          case 'replacement':
            resolved.replacements = [
              ...(resolved.replacements ?? []),
              entry.effect,
            ];
            break;
          case 'special-ref':
            resolved.specialHandlerId = entry.specialHandlerId;
            break;
        }
      }

      effectsByCardId[resolved.cardId] = resolved;
    }
  }

  for (const handler of specialHandlers) {
    specialHandlersByCardId[handler.cardId] = handler;
  }

  const indexes = buildEffectIndexes(effectsByCardId, specialHandlersByCardId);

  return {
    effectsByCardId,
    specialHandlersByCardId,
    triggeredEffectsByTrigger: indexes.triggeredEffectsByTrigger,
    replacementEffectsByEventType: indexes.replacementEffectsByEventType,
  };
};

export class TestHost implements EffectEngineHost {
  public readonly state = new DuelState();
  public readonly logs: string[] = [];

  public constructor() {
    this.state.activePlayerSessionId = 'p1';
  }

  public addPlayer(
    sessionId: string,
    leaderCardId = `L-${sessionId}`,
  ): DuelPlayer {
    const player = new DuelPlayer();
    player.sessionId = sessionId;
    player.displayName = sessionId;
    player.zones.leader = createDuelCard(
      makeCard({
        id: leaderCardId,
        number: leaderCardId,
        name: `${sessionId} Leader`,
        type: 'Leader',
        power: 5000,
        life: 5,
      }),
      `${sessionId}:leader`,
      sessionId,
    );
    this.state.players.set(sessionId, player);
    return player;
  }

  public addLog(message: string): void {
    this.logs.push(message);
  }

  public shuffleDeck(playerSessionId: string): void {
    const player = this.getPlayer(playerSessionId);
    if (!player) return;
    player.zones.deck.reverse();
  }

  public getPlayer(sessionId: string): DuelPlayer | undefined {
    return this.state.players.get(sessionId);
  }

  public getOpponentSessionId(sessionId: string): string | null {
    return (
      Array.from(this.state.players.keys()).find((id) => id !== sessionId) ??
      null
    );
  }

  public getCard(instanceId: string): DuelCard | null {
    for (const player of this.state.players.values()) {
      if (player.zones.leader.instanceId === instanceId) {
        return player.zones.leader;
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
        if (found) return found;
      }
    }
    return null;
  }

  public getCards(selector: any, controllerSessionId: string): DuelCard[] {
    const sessionIds =
      selector.player === 'self'
        ? [controllerSessionId]
        : selector.player === 'opponent'
          ? [this.getOpponentSessionId(controllerSessionId)].filter(Boolean)
          : Array.from(this.state.players.keys());

    const matches: DuelCard[] = [];

    for (const sessionId of sessionIds) {
      const player = sessionId ? this.state.players.get(sessionId) : undefined;
      if (!player) continue;

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
            selector.filter?.cardCategory &&
            !selector.filter.cardCategory.includes(card.type)
          )
            continue;
          if (
            selector.filter?.costMax != null &&
            card.cost > selector.filter.costMax
          )
            continue;
          if (
            selector.filter?.costMin != null &&
            card.cost < selector.filter.costMin
          )
            continue;
          if (
            selector.filter?.powerMax != null &&
            card.power > selector.filter.powerMax
          )
            continue;
          if (
            selector.filter?.powerMin != null &&
            card.power < selector.filter.powerMin
          )
            continue;
          if (
            selector.filter?.color &&
            !selector.filter.color.some((color: string) =>
              card.colors.includes(color),
            )
          )
            continue;
          if (
            selector.filter?.rested != null &&
            card.rested !== selector.filter.rested
          )
            continue;
          if (
            selector.filter?.trait &&
            !selector.filter.trait.some((trait: string) =>
              card.families.includes(trait),
            )
          )
            continue;
          if (
            selector.filter?.excludeName &&
            selector.filter.excludeName.includes(card.name)
          )
            continue;
          if (
            selector.filter?.name &&
            !selector.filter.name.includes(card.name)
          )
            continue;
          if (
            selector.filter?.owner === 'self' &&
            card.ownerSessionId !== controllerSessionId
          )
            continue;
          if (
            selector.filter?.owner === 'opponent' &&
            card.ownerSessionId === controllerSessionId
          )
            continue;

          matches.push(card);
        }
      }
    }

    return matches;
  }

  private removeCard(instanceId: string): void {
    for (const player of this.state.players.values()) {
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
          player.zones[zone].splice(index, 1);
          return;
        }
      }
    }
  }

  public moveCard(
    card: DuelCard,
    destinationPlayerSessionId: string,
    destinationZone: string,
    options?: { faceDown?: boolean; rested?: boolean; toBottom?: boolean },
  ): void {
    this.removeCard(card.instanceId);
    const player = this.getPlayer(destinationPlayerSessionId);
    if (!player) return;

    card.ownerSessionId = destinationPlayerSessionId;
    card.faceDown = options?.faceDown ?? false;
    card.rested = options?.rested ?? false;

    if (destinationZone === 'trash') {
      player.zones.trash.unshift(card);
    } else if (destinationZone === 'hand') {
      player.zones.hand.push(card);
    } else if (destinationZone === 'life' && options?.toBottom) {
      player.zones.life.push(card);
    } else if (destinationZone === 'life') {
      player.zones.life.unshift(card);
    } else if (destinationZone === 'deck') {
      player.zones.deck.push(card);
    } else if (destinationZone === 'donDeck') {
      player.zones.donDeck.push(card);
    } else if (destinationZone === 'cost') {
      player.zones.cost.push(card);
    } else if (destinationZone === 'characters') {
      player.zones.characters.push(card);
    } else if (destinationZone === 'stage') {
      player.zones.stage = card;
    }
  }

  public drawCard(playerSessionId: string): DuelCard | null {
    const player = this.getPlayer(playerSessionId);
    const card = player?.zones.deck.shift();
    if (!player || !card) return null;
    card.faceDown = false;
    player.zones.hand.push(card);
    return card;
  }

  public trashTopDeckCards(
    playerSessionId: string,
    amount: number,
  ): DuelCard[] {
    const player = this.getPlayer(playerSessionId);
    const moved: DuelCard[] = [];
    if (!player) return moved;
    for (let index = 0; index < amount; index += 1) {
      const card = player.zones.deck.shift();
      if (!card) break;
      player.zones.trash.unshift(card);
      moved.push(card);
    }
    return moved;
  }

  public addDonToCost(
    playerSessionId: string,
    amount: number,
    rested: boolean,
  ): number {
    const player = this.getPlayer(playerSessionId);
    if (!player) return 0;
    let moved = 0;
    for (let index = 0; index < amount; index += 1) {
      const don = player.zones.donDeck.shift();
      if (!don) break;
      don.rested = rested;
      player.zones.cost.push(don);
      moved += 1;
    }
    return moved;
  }

  public attachDon(
    playerSessionId: string,
    targetInstanceId: string,
    amount: number,
    options?: { rested?: boolean },
  ): number {
    const player = this.getPlayer(playerSessionId);
    const target =
      player?.zones.leader.instanceId === targetInstanceId
        ? player.zones.leader
        : player?.zones.characters.find(
            (card) => card.instanceId === targetInstanceId,
          );
    if (!player || !target) return 0;
    const matchingDon = player.zones.cost.filter((card) =>
      options?.rested === undefined ? true : card.rested === options.rested,
    );
    const attached = Math.min(amount, matchingDon.length);
    for (const don of matchingDon.slice(0, attached)) {
      const index = player.zones.cost.indexOf(don);
      if (index >= 0) player.zones.cost.splice(index, 1);
    }
    target.attachedDon += attached;
    return attached;
  }

  public returnDonToDonDeck(playerSessionId: string, amount: number): number {
    const player = this.getPlayer(playerSessionId);
    if (!player) return 0;
    let moved = 0;
    while (player.zones.cost.length > 0 && moved < amount) {
      const card = player.zones.cost.pop();
      if (!card) break;
      player.zones.donDeck.push(card);
      moved += 1;
    }
    return moved;
  }

  public koCharacter(
    playerSessionId: string,
    instanceId: string,
    _reason: 'battle' | 'effect',
  ): boolean {
    const player = this.getPlayer(playerSessionId);
    const index =
      player?.zones.characters.findIndex(
        (card) => card.instanceId === instanceId,
      ) ?? -1;
    if (!player || index < 0) return false;
    const [card] = player.zones.characters.splice(index, 1);
    if (!card) return false;
    player.zones.trash.unshift(card);
    return true;
  }

  public syncPlayer(_playerSessionId: string): void {}

  public playCard(card: DuelCard, sessionId: string, zone: string): void {
    this.removeCard(card.instanceId);
    const player = this.getPlayer(sessionId);
    if (!player) return;
    card.ownerSessionId = sessionId;
    card.faceDown = false;
    card.rested = false;
    card.playedThisTurn = true;
    if (zone === 'characters') {
      player.zones.characters.push(card);
    } else if (zone === 'stage') {
      player.zones.stage = card;
    }
  }

  public addCardToZone(
    playerSessionId: string,
    zone:
      'hand' | 'deck' | 'donDeck' | 'characters' | 'trash' | 'cost' | 'life',
    card: Card,
    instanceSuffix: string,
  ): DuelCard {
    const duelCard = createDuelCard(
      card,
      `${playerSessionId}:${instanceSuffix}`,
      playerSessionId,
    );
    this.getPlayer(playerSessionId)?.zones[zone].push(duelCard);
    return duelCard;
  }
}
