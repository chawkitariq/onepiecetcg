/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unused-vars */
import { describe, expect, it } from 'vitest';
import { DuelCard, type Card } from '@onepiecetcg/shared';
import { EffectEngine } from '../../../effect-engine/src/effect-engine.js';
import type { SpecialHandlerDefinition } from '../../../effect-engine/src/types/effect-registry.js';
import { st07EffectDefinitions } from './ST-07.effects';
import { createRegistry, makeCard, TestHost } from '../test-utils.js';

describe('ST07 effect definitions', () => {
  const createEngine = (
    host: TestHost,
    specialHandlers: readonly SpecialHandlerDefinition[] = [],
  ): EffectEngine => {
    const registry = createRegistry([st07EffectDefinitions], specialHandlers);
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

  describe('ST07-001 Charlotte Linlin (Leader)', () => {
    it('when attacking with DON!! x2, pays life cost then conditionally moves hand card to life', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST07-001');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      p1.zones.leader.attachedDon = 2;

      host.addCardToZone(
        'p1',
        'life',
        makeCard({
          id: 'life-0',
          number: 'life-0',
          name: 'Life Card',
          type: 'Character',
          cost: 0,
          power: 0,
        }),
        'life-0',
      );
      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'hand-0',
          number: 'hand-0',
          name: 'Hand Card',
          type: 'Character',
          cost: 0,
          power: 0,
        }),
        'hand-0',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: p1.zones.leader.instanceId,
        sourceCardId: 'ST07-001',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [p1.zones.hand[0].instanceId],
      });

      expect(p1.zones.life.length).toBe(1);
      expect(p1.zones.hand.length).toBe(1);
    });
  });

  describe('ST07-003 Charlotte Katakuri', () => {
    const answerDestinationChoice = (
      engine: EffectEngine,
      choiceId: string,
    ): void => {
      const decision = engine.getPendingDecision();
      if (
        decision?.prompt.type === 'selectChoice' &&
        (decision.prompt as any).choices?.[0]?.id === 'top'
      ) {
        engine.answerDecision({
          decisionId: decision.id,
          selectedChoiceIds: [choiceId],
        });
      }
    };

    it('on play, reveals own life and repositions it, then gains Rush with fewer life than opponent', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      const katakuri = addCharacter(host, 'p1', {
        id: 'ST07-003',
        number: 'ST07-003',
        name: 'Charlotte Katakuri',
        instanceSuffix: 'katakuri',
      });
      host.addCardToZone(
        'p1',
        'life',
        makeCard({
          id: 'p1-life',
          number: 'p1-life',
          name: 'Life',
          type: 'Character',
          cost: 0,
          power: 0,
        }),
        'p1-life',
      );
      host.addCardToZone(
        'p2',
        'life',
        makeCard({
          id: 'p2-life-0',
          number: 'p2-life-0',
          name: 'Life',
          type: 'Character',
          cost: 0,
          power: 0,
        }),
        'p2-life-0',
      );
      host.addCardToZone(
        'p2',
        'life',
        makeCard({
          id: 'p2-life-1',
          number: 'p2-life-1',
          name: 'Life',
          type: 'Character',
          cost: 0,
          power: 0,
        }),
        'p2-life-1',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: katakuri.instanceId,
        sourceCardId: 'ST07-003',
      });

      let decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectChoice');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedChoiceIds: ['st07-003-own-life'],
      });

      decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [p1.zones.life[0].instanceId],
      });

      answerDestinationChoice(engine, 'top');

      expect(katakuri.hasRush).toBeTruthy();
    });

    it('on play, reveals opponent life, does not gain Rush with equal life', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      const p2 = host.getPlayer('p2')!;
      const katakuri = addCharacter(host, 'p1', {
        id: 'ST07-003',
        number: 'ST07-003',
        name: 'Charlotte Katakuri',
        instanceSuffix: 'katakuri-2',
      });
      host.addCardToZone(
        'p1',
        'life',
        makeCard({
          id: 'p1-life',
          number: 'p1-life',
          name: 'Life',
          type: 'Character',
          cost: 0,
          power: 0,
        }),
        'p1-life',
      );
      host.addCardToZone(
        'p2',
        'life',
        makeCard({
          id: 'p2-life',
          number: 'p2-life',
          name: 'Life',
          type: 'Character',
          cost: 0,
          power: 0,
        }),
        'p2-life',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: katakuri.instanceId,
        sourceCardId: 'ST07-003',
      });

      let decision = engine.getPendingDecision();
      engine.answerDecision({
        decisionId: decision!.id,
        selectedChoiceIds: ['st07-003-opponent-life'],
      });

      decision = engine.getPendingDecision();
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [p2.zones.life[0].instanceId],
      });

      const destDecision = engine.getPendingDecision();
      if (destDecision) {
        engine.answerDecision({
          decisionId: destDecision.id,
          selectedChoiceIds: ['top'],
        });
      }

      expect(katakuri.hasRush).toBeFalsy();
    });
  });

  describe('ST07-010 Charlotte Linlin', () => {
    it('on play, chooseActionBranch lets player add deck to life', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      const linlin = addCharacter(host, 'p1', {
        id: 'ST07-010',
        number: 'ST07-010',
        name: 'Charlotte Linlin',
        instanceSuffix: 'linlin-010',
      });
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'deck-card',
          number: 'deck-card',
          name: 'Deck Card',
          type: 'Character',
          cost: 0,
          power: 0,
        }),
        'deck-card',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: linlin.instanceId,
        sourceCardId: 'ST07-010',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectChoice');

      engine.answerDecision({
        decisionId: decision!.id,
        selectedChoiceIds: ['st07-010-deck-to-life'],
      });

      expect(p1.zones.deck.length).toBe(0);
      expect(p1.zones.life.length).toBe(1);
    });

    it('on play, chooseActionBranch lets opponent trash own life', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p2 = host.getPlayer('p2')!;
      const linlin = addCharacter(host, 'p1', {
        id: 'ST07-010',
        number: 'ST07-010',
        name: 'Charlotte Linlin',
        instanceSuffix: 'linlin-010b',
      });
      host.addCardToZone(
        'p2',
        'life',
        makeCard({
          id: 'p2-life',
          number: 'p2-life',
          name: 'Life',
          type: 'Character',
          cost: 0,
          power: 0,
        }),
        'p2-life',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: linlin.instanceId,
        sourceCardId: 'ST07-010',
      });

      const decision = engine.getPendingDecision();
      engine.answerDecision({
        decisionId: decision!.id,
        selectedChoiceIds: ['st07-010-trash-opponent-life'],
      });

      expect(p2.zones.life.length).toBe(0);
      expect(p2.zones.trash.length).toBe(1);
    });
  });

  describe('ST07-015 Soul Pocus', () => {
    it('main effect uses chooseActionBranch for opponent-style choice', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const soulPocus = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST07-015',
          number: 'ST07-015',
          name: 'Soul Pocus',
          type: 'Event',
          cost: 2,
          text: "[Main] Your opponent chooses one: \u2022 Trash 1 card from the top of your opponent's Life cards. \u2022 Add 1 card from the top of your deck to the top of your Life cards.",
        }),
        'soul-pocus',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: soulPocus.instanceId,
        sourceCardId: 'ST07-015',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectChoice');
    });

    it('trigger activates the main effect via activateEffect', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'ST07-015',
          number: 'ST07-015',
          name: 'Soul Pocus',
          type: 'Event',
          cost: 2,
          text: "[Trigger] Activate this card's [Main] effect.",
        }),
        'soul-pocus-trigger',
      );
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'deck-card',
          number: 'deck-card',
          name: 'Deck Card',
          type: 'Character',
          cost: 0,
          power: 0,
        }),
        'deck-card',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: `${p1.sessionId}:soul-pocus-trigger`,
        sourceCardId: 'ST07-015',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectChoice');
    });
  });

  describe("ST07-009 Charlotte Mont-d'Or", () => {
    it('activate main rests self, adds life to hand, then KOs cost 3 or less', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      const p2 = host.getPlayer('p2')!;
      const montdor = addCharacter(host, 'p1', {
        id: 'ST07-009',
        number: 'ST07-009',
        name: "Charlotte Mont-d'Or",
        instanceSuffix: 'montdor',
        cost: 4,
      });
      host.addCardToZone(
        'p1',
        'life',
        makeCard({
          id: 'p1-life',
          number: 'p1-life',
          name: 'Life',
          type: 'Character',
          cost: 0,
          power: 0,
        }),
        'p1-life',
      );

      const target = addCharacter(host, 'p2', {
        name: 'Target',
        instanceSuffix: 'target',
        cost: 3,
      });

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: montdor.instanceId,
        sourceCardId: 'ST07-009',
      });

      expect(montdor.rested).toBeTruthy();
      expect(p1.zones.life.length).toBe(0);
      expect(p1.zones.hand.length).toBe(1);

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

    it('trigger trashes from hand to play this card', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'ST07-009',
          number: 'ST07-009',
          name: "Charlotte Mont-d'Or",
          type: 'Character',
          cost: 4,
          power: 5000,
          text: '[Activate:Main] ... [Trigger] You may trash 1 card from your hand: Play this card.',
        }),
        'montdor-trigger',
      );
      const handCard = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'trash-me',
          number: 'trash-me',
          name: 'Trash Me',
          type: 'Character',
          cost: 0,
          power: 0,
        }),
        'trash-me',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: `${p1.sessionId}:montdor-trigger`,
        sourceCardId: 'ST07-009',
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [handCard.instanceId],
      });

      expect(p1.zones.hand.length).toBe(0);
      expect(
        p1.zones.characters.find((c) => c.cardId === 'ST07-009'),
      ).toBeTruthy();
    });
  });

  describe('ST07-007 Charlotte Brulee', () => {
    it('trigger plays this card', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'ST07-007',
          number: 'ST07-007',
          name: 'Charlotte Brulee',
          type: 'Character',
          cost: 2,
          power: 1000,
          text: '[Blocker] [Trigger] Play this card.',
        }),
        'brulee',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: `${p1.sessionId}:brulee`,
        sourceCardId: 'ST07-007',
      });

      expect(
        p1.zones.characters.find((c) => c.cardId === 'ST07-007'),
      ).toBeTruthy();
    });
  });

  describe('ST07-011 Zeus', () => {
    it('activate main rests to give Banish to Charlotte Linlin', () => {
      const host = new TestHost();
      host.addPlayer('p1', 'ST07-001');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      const zeus = addCharacter(host, 'p1', {
        id: 'ST07-011',
        number: 'ST07-011',
        name: 'Zeus',
        instanceSuffix: 'zeus',
      });
      p1.zones.leader.name = 'Charlotte Linlin';

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: zeus.instanceId,
        sourceCardId: 'ST07-011',
      });

      expect(zeus.rested).toBeTruthy();

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision!.id,
        selectedCardInstanceIds: [p1.zones.leader.instanceId],
      });
    });

    it('trigger plays this card', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const p1 = host.getPlayer('p1')!;
      host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'ST07-011',
          number: 'ST07-011',
          name: 'Zeus',
          type: 'Character',
          cost: 3,
          power: 4000,
          text: '[Activate:Main] ... [Trigger] Play this card.',
        }),
        'zeus-trigger',
      );

      const engine = createEngine(host);
      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: `${p1.sessionId}:zeus-trigger`,
        sourceCardId: 'ST07-011',
      });

      expect(
        p1.zones.characters.find((c) => c.cardId === 'ST07-011'),
      ).toBeTruthy();
    });
  });
});
