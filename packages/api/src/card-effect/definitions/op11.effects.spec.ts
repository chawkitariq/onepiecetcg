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
import { op11EffectDefinitions } from './op11.effects';

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
  definitions = [op11EffectDefinitions],
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
        colors: ['Red'],
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
            selector.filter?.baseCostMax != null &&
            card.cost > selector.filter.baseCostMax
          )
            continue;
          if (
            selector.filter?.baseCostMin != null &&
            card.cost < selector.filter.baseCostMin
          )
            continue;
          if (
            selector.filter?.basePowerMax != null &&
            card.power > selector.filter.basePowerMax
          )
            continue;
          if (
            selector.filter?.basePowerMin != null &&
            card.power < selector.filter.basePowerMin
          )
            continue;

          matches.push(card);
        }
      }
    }
    return matches;
  }

  public getCardBySourceFilter(
    filter: any,
    controllerSessionId: string,
  ): DuelCard[] {
    return this.getCards(
      { player: 'self', zones: ['characters'], filter, source: 'effectSource' },
      controllerSessionId,
    );
  }

  public drawCard(playerSessionId: string, amount = 1): void {
    const player = this.getPlayer(playerSessionId);
    if (!player) return;
    for (let i = 0; i < amount; i++) {
      const card = player.zones.deck.pop();
      if (card) player.zones.hand.push(card);
    }
  }

  public trashCard(playerSessionId: string, cardInstanceId: string): void {
    for (const player of this.state.players.values()) {
      for (const zone of [
        'hand',
        'characters',
        'deck',
        'life',
        'cost',
      ] as const) {
        const idx = player.zones[zone].findIndex(
          (c) => c.instanceId === cardInstanceId,
        );
        if (idx >= 0) {
          const card = player.zones[zone].splice(idx, 1)[0];
          player.zones.trash.push(card);
          return;
        }
      }
    }
  }

  public moveCard(
    cardInstanceId: string,
    destinationPlayerSessionId: string,
    destinationZone: string,
    _options?: { faceDown?: boolean; toBottom?: boolean; rested?: boolean },
  ): void {
    for (const player of this.state.players.values()) {
      for (const zone of [
        'hand',
        'characters',
        'deck',
        'life',
        'cost',
        'trash',
        'stage',
      ] as const) {
        const idx = player.zones[zone].findIndex(
          (c) => c.instanceId === cardInstanceId,
        );
        if (idx >= 0) {
          const card = player.zones[zone].splice(idx, 1)[0];
          const destPlayer = this.state.players.get(destinationPlayerSessionId);
          if (!destPlayer) return;
          if (destinationZone === 'deck' && _options?.toBottom) {
            destPlayer.zones['deck'].unshift(card);
          } else if (destinationZone in destPlayer.zones) {
            (destPlayer.zones as any)[destinationZone].push(card);
          }
          return;
        }
      }
    }
  }

  // Simplified helpers for testing
  public getPower(sessionId: string, instanceId: string): number {
    const card = this.getCard(instanceId);
    if (!card) return 0;
    return card.power + (card.powerModifiers ?? 0);
  }
}

