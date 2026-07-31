/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from 'vitest';
import { DuelCard, type Card } from '@onepiecetcg/shared';
import { EffectEngine } from '../../../../effect-engine/src/effect-engine.js';
import { st10EffectDefinitions } from './ST-10.effects';
import { createRegistry, makeCard, TestHost } from '../test-utils.js';

describe('ST10 effect definitions', () => {
  const createEngine = (host: TestHost): EffectEngine => {
    const registry = createRegistry([st10EffectDefinitions]);
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

  describe('ST10-001 Trafalgar Law (Leader)', () => {
    it('bounces opponent character and plays a character from hand with DON!! -3', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST10-001');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      const p2 = host.getPlayer('p2')!;

      for (let index = 0; index < 3; index += 1) {
        p1.zones.donDeck.push(new DuelCard());
      }
      host.addDonToCost('p1', 3, false);

      const target = addCharacter(host, 'p2', {
        name: 'Weak Target',
        instanceSuffix: 'weak',
        power: 3000,
      });

      const cardInHand = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'playable',
          number: 'playable',
          name: 'Playable Char',
          type: 'Character',
          cost: 4,
          power: 5000,
        }),
        'playable',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: p1.zones.leader.instanceId,
        sourceCardId: 'ST10-001',
      });

      let decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(
        p2.zones.characters.find((c) => c.instanceId === target.instanceId),
      ).toBeFalsy();
      expect(p2.zones.deck[p2.zones.deck.length - 1].instanceId).toBe(
        target.instanceId,
      );

      decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [cardInHand.instanceId],
      });

      expect(
        p1.zones.characters.find((c) => c.instanceId === cardInHand.instanceId),
      ).toBeTruthy();
      expect(
        p1.zones.hand.find((c) => c.instanceId === cardInHand.instanceId),
      ).toBeFalsy();
    });
  });

  describe('ST10-002 Monkey.D.Luffy (Leader)', () => {
    it('adds 1 active DON!! when 0 DON!! on field', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST10-002');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      p1.zones.donDeck.push(new DuelCard());

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: p1.zones.leader.instanceId,
        sourceCardId: 'ST10-002',
      });

      expect(p1.zones.cost.length).toBe(1);
      expect(p1.zones.cost[0].rested).toBe(false);
    });

    it('adds 1 active DON!! when 8+ DON!! on field', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST10-002');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      for (let index = 0; index < 9; index += 1) {
        p1.zones.donDeck.push(new DuelCard());
      }
      host.addDonToCost('p1', 8, true);

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: p1.zones.leader.instanceId,
        sourceCardId: 'ST10-002',
      });

      expect(p1.zones.cost.length).toBe(9);
    });

    it('does nothing when DON!! count is between 1 and 7', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST10-002');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      for (let index = 0; index < 5; index += 1) {
        p1.zones.donDeck.push(new DuelCard());
      }
      host.addDonToCost('p1', 4, false);

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: p1.zones.leader.instanceId,
        sourceCardId: 'ST10-002',
      });

      expect(p1.zones.cost.length).toBe(4);
    });
  });

  describe('ST10-003 Eustass"Captain"Kid (Leader)', () => {
    it('applies -1000 continuous power when life >= 4 during your turn', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST10-003');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      for (let index = 0; index < 4; index += 1) {
        p1.zones.life.push(new DuelCard());
      }

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();
    });

    it('does not apply -1000 when life < 4', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST10-003');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      p1.zones.life.splice(0, p1.zones.life.length);
      for (let index = 0; index < 2; index += 1) {
        p1.zones.life.push(new DuelCard());
      }

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();
    });

    it('grants +2000 power on attack with DON!! -1', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST10-003');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      p1.zones.donDeck.push(new DuelCard());
      host.addDonToCost('p1', 1, false);

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: p1.zones.leader.instanceId,
        sourceCardId: 'ST10-003',
      });
    });
  });

  describe('ST10-004 Sanji', () => {
    it('gains Rush on play when opponent has 5000+ power character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const sanji = addCharacter(host, 'p1', {
        id: 'ST10-004',
        number: 'ST10-004',
        name: 'Sanji',
        instanceSuffix: 'sanji',
      });
      addCharacter(host, 'p2', {
        name: 'Big Threat',
        instanceSuffix: 'big',
        power: 5000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: sanji.instanceId,
        sourceCardId: 'ST10-004',
      });
    });

    it('does not gain Rush when opponent has no 5000+ power character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const sanji = addCharacter(host, 'p1', {
        id: 'ST10-004',
        number: 'ST10-004',
        name: 'Sanji',
        instanceSuffix: 'sanji',
      });
      addCharacter(host, 'p2', {
        name: 'Weak',
        instanceSuffix: 'weak',
        power: 3000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: sanji.instanceId,
        sourceCardId: 'ST10-004',
      });
    });
  });

  describe('ST10-006 Monkey.D.Luffy', () => {
    it('has Rush continuously', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const luffy = addCharacter(host, 'p1', {
        id: 'ST10-006',
        number: 'ST10-006',
        name: 'Monkey.D.Luffy',
        instanceSuffix: 'luffy',
      });

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(luffy.hasRush).toBe(true);
    });
  });

  describe('ST10-007 Killer', () => {
    it('KOs rested cost-3 opponent character on DON!! return', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      addCharacter(host, 'p1', {
        id: 'ST10-007',
        number: 'ST10-007',
        name: 'Killer',
        instanceSuffix: 'killer',
      });
      const p2 = host.getPlayer('p2')!;

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 3,
        power: 3000,
      });
      target.rested = true;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onDonReturned',
        playerSessionId: 'p1',
        sourceInstanceId: 'p1:killer',
        sourceCardId: 'ST10-007',
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
    });
  });

  describe('ST10-011 Heat', () => {
    it('gains +2000 power until start of next turn on DON!! return', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const heat = addCharacter(host, 'p1', {
        id: 'ST10-011',
        number: 'ST10-011',
        name: 'Heat',
        instanceSuffix: 'heat',
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onDonReturned',
        playerSessionId: 'p1',
        sourceInstanceId: heat.instanceId,
        sourceCardId: 'ST10-011',
      });
    });
  });

  describe('ST10-015 Gum-Gum Giant Sumo Slap', () => {
    it('grants +2000 power and KOs weak character as counter', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p2 = host.getPlayer('p2')!;

      const slap = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST10-015',
          number: 'ST10-015',
          name: 'Gum-Gum Giant Sumo Slap',
          type: 'Event',
          cost: 1,
          text: "[Counter] Up to 1 of your Leader or Character cards gains +2000 power during this battle, and K.O. up to 1 of your opponent's Characters with 2000 power or less.",
        }),
        'slap',
      );

      const target = addCharacter(host, 'p2', {
        name: 'Weak Target',
        instanceSuffix: 'weak',
        power: 2000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateCounter',
        playerSessionId: 'p1',
        sourceInstanceId: slap.instanceId,
        sourceCardId: 'ST10-015',
      });

      let decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [
          host.getPlayer('p1')!.zones.leader.instanceId,
        ],
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
  });

  describe('ST10-016 Gum-Gum Kong Gatling', () => {
    it('KOs opponent character with 7000 or less power as main', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p2 = host.getPlayer('p2')!;

      const gatling = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST10-016',
          number: 'ST10-016',
          name: 'Gum-Gum Kong Gatling',
          type: 'Event',
          cost: 7,
          text: "[Main] K.O. up to 1 of your opponent's Characters with 7000 power or less.",
        }),
        'gatling',
      );

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        power: 7000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: gatling.instanceId,
        sourceCardId: 'ST10-016',
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

    it('grants +1000 power to leader on trigger', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const gatling = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST10-016',
          number: 'ST10-016',
          name: 'Gum-Gum Kong Gatling',
          type: 'Event',
          cost: 7,
          text: '[Trigger] Up to 1 of your Leader gains +1000 power until the end of your next turn.',
        }),
        'gatling',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: gatling.instanceId,
        sourceCardId: 'ST10-016',
      });
    });
  });

  describe('Structural validation', () => {
    it('all cards have valid effect definitions', () => {
      for (const card of st10EffectDefinitions.cards) {
        expect(card.cardId).toMatch(/^ST10-\d{3}$/);
        if (card.effects && card.effects.length > 0) {
          for (const entry of card.effects) {
            if (entry.kind === 'standard') {
              expect(entry.effect.id).toBeTruthy();
              expect(entry.effect.trigger.type).toBeTruthy();
              expect(entry.effect.actions.length).toBeGreaterThan(0);
            }
            if (entry.kind === 'continuous') {
              expect(entry.effect.id).toBeTruthy();
              expect(entry.effect.modifier).toBeDefined();
            }
          }
        }
      }
    });

    it('ST10-007 Killer uses onDonReturned trigger with correct conditions', () => {
      const card = st10EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST10-007',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onDonReturned');
        expect(stdEntry.effect.trigger.oncePerTurn).toBe(true);
        expect(stdEntry.effect.conditions).toContainEqual({
          type: 'controllerTurn',
          value: true,
        });
        expect(stdEntry.effect.conditions).toContainEqual({
          type: 'eventPlayerIs',
          player: 'self',
        });
      }
    });

    it('ST10-006 has Rush continuous effect and onBlock standard effect', () => {
      const card = st10EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST10-006',
      );
      expect(card).toBeDefined();
      const contEntry = card!.effects?.find((e) => e.kind === 'continuous');
      expect(contEntry).toBeDefined();
      if (contEntry?.kind === 'continuous') {
        expect(contEntry.effect.modifier.keywords).toContain('rush');
      }
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onBlock');
        expect(stdEntry.effect.trigger.oncePerTurn).toBe(true);
        expect(stdEntry.effect.conditions).toContainEqual({
          type: 'eventPlayerIs',
          player: 'opponent',
        });
      }
    });

    it('ST10-001 has activateMain trigger with DON!! -3 cost', () => {
      const card = st10EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST10-001',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('activateMain');
        expect(stdEntry.effect.trigger.oncePerTurn).toBe(true);
        expect(stdEntry.effect.costs).toContainEqual({
          type: 'removeDon',
          player: 'self',
          amount: 3,
        });
      }
    });
  });
});
