import { describe, expect, it } from 'vitest';
import type {
  CardEffectDefinition,
  StandardEffectDefinition,
  ContinuousEffectDefinition,
  ReplacementEffectDefinition,
} from '@onepiecetcg/shared';
import type {
  EffectRegistry,
  SpecialHandlerDefinition,
} from '../../../effect-engine/src/types/effect-registry.js';
import { op13EffectDefinitions } from './OP-13.effects';
import { specialHandlerDefinitions } from '../index.js';
import { EffectEngine } from '../../../effect-engine/src/effect-engine.js';
import { createRegistry, makeCard, TestHost } from '../test-utils.js';

describe('OP13 effect definitions', () => {
  describe('edition structure', () => {
    it('has the correct edition ID', () => {
      expect(op13EffectDefinitions.editionId).toBe('OP-13');
    });

    it('has 104 card definitions', () => {
      expect(op13EffectDefinitions.cards).toHaveLength(104);
    });

    it('every card has effects defined (no bare placeholders)', () => {
      for (const card of op13EffectDefinitions.cards) {
        expect(card.effects).toBeDefined();
        expect(card.effects!.length).toBeGreaterThan(0);
      }
    });
  });

  describe('effect IDs', () => {
    it('every standard/continuous/replacement effect has a unique kebab-case id', () => {
      const ids = new Set<string>();
      for (const card of op13EffectDefinitions.cards) {
        for (const entry of card.effects ?? []) {
          if (
            entry.kind === 'standard' ||
            entry.kind === 'continuous' ||
            entry.kind === 'replacement'
          ) {
            const id = entry.effect.id;
            expect(id).toMatch(/^[a-z][a-z0-9-]*$/);
            expect(ids.has(id)).toBe(false);
            ids.add(id);
          }
        }
      }
    });
  });

  describe('special handler references', () => {
    const handlerMap = new Map<string, SpecialHandlerDefinition>();
    for (const h of specialHandlerDefinitions) {
      handlerMap.set(h.id, h);
    }

    it('all special-ref handlers exist in the registry', () => {
      for (const card of op13EffectDefinitions.cards) {
        for (const entry of card.effects ?? []) {
          if (entry.kind === 'special-ref') {
            expect(handlerMap.has(entry.specialHandlerId)).toBe(true);
          }
        }
      }
    });

    it('every OP13 special handler has a corresponding card reference', () => {
      const referencedIds = new Set<string>();
      for (const card of op13EffectDefinitions.cards) {
        for (const entry of card.effects ?? []) {
          if (entry.kind === 'special-ref') {
            referencedIds.add(entry.specialHandlerId);
          }
        }
      }

      const op13Handlers = specialHandlerDefinitions.filter((h) =>
        h.cardId.startsWith('OP13-'),
      );

      for (const handler of op13Handlers) {
        expect(referencedIds.has(handler.id)).toBe(true);
      }
    });
  });

  describe('effect kind distribution', () => {
    it('has 77 cards with standard effects', () => {
      const count = op13EffectDefinitions.cards.filter((c) =>
        (c.effects ?? []).some((e) => e.kind === 'standard'),
      ).length;
      expect(count).toBeGreaterThanOrEqual(70);
    });

    it('has 10 cards with continuous effects', () => {
      const count = op13EffectDefinitions.cards.filter((c) =>
        (c.effects ?? []).some((e) => e.kind === 'continuous'),
      ).length;
      expect(count).toBe(10);
    });

    it('has 4 cards with replacement effects', () => {
      const count = op13EffectDefinitions.cards.filter((c) =>
        (c.effects ?? []).some((e) => e.kind === 'replacement'),
      ).length;
      expect(count).toBe(4);
    });

    it('has 23 cards with special-ref', () => {
      const count = op13EffectDefinitions.cards.filter((c) =>
        (c.effects ?? []).some((e) => e.kind === 'special-ref'),
      ).length;
      expect(count).toBe(23);
    });
  });

  describe('specific card effects structure', () => {
    const cardMap = new Map(
      op13EffectDefinitions.cards.map((c) => [c.cardId, c]),
    );

    it('OP13-041 Izo has a standard onPlay draw 2 effect', () => {
      const card = cardMap.get('OP13-041')!;
      const std = card.effects!.find((e) => e.kind === 'standard')!;
      expect(std.effect.trigger.type).toBe('onPlay');
      expect(std.effect.actions).toContainEqual({
        type: 'draw',
        player: 'self',
        amount: 2,
      });
    });

    it('OP13-041 Izo has exactly 1 effect', () => {
      const card = cardMap.get('OP13-041')!;
      expect(card.effects).toHaveLength(1);
    });

    it('OP13-080 has continuous and standard effects', () => {
      const card = cardMap.get('OP13-080')!;
      const kinds = card.effects!.map((e) => e.kind);
      expect(kinds).toContain('continuous');
      expect(kinds).toContain('standard');
    });

    it('OP13-046 Vista has 2 replacement effects', () => {
      const card = cardMap.get('OP13-046')!;
      const replacements = card.effects!.filter(
        (e) => e.kind === 'replacement',
      );
      expect(replacements).toHaveLength(2);
    });

    it('OP13-001 references a special handler', () => {
      const card = cardMap.get('OP13-001')!;
      const sref = card.effects!.find((e) => e.kind === 'special-ref')!;
      expect(sref.specialHandlerId).toBe('op13-001-special');
    });
  });

  describe('behavioral tests (EffectEngine)', () => {
    it('OP13-041 Izo draws 2 cards on play', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op13EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      host.addCardToZone(
        'p1',
        'deck',
        makeCard({ id: 'X', number: 'X', name: 'Topdeck1', type: 'Character' }),
        'd1',
      );
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({ id: 'Y', number: 'Y', name: 'Topdeck2', type: 'Character' }),
        'd2',
      );

      const izo = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP13-041',
          number: 'OP13-041',
          name: 'Izo',
          type: 'Character',
        }),
        'izo',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: izo.instanceId,
        sourceCardId: 'OP13-041',
      });

      expect(host.getPlayer('p1')?.zones.hand).toHaveLength(2);
    });

    it('OP13-043 Otama draws 2 and trashes 1 when life ≤ 3', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op13EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      p1.zones.life.splice(0, p1.zones.life.length);
      host.addCardToZone(
        'p1',
        'life',
        makeCard({ id: 'L1', number: 'L1', name: 'Life1', type: 'Character' }),
        'l1',
      );
      host.addCardToZone(
        'p1',
        'life',
        makeCard({ id: 'L2', number: 'L2', name: 'Life2', type: 'Character' }),
        'l2',
      );
      host.addCardToZone(
        'p1',
        'life',
        makeCard({ id: 'L3', number: 'L3', name: 'Life3', type: 'Character' }),
        'l3',
      );

      host.addCardToZone(
        'p1',
        'deck',
        makeCard({ id: 'A', number: 'A', name: 'D1', type: 'Character' }),
        'd1',
      );
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({ id: 'B', number: 'B', name: 'D2', type: 'Character' }),
        'd2',
      );
      const fodder = host.addCardToZone(
        'p1',
        'hand',
        makeCard({ id: 'H', number: 'H', name: 'Fodder', type: 'Character' }),
        'h1',
      );

      const otama = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP13-043',
          number: 'OP13-043',
          name: 'Otama',
          type: 'Character',
        }),
        'otama',
      );

      const handBefore = p1.zones.hand.length;

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: otama.instanceId,
        sourceCardId: 'OP13-043',
      });

      expect(p1.zones.hand).toHaveLength(handBefore + 2);

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');

      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [fodder.instanceId],
      });

      expect(p1.zones.trash[0]?.cardId).toBe('H');
    });

    it('OP13-033 Franky rests up to 2 opponent cards on KO', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      const p2 = host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op13EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      const target1 = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'T1',
          number: 'T1',
          name: 'Target1',
          type: 'Character',
        }),
        't1',
      );
      const target2 = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'T2',
          number: 'T2',
          name: 'Target2',
          type: 'Character',
        }),
        't2',
      );

      const franky = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP13-033',
          number: 'OP13-033',
          name: 'Franky',
          type: 'Character',
        }),
        'franky',
      );

      engine.handleEvent({
        type: 'onKo',
        playerSessionId: 'p1',
        sourceInstanceId: franky.instanceId,
        sourceCardId: 'OP13-033',
        targetInstanceId: franky.instanceId,
      });

      expect(target1.rested).toBe(true);
      expect(target2.rested).toBe(true);
    });

    it('OP13-042 Edward Newgate draws 2, trashes 1, attaches DON to leader and a character', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op13EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      host.addCardToZone(
        'p1',
        'deck',
        makeCard({ id: 'A', number: 'A', name: 'D1', type: 'Character' }),
        'd1',
      );
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({ id: 'B', number: 'B', name: 'D2', type: 'Character' }),
        'd2',
      );
      const fodder = host.addCardToZone(
        'p1',
        'hand',
        makeCard({ id: 'H', number: 'H', name: 'Fodder', type: 'Character' }),
        'h1',
      );

      for (let i = 0; i < 4; i++) {
        host.addCardToZone(
          'p1',
          'donDeck',
          makeCard({
            id: `DON-${i}`,
            number: `DON-${i}`,
            name: 'DON',
            type: 'DON!!',
            cost: null,
            power: null,
            counter: null,
          }),
          `don-${i}`,
        );
        const don = host.addCardToZone(
          'p1',
          'cost',
          makeCard({
            id: `DC-${i}`,
            number: `DC-${i}`,
            name: 'DON',
            type: 'DON!!',
            cost: null,
            power: null,
            counter: null,
          }),
          `dc-${i}`,
        );
        don.rested = true;
      }

      const ally = host.addCardToZone(
        'p1',
        'characters',
        makeCard({ id: 'C', number: 'C', name: 'Ally', type: 'Character' }),
        'ally',
      );
      const newgate = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP13-042',
          number: 'OP13-042',
          name: 'Edward.Newgate',
          type: 'Character',
        }),
        'newgate',
      );

      const handBefore = p1.zones.hand.length;

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: newgate.instanceId,
        sourceCardId: 'OP13-042',
      });

      expect(p1.zones.hand).toHaveLength(handBefore + 2);

      const d1 = engine.getPendingDecision();
      expect(d1?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: d1!.id,
        selectedCardInstanceIds: [fodder.instanceId],
      });

      const d2 = engine.getPendingDecision();
      expect(d2?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: d2!.id,
        selectedCardInstanceIds: [ally.instanceId],
      });

      expect(p1.zones.leader.attachedDon).toBe(2);
      expect(ally.attachedDon).toBe(2);
    });

    it('OP13-080 Nusjuro gains cannotBeRemovedByOpponentEffects and rush with 7+ trash', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op13EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      const nusjuro = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP13-080',
          number: 'OP13-080',
          name: 'St. Ethanbaron V. Nusjuro',
          type: 'Character',
        }),
        'nusjuro',
      );

      for (let i = 0; i < 7; i++) {
        host.addCardToZone(
          'p1',
          'trash',
          makeCard({
            id: `T-${i}`,
            number: `T-${i}`,
            name: `Trash${i}`,
            type: 'Character',
          }),
          `trash-${i}`,
        );
      }

      engine.reapplyContinuousEffects();

      expect(nusjuro.cannotBeRemovedByOpponentEffects).toBe(true);
      expect(nusjuro.hasRush).toBe(true);
    });

    it('OP13-004 Sabo leader gains +1000 power with 4+ life and +1000 for all with DON x1 + cost 8 char', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op13EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      p1.zones.life.splice(0, p1.zones.life.length);
      for (let i = 0; i < 4; i++) {
        host.addCardToZone(
          'p1',
          'life',
          makeCard({
            id: `L${i}`,
            number: `L${i}`,
            name: `Life${i}`,
            type: 'Character',
          }),
          `life-${i}`,
        );
      }

      const heavy = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'C8',
          number: 'C8',
          name: 'Heavy',
          type: 'Character',
          cost: 8,
        }),
        'heavy',
      );
      p1.zones.leader.cardId = 'OP13-004';
      p1.zones.leader.attachedDon = 1;

      engine.reapplyContinuousEffects();

      expect(p1.zones.leader.power).toBe(5000 + 1000 + 1000);
      expect(heavy.power).toBe(1000 + 1000);
    });
    it('OP13-061 Inuarashi adds DON rested and KO cost ≤ 1 on play when DON given', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1');
      const p2 = host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op13EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      host.addCardToZone(
        'p1',
        'donDeck',
        makeCard({
          id: 'DON',
          number: 'DON',
          name: 'DON',
          type: 'DON!!',
          cost: null,
          power: null,
          counter: null,
        }),
        'don',
      );
      p1.zones.leader.attachedDon = 1;

      const victim = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'V',
          number: 'V',
          name: 'Victim',
          type: 'Character',
          cost: 1,
        }),
        'victim',
      );
      host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'S',
          number: 'S',
          name: 'Safe',
          type: 'Character',
          cost: 3,
        }),
        'safe',
      );

      const inuarashi = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP13-061',
          number: 'OP13-061',
          name: 'Inuarashi',
          type: 'Character',
        }),
        'inu',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: inuarashi.instanceId,
        sourceCardId: 'OP13-061',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [victim.instanceId],
      });

      expect(p1.zones.cost).toHaveLength(1);
      expect(p1.zones.cost[0].rested).toBe(true);
      expect(p2.zones.characters.find((c) => c.cardId === 'V')).toBeUndefined();
      expect(p2.zones.characters.find((c) => c.cardId === 'S')).toBeDefined();
    });

    it('OP13-046 Vista replacement effect prevents KO on Whitebeard Pirates char', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1');
      const p2 = host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op13EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      const vista = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP13-046',
          number: 'OP13-046',
          name: 'Vista',
          type: 'Character',
          families: ['Whitebeard Pirates'],
        }),
        'vista',
      );
      const wbCard = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'WB',
          number: 'WB',
          name: 'Whitebeard Pirate',
          type: 'Character',
          families: ['Whitebeard Pirates'],
        }),
        'wb-hand',
      );

      const replaced = engine.applyReplacement({
        type: 'wouldKoCharacter',
        playerSessionId: 'p1',
        sourceInstanceId: vista.instanceId,
        sourceCardId: 'OP13-046',
        targetInstanceId: vista.instanceId,
        targetCardId: 'OP13-046',
        reason: 'effect',
        replacementCardInstanceId: vista.instanceId,
      });

      expect(replaced).toBe(true);
      expect(p1.zones.trash[0]?.cardId).toBe('WB');
    });

    it('OP13-023 Uta (special) sets up to 2 rested DON as active on play', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op13EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      for (let i = 0; i < 3; i++) {
        const don = host.addCardToZone(
          'p1',
          'cost',
          makeCard({
            id: `DON-${i}`,
            number: `DON-${i}`,
            name: 'DON',
            type: 'DON!!',
            cost: null,
            power: null,
            counter: null,
          }),
          `don-${i}`,
        );
        don.rested = true;
      }

      const uta = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP13-023',
          number: 'OP13-023',
          name: 'Uta',
          type: 'Character',
        }),
        'uta',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: uta.instanceId,
        sourceCardId: 'OP13-023',
      });

      const activeDon = p1.zones.cost.filter((d) => !d.rested).length;
      expect(activeDon).toBe(2);
    });

    it('OP13-023 Uta (special) plays a cost 5 or less Character from hand on KO', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op13EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      const rekrut = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'CH',
          number: 'CH',
          name: 'Cheap Char',
          type: 'Character',
          cost: 3,
        }),
        'cheap',
      );
      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'EX',
          number: 'EX',
          name: 'Expensive Char',
          type: 'Character',
          cost: 7,
        }),
        'costly',
      );

      const uta = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP13-023',
          number: 'OP13-023',
          name: 'Uta',
          type: 'Character',
        }),
        'uta',
      );

      engine.handleEvent({
        type: 'onKo',
        playerSessionId: 'p1',
        sourceInstanceId: uta.instanceId,
        sourceCardId: 'OP13-023',
        targetInstanceId: uta.instanceId,
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');

      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [rekrut.instanceId],
      });

      expect(p1.zones.characters.some((c) => c.cardId === 'CH')).toBe(true);
      expect(p1.zones.characters.find((c) => c.cardId === 'CH')?.rested).toBe(
        true,
      );
    });

    it('OP13-031 Trafalgar Law bounces a character and plays cost 5 or less from hand', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op13EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      const toPlay = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'P',
          number: 'P',
          name: 'PlayTarget',
          type: 'Character',
          cost: 4,
        }),
        'to-play',
      );
      const toBounce = host.addCardToZone(
        'p1',
        'characters',
        makeCard({ id: 'B', number: 'B', name: 'BounceMe', type: 'Character' }),
        'to-bounce',
      );
      const law = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP13-031',
          number: 'OP13-031',
          name: 'Trafalgar Law',
          type: 'Character',
        }),
        'law',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: law.instanceId,
        sourceCardId: 'OP13-031',
      });

      const confirm = engine.getPendingDecision();
      expect(confirm?.prompt.type).toBe('confirm');
      engine.answerDecision({ decisionId: confirm!.id, confirmed: true });

      const bounceSelect = engine.getPendingDecision();
      expect(bounceSelect?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: bounceSelect!.id,
        selectedCardInstanceIds: [toBounce.instanceId],
      });

      expect(p1.zones.hand.some((c) => c.cardId === 'B')).toBe(true);

      const playSelect = engine.getPendingDecision();
      expect(playSelect?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: playSelect!.id,
        selectedCardInstanceIds: [toPlay.instanceId],
      });

      expect(p1.zones.characters.some((c) => c.cardId === 'P')).toBe(true);
      expect(p1.zones.characters.find((c) => c.cardId === 'P')?.rested).toBe(
        true,
      );
    });

    it('OP13-003 Gol.D.Roger (special leader) gives leader +2000 on play when DON field ≤ 9', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op13EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      p1.zones.leader.cardId = 'OP13-003';
      p1.zones.leader.name = 'Gol.D.Roger';
      const leader = p1.zones.leader;

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: leader.instanceId,
        sourceCardId: 'OP13-003',
      });

      leader.power = 5000;
      engine.reapplyContinuousEffects();
      expect(leader.power).toBe(7000);
    });

    it('OP13-013 Higuma KO up to 1 opponent character with 0 power or less on play', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      const p2 = host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op13EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      const victim = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'V',
          number: 'V',
          name: 'Weakling',
          type: 'Character',
          power: 0,
        }),
        'victim',
      );
      host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'S',
          number: 'S',
          name: 'Survivor',
          type: 'Character',
          power: 2000,
        }),
        'survivor',
      );

      const higuma = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP13-013',
          number: 'OP13-013',
          name: 'Higuma',
          type: 'Character',
        }),
        'higuma',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: higuma.instanceId,
        sourceCardId: 'OP13-013',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [victim.instanceId],
      });

      expect(p2.zones.characters.find((c) => c.cardId === 'V')).toBeUndefined();
      expect(p2.zones.characters.find((c) => c.cardId === 'S')).toBeDefined();
    });

    it('OP13-044 Curiel draws 1 on KO', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op13EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      host.addCardToZone(
        'p1',
        'deck',
        makeCard({ id: 'D', number: 'D', name: 'Topdeck', type: 'Character' }),
        'd',
      );

      const curiel = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP13-044',
          number: 'OP13-044',
          name: 'Curiel',
          type: 'Character',
        }),
        'curiel',
      );

      engine.handleEvent({
        type: 'onKo',
        playerSessionId: 'p1',
        sourceInstanceId: curiel.instanceId,
        sourceCardId: 'OP13-044',
        targetInstanceId: curiel.instanceId,
      });

      expect(p1.zones.hand).toHaveLength(1);
    });

    it('OP13-005 Inazuma attaches 1 rested DON to leader on play', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op13EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      const donCard = host.addCardToZone(
        'p1',
        'cost',
        makeCard({
          id: 'DC',
          number: 'DC',
          name: 'DON Cost',
          type: 'DON!!',
          cost: null,
          power: null,
          counter: null,
        }),
        'dc',
      );
      donCard.rested = true;

      const inazuma = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP13-005',
          number: 'OP13-005',
          name: 'Inazuma',
          type: 'Character',
        }),
        'inazuma',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: inazuma.instanceId,
        sourceCardId: 'OP13-005',
      });

      expect(p1.zones.leader.attachedDon).toBe(1);
    });

    it('OP13-027 Sanji sets up to 2 DON as active on play with FILM leader', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op13EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      p1.zones.leader.families.push('FILM');

      for (let i = 0; i < 2; i++) {
        const don = host.addCardToZone(
          'p1',
          'cost',
          makeCard({
            id: `DON-${i}`,
            number: `DON-${i}`,
            name: 'DON',
            type: 'DON!!',
            cost: null,
            power: null,
            counter: null,
          }),
          `don-${i}`,
        );
        don.rested = true;
      }

      const sanji = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP13-027',
          number: 'OP13-027',
          name: 'Sanji',
          type: 'Character',
        }),
        'sanji',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: sanji.instanceId,
        sourceCardId: 'OP13-027',
      });

      const activeCount = p1.zones.cost.filter((d) => !d.rested).length;
      expect(activeCount).toBe(2);
    });

    it('OP13-100 Jewelry Bonney attaches up to 2 rested DON!! when you play a Character with Trigger during your turn', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op13EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      const firstDon = host.addCardToZone(
        'p1',
        'cost',
        makeCard({
          id: 'DON-1',
          number: 'DON-1',
          name: 'DON',
          type: 'DON!!',
          cost: null,
          power: null,
          counter: null,
        }),
        'don-1',
      );
      firstDon.rested = true;
      const secondDon = host.addCardToZone(
        'p1',
        'cost',
        makeCard({
          id: 'DON-2',
          number: 'DON-2',
          name: 'DON',
          type: 'DON!!',
          cost: null,
          power: null,
          counter: null,
        }),
        'don-2',
      );
      secondDon.rested = true;

      const bonney = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP13-100',
          number: 'OP13-100',
          name: 'Jewelry Bonney',
          type: 'Character',
        }),
        'bonney',
      );
      const triggeredCharacter = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'TRIGGERED-CHAR',
          number: 'TRIGGERED-CHAR',
          name: 'Triggered Character',
          type: 'Character',
          trigger: 'Play this card.',
        }),
        'triggered-character',
      );

      engine.handleEvent({
        type: 'onCharacterPlayed',
        playerSessionId: 'p1',
        sourceInstanceId: triggeredCharacter.instanceId,
        sourceCardId: triggeredCharacter.cardId,
        sourceZone: 'hand',
      });

      const pending = engine.getPendingDecision();
      expect(pending?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: pending?.id ?? '',
        selectedCardInstanceIds: [bonney.instanceId],
      });

      expect(p1.zones.cost).toHaveLength(0);
      expect(bonney.attachedDon).toBe(2);
    });

    it('OP13-078 Oro Jackson adds 1 rested DON!! when your Roger Pirates Character is removed from the field by your opponent effect', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op13EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      const oroJackson = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'OP13-078',
          number: 'OP13-078',
          name: 'Oro Jackson',
          type: 'Stage',
        }),
        'oro-jackson',
      );
      host.playCard(oroJackson, 'p1', 'stage');
      const removedCharacter = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ROGER-CHAR',
          number: 'ROGER-CHAR',
          name: 'Roger Character',
          type: 'Character',
          families: ['Roger Pirates'],
        }),
        'roger-character',
      );
      host.addCardToZone(
        'p1',
        'donDeck',
        makeCard({
          id: 'DON-078',
          number: 'DON-078',
          name: 'DON!!',
          type: 'DON!!',
          cost: null,
          power: null,
          counter: null,
        }),
        'don-078',
      );
      engine.handleEvent({
        type: 'onCardRemovedByEffect',
        playerSessionId: 'p1',
        effectControllerSessionId: 'p2',
        sourceInstanceId: oroJackson.instanceId,
        sourceCardId: oroJackson.cardId,
        targetInstanceId: removedCharacter.instanceId,
        targetCardId: removedCharacter.cardId,
        sourceZone: 'characters',
        destinationZone: 'trash',
      });

      expect(p1.zones.cost).toHaveLength(1);
      expect(p1.zones.cost[0]?.rested).toBe(true);
      expect(p1.zones.stage).toBe(oroJackson);
    });

    it('OP13-089 St. Topman Warcury gains immunity and Blocker with 7+ trash, then draws 1 on K.O.', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op13EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      for (let index = 0; index < 7; index += 1) {
        host.addCardToZone(
          'p1',
          'trash',
          makeCard({
            id: `TRASH-${index}`,
            number: `TRASH-${index}`,
            name: `Trash ${index}`,
            type: 'Character',
          }),
          `trash-${index}`,
        );
      }
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'DRAW-089',
          number: 'DRAW-089',
          name: 'Draw 089',
          type: 'Character',
        }),
        'draw-089',
      );

      const warcury = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP13-089',
          number: 'OP13-089',
          name: 'St. Topman Warcury',
          type: 'Character',
        }),
        'warcury',
      );

      engine.reapplyContinuousEffects();

      expect(warcury.cannotBeRemovedByOpponentEffects).toBe(true);
      expect(warcury.mustBeAttackTarget).toBe(true);

      engine.handleEvent({
        type: 'onKo',
        playerSessionId: 'p1',
        sourceInstanceId: warcury.instanceId,
        sourceCardId: warcury.cardId,
        targetInstanceId: warcury.instanceId,
        targetCardId: warcury.cardId,
      });

      expect(p1.zones.hand).toHaveLength(1);
      expect(p1.zones.hand[0]?.cardId).toBe('DRAW-089');
    });

    it('OP13-091 St. Marcus Mars gains immunity and Blocker with 7+ trash on play', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op13EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      for (let index = 0; index < 7; index += 1) {
        host.addCardToZone(
          'p1',
          'trash',
          makeCard({
            id: `TRASH-MARS-${index}`,
            number: `TRASH-MARS-${index}`,
            name: `Trash Mars ${index}`,
            type: 'Character',
          }),
          `trash-mars-${index}`,
        );
      }

      const discard = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'DISCARD-091',
          number: 'DISCARD-091',
          name: 'Discard 091',
          type: 'Event',
        }),
        'discard-091',
      );
      const mars = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP13-091',
          number: 'OP13-091',
          name: 'St. Marcus Mars',
          type: 'Character',
        }),
        'mars',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: mars.instanceId,
        sourceCardId: mars.cardId,
      });

      expect(mars.cannotBeRemovedByOpponentEffects).toBe(true);
      expect(mars.mustBeAttackTarget).toBe(false);

      const confirm = engine.getPendingDecision();
      expect(confirm?.prompt.type).toBe('confirm');
      engine.answerDecision({ decisionId: confirm!.id, confirmed: false });

      expect(p1.zones.hand.some((card) => card.cardId === discard.cardId)).toBe(
        true,
      );
    });

    it('OP13-112 Vegapunk gains Blocker with 2 attached DON!!', () => {
      const host = new TestHost();
      const p1 = host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op13EffectDefinitions], specialHandlerDefinitions),
        host,
      );

      const vegapunk = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP13-112',
          number: 'OP13-112',
          name: 'Vegapunk',
          type: 'Character',
        }),
        'vegapunk',
      );

      expect(vegapunk.mustBeAttackTarget).toBe(false);

      vegapunk.attachedDon = 2;
      engine.reapplyContinuousEffects();

      expect(vegapunk.mustBeAttackTarget).toBe(true);
    });
  });
});
