import { describe, expect, it } from '@jest/globals';
import {
  DuelCard,
  DuelPlayer,
  DuelState,
  createDuelCard,
  type Card,
  type CardEffectDefinition,
} from '@onepiecetcg/shared';
import { EffectEngine, type EffectEngineHost } from '../../effect-engine';
import { buildEffectIndexes } from '../../effect-indexes';
import type {
  EffectRegistry,
  SpecialHandlerDefinition,
} from '../../types/effect-registry';
import { op03EffectDefinitions } from './OP-03.effects';

const makeCard = (
  overrides: Partial<Card> & Pick<Card, 'id' | 'number' | 'name' | 'type'>,
): Card => ({
  id: overrides.id,
  number: overrides.number,
  name: overrides.name,
  type: overrides.type,
  colors: overrides.colors ?? ['Red'],
  cost: overrides.cost ?? 1,
  power: overrides.power ?? 1000,
  life: overrides.life ?? null,
  counter: overrides.counter ?? 1000,
  attributes: overrides.attributes ?? [],
  families: overrides.families ?? [],
  text: overrides.text ?? '',
  trigger: overrides.trigger ?? null,
  imageUrl: overrides.imageUrl ?? null,
  set: overrides.set ?? { id: 'test', name: 'Test' },
  rarity: overrides.rarity ?? null,
});

