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
import { op04EffectDefinitions } from './OP-04.effects';
import { specialHandlerDefinitions } from '..';

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
  definitions = [op04EffectDefinitions],
  specialHandlers: readonly SpecialHandlerDefinition[] = specialHandlerDefinitions,
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
            selector.filter?.excludeName &&
            selector.filter.excludeName.includes(card.name)
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

describe('op04EffectDefinitions', () => {
  it('lets Gyats grant can-attack-active-characters to a Dressrosa character this turn', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const gyats = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP04-080',
        number: 'OP04-080',
        name: 'Gyats',
        type: 'Character',
      }),
      'gyats',
    );
    const target = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'DR-1',
        number: 'DR-1',
        name: 'Dressrosa Fighter',
        type: 'Character',
        families: ['Dressrosa'],
      }),
      'dressrosa-target',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: gyats.instanceId,
      sourceCardId: gyats.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(target.canAttackActiveCharacters).toBe(true);
  });

  it('lets Kouzuki Hiyori trigger play itself from trash', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const hiyori = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP04-103',
        number: 'OP04-103',
        name: 'Kouzuki Hiyori',
        type: 'Character',
        families: ['Land of Wano'],
      }),
      'hiyori',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: hiyori.instanceId,
      sourceCardId: hiyori.cardId,
    });

    expect(host.getPlayer('p1')?.zones.characters).toContain(hiyori);
    expect(host.getPlayer('p1')?.zones.trash).not.toContain(hiyori);
  });

  it('lets Queen draw 1 when attacking with DON!! x1 and 4 or fewer total life and hand cards', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const queen = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP04-040',
        number: 'OP04-040',
        name: 'Queen',
        type: 'Character',
      }),
      'queen',
    );
    queen.attachedDon = 1;
    host.getPlayer('p1')!.zones.life = [];
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({ id: 'H1', number: 'H1', name: 'Hand 1', type: 'Event' }),
      'hand-1',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'D1', number: 'D1', name: 'Draw 1', type: 'Character' }),
      'draw-1',
    );

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: queen.instanceId,
      sourceCardId: queen.cardId,
    });

    expect(engine.getPendingDecision()).toBeNull();
    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(2);
    expect(host.getPlayer('p1')?.zones.hand.at(-1)?.name).toBe('Draw 1');
  });

  it('lets Queen choose to add the top deck card to life instead of drawing when you control a cost-8 character', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const queen = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP04-040',
        number: 'OP04-040',
        name: 'Queen',
        type: 'Character',
      }),
      'queen',
    );
    queen.attachedDon = 1;
    host.getPlayer('p1')!.zones.life = [];
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({ id: 'H1', number: 'H1', name: 'Hand 1', type: 'Event' }),
      'hand-1',
    );
    host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'BIG',
        number: 'BIG',
        name: 'Big Character',
        type: 'Character',
        cost: 8,
      }),
      'big-character',
    );
    const deckTop = host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'LIFE',
        number: 'LIFE',
        name: 'Life Top',
        type: 'Character',
      }),
      'life-top',
    );

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: queen.instanceId,
      sourceCardId: queen.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectChoice');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedChoiceIds: ['add-top-deck-to-life'],
    });

    expect(host.getPlayer('p1')?.zones.life[0]).toBe(deckTop);
    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(1);
    expect(host.getPlayer('p1')?.zones.deck).toHaveLength(0);
  });

  it('keeps Nefeltari Vivi from attacking and lets its main effect draw then grant Rush', () => {
    const host = new TestHost();
    host.addPlayer('p1', {
      id: 'OP04-001',
      number: 'OP04-001',
      name: 'Nefeltari Vivi',
      type: 'Leader',
      colors: ['Red', 'Blue'],
      power: 5000,
      life: 5,
    });
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const vivi = host.getPlayer('p1')!.zones.leader;

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
    host.addCardToZone(
      'p1',
      'cost',
      makeCard({
        id: 'DON-2',
        number: 'DON-2',
        name: 'DON!! 2',
        type: 'DON!!',
        cost: null,
        power: null,
        counter: null,
      }),
      'don-2',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'DRAW-1',
        number: 'DRAW-1',
        name: 'Draw 1',
        type: 'Character',
      }),
      'draw-1',
    );
    const target = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ALLY-1',
        number: 'ALLY-1',
        name: 'Ally',
        type: 'Character',
      }),
      'ally',
    );

    engine.reapplyContinuousEffects();
    expect(vivi.cannotAttack).toBe(true);

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: vivi.instanceId,
      sourceCardId: vivi.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.cost).toHaveLength(0);
    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(1);
    expect(target.hasRush).toBe(true);
  });

  it('lets Sasaki return the whole hand to deck, shuffle, then draw the same number', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const sasaki = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP04-048',
        number: 'OP04-048',
        name: 'Sasaki',
        type: 'Character',
      }),
      'sasaki',
    );
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({ id: 'H1', number: 'H1', name: 'Hand 1', type: 'Character' }),
      'hand-1',
    );
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({ id: 'H2', number: 'H2', name: 'Hand 2', type: 'Character' }),
      'hand-2',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'D1', number: 'D1', name: 'Deck 1', type: 'Character' }),
      'deck-1',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'D2', number: 'D2', name: 'Deck 2', type: 'Character' }),
      'deck-2',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: sasaki.instanceId,
      sourceCardId: sasaki.cardId,
    });

    expect(host.getPlayer('p1')?.zones.hand.map((card) => card.name)).toEqual([
      'Hand 2',
      'Hand 1',
    ]);
    expect(host.getPlayer('p1')?.zones.deck).toHaveLength(2);
  });

  it('lets Ice Oni schedule the battled character to move to the bottom of the deck at end of battle', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const iceOni = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP04-047',
        number: 'OP04-047',
        name: 'Ice Oni',
        type: 'Character',
      }),
      'ice-oni',
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

    host.state.combat.attackerInstanceId = iceOni.instanceId;
    host.state.combat.targetType = 'character';
    host.state.combat.targetInstanceId = target.instanceId;

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: iceOni.instanceId,
      sourceCardId: iceOni.cardId,
    });
    engine.clearCombatModifiers();

    expect(host.getPlayer('p2')?.zones.characters).not.toContain(target);
    expect(host.getPlayer('p2')?.zones.deck.at(-1)).toBe(target);
  });

  it('lets Diable Jambe Joue Shot grant +6000 power during battle', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const eventCard = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OP04-116',
        number: 'OP04-116',
        name: 'Diable Jambe Joue Shot',
        type: 'Event',
      }),
      'diable-jambe',
    );
    const target = host.getPlayer('p1')!.zones.leader;

    engine.handleEvent({
      type: 'activateCounter',
      playerSessionId: 'p1',
      sourceInstanceId: eventCard.instanceId,
      sourceCardId: eventCard.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(target.power).toBe(11000);
  });

  it('lets Diable Jambe Joue Shot K.O. a cost 2 or less character when total life is 4 or less', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const eventCard = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OP04-116',
        number: 'OP04-116',
        name: 'Diable Jambe Joue Shot',
        type: 'Event',
      }),
      'diable-jambe',
    );
    while (host.getPlayer('p1')!.zones.life.length > 2) {
      host.getPlayer('p1')!.zones.life.pop();
    }
    while (host.getPlayer('p2')!.zones.life.length > 2) {
      host.getPlayer('p2')!.zones.life.pop();
    }
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'C2',
        number: 'C2',
        name: 'Cost Two',
        type: 'Character',
        cost: 2,
      }),
      'cost-two',
    );

    engine.handleEvent({
      type: 'activateCounter',
      playerSessionId: 'p1',
      sourceInstanceId: eventCard.instanceId,
      sourceCardId: eventCard.cardId,
    });

    let decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [host.getPlayer('p1')!.zones.leader.instanceId],
    });

    decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(host.getPlayer('p2')?.zones.characters).not.toContain(target);
    expect(host.getPlayer('p2')?.zones.trash).toContain(target);
  });

  it('lets Diable Jambe Joue Shot draw 1 on trigger', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const eventCard = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OP04-116',
        number: 'OP04-116',
        name: 'Diable Jambe Joue Shot',
        type: 'Event',
      }),
      'diable-jambe',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'DRAW',
        number: 'DRAW',
        name: 'Drawn Card',
        type: 'Character',
      }),
      'drawn-card',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: eventCard.instanceId,
      sourceCardId: eventCard.cardId,
    });

    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(2);
  });

  it('lets Donquixote Doflamingo mark rested opposing cards to skip their next refresh', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const doflamingo = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP04-031',
        number: 'OP04-031',
        name: 'Donquixote Doflamingo',
        type: 'Character',
      }),
      'doflamingo',
    );
    const targetA = host.addCardToZone(
      'p2',
      'characters',
      makeCard({ id: 'A', number: 'A', name: 'A', type: 'Character' }),
      'a',
    );
    const targetB = host.addCardToZone(
      'p2',
      'characters',
      makeCard({ id: 'B', number: 'B', name: 'B', type: 'Character' }),
      'b',
    );
    targetA.rested = true;
    targetB.rested = true;

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: doflamingo.instanceId,
      sourceCardId: doflamingo.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [targetA.instanceId, targetB.instanceId],
    });

    expect(targetA.skipNextRefreshPhases).toBe(1);
    expect(targetB.skipNextRefreshPhases).toBe(1);
  });

  it('lets Sabo grant cannot-be-K.O.-by-effects to your characters until your next turn start', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const sabo = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP04-083',
        number: 'OP04-083',
        name: 'Sabo',
        type: 'Character',
      }),
      'sabo',
    );
    const ally = host.addCardToZone(
      'p1',
      'characters',
      makeCard({ id: 'ALLY', number: 'ALLY', name: 'Ally', type: 'Character' }),
      'ally',
    );
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
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({ id: 'H1', number: 'H1', name: 'Hand 1', type: 'Character' }),
      'hand-1',
    );
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({ id: 'H2', number: 'H2', name: 'Hand 2', type: 'Character' }),
      'hand-2',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: sabo.instanceId,
      sourceCardId: sabo.cardId,
    });

    let decision = engine.getPendingDecision();
    if (decision?.prompt.type === 'selectCards') {
      engine.answerDecision({
        decisionId: decision.id,
        selectedCardInstanceIds: [ally.instanceId, sabo.instanceId],
      });
    }

    decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: host
        .getPlayer('p1')!
        .zones.hand.map((card) => card.instanceId)
        .slice(0, 2),
    });

    expect(ally.cannotBeKoedByEffects).toBe(true);
    engine.clearTurnStartModifiers('p1');
    expect(ally.cannotBeKoedByEffects).toBe(false);
  });
});
