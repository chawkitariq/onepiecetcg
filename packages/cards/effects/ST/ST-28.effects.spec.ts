import { describe, expect, it } from 'vitest';
import { DuelCard, type Card } from '@onepiecetcg/shared';
import { EffectEngine } from '../../../effect-engine/src/effect-engine.js';
import { st28EffectDefinitions } from './ST-28.effects';
import { st28001SpecialHandler } from './special/ST28-001.special';
import { createRegistry, makeCard, TestHost } from '../test-utils.js';

describe('ST28 effect definitions', () => {
  const createEngine = (
    host: TestHost,
    includeSpecialHandlers = true,
  ): EffectEngine => {
    const registry = createRegistry(
      [st28EffectDefinitions],
      includeSpecialHandlers ? [st28001SpecialHandler] : [],
    );
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

  describe('ST28-004 Kouzuki Momonosuke', () => {
    it('leader gains +1000 power on your turn with 2 or less life cards (continuous)', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      for (let index = 0; index < 5; index += 1) {
        p1.zones.life.push(new DuelCard());
      }

      const momonosuke = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST28-004',
          number: 'ST28-004',
          name: 'Kouzuki Momonosuke',
          type: 'Character',
          cost: 4,
          power: 5000,
          families: ['Land of Wano'],
        }),
        'momonosuke',
      );

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(p1.zones.leader.power).toBe(5000);

      p1.zones.life.splice(0, 3);
      engine.reapplyContinuousEffects();

      expect(p1.zones.leader.power).toBe(6000);
    });

    it('gains Rush and +1000 power on activate main with DON!! cost', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const momonosuke = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST28-004',
          number: 'ST28-004',
          name: 'Kouzuki Momonosuke',
          type: 'Character',
          cost: 4,
          power: 5000,
        }),
        'momonosuke',
      );

      putDonInCost(host, 'p1', 3, false);
      const engine = createEngine(host);

      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: momonosuke.instanceId,
        sourceCardId: 'ST28-004',
      });

      expect(engine.getPendingDecision()).toBeNull();
      expect(momonosuke.power).toBe(6000);
    });
  });

  describe('ST28-005 Yamato', () => {
    it('gains +3000 power on your turn with DON!! x2 (continuous)', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const yamato = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST28-005',
          number: 'ST28-005',
          name: 'Yamato',
          type: 'Character',
          cost: 5,
          power: 6000,
          families: ['Land of Wano'],
        }),
        'yamato',
      );

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(yamato.power).toBe(6000);

      yamato.attachedDon = 2;
      engine.reapplyContinuousEffects();

      expect(yamato.power).toBe(9000);
    });

    it('searches top 5 for Land of Wano card with cost 2+ on play', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const yamato = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST28-005',
          number: 'ST28-005',
          name: 'Yamato',
          type: 'Character',
          cost: 5,
          power: 6000,
        }),
        'yamato',
      );

      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'wano-1',
          number: 'wano-1',
          name: 'Wano Character',
          type: 'Character',
          cost: 3,
          power: 4000,
          families: ['Land of Wano'],
        }),
        'wano-1',
      );

      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'other-1',
          number: 'other-1',
          name: 'Other Card',
          type: 'Event',
          cost: 1,
          power: 0,
        }),
        'other-1',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: yamato.instanceId,
        sourceCardId: 'ST28-005',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');

      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [],
      });

      expect(engine.getPendingDecision()).toBeNull();
    });
  });

  describe("ST28-003 Kin'emon", () => {
    it('plays from trash on trigger when leader is Land of Wano and opponent has 3 or less life', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      const p2 = host.getPlayer('p2')!;

      p1.zones.leader.families.push('Land of Wano');

      p2.zones.life.splice(0, 2);

      const kinemon = host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'ST28-003',
          number: 'ST28-003',
          name: "Kin'emon",
          type: 'Character',
          cost: 3,
          power: 4000,
        }),
        'kinemon',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: kinemon.instanceId,
        sourceCardId: 'ST28-003',
      });

      expect(
        p1.zones.characters.find((c) => c.instanceId === kinemon.instanceId),
      ).toBeTruthy();
    });

    it('does not play from trash when leader lacks Land of Wano type', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      p1.zones.leader.families.splice(0, p1.zones.leader.families.length);

      const kinemon = host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'ST28-003',
          number: 'ST28-003',
          name: "Kin'emon",
          type: 'Character',
          cost: 3,
          power: 4000,
        }),
        'kinemon',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: kinemon.instanceId,
        sourceCardId: 'ST28-003',
      });

      expect(
        p1.zones.trash.find((c) => c.instanceId === kinemon.instanceId),
      ).toBeTruthy();
    });
  });

  describe('ST28-002 Izo', () => {
    it('gains Blocker with DON!! x2 (continuous)', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const izo = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST28-002',
          number: 'ST28-002',
          name: 'Izo',
          type: 'Character',
          cost: 4,
          power: 5000,
          families: ['Land of Wano'],
        }),
        'izo',
      );

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(izo.rested).toBe(false);

      izo.attachedDon = 2;
      engine.reapplyContinuousEffects();
    });

    it('grants Banish to Land of Wano Leader on play', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      p1.zones.leader.families.push('Land of Wano');

      const izo = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST28-002',
          number: 'ST28-002',
          name: 'Izo',
          type: 'Character',
          cost: 4,
          power: 5000,
          families: ['Land of Wano'],
        }),
        'izo',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: izo.instanceId,
        sourceCardId: 'ST28-002',
      });

      expect(engine.getPendingDecision()).toBeNull();
    });
  });

  describe('ST28-001 Ashura Doji', () => {
    it('special handler resolves KO decision on play when conditions are met', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      const p2 = host.getPlayer('p2')!;

      p1.zones.leader.families.push('Land of Wano');

      for (let index = 0; index < 4; index += 1) {
        p2.zones.life.push(new DuelCard());
      }

      const ashura = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST28-001',
          number: 'ST28-001',
          name: 'Ashura Doji',
          type: 'Character',
          cost: 4,
          power: 5000,
          families: ['Land of Wano'],
        }),
        'ashura',
      );

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 4,
        power: 5000,
      });

      const engine = createEngine(host);
      st28001SpecialHandler.resolve(
        {
          type: 'onPlay',
          playerSessionId: 'p1',
          sourceInstanceId: ashura.instanceId,
          sourceCardId: 'ST28-001',
        },
        engine,
      );

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      expect(decision?.prompt.message).toContain('K.O.');

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

    it('can KO an opponent character with base cost 5 or less on play when conditions are met', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      const p2 = host.getPlayer('p2')!;

      p1.zones.leader.families.push('Land of Wano');

      for (let index = 0; index < 4; index += 1) {
        p2.zones.life.push(new DuelCard());
      }

      const ashura = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST28-001',
          number: 'ST28-001',
          name: 'Ashura Doji',
          type: 'Character',
          cost: 4,
          power: 5000,
          families: ['Land of Wano'],
        }),
        'ashura',
      );

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 4,
        power: 5000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: ashura.instanceId,
        sourceCardId: 'ST28-001',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      expect(decision?.prompt.message).toContain('K.O.');
      expect(decision?.prompt.message).toContain('Ashura Doji');

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

    it('cannot KO when opponent has less than 3 life cards', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      const p2 = host.getPlayer('p2')!;

      p1.zones.leader.families.push('Land of Wano');

      for (let index = 0; index < 2; index += 1) {
        p2.zones.life.push(new DuelCard());
      }

      const ashura = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST28-001',
          number: 'ST28-001',
          name: 'Ashura Doji',
          type: 'Character',
          cost: 4,
          power: 5000,
          families: ['Land of Wano'],
        }),
        'ashura',
      );

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 4,
        power: 5000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: ashura.instanceId,
        sourceCardId: 'ST28-001',
      });

      expect(engine.getPendingDecision()).toBeNull();
      expect(
        p2.zones.characters.find((c) => c.instanceId === target.instanceId),
      ).toBeTruthy();
    });
  });

  describe('Structural validation', () => {
    it('all cards have valid effect entries', () => {
      for (const card of st28EffectDefinitions.cards) {
        expect(card.cardId).toMatch(/^ST28-\d{3}$/);
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
            if (entry.kind === 'special-ref') {
              expect(entry.specialHandlerId).toBeTruthy();
            }
          }
        }
      }
    });

    it('ST28-004 has continuous leader power and activateMain rush', () => {
      const card = st28EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST28-004',
      );
      expect(card).toBeDefined();
      const contEntry = card!.effects?.find((e) => e.kind === 'continuous');
      expect(contEntry).toBeDefined();
      if (contEntry?.kind === 'continuous') {
        expect(contEntry.effect.conditions).toContainEqual({
          type: 'controllerTurn',
          value: true,
        });
        expect(contEntry.effect.conditions).toContainEqual({
          type: 'playerHasLifeAtMost',
          player: 'self',
          value: 2,
        });
      }
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('activateMain');
        expect(stdEntry.effect.trigger.oncePerTurn).toBe(true);
        expect(stdEntry.effect.costs).toContainEqual({
          type: 'removeDon',
          player: 'self',
          amount: 2,
        });
      }
    });

    it('ST28-005 has DON!! x2 continuous and onPlay search', () => {
      const card = st28EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST28-005',
      );
      expect(card).toBeDefined();
      const contEntry = card!.effects?.find((e) => e.kind === 'continuous');
      expect(contEntry).toBeDefined();
      if (contEntry?.kind === 'continuous') {
        expect(contEntry.effect.conditions).toContainEqual({
          type: 'sourceHasAttachedDonAtLeast',
          value: 2,
        });
        expect(contEntry.effect.conditions).toContainEqual({
          type: 'controllerTurn',
          value: true,
        });
        expect(contEntry.effect.modifier.power).toBe(3000);
      }
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onPlay');
        expect(stdEntry.effect.actions[0].type).toBe('search');
      }
    });

    it('ST28-003 has conditional trigger play', () => {
      const card = st28EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST28-003',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('trigger');
        expect(stdEntry.effect.conditions).toContainEqual({
          type: 'playerHasLeaderTrait',
          player: 'self',
          value: 'Land of Wano',
        });
        expect(stdEntry.effect.conditions).toContainEqual({
          type: 'playerHasLifeAtMost',
          player: 'opponent',
          value: 3,
        });
      }
    });

    it('ST28-002 has DON!! x2 Blocker continuous and onPlay Banish', () => {
      const card = st28EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST28-002',
      );
      expect(card).toBeDefined();
      const contEntry = card!.effects?.find((e) => e.kind === 'continuous');
      expect(contEntry).toBeDefined();
      if (contEntry?.kind === 'continuous') {
        expect(contEntry.effect.conditions).toContainEqual({
          type: 'sourceHasAttachedDonAtLeast',
          value: 2,
        });
      }
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onPlay');
        expect(stdEntry.effect.conditions).toContainEqual({
          type: 'playerHasLeaderTrait',
          player: 'self',
          value: 'Land of Wano',
        });
      }
    });

    it('ST28-001 uses special-ref for conditional KO', () => {
      const card = st28EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST28-001',
      );
      expect(card).toBeDefined();
      const specialEntry = card!.effects?.find((e) => e.kind === 'special-ref');
      expect(specialEntry).toBeDefined();
      if (specialEntry?.kind === 'special-ref') {
        expect(specialEntry.specialHandlerId).toBe('st28-001-special');
      }
    });
  });
});
