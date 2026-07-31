import type { CardEffectSource } from '@onepiecetcg/shared';
import { op07EffectDefinitions } from './OP-07.effects';
import { EffectEngine } from '../../../effect-engine/src/effect-engine.js';
import { TestHost, makeCard, createRegistry } from '../test-utils.js';
import { op07091SpecialHandler } from './special/OP07-091.special';

describe('OP07 effect definitions', () => {
  it('exports cards with the correct edition id', () => {
    expect(op07EffectDefinitions.editionId).toBe('OP-07');
    expect(op07EffectDefinitions.cards.length).toBeGreaterThan(0);
  });

  it.each(op07EffectDefinitions.cards)(
    'card $cardId has a valid structure',
    (card: CardEffectSource) => {
      expect(card.cardId).toMatch(/^OP07-\d{3}$/);
      if (card.effects) {
        expect(card.effects.length).toBeGreaterThan(0);
        for (const entry of card.effects) {
          if (entry.kind === 'special-ref') {
            expect(typeof entry.specialHandlerId).toBe('string');
          } else if (entry.kind === 'standard') {
            expect(entry.effect).toBeDefined();
            expect(entry.effect.id).toBeTruthy();
            expect(entry.effect.text).toBeTruthy();
            expect(entry.effect.trigger).toBeDefined();
          } else if (entry.kind === 'continuous') {
            expect(entry.effect).toBeDefined();
            expect(entry.effect.id).toBeTruthy();
            expect(entry.effect.modifier).toBeDefined();
          }
        }
      }
    },
  );

  it('has all special-ref handlers referenced from the definitions', () => {
    const specialRefIds = new Set<string>();
    for (const card of op07EffectDefinitions.cards) {
      if (card.effects) {
        for (const entry of card.effects) {
          if (entry.kind === 'special-ref') {
            specialRefIds.add(entry.specialHandlerId);
          }
        }
      }
    }
    expect(specialRefIds.size).toBeGreaterThan(0);
    expect(specialRefIds.has('op07-029-special')).toBe(true);
    expect(specialRefIds.has('op07-042-special')).toBe(true);
    expect(specialRefIds.has('op07-091-special')).toBe(true);
    expect(specialRefIds.has('op07-097-special')).toBe(true);
  });

  describe('specific card patterns', () => {
    const findCard = (cardId: string) =>
      op07EffectDefinitions.cards.find((c) => c.cardId === cardId);

    it('OP07-029 has continuous Blocker and special-ref', () => {
      const card = findCard('OP07-029');
      const special = card?.effects?.find((e) => e.kind === 'special-ref');
      expect(special).toBeDefined();
    });

    it('OP07-042 Gecko Moria uses special-ref', () => {
      const card = findCard('OP07-042');
      expect(card?.effects?.length).toBe(1);
      expect(card?.effects?.[0]?.kind).toBe('special-ref');
    });

    it('OP07-091 Monkey.D.Luffy uses special-ref', () => {
      const card = findCard('OP07-091');
      expect(card?.effects?.length).toBe(1);
      expect(card?.effects?.[0]?.kind).toBe('special-ref');
    });

    it('OP07-097 Vegapunk has cannotAttack continuous and special-ref', () => {
      const card = findCard('OP07-097');
      expect(card?.effects?.length).toBe(2);
      const cont = card?.effects?.find((e) => e.kind === 'continuous');
      expect(cont).toBeDefined();
      const special = card?.effects?.find((e) => e.kind === 'special-ref');
      expect(special).toBeDefined();
    });

    it('OP07-084 has no authored effects (Blocker-only)', () => {
      const card = findCard('OP07-084');
      expect(card?.effects).toBeUndefined();
    });

    it('OP07-033 protects cost 3 or less characters', () => {
      const card = findCard('OP07-033');
      const cont = card?.effects?.[0];
      expect(cont?.kind).toBe('continuous');
      if (cont?.kind === 'continuous') {
        expect(cont.effect.conditions).toBeDefined();
        expect(cont.effect.conditions?.length).toBe(1);
        expect(cont.effect.modifier.selector.filter?.costMax).toBe(3);
        expect(cont.effect.modifier.keywords).toContain(
          'cannotBeKoedByEffects',
        );
      }
    });

    it('OP07-011 Bluejam has DON!! x1 condition', () => {
      const card = findCard('OP07-011');
      const std = card?.effects?.[0];
      expect(std?.kind).toBe('standard');
      if (std?.kind === 'standard') {
        const condition = std.effect.conditions?.[0];
        expect(condition?.type).toBe('sourceHasAttachedDonAtLeast');
      }
    });

    it('cards with [Trigger] effects reference themselves via activateEffect when appropriate', () => {
      const triggerToMain = ['OP07-016', 'OP07-017', 'OP07-018', 'OP07-077'];
      for (const cid of triggerToMain) {
        const card = findCard(cid);
        const triggerEffect = card?.effects?.find(
          (e) => e.kind === 'standard' && e.effect.trigger.type === 'trigger',
        );
        expect(triggerEffect).toBeDefined();
      }
    });
  });

  describe('continuous condition patterns', () => {
    it('OP07-031 Bartolomeo requires controller turn', () => {
      const card = op07EffectDefinitions.cards.find(
        (c) => c.cardId === 'OP07-031',
      );
      expect(card).toBeDefined();
      const std = card?.effects?.[0];
      expect(std?.kind).toBe('standard');
    });

    it('OP07-023 checks 6 rested DON!!', () => {
      const card = op07EffectDefinitions.cards.find(
        (c) => c.cardId === 'OP07-023',
      );
      expect(card).toBeDefined();
      expect(card?.effects?.[0]?.kind).toBe('continuous');
    });
  });
});

