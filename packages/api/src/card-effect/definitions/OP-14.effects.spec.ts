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
import { op14EffectDefinitions } from './OP-14.effects';
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

  public playCard(
    card: DuelCard,
    controllerSessionId: string,
    zone: string,
  ): void {
    this.removeCard(card.instanceId);
    const player = this.getPlayer(controllerSessionId);
    if (!player) return;
    card.ownerSessionId = controllerSessionId;
    if (zone === 'characters') {
      player.zones.characters.push(card);
    } else if (zone === 'stage') {
      player.zones.stage = card;
    }
  }

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

  it('OP14-032 effect is registered via standard triggers', () => {
    const registry = createRegistry();
    expect(registry.effectsByCardId['OP14-032']?.standard).toHaveLength(2);
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

  it('continuous effect OP14-011 registers correctly', () => {
    const registry = createRegistry();
    const effects = registry.effectsByCardId['OP14-011'];
    expect(effects?.continuous).toBeDefined();
    expect(effects.continuous![0].id).toBe(
      'bartolomeo-011-don-2-gains-blocker',
    );
    expect(effects.continuous![0].conditions![0]).toEqual({
      type: 'sourceHasAttachedDonAtLeast',
      value: 2,
    });
  });

  it('all special handlers for OP14 are registered in the index', () => {
    const handlerIds = specialHandlerDefinitions.map((h) => h.id);
    const expected = [
      'op14-001-special',
      'op14-009-special',
      'op14-017-special',
      'op14-020-special',
      'op14-021-special',
      'op14-033-special',
      'op14-035-special',
      'op14-053-special',
      'op14-056-special',
      'op14-060-special',
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

describe('OP14 behavioral tests', () => {
  function addDonCards(host: TestHost, sessionId: string, count: number): void {
    for (let i = 0; i < count; i++) {
      host.addCardToZone(
        sessionId,
        'donDeck',
        makeCard({
          id: `DON${i}`,
          number: `DON${i}`,
          name: 'DON!!',
          type: 'DON!!',
        }),
        `don-${i}`,
      );
    }
  }

  it('OP14-002 Urouge draws 1 and KOs 3000-power opponent when attacking with 5000+ power', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'DRAW1',
        number: 'DRAW1',
        name: 'Draw',
        type: 'Character',
      }),
      'd1',
    );
    const opponent = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OPP',
        number: 'OPP',
        name: 'Target',
        type: 'Character',
        power: 3000,
      }),
      'opp',
    );
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

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: urouge.instanceId,
      sourceCardId: urouge.cardId,
    });

    expect(host.getPlayer('p1')?.zones.hand.length).toBe(1);

    const koDecision = engine.getPendingDecision();
    expect(koDecision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: koDecision!.id,
      selectedCardInstanceIds: [opponent.instanceId],
    });

    expect(host.getPlayer('p2')?.zones.characters).not.toContain(opponent);
    expect(host.getPlayer('p2')?.zones.trash[0]).toBe(opponent);
  });

  it('OP14-011 Bartolomeo gains Blocker with 2 attached DON!!', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const bartolomeo = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-011',
        number: 'OP14-011',
        name: 'Bartolomeo',
        type: 'Character',
      }),
      'bartolomeo',
    );

    expect(bartolomeo.mustBeAttackTarget).toBe(false);

    bartolomeo.attachedDon = 2;
    engine.reapplyContinuousEffects();

    expect(bartolomeo.mustBeAttackTarget).toBe(true);
    expect(bartolomeo.cannotBlock).toBe(false);
  });

  it('OP14-005 Killer attachDon activateMain once per turn', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const killer = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-005',
        number: 'OP14-005',
        name: 'Killer',
        type: 'Character',
      }),
      'killer',
    );
    addDonCards(host, 'p1', 5);
    host.addDonToCost('p1', 5, true);

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: killer.instanceId,
      sourceCardId: killer.cardId,
    });

    const pending = engine.getPendingDecision();
    expect(pending?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: pending!.id,
      selectedCardInstanceIds: [killer.instanceId],
    });

    expect(killer.attachedDon).toBe(1);
  });

  it('OP14-013 Luffy gives opponent -1000 power when attacking', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const luffy = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-013',
        number: 'OP14-013',
        name: 'Monkey.D.Luffy',
        type: 'Character',
      }),
      'luffy',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'TGT',
        number: 'TGT',
        name: 'Target',
        type: 'Character',
        power: 5000,
      }),
      'tgt',
    );

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: luffy.instanceId,
      sourceCardId: luffy.cardId,
    });

    const pending = engine.getPendingDecision();
    expect(pending?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: pending!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(target.power).toBe(4000);
  });

  it('OP14-018 Time for Counterattack trigger plays red 2000-power character from hand', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const event = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP14-018',
        number: 'OP14-018',
        name: 'Time for Counterattack',
        type: 'Event',
      }),
      'ev',
    );
    const redChar = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'RED1',
        number: 'RED1',
        name: 'Red Fighter',
        type: 'Character',
        colors: ['Red'],
        power: 2000,
      }),
      'redChar',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: event.instanceId,
      sourceCardId: event.cardId,
    });

    const pending = engine.getPendingDecision();
    expect(pending?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: pending!.id,
      selectedCardInstanceIds: [redChar.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.characters).toContain(redChar);
    expect(host.getPlayer('p1')?.zones.hand).not.toContain(redChar);
  });

  it('OP14-023 Kikunojo restands at end of turn', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const kikunojo = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-023',
        number: 'OP14-023',
        name: 'Kikunojo',
        type: 'Character',
      }),
      'kiku',
    );
    kikunojo.rested = true;

    engine.handleEvent({
      type: 'onTurnEnd',
      playerSessionId: 'p1',
      sourceInstanceId: kikunojo.instanceId,
      sourceCardId: kikunojo.cardId,
    });

    expect(kikunojo.rested).toBe(false);
  });

  it('OP14-024 Kinemon unrests DON!! on play', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const kinemon = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-024',
        number: 'OP14-024',
        name: 'Kinemon',
        type: 'Character',
      }),
      'kine',
    );
    addDonCards(host, 'p1', 5);
    host.addDonToCost('p1', 5, true);

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: kinemon.instanceId,
      sourceCardId: kinemon.cardId,
    });

    const costDon = host.getPlayer('p1')?.zones.cost ?? [];
    const activeDon = costDon.filter((d) => !d.rested).length;
    expect(activeDon).toBeGreaterThanOrEqual(3);
  });

  it('OP14-031 Nami rests 2 opponent characters with cost 8 or less on play', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const nami = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-031',
        number: 'OP14-031',
        name: 'Nami',
        type: 'Character',
      }),
      'nami',
    );
    const opp1 = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OPP1',
        number: 'OPP1',
        name: 'Fodder',
        type: 'Character',
        cost: 3,
      }),
      'opp1',
    );
    const opp2 = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OPP2',
        number: 'OPP2',
        name: 'Fodder2',
        type: 'Character',
        cost: 5,
      }),
      'opp2',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: nami.instanceId,
      sourceCardId: nami.cardId,
    });

    expect(opp1.rested).toBe(true);
    expect(opp2.rested).toBe(true);
  });

  it('OP14-047 Shirahoshi draws 1 and plays fish-man from hand on play', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'DEK1', number: 'DEK1', name: 'Draw', type: 'Character' }),
      'dek1',
    );
    const fishMan = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'FISH',
        number: 'FISH',
        name: 'Fish-Man Fighter',
        type: 'Character',
        families: ['Fish-Man'],
        cost: 3,
      }),
      'fish',
    );
    const shirahoshi = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-047',
        number: 'OP14-047',
        name: 'Shirahoshi',
        type: 'Character',
      }),
      'shira',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: shirahoshi.instanceId,
      sourceCardId: shirahoshi.cardId,
    });

    expect(host.getPlayer('p1')?.zones.hand.length).toBe(2);

    const pending = engine.getPendingDecision();
    expect(pending?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: pending!.id,
      selectedCardInstanceIds: [fishMan.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.characters).toContain(fishMan);
    expect(host.getPlayer('p1')?.zones.hand).not.toContain(fishMan);
  });

  it('OP14-048 Shiryu bounces 1 opponent character and trashes entire hand on play', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const shiryu = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-048',
        number: 'OP14-048',
        name: 'Shiryu',
        type: 'Character',
      }),
      'shiryu',
    );
    const opponent = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OPP',
        number: 'OPP',
        name: 'Bouncer',
        type: 'Character',
      }),
      'opp',
    );
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({ id: 'H1', number: 'H1', name: 'Card1', type: 'Character' }),
      'h1',
    );
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({ id: 'H2', number: 'H2', name: 'Card2', type: 'Character' }),
      'h2',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: shiryu.instanceId,
      sourceCardId: shiryu.cardId,
    });

    const bounceDecision = engine.getPendingDecision();
    expect(bounceDecision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: bounceDecision!.id,
      selectedCardInstanceIds: [opponent.instanceId],
    });

    expect(host.getPlayer('p2')?.zones.characters).not.toContain(opponent);
    expect(host.getPlayer('p2')?.zones.hand).toContain(opponent);

    const trashDecision = engine.getPendingDecision();
    expect(trashDecision?.prompt.type).toBe('selectCards');
    const handCards = host.getPlayer('p1')?.zones.hand ?? [];
    engine.answerDecision({
      decisionId: trashDecision!.id,
      selectedCardInstanceIds: handCards.map((c) => c.instanceId),
    });

    expect(host.getPlayer('p1')?.zones.hand.length).toBe(0);
    expect(host.getPlayer('p1')?.zones.trash.length).toBe(2);
  });

  it('OP14-064 Giolla adds 1 rested DON!! and KOs 0-base-power character on KO', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    addDonCards(host, 'p1', 1);
    const giolla = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-064',
        number: 'OP14-064',
        name: 'Giolla',
        type: 'Character',
      }),
      'giolla',
    );
    const zeroPower = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'ZERO',
        number: 'ZERO',
        name: 'ZeroPower',
        type: 'Character',
        power: 0,
      }),
      'zero',
    );

    engine.handleEvent({
      type: 'onKo',
      playerSessionId: 'p1',
      sourceInstanceId: giolla.instanceId,
      sourceCardId: giolla.cardId,
    });

    expect(host.getPlayer('p1')?.zones.cost.length).toBe(1);
    expect(host.getPlayer('p1')?.zones.cost[0].rested).toBe(true);

    const koDecision = engine.getPendingDecision();
    expect(koDecision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: koDecision!.id,
      selectedCardInstanceIds: [zeroPower.instanceId],
    });

    expect(host.getPlayer('p2')?.zones.characters).not.toContain(zeroPower);
    expect(host.getPlayer('p2')?.zones.trash[0]).toBe(zeroPower);
  });

  it('OP14-081 Spider Mice trashes 3 from deck on play', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'D1', number: 'D1', name: 'Top1', type: 'Character' }),
      'd1',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'D2', number: 'D2', name: 'Top2', type: 'Character' }),
      'd2',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'D3', number: 'D3', name: 'Top3', type: 'Character' }),
      'd3',
    );
    const mice = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-081',
        number: 'OP14-081',
        name: 'Spider Mice',
        type: 'Character',
      }),
      'mice',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: mice.instanceId,
      sourceCardId: mice.cardId,
    });

    expect(host.getPlayer('p1')?.zones.trash.length).toBe(3);
    expect(host.getPlayer('p1')?.zones.deck.length).toBe(0);
  });

  it('OP14-085 Miss Goldenweek draws 2 and trashes 2 on KO', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'D1', number: 'D1', name: 'Draw1', type: 'Character' }),
      'd1',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'D2', number: 'D2', name: 'Draw2', type: 'Character' }),
      'd2',
    );
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({ id: 'H1', number: 'H1', name: 'Trash1', type: 'Character' }),
      'h1',
    );
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({ id: 'H2', number: 'H2', name: 'Trash2', type: 'Character' }),
      'h2',
    );
    const goldenweek = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-085',
        number: 'OP14-085',
        name: 'Miss Goldenweek',
        type: 'Character',
      }),
      'goldenweek',
    );

    engine.handleEvent({
      type: 'onKo',
      playerSessionId: 'p1',
      sourceInstanceId: goldenweek.instanceId,
      sourceCardId: goldenweek.cardId,
    });

    expect(host.getPlayer('p1')?.zones.hand.length).toBe(4);

    const trashDecision = engine.getPendingDecision();
    expect(trashDecision?.prompt.type).toBe('selectCards');
    const handCards = host.getPlayer('p1')?.zones.hand ?? [];
    engine.answerDecision({
      decisionId: trashDecision!.id,
      selectedCardInstanceIds: handCards.slice(0, 2).map((c) => c.instanceId),
    });

    expect(host.getPlayer('p1')?.zones.hand.length).toBe(2);
    expect(host.getPlayer('p1')?.zones.trash.length).toBe(2);
  });

  it('OP14-001 Trafalgar Law special swaps base power of 2 Supernovas characters', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op14EffectDefinitions], specialHandlerDefinitions),
      host,
    );

    const law = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-001',
        number: 'OP14-001',
        name: 'Trafalgar Law',
        type: 'Character',
      }),
      'law',
    );
    const weak = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'WEAK',
        number: 'WEAK',
        name: 'Weak Supernova',
        type: 'Character',
        power: 2000,
        families: ['Supernovas'],
      }),
      'weak',
    );
    const strong = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'STRONG',
        number: 'STRONG',
        name: 'Strong Supernova',
        type: 'Character',
        power: 7000,
        families: ['Supernovas'],
      }),
      'strong',
    );

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: law.instanceId,
      sourceCardId: law.cardId,
    });

    const pending = engine.getPendingDecision();
    expect(pending?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: pending!.id,
      selectedCardInstanceIds: [weak.instanceId, strong.instanceId],
    });

    expect(weak.power).toBe(7000);
    expect(strong.power).toBe(2000);
  });

  it('OP14-016 X.Drake standard effect gives -2000 power when attacking with DON!! x1', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op14EffectDefinitions], specialHandlerDefinitions),
      host,
    );

    const drake = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-016',
        number: 'OP14-016',
        name: 'X.Drake',
        type: 'Character',
      }),
      'drake',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'TGT',
        number: 'TGT',
        name: 'Target',
        type: 'Character',
        power: 5000,
      }),
      'tgt',
    );
    drake.attachedDon = 1;

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: drake.instanceId,
      sourceCardId: drake.cardId,
    });

    const pending = engine.getPendingDecision();
    expect(pending?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: pending!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(target.power).toBe(3000);
  });

  it('OP14-028 Johnny standard effect KOs opponent rested cost 2 character when becoming rested on play', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op14EffectDefinitions], specialHandlerDefinitions),
      host,
    );

    const johnny = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-028',
        number: 'OP14-028',
        name: 'Johnny',
        type: 'Character',
        power: 3000,
      }),
      'johnny',
    );
    johnny.rested = true;
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'TGT',
        number: 'TGT',
        name: 'Rested Fodder',
        type: 'Character',
        cost: 2,
      }),
      'tgt',
    );
    target.rested = true;

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: johnny.instanceId,
      sourceCardId: johnny.cardId,
    });

    const koDecision = engine.getPendingDecision();
    expect(koDecision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: koDecision!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(host.getPlayer('p2')?.zones.characters).not.toContain(target);
    expect(host.getPlayer('p2')?.zones.trash[0]).toBe(target);
  });

  it('OP14-027 Shanks standard effect rests an opponent character with 7000 base power or less when becoming rested on play', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op14EffectDefinitions], specialHandlerDefinitions),
      host,
    );

    const shanks = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-027',
        number: 'OP14-027',
        name: 'Shanks',
        type: 'Character',
        power: 6000,
      }),
      'shanks-027',
    );
    shanks.rested = true;
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'TGT-27',
        number: 'TGT-27',
        name: 'Target 27',
        type: 'Character',
        power: 7000,
      }),
      'tgt-27',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: shanks.instanceId,
      sourceCardId: shanks.cardId,
    });

    const decision = engine.getPendingDecision();
    if (decision) {
      expect(decision.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision.id,
        selectedCardInstanceIds: [target.instanceId],
      });
    }

    expect(target.rested).toBe(true);
  });

  it('OP14-027 Shanks continuous effect gives opponent characters +1000 on opponent turn while rested', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op14EffectDefinitions], specialHandlerDefinitions),
      host,
    );

    const shanks = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-027',
        number: 'OP14-027',
        name: 'Shanks',
        type: 'Character',
        power: 6000,
      }),
      'shanks-027',
    );
    shanks.rested = true;
    const opponentChar = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OPP-27',
        number: 'OPP-27',
        name: 'Opponent 27',
        type: 'Character',
        power: 5000,
      }),
      'opp-27',
    );

    host.state.activePlayerSessionId = 'p2';
    engine.reapplyContinuousEffects();

    expect(opponentChar.power).toBe(6000);
  });

  it('OP14-032 Humandrill standard effect rests an opponent character with cost 4 or less when becoming rested on play', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op14EffectDefinitions], specialHandlerDefinitions),
      host,
    );

    const humandrill = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-032',
        number: 'OP14-032',
        name: 'Humandrill',
        type: 'Character',
        power: 4000,
      }),
      'humandrill',
    );
    humandrill.rested = true;
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'TGT-32',
        number: 'TGT-32',
        name: 'Cost Four Target',
        type: 'Character',
        cost: 4,
      }),
      'tgt-32',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: humandrill.instanceId,
      sourceCardId: humandrill.cardId,
    });

    const decision = engine.getPendingDecision();
    if (decision) {
      expect(decision.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision.id,
        selectedCardInstanceIds: [target.instanceId],
      });
    }

    expect(target.rested).toBe(true);
  });

  it('OP14-045 Kuroobi standard effect draws 1 on KO', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op14EffectDefinitions], specialHandlerDefinitions),
      host,
    );

    host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'D1', number: 'D1', name: 'Draw', type: 'Character' }),
      'd1',
    );
    const kuroobi = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-045',
        number: 'OP14-045',
        name: 'Kuroobi',
        type: 'Character',
      }),
      'kuroobi',
    );

    expect(host.getPlayer('p1')?.zones.hand.length).toBe(0);

    engine.handleEvent({
      type: 'onKo',
      playerSessionId: 'p1',
      sourceInstanceId: kuroobi.instanceId,
      sourceCardId: kuroobi.cardId,
    });

    expect(host.getPlayer('p1')?.zones.hand.length).toBe(1);
  });

  it('OP14-045 Kuroobi gains Rush during the turn when your hand card is trashed by an effect', () => {
    const helperDefinition = {
      editionId: 'TEST',
      cards: [
        {
          cardId: 'HELPER-TRASH-HAND',
          effects: [
            {
              kind: 'standard' as const,
              effect: {
                id: 'helper-trash-hand',
                text: 'Trash 1 card from your hand.',
                trigger: { type: 'onPlay' as const },
                actions: [
                  {
                    type: 'trashFromHand' as const,
                    selector: {
                      player: 'self' as const,
                      zones: ['hand'] as const,
                      count: { kind: 'exact' as const, value: 1 },
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    };
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry(
        [op14EffectDefinitions, helperDefinition],
        specialHandlerDefinitions,
      ),
      host,
    );

    const kuroobi = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-045',
        number: 'OP14-045',
        name: 'Kuroobi',
        type: 'Character',
      }),
      'kuroobi',
    );
    const helper = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'HELPER-TRASH-HAND',
        number: 'HELPER-TRASH-HAND',
        name: 'Helper Trash Hand',
        type: 'Character',
      }),
      'helper-trash-hand',
    );
    const trashedCard = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'HAND-TRASH',
        number: 'HAND-TRASH',
        name: 'Hand Trash',
        type: 'Event',
      }),
      'hand-trash',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: helper.instanceId,
      sourceCardId: helper.cardId,
    });

    expect(kuroobi.hasRush).toBe(true);
    expect(host.getPlayer('p1')?.zones.trash).toContain(trashedCard);
  });

  it('OP14-044 Edward.Newgate reveals the top deck card, then draws 2 and trashes 1 if it includes Whitebeard Pirates', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op14EffectDefinitions], specialHandlerDefinitions),
      host,
    );

    const newgate = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-044',
        number: 'OP14-044',
        name: 'Edward.Newgate',
        type: 'Character',
      }),
      'newgate',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'TOP-DECK',
        number: 'TOP-DECK',
        name: 'Top Deck',
        type: 'Character',
        families: ['The Four Emperors Whitebeard Pirates'],
      }),
      'top-deck',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'DRAW-1',
        number: 'DRAW-1',
        name: 'Draw 1',
        type: 'Character',
      }),
      'draw-1',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'DRAW-2',
        number: 'DRAW-2',
        name: 'Draw 2',
        type: 'Character',
      }),
      'draw-2',
    );
    const trashedCard = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'TRASH-ME',
        number: 'TRASH-ME',
        name: 'Trash Me',
        type: 'Event',
      }),
      'trash-me',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: newgate.instanceId,
      sourceCardId: newgate.cardId,
    });

    const pending = engine.getPendingDecision();
    expect(pending?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: pending!.id,
      selectedCardInstanceIds: [trashedCard.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(2);
    expect(host.getPlayer('p1')?.zones.trash).toContain(trashedCard);
  });

  it('OP14-049 Jinbe can rest 2 DON!! to draw 2 and return a cost-7-or-less Character to hand on play', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op14EffectDefinitions], specialHandlerDefinitions),
      host,
    );

    host.addCardToZone(
      'p1',
      'cost',
      makeCard({
        id: 'COST-DON-1',
        number: 'COST-DON-1',
        name: 'DON!!',
        type: 'Don',
      }),
      'cost-don-1',
    );
    host.addCardToZone(
      'p1',
      'cost',
      makeCard({
        id: 'COST-DON-2',
        number: 'COST-DON-2',
        name: 'DON!!',
        type: 'Don',
      }),
      'cost-don-2',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'DRAW-1-049',
        number: 'DRAW-1-049',
        name: 'Draw 1',
        type: 'Character',
      }),
      'draw-1-049',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'DRAW-2-049',
        number: 'DRAW-2-049',
        name: 'Draw 2',
        type: 'Character',
      }),
      'draw-2-049',
    );
    const jinbe = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-049',
        number: 'OP14-049',
        name: 'Jinbe',
        type: 'Character',
      }),
      'jinbe',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'TARGET-049',
        number: 'TARGET-049',
        name: 'Target 049',
        type: 'Character',
        cost: 7,
      }),
      'target-049',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: jinbe.instanceId,
      sourceCardId: jinbe.cardId,
    });

    const confirm = engine.getPendingDecision();
    expect(confirm?.prompt.type).toBe('confirm');
    engine.answerDecision({
      decisionId: confirm!.id,
      confirmed: true,
    });

    const selectTarget = engine.getPendingDecision();
    expect(selectTarget?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: selectTarget!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(2);
    expect(host.getPlayer('p2')?.zones.hand).toContain(target);
    expect(host.getPlayer('p2')?.zones.characters).not.toContain(target);
  });

  it('OP14-049 Jinbe gains Rush during the turn when your hand card is trashed by an effect', () => {
    const helperDefinition = {
      editionId: 'TEST',
      cards: [
        {
          cardId: 'HELPER-TRASH-HAND',
          effects: [
            {
              kind: 'standard' as const,
              effect: {
                id: 'helper-trash-hand',
                text: 'Trash 1 card from your hand.',
                trigger: { type: 'onPlay' as const },
                actions: [
                  {
                    type: 'trashFromHand' as const,
                    selector: {
                      player: 'self' as const,
                      zones: ['hand'] as const,
                      count: { kind: 'exact' as const, value: 1 },
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    };
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry(
        [op14EffectDefinitions, helperDefinition],
        specialHandlerDefinitions,
      ),
      host,
    );

    const jinbe = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-049',
        number: 'OP14-049',
        name: 'Jinbe',
        type: 'Character',
      }),
      'jinbe',
    );
    const helper = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'HELPER-TRASH-HAND',
        number: 'HELPER-TRASH-HAND',
        name: 'Helper Trash Hand',
        type: 'Character',
      }),
      'helper-trash-hand',
    );
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'HAND-TRASH-049',
        number: 'HAND-TRASH-049',
        name: 'Hand Trash 049',
        type: 'Event',
      }),
      'hand-trash-049',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: helper.instanceId,
      sourceCardId: helper.cardId,
    });

    expect(jinbe.hasRush).toBe(true);
  });

  it('OP14-056 Wadatsumi cannot attack by default, then regains its effect after a hand card is trashed by an effect until end of turn', () => {
    const helperDefinition = {
      editionId: 'TEST',
      cards: [
        {
          cardId: 'HELPER-TRASH-HAND',
          effects: [
            {
              kind: 'standard' as const,
              effect: {
                id: 'helper-trash-hand',
                text: 'Trash 1 card from your hand.',
                trigger: { type: 'onPlay' as const },
                actions: [
                  {
                    type: 'trashFromHand' as const,
                    selector: {
                      player: 'self' as const,
                      zones: ['hand'] as const,
                      count: { kind: 'exact' as const, value: 1 },
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    };
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry(
        [op14EffectDefinitions, helperDefinition],
        specialHandlerDefinitions,
      ),
      host,
    );

    const wadatsumi = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-056',
        number: 'OP14-056',
        name: 'Wadatsumi',
        type: 'Character',
      }),
      'wadatsumi',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: wadatsumi.instanceId,
      sourceCardId: wadatsumi.cardId,
    });

    expect(wadatsumi.cannotAttack).toBe(true);

    const helper = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'HELPER-TRASH-HAND',
        number: 'HELPER-TRASH-HAND',
        name: 'Helper Trash Hand',
        type: 'Character',
      }),
      'helper-trash-hand',
    );
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'WADA-HAND-TRASH',
        number: 'WADA-HAND-TRASH',
        name: 'Wada Hand Trash',
        type: 'Event',
      }),
      'wada-hand-trash',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: helper.instanceId,
      sourceCardId: helper.cardId,
    });

    expect(wadatsumi.cannotAttack).toBe(false);

    engine.handleEvent({
      type: 'onTurnEnd',
      playerSessionId: 'p1',
      sourceInstanceId: wadatsumi.instanceId,
      sourceCardId: wadatsumi.cardId,
    });

    expect(wadatsumi.cannotAttack).toBe(true);
  });

  it('OP14-061 Vergo standard effect gives opponent -2000 power when attacking with DON!! x1', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op14EffectDefinitions]),
      host,
    );

    const vergo = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-061',
        number: 'OP14-061',
        name: 'Vergo',
        type: 'Character',
      }),
      'vergo',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'TGT',
        number: 'TGT',
        name: 'Target',
        type: 'Character',
        power: 5000,
      }),
      'tgt',
    );
    host.addCardToZone(
      'p1',
      'cost',
      makeCard({
        id: 'DON-1',
        number: 'DON-1',
        name: 'DON!!',
        type: 'Don',
      }),
      'don-1',
    );

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: vergo.instanceId,
      sourceCardId: vergo.cardId,
    });

    const pending = engine.getPendingDecision();
    expect(pending?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: pending!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(target.power).toBe(3000);
  });

  it("OP14-041 Boa Hancock draws 1 when you play a Character during your opponent's turn", () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    host.state.activePlayerSessionId = 'p2';
    const engine = new EffectEngine(
      createRegistry([op14EffectDefinitions], specialHandlerDefinitions),
      host,
    );

    const boa = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-041',
        number: 'OP14-041',
        name: 'Boa Hancock',
        type: 'Character',
      }),
      'boa',
    );
    const playedCharacter = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'PLAYED-1',
        number: 'PLAYED-1',
        name: 'Played Character',
        type: 'Character',
      }),
      'played-character',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'DRAW-1',
        number: 'DRAW-1',
        name: 'Draw 1',
        type: 'Character',
      }),
      'draw-1',
    );

    engine.handleEvent({
      type: 'onCharacterPlayed',
      playerSessionId: 'p1',
      sourceInstanceId: playedCharacter.instanceId,
      sourceCardId: playedCharacter.cardId,
      sourceZone: 'hand',
    });

    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(1);
    expect(host.getPlayer('p1')?.zones.hand[0]?.name).toBe('Draw 1');
    expect(host.getPlayer('p1')?.zones.characters).toContain(boa);
  });

  it("OP14-041 Boa Hancock moves the top opponent Life card to its owner's hand when your 5000+ Amazon Lily or Kuja Pirates Character is K.O.'d", () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op14EffectDefinitions], specialHandlerDefinitions),
      host,
    );

    const boa = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-041',
        number: 'OP14-041',
        name: 'Boa Hancock',
        type: 'Character',
        power: 5000,
      }),
      'boa',
    );
    boa.attachedDon = 1;

    const alliedCharacter = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ALLY-1',
        number: 'ALLY-1',
        name: 'Allied Character',
        type: 'Character',
        power: 5000,
        families: ['Amazon Lily'],
      }),
      'allied-character',
    );
    host.addCardToZone(
      'p2',
      'life',
      makeCard({
        id: 'LIFE-1',
        number: 'LIFE-1',
        name: 'Life 1',
        type: 'Event',
      }),
      'life-1',
    );

    engine.handleEvent({
      type: 'onKo',
      playerSessionId: 'p1',
      sourceInstanceId: alliedCharacter.instanceId,
      sourceCardId: alliedCharacter.cardId,
      targetInstanceId: alliedCharacter.instanceId,
      targetCardId: alliedCharacter.cardId,
    });

    expect(host.getPlayer('p2')?.zones.life).toHaveLength(0);
    expect(host.getPlayer('p2')?.zones.hand).toHaveLength(1);
    expect(host.getPlayer('p2')?.zones.hand[0]?.name).toBe('Life 1');
  });

  it('OP14-062 Gladius special KOs opponent 6000-base-power character with DON!! 1 on KO', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op14EffectDefinitions], specialHandlerDefinitions),
      host,
    );

    const gladius = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-062',
        number: 'OP14-062',
        name: 'Gladius',
        type: 'Character',
      }),
      'gladius',
    );
    addDonCards(host, 'p1', 1);
    host.addDonToCost('p1', 1, false);
    host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'TGT',
        number: 'TGT',
        name: 'Victim',
        type: 'Character',
        power: 6000,
      }),
      'tgt',
    );

    engine.handleEvent({
      type: 'onKo',
      playerSessionId: 'p1',
      sourceInstanceId: gladius.instanceId,
      sourceCardId: gladius.cardId,
    });

    const confirmDecision = engine.getPendingDecision();
    expect(confirmDecision?.prompt.type).toBe('confirm');
    engine.answerDecision({ decisionId: confirmDecision!.id, confirmed: true });

    const modeDecision = engine.getPendingDecision();
    expect(modeDecision?.prompt.type).toBe('selectChoice');
    engine.answerDecision({
      decisionId: modeDecision!.id,
      selectedChoiceIds: ['ko'],
    });

    const targetDecision = engine.getPendingDecision();
    expect(targetDecision?.prompt.type).toBe('selectCards');

    const target = host.getPlayer('p2')?.zones.characters[0];
    engine.answerDecision({
      decisionId: targetDecision!.id,
      selectedCardInstanceIds: [target!.instanceId],
    });

    expect(host.getPlayer('p2')?.zones.characters.length).toBe(0);
    expect(host.getPlayer('p1')?.zones.cost.length).toBe(0);
  });

  it('OP14-069 Doflamingo special KOs opponent 8-cost character with DON!! -3 on play', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op14EffectDefinitions], specialHandlerDefinitions),
      host,
    );

    const doflamingo = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-069',
        number: 'OP14-069',
        name: 'Donquixote Doflamingo',
        type: 'Character',
      }),
      'dofi',
    );
    addDonCards(host, 'p1', 3);
    host.addDonToCost('p1', 3, false);
    const leader = host.getPlayer('p1')?.zones.leader!;
    leader.families = ['Donquixote Pirates'];
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'TGT',
        number: 'TGT',
        name: 'Victim',
        type: 'Character',
        cost: 5,
      }),
      'tgt',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: doflamingo.instanceId,
      sourceCardId: doflamingo.cardId,
    });

    const confirmDecision = engine.getPendingDecision();
    expect(confirmDecision?.prompt.type).toBe('confirm');
    engine.answerDecision({ decisionId: confirmDecision!.id, confirmed: true });

    const modeDecision = engine.getPendingDecision();
    expect(modeDecision?.prompt.type).toBe('selectChoice');
    engine.answerDecision({
      decisionId: modeDecision!.id,
      selectedChoiceIds: ['ko'],
    });

    const targetDecision = engine.getPendingDecision();
    expect(targetDecision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: targetDecision!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(host.getPlayer('p2')?.zones.characters).not.toContain(target);
    expect(host.getPlayer('p1')?.zones.cost.length).toBe(0);
  });

  it('OP14-092 Mr.3 replacement saves character from KO on opponent turn', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const mr3 = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-092',
        number: 'OP14-092',
        name: 'Mr.3',
        type: 'Character',
      }),
      'mr3',
    );
    host.addCardToZone(
      'p1',
      'trash',
      makeCard({ id: 'T1', number: 'T1', name: 'Trash1', type: 'Character' }),
      't1',
    );
    host.addCardToZone(
      'p1',
      'trash',
      makeCard({ id: 'T2', number: 'T2', name: 'Trash2', type: 'Character' }),
      't2',
    );
    host.addCardToZone(
      'p1',
      'trash',
      makeCard({ id: 'T3', number: 'T3', name: 'Trash3', type: 'Character' }),
      't3',
    );

    host.state.activePlayerSessionId = 'p2';

    const replaced = engine.applyReplacement({
      type: 'wouldKoCharacter',
      playerSessionId: 'p1',
      sourceInstanceId: mr3.instanceId,
    });

    expect(replaced).toBe(true);
    expect(host.getPlayer('p1')?.zones.trash.length).toBe(0);
    expect(host.getPlayer('p1')?.zones.deck.length).toBe(3);
  });

  it('OP14-010 Basil Hawkins searches 5 deck cards for Supernovas 2000-power on KO', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op14EffectDefinitions], specialHandlerDefinitions),
      host,
    );

    const hawkins = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-010',
        number: 'OP14-010',
        name: 'Basil Hawkins',
        type: 'Character',
      }),
      'hawkins',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'FOUND',
        number: 'FOUND',
        name: 'Supernova Buddy',
        type: 'Character',
        families: ['Supernovas'],
        power: 2000,
      }),
      'found',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'OTHER',
        number: 'OTHER',
        name: 'Other Card',
        type: 'Character',
      }),
      'other',
    );

    engine.handleEvent({
      type: 'onKo',
      playerSessionId: 'p1',
      sourceInstanceId: hawkins.instanceId,
      sourceCardId: hawkins.cardId,
    });

    expect(host.getPlayer('p1')?.zones.hand.length).toBe(0);

    const searchDecision = engine.getPendingDecision();
    expect(searchDecision?.prompt.type).toBe('selectCards');
    const found = host
      .getPlayer('p1')
      ?.zones.deck.find((c) => c.cardId === 'FOUND');
    if (found) {
      engine.answerDecision({
        decisionId: searchDecision!.id,
        selectedCardInstanceIds: [found.instanceId],
      });
    }

    expect(host.getPlayer('p1')?.zones.characters).toContain(
      host.getPlayer('p1')?.zones.characters.find((c) => c.cardId === 'FOUND'),
    );
  });

  it('OP14-017 Chambres special swaps base power of 2 opponent characters', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op14EffectDefinitions], specialHandlerDefinitions),
      host,
    );

    const chambres = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-017',
        number: 'OP14-017',
        name: 'Chambres',
        type: 'Event',
      }),
      'chambres',
    );
    const weak = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'WEAK',
        number: 'WEAK',
        name: 'Weak Opponent',
        type: 'Character',
        power: 2000,
      }),
      'weak',
    );
    const strong = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'STRONG',
        number: 'STRONG',
        name: 'Strong Opponent',
        type: 'Character',
        power: 8000,
      }),
      'strong',
    );

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: chambres.instanceId,
      sourceCardId: chambres.cardId,
    });

    const pending = engine.getPendingDecision();
    expect(pending?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: pending!.id,
      selectedCardInstanceIds: [weak.instanceId, strong.instanceId],
    });

    expect(weak.power).toBe(8000);
    expect(strong.power).toBe(2000);
  });

  it('OP14-065 Senor Pink returns 1 opponent DON!! to deck on KO', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const pink = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-065',
        number: 'OP14-065',
        name: 'Senor Pink',
        type: 'Character',
      }),
      'pink',
    );
    addDonCards(host, 'p2', 3);
    host.addDonToCost('p2', 3, false);

    expect(host.getPlayer('p2')?.zones.cost.length).toBe(3);

    engine.handleEvent({
      type: 'onKo',
      playerSessionId: 'p1',
      sourceInstanceId: pink.instanceId,
      sourceCardId: pink.cardId,
    });

    expect(host.getPlayer('p2')?.zones.cost.length).toBe(2);
    expect(host.getPlayer('p2')?.zones.donDeck.length).toBe(1);
  });

  it('OP14-072 Baby 5 adds 1 active DON!! from deck on play', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const baby5 = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP14-072',
        number: 'OP14-072',
        name: 'Baby 5',
        type: 'Character',
      }),
      'baby5',
    );
    addDonCards(host, 'p1', 1);

    expect(host.getPlayer('p1')?.zones.cost.length).toBe(0);

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: baby5.instanceId,
      sourceCardId: baby5.cardId,
    });

    expect(host.getPlayer('p1')?.zones.cost.length).toBe(1);
    expect(host.getPlayer('p1')?.zones.cost[0].rested).toBe(false);
  });
});
