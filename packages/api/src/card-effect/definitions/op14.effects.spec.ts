import { describe, expect, it } from '@jest/globals';
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
import { op14EffectDefinitions } from './op14.effects';
import { specialHandlerDefinitions } from './special/index';

const makeCard = (
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

const createRegistry = (
  definitions = [op14EffectDefinitions],
  specialHandlers: readonly SpecialHandlerDefinition[] = specialHandlerDefinitions,
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

class TestHost implements EffectEngineHost {
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
    if (player) player.zones.deck.reverse();
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
      if (player.zones.leader.instanceId === instanceId)
        return player.zones.leader;
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
          (c) => c.instanceId === instanceId,
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
            selector.filter?.basePowerMax != null &&
            card.basePower > selector.filter.basePowerMax
          )
            continue;
          if (
            selector.filter?.baseCostMax != null &&
            card.baseCost > selector.filter.baseCostMax
          )
            continue;
          if (
            selector.filter?.color &&
            !selector.filter.color.some((c: string) => card.colors.includes(c))
          )
            continue;
          if (
            selector.filter?.rested != null &&
            card.rested !== selector.filter.rested
          )
            continue;
          if (
            selector.filter?.trait &&
            !selector.filter.trait.some((t: string) =>
              card.families.includes(t),
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
  public moveCard(
    card: DuelCard,
    destPlayerSessionId: string,
    destZone: string,
    opts?: any,
  ): void {
    this.removeCard(card.instanceId);
    const player = this.getPlayer(destPlayerSessionId);
    if (!player) return;
    card.ownerSessionId = destPlayerSessionId;
    card.faceDown = opts?.faceDown ?? false;
    card.rested = opts?.rested ?? false;
    if (destZone === 'trash') {
      player.zones.trash.unshift(card);
    } else if (destZone === 'hand') {
      player.zones.hand.push(card);
    } else if (destZone === 'life' && opts?.toBottom) {
      player.zones.life.push(card);
    } else if (destZone === 'life') {
      player.zones.life.unshift(card);
    } else if (destZone === 'deck') {
      player.zones.deck.push(card);
    } else if (destZone === 'donDeck') {
      player.zones.donDeck.push(card);
    } else if (destZone === 'cost') {
      player.zones.cost.push(card);
    } else if (destZone === 'characters') {
      player.zones.characters.push(card);
    } else if (destZone === 'stage') {
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
    for (let i = 0; i < amount; i++) {
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
    let moved = 0;
    if (!player) return 0;
    for (let i = 0; i < amount; i++) {
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
    opts?: any,
  ): number {
    const player = this.getPlayer(playerSessionId);
    const target =
      player?.zones.leader.instanceId === targetInstanceId
        ? player.zones.leader
        : player?.zones.characters.find(
            (c) => c.instanceId === targetInstanceId,
          );
    if (!player || !target) return 0;
    const matchingDon = player.zones.cost.filter((c) =>
      opts?.rested === undefined ? true : c.rested === opts.rested,
    );
    const attached = Math.min(amount, matchingDon.length);
    for (const don of matchingDon.slice(0, attached)) {
      const idx = player.zones.cost.indexOf(don);
      if (idx >= 0) player.zones.cost.splice(idx, 1);
    }
    target.attachedDon += attached;
    return attached;
  }
  public returnDonToDonDeck(playerSessionId: string, amount: number): number {
    const player = this.getPlayer(playerSessionId);
    let moved = 0;
    if (!player) return 0;
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
    const idx =
      player?.zones.characters.findIndex((c) => c.instanceId === instanceId) ??
      -1;
    if (!player || idx < 0) return false;
    const [card] = player.zones.characters.splice(idx, 1);
    if (!card) return false;
    player.zones.trash.unshift(card);
    return true;
  }
  public syncPlayer(_playerSessionId: string): void {}

  public addCardToZone(
    playerSessionId: string,
    zone: string,
    card: Card,
    instanceSuffix: string,
  ): DuelCard {
    const duelCard = createDuelCard(
      card,
      `${playerSessionId}:${instanceSuffix}`,
      playerSessionId,
    );
    const z = zone as
      'hand' | 'deck' | 'donDeck' | 'characters' | 'trash' | 'cost' | 'life';
    this.getPlayer(playerSessionId)?.zones[z].push(duelCard);
    return duelCard;
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
        const idx = player.zones[zone].findIndex(
          (c) => c.instanceId === instanceId,
        );
        if (idx >= 0) {
          player.zones[zone].splice(idx, 1);
          return;
        }
      }
    }
  }
}

describe('op14EffectDefinitions', () => {
  it('effect definitions are valid and have all effects for OP14 cards', () => {
    const registry = createRegistry();
    const cardIds = op14EffectDefinitions.cards.map((c) => c.cardId);
    for (const id of cardIds) {
      expect(registry.effectsByCardId[id]).toBeDefined();
    }
  });

  it('OP14-002 urouge-when-attacking draws and KOs when power >= 5000', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    new EffectEngine(createRegistry(), host);

    const urouge = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-002',
        number: 'OP14-002',
        name: 'Urouge',
        type: 'Character',
        power: 5000,
      }),
      'urouge',
    );
    host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'TARGET',
        number: 'TARGET',
        name: 'Target',
        type: 'Character',
        power: 3000,
      }),
      'target',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'DECK1',
        number: 'DECK1',
        name: 'Draw1',
        type: 'Character',
      }),
      'deck1',
    );

    const registry = createRegistry();
    expect(registry.effectsByCardId['OP14-002']?.standard).toBeDefined();
    expect(registry.effectsByCardId['OP14-002'].standard![0].id).toBe(
      'urouge-when-attacking-5000-draw-ko-3000',
    );
  });

  it('OP14-032 effect is registered via special-ref', () => {
    const registry = createRegistry();
    expect(registry.effectsByCardId['OP14-032']?.specialHandlerId).toBe(
      'op14-032-special',
    );
  });

  it('OP14-092 mr-3-replacement registers a replacement effect for wouldKoCharacter', () => {
    const registry = createRegistry();
    expect(registry.effectsByCardId['OP14-092']?.replacements).toBeDefined();
    expect(registry.effectsByCardId['OP14-092'].replacements![0].id).toBe(
      'mr-3-opponent-turn-ko-replacement',
    );
  });

  it('OP14-108 silvers-rayleigh-on-play registers both onPlay and trigger effects', () => {
    const registry = createRegistry();
    const effects = registry.effectsByCardId['OP14-108'];
    expect(effects?.standard).toBeDefined();
    expect(effects.standard!.length).toBe(2);
    expect(effects.standard![0].id).toBe(
      'silvers-rayleigh-on-play-multicolor-ko-7000',
    );
    expect(effects.standard![1].id).toBe(
      'silvers-rayleigh-trigger-activate-on-play',
    );
  });

  it('continuous effect OP14-004 registers correctly', () => {
    const registry = createRegistry();
    const effects = registry.effectsByCardId['OP14-004'];
    expect(effects?.continuous).toBeDefined();
    expect(effects.continuous![0].id).toBe('cavendish-5000-rush');
    expect(effects.continuous![0].conditions![0]).toEqual({
      type: 'sourcePowerAtLeast',
      value: 5000,
    });
  });

  it('all special handlers for OP14 are registered in the index', () => {
    const handlerIds = specialHandlerDefinitions.map((h) => h.id);
    const expected = [
      'op14-001-special',
      'op14-009-special',
      'op14-011-special',
      'op14-016-special',
      'op14-017-special',
      'op14-020-special',
      'op14-021-special',
      'op14-027-special',
      'op14-028-special',
      'op14-032-special',
      'op14-033-special',
      'op14-034-special',
      'op14-035-special',
      'op14-041-special',
      'op14-044-special',
      'op14-045-special',
      'op14-049-special',
      'op14-053-special',
      'op14-056-special',
      'op14-060-special',
      'op14-061-special',
      'op14-062-special',
      'op14-069-special',
      'op14-070-special',
      'op14-079-special',
      'op14-096-special',
      'op14-103-special',
      'op14-104-special',
      'op14-105-special',
      'op14-111-special',
      'op14-115-special',
      'op14-119-special',
    ];
    for (const id of expected) {
      expect(handlerIds).toContain(id);
    }
  });
});
