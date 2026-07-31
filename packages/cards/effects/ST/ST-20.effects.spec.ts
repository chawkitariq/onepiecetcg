/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from '../../../web/node_modules/vitest/dist/index.js';
import { DuelCard, type Card } from '@onepiecetcg/shared';
import { EffectEngine } from '../../../effect-engine/src/effect-engine.js';
import { st20EffectDefinitions } from './ST-20.effects';
import { createRegistry, makeCard, TestHost } from '../test-utils.js';

describe('ST20 effect definitions', () => {
  const createEngine = (host: TestHost): EffectEngine => {
    const registry = createRegistry([st20EffectDefinitions]);
    return new EffectEngine(registry, host);
  };

  const addCharacter = (
    host: TestHost,
    sessionId: string,
    overrides: Partial<Card> & { instanceSuffix: string },
  ): DuelCard =>
    host.addCardToZone(
      sessionId,
      'characters',
      makeCard({
        id: 'test-character',
        number: 'test-character',
        name: 'Test Character',
        type: 'Character',
        cost: 3,
        power: 5000,
        ...overrides,
      }),
      overrides.instanceSuffix,
    );

  const putDonInCost = (
    host: TestHost,
    sessionId: string,
    count: number,
    rested: boolean,
  ): void => {
    const player = host.getPlayer(sessionId)!;
    for (let index = 0; index < count; index += 1) {
      const don = new DuelCard();
      don.rested = rested;
      player.zones.cost.push(don);
    }
  };

  describe('ST20-001 Charlotte Katakuri', () => {
    it('reveals top life card and attaches rested DON!! to leader on activate main', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const katakuri = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST20-001',
          number: 'ST20-001',
          name: 'Charlotte Katakuri',
          type: 'Character',
          cost: 5,
          power: 6000,
          counter: 1000,
          families: ['Big Mom Pirates'],
        }),
        'katakuri',
      );

      host.addCardToZone(
        'p1',
        'life',
        makeCard({
          id: 'life-card',
          number: 'life-card',
          name: 'Life Card',
          type: 'Event',
          cost: 0,
        }),
        'life-card',
      );

      putDonInCost(host, 'p1', 3, true);

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: katakuri.instanceId,
        sourceCardId: 'ST20-001',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [p1.zones.leader.instanceId],
      });

      expect(p1.zones.leader.attachedDon).toBe(1);
    });

    it('attaches rested DON!! to a character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const katakuri = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST20-001',
          number: 'ST20-001',
          name: 'Charlotte Katakuri',
          type: 'Character',
          cost: 5,
          power: 6000,
          families: ['Big Mom Pirates'],
        }),
        'katakuri',
      );

      host.addCardToZone(
        'p1',
        'life',
        makeCard({
          id: 'life-card',
          number: 'life-card',
          name: 'Life Card',
          type: 'Event',
          cost: 0,
        }),
        'life-card',
      );

      putDonInCost(host, 'p1', 3, true);

      const target = addCharacter(host, 'p1', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 3,
        power: 3000,
        families: ['Big Mom Pirates'],
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: katakuri.instanceId,
        sourceCardId: 'ST20-001',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(target.attachedDon).toBe(1);
    });
  });

  describe('ST20-002 Charlotte Cracker', () => {
    it("trashes top life card instead of being KO'd by an effect", () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const cracker = addCharacter(host, 'p1', {
        id: 'ST20-002',
        number: 'ST20-002',
        name: 'Charlotte Cracker',
        instanceSuffix: 'cracker',
        cost: 4,
        power: 5000,
        families: ['Big Mom Pirates'],
      });

      host.addCardToZone(
        'p1',
        'life',
        makeCard({
          id: 'life-card',
          number: 'life-card',
          name: 'Life Card',
          type: 'Event',
          cost: 0,
        }),
        'life-card',
      );

      const lifeBefore = p1.zones.life.length;

      const engine = createEngine(host);
      const replaced = engine.applyReplacement({
        type: 'wouldKoCharacter',
        playerSessionId: 'p1',
        sourceInstanceId: cracker.instanceId,
        reason: 'effect',
      });

      expect(replaced).toBe(true);
      expect(p1.zones.life.length).toBe(lifeBefore - 1);
      expect(p1.zones.trash.length).toBe(1);
      expect(
        p1.zones.characters.find((c) => c.instanceId === cracker.instanceId),
      ).toBeTruthy();
    });

    it('does not replace KO from battle', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const cracker = addCharacter(host, 'p1', {
        id: 'ST20-002',
        number: 'ST20-002',
        name: 'Charlotte Cracker',
        instanceSuffix: 'cracker',
        cost: 4,
        power: 5000,
        families: ['Big Mom Pirates'],
      });

      const engine = createEngine(host);
      const replaced = engine.applyReplacement({
        type: 'wouldKoCharacter',
        playerSessionId: 'p1',
        sourceInstanceId: cracker.instanceId,
        reason: 'battle',
      });

      expect(replaced).toBe(false);
    });

    it('plays from trash on trigger with hand discard cost', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const cracker = host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'ST20-002',
          number: 'ST20-002',
          name: 'Charlotte Cracker',
          type: 'Character',
          cost: 4,
          power: 5000,
          families: ['Big Mom Pirates'],
        }),
        'cracker',
      );

      const handCard = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'hand-cost',
          number: 'hand-cost',
          name: 'Hand Cost',
          type: 'Event',
          cost: 0,
        }),
        'hand-cost',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: cracker.instanceId,
        sourceCardId: 'ST20-002',
      });

      // Cost decision: trash 1 from hand
      const costDecision = engine.getPendingDecision();
      expect(costDecision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: costDecision!.id,
        selectedCardInstanceIds: [handCard.instanceId],
      });

      // Play action auto-resolves (exact 1 card match in trash)
      expect(
        p1.zones.characters.find((c) => c.instanceId === cracker.instanceId),
      ).toBeTruthy();
      expect(
        p1.zones.trash.find((c) => c.instanceId === handCard.instanceId),
      ).toBeTruthy();
    });
  });

  describe('ST20-003 Charlotte Brulee', () => {
    it('moves Brulee to hand on trigger', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const brulee = host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'ST20-003',
          number: 'ST20-003',
          name: 'Charlotte Brulee',
          type: 'Character',
          cost: 3,
          power: 3000,
          counter: 2000,
          families: ['Big Mom Pirates'],
        }),
        'brulee',
      );

      host.addCardToZone(
        'p1',
        'life',
        makeCard({
          id: 'life-card',
          number: 'life-card',
          name: 'Life Card',
          type: 'Event',
          cost: 0,
        }),
        'life-card',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: brulee.instanceId,
        sourceCardId: 'ST20-003',
      });

      expect(
        p1.zones.hand.find((c) => c.instanceId === brulee.instanceId),
      ).toBeTruthy();
      expect(
        p1.zones.trash.find((c) => c.instanceId === brulee.instanceId),
      ).toBeFalsy();
    });
  });

  describe('ST20-004 Charlotte Pudding', () => {
    it('moves top life card to hand and restands a Big Mom Pirates character on play', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const pudding = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST20-004',
          number: 'ST20-004',
          name: 'Charlotte Pudding',
          type: 'Character',
          cost: 3,
          power: 2000,
          counter: 1000,
          families: ['Big Mom Pirates'],
        }),
        'pudding',
      );

      const lifeCard = host.addCardToZone(
        'p1',
        'life',
        makeCard({
          id: 'life-card',
          number: 'life-card',
          name: 'Life Card',
          type: 'Event',
          cost: 0,
        }),
        'life-card',
      );

      const target = addCharacter(host, 'p1', {
        name: 'Big Mom Character',
        instanceSuffix: 'target',
        cost: 3,
        power: 5000,
        families: ['Big Mom Pirates'],
      });
      target.rested = true;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: pudding.instanceId,
        sourceCardId: 'ST20-004',
      });

      expect(
        p1.zones.hand.find((c) => c.instanceId === lifeCard.instanceId),
      ).toBeTruthy();
      expect(target.rested).toBe(false);
    });

    it('rests opponent character with cost 3 or less on trigger', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p2 = host.getPlayer('p2')!;

      const pudding = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST20-004',
          number: 'ST20-004',
          name: 'Charlotte Pudding',
          type: 'Character',
          cost: 3,
          power: 2000,
          families: ['Big Mom Pirates'],
        }),
        'pudding',
      );

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 3,
        power: 3000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: pudding.instanceId,
        sourceCardId: 'ST20-004',
      });

      expect(target.rested).toBe(true);
    });
  });

  describe('ST20-005 Charlotte Linlin', () => {
    it('shows choice branch after trashing from hand on play', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const linlin = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST20-005',
          number: 'ST20-005',
          name: 'Charlotte Linlin',
          type: 'Character',
          cost: 6,
          power: 7000,
          counter: 0,
          families: ['The Four Emperors Big Mom Pirates'],
        }),
        'linlin',
      );

      const handCard = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'hand-cost',
          number: 'hand-cost',
          name: 'Hand Cost',
          type: 'Event',
          cost: 0,
        }),
        'hand-cost',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: linlin.instanceId,
        sourceCardId: 'ST20-005',
      });

      // Cost decision: trash 1 from hand
      let decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [handCard.instanceId],
      });

      // Branch decision: opponent chooses
      decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectChoice');
    });
  });

  describe('Structural validation', () => {
    it('all cards have valid effect definitions', () => {
      for (const card of st20EffectDefinitions.cards) {
        expect(card.cardId).toMatch(/^ST20-\d{3}$/);
        if (card.effects && card.effects.length > 0) {
          for (const entry of card.effects) {
            if (entry.kind === 'standard') {
              expect(entry.effect.id).toBeTruthy();
              expect(entry.effect.trigger.type).toBeTruthy();
              expect(entry.effect.actions.length).toBeGreaterThan(0);
            }
            if (entry.kind === 'replacement') {
              expect(entry.effect.id).toBeTruthy();
              expect(entry.effect.event).toBe('wouldKoCharacter');
              expect(entry.effect.replacement.length).toBeGreaterThan(0);
            }
          }
        }
      }
    });

    it('ST20-001 has activateMain trigger with reveal cost', () => {
      const card = st20EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST20-001',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('activateMain');
        expect(stdEntry.effect.trigger.oncePerTurn).toBe(true);
        expect(stdEntry.effect.costs).toContainEqual({
          type: 'reveal',
          player: 'self',
          zone: 'life',
          amount: 1,
        });
      }
    });

    it('ST20-002 has replacement effect for KO protection and trigger play', () => {
      const card = st20EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST20-002',
      );
      expect(card).toBeDefined();
      const replEntry = card!.effects?.find((e) => e.kind === 'replacement');
      expect(replEntry).toBeDefined();
      if (replEntry?.kind === 'replacement') {
        expect(replEntry.effect.event).toBe('wouldKoCharacter');
        expect(replEntry.effect.oncePerTurn).toBe(true);
        expect(replEntry.effect.optional).toBe(true);
        expect(replEntry.effect.conditions).toContainEqual({
          type: 'eventReasonIs',
          value: 'effect',
        });
      }
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('trigger');
      }
    });

    it('ST20-003 has trigger with life manipulation and hand add', () => {
      const card = st20EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST20-003',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('trigger');
        expect(stdEntry.effect.actions.length).toBe(3);
        expect(stdEntry.effect.actions[0].type).toBe('reveal');
        expect(stdEntry.effect.actions[1].type).toBe('moveStoredCards');
        expect(stdEntry.effect.actions[2].type).toBe('moveCard');
      }
    });

    it('ST20-005 has chooseActionBranch with two choices', () => {
      const card = st20EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST20-005',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onPlay');
        expect(stdEntry.effect.actions.length).toBe(1);
        const branchAction = stdEntry.effect.actions[0];
        if (branchAction.type === 'chooseActionBranch') {
          expect(branchAction.choices.length).toBe(2);
          expect(branchAction.choices[0].id).toBe('trash-hand');
          expect(branchAction.choices[1].id).toBe('trash-life');
        } else {
          throw new Error('Expected chooseActionBranch action');
        }
      }
    });
  });
});
