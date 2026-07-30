import { describe, expect, it } from '@jest/globals';
import { type Card, type CardEffectDefinition } from '@onepiecetcg/shared';
import type {
  EffectRegistry,
  SpecialHandlerDefinition,
} from '../types/effect-registry';
import { buildEffectIndexes } from '../effect-indexes';
import { EffectEngine } from '../effect-engine';
import { op15EffectDefinitions } from './op15.effects';
import { specialHandlerDefinitions } from './special';
import {
  makeCard,
  TestHost,
  createRegistry as testUtilsCreateRegistry,
} from './test-utils';

const createRegistry = (
  specialHandlers: readonly SpecialHandlerDefinition[] = [],
): EffectRegistry => {
  const effectsByCardId: Record<string, CardEffectDefinition> = {};
  const specialHandlersByCardId: Record<string, SpecialHandlerDefinition> = {};

  for (const card of op15EffectDefinitions.cards) {
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

describe('OP15 effect definitions', () => {
  it('loads all OP15 cards without error', () => {
    const registry = createRegistry();
    const cards = op15EffectDefinitions.cards;

    expect(cards.length).toBeGreaterThan(0);

    for (const card of cards) {
      const resolved = registry.effectsByCardId[card.cardId];
      expect(resolved).toBeDefined();
      expect(resolved.cardId).toBe(card.cardId);
    }
  });

  it('has correct edition ID', () => {
    expect(op15EffectDefinitions.editionId).toBe('OP15');
  });

  it('counts all defined cards', () => {
    const allCards = op15EffectDefinitions.cards;
    expect(allCards.length).toBe(op15EffectDefinitions.cards.length);
    expect(allCards.length).toBeGreaterThan(100);

    const withEffects = allCards.filter(
      (c) => c.effects && c.effects.length > 0,
    );
    const withSpecialRef = allCards.filter((c) =>
      c.effects?.some((e) => e.kind === 'special-ref'),
    );
    const empty = allCards.filter((c) => !c.effects || c.effects.length === 0);

    expect(withEffects.length).toBeGreaterThan(0);
    expect(withSpecialRef.length).toBe(15);
    expect(empty.length).toBeGreaterThan(0);

    const emptyIds = empty.map((c) => c.cardId);
    expect(emptyIds).toContain('OP15-016');
    expect(emptyIds).toContain('OP15-030');
    expect(emptyIds).toContain('OP15-049');
    expect(emptyIds).toContain('OP15-062');
    expect(emptyIds).toContain('OP15-089');
    expect(emptyIds).toContain('OP15-107');
  });

  it('has unique effect IDs', () => {
    const allIds: string[] = [];

    for (const card of op15EffectDefinitions.cards) {
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
    const cardIds = op15EffectDefinitions.cards.map((c) => c.cardId);
    const uniqueIds = new Set(cardIds);
    expect(uniqueIds.size).toBe(cardIds.length);
  });

  it('registers special handlers for all special-ref cards', () => {
    const specialRefIds: string[] = [];

    for (const card of op15EffectDefinitions.cards) {
      for (const entry of card.effects ?? []) {
        if (entry.kind === 'special-ref') {
          specialRefIds.push(entry.specialHandlerId);
        }
      }
    }

    expect(specialRefIds).toHaveLength(15);
    expect(specialRefIds).toContain('op15-001-special');
    expect(specialRefIds).toContain('op15-002-special');
    expect(specialRefIds).toContain('op15-008-special');
    expect(specialRefIds).toContain('op15-014-special');
    expect(specialRefIds).toContain('op15-020-special');
    expect(specialRefIds).toContain('op15-029-special');
    expect(specialRefIds).toContain('op15-031-special');
    expect(specialRefIds).toContain('op15-046-special');
    expect(specialRefIds).toContain('op15-058-special');
    expect(specialRefIds).toContain('op15-059-special');
    expect(specialRefIds).toContain('op15-070-special');
    expect(specialRefIds).toContain('op15-071-special');
    expect(specialRefIds).toContain('op15-086-special');
    expect(specialRefIds).toContain('op15-092-special');
    expect(specialRefIds).toContain('op15-119-special');
  });

  it('parses all effect types correctly', () => {
    let standardCount = 0;
    let continuousCount = 0;
    let replacementCount = 0;
    let specialRefCount = 0;

    for (const card of op15EffectDefinitions.cards) {
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
    expect(continuousCount).toBeGreaterThan(0);
    expect(replacementCount).toBeGreaterThan(0);
    expect(specialRefCount).toBe(15);
  });

  it('validates Krieg leader continuous effect structure', () => {
    const resolved = createRegistry();
    const krieg = resolved.effectsByCardId['OP15-001'];
    expect(krieg).toBeDefined();
    expect(krieg.continuous).toHaveLength(1);
    expect(krieg.continuous![0].conditions).toHaveLength(3);
    expect(krieg.continuous![0].modifier.power).toBe(-2000);
    expect(krieg.standard).toBeUndefined();
    expect(krieg.specialHandlerId).toBe('op15-001-special');
  });

  it('validates Rebecca leader cannot-attack continuous effect', () => {
    const resolved = createRegistry();
    const rebecca = resolved.effectsByCardId['OP15-039'];
    expect(rebecca).toBeDefined();
    expect(rebecca.continuous).toHaveLength(1);
    expect(rebecca.continuous![0].modifier.keywords).toContain('cannotAttack');
    expect(rebecca.standard).toHaveLength(1);
  });

  it('validates Brook leader win-on-deck-out keyword', () => {
    const resolved = createRegistry();
    const brook = resolved.effectsByCardId['OP15-022'];
    expect(brook).toBeDefined();
    expect(brook.continuous).toHaveLength(1);
    expect(brook.continuous![0].modifier.keywords).toContain('winOnDeckOut');
  });

  it('validates replacement effects', () => {
    const resolved = createRegistry();
    const alvida = resolved.effectsByCardId['OP15-003'];
    expect(alvida.replacements).toHaveLength(1);
    expect(alvida.replacements![0].event).toBe('wouldKoCharacter');
    expect(alvida.replacements![0].optional).toBe(true);

    const koby = resolved.effectsByCardId['OP15-009'];
    expect(koby.replacements).toHaveLength(1);
    expect(koby.replacements![0].event).toBe('wouldMoveCard');
  });

  it('validates search-based effects use correct structure', () => {
    const resolved = createRegistry();

    const viola = resolved.effectsByCardId['OP15-040'];
    expect(viola.standard).toHaveLength(1);
    const searchAction = viola.standard![0].actions[0];
    expect(searchAction.type).toBe('search');
    if (searchAction.type === 'search') {
      expect(searchAction.sourceZone).toBe('deck');
      expect(searchAction.amount).toBe(3);
      expect(searchAction.filter.trait).toContain('Dressrosa');
    }
  });

  it('validates cards with chooseActionBranch', () => {
    const resolved = createRegistry();

    const memento = resolved.effectsByCardId['OP15-054'];
    expect(memento.standard).toHaveLength(1);
    const branchAction = memento.standard![0].actions[0];
    expect(branchAction.type).toBe('chooseActionBranch');

    const goAhead = resolved.effectsByCardId['OP15-055'];
    expect(goAhead.standard).toHaveLength(1);
    const branchAction2 = goAhead.standard![0].actions[0];
    expect(branchAction2.type).toBe('chooseActionBranch');
  });

  it('validates all standard effects have triggers', () => {
    const resolved = createRegistry();

    for (const [cardId, def] of Object.entries(resolved.effectsByCardId)) {
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

const ensureDonDeck = (
  host: TestHost,
  sessionId: string,
  count: number,
): void => {
  for (let i = 0; i < count; i++) {
    host.addCardToZone(sessionId, 'donDeck', makeDon(), `don-${i}`);
  }
};

describe('OP15 behavioral tests', () => {
  it('Krieg leader (OP15-001) special: rests opponent character with 2+ DON!! given', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    const p1Leader = host.getPlayer('p1')!.zones.leader;
    p1Leader.cardId = 'OP15-001';
    p1Leader.name = 'Krieg';
    host.addPlayer('p2');
    const engine = new EffectEngine(
      testUtilsCreateRegistry(
        [op15EffectDefinitions],
        specialHandlerDefinitions,
      ),
      host,
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
    target.attachedDon = 2;

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: p1Leader.instanceId,
      sourceCardId: p1Leader.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(target.rested).toBe(true);
  });

  it('Lucy leader (OP15-002) special: gains +1000 per trashed Event/Stage when attacking', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    const p1Leader = host.getPlayer('p1')!.zones.leader;
    p1Leader.cardId = 'OP15-002';
    p1Leader.name = 'Lucy';
    host.addPlayer('p2');
    const engine = new EffectEngine(
      testUtilsCreateRegistry(
        [op15EffectDefinitions],
        specialHandlerDefinitions,
      ),
      host,
    );
    const eventCard = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'E1',
        number: 'E1',
        name: 'Fire Fist',
        type: 'Event',
        cost: 3,
      }),
      'event-card',
    );

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: p1Leader.instanceId,
      sourceCardId: p1Leader.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [eventCard.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.trash).toContain(eventCard);
    engine.reapplyContinuousEffects();
    expect(p1Leader.power).toBe(6000);
  });

  it("Alvida (OP15-003) replacement: trashes Character from hand instead of being K.O.'d", () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      testUtilsCreateRegistry(
        [op15EffectDefinitions],
        specialHandlerDefinitions,
      ),
      host,
    );
    const alvida = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP15-003',
        number: 'OP15-003',
        name: 'Alvida',
        type: 'Character',
        power: 5000,
      }),
      'alvida',
    );
    const sacrifice = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'S1',
        number: 'S1',
        name: 'Sacrifice',
        type: 'Character',
        power: 3000,
      }),
      'sacrifice',
    );

    // applyReplacement auto-resolves the trashFromHand since only 1 valid target
    const replaced = engine.applyReplacement({
      type: 'wouldKoCharacter',
      playerSessionId: 'p1',
      sourceInstanceId: alvida.instanceId,
      reason: 'effect',
    });

    expect(replaced).toBe(true);
    expect(host.getPlayer('p1')?.zones.characters).toContain(alvida);
    expect(host.getPlayer('p1')?.zones.trash).toContain(sacrifice);
    expect(host.getPlayer('p1')?.zones.hand).not.toContain(sacrifice);
  });

  it('Gin (OP15-007) on play: plays Character with cost 5 or less from hand if leader is East Blue', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.getPlayer('p1')!.zones.leader.families.push('East Blue');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      testUtilsCreateRegistry(
        [op15EffectDefinitions],
        specialHandlerDefinitions,
      ),
      host,
    );
    const gin = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP15-007',
        number: 'OP15-007',
        name: 'Gin',
        type: 'Character',
        cost: 3,
      }),
      'gin',
    );
    const toPlay = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'C1',
        number: 'C1',
        name: 'Played Char',
        type: 'Character',
        cost: 4,
      }),
      'to-play',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: gin.instanceId,
      sourceCardId: gin.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [toPlay.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.characters).toContain(toPlay);
    expect(host.getPlayer('p1')?.zones.hand).not.toContain(toPlay);
  });

  it('Krieg (OP15-008) special: on play moves rested DON!! to opponent character and gains Rush', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    ensureDonDeck(host, 'p2', 3);
    host.addDonToCost('p2', 3, true);
    const engine = new EffectEngine(
      testUtilsCreateRegistry(
        [op15EffectDefinitions],
        specialHandlerDefinitions,
      ),
      host,
    );
    const krieg = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP15-008',
        number: 'OP15-008',
        name: 'Krieg',
        type: 'Character',
        cost: 5,
      }),
      'krieg',
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

    expect(host.getPlayer('p2')?.zones.cost).toHaveLength(3);

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: krieg.instanceId,
      sourceCardId: krieg.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(target.attachedDon).toBe(3);
    expect(krieg.hasRush).toBe(true);
  });

  it('Buggy (OP15-012) when attacking: gives rested DON!! to own leader', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    ensureDonDeck(host, 'p1', 1);
    host.addDonToCost('p1', 1, true);
    const engine = new EffectEngine(
      testUtilsCreateRegistry(
        [op15EffectDefinitions],
        specialHandlerDefinitions,
      ),
      host,
    );
    const buggy = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP15-012',
        number: 'OP15-012',
        name: 'Buggy',
        type: 'Character',
        cost: 2,
      }),
      'buggy',
    );

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: buggy.instanceId,
      sourceCardId: buggy.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [host.getPlayer('p1')!.zones.leader.instanceId],
    });

    expect(host.getPlayer('p1')!.zones.leader.attachedDon).toBe(1);
  });

  it('Buggy (OP15-012) on K.O.: draws 1 card', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      testUtilsCreateRegistry(
        [op15EffectDefinitions],
        specialHandlerDefinitions,
      ),
      host,
    );
    const buggy = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP15-012',
        number: 'OP15-012',
        name: 'Buggy',
        type: 'Character',
        cost: 2,
      }),
      'buggy',
    );
    const drawnCard = host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'D1',
        number: 'D1',
        name: 'Drawn Card',
        type: 'Character',
      }),
      'drawn-card',
    );

    engine.handleEvent({
      type: 'onKo',
      playerSessionId: 'p1',
      sourceInstanceId: buggy.instanceId,
      sourceCardId: buggy.cardId,
    });

    expect(host.getPlayer('p1')?.zones.hand).toContain(drawnCard);
    expect(host.getPlayer('p1')?.zones.deck).toHaveLength(0);
  });

  it('Rebecca leader (OP15-039) cannot-attack continuous effect and optional activate main', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    const p1Leader = host.getPlayer('p1')!.zones.leader;
    p1Leader.cardId = 'OP15-039';
    p1Leader.name = 'Rebecca';
    p1Leader.families.push('Dressrosa');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      testUtilsCreateRegistry(
        [op15EffectDefinitions],
        specialHandlerDefinitions,
      ),
      host,
    );
    const toReturn = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'R1',
        number: 'R1',
        name: 'Soldier',
        type: 'Character',
        cost: 2,
        families: ['Dressrosa'],
      }),
      'to-return',
    );
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'R2',
        number: 'R2',
        name: 'Dressrosa Hero',
        type: 'Character',
        cost: 3,
        families: ['Dressrosa'],
      }),
      'to-play',
    );

    engine.reapplyContinuousEffects();
    expect(p1Leader.cannotAttack).toBe(true);

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: p1Leader.instanceId,
      sourceCardId: p1Leader.cardId,
    });

    // Optional trigger confirmation
    const confirmDecision = engine.getPendingDecision();
    expect(confirmDecision?.prompt.type).toBe('confirm');
    engine.answerDecision({
      decisionId: confirmDecision?.id ?? '',
      confirmed: true,
    });

    // After confirming, costs are resolved. The moveCard cost auto-resolves (only 1 Dressrosa character in play).
    // Then play action creates a selectCards decision.
    expect(p1Leader.rested).toBe(true);
    expect(host.getPlayer('p1')?.zones.characters).not.toContain(toReturn);
    expect(host.getPlayer('p1')?.zones.hand).toContain(toReturn);
  });

  it('Viola (OP15-040) on play: searches 3 cards from deck for Dressrosa', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      testUtilsCreateRegistry(
        [op15EffectDefinitions],
        specialHandlerDefinitions,
      ),
      host,
    );
    const viola = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP15-040',
        number: 'OP15-040',
        name: 'Viola',
        type: 'Character',
        cost: 2,
      }),
      'viola',
    );
    const dressrosaCard = host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'D1',
        number: 'D1',
        name: 'Dressrosa Soldier',
        type: 'Character',
        families: ['Dressrosa'],
      }),
      'dressrosa',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'D2', number: 'D2', name: 'Other', type: 'Character' }),
      'other',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: viola.instanceId,
      sourceCardId: viola.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [dressrosaCard.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.hand).toContain(dressrosaCard);
  });

  it('Fire Fist (OP15-020) special: leader +3000, opp -8000, trash 2 to KO 0-power', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      testUtilsCreateRegistry(
        [op15EffectDefinitions],
        specialHandlerDefinitions,
      ),
      host,
    );
    const fireFist = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP15-020',
        number: 'OP15-020',
        name: 'Fire Fist',
        type: 'Event',
        cost: 5,
      }),
      'fire-fist',
    );
    const leader = host.getPlayer('p1')!.zones.leader;
    const oppChar = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'O1',
        number: 'O1',
        name: 'Opp Char',
        type: 'Character',
        power: 5000,
      }),
      'opp-char',
    );
    const handA = host.addCardToZone(
      'p1',
      'hand',
      makeCard({ id: 'H1', number: 'H1', name: 'Hand A', type: 'Character' }),
      'hand-a',
    );
    const handB = host.addCardToZone(
      'p1',
      'hand',
      makeCard({ id: 'H2', number: 'H2', name: 'Hand B', type: 'Character' }),
      'hand-b',
    );

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: fireFist.instanceId,
      sourceCardId: fireFist.cardId,
    });

    engine.reapplyContinuousEffects();
    expect(leader.power).toBe(8000);

    // Select opponent character for -8000
    let decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [oppChar.instanceId],
    });

    // Select 2 cards from hand to trash
    decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [handA.instanceId, handB.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.trash).toContain(handA);
    expect(host.getPlayer('p1')?.zones.trash).toContain(handB);
  });

  it('Amazon (OP15-059) special: on attacked, rest self, opponent returns DON!! or gives +2000', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    ensureDonDeck(host, 'p2', 1);
    host.addDonToCost('p2', 1, false);
    const engine = new EffectEngine(
      testUtilsCreateRegistry(
        [op15EffectDefinitions],
        specialHandlerDefinitions,
      ),
      host,
    );
    const amazon = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP15-059',
        number: 'OP15-059',
        name: 'Amazon',
        type: 'Character',
        cost: 2,
      }),
      'amazon',
    );

    engine.handleEvent({
      type: 'onAttacked',
      playerSessionId: 'p1',
      sourceInstanceId: amazon.instanceId,
      sourceCardId: amazon.cardId,
    });

    // Confirm to rest self
    const confirmDecision = engine.getPendingDecision();
    expect(confirmDecision?.prompt.type).toBe('confirm');
    engine.answerDecision({
      decisionId: confirmDecision?.id ?? '',
      confirmed: true,
    });

    expect(amazon.rested).toBe(true);

    // Opponent chooses: return DON!! or give +2000
    const choiceDecision = engine.getPendingDecision();
    expect(choiceDecision?.prompt.type).toBe('selectChoice');
    engine.answerDecision({
      decisionId: choiceDecision?.id ?? '',
      selectedChoiceIds: ['return'],
    });

    expect(host.getPlayer('p2')?.zones.donDeck.length).toBeGreaterThan(0);
  });

  it('Memento (OP15-054) chooseActionBranch: draws 2, trashes 1, plays Dressrosa cost 4 or less', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    const p1Leader = host.getPlayer('p1')!.zones.leader;
    p1Leader.cardId = 'OP15-002';
    p1Leader.name = 'Lucy';
    host.addPlayer('p2');
    const engine = new EffectEngine(
      testUtilsCreateRegistry(
        [op15EffectDefinitions],
        specialHandlerDefinitions,
      ),
      host,
    );
    const memento = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP15-054',
        number: 'OP15-054',
        name: 'Memento',
        type: 'Event',
        cost: 3,
      }),
      'memento',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'D1', number: 'D1', name: 'Draw 1', type: 'Character' }),
      'draw-1',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'D2', number: 'D2', name: 'Draw 2', type: 'Character' }),
      'draw-2',
    );
    const toTrash = host.addCardToZone(
      'p1',
      'hand',
      makeCard({ id: 'H1', number: 'H1', name: 'To Trash', type: 'Character' }),
      'to-trash',
    );
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'DC1',
        number: 'DC1',
        name: 'Dressrosa Fighter',
        type: 'Character',
        cost: 4,
        families: ['Dressrosa'],
      }),
      'dressrosa-char',
    );

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: memento.instanceId,
      sourceCardId: memento.cardId,
    });

    // Choose branch
    const choiceDecision = engine.getPendingDecision();
    expect(choiceDecision?.prompt.type).toBe('selectChoice');
    engine.answerDecision({
      decisionId: choiceDecision?.id ?? '',
      selectedChoiceIds: ['draw-trash-play'],
    });

    // Select card to trash (after drawing 2, hand = toTrash + dressrosa + 2 = 4)
    const trashDecision = engine.getPendingDecision();
    expect(trashDecision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: trashDecision?.id ?? '',
      selectedCardInstanceIds: [toTrash.instanceId],
    });

    // Then select the Dressrosa character to play
    const playDecision = engine.getPendingDecision();
    expect(playDecision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: playDecision?.id ?? '',
      selectedCardInstanceIds: [
        host
          .getPlayer('p1')!
          .zones.hand.find((c) => c.name === 'Dressrosa Fighter')!.instanceId,
      ],
    });

    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(2);
    expect(host.getPlayer('p1')?.zones.deck).toHaveLength(0);
  });

  it('Purinpurin (OP15-031) special: K.O.s rested character if cost equals DON!! given', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      testUtilsCreateRegistry(
        [op15EffectDefinitions],
        specialHandlerDefinitions,
      ),
      host,
    );
    const purinpurin = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP15-031',
        number: 'OP15-031',
        name: 'Purinpurin',
        type: 'Character',
        cost: 2,
      }),
      'purinpurin',
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
      }),
      'target',
    );
    target.rested = true;
    target.attachedDon = 3;

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: purinpurin.instanceId,
      sourceCardId: purinpurin.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(host.getPlayer('p2')?.zones.characters).not.toContain(target);
    expect(host.getPlayer('p2')?.zones.trash).toContain(target);
  });

  it('Wyper (OP15-114) on play: turns life face up, gives -2000 to all opponent, K.O.s 0-power', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      testUtilsCreateRegistry(
        [op15EffectDefinitions],
        specialHandlerDefinitions,
      ),
      host,
    );
    const wyper = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP15-114',
        number: 'OP15-114',
        name: 'Wyper',
        type: 'Character',
        cost: 5,
      }),
      'wyper',
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
    const weakChar = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'W1',
        number: 'W1',
        name: 'Weak',
        type: 'Character',
        power: 1000,
      }),
      'weak-char',
    );
    const strongChar = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'S1',
        number: 'S1',
        name: 'Strong',
        type: 'Character',
        power: 5000,
      }),
      'strong-char',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: wyper.instanceId,
      sourceCardId: wyper.cardId,
    });

    // Optional trigger confirmation
    const confirmDecision = engine.getPendingDecision();
    expect(confirmDecision?.prompt.type).toBe('confirm');
    engine.answerDecision({
      decisionId: confirmDecision?.id ?? '',
      confirmed: true,
    });

    // After the cost (reveal life - no decision needed) and actions:
    // - modifyPower to all opponent characters (-2000)
    // - koAllCharacters with powerMax: 0
    engine.reapplyContinuousEffects();
    expect(weakChar.power).toBe(-1000);
    expect(strongChar.power).toBe(3000);
    expect(host.getPlayer('p2')?.zones.characters).not.toContain(weakChar);
    expect(host.getPlayer('p2')?.zones.trash).toContain(weakChar);
    expect(host.getPlayer('p2')?.zones.characters).toContain(strongChar);
  });
});
