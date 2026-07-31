import { EffectEngine } from '@onepiecetcg/effect-engine';
import { TestHost, makeCard, createRegistry } from '../test-utils.js';
import { op08EffectDefinitions } from './OP-08.effects';
import { op08118SpecialHandler } from './special/OP08-118.special';

describe('OP08 Effect Definitions', () => {
  it('should export the edition definitions with editionId OP08', () => {
    expect(op08EffectDefinitions.editionId).toBe('OP-08');
  });

  it('should have cards array with entries', () => {
    expect(op08EffectDefinitions.cards.length).toBeGreaterThan(0);
  });

  it('every card should have a valid cardId', () => {
    for (const card of op08EffectDefinitions.cards) {
      expect(card.cardId).toMatch(/^OP08-\d{3}$/);
    }
  });

  it('every card should have effects defined', () => {
    for (const card of op08EffectDefinitions.cards) {
      expect(card.effects).toBeDefined();
      expect(card.effects?.length).toBeGreaterThan(0);
    }
  });

  it('every effect entry should have a valid kind', () => {
    const validKinds = ['standard', 'continuous', 'replacement', 'special-ref'];
    for (const card of op08EffectDefinitions.cards) {
      for (const effect of card.effects ?? []) {
        expect(validKinds).toContain(effect.kind);
      }
    }
  });

  describe('standard effects', () => {
    it('should have text, trigger, and actions', () => {
      for (const card of op08EffectDefinitions.cards) {
        for (const entry of card.effects ?? []) {
          if (entry.kind === 'standard') {
            expect(entry.effect.id).toBeTruthy();
            expect(entry.effect.text).toBeTruthy();
            expect(entry.effect.trigger).toBeDefined();
            expect(entry.effect.actions).toBeDefined();
            expect(entry.effect.actions.length).toBeGreaterThan(0);
          }
        }
      }
    });
  });

  describe('special-ref entries', () => {
    it('should reference a valid handler id', () => {
      for (const card of op08EffectDefinitions.cards) {
        for (const entry of card.effects ?? []) {
          if (entry.kind === 'special-ref') {
            expect(entry.specialHandlerId).toBeTruthy();
            expect(entry.specialHandlerId).toMatch(/^op08-\d{3}-special$/);
          }
        }
      }
    });

    it('should keep converted cards on the standard DSL path', () => {
      const blackMaria = op08EffectDefinitions.cards.find(
        (card) => card.cardId === 'OP08-074',
      );
      const charlotteAngel = op08EffectDefinitions.cards.find(
        (card) => card.cardId === 'OP08-101',
      );

      expect(
        blackMaria?.effects?.some(
          (entry) =>
            entry.kind === 'standard' &&
            entry.effect.actions.some(
              (action) => action.type === 'scheduleActionsAtTurnEnd',
            ),
        ),
      ).toBe(true);
      expect(
        charlotteAngel?.effects?.some(
          (entry) =>
            entry.kind === 'standard' &&
            entry.effect.actions.some(
              (action) => action.type === 'scheduleActionsAtTurnEnd',
            ),
        ),
      ).toBe(true);
    });
  });

  describe('continuous effects', () => {
    it('should have a valid modifier', () => {
      for (const card of op08EffectDefinitions.cards) {
        for (const entry of card.effects ?? []) {
          if (entry.kind === 'continuous') {
            expect(entry.effect.modifier).toBeDefined();
            expect(entry.effect.modifier.selector).toBeDefined();
          }
        }
      }
    });
  });

  describe('Key card patterns', () => {
    it('Charlotte Pudding OP08-067: Your Turn Once Per Turn on DON!! returned', () => {
      const card = op08EffectDefinitions.cards.find(
        (c) => c.cardId === 'OP08-067',
      );
      expect(card).toBeDefined();
      const stdEffect = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEffect).toBeDefined();
      if (stdEffect?.kind === 'standard') {
        expect(stdEffect.effect.trigger.type).toBe('onDonReturned');
        expect(stdEffect.effect.trigger.oncePerTurn).toBe(true);
        expect(stdEffect.effect.actions).toContainEqual(
          expect.objectContaining({ type: 'addDon', amount: 1, rested: true }),
        );
      }
    });

    it('Mont Blanc Noland OP08-109: conditional addToLife', () => {
      const card = op08EffectDefinitions.cards.find(
        (c) => c.cardId === 'OP08-109',
      );
      expect(card).toBeDefined();
      const stdEffect = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEffect).toBeDefined();
      if (stdEffect?.kind === 'standard') {
        expect(stdEffect.effect.conditions).toBeDefined();
        expect(stdEffect.effect.conditions!.length).toBe(2);
        expect(stdEffect.effect.actions[0]).toMatchObject({
          type: 'addToLife',
        });
      }
    });

    it('S-Hawk OP08-114: continuous +2000 and cannotBeKoedInBattle with trigger', () => {
      const card = op08EffectDefinitions.cards.find(
        (c) => c.cardId === 'OP08-114',
      );
      expect(card).toBeDefined();
      const contEffect = card!.effects?.find((e) => e.kind === 'continuous');
      expect(contEffect).toBeDefined();
      if (contEffect?.kind === 'continuous') {
        expect(contEffect.effect.modifier.keywords).toContain(
          'cannotBeKoedInBattle',
        );
        expect(contEffect.effect.modifier.power).toBe(2000);
        expect(contEffect.effect.conditions).toContainEqual(
          expect.objectContaining({
            type: 'playerHasLessLifeThan',
            player: 'self',
          }),
        );
      }
      const triggerEffect = card!.effects?.find((e) => e.kind === 'standard');
      expect(triggerEffect).toBeDefined();
    });

    it('Thatch OP08-045: replacement effect', () => {
      const card = op08EffectDefinitions.cards.find(
        (c) => c.cardId === 'OP08-045',
      );
      expect(card).toBeDefined();
      const replEffect = card!.effects?.find((e) => e.kind === 'replacement');
      expect(replEffect).toBeDefined();
      if (replEffect?.kind === 'replacement') {
        expect(replEffect.effect.event).toBe('wouldKoCharacter');
        expect(replEffect.effect.replacement).toHaveLength(2);
      }
    });

    it('Pedro OP08-030: On K.O. choose one branch', () => {
      const card = op08EffectDefinitions.cards.find(
        (c) => c.cardId === 'OP08-030',
      );
      expect(card).toBeDefined();
      const stdEffect = card!.effects?.find((e) => e.kind === 'standard');
      expect(stdEffect).toBeDefined();
      if (stdEffect?.kind === 'standard') {
        expect(stdEffect.effect.trigger.type).toBe('onKo');
        expect(stdEffect.effect.actions[0]).toMatchObject({
          type: 'chooseActionBranch',
        });
      }
    });

    it('Biscuit Warrior OP08-072: Blocker continuous', () => {
      const card = op08EffectDefinitions.cards.find(
        (c) => c.cardId === 'OP08-072',
      );
      expect(card).toBeDefined();
      const contEffect = card!.effects?.find((e) => e.kind === 'continuous');
      expect(contEffect).toBeDefined();
      if (contEffect?.kind === 'continuous') {
        expect(contEffect.effect.modifier.keywords).toContain(
          'mustBeAttackTarget',
        );
      }
    });

    it('Zou OP08-039: Stage with end-of-turn effect', () => {
      const card = op08EffectDefinitions.cards.find(
        (c) => c.cardId === 'OP08-039',
      );
      expect(card).toBeDefined();
      const turnEndEffect = card!.effects?.find(
        (e) =>
          e.kind === 'standard' &&
          'trigger' in e.effect &&
          e.effect.trigger.type === 'onTurnEnd',
      );
      expect(turnEndEffect).toBeDefined();
    });

    it('Special ref cards should reference valid handler IDs', () => {
      const specialRefCards = op08EffectDefinitions.cards.filter((c) =>
        c.effects?.some((e) => e.kind === 'special-ref'),
      );
      expect(specialRefCards.length).toBe(9);
    });
  });
});

