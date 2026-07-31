/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unused-vars */
import { describe, expect, it } from 'vitest';
import {
  DuelCard,
  DuelPlayer,
  DuelState,
  createDuelCard,
  type Card,
  type CardEffectDefinition,
} from '@onepiecetcg/shared';
import { EffectEngine, type EffectEngineHost } from '../../../effect-engine/src/effect-engine.js';
import { buildEffectIndexes } from '../../../effect-engine/src/effect-indexes.js';
import type {
  EffectRegistry,
  SpecialHandlerDefinition,
} from '../../../effect-engine/src/types/effect-registry.js';
import { st02EffectDefinitions } from './ST-02.effects';
import { specialHandlerDefinitions } from '../index.js';

const makeCard = (
  overrides: Partial<Card> & Pick<Card, 'id' | 'number' | 'name' | 'type'>,
): Card => ({
  id: overrides.id,
  number: overrides.number,
  name: overrides.name,
  type: overrides.type,
  colors: overrides.colors ?? ['Green'],
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
  definitions = [st02EffectDefinitions],
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

  public addPlayer(sessionId: string, leader?: Partial<Card>): DuelPlayer {
    const player = new DuelPlayer();
    player.sessionId = sessionId;
    player.displayName = sessionId;
    player.zones.leader = createDuelCard(
      makeCard({
        id: leader?.id ?? `L-${sessionId}`,
        number: leader?.number ?? `L-${sessionId}`,
        name: leader?.name ?? `${sessionId} Leader`,
        type: 'Leader',
        colors: leader?.colors ?? ['Green'],
        power: leader?.power ?? 5000,
        life: leader?.life ?? 5,
        attributes: leader?.attributes ?? [],
        families: leader?.families ?? [],
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
    player?.zones.deck.reverse();
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
            selector.filter?.cardCategory &&
            !selector.filter.cardCategory.includes(card.type)
          ) {
            continue;
          }

          if (
            selector.filter?.costMax != null &&
            card.cost > selector.filter.costMax
          ) {
            continue;
          }

          if (
            selector.filter?.costMin != null &&
            card.cost < selector.filter.costMin
          ) {
            continue;
          }

          if (
            selector.filter?.trait &&
            !selector.filter.trait.some((trait: string) =>
              card.families.includes(trait),
            )
          ) {
            continue;
          }

          if (
            selector.filter?.name &&
            !selector.filter.name.includes(card.name)
          ) {
            continue;
          }

          if (
            selector.filter?.excludeName &&
            selector.filter.excludeName.includes(card.name)
          ) {
            continue;
          }

          if (
            selector.filter?.hasTrigger != null &&
            (card.trigger ? true : false) !== selector.filter.hasTrigger
          ) {
            continue;
          }

          if (
            selector.filter?.rested != null &&
            card.rested !== selector.filter.rested
          ) {
            continue;
          }

          matches.push(card);
        }
      }
    }

    return matches;
  }

  public moveCard(
    card: DuelCard,
    destinationPlayerSessionId: string,
    destinationZone: string,
    options?: { faceDown?: boolean; rested?: boolean; toBottom?: boolean },
  ): void {
    this.removeCard(card.instanceId);
    const player = this.getPlayer(destinationPlayerSessionId);

    if (!player) {
      return;
    }

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

    if (!player || !card) {
      return null;
    }

    player.zones.hand.push(card);
    return card;
  }

  public trashTopDeckCards(
    playerSessionId: string,
    amount: number,
  ): DuelCard[] {
    const player = this.getPlayer(playerSessionId);
    const moved: DuelCard[] = [];

    if (!player) {
      return moved;
    }

    for (let index = 0; index < amount; index += 1) {
      const card = player.zones.deck.shift();

      if (!card) {
        break;
      }

      player.zones.trash.unshift(card);
      moved.push(card);
    }

    return moved;
  }

  public seedDonDeck(playerSessionId: string, count: number): void {
    const player = this.getPlayer(playerSessionId);
    if (!player) return;
    for (let i = 0; i < count; i++) {
      const don = createDuelCard(
        makeCard({
          id: `DON-${i}`,
          number: `DON-${i}`,
          name: 'DON',
          type: 'DON!!',
          cost: null,
          power: null,
          counter: null,
        }),
        `${playerSessionId}:don-${i}`,
        playerSessionId,
      );
      player.zones.donDeck.push(don);
    }
  }

  public addDonToCost(
    playerSessionId: string,
    amount: number,
    rested: boolean,
  ): number {
    const player = this.getPlayer(playerSessionId);

    if (!player) {
      return 0;
    }

    let moved = 0;

    for (let index = 0; index < amount; index += 1) {
      const don = player.zones.donDeck.shift();

      if (!don) {
        break;
      }

      don.rested = rested;
      player.zones.cost.push(don);
      moved += 1;
    }

    return moved;
  }

  public attachDon(): number {
    return 0;
  }

  public returnDonToDonDeck(playerSessionId: string, amount: number): number {
    const player = this.getPlayer(playerSessionId);

    if (!player) {
      return 0;
    }

    let moved = 0;

    while (player.zones.cost.length > 0 && moved < amount) {
      const don = player.zones.cost.pop();

      if (!don) {
        break;
      }

      player.zones.donDeck.push(don);
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

    if (!player || index < 0) {
      return false;
    }

    const [card] = player.zones.characters.splice(index, 1);

    if (!card) {
      return false;
    }

    player.zones.trash.unshift(card);
    return true;
  }

  public syncPlayer(): void {}

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

  private removeCard(instanceId: string): void {
    for (const player of this.state.players.values()) {
      if (player.zones.stage.instanceId === instanceId) {
        player.zones.stage = new DuelCard();
        return;
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
}

describe('ST02 effect definitions', () => {
  describe('ST02-001 Eustass"Captain"Kid (Leader)', () => {
    it('rests 3 DON and trashes 1 hand card to restand the Leader', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1', {
        id: 'ST02-001',
        name: 'Eustass"Captain"Kid',
      });
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);

      host.seedDonDeck('p1', 10);
      host.addDonToCost('p1', 5, false);

      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'TRASH',
          number: 'TRASH',
          name: 'Trash Me',
          type: 'Event',
        }),
        'trash-me',
      );

      p1.zones.leader.rested = true;

      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: p1.zones.leader.instanceId,
        sourceCardId: 'ST02-001',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('confirm');

      engine.answerDecision({ decisionId: decision!.id, confirmed: true });

      expect(p1.zones.leader.rested).toBe(false);
      expect(p1.zones.cost.length).toBe(2);
      expect(p1.zones.donDeck.length).toBe(8);
      expect(p1.zones.hand.length).toBe(0);
      expect(p1.zones.trash.length).toBe(1);
    });
  });

  describe('ST02-003 Urouge', () => {
    it('gains +2000 power with DON!! x1 and 3+ Characters', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);

      const urouge = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST02-003',
          number: 'ST02-003',
          name: 'Urouge',
          type: 'Character',
          power: 3000,
        }),
        'urouge',
      );
      urouge.attachedDon = 1;

      for (let i = 0; i < 2; i++) {
        host.addCardToZone(
          'p1',
          'characters',
          makeCard({
            id: `OTHER-${i}`,
            number: `OTHER-${i}`,
            name: `Other ${i}`,
            type: 'Character',
          }),
          `other-${i}`,
        );
      }

      engine.reapplyContinuousEffects();

      expect(urouge.power).toBe(5000);
    });

    it('does not gain power without 3+ Characters', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);

      const urouge = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST02-003',
          number: 'ST02-003',
          name: 'Urouge',
          type: 'Character',
          power: 3000,
        }),
        'urouge',
      );
      urouge.attachedDon = 1;

      engine.reapplyContinuousEffects();

      expect(urouge.power).toBe(3000);
    });
  });

  describe('ST02-005 Killer', () => {
    it('KOs up to 1 rested opponent Character with cost 3 or less on play', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1');
      const p2 = host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);

      const killer = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST02-005',
          number: 'ST02-005',
          name: 'Killer',
          type: 'Character',
        }),
        'killer',
      );

      const target = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'TARGET',
          number: 'TARGET',
          name: 'Target',
          type: 'Character',
          cost: 3,
        }),
        'target',
      );
      target.rested = true;

      const safe = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'SAFE',
          number: 'SAFE',
          name: 'Safe',
          type: 'Character',
          cost: 4,
        }),
        'safe',
      );
      safe.rested = true;

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: killer.instanceId,
        sourceCardId: 'ST02-005',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');

      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(p2.zones.characters).not.toContain(target);
      expect(p2.zones.trash).toContain(target);
      expect(p2.zones.characters).toContain(safe);
    });

    it('trigger plays itself from trash', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);

      const killer = host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'ST02-005',
          number: 'ST02-005',
          name: 'Killer',
          type: 'Character',
        }),
        'killer',
      );

      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: killer.instanceId,
        sourceCardId: 'ST02-005',
      });

      expect(host.getPlayer('p1')?.zones.characters).toContain(killer);
      expect(host.getPlayer('p1')?.zones.trash).not.toContain(killer);
    });
  });

  describe('ST02-008 Scratchmen Apoo', () => {
    it('rests all opponent DON!! when attacking with DON!! x1', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      const p2 = host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);

      const apoo = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST02-008',
          number: 'ST02-008',
          name: 'Scratchmen Apoo',
          type: 'Character',
        }),
        'apoo',
      );
      apoo.attachedDon = 1;

      host.seedDonDeck('p2', 10);
      host.addDonToCost('p2', 3, false);
      const initialActiveDon = p2.zones.cost.filter((d) => !d.rested).length;
      expect(initialActiveDon).toBe(3);

      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: apoo.instanceId,
        sourceCardId: 'ST02-008',
      });

      const restedCount = p2.zones.cost.filter((d) => d.rested).length;
      expect(restedCount).toBe(3);
    });
  });

  describe('ST02-009 Trafalgar Law', () => {
    it('sets all matching rested Supernovas/Heart Pirates Characters with cost 5 or less as active on play', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);

      const law = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST02-009',
          number: 'ST02-009',
          name: 'Trafalgar Law',
          type: 'Character',
        }),
        'law',
      );

      const target = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'TARGET',
          number: 'TARGET',
          name: 'Target',
          type: 'Character',
          cost: 4,
          families: ['Supernovas'],
        }),
        'target',
      );
      target.rested = true;

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: law.instanceId,
        sourceCardId: 'ST02-009',
      });

      expect(target.rested).toBe(false);
    });
  });

  describe('ST02-010 Basil Hawkins', () => {
    it('restands when attacking with DON!! x1 during own turn', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);

      const hawkins = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST02-010',
          number: 'ST02-010',
          name: 'Basil Hawkins',
          type: 'Character',
        }),
        'hawkins',
      );
      hawkins.attachedDon = 1;
      hawkins.rested = true;

      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: hawkins.instanceId,
        sourceCardId: 'ST02-010',
      });

      expect(hawkins.rested).toBe(false);
    });
  });

  describe('ST02-013 Eustass"Captain"Kid (013)', () => {
    it('restands at end of turn when it has DON!! x1', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);

      const kid = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST02-013',
          number: 'ST02-013',
          name: 'Eustass"Captain"Kid',
          type: 'Character',
        }),
        'kid',
      );
      kid.attachedDon = 1;
      kid.rested = true;

      engine.handleEvent({
        type: 'onTurnEnd',
        playerSessionId: 'p1',
        sourceInstanceId: kid.instanceId,
        sourceCardId: 'ST02-013',
      });

      expect(kid.rested).toBe(false);
    });
  });

  describe('ST02-014 X.Drake', () => {
    it('buffs Supernovas Leader and Characters by +1000 when rested with DON!! x1 during own turn', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1', {
        families: ['Supernovas'],
      });
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);

      const drake = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST02-014',
          number: 'ST02-014',
          name: 'X.Drake',
          type: 'Character',
          power: 5000,
          families: ['Drake Pirates', 'Navy', 'Supernovas'],
        }),
        'drake',
      );
      drake.attachedDon = 1;
      drake.rested = true;

      const ally = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ALLY',
          number: 'ALLY',
          name: 'Ally',
          type: 'Character',
          power: 3000,
          families: ['Supernovas'],
        }),
        'ally',
      );

      engine.reapplyContinuousEffects();

      expect(drake.power).toBe(6000);
      expect(ally.power).toBe(4000);
      expect(p1.zones.leader.power).toBe(6000);
    });
  });

  describe('ST02-015 Scalpel', () => {
    it('gives +2000 power and restands 1 DON during counter', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);

      const scalpel = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST02-015',
          number: 'ST02-015',
          name: 'Scalpel',
          type: 'Event',
        }),
        'scalpel',
      );

      host.seedDonDeck('p1', 10);
      host.addDonToCost('p1', 3, true);

      engine.handleEvent({
        type: 'activateCounter',
        playerSessionId: 'p1',
        sourceInstanceId: scalpel.instanceId,
        sourceCardId: 'ST02-015',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');

      const leader = p1.zones.leader;
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [leader.instanceId],
      });

      expect(leader.power).toBe(7000);

      const activeDon = p1.zones.cost.filter((d) => !d.rested).length;
      expect(activeDon).toBe(3);
    });
  });

  describe('ST02-016 Repel', () => {
    it('gives +4000 power and restands 1 DON during counter', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);

      const repel = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST02-016',
          number: 'ST02-016',
          name: 'Repel',
          type: 'Event',
        }),
        'repel',
      );

      host.seedDonDeck('p1', 10);
      host.addDonToCost('p1', 3, true);

      engine.handleEvent({
        type: 'activateCounter',
        playerSessionId: 'p1',
        sourceInstanceId: repel.instanceId,
        sourceCardId: 'ST02-016',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');

      const leader = p1.zones.leader;
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [leader.instanceId],
      });

      expect(leader.power).toBe(9000);

      const activeDon = p1.zones.cost.filter((d) => !d.rested).length;
      expect(activeDon).toBe(3);
    });
  });

  describe('ST02-017 Straw Sword', () => {
    it('rests all opponent Characters on Main', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      const p2 = host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);

      const strawSword = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST02-017',
          number: 'ST02-017',
          name: 'Straw Sword',
          type: 'Event',
        }),
        'straw-sword',
      );

      const target = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'TARGET',
          number: 'TARGET',
          name: 'Target',
          type: 'Character',
        }),
        'target',
      );

      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: strawSword.instanceId,
        sourceCardId: 'ST02-017',
      });

      expect(target.rested).toBe(true);
    });
  });
});
