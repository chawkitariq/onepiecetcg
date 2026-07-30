import { describe, expect, it } from '@jest/globals';
import type { CardEffectDefinition } from '@onepiecetcg/shared';
import type {
  EffectRegistry,
  SpecialHandlerDefinition,
} from '../types/effect-registry';
import { buildEffectIndexes } from '../effect-indexes';
import { st13EffectDefinitions } from './ST-13.effects';
import { specialHandlerDefinitions } from './special';
import { EffectEngine } from '../effect-engine';
import {
  type TestHost,
  createRegistry as testUtilsCreateRegistry,
  makeCard,
} from './test-utils';

const createRegistry = (
  specialHandlers: readonly SpecialHandlerDefinition[] = [],
): EffectRegistry => {
  const effectsByCardId: Record<string, CardEffectDefinition> = {};
  const specialHandlersByCardId: Record<string, SpecialHandlerDefinition> = {};

  for (const card of st13EffectDefinitions.cards) {
    const resolved: CardEffectDefinition = { cardId: card.cardId };

    for (const entry of card.effects ?? []) {
      switch (entry.kind) {
        case 'standard':
          resolved.standard = [...(resolved.standard ?? []), entry.effect];
          break;
        case 'continuous':
          resolved.continuous = [...(resolved.continuous ?? []), entry.effect];
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

describe('ST13 effect definitions', () => {
  it('loads all ST13 cards without error', () => {
    const registry = createRegistry(specialHandlerDefinitions);
    const cards = st13EffectDefinitions.cards;

    expect(cards.length).toBeGreaterThan(0);

    for (const card of cards) {
      const resolved = registry.effectsByCardId[card.cardId];
      expect(resolved).toBeDefined();
      expect(resolved.cardId).toBe(card.cardId);
    }
  });

  it('has correct edition ID', () => {
    expect(st13EffectDefinitions.editionId).toBe('ST13');
  });

  it('counts all 19 ST13 cards', () => {
    expect(st13EffectDefinitions.cards.length).toBe(19);
  });

  it('has unique effect IDs', () => {
    const allIds: string[] = [];

    for (const card of st13EffectDefinitions.cards) {
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
    const cardIds = st13EffectDefinitions.cards.map((c) => c.cardId);
    const uniqueIds = new Set(cardIds);
    expect(uniqueIds.size).toBe(cardIds.length);
  });

  it('registers special handlers for all special-ref cards', () => {
    const specialRefIds: string[] = [];

    for (const card of st13EffectDefinitions.cards) {
      for (const entry of card.effects ?? []) {
        if (entry.kind === 'special-ref') {
          specialRefIds.push(entry.specialHandlerId);
        }
      }
    }

    expect(specialRefIds).toHaveLength(9);
    expect(specialRefIds).toContain('st13-002-special');
    expect(specialRefIds).toContain('st13-003-special');
    expect(specialRefIds).toContain('st13-004-special');
    expect(specialRefIds).toContain('st13-007-special');
    expect(specialRefIds).toContain('st13-009-special');
    expect(specialRefIds).toContain('st13-010-special');
    expect(specialRefIds).toContain('st13-012-special');
    expect(specialRefIds).toContain('st13-014-special');
    expect(specialRefIds).toContain('st13-016-special');
  });

  it('parses all effect types correctly', () => {
    let standardCount = 0;
    let continuousCount = 0;
    let replacementCount = 0;
    let specialRefCount = 0;

    for (const card of st13EffectDefinitions.cards) {
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
    expect(continuousCount).toBe(1);
    expect(replacementCount).toBe(0);
    expect(specialRefCount).toBe(9);
  });

  it('every card has an effects array', () => {
    for (const card of st13EffectDefinitions.cards) {
      expect(card.effects).toBeDefined();
      expect(card.effects!.length).toBeGreaterThan(0);
    }
  });

  it('all standard effects have triggers', () => {
    const registry = createRegistry(specialHandlerDefinitions);

    for (const [, def] of Object.entries(registry.effectsByCardId)) {
      for (const std of def.standard ?? []) {
        expect(std.trigger).toBeDefined();
        expect(std.trigger.type).toBeTruthy();
      }
    }
  });

  it('validates ST13-005 cost/action life manipulation structure', () => {
    const registry = createRegistry(specialHandlerDefinitions);
    const ivankov = registry.effectsByCardId['ST13-005'];
    expect(ivankov).toBeDefined();
    expect(ivankov.standard).toHaveLength(1);
    const cost = ivankov.standard![0].costs![0];
    expect(cost.type).toBe('moveCard');
    const action = ivankov.standard![0].actions[0];
    expect(action.type).toBe('moveCard');
  });

  it('validates ST13-006 play multiple distinct characters', () => {
    const registry = createRegistry(specialHandlerDefinitions);
    const dadan = registry.effectsByCardId['ST13-006'];
    expect(dadan).toBeDefined();
    expect(dadan.standard).toHaveLength(1);
    const playAction = dadan.standard![0].actions[0];
    expect(playAction.type).toBe('play');
    if (playAction.type === 'play') {
      expect(playAction.selector.distinctBy).toBe('name');
      expect(playAction.selector.filter?.name).toContain('Sabo');
      expect(playAction.selector.filter?.name).toContain('Portgas.D.Ace');
      expect(playAction.selector.filter?.name).toContain('Monkey.D.Luffy');
    }
  });

  it('validates ST13-008 cost-from-life KO structure', () => {
    const registry = createRegistry(specialHandlerDefinitions);
    const sabo = registry.effectsByCardId['ST13-008'];
    expect(sabo).toBeDefined();
    expect(sabo.standard).toHaveLength(1);
    const cost = sabo.standard![0].costs![0];
    expect(cost.type).toBe('moveCard');
    if (cost.type === 'moveCard') {
      expect(cost.selector.filter?.zonePosition).toBe('topOrBottom');
      expect(cost.destinationZone).toBe('trash');
    }
  });

  it('validates ST13-011 conditional Rush', () => {
    const registry = createRegistry(specialHandlerDefinitions);
    const ace = registry.effectsByCardId['ST13-011'];
    expect(ace).toBeDefined();
    expect(ace.standard).toHaveLength(1);
    const condition = ace.standard![0].conditions![0];
    expect(condition.type).toBe('playerHasLifeAtMost');
    if (condition.type === 'playerHasLifeAtMost') {
      expect(condition.value).toBe(2);
    }
    const action = ace.standard![0].actions[0];
    expect(action.type).toBe('grantKeywords');
  });

  it('validates ST13-013 search effect structure', () => {
    const registry = createRegistry(specialHandlerDefinitions);
    const garp = registry.effectsByCardId['ST13-013'];
    expect(garp).toBeDefined();
    expect(garp.standard).toHaveLength(1);
    const searchAction = garp.standard![0].actions[0];
    expect(searchAction.type).toBe('search');
    if (searchAction.type === 'search') {
      expect(searchAction.sourceZone).toBe('deck');
      expect(searchAction.amount).toBe(5);
      expect(searchAction.filter.name).toContain('Sabo');
    }
  });

  it('validates ST13-015 conditional draw-and-trash-life', () => {
    const registry = createRegistry(specialHandlerDefinitions);
    const luffy = registry.effectsByCardId['ST13-015'];
    expect(luffy).toBeDefined();
    expect(luffy.standard).toHaveLength(1);
    expect(luffy.standard![0].trigger.oncePerTurn).toBe(true);
    const ifAction = luffy.standard![0].actions[1];
    expect(ifAction.type).toBe('ifConditionsMatch');
    if (ifAction.type === 'ifConditionsMatch') {
      expect(ifAction.actions).toHaveLength(2);
      expect(ifAction.actions[0].type).toBe('draw');
      expect(ifAction.actions[1].type).toBe('moveCard');
    }
  });

  it('validates ST13-016 Rush continuous effect', () => {
    const registry = createRegistry(specialHandlerDefinitions);
    const yamato = registry.effectsByCardId['ST13-016'];
    expect(yamato).toBeDefined();
    expect(yamato.continuous).toHaveLength(1);
    expect(yamato.continuous![0].modifier.keywords).toContain('rush');
  });

  it('validates ST13-017 has counter and trigger effects', () => {
    const registry = createRegistry(specialHandlerDefinitions);
    const dragon = registry.effectsByCardId['ST13-017'];
    expect(dragon).toBeDefined();
    expect(dragon.standard).toHaveLength(2);
    const counterEffect = dragon.standard![0];
    expect(counterEffect.trigger.type).toBe('activateCounter');
    const triggerEffect = dragon.standard![1];
    expect(triggerEffect.trigger.type).toBe('trigger');
  });

  it('validates ST13-018 has conditional draw in counter', () => {
    const registry = createRegistry(specialHandlerDefinitions);
    const jetSpear = registry.effectsByCardId['ST13-018'];
    expect(jetSpear).toBeDefined();
    expect(jetSpear.standard).toHaveLength(2);
    const ifAction = jetSpear.standard![0].actions[1];
    expect(ifAction.type).toBe('ifConditionsMatch');
    if (ifAction.type === 'ifConditionsMatch') {
      expect(ifAction.conditions[0].type).toBe('playerHasLifeAtMost');
      if (ifAction.conditions[0].type === 'playerHasLifeAtMost') {
        expect(ifAction.conditions[0].value).toBe(0);
      }
    }
  });

  it('validates ST13-019 trigger activates main effect', () => {
    const registry = createRegistry(specialHandlerDefinitions);
    const bond = registry.effectsByCardId['ST13-019'];
    expect(bond).toBeDefined();
    expect(bond.standard).toHaveLength(2);
    const triggerAction = bond.standard![1].actions[0];
    expect(triggerAction.type).toBe('activateEffect');
    if (triggerAction.type === 'activateEffect') {
      expect(triggerAction.cardId).toBe('ST13-019');
      expect(triggerAction.effectId).toBe('st13-019-main-search');
    }
  });
});

describe('ST13 behavioral tests', () => {
  it('ST13-005 Emporio.Ivankov on play: trashes life and adds character to life face-down', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      testUtilsCreateRegistry(
        [st13EffectDefinitions],
        specialHandlerDefinitions,
      ),
      host,
    );
    host.addCardToZone(
      'p1',
      'life',
      makeCard({
        id: 'L1',
        number: 'L1',
        name: 'Life Card',
        type: 'Character',
      }),
      'life-card',
    );
    const toAdd = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'C1',
        number: 'C1',
        name: 'Ivankov Recruit',
        type: 'Character',
        cost: 5,
      }),
      'to-add',
    );
    const ivankov = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ST13-005',
        number: 'ST13-005',
        name: 'Emporio.Ivankov',
        type: 'Character',
        cost: 3,
      }),
      'ivankov',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: ivankov.instanceId,
      sourceCardId: ivankov.cardId,
    });

    // Cost: moveCard life -> trash. The selectCards prompt appears for the cost.
    let decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [host.getPlayer('p1')!.zones.life[0].instanceId],
    });

    // Action: moveCard hand -> life face-down
    decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [toAdd.instanceId],
    });

    expect(host.getPlayer('p1')!.zones.trash).toHaveLength(1);
    expect(host.getPlayer('p1')!.zones.life).toHaveLength(1);
    expect(host.getPlayer('p1')!.zones.hand).not.toContain(toAdd);
  });

  it('ST13-006 Curly.Dadan on play: plays up to 3 named characters cost 2', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      testUtilsCreateRegistry(
        [st13EffectDefinitions],
        specialHandlerDefinitions,
      ),
      host,
    );

    const sabo = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'S1',
        number: 'S1',
        name: 'Sabo',
        type: 'Character',
        cost: 2,
      }),
      'sabo',
    );
    const ace = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'A1',
        number: 'A1',
        name: 'Portgas.D.Ace',
        type: 'Character',
        cost: 2,
      }),
      'ace',
    );
    const luffy = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'L1',
        number: 'L1',
        name: 'Monkey.D.Luffy',
        type: 'Character',
        cost: 2,
      }),
      'luffy',
    );
    const dadan = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ST13-006',
        number: 'ST13-006',
        name: 'Curly.Dadan',
        type: 'Character',
        cost: 5,
      }),
      'dadan',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: dadan.instanceId,
      sourceCardId: dadan.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [
        sabo.instanceId,
        ace.instanceId,
        luffy.instanceId,
      ],
    });

    expect(host.getPlayer('p1')!.zones.characters).toContain(sabo);
    expect(host.getPlayer('p1')!.zones.characters).toContain(ace);
    expect(host.getPlayer('p1')!.zones.characters).toContain(luffy);
    expect(host.getPlayer('p1')!.zones.hand).toHaveLength(0);
  });

  it('ST13-008 Sabo on play: trashes life and K.O.s cost 5 or less', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      testUtilsCreateRegistry(
        [st13EffectDefinitions],
        specialHandlerDefinitions,
      ),
      host,
    );

    host.addCardToZone(
      'p1',
      'life',
      makeCard({ id: 'L1', number: 'L1', name: 'Life Card', type: 'Event' }),
      'life-card',
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
      }),
      'target',
    );
    const sabo = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ST13-008',
        number: 'ST13-008',
        name: 'Sabo',
        type: 'Character',
        cost: 5,
      }),
      'sabo',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: sabo.instanceId,
      sourceCardId: sabo.cardId,
    });

    // Cost: moveCard life -> trash
    let decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    const lifeCard = host.getPlayer('p1')!.zones.life[0];
    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [lifeCard.instanceId],
    });

    // Action: KO opponent character cost 5 or less
    decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(host.getPlayer('p1')!.zones.trash).toContain(lifeCard);
    expect(host.getPlayer('p2')!.zones.trash).toContain(target);
  });

  it('ST13-013 Monkey.D.Garp on play: searches deck for Sabo/Ace/Luffy', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      testUtilsCreateRegistry(
        [st13EffectDefinitions],
        specialHandlerDefinitions,
      ),
      host,
    );

    const found = host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'S1',
        number: 'S1',
        name: 'Sabo',
        type: 'Character',
        cost: 4,
      }),
      'found',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'O1',
        number: 'O1',
        name: 'Other',
        type: 'Character',
        cost: 3,
      }),
      'other',
    );
    const garp = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ST13-013',
        number: 'ST13-013',
        name: 'Monkey.D.Garp',
        type: 'Character',
        cost: 1,
      }),
      'garp',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: garp.instanceId,
      sourceCardId: garp.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [found.instanceId],
    });

    expect(host.getPlayer('p1')!.zones.hand).toContain(found);
  });

  it('ST13-019 The Three Brothers Bond trigger activates main effect', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      testUtilsCreateRegistry(
        [st13EffectDefinitions],
        specialHandlerDefinitions,
      ),
      host,
    );

    const found = host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'L1',
        number: 'L1',
        name: 'Monkey.D.Luffy',
        type: 'Character',
        cost: 5,
      }),
      'found',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'O1',
        number: 'O1',
        name: 'Other',
        type: 'Character',
        cost: 1,
      }),
      'other',
    );

    const bond = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'ST13-019',
        number: 'ST13-019',
        name: "The Three Brothers' Bond",
        type: 'Event',
        cost: 1,
      }),
      'bond',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: bond.instanceId,
      sourceCardId: bond.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [found.instanceId],
    });

    expect(host.getPlayer('p1')!.zones.hand).toContain(found);
  });
});
