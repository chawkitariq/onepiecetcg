import { describe, expect, it } from '@jest/globals';
import { type Card, type CardEffectDefinition } from '@onepiecetcg/shared';
import type {
  EffectRegistry,
  SpecialHandlerDefinition,
} from '../../types/effect-registry';
import { buildEffectIndexes } from '../../effect-indexes';
import { EffectEngine } from '../../effect-engine';
import { st15EffectDefinitions } from './ST-15.effects';
import { specialHandlerDefinitions } from '..';
import {
  makeCard,
  TestHost,
  createRegistry as testUtilsCreateRegistry,
} from '../test-utils';

const createRegistry = (
  specialHandlers: readonly SpecialHandlerDefinition[] = [],
): EffectRegistry => {
  const effectsByCardId: Record<string, CardEffectDefinition> = {};
  const specialHandlersByCardId: Record<string, SpecialHandlerDefinition> = {};

  for (const card of st15EffectDefinitions.cards) {
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

describe('ST15 effect definitions', () => {
  it('loads all ST15 cards without error', () => {
    const registry = createRegistry();
    const cards = st15EffectDefinitions.cards;

    expect(cards.length).toBeGreaterThan(0);

    for (const card of cards) {
      const resolved = registry.effectsByCardId[card.cardId];
      expect(resolved).toBeDefined();
      expect(resolved.cardId).toBe(card.cardId);
    }
  });

  it('has correct edition ID', () => {
    expect(st15EffectDefinitions.editionId).toBe('ST15');
  });

  it('counts all defined cards', () => {
    const allCards = st15EffectDefinitions.cards;
    expect(allCards.length).toBe(5);

    const withEffects = allCards.filter(
      (c) => c.effects && c.effects.length > 0,
    );
    expect(withEffects.length).toBe(5);
  });

  it('has unique effect IDs', () => {
    const allIds: string[] = [];

    for (const card of st15EffectDefinitions.cards) {
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
    const cardIds = st15EffectDefinitions.cards.map((c) => c.cardId);
    const uniqueIds = new Set(cardIds);
    expect(uniqueIds.size).toBe(cardIds.length);
  });

  it('parses all effect types correctly', () => {
    let standardCount = 0;
    let continuousCount = 0;
    let replacementCount = 0;
    let specialRefCount = 0;

    for (const card of st15EffectDefinitions.cards) {
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

    expect(standardCount).toBe(5);
    expect(continuousCount).toBe(1);
    expect(replacementCount).toBe(1);
    expect(specialRefCount).toBe(0);
  });

  it('validates all standard effects have triggers', () => {
    const registry = createRegistry();

    for (const [_cardId, def] of Object.entries(registry.effectsByCardId)) {
      for (const std of def.standard ?? []) {
        expect(std.trigger).toBeDefined();
        expect(std.trigger.type).toBeTruthy();
      }
    }
  });

  it('validates Atmos (ST15-001) uses preventOwnEffectLifeToHand', () => {
    const resolved = createRegistry();
    const atmos = resolved.effectsByCardId['ST15-001'];
    expect(atmos).toBeDefined();
    expect(atmos.standard).toHaveLength(1);
    expect(atmos.standard![0].trigger.type).toBe('whenAttacking');
    expect(atmos.standard![0].conditions).toHaveLength(1);
    expect(atmos.standard![0].conditions![0].type).toBe('playerHasLeaderName');
    expect(atmos.standard![0].actions).toHaveLength(1);
    const action = atmos.standard![0].actions[0];
    expect(action.type).toBe('preventOwnEffectLifeToHand');
    expect(atmos.continuous).toBeUndefined();
    expect(atmos.replacements).toBeUndefined();
  });

  it('validates Edward.Newgate (ST15-002) has onPlay attachDon and activateMain ko', () => {
    const resolved = createRegistry();
    const edward = resolved.effectsByCardId['ST15-002'];
    expect(edward).toBeDefined();
    expect(edward.standard).toHaveLength(2);

    const onPlay = edward.standard![0];
    expect(onPlay.trigger.type).toBe('onPlay');
    expect(onPlay.actions).toHaveLength(1);
    expect(onPlay.actions[0].type).toBe('attachDon');

    const activateMain = edward.standard![1];
    expect(activateMain.trigger.type).toBe('activateMain');
    const koAction = activateMain.actions[0];
    expect(koAction.type).toBe('ko');
    if (koAction.type === 'ko') {
      expect(koAction.reason).toBe('effect');
    }
  });

  it('validates Kingdew (ST15-003) onKo trigger with controllerTurn false', () => {
    const resolved = createRegistry();
    const kingdew = resolved.effectsByCardId['ST15-003'];
    expect(kingdew).toBeDefined();
    expect(kingdew.standard).toHaveLength(1);
    expect(kingdew.standard![0].trigger.type).toBe('onKo');
    expect(kingdew.standard![0].conditions).toHaveLength(2);
    const hasControllerTurnFalse = kingdew.standard![0].conditions!.some(
      (c) => c.type === 'controllerTurn' && 'value' in c && c.value === false,
    );
    expect(hasControllerTurnFalse).toBe(true);
    const hasEventReasonEffect = kingdew.standard![0].conditions!.some(
      (c) => c.type === 'eventReasonIs' && 'value' in c && c.value === 'effect',
    );
    expect(hasEventReasonEffect).toBe(true);
  });

  it('validates Thatch (ST15-004) onPlay with leader trait condition', () => {
    const resolved = createRegistry();
    const thatch = resolved.effectsByCardId['ST15-004'];
    expect(thatch).toBeDefined();
    expect(thatch.standard).toHaveLength(1);
    expect(thatch.standard![0].trigger.type).toBe('onPlay');
    expect(thatch.standard![0].conditions).toHaveLength(1);
    expect(thatch.standard![0].conditions![0].type).toBe(
      'playerHasLeaderTrait',
    );
    expect(thatch.standard![0].actions).toHaveLength(2);
    expect(thatch.standard![0].actions[0].type).toBe('modifyPower');
    expect(thatch.standard![0].actions[1].type).toBe('moveCard');
  });

  it('validates Ace (ST15-005) has continuous rush and replacement protection', () => {
    const resolved = createRegistry();
    const ace = resolved.effectsByCardId['ST15-005'];
    expect(ace).toBeDefined();
    expect(ace.continuous).toHaveLength(1);
    expect(ace.continuous![0].modifier.keywords).toContain('rush');
    expect(ace.replacements).toHaveLength(1);
    expect(ace.replacements![0].event).toBe('wouldKoCharacter');
    expect(ace.replacements![0].optional).toBe(true);
    expect(ace.replacements![0].oncePerTurn).toBe(true);
    expect(ace.replacements![0].conditions).toBeUndefined();
  });
});

describe('ST15 behavioral tests', () => {
  it('Atmos (ST15-001) when attacking with Edward.Newgate leader prevents life to hand', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    const p1Leader = host.getPlayer('p1')!.zones.leader;
    p1Leader.cardId = 'L-EDWARD';
    p1Leader.name = 'Edward.Newgate';
    host.addPlayer('p2');
    const engine = new EffectEngine(
      testUtilsCreateRegistry([st15EffectDefinitions]),
      host,
    );
    const atmos = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ST15-001',
        number: 'ST15-001',
        name: 'Atmos',
        type: 'Character',
        cost: 4,
        power: 5000,
      }),
      'atmos',
    );

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: atmos.instanceId,
      sourceCardId: atmos.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision).toBeNull();
  });

  it('Atmos (ST15-001) does nothing if leader is not Edward.Newgate', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    const p1Leader = host.getPlayer('p1')!.zones.leader;
    p1Leader.cardId = 'L-OTHER';
    p1Leader.name = 'Monkey.D.Luffy';
    host.addPlayer('p2');
    const engine = new EffectEngine(
      testUtilsCreateRegistry([st15EffectDefinitions]),
      host,
    );
    const atmos = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ST15-001',
        number: 'ST15-001',
        name: 'Atmos',
        type: 'Character',
        cost: 4,
        power: 5000,
      }),
      'atmos',
    );

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: atmos.instanceId,
      sourceCardId: atmos.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision).toBeNull();
  });

  it('Edward.Newgate (ST15-002) on play attaches rested DON!!', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.getPlayer('p1')!.zones.leader.cardId = 'L-EDWARD';
    host.addPlayer('p2');
    ensureDonDeck(host, 'p1', 3);
    host.addDonToCost('p1', 2, true);
    const engine = new EffectEngine(
      testUtilsCreateRegistry([st15EffectDefinitions]),
      host,
    );
    const edward = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ST15-002',
        number: 'ST15-002',
        name: 'Edward.Newgate',
        type: 'Character',
        cost: 7,
        power: 8000,
      }),
      'edward',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: edward.instanceId,
      sourceCardId: edward.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    const leader = host.getPlayer('p1')!.zones.leader;
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [leader.instanceId],
    });

    expect(leader.attachedDon).toBe(1);
  });

  it('Edward.Newgate (ST15-002) activate main rests self and KOs 5000 or less', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.getPlayer('p1')!.zones.leader.cardId = 'L-EDWARD';
    host.addPlayer('p2');
    const engine = new EffectEngine(
      testUtilsCreateRegistry([st15EffectDefinitions]),
      host,
    );
    const edward = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ST15-002',
        number: 'ST15-002',
        name: 'Edward.Newgate',
        type: 'Character',
        cost: 7,
        power: 8000,
      }),
      'edward',
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
    const immune = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'T2',
        number: 'T2',
        name: 'Immune',
        type: 'Character',
        cost: 5,
        power: 6000,
      }),
      'immune',
    );

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: edward.instanceId,
      sourceCardId: edward.cardId,
    });

    // The engine auto-resolves the optional rest cost (only 1 matching card),
    // then presents KO target selection
    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    const selectPrompt = decision!.prompt;
    if (selectPrompt.type === 'selectCards') {
      expect(selectPrompt.selector.filter?.powerMax).toBe(5000);
    }
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(host.getPlayer('p2')?.zones.characters).not.toContain(target);
    expect(host.getPlayer('p2')?.zones.trash).toContain(target);
    expect(host.getPlayer('p2')?.zones.characters).toContain(immune);
  });

  it('Thatch (ST15-004) on Play with Whitebeard leader gives -2000 and adds life to hand', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    const p1Leader = host.getPlayer('p1')!.zones.leader;
    p1Leader.cardId = 'L-WB';
    p1Leader.families.push('Whitebeard Pirates');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      testUtilsCreateRegistry([st15EffectDefinitions]),
      host,
    );
    const thatch = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ST15-004',
        number: 'ST15-004',
        name: 'Thatch',
        type: 'Character',
        cost: 1,
        power: 2000,
      }),
      'thatch',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'T1',
        number: 'T1',
        name: 'Target',
        type: 'Character',
        cost: 3,
        power: 5000,
      }),
      'target',
    );
    const lifeCard = host.addCardToZone(
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

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: thatch.instanceId,
      sourceCardId: thatch.cardId,
    });

    // First decision: select target for -2000 power
    const firstDecision = engine.getPendingDecision();
    expect(firstDecision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: firstDecision?.id ?? '',
      selectedCardInstanceIds: [target.instanceId],
    });

    engine.reapplyContinuousEffects();
    expect(target.power).toBe(3000);
    expect(host.getPlayer('p1')?.zones.hand).toContain(lifeCard);
  });

  it('Ace (ST15-005) gains Rush when leader has Whitebeard Pirates trait', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    const p1Leader = host.getPlayer('p1')!.zones.leader;
    p1Leader.cardId = 'L-WB';
    p1Leader.families.push('Whitebeard Pirates');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      testUtilsCreateRegistry([st15EffectDefinitions]),
      host,
    );
    const ace = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ST15-005',
        number: 'ST15-005',
        name: 'Portgas.D.Ace',
        type: 'Character',
        cost: 5,
        power: 6000,
      }),
      'ace',
    );

    engine.reapplyContinuousEffects();
    expect(ace.hasRush).toBe(true);
  });

  it('Ace (ST15-005) does not gain Rush without Whitebeard leader', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    const p1Leader = host.getPlayer('p1')!.zones.leader;
    p1Leader.cardId = 'L-OTHER';
    p1Leader.families.push('Straw Hat Crew');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      testUtilsCreateRegistry([st15EffectDefinitions]),
      host,
    );
    const ace = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ST15-005',
        number: 'ST15-005',
        name: 'Portgas.D.Ace',
        type: 'Character',
        cost: 5,
        power: 6000,
      }),
      'ace',
    );

    engine.reapplyContinuousEffects();
    expect(ace.hasRush).toBe(false);
  });

  it("Ace (ST15-005) replacement prevents KO from opponent's effect", () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.getPlayer('p1')!.zones.leader.cardId = 'L-WB';
    host.addPlayer('p2');
    const engine = new EffectEngine(
      testUtilsCreateRegistry([st15EffectDefinitions]),
      host,
    );
    const ace = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ST15-005',
        number: 'ST15-005',
        name: 'Portgas.D.Ace',
        type: 'Character',
        cost: 5,
        power: 6000,
      }),
      'ace',
    );

    // Opponent's effect tries to KO Ace — replacement triggers (optional: true)
    const replaced = engine.applyReplacement({
      type: 'wouldKoCharacter',
      playerSessionId: 'p2',
      sourceInstanceId: ace.instanceId,
      reason: 'effect',
    });

    expect(replaced).toBe(true);
    expect(host.getPlayer('p1')?.zones.characters).toContain(ace);
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

const ensureDonDeck = (
  host: TestHost,
  sessionId: string,
  count: number,
): void => {
  for (let i = 0; i < count; i++) {
    host.addCardToZone(sessionId, 'donDeck', makeDon(), `don-${i}`);
  }
};
