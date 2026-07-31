/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { describe, expect, it } from 'vitest';
import { DuelCard, type Card } from '@onepiecetcg/shared';
import { EffectEngine } from '../../../effect-engine/src/effect-engine.js';
import { st11EffectDefinitions } from './ST-11.effects';
import { createRegistry, makeCard, TestHost } from '../test-utils.js';

describe('ST11 effect definitions', () => {
  const createEngine = (host: TestHost): EffectEngine => {
    const registry = createRegistry([st11EffectDefinitions]);
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

  describe('ST11-001 Uta (Leader)', () => {
    it('reveals top card and takes FILM card to hand on attack with DON!! x1', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST11-001');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      p1.zones.deck.splice(0, p1.zones.deck.length);
      const filmCard = host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'film-card',
          number: 'film-card',
          name: 'Film Character',
          type: 'Character',
          families: ['FILM'],
          cost: 3,
          power: 5000,
        }),
        'film-card',
      );

      host.addDonToCost('p1', 1, false);
      p1.zones.leader.attachedDon = 1;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: p1.zones.leader.instanceId,
        sourceCardId: 'ST11-001',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');

      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [filmCard.instanceId],
      });

      expect(
        p1.zones.hand.find((c) => c.instanceId === filmCard.instanceId),
      ).toBeTruthy();
    });

    it('places non-FILM card back when revealed card is not FILM', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST11-001');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      p1.zones.deck.splice(0, p1.zones.deck.length);
      const nonFilmCard = host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'non-film',
          number: 'non-film',
          name: 'Non Film',
          type: 'Character',
          families: ['Something'],
          cost: 3,
          power: 5000,
        }),
        'non-film',
      );

      host.addDonToCost('p1', 1, false);
      p1.zones.leader.attachedDon = 1;

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: p1.zones.leader.instanceId,
        sourceCardId: 'ST11-001',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');

      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [],
      });

      expect(
        p1.zones.hand.find((c) => c.instanceId === nonFilmCard.instanceId),
      ).toBeFalsy();
      expect(
        p1.zones.deck.find((c) => c.instanceId === nonFilmCard.instanceId),
      ).toBeTruthy();
    });
  });

  describe('ST11-002 Uta (Character)', () => {
    it('trashes an Event from hand to restand FILM Characters at end of turn', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;

      const eventCard = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'some-event',
          number: 'some-event',
          name: 'Some Event',
          type: 'Event',
          cost: 1,
        }),
        'event',
      );

      const filmChar = addCharacter(host, 'p1', {
        name: 'FILM Char',
        instanceSuffix: 'film',
        families: ['FILM'],
      });
      filmChar.rested = true;

      const uta = addCharacter(host, 'p1', {
        id: 'ST11-002',
        number: 'ST11-002',
        name: 'Uta (002)',
        instanceSuffix: 'uta',
        families: ['FILM'],
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onTurnEnd',
        playerSessionId: 'p1',
        sourceInstanceId: uta.instanceId,
        sourceCardId: 'ST11-002',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');

      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [eventCard.instanceId],
      });

      expect(
        p1.zones.hand.find((c) => c.instanceId === eventCard.instanceId),
      ).toBeFalsy();
      expect(
        p1.zones.trash.find((c) => c.instanceId === eventCard.instanceId),
      ).toBeTruthy();

      // restand acts on all matching FILM characters (no decision prompt)
      expect(filmChar.rested).toBe(false);
      expect(uta.rested).toBe(false);
    });
  });

  describe('ST11-003 Backlight', () => {
    it('offers chooseActionBranch with rest and ko choices when leader is Uta', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST11-001');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      p1.zones.leader.name = 'Uta';

      const backlight = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST11-003',
          number: 'ST11-003',
          name: 'Backlight',
          type: 'Event',
          cost: 2,
        }),
        'backlight',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: backlight.instanceId,
        sourceCardId: 'ST11-003',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectChoice');
      if (decision?.prompt.type === 'selectChoice') {
        expect(decision.prompt.choices).toHaveLength(2);
        expect(decision.prompt.choices[0].id).toBe('st11-003-rest');
        expect(decision.prompt.choices[1].id).toBe('st11-003-ko');
      }
    });
  });

  describe('ST11-004 New Genesis', () => {
    it('searches top 3, takes FILM card to hand, sets DON!! active when leader is Uta', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST11-001');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      p1.zones.leader.name = 'Uta';

      p1.zones.deck.splice(0, p1.zones.deck.length);
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'non-film-1',
          number: 'non-film-1',
          name: 'Non FILM 1',
          type: 'Character',
          families: ['Something'],
          cost: 1,
          power: 1000,
        }),
        'non-film-1',
      );
      const filmCard = host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'film-card-ng',
          number: 'film-card-ng',
          name: 'FILM Char',
          type: 'Character',
          families: ['FILM'],
          cost: 3,
          power: 5000,
        }),
        'film-card-ng',
      );
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'non-film-2',
          number: 'non-film-2',
          name: 'Non FILM 2',
          type: 'Character',
          families: ['SomethingElse'],
          cost: 2,
          power: 2000,
        }),
        'non-film-2',
      );

      p1.zones.donDeck.push(new DuelCard());

      const newGenesis = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST11-004',
          number: 'ST11-004',
          name: 'New Genesis',
          type: 'Event',
          cost: 1,
        }),
        'new-genesis',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: newGenesis.instanceId,
        sourceCardId: 'ST11-004',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');

      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [filmCard.instanceId],
      });

      expect(
        p1.zones.hand.find((c) => c.instanceId === filmCard.instanceId),
      ).toBeTruthy();

      expect(p1.zones.cost.length).toBe(1);
    });
  });

  describe("ST11-005 I'm invincible", () => {
    it('sets Uta Leader as active on main activation', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST11-001');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      p1.zones.leader.name = 'Uta';
      p1.zones.leader.rested = true;

      const invincible = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST11-005',
          number: 'ST11-005',
          name: "I'm invincible",
          type: 'Event',
          cost: 3,
        }),
        'invincible',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: invincible.instanceId,
        sourceCardId: 'ST11-005',
      });

      expect(p1.zones.leader.rested).toBe(false);
    });

    it('grants +1000 power to Leader or Character on trigger', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');

      const invincible = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST11-005',
          number: 'ST11-005',
          name: "I'm invincible",
          type: 'Event',
          cost: 3,
        }),
        'invincible',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: invincible.instanceId,
        sourceCardId: 'ST11-005',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      if (decision?.prompt.type === 'selectCards') {
        expect(decision.prompt.max).toBe(1);
      }
    });
  });

  describe('Structural validation', () => {
    it('all cards have valid effect definitions', () => {
      for (const card of st11EffectDefinitions.cards) {
        expect(card.cardId).toMatch(/^ST11-\d{3}$/);
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

    it('ST11-001 has whenAttacking trigger with DON!! x1 condition', () => {
      const card = st11EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST11-001',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('whenAttacking');
        expect(stdEntry.effect.trigger.oncePerTurn).toBe(true);
        expect(stdEntry.effect.conditions).toContainEqual({
          type: 'sourceHasAttachedDonAtLeast',
          value: 1,
        });
      }
    });

    it('ST11-003 uses chooseActionBranch with rest and ko choices', () => {
      const card = st11EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST11-003',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('activateMain');
        expect(stdEntry.effect.conditions).toContainEqual({
          type: 'playerHasLeaderName',
          player: 'self',
          value: 'Uta',
        });
        const branchAction = stdEntry.effect.actions[0];
        expect(branchAction.type).toBe('chooseActionBranch');
        if (branchAction.type === 'chooseActionBranch') {
          expect(branchAction.choices).toHaveLength(2);
          expect(branchAction.choices[0].id).toBe('st11-003-rest');
          expect(branchAction.choices[1].id).toBe('st11-003-ko');
        }
      }
    });

    it('ST11-004 New Genesis has activateMain trigger, search, and addDon actions', () => {
      const card = st11EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST11-004',
      );
      expect(card).toBeDefined();
      const stdEntry = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEntry).toBeDefined();
      if (stdEntry?.kind === 'standard') {
        expect(stdEntry.effect.trigger.type).toBe('activateMain');
        expect(stdEntry.effect.conditions).toContainEqual({
          type: 'playerHasLeaderName',
          player: 'self',
          value: 'Uta',
        });
        const searchAction = stdEntry.effect.actions[0];
        expect(searchAction.type).toBe('search');
        if (searchAction.type === 'search') {
          expect(searchAction.sourceZone).toBe('deck');
          expect(searchAction.amount).toBe(3);
          expect(searchAction.filter).toHaveProperty('trait', ['FILM']);
          expect(searchAction.filter).toHaveProperty(
            'excludeName',
            expect.arrayContaining(['New Genesis']),
          );
        }
        const addDonAction = stdEntry.effect.actions[1];
        expect(addDonAction.type).toBe('addDon');
        if (addDonAction.type === 'addDon') {
          expect(addDonAction.amount).toBe(1);
          expect(addDonAction.rested).toBe(false);
        }
      }
    });

    it('ST11-005 has two effects: main restand and trigger +1000', () => {
      const card = st11EffectDefinitions.cards.find(
        (c) => c.cardId === 'ST11-005',
      );
      expect(card).toBeDefined();
      expect(card!.effects).toHaveLength(2);

      const mainEntry = card!.effects?.find(
        (e) =>
          e.kind === 'standard' && e.effect.trigger.type === 'activateMain',
      );
      expect(mainEntry).toBeDefined();
      if (mainEntry?.kind === 'standard') {
        const restandAction = mainEntry.effect.actions[0];
        expect(restandAction.type).toBe('restand');
      }

      const triggerEntry = card!.effects?.find(
        (e) => e.kind === 'standard' && e.effect.trigger.type === 'trigger',
      );
      expect(triggerEntry).toBeDefined();
      if (triggerEntry?.kind === 'standard') {
        const modifyAction = triggerEntry.effect.actions[0];
        expect(modifyAction.type).toBe('modifyPower');
        if (modifyAction.type === 'modifyPower') {
          expect(modifyAction.amount).toBe(1000);
          expect(modifyAction.duration.type).toBe('untilEndOfTurn');
        }
      }
    });
  });
});
