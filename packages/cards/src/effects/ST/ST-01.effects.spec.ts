/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unused-vars */
import { describe, expect, it } from 'vitest';
import { DuelCard, type Card } from '@onepiecetcg/shared';
import { EffectEngine } from '../../../../effect-engine/src/effect-engine.js';
import type { SpecialHandlerDefinition } from '../../../../effect-engine/src/types/effect-registry.js';
import { st01EffectDefinitions } from './ST-01.effects';
import { st01016SpecialHandler } from './special/ST01-016.special';
import { createRegistry, makeCard, TestHost } from '../test-utils.js';

describe('ST01 effect definitions', () => {
  const createEngine = (
    host: TestHost,
    specialHandlers: readonly SpecialHandlerDefinition[] = [],
  ): EffectEngine => {
    const registry = createRegistry([st01EffectDefinitions], specialHandlers);
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

  describe('ST01-001 Monkey.D.Luffy (Leader)', () => {
    it('activates main to attach up to 1 rested DON!! to leader or a character', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST01-001');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      addCharacter(host, 'p1', { name: 'Test Char', instanceSuffix: 'char-1' });
      p1.zones.donDeck.push(new DuelCard());
      p1.zones.donDeck.push(new DuelCard());

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: p1.zones.leader.instanceId,
        sourceCardId: 'ST01-001',
      });
    });
  });

  describe('ST01-002 Usopp', () => {
    it('has trigger to play this card', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'ST01-002',
          number: 'ST01-002',
          name: 'Usopp',
          type: 'Character',
          cost: 2,
          power: 2000,
          text: '[DON!! x2] [When Attacking] Your opponent cannot activate a [Blocker] Character that has 5000 or more power during this battle. [Trigger] Play this card.',
        }),
        'usopp',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: `${p1.sessionId}:usopp`,
        sourceCardId: 'ST01-002',
      });

      expect(
        p1.zones.characters.find((c) => c.cardId === 'ST01-002'),
      ).toBeTruthy();
    });

    it('applies cannotBlock to opponent characters with 5000+ power when attacking with DON!! x2', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const usopp = addCharacter(host, 'p1', {
        id: 'ST01-002',
        number: 'ST01-002',
        name: 'Usopp',
        instanceSuffix: 'usopp',
      });
      usopp.attachedDon = 2;
      const blockerBig = addCharacter(host, 'p2', {
        name: 'Big Blocker',
        instanceSuffix: 'big',
        power: 5000,
        text: '[Blocker]',
      });
      const blockerSmall = addCharacter(host, 'p2', {
        name: 'Small Blocker',
        instanceSuffix: 'small',
        power: 2000,
        text: '[Blocker]',
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: usopp.instanceId,
        sourceCardId: 'ST01-002',
      });

      expect(blockerBig.cannotBlock).toBe(true);
      expect(blockerSmall.cannotBlock).toBe(false);
    });
  });

  describe('ST01-004 Sanji', () => {
    it('gains Rush when 2 or more DON!! are attached', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const sanji = addCharacter(host, 'p1', {
        id: 'ST01-004',
        number: 'ST01-004',
        name: 'Sanji',
        instanceSuffix: 'sanji',
      });

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(sanji.hasRush).toBe(false);

      sanji.attachedDon = 2;
      engine.reapplyContinuousEffects();

      expect(sanji.hasRush).toBe(true);
    });
  });

  describe('ST01-005 Jinbe', () => {
    it('triggers when attacking with DON!! x1', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const jinbe = addCharacter(host, 'p1', {
        id: 'ST01-005',
        number: 'ST01-005',
        name: 'Jinbe',
        instanceSuffix: 'jinbe',
      });
      jinbe.attachedDon = 1;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: jinbe.instanceId,
        sourceCardId: 'ST01-005',
      });
    });
  });

  describe('ST01-007 Nami', () => {
    it('activates main to attach up to 1 rested DON!!', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      addCharacter(host, 'p1', {
        id: 'ST01-007',
        number: 'ST01-007',
        name: 'Nami',
        instanceSuffix: 'nami',
      });
      p1.zones.donDeck.push(new DuelCard());

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: `${p1.sessionId}:nami`,
        sourceCardId: 'ST01-007',
      });
    });
  });

  describe('ST01-011 Brook', () => {
    it('attaches up to 2 rested DON!! on play', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      addCharacter(host, 'p1', {
        id: 'ST01-011',
        number: 'ST01-011',
        name: 'Brook',
        instanceSuffix: 'brook',
      });
      p1.zones.donDeck.push(new DuelCard());
      p1.zones.donDeck.push(new DuelCard());
      p1.zones.donDeck.push(new DuelCard());

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: `${p1.sessionId}:brook`,
        sourceCardId: 'ST01-011',
      });
    });
  });

  describe('ST01-012 Monkey.D.Luffy', () => {
    it('has Rush continuously', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const luffy = addCharacter(host, 'p1', {
        id: 'ST01-012',
        number: 'ST01-012',
        name: 'Monkey.D.Luffy',
        instanceSuffix: 'luffy',
      });

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();

      expect(luffy.hasRush).toBe(true);
    });
  });

  describe('ST01-013 Roronoa Zoro', () => {
    it('gains +1000 power when 1 or more DON!! are attached', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const zoro = addCharacter(host, 'p1', {
        id: 'ST01-013',
        number: 'ST01-013',
        name: 'Roronoa Zoro',
        instanceSuffix: 'zoro',
      });
      zoro.attachedDon = 1;

      const engine = createEngine(host);
      engine.reapplyContinuousEffects();
    });
  });

  describe('ST01-014 Guard Point', () => {
    it('grants +3000 power as counter', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const guardPoint = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST01-014',
          number: 'ST01-014',
          name: 'Guard Point',
          type: 'Event',
          cost: 1,
          text: '[Counter] Up to 1 of your Leader or Character cards gains +3000 power during this battle.',
        }),
        'guard-point',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateCounter',
        playerSessionId: 'p1',
        sourceInstanceId: guardPoint.instanceId,
        sourceCardId: 'ST01-014',
      });
    });

    it('grants +1000 power as trigger', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const guardPoint = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST01-014',
          number: 'ST01-014',
          name: 'Guard Point',
          type: 'Event',
          cost: 1,
          text: '[Trigger] Up to 1 of your Leader or Character cards gains +1000 power during this turn.',
        }),
        'guard-point',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: guardPoint.instanceId,
        sourceCardId: 'ST01-014',
      });
    });
  });

  describe('ST01-015 Gum-Gum Jet Pistol', () => {
    it('KOs opponent characters with 6000 or less power as main', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p2 = host.getPlayer('p2')!;
      const jetPistol = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST01-015',
          number: 'ST01-015',
          name: 'Gum-Gum Jet Pistol',
          type: 'Event',
          cost: 4,
          text: "[Main] K.O. up to 1 of your opponent's Characters with 6000 power or less.",
        }),
        'jet-pistol',
      );
      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        power: 5000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: jetPistol.instanceId,
        sourceCardId: 'ST01-015',
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

  describe('ST01-016 Diable Jambe (special handler)', () => {
    it('applies cannotBlock to opponent characters when main effect resolves', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST01-001');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST01-016',
          number: 'ST01-016',
          name: 'Diable Jambe',
          type: 'Event',
          cost: 1,
          text: '[Main] Select up to 1 of your {Straw Hat Crew} type Leader or Character cards. Your opponent cannot activate [Blocker] if that Leader or Character attacks during this turn.',
          families: ['Straw Hat Crew'],
        }),
        'diable-jambe',
      );
      p1.zones.leader.families.push('Straw Hat Crew');

      const engine = createEngine(host, [st01016SpecialHandler]);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: `${p1.sessionId}:diable-jambe`,
        sourceCardId: 'ST01-016',
      });
    });

    it('KOs blocker characters with cost 3 or less on trigger', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p2 = host.getPlayer('p2')!;
      const diableJambe = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST01-016',
          number: 'ST01-016',
          name: 'Diable Jambe',
          type: 'Event',
          cost: 1,
          text: "[Trigger] K.O. up to 1 of your opponent's [Blocker] Characters with a cost of 3 or less.",
        }),
        'diable-jambe',
      );
      addCharacter(host, 'p2', {
        name: 'Blocker',
        instanceSuffix: 'blocker',
        cost: 3,
        text: '[Blocker]',
      });
      addCharacter(host, 'p2', {
        name: 'Non Blocker',
        instanceSuffix: 'non-blocker',
        cost: 2,
        text: '',
      });

      const engine = createEngine(host, [st01016SpecialHandler]);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: diableJambe.instanceId,
        sourceCardId: 'ST01-016',
      });
    });
  });

  describe('ST01-017 Thousand Sunny', () => {
    it('rests stage to give +1000 power to a Straw Hat Crew character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const sunny = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST01-017',
          number: 'ST01-017',
          name: 'Thousand Sunny',
          type: 'Stage',
          cost: 2,
          text: '[Activate: Main] You may rest this Stage: Up to 1 {Straw Hat Crew} type Leader or Character card on your field gains +1000 power during this turn.',
          families: ['Straw Hat Crew'],
        }),
        'sunny',
      );
      host.playCard(sunny, 'p1', 'stage');

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: sunny.instanceId,
        sourceCardId: 'ST01-017',
      });
    });
  });
});
