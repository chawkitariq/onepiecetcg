import { describe, expect, it } from 'vitest';
import type { CardEffectDefinition } from '@onepiecetcg/shared';
import type { EffectRegistry } from '../../../effect-engine/src/types/effect-registry.js';
import { EffectEngine } from '../../../effect-engine/src/effect-engine.js';
import { op16EffectDefinitions } from './OP-16.effects';
import { specialHandlerDefinitions } from '../index.js';
import {
  createRegistry as createFullRegistry,
  makeCard,
  TestHost,
} from '../test-utils.js';

const createRegistry = (): EffectRegistry => {
  const effectsByCardId: Record<string, CardEffectDefinition> = {};
  for (const card of op16EffectDefinitions.cards) {
    const resolved: CardEffectDefinition = { cardId: card.cardId };
    for (const entry of card.effects ?? []) {
      switch (entry.kind) {
        case 'standard':
          resolved.standard = [...(resolved.standard ?? []), entry.effect];
          break;
        case 'continuous':
          resolved.continuous = [...(resolved.continuous ?? []), entry.effect];
          break;
        case 'replacement':
          resolved.replacements = [
            ...(resolved.replacements ?? []),
            entry.effect,
          ];
          break;
        case 'special-ref':
          resolved.specialHandlerId = entry.specialHandlerId;
          break;
      }
    }
    effectsByCardId[resolved.cardId] = resolved;
  }
  return { effectsByCardId } as EffectRegistry;
};