const createRegistry = (
  definitions = [op03EffectDefinitions],
  specialHandlers: readonly SpecialHandlerDefinition[] = [],
): EffectRegistry => {
  const effectsByCardId: Record<string, CardEffectDefinition> = {};
  const specialHandlersByCardId: Record<string, SpecialHandlerDefinition> = {};

  for (const definition of definitions) {
    for (const card of definition.cards) {
      const resolved: CardEffectDefinition = { cardId: card.cardId };

      for (const entry of card.effects ?? []) {
        switch (entry.kind) {
          case 'standard':
            resolved.standard = [...(resolved.standard ?? []), entry.effect];
            break;
          case 'continuous':
            resolved.continuous = [
              ...(resolved.continuous ?? []),
              entry.effect,
            ];
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
  }

  for (const handler of specialHandlers) {
    specialHandlersByCardId[handler.cardId] = handler;
  }

  const indexes = buildEffectIndexes(effectsByCardId, specialHandlersByCardId);

  return {
    effectsByCardId,
    specialHandlersByCardId,
    triggeredEffectsByTrigger: indexes.triggeredEffectsByTrigger,
    replacementEffectsByEventType: indexes.replacementEffectsByEventType,
  };
};

class TestHost implements EffectEngineHost {
  public readonly state = new DuelState();

  public readonly logs: string[] = [];

  public constructor() {
    this.state.activePlayerSessionId = 'p1';
  }

  public addPlayer(sessionId: string, leader?: Partial<Card>): DuelPlayer {
    const player = new DuelPlayer();
    player.sessionId = sessionId;
    player.displayName = sessionId;
    player.zones.leader = createDuelCard(
      makeCard({
        id: leader?.id ?? `L-${sessionId}`,
        number: leader?.number ?? `L-${sessionId}`,
        name: leader?.name ?? `${sessionId} Leader`,
        type: 'Leader',
        colors: leader?.colors ?? ['Red'],
        power: leader?.power ?? 5000,
        life: leader?.life ?? 5,
        attributes: leader?.attributes ?? [],
        families: leader?.families ?? [],
      }),
      `${sessionId}:leader`,
      sessionId,
    );
    this.state.players.set(sessionId, player);
    return player;
  }

  public addLog(message: string): void {
    this.logs.push(message);
  }

  public shuffleDeck(playerSessionId: string): void {
    const player = this.getPlayer(playerSessionId);
    player?.zones.deck.reverse();
  }

  public getPlayer(sessionId: string): DuelPlayer | undefined {
    return this.state.players.get(sessionId);
  }

  public getOpponentSessionId(sessionId: string): string | null {
    return (
      Array.from(this.state.players.keys()).find((id) => id !== sessionId) ??
      null
    );
  }

  public getCard(instanceId: string): DuelCard | null {
    for (const player of this.state.players.values()) {
      if (player.zones.leader.instanceId === instanceId) {
        return player.zones.leader;
      }

      if (player.zones.stage.instanceId === instanceId) {
        return player.zones.stage;
      }

      for (const zone of [
        'deck',
        'donDeck',
        'hand',
        'life',
        'characters',
        'cost',
        'trash',
      ] as const) {
        const found = player.zones[zone].find(
          (card) => card.instanceId === instanceId,
        );

        if (found) {
          return found;
        }
      }
    }

    return null;
  }

  public getCards(selector: any, controllerSessionId: string): DuelCard[] {
    const sessionIds =
      selector.player === 'self'
        ? [controllerSessionId]
        : selector.player === 'opponent'
          ? [this.getOpponentSessionId(controllerSessionId)].filter(Boolean)
          : Array.from(this.state.players.keys());

    const matches: DuelCard[] = [];

    for (const sessionId of sessionIds) {
      const player = sessionId ? this.state.players.get(sessionId) : undefined;

      if (!player) {
        continue;
      }

      for (const zone of selector.zones) {
        const cards =
          zone === 'leader'
            ? [player.zones.leader]
            : zone === 'stage'
              ? player.zones.stage.instanceId
                ? [player.zones.stage]
                : []
              : Array.from(player.zones[zone] ?? []);

        for (const card of cards) {
          if (
            selector.filter?.cardCategory &&
            !selector.filter.cardCategory.includes(card.type)
          ) {
            continue;
          }

          if (
            selector.filter?.costMax != null &&
            card.cost > selector.filter.costMax
          ) {
            continue;
          }

          if (
            selector.filter?.costMin != null &&
            card.cost < selector.filter.costMin
          ) {
            continue;
          }

          if (
            selector.filter?.powerMax != null &&
            card.power > selector.filter.powerMax
          ) {
            continue;
          }

          if (
            selector.filter?.color &&
            !selector.filter.color.some((color: string) =>
              card.colors.includes(color),
            )
          ) {
            continue;
          }

          if (
            selector.filter?.trait &&
            !selector.filter.trait.some((trait: string) =>
              card.families.includes(trait),
            )
          ) {
            continue;
          }

          if (
            selector.filter?.name &&
            !selector.filter.name.includes(card.name)
          ) {
            continue;
          }

          if (
            selector.filter?.hasTrigger != null &&
            (card.trigger ? true : false) !== selector.filter.hasTrigger
          ) {
            continue;
          }

          if (
            selector.filter?.excludeName &&
            selector.filter.excludeName.includes(card.name)
          ) {
            continue;
          }

          if (selector.filter?.zonePosition) {
            const zoneCards =
              zone === 'leader'
                ? [player.zones.leader]
                : zone === 'stage'
                  ? player.zones.stage.instanceId
                    ? [player.zones.stage]
                    : []
                  : Array.from(player.zones[zone] ?? []);
            const firstCard = zoneCards[0];
            const lastCard = zoneCards[zoneCards.length - 1];
            const isTop = firstCard?.instanceId === card.instanceId;
            const isBottom = lastCard?.instanceId === card.instanceId;

            if (selector.filter.zonePosition === 'top' && !isTop) {
              continue;
            }

            if (selector.filter.zonePosition === 'bottom' && !isBottom) {
              continue;
            }

            if (
              selector.filter.zonePosition === 'topOrBottom' &&
              !isTop &&
              !isBottom
            ) {
              continue;
            }
          }

          if (
            selector.filter?.rested != null &&
            card.rested !== selector.filter.rested
          ) {
            continue;
          }

          matches.push(card);
        }
      }
    }

    return matches;
  }

  public moveCard(
    card: DuelCard,
    destinationPlayerSessionId: string,
    destinationZone: string,
    options?: { faceDown?: boolean; rested?: boolean; toBottom?: boolean },
  ): void {
    this.removeCard(card.instanceId);
    const player = this.getPlayer(destinationPlayerSessionId);

    if (!player) {
      return;
    }

    card.ownerSessionId = destinationPlayerSessionId;
    card.faceDown = options?.faceDown ?? false;
    card.rested = options?.rested ?? false;

    if (destinationZone === 'trash') {
      player.zones.trash.unshift(card);
    } else if (destinationZone === 'hand') {
      player.zones.hand.push(card);
    } else if (destinationZone === 'life' && options?.toBottom) {
      player.zones.life.push(card);
    } else if (destinationZone === 'life') {
      player.zones.life.unshift(card);
    } else if (destinationZone === 'deck') {
      player.zones.deck.push(card);
    } else if (destinationZone === 'donDeck') {
      player.zones.donDeck.push(card);
    } else if (destinationZone === 'cost') {
      player.zones.cost.push(card);
    } else if (destinationZone === 'characters') {
      player.zones.characters.push(card);
    } else if (destinationZone === 'stage') {
      player.zones.stage = card;
    }
  }

  public drawCard(playerSessionId: string): DuelCard | null {
    const player = this.getPlayer(playerSessionId);
    const card = player?.zones.deck.shift();

    if (!player || !card) {
      return null;
    }

    player.zones.hand.push(card);
    return card;
  }

  public trashTopDeckCards(
    playerSessionId: string,
    amount: number,
  ): DuelCard[] {
    const player = this.getPlayer(playerSessionId);
    const moved: DuelCard[] = [];

    if (!player) {
      return moved;
    }

    for (let index = 0; index < amount; index += 1) {
      const card = player.zones.deck.shift();

      if (!card) {
        break;
      }

      player.zones.trash.unshift(card);
      moved.push(card);
    }

    return moved;
  }

  public addDonToCost(
    playerSessionId: string,
    amount: number,
    rested: boolean,
  ): number {
    const player = this.getPlayer(playerSessionId);

    if (!player) {
      return 0;
    }

    let moved = 0;

    for (let index = 0; index < amount; index += 1) {
      const don = player.zones.donDeck.shift();

      if (!don) {
        break;
      }

      don.rested = rested;
      player.zones.cost.push(don);
      moved += 1;
    }

    return moved;
  }

  public attachDon(): number {
    return 0;
  }

  public returnDonToDonDeck(playerSessionId: string, amount: number): number {
    const player = this.getPlayer(playerSessionId);

    if (!player) {
      return 0;
    }

    let moved = 0;

    while (player.zones.cost.length > 0 && moved < amount) {
      const don = player.zones.cost.pop();

      if (!don) {
        break;
      }

      player.zones.donDeck.push(don);
      moved += 1;
    }

    return moved;
  }

  public koCharacter(
    playerSessionId: string,
    instanceId: string,
    _reason: 'battle' | 'effect',
  ): boolean {
    const player = this.getPlayer(playerSessionId);
    const index =
      player?.zones.characters.findIndex(
        (card) => card.instanceId === instanceId,
      ) ?? -1;

    if (!player || index < 0) {
      return false;
    }

    const [card] = player.zones.characters.splice(index, 1);

    if (!card) {
      return false;
    }

    player.zones.trash.unshift(card);
    return true;
  }

  public syncPlayer(): void {}

  public addCardToZone(
    playerSessionId: string,
    zone:
      'hand' | 'deck' | 'donDeck' | 'characters' | 'trash' | 'cost' | 'life',
    card: Card,
    instanceSuffix: string,
  ): DuelCard {
    const duelCard = createDuelCard(
      card,
      `${playerSessionId}:${instanceSuffix}`,
      playerSessionId,
    );
    this.getPlayer(playerSessionId)?.zones[zone].push(duelCard);
    return duelCard;
  }

  private removeCard(instanceId: string): void {
    for (const player of this.state.players.values()) {
      if (player.zones.stage.instanceId === instanceId) {
        player.zones.stage = new DuelCard();
        return;
      }

      for (const zone of [
        'deck',
        'donDeck',
        'hand',
        'life',
        'characters',
        'cost',
        'trash',
      ] as const) {
        const index = player.zones[zone].findIndex(
          (card) => card.instanceId === instanceId,
        );

        if (index >= 0) {
          player.zones[zone].splice(index, 1);
          return;
        }
      }
    }
  }
}

describe('op03EffectDefinitions', () => {
  it('draws 2, trashes 2, then reduces an opposing character cost by 2 for Kalifa on play', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const kalifa = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP03-081',
        number: 'OP03-081',
        name: 'Kalifa',
        type: 'Character',
      }),
      'kalifa',
    );
    const deckA = host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'D1', number: 'D1', name: 'Deck A', type: 'Character' }),
      'deck-a',
    );
    const deckB = host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'D2', number: 'D2', name: 'Deck B', type: 'Character' }),
      'deck-b',
    );
    const handA = host.addCardToZone(
      'p1',
      'hand',
      makeCard({ id: 'H1', number: 'H1', name: 'Hand A', type: 'Character' }),
      'hand-a',
    );
    const handB = host.addCardToZone(
      'p1',
      'hand',
      makeCard({ id: 'H2', number: 'H2', name: 'Hand B', type: 'Character' }),
      'hand-b',
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
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: kalifa.instanceId,
      sourceCardId: kalifa.cardId,
    });

    let decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [deckA.instanceId, deckB.instanceId],
    });

    decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.hand).toContain(handA);
    expect(host.getPlayer('p1')?.zones.hand).toContain(handB);
    expect(host.getPlayer('p1')?.zones.trash).toContain(deckA);
    expect(host.getPlayer('p1')?.zones.trash).toContain(deckB);
    expect(target.cost).toBe(3);
  });

  it('trashes the top life card as cost and KOs an opposing character for Thunder Bolt', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const thunderBolt = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP03-121',
        number: 'OP03-121',
        name: 'Thunder Bolt',
        type: 'Event',
      }),
      'thunder-bolt',
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
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'T2',
        number: 'T2',
        name: 'Target',
        type: 'Character',
        cost: 5,
      }),
      'target',
    );

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: thunderBolt.instanceId,
      sourceCardId: thunderBolt.cardId,
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

    expect(host.getPlayer('p1')?.zones.life).not.toContain(lifeCard);
    expect(host.getPlayer('p1')?.zones.trash).toContain(lifeCard);
    expect(host.getPlayer('p2')?.zones.characters).not.toContain(target);
    expect(host.getPlayer('p2')?.zones.trash).toContain(target);
  });

  it("activates Sanji's Pilaf main effect from trigger and draws 2 cards", () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const pilaf = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP03-056',
        number: 'OP03-056',
        name: "Sanji's Pilaf",
        type: 'Event',
      }),
      'pilaf',
    );
    const drawA = host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'DA', number: 'DA', name: 'Draw A', type: 'Character' }),
      'draw-a',
    );
    const drawB = host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'DB', number: 'DB', name: 'Draw B', type: 'Character' }),
      'draw-b',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: pilaf.instanceId,
      sourceCardId: pilaf.cardId,
    });

    expect(host.getPlayer('p1')?.zones.hand).toContain(drawA);
    expect(host.getPlayer('p1')?.zones.hand).toContain(drawB);
    expect(host.getPlayer('p1')?.zones.deck).toHaveLength(0);
  });

  it('trashes 3 cards from your deck and then trashes Gaimon when you deal life damage', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const gaimon = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP03-043',
        number: 'OP03-043',
        name: 'Gaimon',
        type: 'Character',
      }),
      'gaimon',
    );
    const attacker = host.addCardToZone(
      'p1',
      'characters',
      makeCard({ id: 'A1', number: 'A1', name: 'Attacker', type: 'Character' }),
      'attacker',
    );
    const deckA = host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'DGA', number: 'DGA', name: 'Deck A', type: 'Character' }),
      'deck-a',
    );
    const deckB = host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'DGB', number: 'DGB', name: 'Deck B', type: 'Character' }),
      'deck-b',
    );
    const deckC = host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'DGC', number: 'DGC', name: 'Deck C', type: 'Character' }),
      'deck-c',
    );

    engine.handleEvent({
      type: 'onLifeDamageDealt',
      playerSessionId: 'p1',
      sourceInstanceId: attacker.instanceId,
      sourceCardId: attacker.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('confirm');
    engine.answerDecision({ decisionId: decision?.id ?? '', confirmed: true });

    expect(host.getPlayer('p1')?.zones.trash).toContain(deckA);
    expect(host.getPlayer('p1')?.zones.trash).toContain(deckB);
    expect(host.getPlayer('p1')?.zones.trash).toContain(deckC);
    expect(host.getPlayer('p1')?.zones.characters).not.toContain(gaimon);
    expect(host.getPlayer('p1')?.zones.trash).toContain(gaimon);
  });

  it('plays a Character with Trigger from hand for Tooth Attack trigger', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const toothAttack = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP03-037',
        number: 'OP03-037',
        name: 'Tooth Attack',
        type: 'Event',
      }),
      'tooth-attack',
    );
    const triggerCharacter = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'TC1',
        number: 'TC1',
        name: 'Trigger Character',
        type: 'Character',
        cost: 4,
        trigger: 'Play this card.',
      }),
      'trigger-character',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: toothAttack.instanceId,
      sourceCardId: toothAttack.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [triggerCharacter.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.hand).not.toContain(triggerCharacter);
    expect(host.getPlayer('p1')?.zones.characters).toContain(triggerCharacter);
  });

  it('gives Curiel Rush while attached DON!! is present', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const curiel = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP03-004',
        number: 'OP03-004',
        name: 'Curiel',
        type: 'Character',
      }),
      'curiel',
    );

    curiel.attachedDon = 1;
    engine.reapplyContinuousEffects();

    expect(curiel.hasRush).toBe(true);
    expect(curiel.cannotAttackLeaderOnTurnPlayed).toBe(true);
  });

  it('prevents K.O. by effect for Fukurou via replacement', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const fukurou = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP03-088',
        number: 'OP03-088',
        name: 'Fukurou',
        type: 'Character',
      }),
      'fukurou',
    );

    const replaced = engine.applyReplacement({
      type: 'wouldKoCharacter',
      playerSessionId: 'p1',
      sourceInstanceId: fukurou.instanceId,
      reason: 'effect',
    });

    expect(replaced).toBe(true);
    expect(host.getPlayer('p1')?.zones.characters).toContain(fukurou);
  });

  it('lets Iceburg pay DON!! -1 and rest itself to play a Galley-La Company character', () => {
    const host = new TestHost();
    host.addPlayer('p1', {
      id: 'OP03-058',
      number: 'OP03-058',
      name: 'Iceburg',
      type: 'Leader',
      colors: ['Blue'],
      power: 5000,
      life: 5,
    });
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const iceburg = host.getPlayer('p1')!.zones.leader;

    host.addCardToZone(
      'p1',
      'cost',
      makeCard({
        id: 'DON-1',
        number: 'DON-1',
        name: 'DON!! 1',
        type: 'DON!!',
        cost: null,
        power: null,
        counter: null,
      }),
      'don-1',
    );
    const galleyLa = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'GL1',
        number: 'GL1',
        name: 'Galley-La Worker',
        type: 'Character',
        cost: 5,
        families: ['Galley-La Company'],
      }),
      'galley-la',
    );

    engine.reapplyContinuousEffects();
    expect(iceburg.cannotAttack).toBe(true);

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: iceburg.instanceId,
      sourceCardId: iceburg.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [galleyLa.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.cost).toHaveLength(0);
    expect(iceburg.rested).toBe(true);
    expect(host.getPlayer('p1')?.zones.characters).toContain(galleyLa);
  });

  it('lets Jango choose the branch that rests itself and an opposing character', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const jango = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP03-028',
        number: 'OP03-028',
        name: 'Jango',
        type: 'Character',
      }),
      'jango',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({ id: 'JT1', number: 'JT1', name: 'Target', type: 'Character' }),
      'target',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: jango.instanceId,
      sourceCardId: jango.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectChoice');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedChoiceIds: ['rest-self-and-opponent'],
    });

    expect(jango.rested).toBe(true);
    expect(target.rested).toBe(true);
  });

  it('places a character into the owner life area at the chosen position for Katakuri 123', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const katakuri = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP03-123',
        number: 'OP03-123',
        name: 'Charlotte Katakuri',
        type: 'Character',
      }),
      'katakuri',
    );
    const lifeExisting = host.addCardToZone(
      'p2',
      'life',
      makeCard({
        id: 'L-EXIST',
        number: 'L-EXIST',
        name: 'Existing Life',
        type: 'Character',
      }),
      'life-existing',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'KC1',
        number: 'KC1',
        name: 'Target Character',
        type: 'Character',
        cost: 8,
      }),
      'target-character',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: katakuri.instanceId,
      sourceCardId: katakuri.cardId,
    });

    let decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [target.instanceId],
    });

    decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectChoice');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedChoiceIds: ['bottom'],
    });

    expect(host.getPlayer('p2')?.zones.characters).not.toContain(target);
    expect(host.getPlayer('p2')?.zones.life.at(-1)).toBe(target);
    expect(host.getPlayer('p2')?.zones.life[0]).toBe(lifeExisting);
    expect(target.faceDown).toBe(false);
  });

  it('lets Kingbaum trash the bottom life card and play itself from trigger', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const kingbaum = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP03-100',
        number: 'OP03-100',
        name: 'Kingbaum',
        type: 'Character',
      }),
      'kingbaum',
    );
    const topLife = host.addCardToZone(
      'p1',
      'life',
      makeCard({
        id: 'KL1',
        number: 'KL1',
        name: 'Top Life',
        type: 'Character',
      }),
      'top-life',
    );
    const bottomLife = host.addCardToZone(
      'p1',
      'life',
      makeCard({
        id: 'KL2',
        number: 'KL2',
        name: 'Bottom Life',
        type: 'Character',
      }),
      'bottom-life',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: kingbaum.instanceId,
      sourceCardId: kingbaum.cardId,
    });

    let decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('confirm');
    engine.answerDecision({ decisionId: decision?.id ?? '', confirmed: true });

    decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [bottomLife.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.trash).toContain(bottomLife);
    expect(host.getPlayer('p1')?.zones.characters).toContain(kingbaum);
    expect(host.getPlayer('p1')?.zones.life).toContain(topLife);
  });

  it('lets Ace trash multiple Event or Stage cards from hand and gain power when attacking', () => {
    const host = new TestHost();
    host.addPlayer('p1', {
      id: 'OP03-001',
      number: 'OP03-001',
      name: 'Portgas.D.Ace',
      type: 'Leader',
      power: 5000,
      life: 5,
    });
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const aceLeader = host.getPlayer('p1')!.zones.leader;
    const eventCard = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'AE1',
        number: 'AE1',
        name: 'Event Card',
        type: 'Event',
        cost: 1,
        power: null,
        counter: null,
      }),
      'event-card',
    );
    const stageCard = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'AS1',
        number: 'AS1',
        name: 'Stage Card',
        type: 'Stage',
        cost: 1,
        power: null,
        counter: null,
      }),
      'stage-card',
    );

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: aceLeader.instanceId,
      sourceCardId: aceLeader.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [eventCard.instanceId, stageCard.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.trash).toContain(eventCard);
    expect(host.getPlayer('p1')?.zones.trash).toContain(stageCard);
    expect(aceLeader.power).toBe(7000);
  });
});
