import { describe, expect, it } from 'vitest';
import {
  createDuelCard,
  type Card,
  type CardEffectDefinition,
} from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '@onepiecetcg/effect-engine';
import { EffectEngine } from '@onepiecetcg/effect-engine';
import { TestHost, makeCard, createRegistry } from '../test-utils.js';
import { op09EffectDefinitions } from './OP-09.effects';
import { specialHandlerDefinitions } from '../index.js';

describe('OP09 effect definitions', () => {
  it('exports the edition definitions', () => {
    expect(op09EffectDefinitions.editionId).toBe('OP-09');
  });

  it('has card entries for all OP09 cards', () => {
    const cardIds = op09EffectDefinitions.cards.map((c) => c.cardId);
    expect(cardIds.length).toBeGreaterThanOrEqual(108);
    const op09Prefix = cardIds.filter((id) => id.startsWith('OP09-'));
    expect(op09Prefix.length).toBe(cardIds.length);
  });

  it('each card has valid effect entries', () => {
    const validKinds = new Set([
      'standard',
      'continuous',
      'replacement',
      'special-ref',
    ]);

    for (const card of op09EffectDefinitions.cards) {
      expect(card.cardId).toBeTruthy();
      expect(card.effects).toBeDefined();

      for (const entry of card.effects ?? []) {
        expect(validKinds.has(entry.kind)).toBe(true);

        if (entry.kind === 'special-ref') {
          expect(entry.specialHandlerId).toBeTruthy();
        }

        if (entry.kind === 'standard' && entry.effect) {
          expect(entry.effect.id).toBeTruthy();
          expect(entry.effect.text).toBeTruthy();
          expect(entry.effect.trigger).toBeTruthy();
          expect(entry.effect.trigger.type).toBeTruthy();
          expect(Array.isArray(entry.effect.actions)).toBe(true);
        }

        if (entry.kind === 'continuous' && entry.effect) {
          expect(entry.effect.id).toBeTruthy();
          expect(entry.effect.text).toBeTruthy();
          expect(entry.effect.modifier).toBeTruthy();
          expect(entry.effect.modifier.selector).toBeTruthy();
        }

        if (entry.kind === 'replacement' && entry.effect) {
          expect(entry.effect.id).toBeTruthy();
          expect(entry.effect.text).toBeTruthy();
          expect(entry.effect.event).toBeTruthy();
          expect(Array.isArray(entry.effect.replacement)).toBe(true);
        }
      }
    }
  });

  it('all effect IDs are unique', () => {
    const ids = new Set<string>();
    const duplicates: string[] = [];

    for (const card of op09EffectDefinitions.cards) {
      for (const entry of card.effects ?? []) {
        if (entry.kind !== 'special-ref' && entry.effect) {
          if (ids.has(entry.effect.id)) {
            duplicates.push(entry.effect.id);
          }
          ids.add(entry.effect.id);
        }
      }
    }

    expect(duplicates).toEqual([]);
  });

  it('OP09-001 Shanks has an onAttacked effect', () => {
    const card = op09EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP09-001',
    );
    expect(card).toBeDefined();
    expect(card!.effects).toBeDefined();
    expect(card!.effects!.length).toBeGreaterThan(0);

    const entry = card!.effects![0];
    expect(entry.kind).toBe('standard');
    if (entry.kind === 'standard') {
      expect(entry.effect.trigger.type).toBe('onAttacked');
      expect(entry.effect.trigger.oncePerTurn).toBe(true);
    }
  });

  it('OP09-004 Shanks has continuous power reduction', () => {
    const card = op09EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP09-004',
    );
    expect(card).toBeDefined();
    const entry = card!.effects![0];
    expect(entry.kind).toBe('continuous');
    if (entry.kind === 'continuous') {
      expect(entry.effect.modifier.power).toBe(-1000);
    }
  });

  it('OP09-012 Monster has a replacement effect', () => {
    const card = op09EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP09-012',
    );
    expect(card).toBeDefined();
    const entry = card!.effects![0];
    expect(entry.kind).toBe('replacement');
    if (entry.kind === 'replacement') {
      expect(entry.effect.event).toBe('wouldKoCharacter');
      expect(entry.effect.optional).toBe(true);
    }
  });

  it('OP09-118 Gol.D.Roger uses a special handler', () => {
    const card = op09EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP09-118',
    );
    expect(card).toBeDefined();
    const entry = card!.effects![0];
    expect(entry.kind).toBe('special-ref');
    if (entry.kind === 'special-ref') {
      expect(entry.specialHandlerId).toBe('op09-118-special');
    }
  });

  it('OP09-014 Limejuice has cannotBlock keyword effect', () => {
    const card = op09EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP09-014',
    );
    expect(card).toBeDefined();
    const entry = card!.effects![0];
    expect(entry.kind).toBe('standard');
    if (entry.kind === 'standard') {
      const action = entry.effect.actions[0];
      expect(action.type).toBe('grantKeywords');
      if (action.type === 'grantKeywords') {
        expect(action.keywords).toContain('cannotBlock');
      }
    }
  });

  it('OP09-084 Catarina Devon has chooseActionBranch', () => {
    const card = op09EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP09-084',
    );
    expect(card).toBeDefined();
    const entry = card!.effects![0];
    expect(entry.kind).toBe('standard');
    if (entry.kind === 'standard') {
      const action = entry.effect.actions[0];
      expect(action.type).toBe('chooseActionBranch');
      if (action.type === 'chooseActionBranch') {
        expect(action.choices.length).toBe(3);
      }
    }
  });

  it('OP09-086 Jesus Burgess has powerPerCount modifier', () => {
    const card = op09EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP09-086',
    );
    expect(card).toBeDefined();
    const contEntry = card!.effects!.find((e) => e.kind === 'continuous');
    expect(contEntry).toBeDefined();
    if (contEntry?.kind === 'continuous') {
      expect(contEntry.effect.modifier.powerPerCount).toBeDefined();
      expect(contEntry.effect.modifier.powerPerCount!.divisor).toBe(4);
    }
  });
});