describe('op16EffectDefinitions', () => {
  const registry = createRegistry();

  describe('OP16-006 shanks-on-play-rest-don-ko', () => {
    const card = registry.effectsByCardId['OP16-006'];
    it('defines onPlay with rest cost and ko action', () => {
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('onPlay');
      expect(effect.trigger.optional).toBe(true);
      expect(effect.costs?.some((c) => c.type === 'rest')).toBe(true);
      expect(effect.actions.some((a) => a.type === 'ko')).toBe(true);
    });
  });

  describe('OP16-014 marco-replacement-and-on-ko', () => {
    it('has a replacement and standard on-ko effect defined', () => {
      const card = registry.effectsByCardId['OP16-014'];
      expect(card).toBeDefined();
      expect(card.replacements?.length).toBe(1);
      expect(card.standard?.length).toBe(1);
    });
  });

  describe('OP16-033 morley-replacement-ko-with-rest', () => {
    it('has a wouldKoCharacter replacement effect defined', () => {
      const card = registry.effectsByCardId['OP16-033'];
      expect(card).toBeDefined();
      expect(card.replacements?.length).toBe(1);
      expect(card.replacements?.[0].event).toBe('wouldKoCharacter');
    });
  });

  describe('OP16-060 sengoku-leader-return-8-don-play-admirals', () => {
    it('defines an activate main effect with removeDon cost', () => {
      const card = registry.effectsByCardId['OP16-060'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('activateMain');
      expect(effect.costs?.length).toBe(1);
      expect(effect.costs![0].type).toBe('removeDon');
      expect(effect.actions.some((a) => a.type === 'play')).toBe(true);
    });
  });

  describe('OP16-063 kuzan-add-2-don-and-blocker-lock', () => {
    it('defines onPlay addDon and activateMain grantKeywords cannotBlock', () => {
      const card = registry.effectsByCardId['OP16-063'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(2);

      const onPlay = card.standard![0];
      expect(onPlay.trigger.type).toBe('onPlay');
      expect(onPlay.actions.some((a) => a.type === 'addDon')).toBe(true);

      const activate = card.standard![1];
      expect(activate.trigger.type).toBe('activateMain');
      expect(activate.costs?.some((c) => c.type === 'removeDon')).toBe(true);
    });
  });

  describe('OP16-080 teach-leader-continuous-cost-plus-1', () => {
    it('has a continuous effect for +1 cost on opponent turn', () => {
      const card = registry.effectsByCardId['OP16-080'];
      expect(card).toBeDefined();
      expect(card.continuous?.length).toBe(1);
      expect(card.continuous![0].modifier.cost).toBe(1);
    });
  });

  describe('OP16-089 mihawk-rush-draw-2-trash-2-modify-cost', () => {
    it('has onPlay with draw, trash and modifyCost actions', () => {
      const card = registry.effectsByCardId['OP16-089'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.actions.some((a) => a.type === 'draw')).toBe(true);
      expect(effect.actions.some((a) => a.type === 'trashFromHand')).toBe(true);
      expect(effect.actions.some((a) => a.type === 'modifyCost')).toBe(true);
    });
  });

  describe('OP16-102 avalo-pizarro-trigger-activate-on-ko', () => {
    it('defines a trigger that activates its on-ko effect', () => {
      const card = registry.effectsByCardId['OP16-102'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(2);

      const trigger = card.standard![1];
      expect(trigger.trigger.type).toBe('trigger');
      expect(trigger.actions.some((a) => a.type === 'activateEffect')).toBe(
        true,
      );
    });
  });

  describe('OP16-105 gecko-moria-trigger-play-multiple', () => {
    it('has a trigger effect that plays up to 3 characters from trash', () => {
      const card = registry.effectsByCardId['OP16-105'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('trigger');
      const playActions = effect.actions.filter((a) => a.type === 'play');
      expect(playActions.length).toBe(3);
    });
  });

  describe('OP16-106 sanjuan-wolf-trigger-activate-on-ko', () => {
    it('has trigger that re-activates on-ko effect', () => {
      const card = registry.effectsByCardId['OP16-106'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(2);

      const onKo = card.standard![0];
      expect(onKo.trigger.type).toBe('onKo');

      const trigger = card.standard![1];
      expect(trigger.trigger.type).toBe('trigger');
      expect(trigger.actions[0].type).toBe('activateEffect');
    });
  });

  describe('special-ref cards have entries', () => {
    const refs: Record<string, string> = {
      'OP16-032': 'op16-032-cannot-be-rested',
      'OP16-041': 'op16-041-impel-down-removed-play-prisoner',
      'OP16-079': 'op16-079-land-of-wano-from-trash-rush',
      'OP16-080': 'op16-080-attack-redirect',
      'OP16-084': 'op16-084-trash-self-cost-20-play-momo',
      'OP16-115': 'op16-115-negate-effect-trigger',
      'OP16-118': 'op16-118-counter-mod-and-search',
      'OP16-119': 'op16-119-negate-and-ko-trigger',
    };

    for (const [cardId, handlerId] of Object.entries(refs)) {
      it(`${cardId} references special handler ${handlerId}`, () => {
        const card = registry.effectsByCardId[cardId];
        expect(card).toBeDefined();
        expect(card.specialHandlerId).toBe(handlerId);
      });
    }
  });

  describe('cards with no effects have empty arrays', () => {
    const noEffectCards = [
      'OP16-004',
      'OP16-016',
      'OP16-023',
      'OP16-028',
      'OP16-042',
      'OP16-044',
      'OP16-046',
      'OP16-061',
      'OP16-062',
      'OP16-086',
      'OP16-088',
      'OP16-112',
    ];

    for (const cardId of noEffectCards) {
      it(`${cardId} has no effects`, () => {
        const card = registry.effectsByCardId[cardId];
        expect(card).toBeDefined();
        expect(card.standard).toBeUndefined();
        expect(card.continuous).toBeUndefined();
        expect(card.replacements).toBeUndefined();
        expect(card.specialHandlerId).toBeUndefined();
      });
    }
  });

  describe('OP16-087 shinobu-trash-self-modify-cost', () => {
    it('has onPlay with moveCard cost and modifyCost action', () => {
      const card = registry.effectsByCardId['OP16-087'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(1);
      const effect = card.standard![0];
      expect(effect.costs?.some((c) => c.type === 'moveCard')).toBe(true);
      expect(effect.actions.some((a) => a.type === 'modifyCost')).toBe(true);
      expect(effect.actions.some((a) => a.type === 'draw')).toBe(true);
    });
  });

  describe('OP16-098 yamato-trash-self-play-yamato', () => {
    it('has two standard effects: onPlay draw+trash and activateMain trash+play', () => {
      const card = registry.effectsByCardId['OP16-098'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(2);
      const drawEffect = card.standard![0];
      expect(drawEffect.trigger.type).toBe('onPlay');
      expect(drawEffect.actions.some((a) => a.type === 'draw')).toBe(true);
      const trashEffect = card.standard![1];
      expect(trashEffect.trigger.type).toBe('activateMain');
      expect(trashEffect.actions.some((a) => a.type === 'play')).toBe(true);
    });
  });

  describe('OP16-082 kinemon-plus-3-cost', () => {
    it('has a continuous +3 cost modifier', () => {
      const card = registry.effectsByCardId['OP16-082'];
      expect(card).toBeDefined();
      expect(card.continuous?.length).toBe(1);
      expect(card.continuous![0].modifier.cost).toBe(3);
    });
  });

  describe('OP16-038 restand-all-with-5-different-impel-down', () => {
    it('requires 5 distinct Impel Down characters and rests 6 DON', () => {
      const card = registry.effectsByCardId['OP16-038'];
      expect(card).toBeDefined();
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('activateMain');
      expect(effect.costs?.some((c) => c.type === 'rest')).toBe(true);
      expect(
        effect.conditions?.some((c) => c.type === 'targetCountAtLeast'),
      ).toBe(true);
      const restandAction = effect.actions.find((a) => a.type === 'restand');
      expect(restandAction).toBeDefined();
    });
  });

  describe('OP16-019 main-play-whitebeard-and-trigger-leader-buff', () => {
    it('has activateMain and trigger effects', () => {
      const card = registry.effectsByCardId['OP16-019'];
      expect(card).toBeDefined();
      expect(card.standard?.length).toBe(2);
      const main = card.standard![0];
      expect(main.trigger.type).toBe('activateMain');
      expect(main.actions.some((a) => a.type === 'play')).toBe(true);
      const trigger = card.standard![1];
      expect(trigger.trigger.type).toBe('trigger');
      expect(trigger.actions.some((a) => a.type === 'modifyPower')).toBe(true);
    });
  });

  describe('OP16-111 boa-sandersonia-trigger-play', () => {
    it('has trigger with life condition', () => {
      const card = registry.effectsByCardId['OP16-111'];
      expect(card).toBeDefined();
      const effect = card.standard![0];
      expect(effect.trigger.type).toBe('trigger');
      expect(
        effect.conditions?.some((c) => c.type === 'playerHasLifeAtMost'),
      ).toBe(true);
    });
  });

  describe('OP16-113 boa-marigold-continuous-blocker-trigger', () => {
    it('has continuous blocker gain and trigger play', () => {
      const card = registry.effectsByCardId['OP16-113'];
      expect(card).toBeDefined();
      expect(card.continuous?.length).toBe(1);
      expect(card.standard?.length).toBe(1);
      expect(
        card.continuous![0].conditions?.some(
          (c) => c.type === 'playerHasLifeAtMost',
        ),
      ).toBe(true);
      expect(card.standard![0].trigger.type).toBe('trigger');
    });
  });
});

describe('op16EffectDefinitions - behavioral tests', () => {
  function addDonToDonDeck(
    host: TestHost,
    playerId: string,
    count: number,
  ): void {
    for (let i = 0; i < count; i++) {
      host.addCardToZone(
        playerId,
        'donDeck',
        makeCard({
          id: `DON-${playerId}-${i}`,
          number: `DON-${playerId}-${i}`,
          name: 'DON!!',
          type: 'DON!!',
          cost: null,
          power: null,
          counter: null,
        }),
        `don-${playerId}-${i}`,
      );
    }
  }

  function addDonToCost(host: TestHost, playerId: string, count: number): void {
    for (let i = 0; i < count; i++) {
      host.addCardToZone(
        playerId,
        'cost',
        makeCard({
          id: `DON-COST-${playerId}-${i}`,
          number: `DON-COST-${playerId}-${i}`,
          name: 'DON!!',
          type: 'DON!!',
          cost: null,
          power: null,
          counter: null,
        }),
        `don-cost-${playerId}-${i}`,
      );
    }
  }

  function confirmOptional(engine: EffectEngine): void {
    const d = engine.getPendingDecision();
    if (d?.prompt.type === 'confirm') {
      engine.answerDecision({ decisionId: d.id, confirmed: true });
    }
  }

  function answerSelectCards(engine: EffectEngine, ids: string[]): void {
    const d = engine.getPendingDecision();
    expect(d?.prompt.type).toBe('selectCards');
    engine.answerDecision({ decisionId: d!.id, selectedCardInstanceIds: ids });
  }

  function answerSelectChoice(engine: EffectEngine, choiceId: string): void {
    const d = engine.getPendingDecision();
    expect(d?.prompt.type).toBe('selectChoice');
    engine.answerDecision({ decisionId: d!.id, selectedChoiceIds: [choiceId] });
  }

  function freshEngine(): { host: TestHost; engine: EffectEngine } {
    const h = new TestHost();
    h.addPlayer('p1');
    h.addPlayer('p2');
    const e = new EffectEngine(
      createFullRegistry([op16EffectDefinitions], specialHandlerDefinitions),
      h,
    );
    return { host: h, engine: e };
  }

  it('OP16-006 Shanks: rest 2 DON!! to KO opponent 4000-or-less character', () => {
    const { host, engine } = freshEngine();
    const shanks = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP16-006',
        number: 'OP16-006',
        name: 'Shanks',
        type: 'Character',
      }),
      's',
    );
    addDonToCost(host, 'p1', 2);
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'T1',
        number: 'T1',
        name: 'Target',
        type: 'Character',
        power: 3000,
      }),
      't',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: shanks.instanceId,
      sourceCardId: shanks.cardId,
    });
    confirmOptional(engine);
    answerSelectCards(engine, [target.instanceId]);

    expect(host.getPlayer('p2')!.zones.characters).not.toContain(target);
    expect(host.getPlayer('p2')!.zones.trash).toContain(target);
    expect(
      host.getPlayer('p1')!.zones.cost.filter((c) => !c.rested),
    ).toHaveLength(0);
  });

  it('OP16-008 Squard: trash own 10000-power char to KO opponent 8000-or-less', () => {
    const { host, engine } = freshEngine();
    const squard = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP16-008',
        number: 'OP16-008',
        name: 'Squard',
        type: 'Character',
      }),
      's',
    );
    host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'SAC',
        number: 'SAC',
        name: 'Sacrifice',
        type: 'Character',
        power: 10000,
      }),
      'sac',
    );
    const victim = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'VIC',
        number: 'VIC',
        name: 'Victim',
        type: 'Character',
        power: 7000,
      }),
      'v',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: squard.instanceId,
      sourceCardId: squard.cardId,
    });
    confirmOptional(engine);
    answerSelectCards(engine, [victim.instanceId]);

    expect(host.getPlayer('p1')!.zones.characters.length).toBe(1);
    expect(host.getPlayer('p1')!.zones.trash.length).toBe(1);
    expect(host.getPlayer('p2')!.zones.characters).not.toContain(victim);
    expect(host.getPlayer('p2')!.zones.trash).toContain(victim);
  });

  it('OP16-012 Benn Beckman: rest 1 DON, play Shanks from hand', () => {
    const { host, engine } = freshEngine();
    const beckman = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP16-012',
        number: 'OP16-012',
        name: 'Benn Beckman',
        type: 'Character',
      }),
      'b',
    );
    host.getPlayer('p1')!.zones.leader.families.push('Red-Haired Pirates');
    addDonToCost(host, 'p1', 10);
    const shanksCard = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'SHANKS',
        number: 'SHANKS',
        name: 'Shanks',
        type: 'Character',
      }),
      'sh',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: beckman.instanceId,
      sourceCardId: beckman.cardId,
    });
    confirmOptional(engine);
    answerSelectCards(engine, [shanksCard.instanceId]);

    expect(host.getPlayer('p1')!.zones.hand).not.toContain(shanksCard);
    expect(host.getPlayer('p1')!.zones.characters).toContain(shanksCard);
    expect(host.getPlayer('p1')!.zones.cost.every((d) => d.rested)).toBe(true);
  });

  it('OP16-033 Morley: replacement KO avoided by resting 2 characters/leader', () => {
    const { host, engine } = freshEngine();
    const morley = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP16-033',
        number: 'OP16-033',
        name: 'Morley',
        type: 'Character',
      }),
      'm',
    );

    const replaced = engine.applyReplacement({
      type: 'wouldKoCharacter',
      playerSessionId: 'p1',
      sourceInstanceId: morley.instanceId,
      reason: 'effect',
    });

    expect(replaced).toBe(true);
    expect(host.getPlayer('p1')!.zones.characters).toContain(morley);
  });

  it('OP16-035 Zoro: On Play rest opponent, choose branch trash & give DON!!', () => {
    const { host, engine } = freshEngine();
    const zoro = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP16-035',
        number: 'OP16-035',
        name: 'Roronoa Zoro',
        type: 'Character',
      }),
      'z',
    );
    const oppChar = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'O35',
        number: 'O35',
        name: 'Opp Char',
        type: 'Character',
      }),
      'o',
    );
    addDonToCost(host, 'p1', 3);
    for (const c of host.getPlayer('p1')!.zones.cost) c.rested = true;
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'TRASH',
        number: 'TRASH',
        name: 'Trash Me',
        type: 'Character',
      }),
      'tr',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: zoro.instanceId,
      sourceCardId: zoro.cardId,
    });
    answerSelectChoice(engine, 'trash-and-give-don');
    answerSelectCards(engine, [host.getPlayer('p1')!.zones.leader.instanceId]);

    expect(oppChar.rested).toBe(true);
    expect(host.getPlayer('p1')!.zones.hand).toHaveLength(0);
    expect(host.getPlayer('p1')!.zones.leader.attachedDon).toBe(3);
  });

  it('OP16-038: rest 6 DON to restand all with 5 distinct Impel Down characters', () => {
    const { host, engine } = freshEngine();
    host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP16-038',
        number: 'OP16-038',
        name: "Let's Go!!",
        type: 'Event',
      }),
      'e',
    );
    addDonToCost(host, 'p1', 6);
    for (let i = 0; i < 5; i++) {
      const c = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: `ID${i}`,
          number: `ID${i}`,
          name: `Imp${i}`,
          type: 'Character',
          families: ['Impel Down'],
        }),
        `id${i}`,
      );
      c.rested = true;
    }
    host.getPlayer('p1')!.zones.leader.rested = true;

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: 'p1:e',
      sourceCardId: 'OP16-038',
    });
    confirmOptional(engine);

    for (const c of host.getPlayer('p1')!.zones.characters)
      expect(c.rested).toBe(false);
    expect(host.getPlayer('p1')!.zones.leader.rested).toBe(false);
  });

  it('OP16-047 Doflamingo: rest self, opponent 8+ hand moves 2 to deck bottom', () => {
    const { host, engine } = freshEngine();
    const doffy = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP16-047',
        number: 'OP16-047',
        name: 'Donquixote Doflamingo',
        type: 'Character',
      }),
      'd',
    );
    const oppHand = Array.from({ length: 8 }, (_, i) =>
      host.addCardToZone(
        'p2',
        'hand',
        makeCard({
          id: `OH${i}`,
          number: `OH${i}`,
          name: `OH${i}`,
          type: 'Character',
        }),
        `oh${i}`,
      ),
    );

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: doffy.instanceId,
      sourceCardId: doffy.cardId,
    });
    confirmOptional(engine);
    answerSelectCards(engine, [oppHand[0].instanceId, oppHand[1].instanceId]);
    answerSelectChoice(engine, 'bottom');
    answerSelectChoice(engine, 'bottom');

    expect(doffy.rested).toBe(true);
    expect(host.getPlayer('p2')!.zones.hand).toHaveLength(6);
    expect(host.getPlayer('p2')!.zones.deck).toHaveLength(2);
  });

  it('OP16-060 Sengoku leader: remove 8 DON to play Admiral characters', () => {
    const { host, engine } = freshEngine();
    const leader = host.getPlayer('p1')!.zones.leader;
    leader.cardId = 'OP16-060';
    addDonToCost(host, 'p1', 8);
    const aA = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'ADM-A',
        number: 'ADM-A',
        name: 'Kuzan',
        type: 'Character',
        families: ['Admiral'],
      }),
      'a',
    );
    const aB = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'ADM-B',
        number: 'ADM-B',
        name: 'Borsalino',
        type: 'Character',
        families: ['Admiral'],
      }),
      'b',
    );

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: leader.instanceId,
      sourceCardId: leader.cardId,
    });
    confirmOptional(engine);
    answerSelectCards(engine, [aA.instanceId, aB.instanceId]);

    expect(host.getPlayer('p1')!.zones.hand).not.toContain(aA);
    expect(host.getPlayer('p1')!.zones.characters).toContain(aA);
    expect(host.getPlayer('p1')!.zones.characters).toContain(aB);
    expect(host.getPlayer('p1')!.zones.cost).toHaveLength(0);
  });

  it('OP16-063 Kuzan: on play add 2 DON!! rested', () => {
    const { host, engine } = freshEngine();
    host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP16-063',
        number: 'OP16-063',
        name: 'Kuzan',
        type: 'Character',
      }),
      'k',
    );
    addDonToDonDeck(host, 'p1', 5);
    const before = host.getPlayer('p1')!.zones.cost.length;

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: 'p1:k',
      sourceCardId: 'OP16-063',
    });

    expect(host.getPlayer('p1')!.zones.cost.length).toBe(before + 2);
    expect(host.getPlayer('p1')!.zones.cost.every((d) => d.rested)).toBe(true);
  });

  it('OP16-074 Magellan: on play opponent returns 1 DON!! (Impel Down leader)', () => {
    const { host, engine } = freshEngine();
    host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP16-074',
        number: 'OP16-074',
        name: 'Magellan',
        type: 'Character',
      }),
      'm',
    );
    host.getPlayer('p1')!.zones.leader.families.push('Impel Down');
    addDonToCost(host, 'p2', 3);

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: 'p1:m',
      sourceCardId: 'OP16-074',
    });

    expect(host.getPlayer('p2')!.zones.cost).toHaveLength(2);
    expect(host.getPlayer('p2')!.zones.donDeck).toHaveLength(1);
  });

  it('OP16-080 Teach: opponent turn continuous +1 cost for self characters', () => {
    const { host, engine } = freshEngine();
    const teach = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP16-080',
        number: 'OP16-080',
        name: 'Marshall.D.Teach',
        type: 'Character',
        cost: 7,
      }),
      't',
    );
    host.state.activePlayerSessionId = 'p2';
    host.state.turnPlayer = 'p2';
    engine.reapplyContinuousEffects();

    expect(teach.cost).toBe(8);
  });

  it('OP16-089 Mihawk: on play draw 2 trash 2 and modify opponent cost', () => {
    const { host, engine } = freshEngine();
    host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP16-089',
        number: 'OP16-089',
        name: 'Dracule Mihawk',
        type: 'Character',
      }),
      'm',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'DA', number: 'DA', name: 'Draw A', type: 'Character' }),
      'da',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'DB', number: 'DB', name: 'Draw B', type: 'Character' }),
      'db',
    );
    const hta = host.addCardToZone(
      'p1',
      'hand',
      makeCard({ id: 'HTA', number: 'HTA', name: 'Hand A', type: 'Character' }),
      'hta',
    );
    const htb = host.addCardToZone(
      'p1',
      'hand',
      makeCard({ id: 'HTB', number: 'HTB', name: 'Hand B', type: 'Character' }),
      'htb',
    );
    const opp = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'O89',
        number: 'O89',
        name: 'Opp Char',
        type: 'Character',
        cost: 5,
      }),
      'o',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: 'p1:m',
      sourceCardId: 'OP16-089',
    });
    answerSelectCards(engine, [hta.instanceId, htb.instanceId]);
    answerSelectCards(engine, [opp.instanceId]);

    expect(host.getPlayer('p1')!.zones.trash).toContain(hta);
    expect(host.getPlayer('p1')!.zones.trash).toContain(htb);
    expect(opp.cost).toBe(9);
  });

  it('OP16-032 special: Boa Hancock marks opponent char cannotBeRested on play', () => {
    const { host, engine } = freshEngine();
    const boa = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP16-032',
        number: 'OP16-032',
        name: 'Boa Hancock',
        type: 'Character',
      }),
      'b',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'O32',
        number: 'O32',
        name: 'Opponent Char',
        type: 'Character',
      }),
      't',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: boa.instanceId,
      sourceCardId: boa.cardId,
    });
    answerSelectCards(engine, [target.instanceId]);

    expect((target as any).cannotBeRested).toBe(true);
  });

  it('OP16-119 special: trigger negates effect then KOs cost 5 or less', () => {
    const { host, engine } = freshEngine();
    host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP16-119',
        number: 'OP16-119',
        name: 'Marshall.D.Teach',
        type: 'Character',
      }),
      't',
    );
    const neg = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'NEG',
        number: 'NEG',
        name: 'Negate Target',
        type: 'Character',
        cost: 4,
      }),
      'n',
    );
    const ko = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'KO',
        number: 'KO',
        name: 'KO Target',
        type: 'Character',
        cost: 5,
      }),
      'k',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: 'p1:t',
      sourceCardId: 'OP16-119',
    });
    answerSelectCards(engine, [neg.instanceId]);
    expect((neg as any).effectNegated).toBe(true);

    answerSelectCards(engine, [ko.instanceId]);
    expect(host.getPlayer('p2')!.zones.characters).not.toContain(ko);
    expect(host.getPlayer('p2')!.zones.trash).toContain(ko);
  });

  it('OP16-015 Luffy hand cost reduction: Ace leader + 6+ DON gives -2 cost', () => {
    const { host, engine } = freshEngine();
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OP16-015',
        number: 'OP16-015',
        name: 'Monkey.D.Luffy',
        type: 'Character',
        cost: 7,
      }),
      'l',
    );
    host.getPlayer('p1')!.zones.leader.name = 'Ace';
    addDonToCost(host, 'p1', 6);
    const luffy = host.getPlayer('p1')!.zones.hand[0];

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: luffy.instanceId,
      sourceCardId: luffy.cardId,
    });

    expect(engine.getNextPlayCostModifier(luffy)).toBe(-2);
  });

  it('OP16-009 Speed Jil: trash 8000-power from hand to gain Rush and +2000 power', () => {
    const { host, engine } = freshEngine();
    const sj = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP16-009',
        number: 'OP16-009',
        name: 'Speed Jil',
        type: 'Character',
        power: 5000,
      }),
      's',
    );
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'T9',
        number: 'T9',
        name: 'Trash Card',
        type: 'Character',
        power: 8000,
      }),
      't',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: sj.instanceId,
      sourceCardId: sj.cardId,
    });
    confirmOptional(engine);

    expect(host.getPlayer('p1')!.zones.hand).toHaveLength(0);
    expect(host.getPlayer('p1')!.zones.trash).toHaveLength(1);
    expect(sj.hasRush).toBe(true);
    expect(sj.power).toBe(7000);
  });
});
