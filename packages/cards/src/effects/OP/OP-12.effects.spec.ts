import { describe, expect, it } from 'vitest';
import {
  type Card,
  type CardEffectDefinition,
  createDuelCard,
} from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '@onepiecetcg/effect-engine';
import { op12EffectDefinitions } from './OP-12.effects';
import { EffectEngine } from '@onepiecetcg/effect-engine';
import { makeCard, createRegistry, TestHost } from '../test-utils.js';

describe('OP12 effect definitions', () => {
  it('exports the edition definitions', () => {
    expect(op12EffectDefinitions.editionId).toBe('OP-12');
  });

  it('has card entries for all OP12 cards', () => {
    const cardIds = op12EffectDefinitions.cards.map((c) => c.cardId);
    expect(cardIds.length).toBeGreaterThanOrEqual(95);
    const op12Prefix = cardIds.filter((id) => id.startsWith('OP12-'));
    expect(op12Prefix.length).toBe(cardIds.length);
  });

  it('each card has valid effect entries', () => {
    const validKinds = new Set([
      'standard',
      'continuous',
      'replacement',
      'special-ref',
    ]);

    for (const card of op12EffectDefinitions.cards) {
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

    for (const card of op12EffectDefinitions.cards) {
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

  it('OP12-060 Boeuf Burst has chooseActionBranch', () => {
    const card = op12EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP12-060',
    );
    expect(card).toBeDefined();
    const entry = card!.effects![0];
    expect(entry.kind).toBe('standard');
    if (entry.kind === 'standard') {
      const action = entry.effect.actions[0];
      expect(action.type).toBe('chooseActionBranch');
      if (action.type === 'chooseActionBranch') {
        expect(action.choices.length).toBe(2);
      }
    }
  });

  it('OP12-015 Monkey.D.Luffy has continuous power with DON!! x2', () => {
    const card = op12EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP12-015',
    );
    expect(card).toBeDefined();
    const contEntry = card!.effects!.find((e) => e.kind === 'continuous');
    expect(contEntry).toBeDefined();
    if (contEntry?.kind === 'continuous') {
      expect(contEntry.effect.conditions).toBeDefined();
      expect(contEntry.effect.conditions!.length).toBeGreaterThan(0);
      expect(contEntry.effect.conditions![0]).toMatchObject({
        type: 'sourceHasAttachedDonAtLeast',
        value: 2,
      });
      expect(contEntry.effect.modifier.power).toBe(2000);
    }
  });

  it('OP12-070 Sanji has powerPerCount modifier', () => {
    const card = op12EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP12-070',
    );
    expect(card).toBeDefined();
    const contEntry = card!.effects!.find((e) => e.kind === 'continuous');
    expect(contEntry).toBeDefined();
    if (contEntry?.kind === 'continuous') {
      expect(contEntry.effect.modifier.powerPerCount).toBeDefined();
      expect(contEntry.effect.modifier.powerPerCount!.divisor).toBe(5);
      expect(contEntry.effect.modifier.powerPerCount!.amount).toBe(1000);
    }
  });

  it('OP12-027 Koushirou has a replacement effect', () => {
    const card = op12EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP12-027',
    );
    expect(card).toBeDefined();
    const entry = card!.effects![0];
    expect(entry.kind).toBe('replacement');
    if (entry.kind === 'replacement') {
      expect(entry.effect.event).toBe('wouldKoCharacter');
      expect(entry.effect.optional).toBe(true);
    }
  });

  it('OP12-061 Donquixote Rosinante has replacement for Law + cost reduction', () => {
    const card = op12EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP12-061',
    );
    expect(card).toBeDefined();
    const replEntry = card!.effects!.find((e) => e.kind === 'replacement');
    expect(replEntry).toBeDefined();
    if (replEntry?.kind === 'replacement') {
      expect(replEntry.effect.event).toBe('wouldKoCharacter');
      expect(replEntry.effect.oncePerTurn).toBe(true);
    }
    const stdEntry = card!.effects!.find((e) => e.kind === 'standard');
    expect(stdEntry).toBeDefined();
    if (stdEntry?.kind === 'standard') {
      const action = stdEntry.effect.actions[0];
      expect(action.type).toBe('registerNextPlayCostModifier');
    }
  });

  it('OP12-098 Hair Removal Fist has additional conditional power', () => {
    const card = op12EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP12-098',
    );
    expect(card).toBeDefined();
    const entries = card!.effects!.filter((e) => e.kind === 'standard');
    expect(entries.length).toBeGreaterThanOrEqual(2);
    const additionalBoost = entries.find(
      (e) =>
        e.kind === 'standard' &&
        e.effect.id === 'hair-removal-fist-counter-additional-plus-2000',
    );
    expect(additionalBoost).toBeDefined();
  });

  it('OP12-107 Donquixote Doflamingo has rush continuous and on-ko deck-to-life', () => {
    const card = op12EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP12-107',
    );
    expect(card).toBeDefined();
    const contEntry = card!.effects!.find((e) => e.kind === 'continuous');
    expect(contEntry).toBeDefined();
    if (contEntry?.kind === 'continuous') {
      expect(contEntry.effect.conditions).toBeDefined();
      expect(contEntry.effect.modifier.keywords).toContain('rush');
    }
    const koEntry = card!.effects!.find(
      (e) => e.kind === 'standard' && e.effect?.trigger?.type === 'onKo',
    );
    expect(koEntry).toBeDefined();
  });

  it('OP12-058 uses revealTopAndPlayIfMatches', () => {
    const card = op12EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP12-058',
    );
    expect(card).toBeDefined();
    const entry = card!.effects![0];
    expect(entry.kind).toBe('standard');
    if (entry.kind === 'standard') {
      const action = entry.effect.actions[0];
      expect(action.type).toBe('revealTopAndPlayIfMatches');
    }
  });

  it('OP12-118 Jewelry Bonney checks for 8 or more rested cards', () => {
    const card = op12EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP12-118',
    );
    expect(card).toBeDefined();
    const entry = card!.effects![0];
    expect(entry.kind).toBe('standard');
    if (entry.kind === 'standard') {
      expect(entry.effect.conditions).toBeDefined();
      const restCondition = entry.effect.conditions!.find(
        (c: any) => c.type === 'targetCountAtLeast',
      );
      expect(restCondition).toBeDefined();
      expect((restCondition as any).value).toBe(8);
    }
  });

  it('OP12-061 has special-ref cards that reference valid handler IDs', () => {
    const specialRefCards = op12EffectDefinitions.cards.filter((c) =>
      c.effects?.some((e) => e.kind === 'special-ref'),
    );
    const handlerIds = specialRefCards.map(
      (c) => c.effects!.find((e) => e.kind === 'special-ref')?.specialHandlerId,
    );
    expect(handlerIds.filter(Boolean).length).toBeGreaterThanOrEqual(1);
    for (const id of handlerIds) {
      expect(id).toMatch(/^op12-\d{3}-special$/);
    }
  });

  it('OP12-022 Inuarashi uses skipNextRefreshPhases', () => {
    const card = op12EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP12-022',
    );
    expect(card).toBeDefined();
    const entry = card!.effects![0];
    expect(entry.kind).toBe('standard');
    if (entry.kind === 'standard') {
      const action = entry.effect.actions[0];
      expect(action.type).toBe('skipNextRefreshPhases');
    }
  });

  it('OP12-021 Ipponmatsu has cannotBeRemovedByOpponentEffects keyword', () => {
    const card = op12EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP12-021',
    );
    expect(card).toBeDefined();
    const entry = card!.effects![0];
    expect(entry.kind).toBe('continuous');
    if (entry.kind === 'continuous') {
      expect(entry.effect.modifier.keywords).toContain(
        'cannotBeRemovedByOpponentEffects',
      );
    }
  });

  describe('behavioral tests', () => {
    it('OP12-003 Crocus [On K.O.] queues optional confirm decision', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op12EffectDefinitions]),
        host,
      );

      const crocus = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP12-003',
          number: 'OP12-003',
          name: 'Crocus',
          type: 'Character',
          power: 3000,
        }),
        'crocus',
      );

      expect(engine.getPendingDecision()).toBeNull();

      engine.handleEvent({
        type: 'onKo',
        playerSessionId: 'p1',
        sourceInstanceId: crocus.instanceId,
        sourceCardId: crocus.cardId,
      });

      const pending = engine.getPendingDecision();
      expect(pending).not.toBeNull();
      expect(pending!.prompt.type).toBe('confirm');
      expect(pending!.effectId).toBe('crocus-on-ko-play-red-3000-or-less');
    });

    it('OP12-006 Shakuyaku [On Play] searches deck and prompts card selection', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op12EffectDefinitions]),
        host,
      );

      const shakuyaku = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP12-006',
          number: 'OP12-006',
          name: 'Shakuyaku',
          type: 'Character',
        }),
        'shakuyaku',
      );
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'LUFFY',
          number: 'LUFFY',
          name: 'Monkey.D.Luffy',
          type: 'Character',
        }),
        'luffy',
      );
      for (let i = 0; i < 4; i++) {
        host.addCardToZone(
          'p1',
          'deck',
          makeCard({
            id: `FILLER-${i}`,
            number: `FILLER-${i}`,
            name: `Filler ${i}`,
            type: 'Character',
          }),
          `filler-${i}`,
        );
      }

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: shakuyaku.instanceId,
        sourceCardId: shakuyaku.cardId,
      });

      const pending = engine.getPendingDecision();
      expect(pending).not.toBeNull();
      expect(pending!.prompt.type).toBe('selectCards');
      expect(pending!.prompt.max).toBe(1);
    });

    it('OP12-015 Luffy gains +2000 power when 2+ DON!! are attached', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op12EffectDefinitions]),
        host,
      );

      const luffy = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP12-015',
          number: 'OP12-015',
          name: 'Monkey.D.Luffy',
          type: 'Character',
          power: 5000,
        }),
        'luffy',
      );

      engine.reapplyContinuousEffects();
      expect(luffy.power).toBe(5000);

      luffy.attachedDon = 2;
      engine.reapplyContinuousEffects();
      expect(luffy.power).toBe(7000);

      luffy.attachedDon = 0;
      engine.reapplyContinuousEffects();
      expect(luffy.power).toBe(5000);
    });

    it('OP12-016 To Never Doubt has activate-main and counter effects', () => {
      const card = op12EffectDefinitions.cards.find(
        (c) => c.cardId === 'OP12-016',
      );
      expect(card).toBeDefined();
      const activateMainEntry = card!.effects!.find(
        (e) =>
          e.kind === 'standard' &&
          e.effect.id === 'to-never-doubt-activate-main-ko-cost-4-or-less',
      );
      expect(activateMainEntry).toBeDefined();
      if (activateMainEntry?.kind === 'standard') {
        expect(activateMainEntry.effect.trigger.type).toBe('activateMain');
      }
      const counterEntry = card!.effects!.find(
        (e) =>
          e.kind === 'standard' &&
          e.effect.id === 'to-never-doubt-counter-plus-2000',
      );
      expect(counterEntry).toBeDefined();
      if (counterEntry?.kind === 'standard') {
        expect(counterEntry.effect.actions[0].type).toBe('modifyPower');
        expect(counterEntry.effect.actions[0].amount).toBe(2000);
      }
    });

    it('OP12-017 Color of Observation Haki has main and trigger effects', () => {
      const card = op12EffectDefinitions.cards.find(
        (c) => c.cardId === 'OP12-017',
      );
      expect(card).toBeDefined();
      expect(card!.effects).toHaveLength(2);
      const triggerTypes = card!.effects
        ?.filter((entry) => entry.kind === 'standard')
        .map((entry) =>
          entry.kind === 'standard' ? entry.effect.trigger.type : null,
        );
      expect(triggerTypes).toEqual(
        expect.arrayContaining(['activateMain', 'trigger']),
      );
    });

    it('OP12-020 Roronoa Zoro Leader is special-ref', () => {
      const card = op12EffectDefinitions.cards.find(
        (c) => c.cardId === 'OP12-020',
      );
      expect(card).toBeDefined();
      const entry = card!.effects![0];
      expect(entry.kind).toBe('special-ref');
      if (entry.kind === 'special-ref') {
        expect(entry.specialHandlerId).toBe('op12-020-special');
      }
    });

    it('OP12-024 Gyukimaru [When Attacking] with 3+ DON!! rests an opponent Character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op12EffectDefinitions]),
        host,
      );

      const gyukimaru = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP12-024',
          number: 'OP12-024',
          name: 'Gyukimaru',
          type: 'Character',
          power: 5000,
        }),
        'gyukimaru',
      );
      const opponentChar = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'OPP',
          number: 'OPP',
          name: 'Opponent',
          type: 'Character',
          cost: 5,
          power: 4000,
        }),
        'opp',
      );

      gyukimaru.attachedDon = 3;

      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: gyukimaru.instanceId,
        sourceCardId: gyukimaru.cardId,
      });

      const pending = engine.getPendingDecision();
      if (pending) {
        engine.answerDecision({
          id: pending.id,
          confirmed: true,
          selections: [opponentChar.instanceId],
        });
      }

      expect(opponentChar.rested).toBe(true);
    });

    it('OP12-029 Shimotsuki Kouzaburou [On Play] queues a selection decision', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op12EffectDefinitions]),
        host,
      );

      host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP12-029',
          number: 'OP12-029',
          name: 'Shimotsuki Kouzaburou',
          type: 'Character',
          power: 3000,
        }),
        'kouzaburou',
      );
      host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'RESTABLE',
          number: 'RESTABLE',
          name: 'Restable',
          type: 'Character',
          cost: 2,
          power: 2000,
        }),
        'restable',
      );
      const koable = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'KOABLE',
          number: 'KOABLE',
          name: 'Koable',
          type: 'Character',
          cost: 1,
          power: 1000,
        }),
        'koable',
      );
      koable.rested = true;

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: 'p1:kouzaburou',
        sourceCardId: 'OP12-029',
      });

      const pending = engine.getPendingDecision();
      expect(pending).not.toBeNull();
    });

    it('OP12-008 Shanks [On Opponent Attack] with costs queues confirm and selection', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op12EffectDefinitions]),
        host,
      );

      host.state.activePlayerSessionId = 'p2';
      const shanks = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP12-008',
          number: 'OP12-008',
          name: 'Shanks',
          type: 'Character',
          power: 6000,
        }),
        'shanks',
      );
      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'COST',
          number: 'COST',
          name: 'Cost Card',
          type: 'Event',
        }),
        'cost-card',
      );
      const oppLeader = host.getPlayer('p2')!.zones.leader;

      engine.handleEvent({
        type: 'onAttacked',
        playerSessionId: 'p1',
        sourceInstanceId: shanks.instanceId,
        sourceCardId: shanks.cardId,
      });

      const pending = engine.getPendingDecision();
      expect(pending).not.toBeNull();
      expect(['confirm', 'selectCards']).toContain(pending!.prompt.type);

      if (pending!.prompt.type === 'confirm') {
        engine.answerDecision({ id: pending!.id, confirmed: true });
        const second = engine.getPendingDecision();
        if (second) {
          engine.answerDecision({
            id: second.id,
            confirmed: true,
            selections: [oppLeader.instanceId],
          });
        }
      }
    });

    it('OP12-060 Boeuf Burst [Main] with multicolored leader offers branch choice', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op12EffectDefinitions]),
        host,
      );

      host.getPlayer('p1')!.zones.leader.colors = ['Red', 'Blue'];

      const boeuf = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'OP12-060',
          number: 'OP12-060',
          name: 'Boeuf Burst',
          type: 'Event',
        }),
        'boeuf',
      );

      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: boeuf.instanceId,
        sourceCardId: boeuf.cardId,
      });

      const pending = engine.getPendingDecision();
      expect(pending).not.toBeNull();
      expect(pending!.prompt.type).toBe('selectChoice');
      expect(pending!.prompt.choices).toHaveLength(2);
    });

    it('OP12-040 Kuzan (040) and OP12-041 Sanji (041) use standard effects', () => {
      for (const cardId of ['OP12-040', 'OP12-041']) {
        const card = op12EffectDefinitions.cards.find(
          (c) => c.cardId === cardId,
        );
        expect(card).toBeDefined();
        expect(card!.effects?.some((entry) => entry.kind === 'standard')).toBe(
          true,
        );
        expect(
          card!.effects?.some((entry) => entry.kind === 'special-ref'),
        ).toBe(false);
      }
    });

    it('OP12-053 Borsalino gains +1000 power on opponent turn with Navy Leader', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op12EffectDefinitions]),
        host,
      );

      host.getPlayer('p1')!.zones.leader.families = ['Navy'];
      const borsalino = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP12-053',
          number: 'OP12-053',
          name: 'Borsalino',
          type: 'Character',
          power: 5000,
        }),
        'borsalino',
      );

      host.state.activePlayerSessionId = 'p2';
      engine.reapplyContinuousEffects();

      expect(borsalino.power).toBe(6000);
      expect(borsalino.mustBeAttackTarget).toBe(true);
    });

    it('OP12-075 Ms. All Sunday [On Play] queues KO selection then opponent DON!! add', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op12EffectDefinitions]),
        host,
      );

      const msAllSunday = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP12-075',
          number: 'OP12-075',
          name: 'Ms. All Sunday',
          type: 'Character',
          power: 5000,
        }),
        'ms',
      );
      host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'TARGET',
          number: 'TARGET',
          name: 'Target',
          type: 'Character',
          cost: 3,
          power: 3000,
        }),
        'target',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: msAllSunday.instanceId,
        sourceCardId: msAllSunday.cardId,
      });

      const pending = engine.getPendingDecision();
      expect(pending).not.toBeNull();
      expect(['selectCards', 'confirm']).toContain(pending!.prompt.type);
    });

    it('OP12-081 Koala Leader uses standard attack and observer effects', () => {
      const card = op12EffectDefinitions.cards.find(
        (c) => c.cardId === 'OP12-081',
      );
      expect(card).toBeDefined();
      expect(card!.effects).toHaveLength(2);
      expect(card!.effects!.every((entry) => entry.kind === 'standard')).toBe(
        true,
      );
    });

    it("OP12-081 draws 1 when attacking the opponent's Leader with 2 cost-8+ Characters", () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op12EffectDefinitions]),
        host,
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

      host.getPlayer('p1')!.zones.leader.cardId = 'OP12-081';
      host.getPlayer('p2')!.zones.leader.cardId = 'OPP-LEADER';

      const firstBigCharacter = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'BIG-1',
          number: 'BIG-1',
          name: 'Big 1',
          type: 'Character',
          cost: 8,
          power: 8000,
        }),
        'big-1',
      );
      host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'BIG-2',
          number: 'BIG-2',
          name: 'Big 2',
          type: 'Character',
          cost: 9,
          power: 9000,
        }),
        'big-2',
      );

      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: host.getPlayer('p1')!.zones.leader.instanceId,
        sourceCardId: 'OP12-081',
        targetInstanceId: host.getPlayer('p2')!.zones.leader.instanceId,
        targetCardId: host.getPlayer('p2')!.zones.leader.cardId,
      });

      expect(firstBigCharacter.ownerSessionId).toBe('p1');
      expect(host.getPlayer('p1')?.zones.hand).toHaveLength(1);
    });

    it('OP12-081 makes the opponent add the top Life card to hand when they play an 8+ base cost Character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op12EffectDefinitions]),
        host,
      );

      host.getPlayer('p1')!.zones.leader.cardId = 'OP12-081';
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
      const expensiveCharacter = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'EXPENSIVE-1',
          number: 'EXPENSIVE-1',
          name: 'Expensive 1',
          type: 'Character',
          cost: 8,
          power: 8000,
        }),
        'expensive-1',
      );

      engine.handleEvent({
        type: 'onCharacterPlayed',
        playerSessionId: 'p2',
        sourceInstanceId: expensiveCharacter.instanceId,
        sourceCardId: expensiveCharacter.cardId,
        targetInstanceId: expensiveCharacter.instanceId,
        targetCardId: expensiveCharacter.cardId,
        sourceZone: 'hand',
        playedByEffect: false,
      });

      expect(host.getPlayer('p2')?.zones.life).toHaveLength(0);
      expect(host.getPlayer('p2')?.zones.hand).toHaveLength(1);
    });

    it("OP12-081 also triggers when the opponent plays a Character using another Character's effect", () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op12EffectDefinitions]),
        host,
      );

      host.getPlayer('p1')!.zones.leader.cardId = 'OP12-081';
      host.addCardToZone(
        'p2',
        'life',
        makeCard({
          id: 'LIFE-2',
          number: 'LIFE-2',
          name: 'Life 2',
          type: 'Event',
        }),
        'life-2',
      );
      const sourceCharacter = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'SOURCE-CHAR',
          number: 'SOURCE-CHAR',
          name: 'Source Character',
          type: 'Character',
          cost: 4,
          power: 4000,
        }),
        'source-char',
      );
      const playedByEffectCharacter = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'PLAYED-BY-EFFECT',
          number: 'PLAYED-BY-EFFECT',
          name: 'Played By Effect',
          type: 'Character',
          cost: 3,
          power: 3000,
        }),
        'played-by-effect',
      );

      engine.handleEvent({
        type: 'onCharacterPlayed',
        playerSessionId: 'p2',
        sourceInstanceId: sourceCharacter.instanceId,
        sourceCardId: sourceCharacter.cardId,
        targetInstanceId: playedByEffectCharacter.instanceId,
        targetCardId: playedByEffectCharacter.cardId,
        sourceZone: 'characters',
        playedByEffect: true,
      });

      expect(host.getPlayer('p2')?.zones.life).toHaveLength(0);
      expect(host.getPlayer('p2')?.zones.hand).toHaveLength(1);
    });

    it('OP12-085 Karasu [When Attacking] with Rev Army Leader and 5+ opponent hand cards queues trash decision', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op12EffectDefinitions]),
        host,
      );

      host.getPlayer('p1')!.zones.leader.families = ['Revolutionary Army'];
      host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP12-085',
          number: 'OP12-085',
          name: 'Karasu',
          type: 'Character',
          power: 5000,
        }),
        'karasu',
      );
      for (let i = 0; i < 5; i++) {
        host.addCardToZone(
          'p2',
          'hand',
          makeCard({
            id: `OPP-HAND-${i}`,
            number: `OPP-HAND-${i}`,
            name: `Hand ${i}`,
            type: 'Event',
          }),
          `opp-hand-${i}`,
        );
      }

      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: 'p1:karasu',
        sourceCardId: 'OP12-085',
      });

      const pending = engine.getPendingDecision();
      expect(pending).not.toBeNull();
    });

    it('OP12-096 Ursa Shock has activate-main and trigger effects', () => {
      const card = op12EffectDefinitions.cards.find(
        (c) => c.cardId === 'OP12-096',
      );
      expect(card).toBeDefined();
      const activateMainEntry = card!.effects!.find(
        (e) =>
          e.kind === 'standard' &&
          e.effect.id === 'ursa-shock-activate-main-set-up-to-2-don-active',
      );
      expect(activateMainEntry).toBeDefined();
      if (activateMainEntry?.kind === 'standard') {
        expect(activateMainEntry.effect.trigger.type).toBe('activateMain');
      }

      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op12EffectDefinitions]),
        host,
      );

      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'OP12-096',
          number: 'OP12-096',
          name: 'Ursa Shock',
          type: 'Event',
        }),
        'ursa',
      );
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'DRAW',
          number: 'DRAW',
          name: 'Drawn',
          type: 'Character',
        }),
        'draw-me',
      );
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'MILL',
          number: 'MILL',
          name: 'Milled',
          type: 'Character',
        }),
        'mill-me',
      );

      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: 'p1:ursa',
        sourceCardId: 'OP12-096',
      });

      expect(host.getPlayer('p1')?.zones.hand).toHaveLength(2);
      expect(host.getPlayer('p1')?.zones.trash).toHaveLength(1);
    });

    it('OP12-102 Shirahoshi has on-play search and continuous Neptunian +2000 power on opponent turn', () => {
      const card = op12EffectDefinitions.cards.find(
        (c) => c.cardId === 'OP12-102',
      );
      expect(card).toBeDefined();
      const onPlayEntry = card!.effects!.find((e) => e.kind === 'standard');
      expect(onPlayEntry).toBeDefined();
      if (onPlayEntry?.kind === 'standard') {
        expect(onPlayEntry.effect.id).toBe(
          'shirahoshi-on-play-search-cost-6-or-more',
        );
      }

      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op12EffectDefinitions]),
        host,
      );

      host.state.activePlayerSessionId = 'p2';
      host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP12-102',
          number: 'OP12-102',
          name: 'Shirahoshi',
          type: 'Character',
          cost: 2,
          power: 1000,
          families: ['Neptunian'],
        }),
        'shirahoshi',
      );
      const neptunian = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'NEPT',
          number: 'NEPT',
          name: 'Neptunian Warrior',
          type: 'Character',
          power: 3000,
          families: ['Neptunian'],
        }),
        'nept',
      );

      engine.reapplyContinuousEffects();
      expect(neptunian.power).toBe(5000);
    });

    it('OP12-118 Jewelry Bonney [On Play] condition requires 8+ rested cards; does not trigger with 6', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op12EffectDefinitions]),
        host,
      );

      host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP12-118',
          number: 'OP12-118',
          name: 'Jewelry Bonney',
          type: 'Character',
          power: 4000,
        }),
        'bonney',
      );

      for (let i = 0; i < 3; i++) {
        host.addCardToZone(
          'p1',
          'hand',
          makeCard({
            id: `HAND-${i}`,
            number: `HAND-${i}`,
            name: `Hand ${i}`,
            type: 'Event',
          }),
          `hand-${i}`,
        );
      }
      for (let i = 0; i < 3; i++) {
        const c = host.addCardToZone(
          'p1',
          'characters',
          makeCard({
            id: `CHAR-${i}`,
            number: `CHAR-${i}`,
            name: `Char ${i}`,
            type: 'Character',
            power: 1000,
          }),
          `char-${i}`,
        );
        c.rested = true;
      }
      for (let i = 0; i < 3; i++) {
        const d = host.addCardToZone(
          'p1',
          'cost',
          makeCard({
            id: `DON-${i}`,
            number: `DON-${i}`,
            name: 'DON!!',
            type: 'DON!!',
          }),
          `don-${i}`,
        );
        d.rested = true;
      }

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: 'p1:bonney',
        sourceCardId: 'OP12-118',
      });

      expect(engine.getPendingDecision()).toBeNull();
    });

    it('OP12-118 Jewelry Bonney [On Play] triggers with 8+ rested cards', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op12EffectDefinitions]),
        host,
      );

      for (let i = 0; i < 5; i++) {
        const c = host.addCardToZone(
          'p1',
          'characters',
          makeCard({
            id: `CHAR-${i}`,
            number: `CHAR-${i}`,
            name: `Char ${i}`,
            type: 'Character',
            power: 1000,
          }),
          `char-${i}`,
        );
        c.rested = true;
      }
      for (let i = 0; i < 4; i++) {
        const d = host.addCardToZone(
          'p1',
          'cost',
          makeCard({
            id: `DON-${i}`,
            number: `DON-${i}`,
            name: 'DON!!',
            type: 'DON!!',
          }),
          `don-${i}`,
        );
        d.rested = true;
      }

      host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP12-118',
          number: 'OP12-118',
          name: 'Jewelry Bonney',
          type: 'Character',
          power: 4000,
        }),
        'bonney',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: 'p1:bonney',
        sourceCardId: 'OP12-118',
      });

      const pending = engine.getPendingDecision();
      expect(pending).not.toBeNull();
    });
  });
});
