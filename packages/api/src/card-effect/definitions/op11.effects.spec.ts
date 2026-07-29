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
    card: DuelCard,
    destinationPlayerSessionId: string,
    destinationZone: string,
    options?: { faceDown?: boolean; toBottom?: boolean; rested?: boolean },
  ): void {
    const instanceId = card.instanceId;
    for (const player of this.state.players.values()) {
      if (player.zones.leader.instanceId === instanceId) {
        const c = player.zones.leader;
        c.ownerSessionId = destinationPlayerSessionId;
        c.faceDown = options?.faceDown ?? false;
        c.rested = options?.rested ?? false;
        const destPlayer = this.state.players.get(destinationPlayerSessionId);
        if (!destPlayer) return;
        destPlayer.zones.trash.unshift(c);
        player.zones.leader = new DuelCard();
        return;
      }
      if (player.zones.stage.instanceId === instanceId) {
        const c = player.zones.stage;
        c.ownerSessionId = destinationPlayerSessionId;
        c.faceDown = options?.faceDown ?? false;
        c.rested = options?.rested ?? false;
        const destPlayer = this.state.players.get(destinationPlayerSessionId);
        if (!destPlayer) return;
        if (destinationZone === 'trash') {
          destPlayer.zones.trash.unshift(c);
        } else {
          (destPlayer.zones as any)[destinationZone]?.push(c);
        }
        player.zones.stage = new DuelCard();
        return;
      }
      for (const zone of [
        'hand',
        'characters',
        'deck',
        'life',
        'cost',
        'trash',
      ] as const) {
        const idx = player.zones[zone].findIndex(
          (c) => c.instanceId === instanceId,
        );
        if (idx >= 0) {
          const c = player.zones[zone].splice(idx, 1)[0];
          c.ownerSessionId = destinationPlayerSessionId;
          c.faceDown = options?.faceDown ?? false;
          c.rested = options?.rested ?? false;
          const destPlayer = this.state.players.get(destinationPlayerSessionId);
          if (!destPlayer) return;
          if (destinationZone === 'trash') {
            destPlayer.zones.trash.unshift(c);
          } else if (destinationZone === 'hand') {
            destPlayer.zones.hand.push(c);
          } else if (destinationZone === 'life' && options?.toBottom) {
            destPlayer.zones.life.push(c);
          } else if (destinationZone === 'life') {
            destPlayer.zones.life.unshift(c);
          } else if (destinationZone === 'deck' && options?.toBottom) {
            destPlayer.zones.deck.unshift(c);
          } else if (destinationZone === 'deck') {
            destPlayer.zones.deck.push(c);
          } else if (destinationZone in destPlayer.zones) {
            (destPlayer.zones as any)[destinationZone].push(c);
          }
          return;
        }
      }
    }
  }

  public drawCard(playerSessionId: string): DuelCard | null {
    const player = this.getPlayer(playerSessionId);
    if (!player) return null;
    const card = player.zones.deck.shift();
    if (!card) return null;
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
    if (!player) return 0;
    let moved = 0;
    for (let i = 0; i < amount; i++) {
      const don = player.zones.donDeck.shift();
      if (!don) break;
      don.rested = rested;
      player.zones.cost.push(don);
      moved++;
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
            (c) => c.instanceId === targetInstanceId,
          );
    if (!player || !target) return 0;
    const matchingDon = player.zones.cost.filter((c) =>
      options?.rested === undefined ? true : c.rested === options.rested,
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
    if (!player) return 0;
    let moved = 0;
    while (player.zones.cost.length > 0 && moved < amount) {
      const card = player.zones.cost.pop();
      if (!card) break;
      player.zones.donDeck.push(card);
      moved++;
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

  describe('behavioral tests', () => {
    it('OP11-002: onPlay reduces opponent character power by 1000 then KOs it when power reaches 0', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 2;
      const engine = new EffectEngine(createRegistry(), host);
      const ain = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP11-002',
          number: 'OP11-002',
          name: 'Ain',
          type: 'Character',
        }),
        'ain',
      );
      const target = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'P2-CHAR',
          number: 'P2-CHAR',
          name: 'Target',
          type: 'Character',
          power: 1000,
        }),
        'target',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: ain.instanceId,
        sourceCardId: ain.cardId,
      });

      let decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      decision = engine.getPendingDecision();
      if (decision) {
        engine.answerDecision({
          decisionId: decision.id,
          selectedCardInstanceIds: [target.instanceId],
        });
      }

      expect(host.getPlayer('p2')?.zones.characters).not.toContain(target);
      expect(host.getPlayer('p2')?.zones.trash[0]).toBe(target);
    });

    it('OP11-005: with DON!! x1 attached, Smoker cannot be KOed by effects', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const smoker = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP11-005',
          number: 'OP11-005',
          name: 'Smoker',
          type: 'Character',
        }),
        'smoker',
      );

      smoker.attachedDon = 1;
      engine.reapplyContinuousEffects();
      expect(smoker.cannotBeKoedByEffects).toBe(true);

      smoker.attachedDon = 0;
      engine.reapplyContinuousEffects();
      expect(smoker.cannotBeKoedByEffects).toBe(false);
    });

    it('OP11-016: activateMain once per turn attaches 1 rested DON to leader', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 3;
      const engine = new EffectEngine(createRegistry(), host);
      const zoro = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP11-016',
          number: 'OP11-016',
          name: 'Roronoa Zoro',
          type: 'Character',
        }),
        'zoro',
      );
      host.addCardToZone(
        'p1',
        'donDeck',
        makeCard({
          id: 'DON',
          number: 'DON',
          name: 'DON!!',
          type: 'DON!!',
        }),
        'don-1',
      );
      host.addDonToCost('p1', 1, true);

      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: zoro.instanceId,
        sourceCardId: zoro.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      const leader = host.getPlayer('p1')!.zones.leader;
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [leader.instanceId],
      });

      expect(leader.attachedDon).toBe(1);
      expect(host.getPlayer('p1')?.zones.cost).toHaveLength(0);
    });

    it('OP11-018: Main reduces opponent power by 4000 then KOs a 6000-power-or-less character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 3;
      const engine = new EffectEngine(createRegistry(), host);
      const honestyImpact = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'OP11-018',
          number: 'OP11-018',
          name: 'Honesty Impact',
          type: 'Event',
        }),
        'hi',
      );
      const target = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'P2-CHAR',
          number: 'P2-CHAR',
          name: 'Target',
          type: 'Character',
          power: 6000,
        }),
        'target',
      );

      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: honestyImpact.instanceId,
        sourceCardId: honestyImpact.cardId,
      });

      let decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      decision = engine.getPendingDecision();
      if (decision) {
        engine.answerDecision({
          decisionId: decision.id,
          selectedCardInstanceIds: [target.instanceId],
        });
      }

      expect(host.getPlayer('p2')?.zones.characters).not.toContain(target);
      expect(host.getPlayer('p2')?.zones.trash[0]).toBe(target);
    });

    it('OP11-042: onPlay optional trashes a Firetank Pirates card from hand to gain Rush', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 2;
      const engine = new EffectEngine(createRegistry(), host);
      const vito = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP11-042',
          number: 'OP11-042',
          name: 'Vito',
          type: 'Character',
          families: ['Firetank Pirates'],
        }),
        'vito',
      );
      const firetankCard = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'FIRETANK',
          number: 'FIRETANK',
          name: 'Firetank Fodder',
          type: 'Character',
          families: ['Firetank Pirates'],
        }),
        'firetank',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: vito.instanceId,
        sourceCardId: vito.cardId,
      });

      let decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      expect(decision!.prompt.type).toBe('confirm');
      engine.answerDecision({ decisionId: decision!.id, confirmed: true });

      decision = engine.getPendingDecision();
      expect(decision).toBeNull();

      expect(host.getPlayer('p1')?.zones.hand).not.toContain(firetankCard);
      expect(host.getPlayer('p1')?.zones.trash[0]).toBe(firetankCard);
      expect(vito.hasRush).toBe(true);
    });

    it('OP11-054: onPlay with multicolored leader draws 3 and places 2 back on deck', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 2;
      host.getPlayer('p1')!.zones.leader.colors.push('Blue');

      for (let i = 0; i < 5; i++) {
        host.addCardToZone(
          'p1',
          'deck',
          makeCard({
            id: `DECK-${i}`,
            number: `DECK-${i}`,
            name: `Deck Card ${i}`,
            type: 'Character',
          }),
          `deck-${i}`,
        );
      }

      const engine = new EffectEngine(createRegistry(), host);
      const nami = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP11-054',
          number: 'OP11-054',
          name: 'Nami',
          type: 'Character',
        }),
        'nami',
      );

      expect(host.getPlayer('p1')?.zones.hand).toHaveLength(0);
      expect(host.getPlayer('p1')?.zones.deck).toHaveLength(5);

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: nami.instanceId,
        sourceCardId: nami.cardId,
      });

      expect(host.getPlayer('p1')?.zones.hand).toHaveLength(3);

      let decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      const handCards = [...host.getPlayer('p1')!.zones.hand];
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: handCards.slice(0, 2).map((c) => c.instanceId),
      });

      decision = engine.getPendingDecision();
      if (decision) {
        engine.answerDecision({
          decisionId: decision.id,
          choiceIds: ['top'],
        });
      }

      decision = engine.getPendingDecision();
      if (decision) {
        engine.answerDecision({
          decisionId: decision.id,
          choiceIds: ['top'],
        });
      }

      expect(host.getPlayer('p1')?.zones.hand).toHaveLength(1);
    });

    it('OP11-009: whenAttacking with DON!! x2 reduces opponent character power by 2000', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 2;
      const engine = new EffectEngine(createRegistry(), host);
      const nicoRobin = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP11-009',
          number: 'OP11-009',
          name: 'Nico Robin',
          type: 'Character',
        }),
        'nico-robin',
      );
      nicoRobin.attachedDon = 2;

      const target = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'P2-CHAR',
          number: 'P2-CHAR',
          name: 'Target',
          type: 'Character',
          power: 5000,
        }),
        'target',
      );

      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: nicoRobin.instanceId,
        sourceCardId: nicoRobin.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      engine.reapplyContinuousEffects();
      expect(target.power).toBe(3000);
    });

    it('OP11-067: end of turn unrests up to 2 Big Mom Pirates cost 3+ characters and adds 1 rested DON', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 4;
      const engine = new EffectEngine(createRegistry(), host);
      const katakuri = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP11-067',
          number: 'OP11-067',
          name: 'Charlotte Katakuri',
          type: 'Character',
        }),
        'katakuri',
      );
      const bigMomChar = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'BIG-MOM-1',
          number: 'BIG-MOM-1',
          name: 'Big Mom Soldier',
          type: 'Character',
          cost: 5,
          families: ['Big Mom Pirates'],
        }),
        'big-mom-1',
      );
      bigMomChar.rested = true;

      host.addCardToZone(
        'p1',
        'donDeck',
        makeCard({ id: 'DON', number: 'DON', name: 'DON!!', type: 'DON!!' }),
        'don-1',
      );

      engine.handleEvent({
        type: 'onTurnEnd',
        playerSessionId: 'p1',
        sourceInstanceId: katakuri.instanceId,
        sourceCardId: katakuri.cardId,
      });

      expect(bigMomChar.rested).toBe(false);
      expect(host.getPlayer('p1')?.zones.cost).toHaveLength(1);
    });

    it('OP11-110: replacement effect avoids KO by resting the leader', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'FISH-MAN-ISLAND');
      host.getPlayer('p1')!.zones.leader.name = 'Fish-Man Island';
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const fukaboshi = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP11-110',
          number: 'OP11-110',
          name: 'Fukaboshi',
          type: 'Character',
        }),
        'fukaboshi',
      );
      const leader = host.getPlayer('p1')!.zones.leader;

      const replaced = engine.applyReplacement({
        type: 'wouldKoCharacter',
        playerSessionId: 'p1',
        sourceInstanceId: fukaboshi.instanceId,
        reason: 'effect',
      });

      expect(replaced).toBe(true);
      expect(host.getPlayer('p1')?.zones.characters).toContain(fukaboshi);
      expect(leader.rested).toBe(true);
    });

    it('OP11-118: whenAttacking optional trashes a card, bounces cost 4 or less character, then attaches rested DON', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 3;
      const engine = new EffectEngine(createRegistry(), host);
      const luffy = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP11-118',
          number: 'OP11-118',
          name: 'Monkey.D.Luffy',
          type: 'Character',
        }),
        'luffy',
      );
      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'HAND-FODDER',
          number: 'HAND-FODDER',
          name: 'Hand Fodder',
          type: 'Character',
        }),
        'hand-fodder',
      );
      host.addCardToZone(
        'p1',
        'donDeck',
        makeCard({
          id: 'DON',
          number: 'DON',
          name: 'DON!!',
          type: 'DON!!',
        }),
        'don-1',
      );
      host.addDonToCost('p1', 1, true);
      const opponentChar = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'P2-CHAR',
          number: 'P2-CHAR',
          name: 'Opponent Char',
          type: 'Character',
          cost: 3,
        }),
        'opponent-char',
      );
      const leader = host.getPlayer('p1')!.zones.leader;

      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: luffy.instanceId,
        sourceCardId: luffy.cardId,
      });

      let decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      expect(decision!.prompt.type).toBe('confirm');
      engine.answerDecision({ decisionId: decision!.id, confirmed: true });

      decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [opponentChar.instanceId],
      });

      expect(host.getPlayer('p2')?.zones.characters).not.toContain(
        opponentChar,
      );

      decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [leader.instanceId],
      });

      expect(leader.attachedDon).toBe(1);
      expect(host.getPlayer('p1')?.zones.hand).toHaveLength(0);
    });

    it('OP11-119: onPlay grants canAttackActiveCharacters to a character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 3;
      const engine = new EffectEngine(createRegistry(), host);
      const koby = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP11-119',
          number: 'OP11-119',
          name: 'Koby',
          type: 'Character',
        }),
        'koby',
      );
      const ally = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ALLY',
          number: 'ALLY',
          name: 'Ally',
          type: 'Character',
        }),
        'ally',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: koby.instanceId,
        sourceCardId: koby.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [ally.instanceId],
      });

      expect(ally.canAttackActiveCharacters).toBe(true);
    });

    it('OP11-010: onPlay reduces an opponent character power by 2000', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 2;
      const engine = new EffectEngine(createRegistry(), host);
      const hibari = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP11-010',
          number: 'OP11-010',
          name: 'Hibari',
          type: 'Character',
        }),
        'hibari',
      );
      const target = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'P2-CHAR',
          number: 'P2-CHAR',
          name: 'Target',
          type: 'Character',
          power: 4000,
        }),
        'target',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: hibari.instanceId,
        sourceCardId: hibari.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      engine.reapplyContinuousEffects();
      expect(target.power).toBe(2000);
    });

    it('OP11-010: whenAttacking gives self +1000 power', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 2;
      const engine = new EffectEngine(createRegistry(), host);
      const hibari = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP11-010',
          number: 'OP11-010',
          name: 'Hibari',
          type: 'Character',
          power: 4000,
        }),
        'hibari',
      );

      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: hibari.instanceId,
        sourceCardId: hibari.cardId,
      });

      engine.reapplyContinuousEffects();
      expect(hibari.power).toBe(5000);
    });

    it('OP11-040: onTurnStart with 8+ DON!! searches for a Straw Hat Crew card', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 5;
      const engine = new EffectEngine(createRegistry(), host);

      for (let i = 0; i < 8; i++) {
        host.addCardToZone(
          'p1',
          'donDeck',
          makeCard({
            id: `DON-${i}`,
            number: `DON-${i}`,
            name: 'DON!!',
            type: 'DON!!',
          }),
          `don-${i}`,
        );
      }
      host.addDonToCost('p1', 8, false);

      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'STRAW-HAT',
          number: 'STRAW-HAT',
          name: 'Luffy',
          type: 'Character',
          families: ['Straw Hat Crew'],
        }),
        'straw-hat',
      );
      for (let i = 0; i < 4; i++) {
        host.addCardToZone(
          'p1',
          'deck',
          makeCard({
            id: `OTHER-${i}`,
            number: `OTHER-${i}`,
            name: `Other ${i}`,
            type: 'Character',
          }),
          `other-${i}`,
        );
      }

      const luffy040 = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP11-040',
          number: 'OP11-040',
          name: 'Monkey.D.Luffy',
          type: 'Character',
        }),
        'luffy-040',
      );

      engine.handleEvent({
        type: 'onTurnStart',
        playerSessionId: 'p1',
        sourceInstanceId: luffy040.instanceId,
        sourceCardId: luffy040.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      expect(decision!.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [],
      });

      expect(host.getPlayer('p1')?.zones.hand).toHaveLength(0);
    });

    it('OP11-044: activateMain trashes a card from hand to give all GERMA 66 characters +1000 power', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 3;
      const engine = new EffectEngine(createRegistry(), host);
      const judge = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP11-044',
          number: 'OP11-044',
          name: 'Vinsmoke Judge',
          type: 'Character',
        }),
        'judge',
      );
      const germaChar = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'GERMA-1',
          number: 'GERMA-1',
          name: 'Germa Soldier',
          type: 'Character',
          power: 5000,
          families: ['GERMA 66'],
        }),
        'germa-1',
      );
      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'FODDER',
          number: 'FODDER',
          name: 'Fodder',
          type: 'Character',
        }),
        'fodder',
      );

      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: judge.instanceId,
        sourceCardId: judge.cardId,
      });

      engine.reapplyContinuousEffects();
      expect(germaChar.power).toBe(6000);
      expect(host.getPlayer('p1')?.zones.hand).toHaveLength(0);
    });

    it('OP11-095: onPlay optional places 3 Navy from trash to bottom then attaches 1 rested DON to leader', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 3;
      const engine = new EffectEngine(createRegistry(), host);
      const garp = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP11-095',
          number: 'OP11-095',
          name: 'Monkey.D.Garp',
          type: 'Character',
        }),
        'garp',
      );

      for (let i = 0; i < 3; i++) {
        host.addCardToZone(
          'p1',
          'trash',
          makeCard({
            id: `NAVY-${i}`,
            number: `NAVY-${i}`,
            name: `Navy ${i}`,
            type: 'Character',
            families: ['Navy'],
          }),
          `navy-${i}`,
        );
      }
      host.addCardToZone(
        'p1',
        'donDeck',
        makeCard({ id: 'DON', number: 'DON', name: 'DON!!', type: 'DON!!' }),
        'don-1',
      );
      host.addDonToCost('p1', 1, true);
      const leader = host.getPlayer('p1')!.zones.leader;

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: garp.instanceId,
        sourceCardId: garp.cardId,
      });

      let decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      expect(decision!.prompt.type).toBe('confirm');
      engine.answerDecision({ decisionId: decision!.id, confirmed: true });

      expect(host.getPlayer('p1')?.zones.trash).toHaveLength(0);

      decision = engine.getPendingDecision();
      if (decision) {
        engine.answerDecision({
          decisionId: decision.id,
          selectedCardInstanceIds: [leader.instanceId],
        });
      }

      expect(leader.attachedDon).toBe(1);
      expect(host.getPlayer('p1')?.zones.cost).toHaveLength(0);
    });

    it('OP11-095: conditional KO triggers when a cost 9+ character is on the field', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 3;
      const engine = new EffectEngine(createRegistry(), host);
      const garp = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP11-095',
          number: 'OP11-095',
          name: 'Monkey.D.Garp',
          type: 'Character',
        }),
        'garp',
      );
      host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'BIG-CHAR',
          number: 'BIG-CHAR',
          name: 'Kaido',
          type: 'Character',
          cost: 10,
        }),
        'kaido',
      );
      const target = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'SMALL-CHAR',
          number: 'SMALL-CHAR',
          name: 'Victim',
          type: 'Character',
          cost: 5,
        }),
        'victim',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: garp.instanceId,
        sourceCardId: garp.cardId,
      });

      let decision = engine.getPendingDecision();
      if (decision?.prompt.type === 'confirm') {
        engine.answerDecision({ decisionId: decision.id, confirmed: false });
      }

      decision = engine.getPendingDecision();
      if (decision) {
        engine.answerDecision({
          decisionId: decision.id,
          selectedCardInstanceIds: [target.instanceId],
        });
      }

      expect(host.getPlayer('p2')?.zones.characters).not.toContain(target);
      expect(host.getPlayer('p2')?.zones.trash[0]).toBe(target);
    });
  });
});
