import { describe, expect, it } from '@jest/globals';
import type { Card, CardEffectDefinition } from '@onepiecetcg/shared';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';
import { op10EffectDefinitions } from './OP-10.effects';
import { EffectEngine } from '../../effect-engine';
import { TestHost, makeCard, createRegistry } from '../test-utils';
import { specialHandlerDefinitions } from '..';

describe('OP10 effect definitions', () => {
  it('exports the edition definitions', () => {
    expect(op10EffectDefinitions.editionId).toBe('OP-10');
  });

  it('has card entries for all 119 OP10 cards', () => {
    const cardIds = op10EffectDefinitions.cards.map((c) => c.cardId);
    expect(cardIds.length).toBe(119);
    const op10Prefix = cardIds.filter((id) => id.startsWith('OP10-'));
    expect(op10Prefix.length).toBe(cardIds.length);
  });

  it('each card has valid effect entries', () => {
    const validKinds = new Set([
      'standard',
      'continuous',
      'replacement',
      'special-ref',
    ]);

    for (const card of op10EffectDefinitions.cards) {
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

    for (const card of op10EffectDefinitions.cards) {
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

  it('OP10-001 Smoker has continuous power buff and activate main effect', () => {
    const card = op10EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP10-001',
    );
    expect(card).toBeDefined();
    expect(card!.effects).toBeDefined();
    expect(card!.effects!.length).toBe(2);

    const cont = card!.effects![0];
    expect(cont.kind).toBe('continuous');
    if (cont.kind === 'continuous') {
      expect(cont.effect.modifier.power).toBe(1000);
      expect(cont.effect.conditions).toEqual(
        expect.arrayContaining([{ type: 'controllerTurn', value: false }]),
      );
    }

    const std = card!.effects![1];
    expect(std.kind).toBe('standard');
    if (std.kind === 'standard') {
      expect(std.effect.trigger.type).toBe('activateMain');
      expect(std.effect.trigger.oncePerTurn).toBe(true);
    }
  });

  it('OP10-042 Usopp leader has continuous cost modifier and special-ref', () => {
    const card = op10EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP10-042',
    );
    expect(card).toBeDefined();
    expect(card!.effects!.length).toBe(2);

    const cont = card!.effects![0];
    expect(cont.kind).toBe('continuous');
    if (cont.kind === 'continuous') {
      expect(cont.effect.modifier.cost).toBe(1);
    }

    const special = card!.effects![1];
    expect(special.kind).toBe('special-ref');
  });

  it('OP10-074 Pica has replacement effect', () => {
    const card = op10EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP10-074',
    );
    expect(card).toBeDefined();
    expect(card!.effects!.length).toBe(1);

    const entry = card!.effects![0];
    expect(entry.kind).toBe('replacement');
    if (entry.kind === 'replacement') {
      expect(entry.effect.event).toBe('wouldKoCharacter');
      expect(entry.effect.oncePerTurn).toBe(true);
      expect(entry.effect.optional).toBe(true);
    }
  });

  it('OP10-094 Ryuma has DON!! x1 continuous Double Attack', () => {
    const card = op10EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP10-094',
    );
    expect(card).toBeDefined();
    expect(card!.effects!.length).toBe(1);

    const cont = card!.effects![0];
    expect(cont.kind).toBe('continuous');
    if (cont.kind === 'continuous') {
      expect(cont.effect.conditions).toEqual(
        expect.arrayContaining([
          { type: 'sourceHasAttachedDonAtLeast', value: 1 },
        ]),
      );
      expect(cont.effect.modifier.keywords).toContain('doubleAttack');
    }
  });

  it('OP10-022 has special handler ref', () => {
    const card = op10EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP10-022',
    );
    expect(card).toBeDefined();
    expect(card!.effects!.length).toBe(1);
    expect(card!.effects![0].kind).toBe('special-ref');
    if (card!.effects![0].kind === 'special-ref') {
      expect(card!.effects![0].specialHandlerId).toBe('op10-022-special');
    }
  });

  it('all special-ref handlers have valid IDs', () => {
    const pattern = /^op10-\d{3}-special$/;
    for (const card of op10EffectDefinitions.cards) {
      for (const entry of card.effects ?? []) {
        if (entry.kind === 'special-ref') {
          expect(entry.specialHandlerId).toMatch(pattern);
        }
      }
    }
  });

  it('empty-text cards have empty effects', () => {
    const emptyCards = [
      'OP10-012',
      'OP10-013',
      'OP10-014',
      'OP10-031',
      'OP10-050',
      'OP10-054',
      'OP10-064',
      'OP10-068',
      'OP10-073',
      'OP10-084',
      'OP10-089',
      'OP10-101',
      'OP10-105',
    ];
    for (const cardId of emptyCards) {
      const card = op10EffectDefinitions.cards.find((c) => c.cardId === cardId);
      expect(card).toBeDefined();
      expect(card!.effects).toEqual([]);
    }
  });
});