describe('OP09 behavioral tests (EffectEngine)', () => {
  const addDon = (host: TestHost, playerId: string, count: number) => {
    for (let i = 0; i < count; i++) {
      host.addCardToZone(
        playerId,
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
  };

  describe('Standard effects', () => {
    it('OP09-001 Shanks reduces opponent character power onAttacked (once per turn, opponent turn)', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 2;
      host.state.activePlayerSessionId = 'p2';
      const engine = new EffectEngine(
        createRegistry([op09EffectDefinitions]),
        host,
      );

      const shanks = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP09-001',
          number: 'OP09-001',
          name: 'Shanks',
          type: 'Character',
          power: 7000,
        }),
        'shanks',
      );
      const target = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'OP09-X',
          number: 'OP09-X',
          name: 'Target',
          type: 'Character',
          power: 5000,
        }),
        'target',
      );

      engine.handleEvent({
        type: 'onAttacked',
        playerSessionId: 'p1',
        sourceInstanceId: shanks.instanceId,
        sourceCardId: shanks.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).toBeTruthy();
      expect(decision!.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(target.power).toBe(4000);
    });

    it('OP09-009 Benn Beckman KOs an opponent character with 6000 or less power onPlay', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 2;
      const engine = new EffectEngine(
        createRegistry([op09EffectDefinitions]),
        host,
      );

      const beckman = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP09-009',
          number: 'OP09-009',
          name: 'Benn Beckman',
          type: 'Character',
          power: 6000,
        }),
        'beckman',
      );
      const target = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'OP09-Y',
          number: 'OP09-Y',
          name: 'Victim',
          type: 'Character',
          power: 5000,
          cost: 4,
        }),
        'victim',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: beckman.instanceId,
        sourceCardId: beckman.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).toBeTruthy();
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(host.getPlayer('p2')?.zones.characters).not.toContain(target);
      expect(host.getPlayer('p2')?.zones.trash).toContain(target);
    });

    it('OP09-014 Limejuice grants cannotBlock to an opponent character onPlay', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 2;
      const engine = new EffectEngine(
        createRegistry([op09EffectDefinitions]),
        host,
      );

      const limejuice = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP09-014',
          number: 'OP09-014',
          name: 'Limejuice',
          type: 'Character',
          power: 4000,
        }),
        'limejuice',
      );
      const target = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'OP09-Z',
          number: 'OP09-Z',
          name: 'Blocker',
          type: 'Character',
          power: 3000,
        }),
        'blocker',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: limejuice.instanceId,
        sourceCardId: limejuice.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).toBeTruthy();
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(host.getPlayer('p1')?.zones.hand).toHaveLength(0);
    });

    it('OP09-048 Dracule Mihawk draws 2 and trashes 1 from hand onPlay', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 2;
      const engine = new EffectEngine(
        createRegistry([op09EffectDefinitions]),
        host,
      );

      const mihawk = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP09-048',
          number: 'OP09-048',
          name: 'Dracule Mihawk',
          type: 'Character',
          power: 6000,
        }),
        'mihawk',
      );
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'DECK-1',
          number: 'DECK-1',
          name: 'Deck1',
          type: 'Event',
        }),
        'deck1',
      );
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'DECK-2',
          number: 'DECK-2',
          name: 'Deck2',
          type: 'Event',
        }),
        'deck2',
      );
      const handCard = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'HAND-1',
          number: 'HAND-1',
          name: 'HandCard',
          type: 'Event',
        }),
        'hand1',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: mihawk.instanceId,
        sourceCardId: mihawk.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).toBeTruthy();
      expect(decision!.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [handCard.instanceId],
      });

      expect(host.getPlayer('p1')?.zones.hand).toHaveLength(2);
      expect(host.getPlayer('p1')?.zones.trash).toContain(handCard);
    });

    it('OP09-119 Monkey.D.Luffy draws 1 and gains Rush onPlay with DON!! cost', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 2;
      addDon(host, 'p1', 10);
      host.addDonToCost('p1', 1, false);
      const engine = new EffectEngine(
        createRegistry([op09EffectDefinitions]),
        host,
      );

      const luffy = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP09-119',
          number: 'OP09-119',
          name: 'Monkey.D.Luffy',
          type: 'Character',
          power: 6000,
        }),
        'luffy119',
      );
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'DECK-3',
          number: 'DECK-3',
          name: 'DrawCard',
          type: 'Event',
        }),
        'deck3',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: luffy.instanceId,
        sourceCardId: luffy.cardId,
      });

      expect(host.getPlayer('p1')?.zones.hand).toHaveLength(1);
      expect(luffy.hasRush).toBe(true);
      expect(host.getPlayer('p1')?.zones.cost).toHaveLength(0);
    });

    it('OP09-065 Sanji gains Rush and rests opponent character onPlay with DON!! cost', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 2;
      addDon(host, 'p1', 10);
      host.addDonToCost('p1', 1, false);
      const engine = new EffectEngine(
        createRegistry([op09EffectDefinitions]),
        host,
      );

      const sanji = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP09-065',
          number: 'OP09-065',
          name: 'Sanji',
          type: 'Character',
          power: 5000,
        }),
        'sanji',
      );
      const opponentChar = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'OP09-OPP',
          number: 'OP09-OPP',
          name: 'Opponent Char',
          type: 'Character',
          cost: 5,
        }),
        'opp-char',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: sanji.instanceId,
        sourceCardId: sanji.cardId,
      });

      expect(sanji.hasRush).toBe(true);
      expect(opponentChar.rested).toBe(true);
    });

    it('OP09-027 Sabo draws 1 whenAttacking with 3+ rested characters (once per turn)', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 2;
      const engine = new EffectEngine(
        createRegistry([op09EffectDefinitions]),
        host,
      );

      const sabo = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP09-027',
          number: 'OP09-027',
          name: 'Sabo',
          type: 'Character',
          power: 5000,
        }),
        'sabo',
      );
      host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'REST-1',
          number: 'REST-1',
          name: 'Rest1',
          type: 'Character',
          power: 1000,
        }),
        'rest1',
      );
      host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'REST-2',
          number: 'REST-2',
          name: 'Rest2',
          type: 'Character',
          power: 1000,
        }),
        'rest2',
      );
      host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'REST-3',
          number: 'REST-3',
          name: 'Rest3',
          type: 'Character',
          power: 1000,
        }),
        'rest3',
      );
      for (const c of host.getPlayer('p1')!.zones.characters) {
        if (c.cardId !== 'OP09-027') c.rested = true;
      }
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'DRAW-1',
          number: 'DRAW-1',
          name: 'Drawn',
          type: 'Event',
        }),
        'drawn',
      );

      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: sabo.instanceId,
        sourceCardId: sabo.cardId,
      });

      expect(host.getPlayer('p1')?.zones.hand).toHaveLength(1);
    });
  });

  describe('Continuous effects', () => {
    it('OP09-004 Shanks gives -1000 power to all opponent characters continuously', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op09EffectDefinitions]),
        host,
      );

      const shanks = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP09-004',
          number: 'OP09-004',
          name: 'Shanks',
          type: 'Character',
          power: 7000,
        }),
        'shanks004',
      );
      const opponentChar = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'OP09-A',
          number: 'OP09-A',
          name: 'Opponent Char',
          type: 'Character',
          power: 6000,
        }),
        'opp-char',
      );

      engine.reapplyContinuousEffects();

      expect(opponentChar.power).toBe(5000);

      host.getPlayer('p1')!.zones.characters = host
        .getPlayer('p1')!
        .zones.characters.filter((c) => c.instanceId !== shanks.instanceId);
      host.getPlayer('p1')!.zones.trash.push(shanks);

      engine.reapplyContinuousEffects();

      expect(opponentChar.power).toBe(6000);
    });

    it('OP09-061 Monkey.D.Luffy gives +1 cost to own characters with DON!! x1', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op09EffectDefinitions]),
        host,
      );

      const luffy = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP09-061',
          number: 'OP09-061',
          name: 'Monkey.D.Luffy',
          type: 'Character',
          cost: 8,
          power: 7000,
        }),
        'luffy061',
      );
      addDon(host, 'p1', 10);
      host.addDonToCost('p1', 1, false);
      host.attachDon('p1', luffy.instanceId, 1);

      const ally = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP09-B',
          number: 'OP09-B',
          name: 'Ally',
          type: 'Character',
          cost: 4,
          power: 5000,
        }),
        'ally',
      );

      engine.reapplyContinuousEffects();

      expect(luffy.cost).toBe(9);
      expect(ally.cost).toBe(5);
    });
  });

  describe('Replacement effects', () => {
    it('OP09-012 Monster trashes itself to save Bonk Punch from effect KO', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op09EffectDefinitions]),
        host,
      );

      const monster = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP09-012',
          number: 'OP09-012',
          name: 'Monster',
          type: 'Character',
          power: 3000,
        }),
        'monster',
      );
      const bonkPunch = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP09-010',
          number: 'OP09-010',
          name: 'Bonk Punch',
          type: 'Character',
          power: 4000,
        }),
        'bonk-punch',
      );

      const replaced = engine.applyReplacement({
        type: 'wouldKoCharacter',
        playerSessionId: 'p1',
        sourceInstanceId: monster.instanceId,
        reason: 'effect',
      });

      expect(replaced).toBe(true);
      expect(host.getPlayer('p1')?.zones.characters).not.toContain(monster);
      expect(host.getPlayer('p1')?.zones.trash).toContain(monster);
      expect(host.getPlayer('p1')?.zones.characters).toContain(bonkPunch);
    });
  });

  describe('Special handler effects', () => {
    it('OP09-018 Get Out of Here! KOs up to 2 opponent characters with total power <= 4000', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 2;
      const engine = new EffectEngine(
        createRegistry([op09EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      const source = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'OP09-018',
          number: 'OP09-018',
          name: 'Get Out of Here!',
          type: 'Event',
          cost: 1,
        }),
        'op09-018',
      );
      const weak1 = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'WEAK-1',
          number: 'WEAK-1',
          name: 'Weak1',
          type: 'Character',
          power: 2000,
          cost: 2,
        }),
        'weak1',
      );
      const weak2 = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'WEAK-2',
          number: 'WEAK-2',
          name: 'Weak2',
          type: 'Character',
          power: 2000,
          cost: 2,
        }),
        'weak2',
      );

      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: source.instanceId,
        sourceCardId: source.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).toBeTruthy();
      expect(decision!.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [weak1.instanceId, weak2.instanceId],
      });

      expect(host.getPlayer('p2')?.zones.characters).not.toContain(weak1);
      expect(host.getPlayer('p2')?.zones.characters).not.toContain(weak2);
      expect(host.getPlayer('p2')?.zones.trash).toContain(weak1);
      expect(host.getPlayer('p2')?.zones.trash).toContain(weak2);
    });

    it("OP09-052 Marco revives from trash on opponent turn when KO'd by effect", () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 2;
      host.state.activePlayerSessionId = 'p2';
      addDon(host, 'p1', 10);
      host.addDonToCost('p1', 3, false);
      const engine = new EffectEngine(
        createRegistry([op09EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      const marco = host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'OP09-052',
          number: 'OP09-052',
          name: 'Marco',
          type: 'Character',
          cost: 5,
          power: 6000,
        }),
        'marco',
      );
      const handCard = host.addCardToZone(
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
        type: 'onKo',
        playerSessionId: 'p1',
        sourceInstanceId: marco.instanceId,
        sourceCardId: marco.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).toBeTruthy();
      expect(decision!.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [handCard.instanceId],
      });

      expect(host.getPlayer('p1')?.zones.characters).toContain(marco);
      expect(host.getPlayer('p1')?.zones.hand).not.toContain(handCard);
      expect(host.getPlayer('p1')?.zones.trash).toContain(handCard);
      expect(marco.rested).toBe(true);
    });

    it('OP09-058 Special Muggy Ball trigger returns an opponent character (cost <= 3) to hand', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 2;
      const engine = new EffectEngine(
        createRegistry([op09EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      const muggy = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'OP09-058',
          number: 'OP09-058',
          name: 'Special Muggy Ball',
          type: 'Event',
          cost: 1,
        }),
        'muggy',
      );
      const target = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'BOUNCE',
          number: 'BOUNCE',
          name: 'Bounce Target',
          type: 'Character',
          cost: 3,
          power: 4000,
        }),
        'bounce-target',
      );

      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: muggy.instanceId,
        sourceCardId: muggy.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).toBeTruthy();
      expect(decision!.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(host.getPlayer('p2')?.zones.characters).not.toContain(target);
      expect(host.getPlayer('p2')?.zones.hand).toContain(target);
    });

    it('OP09-080 Thousand Sunny adds 1 DON!! rested on opponent turn by resting itself', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 2;
      host.state.activePlayerSessionId = 'p2';
      addDon(host, 'p1', 10);
      const engine = new EffectEngine(
        createRegistry([op09EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      const sunnyCard = makeCard({
        id: 'OP09-080',
        number: 'OP09-080',
        name: 'Thousand Sunny',
        type: 'Stage',
        cost: 2,
      });
      const sunny = createDuelCard(sunnyCard, 'p1:sunny-stage', 'p1');
      host.getPlayer('p1')!.zones.stage = sunny;
      const eventCard = host.addCardToZone(
        'p1',
        'hand',
        sunnyCard,
        'sunny-event',
      );

      engine.handleEvent({
        type: 'onKo',
        playerSessionId: 'p1',
        sourceInstanceId: eventCard.instanceId,
        sourceCardId: eventCard.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).toBeTruthy();
      expect(decision!.prompt.type).toBe('confirm');
      engine.answerDecision({ decisionId: decision!.id, confirmed: true });

      expect(sunny.rested).toBe(true);
      expect(host.getPlayer('p1')?.zones.cost).toHaveLength(1);
    });

    it('OP09-081 Marshall.D.Teach negates opponent on-play effects by trashing a card from hand', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 2;
      const engine = new EffectEngine(
        createRegistry([op09EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      const teach = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP09-081',
          number: 'OP09-081',
          name: 'Marshall.D.Teach',
          type: 'Character',
          cost: 7,
          power: 7000,
        }),
        'teach',
      );
      const handCard = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'DISCARD',
          number: 'DISCARD',
          name: 'Discard',
          type: 'Event',
        }),
        'discard',
      );

      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: teach.instanceId,
        sourceCardId: teach.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).toBeTruthy();
      expect(decision!.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [handCard.instanceId],
      });

      expect(host.getPlayer('p1')?.zones.hand).not.toContain(handCard);
      expect(host.getPlayer('p1')?.zones.trash).toContain(handCard);
      expect(host.getPlayer('p2')?.zones.leader.effectNegated).toBe(true);
    });

    it('OP09-093 Marshall.D.Teach (Blocker) negates opponent leader and character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 2;
      const engine = new EffectEngine(
        createRegistry([op09EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      host.getPlayer('p1')!.zones.leader.families = ['Blackbeard Pirates'];
      const teach = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP09-093',
          number: 'OP09-093',
          name: 'Marshall.D.Teach',
          type: 'Character',
          cost: 5,
          power: 6000,
        }),
        'teach093',
      );
      teach.playedThisTurn = true;

      const oppChar = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'OP09-OPP2',
          number: 'OP09-OPP2',
          name: 'Opponent Char',
          type: 'Character',
          cost: 4,
          power: 5000,
        }),
        'opp-char2',
      );

      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: teach.instanceId,
        sourceCardId: teach.cardId,
      });

      let decision = engine.getPendingDecision();
      expect(decision).toBeTruthy();
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [
          host.getPlayer('p2')!.zones.leader.instanceId,
        ],
      });

      decision = engine.getPendingDecision();
      expect(decision).toBeTruthy();
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [oppChar.instanceId],
      });

      expect(host.getPlayer('p2')?.zones.leader.effectNegated).toBe(true);
      expect(oppChar.effectNegated).toBe(true);
    });

    it('OP09-098 Black Hole negates and KOs opponent character with cost <= 4', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 2;
      const engine = new EffectEngine(
        createRegistry([op09EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      host.getPlayer('p1')!.zones.leader.families = ['Blackbeard Pirates'];
      const blackHole = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'OP09-098',
          number: 'OP09-098',
          name: 'Black Hole',
          type: 'Event',
          cost: 2,
        }),
        'black-hole',
      );
      const target = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'OP09-KO',
          number: 'OP09-KO',
          name: 'K.O. Target',
          type: 'Character',
          cost: 3,
          power: 4000,
        }),
        'ko-target',
      );

      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: blackHole.instanceId,
        sourceCardId: blackHole.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).toBeTruthy();
      expect(decision!.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(target.effectNegated).toBe(true);
      expect(host.getPlayer('p2')?.zones.characters).not.toContain(target);
      expect(host.getPlayer('p2')?.zones.trash).toContain(target);
    });

    it('OP09-101 Kuzan places opponent character in life and trashes from hand', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 2;
      const engine = new EffectEngine(
        createRegistry([op09EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      const kuzan = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP09-101',
          number: 'OP09-101',
          name: 'Kuzan',
          type: 'Character',
          cost: 7,
          power: 7000,
        }),
        'kuzan',
      );
      const target = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'OP09-LIFE',
          number: 'OP09-LIFE',
          name: 'Life Target',
          type: 'Character',
          cost: 2,
          power: 3000,
        }),
        'life-target',
      );
      const trashCard = host.addCardToZone(
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
        sourceInstanceId: kuzan.instanceId,
        sourceCardId: kuzan.cardId,
      });

      let decision = engine.getPendingDecision();
      expect(decision).toBeTruthy();
      expect(decision!.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      decision = engine.getPendingDecision();
      expect(decision).toBeTruthy();
      expect(decision!.prompt.type).toBe('selectChoice');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedChoiceIds: ['top'],
      });

      decision = engine.getPendingDecision();
      expect(decision).toBeTruthy();
      expect(decision!.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [trashCard.instanceId],
      });

      expect(host.getPlayer('p2')?.zones.characters).not.toContain(target);
      expect(host.getPlayer('p2')?.zones.life).toContain(target);
      expect(target.faceDown).toBe(false);
      expect(host.getPlayer('p1')?.zones.hand).not.toContain(trashCard);
      expect(host.getPlayer('p2')?.zones.trash).toContain(trashCard);
      expect(host.getPlayer('p2')?.zones.hand).toHaveLength(0);
    });

    it('OP09-118 Gol.D.Roger wins the game when a player has 0 life on block', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 2;
      const engine = new EffectEngine(
        createRegistry([op09EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      const roger = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP09-118',
          number: 'OP09-118',
          name: 'Gol.D.Roger',
          type: 'Character',
          cost: 10,
          power: 12000,
        }),
        'roger',
      );
      host.getPlayer('p2')!.zones.life = [];

      engine.handleEvent({
        type: 'onBlock',
        playerSessionId: 'p1',
        sourceInstanceId: roger.instanceId,
        sourceCardId: roger.cardId,
      });

      expect(host.state.winnerSessionId).toBe('p1');
      expect(host.state.endReason).toBe('effect');
      expect(host.state.phase).toBe('finished');
    });
  });
});
