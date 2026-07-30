/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from '@jest/globals';
import { DuelCard, type Card } from '@onepiecetcg/shared';
import { EffectEngine } from '../../effect-engine';
import type { SpecialHandlerDefinition } from '../../types/effect-registry';
import { st06EffectDefinitions } from './ST-06.effects';
import { createRegistry, makeCard, TestHost } from '../test-utils';

describe('ST06 effect definitions', () => {
  const createEngine = (
    host: TestHost,
    specialHandlers: readonly SpecialHandlerDefinition[] = [],
  ): EffectEngine => {
    const registry = createRegistry([st06EffectDefinitions], specialHandlers);
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

  describe('ST06-001 Sakazuki (Leader)', () => {
    it('rests 3 DON!! and trashes 1 from hand to KO a cost-0 character', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST06-001');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      const p2 = host.getPlayer('p2')!;

      for (let i = 0; i < 5; i += 1) {
        p1.zones.donDeck.push(new DuelCard());
      }
      host.addDonToCost('p1', 5, false);
      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'trash-card',
          number: 'trash',
          name: 'Trash Me',
          type: 'Character',
        }),
        'trash-me',
      );

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 0,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: p1.zones.leader.instanceId,
        sourceCardId: 'ST06-001',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(
        p2.zones.characters.find((c) => c.instanceId === target.instanceId),
      ).toBeFalsy();
      expect(
        p2.zones.trash.find((c) => c.instanceId === target.instanceId),
      ).toBeTruthy();
      expect(p1.zones.hand.length).toBe(0);
    });
  });

  describe('ST06-014 Shockwave', () => {
    it('as counter gives +4000 power then KOs an active cost-3 character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      const p2 = host.getPlayer('p2')!;

      const shockwave = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST06-014',
          number: 'ST06-014',
          name: 'Shockwave',
          type: 'Event',
          cost: 2,
          text: "[Counter] Up to 1 of your Leader or Character cards gains +4000 power during this battle. Then, K.O. up to 1 of your opponent's active Characters with a cost of 3 or less. [Trigger] K.O. up to 1 of your opponent's Characters with a cost of 4 or less.",
        }),
        'shockwave',
      );

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 3,
        power: 3000,
      });

      addCharacter(host, 'p2', {
        name: 'Rested Target',
        instanceSuffix: 'rested',
        cost: 2,
        rested: true,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateCounter',
        playerSessionId: 'p1',
        sourceInstanceId: shockwave.instanceId,
        sourceCardId: 'ST06-014',
      });

      let decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [p1.zones.leader.instanceId],
      });

      decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(
        p2.zones.characters.find((c) => c.instanceId === target.instanceId),
      ).toBeFalsy();
      expect(
        p2.zones.trash.find((c) => c.instanceId === target.instanceId),
      ).toBeTruthy();
    });

    it('as trigger KOs a cost-4 character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p2 = host.getPlayer('p2')!;

      const shockwave = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST06-014',
          number: 'ST06-014',
          name: 'Shockwave',
          type: 'Event',
          cost: 2,
          text: "[Trigger] K.O. up to 1 of your opponent's Characters with a cost of 4 or less.",
        }),
        'shockwave',
      );

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 4,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: shockwave.instanceId,
        sourceCardId: 'ST06-014',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(
        p2.zones.characters.find((c) => c.instanceId === target.instanceId),
      ).toBeFalsy();
      expect(
        p2.zones.trash.find((c) => c.instanceId === target.instanceId),
      ).toBeTruthy();
    });
  });

  describe('ST06-012 Monkey.D.Garp', () => {
    it('trashes from hand and rests self to KO a cost-4 character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      const p2 = host.getPlayer('p2')!;

      const garp = addCharacter(host, 'p1', {
        id: 'ST06-012',
        number: 'ST06-012',
        name: 'Monkey.D.Garp',
        instanceSuffix: 'garp',
      });
      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'trash-card',
          number: 'trash',
          name: 'Trash Me',
          type: 'Character',
        }),
        'trash-me',
      );

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 4,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: garp.instanceId,
        sourceCardId: 'ST06-012',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(
        p2.zones.characters.find((c) => c.instanceId === target.instanceId),
      ).toBeFalsy();
      expect(
        p2.zones.trash.find((c) => c.instanceId === target.instanceId),
      ).toBeTruthy();
      expect(p1.zones.hand.length).toBe(0);
      expect(garp.rested).toBe(true);
    });
  });

  describe('ST06-015 Great Eruption', () => {
    it('main effect draws 1 card and prompts for cost modification target', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const eruption = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST06-015',
          number: 'ST06-015',
          name: 'Great Eruption',
          type: 'Event',
          cost: 3,
          text: "[Main] Draw 1 card. Then, give up to 1 of your opponent's Characters -2 cost during this turn. [Trigger] Your opponent chooses 1 card from their hand and trashes it.",
        }),
        'eruption',
      );

      p1.zones.deck.push(new DuelCard());
      p1.zones.deck.push(new DuelCard());

      addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 5,
      });

      const initialHandSize = p1.zones.hand.length;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: eruption.instanceId,
        sourceCardId: 'ST06-015',
      });

      expect(p1.zones.hand.length).toBe(initialHandSize + 1);

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
    });

    it('trigger effect prompts opponent to trash from hand', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const eruption = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST06-015',
          number: 'ST06-015',
          name: 'Great Eruption',
          type: 'Event',
          cost: 3,
          text: '[Trigger] Your opponent chooses 1 card from their hand and trashes it.',
        }),
        'eruption',
      );

      host.addCardToZone(
        'p2',
        'hand',
        makeCard({
          id: 'opp-card',
          number: 'opp',
          name: 'Opp Card',
          type: 'Character',
        }),
        'opp-card',
      );
      host.addCardToZone(
        'p2',
        'hand',
        makeCard({
          id: 'opp-card2',
          number: 'opp2',
          name: 'Opp Card 2',
          type: 'Character',
        }),
        'opp-card2',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: eruption.instanceId,
        sourceCardId: 'ST06-015',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
    });
  });

  describe('ST06-004 Smoker', () => {
    it('always has cannotBeKoedByEffects', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const smoker = addCharacter(host, 'p1', {
        id: 'ST06-004',
        number: 'ST06-004',
        name: 'Smoker',
        instanceSuffix: 'smoker',
      });

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(smoker.cannotBeKoedByEffects).toBe(true);
    });

    it('gains Double Attack when DON!! x1 and a cost-0 character is on field', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const smoker = addCharacter(host, 'p1', {
        id: 'ST06-004',
        number: 'ST06-004',
        name: 'Smoker',
        instanceSuffix: 'smoker',
      });
      smoker.attachedDon = 1;

      addCharacter(host, 'p2', {
        name: 'Cost Zero',
        instanceSuffix: 'zero',
        cost: 0,
      });

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(smoker.hasDoubleAttack).toBe(true);
    });

    it('loses Double Attack when no DON!! attached', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const smoker = addCharacter(host, 'p1', {
        id: 'ST06-004',
        number: 'ST06-004',
        name: 'Smoker',
        instanceSuffix: 'smoker',
      });
      smoker.attachedDon = 0;

      addCharacter(host, 'p2', {
        name: 'Cost Zero',
        instanceSuffix: 'zero',
        cost: 0,
      });

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(smoker.hasDoubleAttack).toBe(false);
    });

    it('loses Double Attack when no cost-0 character on field', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const smoker = addCharacter(host, 'p1', {
        id: 'ST06-004',
        number: 'ST06-004',
        name: 'Smoker',
        instanceSuffix: 'smoker',
      });
      smoker.attachedDon = 1;

      addCharacter(host, 'p2', {
        name: 'Cost One',
        instanceSuffix: 'one',
        cost: 1,
      });

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(smoker.hasDoubleAttack).toBe(false);
    });
  });
});