describe('OP10 behavioral effects', () => {
  it('OP10-001: grants +1000 power to Navy characters on opponent turn', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op10EffectDefinitions]),
      host,
    );

    const smoker = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP10-001',
        number: 'OP10-001',
        name: 'Smoker',
        type: 'Character',
        power: 5000,
        cost: 4,
        families: ['Navy'],
      }),
      's',
    );
    const nonNavy = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP99-other',
        number: 'OP99-other',
        name: 'Other',
        type: 'Character',
        power: 3000,
        cost: 2,
        families: ['Fish-Man'],
      }),
      'o',
    );

    host.state.activePlayerSessionId = 'p2';
    engine.reapplyContinuousEffects();

    expect(smoker.power).toBe(6000);
    expect(nonNavy.power).toBe(3000);
  });

  it("OP10-005: draws 1 card when KO'd", () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op10EffectDefinitions]),
      host,
    );

    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'OP99-d1',
        number: 'OP99-d1',
        name: 'Deck Card',
        type: 'Character',
      }),
      'd1',
    );

    const sanji = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP10-005',
        number: 'OP10-005',
        name: 'Sanji',
        type: 'Character',
        power: 3000,
        cost: 3,
      }),
      's',
    );
    const initialHandSize = host.getPlayer('p1')!.zones.hand.length;

    engine.handleEvent({
      type: 'onKo',
      playerSessionId: 'p1',
      sourceInstanceId: sanji.instanceId,
      sourceCardId: sanji.cardId,
    });

    expect(host.getPlayer('p1')!.zones.hand.length).toBe(initialHandSize + 1);
  });

  it('OP10-015: reduces opponent character power by 1000 on play', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op10EffectDefinitions]),
      host,
    );

    const mocha = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP10-015',
        number: 'OP10-015',
        name: 'Mocha',
        type: 'Character',
        power: 3000,
        cost: 2,
      }),
      'm',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-target',
        number: 'OP99-target',
        name: 'Target',
        type: 'Character',
        power: 5000,
        cost: 4,
      }),
      't',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: mocha.instanceId,
      sourceCardId: mocha.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(target.power).toBe(4000);
  });

  it('OP10-009: reduces opponent character power by 3000 when leader is Punk Hazard', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op10EffectDefinitions]),
      host,
    );

    host.getPlayer('p1')!.zones.leader.families = ['Punk Hazard'];

    const smiley = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP10-009',
        number: 'OP10-009',
        name: 'Smiley',
        type: 'Character',
        power: 4000,
        cost: 3,
      }),
      's',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-target',
        number: 'OP99-target',
        name: 'Opponent Char',
        type: 'Character',
        power: 5000,
        cost: 4,
      }),
      't',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: smiley.instanceId,
      sourceCardId: smiley.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(target.power).toBe(2000);
  });

  it('OP10-058 Rebecca draws 1 if a cost-8 character exists, then plays revealed Dressrosa characters with the second rested if cost 4 or less', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op10EffectDefinitions], specialHandlerDefinitions),
      host,
    );

    const rebecca = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP10-058',
        number: 'OP10-058',
        name: 'Rebecca',
        type: 'Character',
      }),
      'rebecca',
    );
    host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'BIG',
        number: 'BIG',
        name: 'Big Character',
        type: 'Character',
        cost: 8,
      }),
      'big-character',
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
    const firstDressrosa = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'DRESS-1',
        number: 'DRESS-1',
        name: 'Dressrosa 1',
        type: 'Character',
        cost: 5,
        families: ['Dressrosa'],
      }),
      'dressrosa-1',
    );
    const secondDressrosa = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'DRESS-2',
        number: 'DRESS-2',
        name: 'Dressrosa 2',
        type: 'Character',
        cost: 4,
        families: ['Dressrosa'],
      }),
      'dressrosa-2',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: rebecca.instanceId,
      sourceCardId: rebecca.cardId,
    });

    const revealDecision = engine.getPendingDecision();
    expect(revealDecision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: revealDecision?.id ?? '',
      selectedCardInstanceIds: [
        firstDressrosa.instanceId,
        secondDressrosa.instanceId,
      ],
    });

    const choiceDecision = engine.getPendingDecision();
    expect(choiceDecision?.prompt.type).toBe('selectChoice');
    engine.answerDecision({
      decisionId: choiceDecision?.id ?? '',
      selectedChoiceIds: [firstDressrosa.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.hand.map((card) => card.name)).toEqual([
      'Draw 1',
    ]);
    expect(host.getPlayer('p1')?.zones.characters).toContain(firstDressrosa);
    expect(host.getPlayer('p1')?.zones.characters).toContain(secondDressrosa);
    expect(firstDressrosa.rested).toBe(false);
    expect(secondDressrosa.rested).toBe(true);
  });

  it('OP10-023: rests up to 2 opponent characters with cost ≤5 when leader has Navy', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op10EffectDefinitions]),
      host,
    );

    host.getPlayer('p1')!.zones.leader.families = ['Navy'];

    host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP10-023',
        number: 'OP10-023',
        name: 'Issho',
        type: 'Character',
        power: 6000,
        cost: 5,
      }),
      'i',
    );
    const target1 = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-t1',
        number: 'OP99-t1',
        name: 'Target1',
        type: 'Character',
        power: 4000,
        cost: 3,
      }),
      't1',
    );
    const target2 = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-t2',
        number: 'OP99-t2',
        name: 'Target2',
        type: 'Character',
        power: 5000,
        cost: 5,
      }),
      't2',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: host.getPlayer('p1')!.zones.characters[0].instanceId,
      sourceCardId: 'OP10-023',
    });

    expect(target1.rested).toBe(true);
    expect(target2.rested).toBe(true);
  });

  it('OP10-042: continuously grants +1 cost to Dressrosa characters with cost ≥2', () => {
    const host = new TestHost();
    host.addPlayer('p1', 'OP10-042');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op10EffectDefinitions]),
      host,
    );

    const dressrosaChar = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP99-dress',
        number: 'OP99-dress',
        name: 'Dressrosa Fighter',
        type: 'Character',
        cost: 3,
        families: ['Dressrosa'],
      }),
      'd',
    );
    const nonDressrosa = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP99-other',
        number: 'OP99-other',
        name: 'Other Char',
        type: 'Character',
        cost: 2,
      }),
      'o',
    );

    engine.reapplyContinuousEffects();

    expect(dressrosaChar.cost).toBe(4);
    expect(nonDressrosa.cost).toBe(2);
  });

  it('OP10-046: returns opponent character with cost ≤5 to hand on play', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op10EffectDefinitions]),
      host,
    );

    host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP10-046',
        number: 'OP10-046',
        name: 'Kyros',
        type: 'Character',
        power: 5000,
        cost: 4,
      }),
      'k',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-target',
        number: 'OP99-target',
        name: 'Target',
        type: 'Character',
        power: 3000,
        cost: 3,
      }),
      't',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: host.getPlayer('p1')!.zones.characters[0].instanceId,
      sourceCardId: 'OP10-046',
    });

    const decision = engine.getPendingDecision();
    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(
      host
        .getPlayer('p2')
        ?.zones.characters.find((c) => c.instanceId === target.instanceId),
    ).toBeUndefined();
    expect(
      host
        .getPlayer('p2')
        ?.zones.hand.find((c) => c.instanceId === target.instanceId),
    ).toBeDefined();
  });

  it('OP10-052: places opponent character with cost ≤1 at bottom of deck on play', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op10EffectDefinitions]),
      host,
    );

    host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP10-052',
        number: 'OP10-052',
        name: 'Bartolomeo',
        type: 'Character',
        power: 4000,
        cost: 3,
      }),
      'b',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-target',
        number: 'OP99-target',
        name: 'Target',
        type: 'Character',
        power: 1000,
        cost: 1,
      }),
      't',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: host.getPlayer('p1')!.zones.characters[0].instanceId,
      sourceCardId: 'OP10-052',
    });

    const decision = engine.getPendingDecision();
    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(
      host
        .getPlayer('p2')
        ?.zones.characters.find((c) => c.instanceId === target.instanceId),
    ).toBeUndefined();
    expect(host.getPlayer('p2')?.zones.deck.at(-1)?.instanceId).toBe(
      target.instanceId,
    );
  });

  it('OP10-094: gains Double Attack when it has at least 1 attached DON', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op10EffectDefinitions]),
      host,
    );

    const ryuma = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP10-094',
        number: 'OP10-094',
        name: 'Ryuma',
        type: 'Character',
        power: 5000,
        cost: 4,
      }),
      'r',
    );

    engine.reapplyContinuousEffects();
    expect(ryuma.hasDoubleAttack).toBe(false);

    ryuma.attachedDon = 1;
    engine.reapplyContinuousEffects();
    expect(ryuma.hasDoubleAttack).toBe(true);
  });

  it('OP10-038: gains +2000 power on opponent turn when 2+ rested characters exist', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op10EffectDefinitions]),
      host,
    );

    const zoro = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP10-038',
        number: 'OP10-038',
        name: 'Roronoa Zoro',
        type: 'Character',
        power: 4000,
        cost: 3,
      }),
      'z',
    );
    const rested1 = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP99-r1',
        number: 'OP99-r1',
        name: 'Rested1',
        type: 'Character',
        power: 2000,
        cost: 1,
      }),
      'r1',
    );
    const rested2 = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP99-r2',
        number: 'OP99-r2',
        name: 'Rested2',
        type: 'Character',
        power: 3000,
        cost: 2,
      }),
      'r2',
    );

    rested1.rested = true;
    rested2.rested = true;

    host.state.activePlayerSessionId = 'p2';
    engine.reapplyContinuousEffects();

    expect(zoro.power).toBe(6000);
  });

  it('OP10-025: draws 3 cards and trashes 2 from hand on play when 2+ rested chars exist', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op10EffectDefinitions]),
      host,
    );

    for (let i = 0; i < 5; i++) {
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: `OP99-d${i}`,
          number: `OP99-d${i}`,
          name: `Deck Card ${i}`,
          type: 'Character',
        }),
        `d${i}`,
      );
    }

    const rested1 = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP99-r1',
        number: 'OP99-r1',
        name: 'Rested1',
        type: 'Character',
        power: 2000,
        cost: 1,
      }),
      'r1',
    );
    rested1.rested = true;
    const rested2 = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP99-r2',
        number: 'OP99-r2',
        name: 'Rested2',
        type: 'Character',
        power: 2000,
        cost: 1,
      }),
      'r2',
    );
    rested2.rested = true;

    host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP10-025',
        number: 'OP10-025',
        name: 'Enel',
        type: 'Character',
        power: 5000,
        cost: 5,
      }),
      'e',
    );
    const initialHandSize = host.getPlayer('p1')!.zones.hand.length;

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: host.getPlayer('p1')!.zones.characters[2].instanceId,
      sourceCardId: 'OP10-025',
    });

    expect(host.getPlayer('p1')!.zones.hand.length).toBe(initialHandSize + 3);

    const trashDecision = engine.getPendingDecision();
    expect(trashDecision?.prompt.type).toBe('selectCards');
    const cardsToTrash = host.getPlayer('p1')!.zones.hand.slice(0, 2);
    engine.answerDecision({
      decisionId: trashDecision!.id,
      selectedCardInstanceIds: cardsToTrash.map((c) => c.instanceId),
    });

    expect(host.getPlayer('p1')!.zones.hand.length).toBe(
      initialHandSize + 3 - 2,
    );
  });

  it('OP10-079: adds 1 DON from DON deck as active on trigger', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op10EffectDefinitions]),
      host,
    );

    for (let i = 0; i < 3; i++) {
      host.addCardToZone(
        'p1',
        'donDeck',
        makeCard({
          id: `DON-${i}`,
          number: `DON-${i}`,
          name: 'Don!!',
          type: 'Don',
        }),
        `don-${i}`,
      );
    }

    const card = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OP10-079',
        number: 'OP10-079',
        name: 'God Thread',
        type: 'Event',
        cost: 2,
      }),
      'g',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: card.instanceId,
      sourceCardId: card.cardId,
    });

    expect(host.getPlayer('p1')!.zones.cost.length).toBe(1);
  });

  it('OP10-071: on play with DON!!1 cost, plays a Donquixote Pirates character from hand', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op10EffectDefinitions]),
      host,
    );

    for (let i = 0; i < 5; i++) {
      host.addCardToZone(
        'p1',
        'donDeck',
        makeCard({
          id: `DON-${i}`,
          number: `DON-${i}`,
          name: 'Don!!',
          type: 'Don',
        }),
        `don-${i}`,
      );
    }
    host.addDonToCost('p1', 3, false);
    const initialDonCount = host.getPlayer('p1')!.zones.cost.length;

    host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP10-071',
        number: 'OP10-071',
        name: 'Donquixote Doflamingo',
        type: 'Character',
        power: 6000,
        cost: 7,
      }),
      'd',
    );
    const characterToPlay = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OP99-trebol',
        number: 'OP99-trebol',
        name: 'Trebol',
        type: 'Character',
        cost: 4,
        power: 4000,
        families: ['Donquixote Pirates'],
      }),
      'trebol',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: host.getPlayer('p1')!.zones.characters[0].instanceId,
      sourceCardId: 'OP10-071',
    });

    expect(host.getPlayer('p1')!.zones.cost.length).toBe(initialDonCount - 1);

    const playDecision = engine.getPendingDecision();
    expect(playDecision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: playDecision!.id,
      selectedCardInstanceIds: [characterToPlay.instanceId],
    });

    expect(
      host
        .getPlayer('p1')
        ?.zones.characters.find(
          (c) => c.instanceId === characterToPlay.instanceId,
        ),
    ).toBeDefined();
    expect(
      host
        .getPlayer('p1')
        ?.zones.hand.find((c) => c.instanceId === characterToPlay.instanceId),
    ).toBeUndefined();
  });

  it('OP10-011: gains +2000 power on opponent turn continuously', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op10EffectDefinitions]),
      host,
    );

    const chopper = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP10-011',
        number: 'OP10-011',
        name: 'Tony Tony Chopper',
        type: 'Character',
        power: 3000,
        cost: 2,
      }),
      'c',
    );

    host.state.activePlayerSessionId = 'p2';
    engine.reapplyContinuousEffects();

    expect(chopper.power).toBe(5000);
  });

  it('OP10-002: when attacking with DON x2, bounces a Punk Hazard char then KOs a ≤4000 opponent char', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op10EffectDefinitions]),
      host,
    );

    const caesar = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP10-002',
        number: 'OP10-002',
        name: 'Caesar Clown',
        type: 'Character',
        power: 5000,
        cost: 4,
        families: ['Punk Hazard'],
      }),
      'c',
    );
    caesar.attachedDon = 2;

    const punkHazardChar = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP99-ph',
        number: 'OP99-ph',
        name: 'Punk Fodder',
        type: 'Character',
        cost: 3,
        power: 3000,
        families: ['Punk Hazard'],
      }),
      'ph',
    );
    const opponentChar = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-op',
        number: 'OP99-op',
        name: 'Opponent',
        type: 'Character',
        cost: 3,
        power: 4000,
      }),
      'op',
    );

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: caesar.instanceId,
      sourceCardId: caesar.cardId,
    });

    const confirmDecision = engine.getPendingDecision();
    expect(confirmDecision?.prompt.type).toBe('confirm');
    engine.answerDecision({ decisionId: confirmDecision!.id, confirmed: true });

    const bounceDecision = engine.getPendingDecision();
    expect(bounceDecision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: bounceDecision!.id,
      selectedCardInstanceIds: [punkHazardChar.instanceId],
    });

    const koDecision = engine.getPendingDecision();
    expect(koDecision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: koDecision!.id,
      selectedCardInstanceIds: [opponentChar.instanceId],
    });

    expect(
      host
        .getPlayer('p1')
        ?.zones.characters.find(
          (c) => c.instanceId === punkHazardChar.instanceId,
        ),
    ).toBeUndefined();
    expect(
      host
        .getPlayer('p1')
        ?.zones.hand.find((c) => c.instanceId === punkHazardChar.instanceId),
    ).toBeDefined();
    expect(
      host
        .getPlayer('p2')
        ?.zones.characters.find(
          (c) => c.instanceId === opponentChar.instanceId,
        ),
    ).toBeUndefined();
    expect(
      host
        .getPlayer('p2')
        ?.zones.trash.find((c) => c.instanceId === opponentChar.instanceId),
    ).toBeDefined();
  });
});
