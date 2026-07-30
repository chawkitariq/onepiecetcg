import { describe, expect, it } from '@jest/globals';
import { DuelCard, type Card } from '@onepiecetcg/shared';
import { EffectEngine } from '../../effect-engine';
import { st26EffectDefinitions } from './ST-26.effects';
import { createRegistry, makeCard, TestHost } from '../test-utils';

describe('ST26 effect definitions', () => {
  const createEngine = (host: TestHost): EffectEngine => {
    const registry = createRegistry([st26EffectDefinitions]);
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
    rested = false,
  ): void => {
    const player = host.getPlayer(sessionId)!;
    for (let index = 0; index < count; index += 1) {
      const don = new DuelCard();
      don.rested = rested;
      player.zones.cost.push(don);
    }
  };

  describe('ST26-001 Soba Mask', () => {
    it('has continuous cost reduction effect when condition is met', () => {
      const card = st26EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST26-001',
      );
      expect(card).toBeDefined();
      const contEntry = card!.effects?.find((e) => e.kind === 'continuous');
      expect(contEntry).toBeDefined();
      if (contEntry?.kind === 'continuous') {
        expect(contEntry.effect.conditions).toContainEqual({
          type: 'targetExists',
          selector: {
            player: 'self',
            zones: ['characters'],
            filter: {
              cardCategory: ['Character'],
              trait: ['San-Gorou', 'Sanji'],
              basePowerMin: 7000,
            },
          },
        });
        expect(contEntry.effect.modifier.cost).toBe(-5);
      }
    });

    it('returns San-Gorou and Sanji characters to hand on play', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const sobaMask = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST26-001',
          number: 'ST26-001',
          name: 'Soba Mask',
          type: 'Character',
          cost: 5,
          power: 6000,
          counter: 0,
          families: ['Straw Hat Crew', 'Germa'],
        }),
        'soba-mask',
      );

      const sanji = addCharacter(host, 'p1', {
        name: 'Sanji',
        instanceSuffix: 'sanji',
        cost: 4,
        power: 5000,
        families: ['Straw Hat Crew', 'Germa', 'Sanji'],
        id: 'ST26-xxx',
        number: 'ST26-xxx',
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: sobaMask.instanceId,
        sourceCardId: 'ST26-001',
      });

      expect(
        p1.zones.hand.find((c) => c.instanceId === sanji.instanceId),
      ).toBeTruthy();
      expect(
        p1.zones.characters.find((c) => c.instanceId === sanji.instanceId),
      ).toBeFalsy();
    });
  });

  describe('ST26-002 Tony Tony.Chopper', () => {
    it('rests opponent DON!! card on play with DON!! -2 cost', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p2 = host.getPlayer('p2')!;

      const chopper = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST26-002',
          number: 'ST26-002',
          name: 'Tony Tony.Chopper',
          type: 'Character',
          cost: 3,
          power: 3000,
          counter: 1000,
          families: ['Straw Hat Crew'],
        }),
        'chopper',
      );

      putDonInCost(host, 'p1', 2, false);

      const don = new DuelCard();
      don.rested = false;
      p2.zones.cost.push(don);

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: chopper.instanceId,
        sourceCardId: 'ST26-002',
      });

      expect(don.rested).toBe(true);
    });

    it('rests opponent character with cost 1 or less on play', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const chopper = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST26-002',
          number: 'ST26-002',
          name: 'Tony Tony.Chopper',
          type: 'Character',
          cost: 3,
          power: 3000,
          counter: 1000,
          families: ['Straw Hat Crew'],
        }),
        'chopper',
      );

      putDonInCost(host, 'p1', 2, false);

      const target = addCharacter(host, 'p2', {
        name: 'Weak Character',
        instanceSuffix: 'target',
        cost: 1,
        power: 1000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: chopper.instanceId,
        sourceCardId: 'ST26-002',
      });

      expect(target.rested).toBe(true);
    });
  });

  describe('ST26-003 Nico Robin', () => {
    it('adds 1 DON!! card from DON!! deck on play with DON!! -2 cost', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const robin = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST26-003',
          number: 'ST26-003',
          name: 'Nico Robin',
          type: 'Character',
          cost: 3,
          power: 4000,
          counter: 1000,
          families: ['Straw Hat Crew'],
        }),
        'robin',
      );

      putDonInCost(host, 'p1', 2, false);

      const donCards = [new DuelCard(), new DuelCard(), new DuelCard()];
      for (const don of donCards) {
        p1.zones.donDeck.push(don);
      }
      // donDeck: 3, cost: 2
      // DON!! -2 returns 2 from cost to donDeck → donDeck: 5, cost: 0
      // addDon 1 moves 1 from donDeck to cost → donDeck: 4, cost: 1

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: robin.instanceId,
        sourceCardId: 'ST26-003',
      });

      expect(p1.zones.donDeck.length).toBe(4);
      expect(p1.zones.cost.length).toBe(1);
    });
  });

  describe('ST26-004 General Franky', () => {
    it('gives up to 2 opponent characters -2000 power on play with DON!! -2 cost', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const franky = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST26-004',
          number: 'ST26-004',
          name: 'General Franky',
          type: 'Character',
          cost: 3,
          power: 4000,
          counter: 1000,
          families: ['Straw Hat Crew'],
        }),
        'franky',
      );

      putDonInCost(host, 'p1', 2, false);

      const target1 = addCharacter(host, 'p2', {
        name: 'Target 1',
        instanceSuffix: 'target1',
        cost: 4,
        power: 5000,
      });
      const target2 = addCharacter(host, 'p2', {
        name: 'Target 2',
        instanceSuffix: 'target2',
        cost: 3,
        power: 4000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: franky.instanceId,
        sourceCardId: 'ST26-004',
      });

      // Should trigger a selectCards prompt to pick up to 2 targets
      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
    });
  });

  describe('ST26-005 Monkey.D.Luffy', () => {
    it('boosts leader power on play with DON!! -2 when conditions met', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      const p2 = host.getPlayer('p2')!;

      // Set leader as multicolor
      const leader = p1.zones.leader;
      leader.colors = ['Red', 'Green'];

      // Give leader Straw Hat Crew trait
      leader.families = ['Straw Hat Crew'];
      leader.power = 5000;

      const luffy = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST26-005',
          number: 'ST26-005',
          name: 'Monkey.D.Luffy',
          type: 'Character',
          cost: 3,
          power: 5000,
          counter: 1000,
          families: ['Straw Hat Crew'],
        }),
        'luffy',
      );

      putDonInCost(host, 'p1', 2, false);

      // Give opponent 5+ DON!! cards
      for (let index = 0; index < 5; index += 1) {
        const don = new DuelCard();
        don.rested = false;
        p2.zones.cost.push(don);
      }

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: luffy.instanceId,
        sourceCardId: 'ST26-005',
      });

      // Effect should have triggered - leader gets +2000 (5000 -> 7000 base)
      // After the effect resolves, leader power should be 7000
      expect(leader.power).toBe(7000);
    });
  });

  describe('Structural validation', () => {
    it('all cards have valid effect definitions with no bare placeholders', () => {
      for (const card of st26EffectDefinitions.cards) {
        expect(card.cardId).toMatch(/^ST26-\d{3}$/);
        expect(card.effects).toBeDefined();
        expect(card.effects!.length).toBeGreaterThan(0);
        for (const entry of card.effects!) {
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
    });

    it('ST26-001 has continuous cost reduction and standard onPlay', () => {
      const card = st26EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST26-001',
      );
      expect(card).toBeDefined();
      const contEntry = card!.effects?.find((e) => e.kind === 'continuous');
      expect(contEntry).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onPlay');
      }
    });

    it('ST26-002 has onPlay with removeDon cost', () => {
      const card = st26EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST26-002',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onPlay');
        expect(stdEntry.effect.costs).toContainEqual({
          type: 'removeDon',
          player: 'self',
          amount: 2,
        });
        expect(stdEntry.effect.actions.length).toBe(1);
      }
    });

    it('ST26-003 has onPlay with removeDon cost and addDon action', () => {
      const card = st26EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST26-003',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onPlay');
        expect(stdEntry.effect.costs).toContainEqual({
          type: 'removeDon',
          player: 'self',
          amount: 2,
        });
        expect(stdEntry.effect.actions[0].type).toBe('addDon');
      }
    });

    it('ST26-004 has onPlay with removeDon cost and modifyPower action', () => {
      const card = st26EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST26-004',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onPlay');
        expect(stdEntry.effect.costs).toContainEqual({
          type: 'removeDon',
          player: 'self',
          amount: 2,
        });
        expect(stdEntry.effect.actions.length).toBe(1);
      }
    });

    it('ST26-005 has onPlay and whenAttacking with conditions and removeDon cost', () => {
      const card = st26EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST26-005',
      );
      expect(card).toBeDefined();
      const stdEntries =
        card!.effects?.filter((e) => e.kind === 'standard') ?? [];
      expect(stdEntries.length).toBe(2);

      const onPlayEntry = stdEntries.find(
        (e) => e.kind === 'standard' && e.effect.trigger.type === 'onPlay',
      );
      expect(onPlayEntry).toBeDefined();
      if (onPlayEntry?.kind === 'standard') {
        expect(onPlayEntry.effect.trigger.type).toBe('onPlay');
        expect(onPlayEntry.effect.costs).toContainEqual({
          type: 'removeDon',
          player: 'self',
          amount: 2,
        });
        expect(onPlayEntry.effect.conditions).toContainEqual({
          type: 'playerHasLeaderColorsAtLeast',
          player: 'self',
          value: 2,
        });
        expect(onPlayEntry.effect.conditions).toContainEqual({
          type: 'playerHasTotalDonAtLeast',
          player: 'opponent',
          value: 5,
        });
      }

      const attackEntry = stdEntries.find(
        (e) =>
          e.kind === 'standard' && e.effect.trigger.type === 'whenAttacking',
      );
      expect(attackEntry).toBeDefined();
      if (attackEntry?.kind === 'standard') {
        expect(attackEntry.effect.trigger.type).toBe('whenAttacking');
        expect(attackEntry.effect.costs).toContainEqual({
          type: 'removeDon',
          player: 'self',
          amount: 2,
        });
      }
    });
  });
});
