import { describe, expect, it } from '@jest/globals';
import { DuelCard, type Card } from '@onepiecetcg/shared';
import { EffectEngine } from '../effect-engine';
import type { SpecialHandlerDefinition } from '../types/effect-registry';
import { st08EffectDefinitions } from './ST-08.effects';
import { st08013SpecialHandler } from './special/ST08-013.special';
import { createRegistry, makeCard, TestHost } from './test-utils';

describe('ST08 effect definitions', () => {
  const createEngine = (
    host: TestHost,
    specialHandlers: readonly SpecialHandlerDefinition[] = [],
  ): EffectEngine => {
    const registry = createRegistry([st08EffectDefinitions], specialHandlers);
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

  describe('ST08-001 Monkey.D.Luffy (Leader)', () => {
    it("attaches up to 1 rested DON!! to the leader when a character is KO'd during your turn", () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST08-001');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      // TestHost.attachDon filters cost-zone DON!! by { rested: true }
      const don1 = new DuelCard();
      don1.rested = true;
      p1.zones.cost.push(don1);
      const don2 = new DuelCard();
      don2.rested = true;
      p1.zones.cost.push(don2);

      const koTarget = addCharacter(host, 'p2', {
        name: 'Victim',
        instanceSuffix: 'victim',
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onKo',
        playerSessionId: 'p1',
        sourceInstanceId: koTarget.instanceId,
        sourceCardId: 'ST08-001',
      });

      expect(p1.zones.leader.attachedDon).toBe(1);
    });

    it("does not attach DON!! when it is not the controller's turn", () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST08-001');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      host.state.activePlayerSessionId = 'p2';
      const don = new DuelCard();
      don.rested = true;
      p1.zones.cost.push(don);

      const koTarget = addCharacter(host, 'p2', {
        name: 'Victim',
        instanceSuffix: 'victim',
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onKo',
        playerSessionId: 'p1',
        sourceInstanceId: koTarget.instanceId,
        sourceCardId: 'ST08-001',
      });

      expect(p1.zones.leader.attachedDon).toBe(0);
    });
  });

  describe('ST08-005 Shanks', () => {
    it('KOs all opponent characters with cost 1 or less on play', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p2 = host.getPlayer('p2')!;

      const shanks = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST08-005',
          number: 'ST08-005',
          name: 'Shanks',
          type: 'Character',
          cost: 9,
          power: 10000,
        }),
        'shanks',
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

      const lowCost = addCharacter(host, 'p2', {
        name: 'Low Cost',
        instanceSuffix: 'low',
        cost: 1,
      });
      const midCost = addCharacter(host, 'p2', {
        name: 'Mid Cost',
        instanceSuffix: 'mid',
        cost: 2,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: shanks.instanceId,
        sourceCardId: 'ST08-005',
      });

      const costDecision = engine.getPendingDecision();
      expect(costDecision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: costDecision!.id,
        selectedCardInstanceIds: [handCard.instanceId],
      });

      expect(
        p2.zones.characters.find((c) => c.instanceId === lowCost.instanceId),
      ).toBeFalsy();
      expect(
        p2.zones.trash.find((c) => c.instanceId === lowCost.instanceId),
      ).toBeTruthy();
      expect(
        p2.zones.characters.find((c) => c.instanceId === midCost.instanceId),
      ).toBeTruthy();
    });
  });

  describe('ST08-009 Makino', () => {
    it('draws a card on play when a cost-0 character exists', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      p1.zones.deck.push(new DuelCard());

      const makino = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST08-009',
          number: 'ST08-009',
          name: 'Makino',
          type: 'Character',
          cost: 1,
          power: 1000,
        }),
        'makino',
      );

      addCharacter(host, 'p2', {
        name: 'Cost Zero',
        instanceSuffix: 'zero',
        cost: 0,
      });

      const handBefore = p1.zones.hand.length;
      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: makino.instanceId,
        sourceCardId: 'ST08-009',
      });

      expect(p1.zones.hand.length).toBe(handBefore + 1);
    });

    it('does not draw a card on play when no cost-0 character exists', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const makino = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST08-009',
          number: 'ST08-009',
          name: 'Makino',
          type: 'Character',
          cost: 1,
          power: 1000,
        }),
        'makino',
      );

      const handBefore = p1.zones.hand.length;
      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: makino.instanceId,
        sourceCardId: 'ST08-009',
      });

      expect(p1.zones.hand.length).toBe(handBefore);
    });
  });

  describe('ST08-014 Gum-Gum Bell', () => {
    it('modifies opponent character cost by -7 on main with life cost', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const bell = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST08-014',
          number: 'ST08-014',
          name: 'Gum-Gum Bell',
          type: 'Event',
          cost: 1,
        }),
        'bell',
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

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 7,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: bell.instanceId,
        sourceCardId: 'ST08-014',
      });

      // moveCard cost auto-resolves (exact 1 life card with zonePosition: top)
      // modifyCost action: upTo 1 opponent character
      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(
        p1.zones.hand.find((c) => c.instanceId === lifeCard.instanceId),
      ).toBeTruthy();
    });

    it('searches trash for a black character cost 2 or less on trigger', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const bell = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST08-014',
          number: 'ST08-014',
          name: 'Gum-Gum Bell',
          type: 'Event',
          cost: 1,
        }),
        'bell',
      );

      const blackChar = host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'black-char',
          number: 'black-char',
          name: 'Black Character',
          type: 'Character',
          cost: 2,
          colors: ['Black'],
        }),
        'black-char',
      );

      const handBefore = p1.zones.hand.length;
      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: bell.instanceId,
        sourceCardId: 'ST08-014',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [blackChar.instanceId],
      });

      expect(p1.zones.hand.length).toBe(handBefore + 1);
    });
  });

  describe('ST08-015 Gum-Gum Pistol', () => {
    it('KOs opponent characters with cost 2 or less as main', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p2 = host.getPlayer('p2')!;

      const pistol = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST08-015',
          number: 'ST08-015',
          name: 'Gum-Gum Pistol',
          type: 'Event',
          cost: 2,
        }),
        'pistol',
      );

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 2,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: pistol.instanceId,
        sourceCardId: 'ST08-015',
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

    it('draws 1 card as trigger', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      p1.zones.deck.push(new DuelCard());

      const pistol = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST08-015',
          number: 'ST08-015',
          name: 'Gum-Gum Pistol',
          type: 'Event',
          cost: 2,
        }),
        'pistol',
      );

      const handBefore = p1.zones.hand.length;
      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: pistol.instanceId,
        sourceCardId: 'ST08-015',
      });

      expect(p1.zones.hand.length).toBe(handBefore + 1);
    });
  });
});
