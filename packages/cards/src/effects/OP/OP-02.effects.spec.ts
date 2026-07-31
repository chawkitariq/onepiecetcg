import { describe, expect, it } from 'vitest';
import {
  DuelCard,
  DuelPlayer,
  DuelState,
  createDuelCard,
  type Card,
  type CardEffectDefinition,
} from '@onepiecetcg/shared';
import { EffectEngine, type EffectEngineHost } from '../../../../effect-engine/src/effect-engine.js';
import { buildEffectIndexes } from '../../../../effect-engine/src/effect-indexes.js';
import type {
  EffectRegistry,
  SpecialHandlerDefinition,
} from '../../../../effect-engine/src/types/effect-registry.js';
import { op02EffectDefinitions } from './OP-02.effects';

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
  definitions = [op02EffectDefinitions],
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
            selector.filter?.excludeName &&
            selector.filter.excludeName.includes(card.name)
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

describe('op02EffectDefinitions', () => {
  it('gives Ace rush and -3000 to up to 2 opposing characters on play with a Whitebeard leader', () => {
    const host = new TestHost();
    host.addPlayer('p1', {
      id: 'OP02-001',
      number: 'OP02-001',
      name: 'Edward.Newgate',
      type: 'Leader',
      families: ['Whitebeard Pirates'],
    });
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const ace = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP02-013',
        number: 'OP02-013',
        name: 'Portgas.D.Ace',
        type: 'Character',
        power: 7000,
      }),
      'ace',
    );
    const targetA = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'A',
        number: 'A',
        name: 'Target A',
        type: 'Character',
        power: 4000,
      }),
      'target-a',
    );
    const targetB = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'B',
        number: 'B',
        name: 'Target B',
        type: 'Character',
        power: 5000,
      }),
      'target-b',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: ace.instanceId,
      sourceCardId: ace.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [targetA.instanceId, targetB.instanceId],
    });

    expect(targetA.power).toBe(1000);
    expect(targetB.power).toBe(2000);
    expect(ace.hasRush).toBe(true);
  });

  it('plays Moby Dick from trigger and buffs Edward.Newgate plus Whitebeard Pirates during your turn at 1 life', () => {
    const host = new TestHost();
    host.addPlayer('p1', {
      id: 'OP02-001',
      number: 'OP02-001',
      name: 'Edward.Newgate',
      type: 'Leader',
      families: ['Whitebeard Pirates'],
      power: 6000,
    });
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    host.addCardToZone(
      'p1',
      'life',
      makeCard({ id: 'LIFE', number: 'LIFE', name: 'Life', type: 'Character' }),
      'life-1',
    );
    const mobyDick = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP02-024',
        number: 'OP02-024',
        name: 'Moby Dick',
        type: 'Stage',
      }),
      'moby-dick',
    );
    const whitebeardPirate = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'WB',
        number: 'WB',
        name: 'Whitebeard Pirate',
        type: 'Character',
        power: 5000,
        families: ['Whitebeard Pirates'],
      }),
      'wb',
    );
    const otherCharacter = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OTHER',
        number: 'OTHER',
        name: 'Other',
        type: 'Character',
        power: 5000,
      }),
      'other',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: mobyDick.instanceId,
      sourceCardId: mobyDick.cardId,
    });
    engine.reapplyContinuousEffects();

    expect(host.getPlayer('p1')?.zones.stage.cardId).toBe('OP02-024');
    expect(host.getPlayer('p1')?.zones.leader.power).toBe(8000);
    expect(whitebeardPirate.power).toBe(7000);
    expect(otherCharacter.power).toBe(5000);
  });

  it('lets OP02-062 trash 2 cards to bounce a character and gain double attack on play', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const luffy = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP02-062',
        number: 'OP02-062',
        name: 'Monkey.D.Luffy',
        type: 'Character',
      }),
      'luffy',
    );
    const fodderA = host.addCardToZone(
      'p1',
      'hand',
      makeCard({ id: 'FA', number: 'FA', name: 'Fodder A', type: 'Character' }),
      'fodder-a',
    );
    const fodderB = host.addCardToZone(
      'p1',
      'hand',
      makeCard({ id: 'FB', number: 'FB', name: 'Fodder B', type: 'Character' }),
      'fodder-b',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'T',
        number: 'T',
        name: 'Target',
        type: 'Character',
        cost: 4,
      }),
      'target',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: luffy.instanceId,
      sourceCardId: luffy.cardId,
    });

    let decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('confirm');
    engine.answerDecision({ decisionId: decision?.id ?? '', confirmed: true });

    decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.trash).toContain(fodderA);
    expect(host.getPlayer('p1')?.zones.trash).toContain(fodderB);
    expect(host.getPlayer('p2')?.zones.hand).toContain(target);
    expect(luffy.hasDoubleAttack).toBe(true);
  });

  it('makes Venom Road remove 1 opposing DON when the trigger condition is met', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);
    const venomRoad = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP02-091',
        number: 'OP02-091',
        name: 'Venom Road',
        type: 'Event',
      }),
      'venom-road',
    );

    for (let index = 0; index < 6; index += 1) {
      host.addCardToZone(
        'p2',
        'cost',
        makeCard({
          id: `DON-${index}`,
          number: `DON-${index}`,
          name: `Don ${index}`,
          type: 'DON!!',
        }),
        `don-${index}`,
      );
    }

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: venomRoad.instanceId,
      sourceCardId: venomRoad.cardId,
    });

    expect(host.getPlayer('p2')?.zones.cost).toHaveLength(5);
    expect(host.getPlayer('p2')?.zones.donDeck).toHaveLength(1);
  });
});