describe('OP07 behavioral tests', () => {
  it('OP07-045 Jinbe: [On Play] plays a Seven Warlords character from hand', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op07EffectDefinitions]),
      host,
    );

    const jinbe = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP07-045',
        number: 'OP07-045',
        name: 'Jinbe 045',
        type: 'Character',
        cost: 5,
        families: ['The Seven Warlords of the Sea'],
      }),
      'jinbe',
    );

    const target = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'TEST-SWL',
        number: 'TEST-SWL',
        name: 'Mihawk',
        type: 'Character',
        cost: 4,
        families: ['The Seven Warlords of the Sea'],
      }),
      'target',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: jinbe.instanceId,
      sourceCardId: jinbe.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision).not.toBeNull();
    expect(decision!.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    const p1 = host.getPlayer('p1')!;
    expect(p1.zones.characters).toContain(target);
    expect(p1.zones.hand).not.toContain(target);
  });

  it('OP07-107 Franky: [Trigger] draws 1 card', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op07EffectDefinitions]),
      host,
    );

    host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP07-107',
        number: 'OP07-107',
        name: 'Franky 107',
        type: 'Event',
      }),
      'franky',
    );

    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'DECK-001',
        number: 'DECK-001',
        name: 'Drawn Card',
        type: 'Character',
      }),
      'drawn-card',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: 'p1:franky',
      sourceCardId: 'OP07-107',
    });

    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(1);
  });

  it('OP07-107 Franky: [Trigger] plays itself from trash when life ≤ 1', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op07EffectDefinitions]),
      host,
    );

    host.addCardToZone(
      'p1',
      'life',
      makeCard({
        id: 'LIFE-001',
        number: 'LIFE-001',
        name: 'Life Card',
        type: 'Character',
      }),
      'life-card',
    );

    const franky = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP07-107',
        number: 'OP07-107',
        name: 'Franky 107',
        type: 'Event',
      }),
      'franky',
    );

    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'DECK-001',
        number: 'DECK-001',
        name: 'Deck Card',
        type: 'Character',
      }),
      'deck-card',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: franky.instanceId,
      sourceCardId: franky.cardId,
    });

    const p1 = host.getPlayer('p1')!;
    expect(p1.zones.characters).toContain(franky);
    expect(p1.zones.trash).not.toContain(franky);
  });

  it('OP07-015 Monkey.D.Dragon: [On Play] attaches rested DON!!', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op07EffectDefinitions]),
      host,
    );

    const dragon = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP07-015',
        number: 'OP07-015',
        name: 'Monkey.D.Dragon 015',
        type: 'Character',
        cost: 7,
        power: 8000,
      }),
      'dragon',
    );

    for (let i = 0; i < 3; i++) {
      const don = host.addCardToZone(
        'p1',
        'cost',
        makeCard({
          id: `DON-P1-${i}`,
          number: `DON-P1-${i}`,
          name: `DON!! ${i}`,
          type: 'DON!!',
        }),
        `don-p1-${i}`,
      );
      don.rested = true;
    }

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: dragon.instanceId,
      sourceCardId: dragon.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision).not.toBeNull();
    expect(decision!.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [dragon.instanceId],
    });

    expect(dragon.attachedDon).toBe(2);
  });

  it('OP07-023 Caribou: continuous +1000 power with 6 or more rested DON!!', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op07EffectDefinitions]),
      host,
    );

    const caribou = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP07-023',
        number: 'OP07-023',
        name: 'Caribou 023',
        type: 'Character',
        cost: 3,
        power: 4000,
      }),
      'caribou',
    );

    for (let i = 0; i < 6; i++) {
      const don = host.addCardToZone(
        'p1',
        'cost',
        makeCard({
          id: `DON-${i}`,
          number: `DON-${i}`,
          name: `DON!! ${i}`,
          type: 'DON!!',
        }),
        `don-${i}`,
      );
      don.rested = true;
    }

    engine.reapplyContinuousEffects();

    expect(caribou.power).toBe(5000);
  });

  it('OP07-023 Caribou: condition not met with 5 rested DON!!', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op07EffectDefinitions]),
      host,
    );

    const caribou = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP07-023',
        number: 'OP07-023',
        name: 'Caribou 023',
        type: 'Character',
        cost: 3,
        power: 4000,
      }),
      'caribou',
    );

    for (let i = 0; i < 5; i++) {
      const don = host.addCardToZone(
        'p1',
        'cost',
        makeCard({
          id: `DON-${i}`,
          number: `DON-${i}`,
          name: `DON!! ${i}`,
          type: 'DON!!',
        }),
        `don-${i}`,
      );
      don.rested = true;
    }

    engine.reapplyContinuousEffects();

    expect(caribou.power).toBe(4000);
  });

  it('OP07-066 Tony Tony Chopper: [On Play] adds DON!! when opponent has more', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op07EffectDefinitions]),
      host,
    );

    host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP07-066',
        number: 'OP07-066',
        name: 'Tony Tony Chopper 066',
        type: 'Character',
        cost: 3,
      }),
      'chopper',
    );

    for (let i = 0; i < 2; i++) {
      host.addCardToZone(
        'p1',
        'cost',
        makeCard({
          id: `DON-P1-${i}`,
          number: `DON-P1-${i}`,
          name: `DON!! ${i}`,
          type: 'DON!!',
        }),
        `don-p1-${i}`,
      );
    }

    for (let i = 0; i < 5; i++) {
      host.addCardToZone(
        'p2',
        'cost',
        makeCard({
          id: `DON-P2-${i}`,
          number: `DON-P2-${i}`,
          name: `DON!! ${i}`,
          type: 'DON!!',
        }),
        `don-p2-${i}`,
      );
    }

    for (let i = 0; i < 10; i++) {
      host.addCardToZone(
        'p1',
        'donDeck',
        makeCard({
          id: `DON-DECK-${i}`,
          number: `DON-DECK-${i}`,
          name: `DON!! Deck ${i}`,
          type: 'DON!!',
        }),
        `don-deck-${i}`,
      );
    }

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: 'p1:chopper',
      sourceCardId: 'OP07-066',
    });

    expect(host.getPlayer('p1')?.zones.cost).toHaveLength(3);
  });

  it('OP07-066 condition not met when player has more DON!!', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op07EffectDefinitions]),
      host,
    );

    host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP07-066',
        number: 'OP07-066',
        name: 'Tony Tony Chopper 066',
        type: 'Character',
        cost: 3,
      }),
      'chopper',
    );

    for (let i = 0; i < 5; i++) {
      host.addCardToZone(
        'p1',
        'cost',
        makeCard({
          id: `DON-P1-${i}`,
          number: `DON-P1-${i}`,
          name: `DON!! ${i}`,
          type: 'DON!!',
        }),
        `don-p1-${i}`,
      );
    }

    for (let i = 0; i < 2; i++) {
      host.addCardToZone(
        'p2',
        'cost',
        makeCard({
          id: `DON-P2-${i}`,
          number: `DON-P2-${i}`,
          name: `DON!! ${i}`,
          type: 'DON!!',
        }),
        `don-p2-${i}`,
      );
    }

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: 'p1:chopper',
      sourceCardId: 'OP07-066',
    });

    expect(host.getPlayer('p1')?.zones.cost).toHaveLength(5);
  });

  it('OP07-109 Monkey.D.Luffy: [Trigger] KOs a cost 4 or less character', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op07EffectDefinitions]),
      host,
    );

    host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP07-109',
        number: 'OP07-109',
        name: 'Monkey.D.Luffy 109',
        type: 'Event',
      }),
      'luffy',
    );

    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OPP-TARGET',
        number: 'OPP-TARGET',
        name: 'Target',
        type: 'Character',
        cost: 3,
      }),
      'target',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: 'p1:luffy',
      sourceCardId: 'OP07-109',
    });

    const decision = engine.getPendingDecision();
    expect(decision).not.toBeNull();
    expect(decision!.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    const p2 = host.getPlayer('p2')!;
    expect(p2.zones.characters).not.toContain(target);
    expect(p2.zones.trash).toContain(target);
  });

  it('OP07-085 Stussy: [On Play] trashes own character to KO opponent', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op07EffectDefinitions]),
      host,
    );

    const stussy = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP07-085',
        number: 'OP07-085',
        name: 'Stussy',
        type: 'Character',
        cost: 4,
        power: 5000,
      }),
      'stussy',
    );

    const fodder = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'FODDER',
        number: 'FODDER',
        name: 'Fodder',
        type: 'Character',
        cost: 1,
        power: 1000,
      }),
      'fodder',
    );

    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OPP-TARGET',
        number: 'OPP-TARGET',
        name: 'Opponent Target',
        type: 'Character',
        cost: 5,
        power: 6000,
      }),
      'opp-target',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: stussy.instanceId,
      sourceCardId: stussy.cardId,
    });

    let decision = engine.getPendingDecision();
    expect(decision).not.toBeNull();
    expect(decision!.prompt.type).toBe('confirm');
    engine.answerDecision({ decisionId: decision!.id, confirmed: true });

    decision = engine.getPendingDecision();
    expect(decision).not.toBeNull();
    expect(decision!.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [fodder.instanceId],
    });

    decision = engine.getPendingDecision();
    expect(decision).not.toBeNull();
    expect(decision!.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    const p1 = host.getPlayer('p1')!;
    expect(p1.zones.characters).not.toContain(fodder);
    expect(p1.zones.trash).toContain(fodder);

    const p2 = host.getPlayer('p2')!;
    expect(p2.zones.characters).not.toContain(target);
    expect(p2.zones.trash).toContain(target);

    expect(p1.zones.characters).toContain(stussy);
  });

  it('OP07-097 Vegapunk: continuous cannotAttack on leader', () => {
    const host = new TestHost();
    host.addPlayer('p1', 'OP07-097');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op07EffectDefinitions]),
      host,
    );

    engine.reapplyContinuousEffects();

    const leader = host.getPlayer('p1')?.zones.leader;
    expect(leader).toBeDefined();
    expect(leader!.cannotAttack).toBe(true);
  });

  it('OP07-030 Pappag: gains Blocker when Camie is on the field', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op07EffectDefinitions]),
      host,
    );

    host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'CAMIE',
        number: 'CAMIE',
        name: 'Camie',
        type: 'Character',
        cost: 2,
      }),
      'camie',
    );

    const pappag = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP07-030',
        number: 'OP07-030',
        name: 'Pappag',
        type: 'Character',
        cost: 1,
      }),
      'pappag',
    );

    engine.reapplyContinuousEffects();

    expect(pappag.mustBeAttackTarget).toBe(true);
  });

  it('OP07-030 Pappag: loses Blocker when Camie leaves the field', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op07EffectDefinitions]),
      host,
    );

    const camie = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'CAMIE',
        number: 'CAMIE',
        name: 'Camie',
        type: 'Character',
        cost: 2,
      }),
      'camie',
    );

    const pappag = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP07-030',
        number: 'OP07-030',
        name: 'Pappag',
        type: 'Character',
        cost: 1,
      }),
      'pappag',
    );

    engine.reapplyContinuousEffects();
    expect(pappag.mustBeAttackTarget).toBe(true);

    host.moveCard(camie, 'p1', 'trash');

    engine.reapplyContinuousEffects();
    expect(pappag.mustBeAttackTarget).toBe(false);
  });

  it('OP07-021 Urouge: [End of Your Turn] rest active up to 1 rested DON!!', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op07EffectDefinitions]),
      host,
    );

    host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP07-021',
        number: 'OP07-021',
        name: 'Urouge',
        type: 'Character',
        cost: 3,
      }),
      'urouge',
    );

    const restedDon = host.addCardToZone(
      'p1',
      'cost',
      makeCard({
        id: 'DON-RESTED',
        number: 'DON-RESTED',
        name: 'DON!!',
        type: 'DON!!',
      }),
      'don-rested',
    );
    restedDon.rested = true;

    const activeDon = host.addCardToZone(
      'p1',
      'cost',
      makeCard({
        id: 'DON-ACTIVE',
        number: 'DON-ACTIVE',
        name: 'DON!! Active',
        type: 'DON!!',
      }),
      'don-active',
    );
    activeDon.rested = false;

    expect(
      host.getPlayer('p1')?.zones.cost.filter((d) => d.rested),
    ).toHaveLength(1);

    engine.handleEvent({
      type: 'onTurnEnd',
      playerSessionId: 'p1',
      sourceInstanceId: 'p1:urouge',
      sourceCardId: 'OP07-021',
    });

    expect(
      host.getPlayer('p1')?.zones.cost.filter((d) => d.rested),
    ).toHaveLength(0);
  });

  it('OP07-091 Monkey.D.Luffy: [When Attacking] special-ref trashes cost ≤ 2 character', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op07EffectDefinitions], [op07091SpecialHandler]),
      host,
    );

    const luffy = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP07-091',
        number: 'OP07-091',
        name: 'Monkey.D.Luffy 091',
        type: 'Character',
        cost: 6,
        power: 7000,
        families: ['Supernovas'],
      }),
      'luffy',
    );

    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'SMALL-TARGET',
        number: 'SMALL-TARGET',
        name: 'Small Target',
        type: 'Character',
        cost: 2,
        power: 3000,
      }),
      'small-target',
    );

    host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'BIG-TARGET',
        number: 'BIG-TARGET',
        name: 'Big Target',
        type: 'Character',
        cost: 5,
        power: 6000,
      }),
      'big-target',
    );

    const trashCard1 = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'TRASH-COST4-A',
        number: 'TRASH-COST4-A',
        name: 'Trash Cost 4 A',
        type: 'Character',
        cost: 4,
        power: 5000,
      }),
      'trash-cost4-a',
    );

    const trashCard2 = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'TRASH-COST4-B',
        number: 'TRASH-COST4-B',
        name: 'Trash Cost 4 B',
        type: 'Character',
        cost: 4,
        power: 5000,
      }),
      'trash-cost4-b',
    );

    const trashCardLow = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'TRASH-COST2',
        number: 'TRASH-COST2',
        name: 'Trash Cost 2',
        type: 'Character',
        cost: 2,
        power: 2000,
      }),
      'trash-cost2',
    );

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: luffy.instanceId,
      sourceCardId: luffy.cardId,
    });

    let decision = engine.getPendingDecision();
    expect(decision).not.toBeNull();
    expect(decision!.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    const p2 = host.getPlayer('p2')!;
    expect(p2.zones.characters).not.toContain(target);

    const p1 = host.getPlayer('p1')!;
    expect(p1.zones.trash).toContain(target);

    decision = engine.getPendingDecision();
    expect(decision).not.toBeNull();
    expect(decision!.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [trashCard1.instanceId, trashCard2.instanceId],
    });

    expect(p1.zones.trash).not.toContain(trashCard1);
    expect(p1.zones.trash).not.toContain(trashCard2);
    expect(p1.zones.trash).toContain(trashCardLow);
    expect(p1.zones.deck).toContain(trashCard1);
    expect(p1.zones.deck).toContain(trashCard2);
    expect(luffy.power).toBe(7000);
  });

  it('OP07-091: power bonus when selecting ≥3 cost 4+ cards from trash', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op07EffectDefinitions], [op07091SpecialHandler]),
      host,
    );

    const luffy = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP07-091',
        number: 'OP07-091',
        name: 'Monkey.D.Luffy 091',
        type: 'Character',
        cost: 6,
        power: 7000,
        families: ['Supernovas'],
      }),
      'luffy',
    );

    host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'SMALL-TARGET',
        number: 'SMALL-TARGET',
        name: 'Small Target',
        type: 'Character',
        cost: 2,
        power: 3000,
      }),
      'small-target',
    );

    for (let i = 0; i < 3; i++) {
      host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: `TRASH-C4-${i}`,
          number: `TRASH-C4-${i}`,
          name: `Trash C4 ${i}`,
          type: 'Character',
          cost: 4,
          power: 5000,
        }),
        `trash-c4-${i}`,
      );
    }

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: luffy.instanceId,
      sourceCardId: luffy.cardId,
    });

    let decision = engine.getPendingDecision();
    expect(decision).not.toBeNull();
    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [
        host.getPlayer('p2')!.zones.characters[0].instanceId,
      ],
    });

    decision = engine.getPendingDecision();
    expect(decision).not.toBeNull();
    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: host
        .getPlayer('p1')!
        .zones.trash.filter((c) => c.cost >= 4)
        .map((c) => c.instanceId),
    });

    expect(luffy.power).toBe(7000 + Math.floor(3 / 3) * 1000);
  });
});