describe('OP08 Behavioral Tests', () => {
  it('OP08-063: Charlotte Katakuri optional On Play turns top life face-down then adds 1 active DON!!', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    host.state.turn = 2;
    const engine = new EffectEngine(
      createRegistry([op08EffectDefinitions]),
      host,
    );
    const katakuri = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP08-063',
        number: 'OP08-063',
        name: 'Charlotte Katakuri',
        type: 'Character',
      }),
      'katakuri',
    );
    const lifeCard = host.addCardToZone(
      'p1',
      'life',
      makeCard({
        id: 'L1',
        number: 'L1',
        name: 'Life Card',
        type: 'Character',
      }),
      'life-card',
    );
    host.addCardToZone(
      'p1',
      'donDeck',
      makeCard({ id: 'DON-1', number: 'DON-1', name: 'DON!!', type: 'DON!!' }),
      'don-1',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: katakuri.instanceId,
      sourceCardId: katakuri.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('confirm');
    engine.answerDecision({ decisionId: decision?.id ?? '', confirmed: true });

    expect(lifeCard.faceDown).toBe(true);
    expect(host.getPlayer('p1')?.zones.cost).toHaveLength(1);
  });

  it("OP08-076: It's to Die For adds 1 DON!! from Main", () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    host.state.turn = 2;
    const engine = new EffectEngine(
      createRegistry([op08EffectDefinitions]),
      host,
    );
    const card = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP08-076',
        number: 'OP08-076',
        name: "It's to Die For",
        type: 'Event',
      }),
      'card',
    );
    host.addCardToZone(
      'p1',
      'donDeck',
      makeCard({ id: 'DON-1', number: 'DON-1', name: 'DON!!', type: 'DON!!' }),
      'don-1',
    );

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: card.instanceId,
      sourceCardId: card.cardId,
    });

    expect(host.getPlayer('p1')?.zones.cost).toHaveLength(1);
  });

  it("OP08-068: Charlotte Perospero adds 1 rested DON!! when K.O.'d", () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    host.state.turn = 2;
    const engine = new EffectEngine(
      createRegistry([op08EffectDefinitions]),
      host,
    );
    const perospero = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP08-068',
        number: 'OP08-068',
        name: 'Charlotte Perospero',
        type: 'Character',
      }),
      'perospero',
    );
    host.addCardToZone(
      'p1',
      'donDeck',
      makeCard({ id: 'DON-1', number: 'DON-1', name: 'DON!!', type: 'DON!!' }),
      'don-1',
    );

    engine.handleEvent({
      type: 'onKo',
      playerSessionId: 'p1',
      sourceInstanceId: perospero.instanceId,
      sourceCardId: perospero.cardId,
    });

    const costZone = host.getPlayer('p1')?.zones.cost;
    expect(costZone).toHaveLength(1);
    expect(costZone![0].rested).toBe(true);
  });

  it('OP08-072: Biscuit Warrior has Blocker keyword modifier', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    host.state.turn = 2;
    const engine = new EffectEngine(
      createRegistry([op08EffectDefinitions]),
      host,
    );
    const biscuit = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP08-072',
        number: 'OP08-072',
        name: 'Biscuit Warrior',
        type: 'Character',
      }),
      'biscuit',
    );

    engine.reapplyContinuousEffects();

    expect(biscuit.mustBeAttackTarget).toBe(true);
  });

  it('OP08-045: Thatch has replacement effect entry for wouldKoCharacter', () => {
    const card = op08EffectDefinitions.cards.find(
      (c) => c.cardId === 'OP08-045',
    );
    expect(card).toBeDefined();
    const replEffect = card!.effects?.find((e) => e.kind === 'replacement');
    expect(replEffect).toBeDefined();
    if (replEffect?.kind === 'replacement') {
      expect(replEffect.effect.event).toBe('wouldKoCharacter');
      expect(replEffect.effect.replacement).toHaveLength(2);
    }
  });

  it("OP08-030: Pedro's On K.O. chooseActionBranch lets player pick the DON!! rest branch", () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    host.state.turn = 2;
    const engine = new EffectEngine(
      createRegistry([op08EffectDefinitions]),
      host,
    );
    const pedro = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP08-030',
        number: 'OP08-030',
        name: 'Pedro',
        type: 'Character',
      }),
      'pedro',
    );
    host.addCardToZone(
      'p2',
      'cost',
      makeCard({ id: 'DON-1', number: 'DON-1', name: 'DON!!', type: 'DON!!' }),
      'don-1',
    );

    engine.handleEvent({
      type: 'onKo',
      playerSessionId: 'p1',
      sourceInstanceId: pedro.instanceId,
      sourceCardId: pedro.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectChoice');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedChoiceIds: ['op08-rest-don'],
    });

    const opponentCost = host.getPlayer('p2')?.zones.cost;
    expect(opponentCost).toHaveLength(1);
    expect(opponentCost![0].rested).toBe(true);
  });

  it('OP08-105: Jewelry Bonney draws 2 and trashes 1 from hand on life damage dealt', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    host.state.turn = 2;
    host.state.activePlayerSessionId = 'p1';
    const engine = new EffectEngine(
      createRegistry([op08EffectDefinitions]),
      host,
    );
    const bonney = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP08-105',
        number: 'OP08-105',
        name: 'Jewelry Bonney',
        type: 'Character',
      }),
      'bonney',
    );
    bonney.attachedDon = 1;
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'D1', number: 'D1', name: 'Draw 1', type: 'Character' }),
      'draw-1',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'D2', number: 'D2', name: 'Draw 2', type: 'Character' }),
      'draw-2',
    );
    const handCard = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'H1',
        number: 'H1',
        name: 'Hand Card',
        type: 'Character',
      }),
      'hand-card',
    );
    const attacker = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ATK',
        number: 'ATK',
        name: 'Attacker',
        type: 'Character',
      }),
      'attacker',
    );

    engine.handleEvent({
      type: 'onLifeDamageDealt',
      playerSessionId: 'p1',
      sourceInstanceId: attacker.instanceId,
      sourceCardId: attacker.cardId,
    });

    const trashDecision = engine.getPendingDecision();
    expect(trashDecision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: trashDecision?.id ?? '',
      selectedCardInstanceIds: [handCard.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(2);
    expect(host.getPlayer('p1')?.zones.trash).toContain(handCard);
  });

  it('OP08-053: Thank You for Loving Me draws 1 from Trigger', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    host.state.turn = 2;
    const engine = new EffectEngine(
      createRegistry([op08EffectDefinitions]),
      host,
    );
    const card = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP08-053',
        number: 'OP08-053',
        name: 'Thank You for Loving Me',
        type: 'Event',
      }),
      'card',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'D1',
        number: 'D1',
        name: 'Draw Card',
        type: 'Character',
      }),
      'draw-card',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: card.instanceId,
      sourceCardId: card.cardId,
    });

    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(1);
  });

  it('OP08-082: Sasaki pays two costs (rest DON!! and rest self) to modify opponent cost', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    host.state.turn = 2;
    const engine = new EffectEngine(
      createRegistry([op08EffectDefinitions]),
      host,
    );
    const sasaki = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP08-082',
        number: 'OP08-082',
        name: 'Sasaki',
        type: 'Character',
      }),
      'sasaki',
    );
    host.addCardToZone(
      'p1',
      'cost',
      makeCard({ id: 'DON-1', number: 'DON-1', name: 'DON!!', type: 'DON!!' }),
      'don-1',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'T1',
        number: 'T1',
        name: 'Target',
        type: 'Character',
        cost: 5,
      }),
      'target',
    );

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: sasaki.instanceId,
      sourceCardId: sasaki.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('confirm');
    engine.answerDecision({ decisionId: decision?.id ?? '', confirmed: true });

    const targetDecision = engine.getPendingDecision();
    expect(targetDecision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: targetDecision?.id ?? '',
      selectedCardInstanceIds: [target.instanceId],
    });

    const p1Cost = host.getPlayer('p1')?.zones.cost;
    expect(p1Cost).toHaveLength(1);
    expect(p1Cost![0].rested).toBe(true);
    expect(sasaki.rested).toBe(true);
    expect(target.cost).toBe(7);
  });

  it("OP08-066: Charlotte Brulee adds rested DON!! when K.O.'d", () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    host.state.turn = 2;
    const engine = new EffectEngine(
      createRegistry([op08EffectDefinitions]),
      host,
    );
    const brulee = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP08-066',
        number: 'OP08-066',
        name: 'Charlotte Brulee',
        type: 'Character',
      }),
      'brulee',
    );
    host.addCardToZone(
      'p1',
      'donDeck',
      makeCard({ id: 'DON-1', number: 'DON-1', name: 'DON!!', type: 'DON!!' }),
      'don-1',
    );

    engine.handleEvent({
      type: 'onKo',
      playerSessionId: 'p1',
      sourceInstanceId: brulee.instanceId,
      sourceCardId: brulee.cardId,
    });

    const costZone = host.getPlayer('p1')?.zones.cost;
    expect(costZone).toHaveLength(1);
    expect(costZone![0].rested).toBe(true);
  });

  it('OP08-047: Jozu optional On Play confirms the effect is optional', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    host.state.turn = 2;
    const engine = new EffectEngine(
      createRegistry([op08EffectDefinitions]),
      host,
    );
    const jozu = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP08-047',
        number: 'OP08-047',
        name: 'Jozu',
        type: 'Character',
      }),
      'jozu',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'T1',
        number: 'T1',
        name: 'Target',
        type: 'Character',
        cost: 4,
      }),
      'target',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: jozu.instanceId,
      sourceCardId: jozu.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('confirm');
    expect(decision?.effectCardId).toBe('OP08-047');
  });

  it('OP08-037: Garchu draws 1 from Trigger', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    host.state.turn = 2;
    const engine = new EffectEngine(
      createRegistry([op08EffectDefinitions]),
      host,
    );
    const garchu = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP08-037',
        number: 'OP08-037',
        name: 'Garchu',
        type: 'Event',
      }),
      'garchu',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'D1',
        number: 'D1',
        name: 'Draw Card',
        type: 'Character',
      }),
      'draw-card',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: garchu.instanceId,
      sourceCardId: garchu.cardId,
    });

    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(1);
  });

  it('OP08-063-2: Charlotte Katakuri declines optional On Play and nothing happens', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    host.state.turn = 2;
    const engine = new EffectEngine(
      createRegistry([op08EffectDefinitions]),
      host,
    );
    const katakuri = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP08-063',
        number: 'OP08-063',
        name: 'Charlotte Katakuri',
        type: 'Character',
      }),
      'katakuri',
    );
    const lifeCard = host.addCardToZone(
      'p1',
      'life',
      makeCard({
        id: 'L1',
        number: 'L1',
        name: 'Life Card',
        type: 'Character',
      }),
      'life-card',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: katakuri.instanceId,
      sourceCardId: katakuri.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('confirm');
    engine.answerDecision({ decisionId: decision?.id ?? '', confirmed: false });

    expect(lifeCard.faceDown).toBe(false);
    expect(host.getPlayer('p1')?.zones.cost).toHaveLength(0);
  });

  it('OP08-118: Silvers Rayleigh special handler selects up to 2 opponents, reduces power, and KOs a 3000-or-less', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    host.state.turn = 2;
    const engine = new EffectEngine(
      createRegistry([op08EffectDefinitions], [op08118SpecialHandler]),
      host,
    );
    const rayleigh = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP08-118',
        number: 'OP08-118',
        name: 'Silvers Rayleigh',
        type: 'Character',
      }),
      'rayleigh',
    );
    const target1 = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'T1',
        number: 'T1',
        name: 'Big Guy',
        type: 'Character',
        power: 5000,
      }),
      'target1',
    );
    const target2 = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'T2',
        number: 'T2',
        name: 'Weakling',
        type: 'Character',
        power: 3000,
      }),
      'target2',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: rayleigh.instanceId,
      sourceCardId: rayleigh.cardId,
    });

    let decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [target1.instanceId, target2.instanceId],
    });

    decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [target2.instanceId],
    });

    expect(target2.power).toBe(1000);
    expect(host.getPlayer('p2')?.zones.characters).toContain(target1);
    expect(host.getPlayer('p2')?.zones.characters).not.toContain(target2);
    expect(host.getPlayer('p2')?.zones.trash).toContain(target2);
  });

  it('OP08-014: Wapol modifies opponent character power and self power when attacking', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    host.state.turn = 2;
    const engine = new EffectEngine(
      createRegistry([op08EffectDefinitions]),
      host,
    );
    const wapol = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP08-014',
        number: 'OP08-014',
        name: 'Wapol',
        type: 'Character',
        power: 4000,
      }),
      'wapol',
    );
    wapol.attachedDon = 1;
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'T1',
        number: 'T1',
        name: 'Target',
        type: 'Character',
        power: 5000,
      }),
      'target',
    );

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: wapol.instanceId,
      sourceCardId: wapol.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(target.power).toBe(7000);
    expect(wapol.power).toBe(6000);
  });
});
