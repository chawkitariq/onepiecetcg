/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from '@jest/globals';
import { DuelCard, type Card } from '@onepiecetcg/shared';
import { EffectEngine } from '../../effect-engine';
import { st18EffectDefinitions } from './ST-18.effects';
import { createRegistry, makeCard, TestHost } from '../test-utils';

describe('ST18 effect definitions', () => {
  const createEngine = (host: TestHost): EffectEngine => {
    const registry = createRegistry([st18EffectDefinitions]);
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

  describe('ST18-001 Uso-Hachi', () => {
    it('rests opponent character with cost 5 or less when 8+ DON', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      const p2 = host.getPlayer('p2')!;
      for (let i = 0; i < 10; i += 1) p1.zones.donDeck.push(new DuelCard());
      host.addDonToCost('p1', 8, false);

      const target = addCharacter(host, 'p2', {
        instanceSuffix: 'target',
        cost: 5,
        power: 6000,
      });
      target.rested = false;

      const usohachi = addCharacter(host, 'p1', {
        id: 'ST18-001',
        instanceSuffix: 'usohachi',
        name: 'Uso-Hachi',
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: usohachi.instanceId,
        sourceCardId: 'ST18-001',
      });

      const char = p2.zones.characters.find(
        (c) => c.instanceId === target.instanceId,
      );
      expect(char?.rested).toBe(true);
    });

    it('does nothing when less than 8 DON', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      host.addDonToCost('p1', 3, false);

      const target = addCharacter(host, 'p2', {
        instanceSuffix: 'target',
        cost: 3,
      });
      target.rested = false;

      const usohachi = addCharacter(host, 'p1', {
        id: 'ST18-001',
        instanceSuffix: 'usohachi',
        name: 'Uso-Hachi',
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: usohachi.instanceId,
        sourceCardId: 'ST18-001',
      });

      expect(engine.getPendingDecision()).toBeNull();
      expect(target.rested).toBe(false);
    });
  });

  describe('ST18-002 O-Nami', () => {
    it('trashes 1 from hand and draws 2 when 8+ DON', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      for (let i = 0; i < 10; i += 1) p1.zones.donDeck.push(new DuelCard());
      host.addDonToCost('p1', 8, false);

      for (let i = 0; i < 5; i += 1) {
        p1.zones.deck.push(new DuelCard());
      }
      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'keep',
          number: 'keep',
          name: 'Keep',
          type: 'Character',
        }),
        'keep',
      );
      const handCard = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'trash-me',
          number: 'trash-me',
          name: 'Trash Me',
          type: 'Character',
        }),
        'trashme',
      );

      const onami = addCharacter(host, 'p1', {
        id: 'ST18-002',
        instanceSuffix: 'onami',
        name: 'O-Nami',
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: onami.instanceId,
        sourceCardId: 'ST18-002',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [handCard.instanceId],
      });

      expect(
        p1.zones.hand.find((c) => c.instanceId === handCard.instanceId),
      ).toBeFalsy();
      expect(
        p1.zones.trash.find((c) => c.instanceId === handCard.instanceId),
      ).toBeTruthy();
      expect(p1.zones.hand.length).toBe(3);
      expect(p1.zones.deck.length).toBe(3);
    });

    it('does nothing when less than 8 DON', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      host.addDonToCost('p1', 3, false);

      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'keep',
          number: 'keep',
          name: 'Keep',
          type: 'Character',
        }),
        'keep',
      );

      const onami = addCharacter(host, 'p1', {
        id: 'ST18-002',
        instanceSuffix: 'onami',
        name: 'O-Nami',
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: onami.instanceId,
        sourceCardId: 'ST18-002',
      });

      expect(engine.getPendingDecision()).toBeNull();
    });
  });

  describe('ST18-003 San-Gorou', () => {
    it('draws 1 card when attacking with 8+ DON', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      for (let i = 0; i < 10; i += 1) p1.zones.donDeck.push(new DuelCard());
      host.addDonToCost('p1', 8, false);
      for (let i = 0; i < 5; i += 1) p1.zones.deck.push(new DuelCard());

      const sangorou = addCharacter(host, 'p1', {
        id: 'ST18-003',
        instanceSuffix: 'sangorou',
        name: 'San-Gorou',
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: sangorou.instanceId,
        sourceCardId: 'ST18-003',
      });

      expect(engine.getPendingDecision()).toBeNull();
      expect(p1.zones.hand.length).toBe(1);
    });

    it('does nothing when less than 8 DON', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      host.addDonToCost('p1', 3, false);

      const sangorou = addCharacter(host, 'p1', {
        id: 'ST18-003',
        instanceSuffix: 'sangorou',
        name: 'San-Gorou',
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: sangorou.instanceId,
        sourceCardId: 'ST18-003',
      });

      expect(p1.zones.hand.length).toBe(0);
    });
  });

  describe('ST18-004 Zoro-Juurou', () => {
    it('searches top 5 for purple Straw Hat Crew character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      for (let i = 0; i < 4; i += 1) {
        host.addCardToZone(
          'p1',
          'deck',
          makeCard({
            id: `filler-${i}`,
            number: `filler-${i}`,
            name: `Filler ${i}`,
            type: 'Character',
            colors: ['Red'],
          }),
          `filler-${i}`,
        );
      }

      const found = host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'ST18-001',
          number: 'ST18-001',
          name: 'Uso-Hachi',
          type: 'Character',
          colors: ['Purple'],
          families: ['Straw Hat Crew'],
          cost: 3,
        }),
        'found',
      );

      const zoro = addCharacter(host, 'p1', {
        id: 'ST18-004',
        instanceSuffix: 'zoro',
        name: 'Zoro-Juurou',
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: zoro.instanceId,
        sourceCardId: 'ST18-004',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [found.instanceId],
      });

      expect(
        p1.zones.hand.find((c) => c.instanceId === found.instanceId),
      ).toBeTruthy();
    });

    it('places remaining cards at bottom of deck when no match', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      for (let i = 0; i < 5; i += 1) {
        host.addCardToZone(
          'p1',
          'deck',
          makeCard({
            id: `filler-${i}`,
            number: `filler-${i}`,
            name: `Filler ${i}`,
            type: 'Character',
            colors: ['Red'],
          }),
          `filler-${i}`,
        );
      }

      const zoro = addCharacter(host, 'p1', {
        id: 'ST18-004',
        instanceSuffix: 'zoro',
        name: 'Zoro-Juurou',
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: zoro.instanceId,
        sourceCardId: 'ST18-004',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [],
      });

      expect(p1.zones.hand.length).toBe(0);
    });
  });

  describe('ST18-005 Luffy-Tarou', () => {
    it('returns 1 DON!! and plays purple Straw Hat Crew character from hand', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      for (let i = 0; i < 10; i += 1) p1.zones.donDeck.push(new DuelCard());
      host.addDonToCost('p1', 3, false);

      const toPlay = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST18-001',
          number: 'ST18-001',
          name: 'Uso-Hachi',
          type: 'Character',
          colors: ['Purple'],
          families: ['Straw Hat Crew'],
          cost: 3,
        }),
        'toplay',
      );

      const luffy = addCharacter(host, 'p1', {
        id: 'ST18-005',
        instanceSuffix: 'luffy',
        name: 'Luffy-Tarou',
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: luffy.instanceId,
        sourceCardId: 'ST18-005',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [toPlay.instanceId],
      });

      expect(p1.zones.cost.length).toBe(2);
      expect(
        p1.zones.characters.find((c) => c.instanceId === toPlay.instanceId),
      ).toBeTruthy();
      expect(
        p1.zones.hand.find((c) => c.instanceId === toPlay.instanceId),
      ).toBeFalsy();
    });
  });

  describe('Structural validation', () => {
    it('all cards have valid effect definitions', () => {
      for (const card of st18EffectDefinitions.cards) {
        expect(card.cardId).toMatch(/^ST18-\d{3}$/);
        if (card.effects && card.effects.length > 0) {
          for (const entry of card.effects) {
            if (entry.kind === 'standard') {
              expect(entry.effect.id).toBeTruthy();
              expect(entry.effect.trigger.type).toBeTruthy();
              expect(entry.effect.actions.length).toBeGreaterThan(0);
            }
          }
        }
      }
    });

    it('ST18-001 uses onPlay trigger with DON!! >= 8 condition', () => {
      const card = st18EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST18-001',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onPlay');
        expect(stdEntry.effect.conditions).toContainEqual({
          type: 'playerHasTotalDonAtLeast',
          player: 'self',
          value: 8,
        });
        expect(stdEntry.effect.actions[0].type).toBe('rest');
      }
    });

    it('ST18-003 uses whenAttacking trigger with oncePerTurn', () => {
      const card = st18EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST18-003',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('whenAttacking');
        expect(stdEntry.effect.trigger.oncePerTurn).toBe(true);
        expect(stdEntry.effect.actions[0].type).toBe('draw');
      }
    });

    it('ST18-005 uses onPlay trigger with DON!! -1 cost', () => {
      const card = st18EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST18-005',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('onPlay');
        expect(stdEntry.effect.costs).toContainEqual({
          type: 'removeDon',
          player: 'self',
          amount: 1,
        });
        expect(stdEntry.effect.actions[0].type).toBe('play');
      }
    });
  });
});
