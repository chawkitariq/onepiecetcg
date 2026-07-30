/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from '@jest/globals';
import { DuelCard, type Card } from '@onepiecetcg/shared';
import { EffectEngine } from '../effect-engine';
import { st21EffectDefinitions } from './st21.effects';
import { createRegistry, makeCard, TestHost } from './test-utils';

describe('ST21 effect definitions', () => {
  const createEngine = (host: TestHost): EffectEngine => {
    const registry = createRegistry([st21EffectDefinitions]);
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

  describe('ST21-001 Monkey.D.Luffy', () => {
    it('attaches 2 rested DON!! to a character via activate main when DON!! x1', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const luffy = addCharacter(host, 'p1', {
        id: 'ST21-001',
        number: 'ST21-001',
        name: 'Monkey.D.Luffy',
        instanceSuffix: 'luffy',
      });
      luffy.attachedDon = 1;

      const target = addCharacter(host, 'p1', {
        name: 'Target',
        instanceSuffix: 'target',
      });

      putDonInCost(host, 'p1', 2, true);

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: luffy.instanceId,
        sourceCardId: 'ST21-001',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(target.attachedDon).toBe(2);
    });
  });

  describe('ST21-002 Usopp', () => {
    it('gains +2000 power during opponent turn with DON!! x2', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.activePlayerSessionId = 'p2';

      const usopp = addCharacter(host, 'p1', {
        id: 'ST21-002',
        number: 'ST21-002',
        name: 'Usopp',
        instanceSuffix: 'usopp',
        power: 5000,
      });
      usopp.attachedDon = 2;

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(usopp.power).toBe(7000);
    });

    it('does not gain +2000 power during own turn', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const usopp = addCharacter(host, 'p1', {
        id: 'ST21-002',
        number: 'ST21-002',
        name: 'Usopp',
        instanceSuffix: 'usopp',
        power: 5000,
      });
      usopp.attachedDon = 2;

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(usopp.power).toBe(5000);
    });
  });

  describe('ST21-004 Jewelry Bonney', () => {
    it('draws 1 card on KO when DON!! x2', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const bonney = addCharacter(host, 'p1', {
        id: 'ST21-004',
        number: 'ST21-004',
        name: 'Jewelry Bonney',
        instanceSuffix: 'bonney',
      });
      bonney.attachedDon = 2;

      p1.zones.deck.push(new DuelCard());
      p1.zones.deck.push(new DuelCard());

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onKo',
        playerSessionId: 'p1',
        sourceInstanceId: bonney.instanceId,
        sourceCardId: 'ST21-004',
      });

      expect(p1.zones.hand.length).toBe(1);
    });
  });

  describe('ST21-009 Nami', () => {
    it('attaches 2 rested DON!! to a Straw Hat Crew character on activate main', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const nami = addCharacter(host, 'p1', {
        id: 'ST21-009',
        number: 'ST21-009',
        name: 'Nami',
        instanceSuffix: 'nami',
      });

      const target = addCharacter(host, 'p1', {
        name: 'Luffy',
        instanceSuffix: 'luffy',
        families: ['Straw Hat Crew'],
      });

      putDonInCost(host, 'p1', 2, true);

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: nami.instanceId,
        sourceCardId: 'ST21-009',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(target.attachedDon).toBe(2);
    });
  });

  describe('ST21-010 Nico Robin', () => {
    it('KOs opponent character with 4000 or less power when attacking with DON!! x2', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const robin = addCharacter(host, 'p1', {
        id: 'ST21-010',
        number: 'ST21-010',
        name: 'Nico Robin',
        instanceSuffix: 'robin',
      });
      robin.attachedDon = 2;

      const weak = addCharacter(host, 'p2', {
        name: 'Weak',
        instanceSuffix: 'weak',
        power: 3000,
      });
      addCharacter(host, 'p2', {
        name: 'Big',
        instanceSuffix: 'big',
        power: 5000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: robin.instanceId,
        sourceCardId: 'ST21-010',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [weak.instanceId],
      });

      expect(
        host.getPlayer('p2')!.zones.characters.find((c) => c === weak),
      ).toBeFalsy();
      expect(
        host.getPlayer('p2')!.zones.characters.find((c) => c.name === 'Big'),
      ).toBeTruthy();
    });
  });

  describe('ST21-011 Franky', () => {
    it('grants +1000 power to Straw Hat Crew characters with 4000 base power or less during opponent turn with DON!! x2', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.activePlayerSessionId = 'p2';

      const franky = addCharacter(host, 'p1', {
        id: 'ST21-011',
        number: 'ST21-011',
        name: 'Franky',
        instanceSuffix: 'franky',
      });
      franky.attachedDon = 2;

      const weakSH = addCharacter(host, 'p1', {
        name: 'Chopper',
        instanceSuffix: 'chopper',
        power: 2000,
        families: ['Straw Hat Crew'],
      });
      const strongSH = addCharacter(host, 'p1', {
        name: 'Zoro',
        instanceSuffix: 'zoro',
        power: 5000,
        families: ['Straw Hat Crew'],
      });
      const nonSH = addCharacter(host, 'p1', {
        name: 'Other',
        instanceSuffix: 'other',
        power: 2000,
      });

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(weakSH.power).toBe(3000);
      expect(strongSH.power).toBe(5000);
      expect(nonSH.power).toBe(2000);
    });
  });

  describe('ST21-012 Brook', () => {
    it('attaches 2 rested DON!! to leader when attacking', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const brook = addCharacter(host, 'p1', {
        id: 'ST21-012',
        number: 'ST21-012',
        name: 'Brook',
        instanceSuffix: 'brook',
      });

      putDonInCost(host, 'p1', 2, true);

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: brook.instanceId,
        sourceCardId: 'ST21-012',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [p1.zones.leader.instanceId],
      });

      expect(p1.zones.leader.attachedDon).toBe(2);
    });
  });

  describe('ST21-014 Monkey.D.Luffy', () => {
    it('has Rush', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const luffy = addCharacter(host, 'p1', {
        id: 'ST21-014',
        number: 'ST21-014',
        name: 'Monkey.D.Luffy',
        instanceSuffix: 'luffy',
      });

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(luffy.hasRush).toBe(true);
    });

    it('attaches 1 rested DON!! to leader when attacking', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const luffy = addCharacter(host, 'p1', {
        id: 'ST21-014',
        number: 'ST21-014',
        name: 'Monkey.D.Luffy',
        instanceSuffix: 'luffy',
      });

      putDonInCost(host, 'p1', 1, true);

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: luffy.instanceId,
        sourceCardId: 'ST21-014',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [p1.zones.leader.instanceId],
      });

      expect(p1.zones.leader.attachedDon).toBe(1);
    });
  });

  describe('ST21-015 Roronoa Zoro', () => {
    it('gains Rush with DON!! x2', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const zoro = addCharacter(host, 'p1', {
        id: 'ST21-015',
        number: 'ST21-015',
        name: 'Roronoa Zoro',
        instanceSuffix: 'zoro',
      });
      zoro.attachedDon = 2;

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(zoro.hasRush).toBe(true);
    });

    it('does not have Rush without DON!! x2', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const zoro = addCharacter(host, 'p1', {
        id: 'ST21-015',
        number: 'ST21-015',
        name: 'Roronoa Zoro',
        instanceSuffix: 'zoro',
      });

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(zoro.hasRush).toBe(false);
    });

    it('plays a red character from hand on KO', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const zoro = addCharacter(host, 'p1', {
        id: 'ST21-015',
        number: 'ST21-015',
        name: 'Roronoa Zoro',
        instanceSuffix: 'zoro',
      });

      const luffy = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'red-luffy',
          number: 'red-luffy',
          name: 'Monkey.D.Luffy',
          type: 'Character',
          colors: ['Red'],
          power: 5000,
          cost: 3,
        }),
        'hand-luffy',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onKo',
        playerSessionId: 'p1',
        sourceInstanceId: zoro.instanceId,
        sourceCardId: 'ST21-015',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [luffy.instanceId],
      });

      expect(
        host.getPlayer('p1')!.zones.characters.find((c) => c === luffy),
      ).toBeTruthy();
    });
  });

  describe('ST21-016 Gum-Gum Dawn Whip', () => {
    it('gives +1000 power and cannotBlock via main effect', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const whip = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST21-016',
          number: 'ST21-016',
          name: 'Gum-Gum Dawn Whip',
          type: 'Event',
          cost: 1,
        }),
        'whip',
      );

      const target = addCharacter(host, 'p1', {
        name: 'Target',
        instanceSuffix: 'target',
        power: 5000,
      });
      const blocker = addCharacter(host, 'p2', {
        name: 'Blocker',
        instanceSuffix: 'blocker',
        power: 3000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: whip.instanceId,
        sourceCardId: 'ST21-016',
      });

      let decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [target.instanceId],
      });

      decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [blocker.instanceId],
      });

      expect(target.power).toBe(6000);
      expect(blocker.cannotBlock).toBe(true);
    });

    it('KOs opponent character with 4000 or less power via trigger', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const whip = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST21-016',
          number: 'ST21-016',
          name: 'Gum-Gum Dawn Whip',
          type: 'Event',
          cost: 1,
        }),
        'whip',
      );

      const weak = addCharacter(host, 'p2', {
        name: 'Weak',
        instanceSuffix: 'weak',
        power: 3000,
      });
      addCharacter(host, 'p2', {
        name: 'Strong',
        instanceSuffix: 'strong',
        power: 5000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: whip.instanceId,
        sourceCardId: 'ST21-016',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [weak.instanceId],
      });

      expect(
        host.getPlayer('p2')!.zones.characters.find((c) => c === weak),
      ).toBeFalsy();
      expect(
        host.getPlayer('p2')!.zones.characters.find((c) => c.name === 'Strong'),
      ).toBeTruthy();
    });
  });

  describe('ST21-017 Gum-Gum Mole Pistol', () => {
    it('gives +5000 power and conditionally KOs a 2000 or less character via main', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const pistol = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST21-017',
          number: 'ST21-017',
          name: 'Gum-Gum Mole Pistol',
          type: 'Event',
          cost: 2,
        }),
        'pistol',
      );

      const debuffTarget = addCharacter(host, 'p2', {
        name: 'Debuff',
        instanceSuffix: 'debuff',
        power: 3000,
      });
      const koTarget = addCharacter(host, 'p2', {
        name: 'Small',
        instanceSuffix: 'small',
        power: 1000,
      });

      addCharacter(host, 'p1', {
        name: 'Strong',
        instanceSuffix: 'strong',
        power: 6000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: pistol.instanceId,
        sourceCardId: 'ST21-017',
      });

      let decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [debuffTarget.instanceId],
      });

      decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [koTarget.instanceId],
      });

      expect(debuffTarget.power).toBe(8000);
      expect(
        host.getPlayer('p2')!.zones.characters.find((c) => c === koTarget),
      ).toBeFalsy();
    });

    it('does not KO if no 6000+ power character exists', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const pistol = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST21-017',
          number: 'ST21-017',
          name: 'Gum-Gum Mole Pistol',
          type: 'Event',
          cost: 2,
        }),
        'pistol',
      );

      const debuffTarget = addCharacter(host, 'p2', {
        name: 'Debuff',
        instanceSuffix: 'debuff',
        power: 3000,
      });
      const small = addCharacter(host, 'p2', {
        name: 'Small',
        instanceSuffix: 'small',
        power: 1000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: pistol.instanceId,
        sourceCardId: 'ST21-017',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [debuffTarget.instanceId],
      });

      expect(debuffTarget.power).toBe(8000);
      expect(
        host.getPlayer('p2')!.zones.characters.find((c) => c === small),
      ).toBeTruthy();
    });

    it('activates main effect when triggered', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const pistol = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST21-017',
          number: 'ST21-017',
          name: 'Gum-Gum Mole Pistol',
          type: 'Event',
          cost: 2,
        }),
        'pistol',
      );

      addCharacter(host, 'p2', {
        name: 'Debuff',
        instanceSuffix: 'debuff',
        power: 3000,
      });
      const small = addCharacter(host, 'p2', {
        name: 'Small',
        instanceSuffix: 'small',
        power: 1000,
      });

      addCharacter(host, 'p1', {
        name: 'Strong',
        instanceSuffix: 'strong',
        power: 6000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: pistol.instanceId,
        sourceCardId: 'ST21-017',
      });

      let decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [
          host
            .getPlayer('p2')!
            .zones.characters.find((c) => c.name === 'Debuff')!.instanceId,
        ],
      });

      decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [small.instanceId],
      });

      expect(
        host.getPlayer('p2')!.zones.characters.find((c) => c === small),
      ).toBeFalsy();
    });
  });
});
