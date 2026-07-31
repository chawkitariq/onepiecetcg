import { describe, expect, it } from '@jest/globals';
import { type CardEffectDefinition } from '@onepiecetcg/shared';
import { EffectEngine } from '../../effect-engine';
import type { EffectRegistry } from '../../types/effect-registry';
import { st12EffectDefinitions } from './ST-12.effects';
import { makeCard, TestHost, createRegistry } from '../test-utils';

describe('ST12 effect definitions', () => {
  it('loads all ST12 cards without error', () => {
    const registry = createRegistry([st12EffectDefinitions]);
    const cards = st12EffectDefinitions.cards;

    expect(cards.length).toBeGreaterThan(0);

    for (const card of cards) {
      const resolved = registry.effectsByCardId[card.cardId];
      expect(resolved).toBeDefined();
      expect(resolved.cardId).toBe(card.cardId);
    }
  });

  it('has correct edition ID', () => {
    expect(st12EffectDefinitions.editionId).toBe('ST-12');
  });

  it('every card has at least one effect', () => {
    const empty = st12EffectDefinitions.cards.filter(
      (c) => !c.effects || c.effects.length === 0,
    );
    expect(empty).toHaveLength(0);
  });

  it('has unique effect IDs', () => {
    const allIds: string[] = [];

    for (const card of st12EffectDefinitions.cards) {
      for (const entry of card.effects ?? []) {
        if (
          entry.kind === 'standard' ||
          entry.kind === 'continuous' ||
          entry.kind === 'replacement'
        ) {
          allIds.push(entry.effect.id);
        }
      }
    }

    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it('has unique card IDs', () => {
    const cardIds = st12EffectDefinitions.cards.map((c) => c.cardId);
    const uniqueIds = new Set(cardIds);
    expect(uniqueIds.size).toBe(cardIds.length);
  });

  it('parses all effect types correctly', () => {
    let standardCount = 0;
    let continuousCount = 0;
    let replacementCount = 0;
    let specialRefCount = 0;

    for (const card of st12EffectDefinitions.cards) {
      for (const entry of card.effects ?? []) {
        switch (entry.kind) {
          case 'standard':
            standardCount++;
            break;
          case 'continuous':
            continuousCount++;
            break;
          case 'replacement':
            replacementCount++;
            break;
          case 'special-ref':
            specialRefCount++;
            break;
        }
      }
    }

    expect(standardCount).toBeGreaterThan(0);
    expect(continuousCount).toBe(0);
    expect(replacementCount).toBe(0);
    expect(specialRefCount).toBe(0);
  });

  it('validates all standard effects have triggers', () => {
    const registry = createRegistry([st12EffectDefinitions]);

    for (const def of Object.values(registry.effectsByCardId)) {
      for (const std of def.standard ?? []) {
        expect(std.trigger).toBeDefined();
        expect(std.trigger.type).toBeTruthy();
      }
    }
  });
});

const makeDon = () =>
  makeCard({
    id: 'DON',
    number: 'DON-01',
    name: 'DON!!',
    type: 'DON!!',
    cost: null,
    power: null,
    counter: null,
  });

const ensureDonDeck = (host: TestHost, sessionId: string, count: number) => {
  for (let i = 0; i < count; i++) {
    host.addCardToZone(sessionId, 'donDeck', makeDon(), `don-${i}`);
  }
};

describe('ST12 behavioral tests', () => {
  it('ST12-001 Roronoa Zoro & Sanji: returns character cost >= 2 to hand, sets character 7000 or less active', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    const p1Leader = host.getPlayer('p1')!.zones.leader;
    p1Leader.cardId = 'ST12-001';
    host.addPlayer('p2');
    ensureDonDeck(host, 'p1', 2);
    host.addDonToCost('p1', 1, false);

    const engine = new EffectEngine(createRegistry([st12EffectDefinitions]), host);

    const toReturn = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'C1',
        number: 'C1',
        name: 'Return Char',
        type: 'Character',
        cost: 3,
        power: 5000,
      }),
      'to-return',
    );
    const toSetActive = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'C2',
        number: 'C2',
        name: 'Active Char',
        type: 'Character',
        cost: 4,
        power: 6000,
      }),
      'to-set-active',
    );
    toSetActive.rested = true;

    p1Leader.attachedDon = 1;

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: p1Leader.instanceId,
      sourceCardId: p1Leader.cardId,
    });

    // Cost: choose character to return to hand
    const costDecision = engine.getPendingDecision();
    expect(costDecision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: costDecision?.id ?? '',
      selectedCardInstanceIds: [toReturn.instanceId],
    });

    // Cost resolves, character is returned. Then restand is auto-applied.
    expect(host.getPlayer('p1')?.zones.hand).toContain(toReturn);
    expect(host.getPlayer('p1')?.zones.characters).not.toContain(toReturn);
    expect(toSetActive.rested).toBe(false);
  });

  it('ST12-002 Kuina: activate main rests self and opponent cost <= 4 via auto-resolve', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry([st12EffectDefinitions]), host);

    const kuina = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ST12-002',
        number: 'ST12-002',
        name: 'Kuina',
        type: 'Character',
        cost: 3,
        power: 2000,
      }),
      'kuina',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'T1',
        number: 'T1',
        name: 'Target',
        type: 'Character',
        cost: 4,
        power: 5000,
      }),
      'target',
    );

    // The rest action auto-applies to all matching targets - no decisions
    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: kuina.instanceId,
      sourceCardId: kuina.cardId,
    });

    expect(kuina.rested).toBe(true);
    expect(target.rested).toBe(true);
  });

  it('ST12-002 Kuina: trigger plays from trash', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry([st12EffectDefinitions]), host);

    const kuina = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'ST12-002',
        number: 'ST12-002',
        name: 'Kuina',
        type: 'Character',
        cost: 3,
        power: 2000,
      }),
      'kuina',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: kuina.instanceId,
      sourceCardId: kuina.cardId,
    });

    expect(host.getPlayer('p1')?.zones.characters).toContain(kuina);
    expect(host.getPlayer('p1')?.zones.trash).not.toContain(kuina);
  });

  it('ST12-003 Dracule Mihawk: on play conditionally plays from hand rested', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry([st12EffectDefinitions]), host);

    const mihawk = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ST12-003',
        number: 'ST12-003',
        name: 'Dracule Mihawk',
        type: 'Character',
        cost: 3,
        power: 4000,
      }),
      'mihawk',
    );
    const toPlay = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'C1',
        number: 'C1',
        name: 'Played Char',
        type: 'Character',
        cost: 3,
        power: 3000,
        attributes: ['Slash'],
      }),
      'to-play',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: mihawk.instanceId,
      sourceCardId: mihawk.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [toPlay.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.characters).toContain(toPlay);
    expect(host.getPlayer('p1')?.zones.hand).not.toContain(toPlay);
    expect(toPlay.rested).toBe(true);
  });

  it('ST12-003 Dracule Mihawk: on play does not trigger with 3+ characters', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry([st12EffectDefinitions]), host);

    const mihawk = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ST12-003',
        number: 'ST12-003',
        name: 'Dracule Mihawk',
        type: 'Character',
        cost: 3,
        power: 4000,
      }),
      'mihawk',
    );
    // Add 2 more characters so total = 3 (Mihawk + 2 others = 3, > 2)
    for (let i = 0; i < 2; i++) {
      host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: `E${i}`,
          number: `E${i}`,
          name: `Extra ${i}`,
          type: 'Character',
          cost: 1,
          power: 1000,
        }),
        `extra-${i}`,
      );
    }
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'C1',
        number: 'C1',
        name: 'Played Char',
        type: 'Character',
        cost: 3,
        power: 3000,
      }),
      'to-play',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: mihawk.instanceId,
      sourceCardId: mihawk.cardId,
    });

    // Condition fails (3 characters > 2), so no decision created
    expect(engine.getPendingDecision()).toBeNull();
  });

  it('ST12-006 Yosaku & Johnny: chooseActionBranch chooses to rest', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry([st12EffectDefinitions]), host);

    const yj = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ST12-006',
        number: 'ST12-006',
        name: 'Yosaku & Johnny',
        type: 'Character',
        cost: 2,
        power: 3000,
      }),
      'yj',
    );
    const restTarget = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'T1',
        number: 'T1',
        name: 'Rest Target',
        type: 'Character',
        cost: 2,
        power: 4000,
      }),
      'rest-target',
    );

    yj.attachedDon = 1;

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: yj.instanceId,
      sourceCardId: yj.cardId,
    });

    // chooseActionBranch creates a selectChoice decision
    const choiceDecision = engine.getPendingDecision();
    expect(choiceDecision?.prompt.type).toBe('selectChoice');
    engine.answerDecision({
      decisionId: choiceDecision?.id ?? '',
      selectedChoiceIds: ['st12-006-rest'],
    });

    expect(restTarget.rested).toBe(true);
  });

  it('ST12-006 Yosaku & Johnny: chooseActionBranch chooses to KO', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry([st12EffectDefinitions]), host);

    const yj = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ST12-006',
        number: 'ST12-006',
        name: 'Yosaku & Johnny',
        type: 'Character',
        cost: 2,
        power: 3000,
      }),
      'yj',
    );
    const koTarget = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'T2',
        number: 'T2',
        name: 'KO Target',
        type: 'Character',
        cost: 2,
        power: 3000,
      }),
      'ko-target',
    );
    koTarget.rested = true;

    yj.attachedDon = 1;

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: yj.instanceId,
      sourceCardId: yj.cardId,
    });

    const choiceDecision = engine.getPendingDecision();
    expect(choiceDecision?.prompt.type).toBe('selectChoice');
    engine.answerDecision({
      decisionId: choiceDecision?.id ?? '',
      selectedChoiceIds: ['st12-006-ko'],
    });

    const targetDecision = engine.getPendingDecision();
    expect(targetDecision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: targetDecision!.id,
      selectedCardInstanceIds: [koTarget.instanceId],
    });

    expect(host.getPlayer('p2')?.zones.characters).not.toContain(koTarget);
    expect(host.getPlayer('p2')?.zones.trash).toContain(koTarget);
  });

  it('ST12-007 Rika: on play condition does not trigger if opponent has < 3 life', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry([st12EffectDefinitions]), host);

    host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ST12-007',
        number: 'ST12-007',
        name: 'Rika',
        type: 'Character',
        cost: 2,
        power: 0,
      }),
      'rika',
    );
    const slashChar = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'C1',
        number: 'C1',
        name: 'Slash Char',
        type: 'Character',
        cost: 3,
        power: 5000,
        attributes: ['Slash'],
      }),
      'slash-char',
    );
    slashChar.rested = true;

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: host
        .getPlayer('p1')!
        .zones.characters.find((c) => c.name === 'Rika')!.instanceId,
      sourceCardId: 'ST12-007',
    });

    // Opponent has 0 life cards, condition fails
    expect(engine.getPendingDecision()).toBeNull();
    expect(slashChar.rested).toBe(true);
  });

  it('ST12-007 Rika: on play rest 2 DON!!, set Slash character active when opponent has 3+ life', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    ensureDonDeck(host, 'p1', 5);
    host.addDonToCost('p1', 3, false);
    // Give opponent 3 life cards
    for (let i = 0; i < 3; i++) {
      host.addCardToZone(
        'p2',
        'life',
        makeCard({
          id: `L${i}`,
          number: `L${i}`,
          name: `Life ${i}`,
          type: 'Character',
        }),
        `life${i}`,
      );
    }

    const engine = new EffectEngine(createRegistry([st12EffectDefinitions]), host);

    host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ST12-007',
        number: 'ST12-007',
        name: 'Rika',
        type: 'Character',
        cost: 2,
        power: 0,
      }),
      'rika',
    );
    const slashChar = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'C1',
        number: 'C1',
        name: 'Slash Char',
        type: 'Character',
        cost: 3,
        power: 5000,
        attributes: ['Slash'],
      }),
      'slash-char',
    );
    slashChar.rested = true;

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: host
        .getPlayer('p1')!
        .zones.characters.find((c) => c.name === 'Rika')!.instanceId,
      sourceCardId: 'ST12-007',
    });

    // No decisions - rest action auto-applies to all DON!! in cost area,
    // then restand auto-applies to all matching Slash characters
    expect(slashChar.rested).toBe(false);
  });

  it('ST12-008 Roronoa Zoro: don x1 when attacking rests opponent cost <= 6 auto', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry([st12EffectDefinitions]), host);

    const zoro = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ST12-008',
        number: 'ST12-008',
        name: 'Roronoa Zoro',
        type: 'Character',
        cost: 4,
        power: 6000,
      }),
      'zoro',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'T1',
        number: 'T1',
        name: 'Target',
        type: 'Character',
        cost: 6,
        power: 7000,
      }),
      'target',
    );
    zoro.attachedDon = 1;

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: zoro.instanceId,
      sourceCardId: zoro.cardId,
    });

    // rest action auto-applies to all matching targets
    expect(target.rested).toBe(true);
  });

  it('ST12-010 Emporio.Ivankov: when attacking draws 1 if hand <= 6', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry([st12EffectDefinitions]), host);

    const ivankov = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ST12-010',
        number: 'ST12-010',
        name: 'Emporio.Ivankov',
        type: 'Character',
        cost: 3,
        power: 4000,
      }),
      'ivankov',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'D1', number: 'D1', name: 'Drawn', type: 'Character' }),
      'drawn',
    );

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: ivankov.instanceId,
      sourceCardId: ivankov.cardId,
    });

    // Hand = 0 cards. Condition: hand <= 6, so draw 1
    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(1);
  });

  it('ST12-011 Sanji: don x1 when attacking gains +2000 if hand <= 5', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry([st12EffectDefinitions]), host);

    const sanji = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ST12-011',
        number: 'ST12-011',
        name: 'Sanji',
        type: 'Character',
        cost: 2,
        power: 3000,
      }),
      'sanji',
    );
    sanji.attachedDon = 1;

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: sanji.instanceId,
      sourceCardId: sanji.cardId,
    });

    engine.reapplyContinuousEffects();
    expect(sanji.power).toBe(5000);
  });

  it('ST12-012 Charlotte Pudding: activate main returns self to hand', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry([st12EffectDefinitions]), host);

    const pudding = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ST12-012',
        number: 'ST12-012',
        name: 'Charlotte Pudding',
        type: 'Character',
        cost: 2,
        power: 2000,
      }),
      'pudding',
    );

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: pudding.instanceId,
      sourceCardId: pudding.cardId,
    });

    expect(host.getPlayer('p1')?.zones.hand).toContain(pudding);
    expect(host.getPlayer('p1')?.zones.characters).not.toContain(pudding);
  });

  it('ST12-013 Zeff: on play arrange deck window', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry([st12EffectDefinitions]), host);

    const zeff = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ST12-013',
        number: 'ST12-013',
        name: 'Zeff',
        type: 'Character',
        cost: 5,
        power: 5000,
      }),
      'zeff',
    );
    for (let i = 0; i < 3; i++) {
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: `D${i}`,
          number: `D${i}`,
          name: `Deck ${i}`,
          type: 'Character',
        }),
        `deck-${i}`,
      );
    }

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: zeff.instanceId,
      sourceCardId: zeff.cardId,
    });

    // arrangeDeckWindow creates deck window decisions
    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectChoice');
  });

  it('ST12-016 Lion Strike: main rests opponent leader or character cost <= 4 auto', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry([st12EffectDefinitions]), host);

    const lionStrike = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'ST12-016',
        number: 'ST12-016',
        name: 'Lion Strike',
        type: 'Event',
        cost: 2,
      }),
      'lion-strike',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'T1',
        number: 'T1',
        name: 'Target',
        type: 'Character',
        cost: 4,
        power: 5000,
      }),
      'target',
    );

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: lionStrike.instanceId,
      sourceCardId: lionStrike.cardId,
    });

    // rest action auto-applies to all matching targets
    expect(target.rested).toBe(true);
  });

  it('ST12-017 Plastic Surgery Shot: counter +2000 power during battle', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry([st12EffectDefinitions]), host);

    const plasticSurgery = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'ST12-017',
        number: 'ST12-017',
        name: 'Plastic Surgery Shot',
        type: 'Event',
        cost: 1,
      }),
      'plastic-surgery',
    );
    const leader = host.getPlayer('p1')!.zones.leader;

    engine.handleEvent({
      type: 'activateCounter',
      playerSessionId: 'p1',
      sourceInstanceId: plasticSurgery.instanceId,
      sourceCardId: plasticSurgery.cardId,
    });

    // modifyPower creates selectCards decision (French message)
    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [leader.instanceId],
    });

    engine.reapplyContinuousEffects();
    expect(leader.power).toBe(7000);
  });
});
