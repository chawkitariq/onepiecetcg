import { describe, expect, it } from '@jest/globals';
import { DuelCard, type Card } from '@onepiecetcg/shared';
import { EffectEngine } from '../../effect-engine';
import { st19EffectDefinitions } from './ST-19.effects';
import { createRegistry, makeCard, TestHost } from '../test-utils';

describe('ST19 effect definitions', () => {
  const createEngine = (host: TestHost): EffectEngine => {
    const registry = createRegistry([st19EffectDefinitions]);
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

  describe('ST19-001 Smoker', () => {
    it('restricts attack on up to 2 opponent characters with cost <= 4 when cost is paid', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST19-001',
          number: 'ST19-001',
          name: 'Smoker',
          type: 'Character',
          cost: 6,
          power: 8000,
        }),
        'smoker',
      );

      const navyCard = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'navy-card',
          number: 'navy-card',
          name: 'Navy Fodder',
          type: 'Character',
          cost: 1,
          power: 1000,
          colors: ['Black'],
          families: ['Navy'],
        }),
        'navy',
      );

      addCharacter(host, 'p2', {
        name: 'Target1',
        instanceSuffix: 'target1',
        cost: 4,
      });

      const p1 = host.getPlayer('p1')!;
      const smokerCard = p1.zones.hand.find((c) => c.cardId === 'ST19-001')!;
      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: smokerCard.instanceId,
        sourceCardId: 'ST19-001',
      });

      const costDecision = engine.getPendingDecision();
      expect(costDecision).not.toBeNull();
      expect(costDecision!.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: costDecision!.id,
        selectedCardInstanceIds: [navyCard.instanceId],
      });

      // restrictAttack auto-resolves, no further pending decision
      expect(engine.getPendingDecision()).toBeNull();
    });
  });

  describe('ST19-002 Sengoku', () => {
    it('draws 3 cards when leader has Navy trait and cost is paid', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST19-00X');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      p1.zones.leader.families = ['Navy'];

      for (let i = 0; i < 5; i++) {
        p1.zones.deck.push(new DuelCard());
      }

      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST19-002',
          number: 'ST19-002',
          name: 'Sengoku',
          type: 'Character',
          cost: 1,
          power: 1000,
        }),
        'sengoku',
      );

      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'navy1',
          number: 'navy1',
          name: 'Navy A',
          type: 'Event',
          cost: 0,
          colors: ['Black'],
          families: ['Navy'],
        }),
        'navy1',
      );

      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'navy2',
          number: 'navy2',
          name: 'Navy B',
          type: 'Event',
          cost: 0,
          colors: ['Black'],
          families: ['Navy'],
        }),
        'navy2',
      );

      const handBefore = p1.zones.hand.length;
      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: p1.zones.hand[0].instanceId,
        sourceCardId: 'ST19-002',
      });

      const costDecision = engine.getPendingDecision();
      expect(costDecision).not.toBeNull();
      const navyCards = p1.zones.hand.filter(
        (c) => c.colors.includes('Black') && c.families.includes('Navy'),
      );
      expect(navyCards.length).toBe(2);
      engine.answerDecision({
        decisionId: costDecision!.id,
        selectedCardInstanceIds: navyCards.map((c) => c.instanceId),
      });

      // handBefore includes sengoku + navy1 + navy2 = 3
      // After trashing 2: hand = 1
      // After drawing 3: hand = 4 = handBefore + 1
      expect(p1.zones.hand.length).toBe(handBefore + 1);
    });

    it('does not draw when leader lacks Navy trait', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST19-00X');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      p1.zones.leader.families = ['Other'];

      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST19-002',
          number: 'ST19-002',
          name: 'Sengoku',
          type: 'Character',
          cost: 1,
          power: 1000,
        }),
        'sengoku',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: p1.zones.hand[0].instanceId,
        sourceCardId: 'ST19-002',
      });

      // Condition fails, no cost prompt appears
      expect(engine.getPendingDecision()).toBeNull();
      expect(p1.zones.hand.length).toBe(1);
    });
  });

  describe('ST19-003 Tashigi', () => {
    it('gives -4 cost to opponent character on play when leader is Smoker', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST19-001');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      p1.zones.leader.name = 'Smoker';

      const tashigi = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST19-003',
          number: 'ST19-003',
          name: 'Tashigi',
          type: 'Character',
          cost: 5,
          power: 6000,
        }),
        'tashigi',
      );

      addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 5,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: tashigi.instanceId,
        sourceCardId: 'ST19-003',
      });

      const decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      expect(decision!.prompt.type).toBe('selectCards');
    });

    it('does nothing on play when leader is not Smoker', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST19-00X');
      host.addPlayer('p2');

      const tashigi = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST19-003',
          number: 'ST19-003',
          name: 'Tashigi',
          type: 'Character',
          cost: 5,
          power: 6000,
        }),
        'tashigi',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: tashigi.instanceId,
        sourceCardId: 'ST19-003',
      });

      expect(engine.getPendingDecision()).toBeNull();
    });

    it('trashes a cost-0 opponent character on activate main', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p2 = host.getPlayer('p2')!;

      const tashigi = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST19-003',
          number: 'ST19-003',
          name: 'Tashigi',
          type: 'Character',
          cost: 5,
          power: 6000,
        }),
        'tashigi',
      );

      const cost0Char = addCharacter(host, 'p2', {
        name: 'Cost Zero',
        instanceSuffix: 'zero',
        cost: 0,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: tashigi.instanceId,
        sourceCardId: 'ST19-003',
      });

      const decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      expect(decision!.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [cost0Char.instanceId],
      });

      expect(
        p2.zones.characters.find((c) => c.instanceId === cost0Char.instanceId),
      ).toBeFalsy();
      expect(
        p2.zones.trash.find((c) => c.instanceId === cost0Char.instanceId),
      ).toBeTruthy();
    });
  });

  describe('ST19-004 Hina', () => {
    it('has a continuous effect granting +4 cost', () => {
      const registry = createRegistry([st19EffectDefinitions]);
      const card = registry.effectsByCardId['ST19-004'];
      expect(card).toBeDefined();
      expect(card.continuous).toBeDefined();
      const cont = card.continuous![0];
      expect(cont.id).toBe('st19-004-don-x1-opponent-turn-plus-4-cost');
      expect(cont.modifier.cost).toBe(4);
      expect(cont.conditions).toContainEqual({
        type: 'controllerTurn',
        value: false,
      });
      expect(cont.conditions).toContainEqual({
        type: 'sourceHasAttachedDonAtLeast',
        value: 1,
      });
    });

    it('attaches a rested DON!! to leader after moving trash to deck', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const hina = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST19-004',
          number: 'ST19-004',
          name: 'Hina',
          type: 'Character',
          cost: 4,
          power: 6000,
        }),
        'hina',
      );

      host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'trash-card',
          number: 'trash-card',
          name: 'Trash Card',
          type: 'Event',
          cost: 0,
        }),
        'trash-card',
      );

      // Add rested DON!! to cost zone for attachDon to draw from
      const don1 = new DuelCard();
      don1.rested = true;
      p1.zones.cost.push(don1);

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: hina.instanceId,
        sourceCardId: 'ST19-004',
      });

      // First decision: moveCard cost (select card from trash)
      const costDecision = engine.getPendingDecision();
      expect(costDecision).not.toBeNull();
      expect(costDecision!.prompt.type).toBe('selectCards');
      const trashCards = p1.zones.trash;
      engine.answerDecision({
        decisionId: costDecision!.id,
        selectedCardInstanceIds: [trashCards[0].instanceId],
      });

      // Second decision: attachDon (select target: leader or character)
      const attachDecision = engine.getPendingDecision();
      expect(attachDecision).not.toBeNull();
      expect(attachDecision!.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: attachDecision!.id,
        selectedCardInstanceIds: [p1.zones.leader.instanceId],
      });

      expect(p1.zones.leader.attachedDon).toBe(1);
    });
  });

  describe('ST19-005 Monkey.D.Garp', () => {
    it('gives +1 cost to opponent character after moving trash to deck', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const garp = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST19-005',
          number: 'ST19-005',
          name: 'Monkey.D.Garp',
          type: 'Character',
          cost: 3,
          power: 4000,
        }),
        'garp',
      );

      host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'trash-card',
          number: 'trash-card',
          name: 'Trash Card',
          type: 'Event',
          cost: 0,
        }),
        'trash-card',
      );

      addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: garp.instanceId,
        sourceCardId: 'ST19-005',
      });

      const costDecision = engine.getPendingDecision();
      expect(costDecision).not.toBeNull();
      expect(costDecision!.prompt.type).toBe('selectCards');
      const trashCard = p1.zones.trash[0];
      engine.answerDecision({
        decisionId: costDecision!.id,
        selectedCardInstanceIds: [trashCard.instanceId],
      });

      const actionDecision = engine.getPendingDecision();
      expect(actionDecision).not.toBeNull();
      expect(actionDecision!.prompt.type).toBe('selectCards');
    });
  });
});
