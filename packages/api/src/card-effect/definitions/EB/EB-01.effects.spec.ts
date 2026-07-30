import { describe, expect, it } from '@jest/globals';
import { EffectEngine } from '../../effect-engine';
import { createRegistry, makeCard, TestHost } from '../test-utils';
import { eb01EffectDefinitions } from './EB-01.effects';

describe('EB01 effect definitions', () => {
  it('loads all EB01 cards without error', () => {
    const registry = createRegistry([eb01EffectDefinitions]);
    expect(registry.effectsByCardId).toBeDefined();
  });

  it('has correct edition ID', () => {
    expect(eb01EffectDefinitions.editionId).toBe('EB-01');
  });

  it('counts all defined cards', () => {
    expect(eb01EffectDefinitions.cards.length).toBe(55);
  });

  it('has unique effect IDs', () => {
    const allIds: string[] = [];
    for (const card of eb01EffectDefinitions.cards) {
      for (const entry of card.effects ?? []) {
        if (entry.kind === 'standard') allIds.push(entry.effect.id);
        if (entry.kind === 'continuous') allIds.push(entry.effect.id);
        if (entry.kind === 'replacement') allIds.push(entry.effect.id);
      }
    }
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it('has unique card IDs', () => {
    const cardIds = eb01EffectDefinitions.cards.map((c) => c.cardId);
    const uniqueIds = new Set(cardIds);
    expect(uniqueIds.size).toBe(cardIds.length);
  });

  it('registers special handlers for all special-ref cards', () => {
    const specialRefCards = eb01EffectDefinitions.cards.filter((c) =>
      c.effects?.some((e) => e.kind === 'special-ref'),
    );
    expect(specialRefCards.length).toBe(7);
    const handlerIds = specialRefCards.flatMap((c) =>
      (c.effects ?? [])
        .filter(
          (e): e is { kind: 'special-ref'; specialHandlerId: string } =>
            e.kind === 'special-ref',
        )
        .map((e) => e.specialHandlerId),
    );
    expect(handlerIds).toContain('eb01-001-counter-rule');
    expect(handlerIds).toContain('eb01-038-counter-redirect-attack');
    expect(handlerIds).toContain(
      'eb01-040-activate-main-life-face-up-ko-cost-0',
    );
    expect(handlerIds).toContain('eb01-052-on-play-choose-life-manipulation');
    expect(handlerIds).toContain('eb01-059-main-ko-and-trash-life-until-1');
    expect(handlerIds).toContain('eb01-060-main-play-enel-and-trash-life');
    expect(handlerIds).toContain('eb01-061-when-attacking-copy-power');
  });

  it('parses all effect types correctly', () => {
    let standardCount = 0;
    let continuousCount = 0;
    let replacementCount = 0;
    let specialRefCount = 0;

    for (const card of eb01EffectDefinitions.cards) {
      for (const entry of card.effects ?? []) {
        if (entry.kind === 'standard') standardCount++;
        else if (entry.kind === 'continuous') continuousCount++;
        else if (entry.kind === 'replacement') replacementCount++;
        else if (entry.kind === 'special-ref') specialRefCount++;
      }
    }

    expect(standardCount).toBeGreaterThan(0);
    expect(specialRefCount).toBe(7);
  });

  it('has all standard effects with valid trigger types', () => {
    for (const card of eb01EffectDefinitions.cards) {
      for (const entry of card.effects ?? []) {
        if (entry.kind === 'standard') {
          expect(entry.effect.trigger.type).toBeDefined();
          expect(entry.effect.actions.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('has all continuous effects with modifier', () => {
    for (const card of eb01EffectDefinitions.cards) {
      for (const entry of card.effects ?? []) {
        if (entry.kind === 'continuous') {
          expect(entry.effect.modifier).toBeDefined();
          expect(entry.effect.modifier.selector).toBeDefined();
        }
      }
    }
  });
});

describe('EB01 behavioral tests', () => {
  it('EB01-015 Apoo: [On Play] rests opponent character with cost 2 or less', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');

    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'CH-001',
        number: 'CH-001',
        name: 'Target',
        type: 'Character',
        cost: 2,
        power: 3000,
      }),
      'target',
    );

    const apoo = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'EB01-015',
        number: 'EB01-015',
        name: 'Scratchmen Apoo',
        type: 'Character',
        cost: 3,
        power: 4000,
      }),
      'apoo',
    );

    const registry = createRegistry([eb01EffectDefinitions]);
    const engine = new EffectEngine(registry, host);

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: apoo.instanceId,
      sourceCardId: 'EB01-015',
    });

    const targetCard = host.getCard(target.instanceId);
    expect(targetCard?.rested).toBe(true);
  });

  it('EB01-022 Inazuma: [End of Your Turn] draws 2 cards if hand <= 2', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');

    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'D1',
        number: 'D1',
        name: 'Card 1',
        type: 'Character',
        cost: 1,
        power: 1000,
      }),
      'deck1',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'D2',
        number: 'D2',
        name: 'Card 2',
        type: 'Character',
        cost: 1,
        power: 1000,
      }),
      'deck2',
    );

    host.getPlayer('p1')!.zones.hand = [];

    const inazuma = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'EB01-022',
        number: 'EB01-022',
        name: 'Inazuma',
        type: 'Character',
        cost: 3,
        power: 4000,
      }),
      'inazuma',
    );

    const registry = createRegistry([eb01EffectDefinitions]);
    const engine = new EffectEngine(registry, host);

    engine.handleEvent({
      type: 'onTurnEnd',
      playerSessionId: 'p1',
      sourceInstanceId: inazuma.instanceId,
      sourceCardId: 'EB01-022',
    });

    expect(host.getPlayer('p1')!.zones.hand.length).toBe(2);
  });

  it('EB01-021 Hannyabal: declining the optional end-step effect leaves state unchanged', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');

    host.addCardToZone(
      'p1',
      'donDeck',
      makeCard({
        id: 'DON-1',
        number: 'DON-1',
        name: 'DON!!',
        type: 'DON!!',
        cost: null,
        power: null,
        counter: null,
      }),
      'don-1',
    );

    const target = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'IMP-1',
        number: 'IMP-1',
        name: 'Impel Down Target',
        type: 'Character',
        cost: 2,
        power: 2000,
        families: ['Impel Down'],
      }),
      'impel-down-target',
    );

    const hannyabal = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'EB01-021',
        number: 'EB01-021',
        name: 'Hannyabal',
        type: 'Character',
        cost: 4,
        power: 5000,
      }),
      'hannyabal',
    );

    const registry = createRegistry([eb01EffectDefinitions]);
    const engine = new EffectEngine(registry, host);

    engine.handleEvent({
      type: 'onTurnEnd',
      playerSessionId: 'p1',
      sourceInstanceId: hannyabal.instanceId,
      sourceCardId: 'EB01-021',
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('confirm');

    engine.answerDecision({
      decisionId: decision!.id,
      confirmed: false,
    });

    expect(engine.getPendingDecision()).toBeNull();
    expect(host.getPlayer('p1')!.zones.characters.some(card => card.instanceId === target.instanceId)).toBe(true);
    expect(host.getPlayer('p1')!.zones.hand).toHaveLength(0);
    expect(host.getPlayer('p1')!.zones.cost).toHaveLength(0);
  });

  it("EB01-021 Hannyabal: does not prompt during the opponent's end step", () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');

    host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'EB01-021',
        number: 'EB01-021',
        name: 'Hannyabal',
        type: 'Character',
        cost: 4,
        power: 5000,
      }),
      'hannyabal',
    );

    const registry = createRegistry([eb01EffectDefinitions]);
    const engine = new EffectEngine(registry, host);

    engine.handleEvent({
      type: 'onTurnEnd',
      playerSessionId: 'p2',
      sourceInstanceId: 'foreign-turn-window',
      sourceCardId: 'TURN-WINDOW',
    });

    expect(engine.getPendingDecision()).toBeNull();
  });

  it('EB01-021 Hannyabal: confirming the effect prompts for an Impel Down character and adds active DON!!', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');

    host.addCardToZone(
      'p1',
      'donDeck',
      makeCard({
        id: 'DON-1',
        number: 'DON-1',
        name: 'DON!!',
        type: 'DON!!',
        cost: null,
        power: null,
        counter: null,
      }),
      'don-1',
    );

    const validTarget = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'IMP-1',
        number: 'IMP-1',
        name: 'Impel Down Target',
        type: 'Character',
        cost: 2,
        power: 2000,
        families: ['Impel Down'],
      }),
      'impel-down-target',
    );

    const secondValidTarget = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'IMP-2',
        number: 'IMP-2',
        name: 'Second Impel Down Target',
        type: 'Character',
        cost: 3,
        power: 3000,
        families: ['Impel Down'],
      }),
      'second-impel-down-target',
    );

    host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'NAVY-1',
        number: 'NAVY-1',
        name: 'Invalid Target',
        type: 'Character',
        cost: 4,
        power: 3000,
        families: ['Navy'],
      }),
      'invalid-target',
    );

    const hannyabal = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'EB01-021',
        number: 'EB01-021',
        name: 'Hannyabal',
        type: 'Character',
        cost: 4,
        power: 5000,
      }),
      'hannyabal',
    );

    const registry = createRegistry([eb01EffectDefinitions]);
    const engine = new EffectEngine(registry, host);

    engine.handleEvent({
      type: 'onTurnEnd',
      playerSessionId: 'p1',
      sourceInstanceId: hannyabal.instanceId,
      sourceCardId: 'EB01-021',
    });

    const confirmDecision = engine.getPendingDecision();
    expect(confirmDecision?.prompt.type).toBe('confirm');

    engine.answerDecision({
      decisionId: confirmDecision!.id,
      confirmed: true,
    });

    const selectDecision = engine.getPendingDecision();
    expect(selectDecision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: selectDecision!.id,
      selectedCardInstanceIds: [validTarget.instanceId],
    });

    expect(engine.getPendingDecision()).toBeNull();
    expect(host.getPlayer('p1')!.zones.characters.some(card => card.instanceId === validTarget.instanceId)).toBe(false);
    expect(host.getPlayer('p1')!.zones.characters.some(card => card.instanceId === secondValidTarget.instanceId)).toBe(true);
    expect(host.getPlayer('p1')!.zones.hand.some(card => card.instanceId === validTarget.instanceId)).toBe(true);
    expect(host.getPlayer('p1')!.zones.cost).toHaveLength(1);
    expect(host.getPlayer('p1')!.zones.cost[0]?.rested).toBe(false);
  });

  it('EB01-023: [On Play] draws 1 card (EB01-023 Weevil)', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');

    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'D1',
        number: 'D1',
        name: 'Drawn',
        type: 'Character',
        cost: 1,
        power: 1000,
      }),
      'deck1',
    );

    const weevil = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'EB01-023',
        number: 'EB01-023',
        name: 'Edward Weevil',
        type: 'Character',
        cost: 4,
        power: 5000,
      }),
      'weevil',
    );

    const registry = createRegistry([eb01EffectDefinitions]);
    const engine = new EffectEngine(registry, host);

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: weevil.instanceId,
      sourceCardId: 'EB01-023',
    });

    expect(host.getPlayer('p1')!.zones.hand.length).toBe(1);
  });
});
