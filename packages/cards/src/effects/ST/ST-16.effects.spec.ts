/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from 'vitest';
import { DuelCard, type Card } from '@onepiecetcg/shared';
import { EffectEngine } from '../../../../effect-engine/src/effect-engine.js';
import { st16EffectDefinitions } from './ST-16.effects';
import { createRegistry, makeCard, TestHost } from '../test-utils.js';

describe('ST16 effect definitions', () => {
  const createEngine = (host: TestHost): EffectEngine => {
    const registry = createRegistry([st16EffectDefinitions]);
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

  const addCardToHand = (
    host: TestHost,
    sessionId: string,
    overrides: Partial<Card> & { instanceSuffix: string },
  ): DuelCard =>
    host.addCardToZone(
      sessionId,
      'hand',
      makeCard({
        id: 'test-card',
        number: 'test-card',
        name: 'Test Card',
        type: 'Character',
        cost: 1,
        power: 1000,
        ...overrides,
      }),
      overrides.instanceSuffix,
    );

  describe('ST16-001 Uta', () => {
    it('attaches a rested DON!! to a character after trashing a FILM card', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      p1.zones.donDeck.push(new DuelCard());

      const uta = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ST16-001',
          number: 'ST16-001',
          name: 'Uta (ST16-001)',
          type: 'Character',
          cost: 4,
          power: 6000,
        }),
        'uta',
      );

      const filmCard = addCardToHand(host, 'p1', {
        id: 'film-card',
        name: 'FILM Character',
        instanceSuffix: 'film-card',
        families: ['FILM'],
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: uta.instanceId,
        sourceCardId: 'ST16-001',
      });

      const confirmDecision = engine.getPendingDecision();
      expect(confirmDecision?.prompt.type).toBe('confirm');

      engine.answerDecision({
        decisionId: confirmDecision!.id,
        confirmed: true,
      });

      const actionDecision = engine.getPendingDecision();
      expect(actionDecision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: actionDecision!.id,
        selectedCardInstanceIds: [p1.zones.leader.instanceId],
      });

      expect(p1.zones.hand.length).toBe(0);
      expect(p1.zones.trash.length).toBe(1);
      expect(p1.zones.trash[0].instanceId).toBe(filmCard.instanceId);
    });

    it('has [Activate: Main] [Once Per Turn] trigger', () => {
      const card = st16EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST16-001',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.id).toBe(
          'st16-001-activate-main-trash-film-attach-don',
        );
        expect(stdEntry.effect.trigger.type).toBe('activateMain');
        expect(stdEntry.effect.trigger.oncePerTurn).toBe(true);
        expect(stdEntry.effect.trigger.optional).toBe(true);
        expect(stdEntry.effect.costs).toHaveLength(1);
        expect(stdEntry.effect.costs![0]).toMatchObject({
          type: 'trashFromHand',
          selector: {
            player: 'self',
            filter: { trait: ['FILM'] },
            count: { kind: 'exact', value: 1 },
          },
        });
        expect(stdEntry.effect.actions[0].type).toBe('attachDon');
      }
    });
  });

  describe('ST16-002 Gordon', () => {
    it('has onAttacked trigger with optional cost for any Music cards', () => {
      const card = st16EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST16-002',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.id).toBe(
          'st16-002-on-opponent-attack-trash-music-power-boost',
        );
        expect(stdEntry.effect.trigger.type).toBe('onAttacked');
        expect(stdEntry.effect.trigger.optional).toBe(true);
        expect(stdEntry.effect.actions).toHaveLength(3);
        expect(stdEntry.effect.actions[0].type).toBe('storeSelectedCards');
        if (stdEntry.effect.actions[0].type === 'storeSelectedCards') {
          expect(stdEntry.effect.actions[0].key).toBe('st16-002-trash-count');
        }
        expect(stdEntry.effect.actions[1].type).toBe('moveStoredCards');
        expect(stdEntry.effect.actions[2].type).toBe(
          'modifyPowerByStoredCount',
        );
      }
    });

    it('trashes Music cards and boosts power when opponent attacks', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const gordon = addCharacter(host, 'p1', {
        id: 'ST16-002',
        name: 'Gordon',
        instanceSuffix: 'gordon',
      });

      addCardToHand(host, 'p1', {
        id: 'music-card-1',
        name: 'Music Card 1',
        instanceSuffix: 'music-1',
        families: ['Music'],
      });
      addCardToHand(host, 'p1', {
        id: 'music-card-2',
        name: 'Music Card 2',
        instanceSuffix: 'music-2',
        families: ['Music'],
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onAttacked',
        playerSessionId: 'p1',
        sourceInstanceId: gordon.instanceId,
        sourceCardId: 'ST16-002',
      });

      const confirmDecision = engine.getPendingDecision();
      expect(confirmDecision?.prompt.type).toBe('confirm');

      engine.answerDecision({
        decisionId: confirmDecision!.id,
        confirmed: true,
      });

      const storeDecision = engine.getPendingDecision();
      expect(storeDecision?.prompt.type).toBe('selectCards');
      const selectedIds = [
        p1.zones.hand[0].instanceId,
        p1.zones.hand[1].instanceId,
      ];
      engine.answerDecision({
        decisionId: storeDecision!.id,
        selectedCardInstanceIds: selectedIds,
      });

      const buffDecision = engine.getPendingDecision();
      expect(buffDecision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: buffDecision!.id,
        selectedCardInstanceIds: [gordon.instanceId],
      });

      expect(p1.zones.hand.length).toBe(0);
      expect(p1.zones.trash.length).toBe(2);
    });
  });

  describe('ST16-003 Charlotte Katakuri', () => {
    it('has continuous +2000 power when FILM leader and 6+ rested cards', () => {
      const card = st16EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST16-003',
      );
      expect(card).toBeDefined();
      const contEntry = card!.effects?.find((e) => e.kind === 'continuous');
      expect(contEntry).toBeDefined();
      if (contEntry?.kind === 'continuous') {
        expect(contEntry.effect.id).toBe(
          'st16-003-continuous-plus-2000-if-film-leader-and-6-rested',
        );
        expect(contEntry.effect.conditions).toHaveLength(2);
        expect(contEntry.effect.conditions![0]).toMatchObject({
          type: 'playerHasLeaderTrait',
          player: 'self',
          value: 'FILM',
        });
        expect(contEntry.effect.conditions![1]).toMatchObject({
          type: 'targetCountAtLeast',
          value: 6,
        });
        expect(contEntry.effect.modifier.power).toBe(2000);
        expect(
          contEntry.effect.modifier.selector.filter?.name?.includes(
            'Charlotte Katakuri (Pirate Foil)',
          ),
        ).toBe(true);
      }
    });
  });

  describe('ST16-004 Shanks', () => {
    it('KOs rested opponent character on play', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p2 = host.getPlayer('p2')!;

      const shanks = addCharacter(host, 'p1', {
        id: 'ST16-004',
        name: 'Shanks (SP)',
        instanceSuffix: 'shanks',
      });

      const target = addCharacter(host, 'p2', {
        name: 'Rested Target',
        instanceSuffix: 'target',
        power: 5000,
      });
      target.rested = true;

      addCharacter(host, 'p2', {
        name: 'Active Target',
        instanceSuffix: 'active',
        power: 3000,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: shanks.instanceId,
        sourceCardId: 'ST16-004',
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

    it('has onPlay trigger with KO action', () => {
      const card = st16EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST16-004',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.id).toBe('st16-004-on-play-ko-rested');
        expect(stdEntry.effect.trigger.type).toBe('onPlay');
        expect(stdEntry.effect.actions[0].type).toBe('ko');
        if (stdEntry.effect.actions[0].type === 'ko') {
          expect(stdEntry.effect.actions[0].selector.filter?.rested).toBe(true);
        }
      }
    });
  });

  describe('ST16-005 Monkey.D.Luffy', () => {
    it('has continuous +1000 power when rested Uta is on field', () => {
      const card = st16EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST16-005',
      );
      expect(card).toBeDefined();
      const contEntry = card!.effects?.find((e) => e.kind === 'continuous');
      expect(contEntry).toBeDefined();
      if (contEntry?.kind === 'continuous') {
        expect(contEntry.effect.id).toBe(
          'st16-005-continuous-plus-1000-if-rested-uta',
        );
        expect(contEntry.effect.conditions).toHaveLength(1);
        expect(contEntry.effect.conditions![0]).toMatchObject({
          type: 'targetExists',
        });
        expect(contEntry.effect.modifier.power).toBe(1000);
        expect(
          contEntry.effect.modifier.selector.filter?.name?.includes(
            'Monkey.D.Luffy - ST16-005 (Pirate Foil)',
          ),
        ).toBe(true);
      }
    });
  });

  describe('Structural validation', () => {
    it('all cards have valid effect definitions', () => {
      for (const card of st16EffectDefinitions.cards) {
        expect(card.cardId).toMatch(/^ST16-\d{3}$/);
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

    it('effect IDs follow st16-NNN-descriptive-name convention', () => {
      for (const card of st16EffectDefinitions.cards) {
        for (const entry of card.effects ?? []) {
          if (entry.kind === 'standard' || entry.kind === 'continuous') {
            expect(entry.effect.id).toMatch(/^st16-\d{3}-/);
          }
        }
      }
    });

    it('every cardId has a registered effect entry', () => {
      const cardIds = st16EffectDefinitions.cards.map((c) => c.cardId);
      expect(cardIds).toContain('ST16-001');
      expect(cardIds).toContain('ST16-002');
      expect(cardIds).toContain('ST16-003');
      expect(cardIds).toContain('ST16-004');
      expect(cardIds).toContain('ST16-005');
      expect(cardIds.length).toBe(5);
    });
  });
});
