/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from 'vitest';
import { DuelCard, type Card } from '@onepiecetcg/shared';
import { EffectEngine } from '../../../../effect-engine/src/effect-engine.js';
import { st23EffectDefinitions } from './ST-23.effects';
import { createRegistry, makeCard, TestHost } from '../test-utils.js';

describe('ST23 effect definitions', () => {
  const createEngine = (host: TestHost): EffectEngine => {
    const registry = createRegistry([st23EffectDefinitions]);
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
      don.instanceId = `${sessionId}:don:cost:${index}`;
      don.ownerSessionId = sessionId;
      don.rested = rested;
      player.zones.cost.push(don);
    }
  };

  describe('ST23-001 Uta', () => {
    it('has continuous cost reduction for hand when self has 10000 power character', () => {
      const card = st23EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST23-001',
      );
      expect(card).toBeDefined();
      const contEntry = card!.effects?.find((e) => e.kind === 'continuous');
      expect(contEntry).toBeDefined();
      if (contEntry?.kind === 'continuous') {
        expect(contEntry.effect.id).toBe(
          'st23-001-hand-cost-minus-4-if-character-10000-power',
        );
        expect(contEntry.effect.modifier.cost).toBe(-4);
        expect(contEntry.effect.modifier.selector.zones).toContain('hand');
        expect(contEntry.effect.modifier.selector.filter?.name).toContain(
          'Uta',
        );
        expect(contEntry.effect.conditions).toContainEqual({
          type: 'targetExists',
          selector: {
            player: 'self',
            zones: ['characters'],
            filter: { cardCategory: ['Character'], powerMin: 10000 },
          },
        });
      }
    });
  });

  describe('ST23-002 Shanks', () => {
    it('has continuous cost reduction for hand when opponent has 8000 base power character', () => {
      const card = st23EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST23-002',
      );
      expect(card).toBeDefined();
      const contEntry = card!.effects?.find((e) => e.kind === 'continuous');
      expect(contEntry).toBeDefined();
      if (contEntry?.kind === 'continuous') {
        expect(contEntry.effect.modifier.cost).toBe(-3);
        expect(contEntry.effect.conditions).toContainEqual({
          type: 'targetExists',
          selector: {
            player: 'opponent',
            zones: ['characters'],
            filter: {
              cardCategory: ['Character'],
              basePowerMin: 8000,
            },
          },
        });
      }
    });

    it('gives leader +2000 power on play when leader has Red-Haired Pirates type', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      // Set leader with Red-Haired Pirates type
      p1.zones.leader.families = ['Red-Haired Pirates'];

      const shanks = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST23-002',
          number: 'ST23-002',
          name: 'Shanks',
          type: 'Character',
          cost: 5,
          power: 7000,
          families: ['Red-Haired Pirates'],
        }),
        'shanks',
      );

      const powerBefore = p1.zones.leader.power;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: shanks.instanceId,
        sourceCardId: 'ST23-002',
      });

      expect(p1.zones.leader.power).toBe(powerBefore + 2000);
    });

    it('gives leader +2000 power on play when leader is Uta', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'UTA-001');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      p1.zones.leader.name = 'Uta';
      p1.zones.leader.families = ['FILM'];

      const shanks = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST23-002',
          number: 'ST23-002',
          name: 'Shanks',
          type: 'Character',
          cost: 5,
          power: 7000,
          families: ['Red-Haired Pirates'],
        }),
        'shanks',
      );

      const powerBefore = p1.zones.leader.power;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: shanks.instanceId,
        sourceCardId: 'ST23-002',
      });

      expect(p1.zones.leader.power).toBe(powerBefore + 2000);
    });

    it('does not give leader +2000 power when leader is neither Red-Haired Pirates nor Uta', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      p1.zones.leader.families = ['Navy'];

      const shanks = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST23-002',
          number: 'ST23-002',
          name: 'Shanks',
          type: 'Character',
          cost: 5,
          power: 7000,
          families: ['Red-Haired Pirates'],
        }),
        'shanks',
      );

      const powerBefore = p1.zones.leader.power;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: shanks.instanceId,
        sourceCardId: 'ST23-002',
      });

      expect(p1.zones.leader.power).toBe(powerBefore);
    });
  });

  describe('ST23-003 Benn.Beckman', () => {
    it('KOs opponent character with 4000 base power or less on play with Red-Haired Pirates leader', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      // Set leader type
      p1.zones.leader.families = ['Red-Haired Pirates'];

      const beckman = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST23-003',
          number: 'ST23-003',
          name: 'Benn.Beckman',
          type: 'Character',
          cost: 4,
          power: 5000,
          families: ['Red-Haired Pirates'],
        }),
        'beckman',
      );

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 2,
        power: 3000,
      });

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
        sourceInstanceId: beckman.instanceId,
        sourceCardId: 'ST23-003',
      });

      // Cost decision: trash 1 from hand
      const costDecision = engine.getPendingDecision();
      expect(costDecision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: costDecision!.id,
        selectedCardInstanceIds: [handCard.instanceId],
      });

      // Target decision: select character to KO
      const targetDecision = engine.getPendingDecision();
      expect(targetDecision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: targetDecision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(
        p1.zones.trash.find((c) => c.instanceId === handCard.instanceId),
      ).toBeTruthy();
      expect(
        host
          .getPlayer('p2')
          ?.zones.characters.find((c) => c.instanceId === target.instanceId),
      ).toBeFalsy();
      expect(
        host
          .getPlayer('p2')
          ?.zones.trash.find((c) => c.instanceId === target.instanceId),
      ).toBeTruthy();
    });

    it('does not KO when leader lacks Red-Haired Pirates type', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      const p2 = host.getPlayer('p2')!;
      p1.zones.leader.families = ['Navy'];

      host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST23-003',
          number: 'ST23-003',
          name: 'Benn.Beckman',
          type: 'Character',
          cost: 4,
          power: 5000,
          families: ['Red-Haired Pirates'],
        }),
        'beckman',
      );

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 2,
        power: 3000,
      });

      host.addCardToZone(
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
        sourceInstanceId: p1.zones.characters[0].instanceId,
        sourceCardId: 'ST23-003',
      });

      // No decision is created because conditions fail (leader lacks Red-Haired Pirates)
      expect(engine.getPendingDecision()).toBeNull();
      // Target character is still in opponent's characters zone
      expect(
        p2.zones.characters.find((c) => c.instanceId === target.instanceId),
      ).toBeTruthy();
    });
  });

  describe('ST23-004 Monkey.D.Luffy', () => {
    it('rests 1 DON!! and self, giving -1000 power to opponent character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const luffy = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST23-004',
          number: 'ST23-004',
          name: 'Monkey.D.Luffy',
          type: 'Character',
          cost: 4,
          power: 5000,
          counter: 1000,
        }),
        'luffy',
      );

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 5,
        power: 6000,
      });

      // Put exactly 1 DON!! card in cost (rest action rests all matching cards)
      putDonInCost(host, 'p1', 1, false);

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: luffy.instanceId,
        sourceCardId: 'ST23-004',
      });

      // Cost actions (rest auto-resolves by resting all matching cards),
      // then modifyPower asks for target selection
      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(p1.zones.cost[0].rested).toBe(true);
      expect(luffy.rested).toBe(true);
      expect(target.power).toBe(5000);
    });
  });

  describe('ST23-005 Yasopp', () => {
    it('attaches a rested DON!! to leader on activate main once per turn', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const yasopp = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST23-005',
          number: 'ST23-005',
          name: 'Yasopp',
          type: 'Character',
          cost: 2,
          power: 3000,
          counter: 2000,
          families: ['Red-Haired Pirates'],
        }),
        'yasopp',
      );

      // AttachDon with rested:true requires rested DON!! cards in cost
      putDonInCost(host, 'p1', 3, true);

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: yasopp.instanceId,
        sourceCardId: 'ST23-005',
      });

      // Target decision: select leader or character to attach DON!! to
      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [p1.zones.leader.instanceId],
      });

      expect(p1.zones.leader.attachedDon).toBe(1);
    });

    it('has oncePerTurn flag on the activateMain trigger', () => {
      const card = st23EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST23-005',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('activateMain');
        expect(stdEntry.effect.trigger.oncePerTurn).toBe(true);
      }
    });
  });

  describe('Structural validation', () => {
    it('all cards have valid effect definitions', () => {
      for (const card of st23EffectDefinitions.cards) {
        expect(card.cardId).toMatch(/^ST23-\d{3}$/);
        if (card.effects && card.effects.length > 0) {
          for (const entry of card.effects) {
            if (entry.kind === 'standard') {
              expect(entry.effect.id).toBeTruthy();
              expect(entry.effect.trigger.type).toBeTruthy();
              expect(entry.effect.actions.length).toBeGreaterThan(0);
            }
            if (entry.kind === 'continuous') {
              expect(entry.effect.id).toBeTruthy();
              expect(entry.effect.modifier.selector).toBeTruthy();
            }
          }
        }
      }
    });

    it('ST23-001 has continuous cost reduction', () => {
      const card = st23EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST23-001',
      );
      expect(card).toBeDefined();
      const contEntry = card!.effects?.find((e) => e.kind === 'continuous');
      expect(contEntry).toBeDefined();
    });

    it('ST23-002 has both continuous and standard effects', () => {
      const card = st23EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST23-002',
      );
      expect(card).toBeDefined();
      const contEntry = card!.effects?.find((e) => e.kind === 'continuous');
      expect(contEntry).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onPlay');
        expect(stdEntry.effect.actions.length).toBe(1);
        const action = stdEntry.effect.actions[0];
        expect(action.type).toBe('ifAnyConditionGroupMatches');
        if (action.type === 'ifAnyConditionGroupMatches') {
          expect(action.conditionGroups.length).toBe(2);
        }
      }
    });

    it('ST23-003 has onPlay with trash cost and leader type condition', () => {
      const card = st23EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST23-003',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onPlay');
        expect(stdEntry.effect.costs).toHaveLength(1);
        expect(stdEntry.effect.conditions).toContainEqual({
          type: 'playerHasLeaderTrait',
          player: 'self',
          value: 'Red-Haired Pirates',
        });
      }
    });

    it('ST23-004 has activateMain with dual rest costs', () => {
      const card = st23EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST23-004',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('activateMain');
        expect(stdEntry.effect.costs).toHaveLength(2);
      }
    });

    it('ST23-005 has activateMain once per turn with attachDon', () => {
      const card = st23EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST23-005',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('activateMain');
        expect(stdEntry.effect.trigger.oncePerTurn).toBe(true);
        expect(stdEntry.effect.actions.length).toBe(1);
        const action = stdEntry.effect.actions[0];
        expect(action.type).toBe('attachDon');
        if (action.type === 'attachDon') {
          expect(action.rested).toBe(true);
          expect(action.amount).toBe(1);
        }
      }
    });
  });
});