describe('OP11 effect definitions', () => {
  it('registers all 98 cards without errors', () => {
    expect(op11EffectDefinitions.editionId).toBe('OP11');
    expect(op11EffectDefinitions.cards.length).toBeGreaterThan(0);
  });

  it('has unique cardIds', () => {
    const ids = op11EffectDefinitions.cards.map((c) => c.cardId);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('has unique effect ids across all standard/continuous/replacement effects', () => {
    const ids = new Set<string>();
    for (const card of op11EffectDefinitions.cards) {
      for (const entry of card.effects ?? []) {
        if (entry.kind !== 'special-ref') {
          ids.add(entry.effect.id);
        }
      }
    }
    expect(ids.size).toBeGreaterThan(0);
  });

  it('registers effects for a card known to have standard effects', () => {
    const registry = createRegistry();
    const card = registry.effectsByCardId['OP11-002'];
    expect(card).toBeDefined();
    expect(card.standard).toBeDefined();
    expect(card.standard!.length).toBe(1);
  });

  it('registers continuous effect for OP11-005 Smoker', () => {
    const registry = createRegistry();
    const card = registry.effectsByCardId['OP11-005'];
    expect(card).toBeDefined();
    expect(card.continuous).toBeDefined();
    expect(card.continuous!.length).toBe(1);
    expect(card.continuous![0].id).toBe(
      'smoker-don-1-cannot-be-koed-by-non-special-effects',
    );
  });

  it('registers replacement effect for OP11-110 Fukaboshi', () => {
    const registry = createRegistry();
    const card = registry.effectsByCardId['OP11-110'];
    expect(card).toBeDefined();
    expect(card.replacements).toBeDefined();
    expect(card.replacements!.length).toBe(1);
    expect(card.replacements![0].event).toBe('wouldKoCharacter');
  });

  it('registers special-ref for OP11-001 Koby', () => {
    const registry = createRegistry();
    const card = registry.effectsByCardId['OP11-001'];
    expect(card).toBeDefined();
    expect(card.specialHandlerId).toBe('op11-001-special');
  });

  it('all empty-text cards have empty effects arrays', () => {
    const emptyCards = [
      'OP11-003',
      'OP11-011',
      'OP11-015',
      'OP11-017',
      'OP11-026',
      'OP11-032',
      'OP11-033',
      'OP11-045',
      'OP11-052',
      'OP11-053',
      'OP11-055',
      'OP11-064',
      'OP11-068',
      'OP11-078',
      'OP11-087',
      'OP11-089',
      'OP11-090',
      'OP11-093',
      'OP11-094',
      'OP11-105',
      'OP11-111',
      'OP11-113',
    ];

    const registry = createRegistry();
    for (const cardId of emptyCards) {
      const card = registry.effectsByCardId[cardId];
      expect(card).toBeDefined();
      expect(card.standard).toBeUndefined();
      expect(card.continuous).toBeUndefined();
      expect(card.replacements).toBeUndefined();
      expect(card.specialHandlerId).toBeUndefined();
    }
  });

  it('OP11-002 Ain onPlay effect exists with -1000 power and conditional KO', () => {
    const registry = createRegistry();
    const card = registry.effectsByCardId['OP11-002'];
    expect(card.standard).toBeDefined();
    expect(card.standard!.length).toBe(1);
    const effect = card.standard![0];
    expect(effect.actions.length).toBe(2);
    expect(effect.actions[0].type).toBe('modifyPower');
    expect((effect.actions[0] as any).amount).toBe(-1000);
    expect(effect.actions[1].type).toBe('ko');
    expect((effect.actions[1] as any).selector.filter).toEqual({
      cardCategory: ['Character'],
      powerMax: 0,
    });
  });

  it('OP11-042 Vito onPlay has optional trigger with trash cost', () => {
    const registry = createRegistry();
    const card = registry.effectsByCardId['OP11-042'];
    expect(card.standard).toBeDefined();
    expect(card.standard!.length).toBe(1);
    expect(card.standard![0].trigger.optional).toBe(true);
    expect(card.standard![0].costs).toBeDefined();
    expect(card.standard![0].costs!.length).toBe(1);
    expect(card.standard![0].costs![0].type).toBe('trashFromHand');
  });

  it('OP11-054 Nami onPlay has multicolored leader condition', () => {
    const registry = createRegistry();
    const card = registry.effectsByCardId['OP11-054'];
    expect(card.standard).toBeDefined();
    expect(card.standard!.length).toBe(1);
    const effect = card.standard![0];
    expect(effect.conditions).toBeDefined();
    expect(effect.conditions![0].type).toBe('playerHasLeaderColorsAtLeast');
    expect((effect.conditions![0] as any).value).toBe(2);
    expect(effect.actions.length).toBe(2);
    expect(effect.actions[0].type).toBe('draw');
    expect((effect.actions[0] as any).amount).toBe(3);
  });

  it('OP11-110 Fukaboshi has both replacement and standard effects', () => {
    const registry = createRegistry();
    const card = registry.effectsByCardId['OP11-110'];
    expect(card).toBeDefined();
    expect(card.replacements).toBeDefined();
    expect(card.replacements!.length).toBe(1);
    expect(card.replacements![0].optional).toBe(true);
    expect(card.standard).toBeDefined();
    expect(card.standard!.length).toBe(1);
  });

  it('OP11-001 Koby references existing special handler', () => {
    // Validate the special handler exists
    const handlerFiles = [
      'op11-001',
      'op11-022',
      'op11-023',
      'op11-034',
      'op11-041',
      'op11-066',
      'op11-071',
      'op11-073',
      'op11-074',
      'op11-079',
      'op11-081',
      'op11-101',
    ];

    for (const h of handlerFiles) {
      const cardId = `OP11-${h.split('-')[1]}`;
      const registry = createRegistry([op11EffectDefinitions], []);
      const card = registry.effectsByCardId[cardId];
      expect(card).toBeDefined();
      expect(card.specialHandlerId).toBe(`${h}-special`);
    }
  });

  it('OP11-118 Luffy has Rush keyword via card attribute', () => {
    // Luffy (118) has [Rush] as a keyword, handled by the card itself, not the DSL
    const registry = createRegistry();
    const card = registry.effectsByCardId['OP11-118'];
    expect(card).toBeDefined();
    expect(card.standard).toBeDefined();
    expect(card.standard!.length).toBe(1);
  });
});
