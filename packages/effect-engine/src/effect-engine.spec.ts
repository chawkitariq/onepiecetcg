import { describe, expect, it } from '@jest/globals';
import {
  DuelCard,
  DuelPlayer,
  DuelState,
  createDuelCard,
  type Card,
  type CardEffectDefinition,
} from '@onepiecetcg/shared';
import { op01EffectDefinitions } from '@onepiecetcg/cards/effects/OP/OP-01.effects.js';
import { EffectEngine, type EffectEngineHost } from './effect-engine';
import { buildEffectIndexes } from './effect-indexes';
import type {
  EffectRegistry,
  SpecialHandlerDefinition,
} from './types/effect-registry';

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
  definitions = [op01EffectDefinitions],
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

  public addPlayer(
    sessionId: string,
    leaderCardId = `L-${sessionId}`,
  ): DuelPlayer {
    const player = new DuelPlayer();
    player.sessionId = sessionId;
    player.displayName = sessionId;
    player.zones.leader = createDuelCard(
      makeCard({
        id: leaderCardId,
        number: leaderCardId,
        name: `${sessionId} Leader`,
        type: 'Leader',
        power: 5000,
        life: 5,
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

    if (!player) {
      return;
    }

    player.zones.deck.reverse();
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
            selector.filter?.powerMin != null &&
            card.power < selector.filter.powerMin
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
            selector.filter?.rested != null &&
            card.rested !== selector.filter.rested
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
            selector.filter?.excludeName &&
            selector.filter.excludeName.includes(card.name)
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
            selector.filter?.owner === 'self' &&
            card.ownerSessionId !== controllerSessionId
          ) {
            continue;
          }

          if (
            selector.filter?.owner === 'opponent' &&
            card.ownerSessionId === controllerSessionId
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
    } else if (destinationZone === 'deck' && options?.toBottom) {
      player.zones.deck.push(card);
    } else if (destinationZone === 'deck') {
      player.zones.deck.unshift(card);
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

  public setZoneOrder(
    playerSessionId: string,
    zoneName: 'deck' | 'life',
    orderedInstanceIds: string[],
    options?: { faceDown?: boolean },
  ): boolean {
    const player = this.getPlayer(playerSessionId);
    const zone = player?.zones[zoneName];

    if (!player || !zone || orderedInstanceIds.length !== zone.length) {
      return false;
    }

    const cardsById = new Map(zone.map((card) => [card.instanceId, card]));
    const ordered = orderedInstanceIds.map((instanceId) =>
      cardsById.get(instanceId),
    );

    if (ordered.some((card) => !card)) {
      return false;
    }

    zone.splice(0, zone.length, ...(ordered as DuelCard[]));

    if (options?.faceDown !== undefined) {
      for (const card of zone) {
        card.faceDown = options.faceDown;
      }
    }

    return true;
  }

  public drawCard(playerSessionId: string): DuelCard | null {
    const player = this.getPlayer(playerSessionId);
    const card = player?.zones.deck.shift();

    if (!player || !card) {
      return null;
    }

    card.faceDown = false;
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

  public attachDon(
    playerSessionId: string,
    targetInstanceId: string,
    amount: number,
    options?: { rested?: boolean },
  ): number {
    const player = this.getPlayer(playerSessionId);
    const target =
      player?.zones.leader.instanceId === targetInstanceId
        ? player.zones.leader
        : player?.zones.characters.find(
            (card) => card.instanceId === targetInstanceId,
          );

    if (!player || !target) {
      return 0;
    }

    const matchingDon = player.zones.cost.filter((card) =>
      options?.rested === undefined ? true : card.rested === options.rested,
    );
    const attached = Math.min(amount, matchingDon.length);

    for (const don of matchingDon.slice(0, attached)) {
      const index = player.zones.cost.indexOf(don);

      if (index >= 0) {
        player.zones.cost.splice(index, 1);
      }
    }

    target.attachedDon += attached;
    return attached;
  }

  public returnDonToDonDeck(playerSessionId: string, amount: number): number {
    const player = this.getPlayer(playerSessionId);

    if (!player) {
      return 0;
    }

    let moved = 0;

    while (player.zones.cost.length > 0 && moved < amount) {
      const card = player.zones.cost.pop();

      if (!card) {
        break;
      }

      player.zones.donDeck.push(card);
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

  public syncPlayer(_playerSessionId: string): void {}

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

describe('EffectEngine', () => {
  it('applies replacement effects before a KO is resolved', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry(
        [
          {
            editionId: 'OP05',
            cards: [
              {
                cardId: 'OP05-051',
                effects: [
                  {
                    kind: 'replacement',
                    effect: {
                      id: 'borsalino-cannot-be-ko-by-effects',
                      text: "This Character can't be KO'd by your opponent's effects.",
                      event: 'wouldKoCharacter',
                      replacement: [],
                    },
                  },
                ],
              },
            ],
          },
        ],
        [],
      ),
      host,
    );

    const borsalino = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-051',
        number: 'OP05-051',
        name: 'Borsalino',
        type: 'Character',
        power: 6000,
      }),
      'borsalino',
    );

    const replaced = engine.applyReplacement({
      type: 'wouldKoCharacter',
      playerSessionId: 'p1',
      sourceInstanceId: borsalino.instanceId,
      reason: 'effect',
    });

    expect(replaced).toBe(true);
    expect(host.getPlayer('p1')?.zones.characters).toContain(borsalino);
    expect(host.logs.at(-1)).toContain('effet de remplacement');
  });

  it('replaces a move from the field by trashing the top life card for Enel', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry(
        [
          {
            editionId: 'OP05',
            cards: [
              {
                cardId: 'OP05-100',
                effects: [
                  {
                    kind: 'replacement',
                    effect: {
                      id: 'enel-would-leave-field-trash-top-life',
                      text: 'If this Character would leave the field, trash 1 card from the top of your Life cards instead.',
                      event: 'wouldMoveCard',
                      oncePerTurn: true,
                      conditions: [
                        { type: 'cardInZone', zone: 'characters' },
                        {
                          type: 'targetExists',
                          selector: {
                            player: 'self',
                            zones: ['life'],
                            count: { kind: 'exact', value: 1 },
                          },
                        },
                        {
                          type: 'targetCountAtMost',
                          selector: {
                            player: 'either',
                            zones: ['characters'],
                            filter: {
                              cardCategory: ['Character'],
                              name: ['Monkey.D.Luffy'],
                            },
                          },
                          value: 0,
                        },
                      ],
                      replacement: [
                        {
                          type: 'moveFirstCard',
                          selector: {
                            player: 'self',
                            zones: ['life'],
                            count: { kind: 'exact', value: 1 },
                          },
                          destinationPlayer: 'self',
                          destinationZone: 'trash',
                        },
                      ],
                    },
                  },
                ],
              },
            ],
          },
        ],
        [],
      ),
      host,
    );

    const enel = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-100',
        number: 'OP05-100',
        name: 'Enel',
        type: 'Character',
      }),
      'enel',
    );
    const lifeCard = host.addCardToZone(
      'p1',
      'life',
      makeCard({
        id: 'OP99-LIFE',
        number: 'OP99-LIFE',
        name: 'Life Card',
        type: 'Character',
      }),
      'life',
    );

    const replaced = engine.applyReplacement({
      type: 'wouldMoveCard',
      playerSessionId: 'p1',
      sourceInstanceId: enel.instanceId,
      destinationPlayerSessionId: 'p1',
      destinationZone: 'trash',
    });

    expect(replaced).toBe(true);
    expect(host.getPlayer('p1')?.zones.characters).toContain(enel);
    expect(host.getPlayer('p1')?.zones.life).not.toContain(lifeCard);
    expect(host.getPlayer('p1')?.zones.trash).toContain(lifeCard);

    const secondLifeCard = host.addCardToZone(
      'p1',
      'life',
      makeCard({
        id: 'OP99-LIFE-2',
        number: 'OP99-LIFE-2',
        name: 'Life Card 2',
        type: 'Character',
      }),
      'life-2',
    );

    const secondReplacement = engine.applyReplacement({
      type: 'wouldMoveCard',
      playerSessionId: 'p1',
      sourceInstanceId: enel.instanceId,
      destinationPlayerSessionId: 'p1',
      destinationZone: 'trash',
    });

    expect(secondReplacement).toBe(false);
    expect(host.getPlayer('p1')?.zones.life).toContain(secondLifeCard);
  });

  it('supports trigger effects via local definitions', () => {
    const triggerDefinition = {
      editionId: 'TEST',
      cards: [
        {
          cardId: 'TRIGGER-001',
          effects: [
            {
              kind: 'standard' as const,
              effect: {
                id: 'trigger-draw',
                text: '[Trigger] Draw 1 card.',
                trigger: { type: 'trigger' },
                actions: [{ type: 'draw', player: 'self', amount: 1 }],
              },
            },
          ],
        },
      ],
    };
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op01EffectDefinitions, triggerDefinition]),
      host,
    );
    const triggerCard = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'TRIGGER-001',
        number: 'TRIGGER-001',
        name: 'Trigger Test',
        type: 'Event',
        trigger: 'Draw 1.',
      }),
      'trigger',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'DRAW-001',
        number: 'DRAW-001',
        name: 'Drawn Card',
        type: 'Character',
      }),
      'drawn',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: triggerCard.instanceId,
      sourceCardId: triggerCard.cardId,
    });

    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(1);
  });

  it('supports wiping all characters except the source with a declarative action', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const wipeDefinition = {
      editionId: 'TEST',
      cards: [
        {
          cardId: 'WIPE-001',
          effects: [
            {
              kind: 'standard' as const,
              effect: {
                id: 'wipe-all-others',
                text: 'K.O. all Characters other than this Character.',
                trigger: { type: 'onPlay' as const },
                actions: [
                  {
                    type: 'koAllCharacters' as const,
                    selector: {
                      player: 'either' as const,
                      zones: ['characters'],
                      filter: { cardCategory: ['Character'] },
                    },
                    excludeSource: true,
                    reason: 'effect' as const,
                  },
                ],
              },
            },
          ],
        },
      ],
    };
    const engine = new EffectEngine(
      createRegistry([op01EffectDefinitions, wipeDefinition]),
      host,
    );
    const source = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'WIPE-001',
        number: 'WIPE-001',
        name: 'Wipe Source',
        type: 'Character',
      }),
      'wipe-source',
    );
    const ally = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ALLY-WIPE',
        number: 'ALLY-WIPE',
        name: 'Ally Wipe',
        type: 'Character',
      }),
      'ally-wipe',
    );
    const enemy = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'ENEMY-WIPE',
        number: 'ENEMY-WIPE',
        name: 'Enemy Wipe',
        type: 'Character',
      }),
      'enemy-wipe',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: source.instanceId,
      sourceCardId: source.cardId,
    });

    expect(host.getPlayer('p1')?.zones.characters).toContain(source);
    expect(host.getPlayer('p1')?.zones.characters).not.toContain(ally);
    expect(host.getPlayer('p2')?.zones.characters).not.toContain(enemy);
  });

  it('schedules actions for turn end and resolves the DON!! return primitive', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const scheduleDefinition = {
      editionId: 'TEST',
      cards: [
        {
          cardId: 'SCHEDULE-001',
          effects: [
            {
              kind: 'standard' as const,
              effect: {
                id: 'schedule-don-return',
                text: 'At the end of this turn, return DON!! cards until you have the same number as your opponent.',
                trigger: { type: 'onPlay' as const },
                actions: [
                  {
                    type: 'scheduleActionsAtTurnEnd' as const,
                    actions: [
                      {
                        type: 'returnDonToDonDeckMatchingOpponentCount' as const,
                        player: 'self' as const,
                        referencePlayer: 'opponent' as const,
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      ],
    };
    const engine = new EffectEngine(
      createRegistry([op01EffectDefinitions, scheduleDefinition]),
      host,
    );
    const source = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'SCHEDULE-001',
        number: 'SCHEDULE-001',
        name: 'Schedule Test',
        type: 'Character',
      }),
      'schedule-source',
    );

    for (let index = 0; index < 5; index += 1) {
      host.addCardToZone(
        'p1',
        'cost',
        makeCard({
          id: `DON-P1-${index}`,
          number: `DON-P1-${index}`,
          name: `DON!! ${index}`,
          type: 'DON!!',
        }),
        `don-p1-${index}`,
      );
    }

    for (let index = 0; index < 3; index += 1) {
      host.addCardToZone(
        'p2',
        'cost',
        makeCard({
          id: `DON-P2-${index}`,
          number: `DON-P2-${index}`,
          name: `DON!! ${index}`,
          type: 'DON!!',
        }),
        `don-p2-${index}`,
      );
    }

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: source.instanceId,
      sourceCardId: source.cardId,
    });

    expect(host.getPlayer('p1')?.zones.cost).toHaveLength(5);
    expect(host.getPlayer('p1')?.zones.donDeck).toHaveLength(0);

    engine.handleEvent({
      type: 'onTurnEnd',
      playerSessionId: 'p1',
      sourceInstanceId: source.instanceId,
      sourceCardId: source.cardId,
    });

    expect(host.getPlayer('p1')?.zones.cost).toHaveLength(3);
    expect(host.getPlayer('p1')?.zones.donDeck).toHaveLength(2);
    expect(host.getPlayer('p2')?.zones.cost).toHaveLength(3);
  });

  it('applies temporary cost modifiers until end of turn', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const costDefinition = {
      editionId: 'TEST',
      cards: [
        {
          cardId: 'COST-001',
          effects: [
            {
              kind: 'standard' as const,
              effect: {
                id: 'reduce-cost',
                text: 'Give up to 1 opposing Character -2 cost during this turn.',
                trigger: { type: 'onPlay' as const },
                actions: [
                  {
                    type: 'modifyCost' as const,
                    selector: {
                      player: 'opponent' as const,
                      zones: ['characters'],
                      filter: { cardCategory: ['Character'], costMax: 5 },
                      count: { kind: 'upTo' as const, value: 1 },
                    },
                    amount: -2,
                    duration: { type: 'untilEndOfTurn' as const },
                  },
                ],
              },
            },
          ],
        },
      ],
    };
    const engine = new EffectEngine(
      createRegistry([op01EffectDefinitions, costDefinition]),
      host,
    );
    const source = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'COST-001',
        number: 'COST-001',
        name: 'Cost Source',
        type: 'Character',
      }),
      'cost-source',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'COST-TARGET',
        number: 'COST-TARGET',
        name: 'Cost Target',
        type: 'Character',
        cost: 4,
      }),
      'cost-target',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: source.instanceId,
      sourceCardId: source.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(target.cost).toBe(2);

    engine.clearTurnModifiers();

    expect(target.cost).toBe(4);
  });

  it('does not trigger onTurnEnd effects for matching cards controlled by the opponent', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');

    const endTurnDefinition = {
      editionId: 'TEST',
      cards: [
        {
          cardId: 'TURN-END-001',
          effects: [
            {
              kind: 'standard' as const,
              effect: {
                id: 'turn-end-draw',
                text: 'At the end of your turn, draw 1 card.',
                trigger: { type: 'onTurnEnd' as const },
                actions: [
                  {
                    type: 'draw' as const,
                    player: 'self' as const,
                    amount: 1,
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'P1-DRAW',
        number: 'P1-DRAW',
        name: 'P1 Draw',
        type: 'Character',
      }),
      'p1-draw',
    );
    host.addCardToZone(
      'p2',
      'deck',
      makeCard({
        id: 'P2-DRAW',
        number: 'P2-DRAW',
        name: 'P2 Draw',
        type: 'Character',
      }),
      'p2-draw',
    );

    const p1Source = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'TURN-END-001',
        number: 'TURN-END-001',
        name: 'Turn End Source',
        type: 'Character',
      }),
      'p1-turn-end-source',
    );
    host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'TURN-END-001',
        number: 'TURN-END-001',
        name: 'Turn End Source',
        type: 'Character',
      }),
      'p2-turn-end-source',
    );

    const engine = new EffectEngine(createRegistry([endTurnDefinition]), host);

    engine.handleEvent({
      type: 'onTurnEnd',
      playerSessionId: 'p1',
      sourceInstanceId: p1Source.instanceId,
      sourceCardId: p1Source.cardId,
    });

    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(1);
    expect(host.getPlayer('p2')?.zones.hand).toHaveLength(0);
  });

  it('keeps next-turn modifiers through end of turn, then clears them at your next turn start', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const nextTurnDefinition = {
      editionId: 'TEST',
      cards: [
        {
          cardId: 'NEXT-001',
          effects: [
            {
              kind: 'standard' as const,
              effect: {
                id: 'next-turn-buff',
                text: 'Give your Leader +2000 power until the start of your next turn.',
                trigger: { type: 'onPlay' as const },
                actions: [
                  {
                    type: 'modifyPower' as const,
                    selector: {
                      player: 'self' as const,
                      zones: ['leader'] as const,
                      count: { kind: 'exact' as const, value: 1 },
                    },
                    amount: 2000,
                    duration: { type: 'untilStartOfYourNextTurn' as const },
                  },
                ],
              },
            },
          ],
        },
      ],
    };
    const engine = new EffectEngine(
      createRegistry([op01EffectDefinitions, nextTurnDefinition]),
      host,
    );
    const source = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'NEXT-001',
        number: 'NEXT-001',
        name: 'Next Turn Source',
        type: 'Character',
      }),
      'next-source',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: source.instanceId,
      sourceCardId: source.cardId,
    });

    expect(host.getPlayer('p1')?.zones.leader.power).toBe(7000);

    engine.clearTurnModifiers();

    expect(host.getPlayer('p1')?.zones.leader.power).toBe(7000);

    engine.clearTurnStartModifiers('p1');

    expect(host.getPlayer('p1')?.zones.leader.power).toBe(5000);
  });

  it('prevents moving your own life cards to hand while the restriction is active', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const restrictionDefinition = {
      editionId: 'TEST',
      cards: [
        {
          cardId: 'RESTRICT-001',
          effects: [
            {
              kind: 'standard' as const,
              effect: {
                id: 'restrict-life-to-hand',
                text: 'You cannot add Life cards to your hand using your own effects during this turn.',
                trigger: { type: 'onPlay' as const },
                actions: [
                  {
                    type: 'preventOwnEffectLifeToHand' as const,
                    player: 'self' as const,
                    duration: { type: 'untilEndOfTurn' as const },
                  },
                  {
                    type: 'moveFirstCard' as const,
                    selector: {
                      player: 'self' as const,
                      zones: ['life'] as const,
                      count: { kind: 'exact' as const, value: 1 },
                    },
                    destinationPlayer: 'self' as const,
                    destinationZone: 'hand' as const,
                  },
                ],
              },
            },
          ],
        },
      ],
    };
    const engine = new EffectEngine(
      createRegistry([op01EffectDefinitions, restrictionDefinition]),
      host,
    );
    const source = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'RESTRICT-001',
        number: 'RESTRICT-001',
        name: 'Restriction Source',
        type: 'Character',
      }),
      'restrict-source',
    );
    const lifeCard = host.addCardToZone(
      'p1',
      'life',
      makeCard({
        id: 'LIFE-001',
        number: 'LIFE-001',
        name: 'Life Card',
        type: 'Character',
      }),
      'life-card',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: source.instanceId,
      sourceCardId: source.cardId,
    });

    expect(host.getPlayer('p1')?.zones.hand).not.toContain(lifeCard);
    expect(host.getPlayer('p1')?.zones.life).toContain(lifeCard);
  });

  it('stops opponent effects from moving protected in-play characters off the field', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const protectedDefinition = {
      editionId: 'TEST',
      cards: [
        {
          cardId: 'PROTECT-001',
          effects: [
            {
              kind: 'continuous' as const,
              effect: {
                id: 'protected-from-opponent-moves',
                text: 'This Character cannot be removed from the field by your opponent effects.',
                modifier: {
                  selector: {
                    player: 'self' as const,
                    source: 'effectSource' as const,
                    zones: ['characters'] as const,
                  },
                  keywords: ['cannotBeRemovedByOpponentEffects' as const],
                },
              },
            },
          ],
        },
        {
          cardId: 'BOUNCE-001',
          effects: [
            {
              kind: 'standard' as const,
              effect: {
                id: 'bounce-opposing-character',
                text: 'Return up to 1 opposing Character to the owner hand.',
                trigger: { type: 'onPlay' as const },
                actions: [
                  {
                    type: 'moveCard' as const,
                    selector: {
                      player: 'opponent' as const,
                      zones: ['characters'] as const,
                      filter: { cardCategory: ['Character'] as const },
                      count: { kind: 'upTo' as const, value: 1 },
                    },
                    destinationPlayer: 'selectedCardOwner' as const,
                    destinationZone: 'hand' as const,
                  },
                ],
              },
            },
          ],
        },
      ],
    };
    const engine = new EffectEngine(
      createRegistry([op01EffectDefinitions, protectedDefinition]),
      host,
    );
    const protectedCharacter = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'PROTECT-001',
        number: 'PROTECT-001',
        name: 'Protected Character',
        type: 'Character',
      }),
      'protected-character',
    );
    const source = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'BOUNCE-001',
        number: 'BOUNCE-001',
        name: 'Bounce Source',
        type: 'Character',
      }),
      'bounce-source',
    );

    engine.reapplyContinuousEffects();
    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p2',
      sourceInstanceId: source.instanceId,
      sourceCardId: source.cardId,
    });

    expect(host.getPlayer('p1')?.zones.characters).toContain(
      protectedCharacter,
    );
    expect(host.getPlayer('p1')?.zones.hand).not.toContain(protectedCharacter);
  });

  it('resolves scheduled end-of-battle moves to the bottom of the deck', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const delayedMoveDefinition = {
      editionId: 'TEST',
      cards: [
        {
          cardId: 'DELAY-001',
          effects: [
            {
              kind: 'standard' as const,
              effect: {
                id: 'schedule-self-bottom-deck',
                text: 'At the end of this battle, place this Character at the bottom of the deck.',
                trigger: { type: 'onPlay' as const },
                actions: [
                  {
                    type: 'scheduleMoveAtEndOfBattle' as const,
                    selector: {
                      player: 'self' as const,
                      source: 'effectSource' as const,
                      zones: ['characters'] as const,
                      count: { kind: 'exact' as const, value: 1 },
                    },
                    destinationPlayer: 'selectedCardOwner' as const,
                    destinationZone: 'deck' as const,
                    toBottom: true,
                  },
                ],
              },
            },
          ],
        },
      ],
    };
    const engine = new EffectEngine(
      createRegistry([op01EffectDefinitions, delayedMoveDefinition]),
      host,
    );
    const existingTop = host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'TOP-001',
        number: 'TOP-001',
        name: 'Top Card',
        type: 'Character',
      }),
      'top-card',
    );
    const source = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'DELAY-001',
        number: 'DELAY-001',
        name: 'Delayed Source',
        type: 'Character',
      }),
      'delayed-source',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: source.instanceId,
      sourceCardId: source.cardId,
    });

    engine.clearCombatModifiers();

    expect(host.getPlayer('p1')?.zones.characters).not.toContain(source);
    expect(host.getPlayer('p1')?.zones.deck[0]).toBe(existingTop);
    expect(host.getPlayer('p1')?.zones.deck.at(-1)).toBe(source);
  });

  it('supports selecting any number of cards for stored-count effects', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const anyCountDefinition = {
      editionId: 'TEST',
      cards: [
        {
          cardId: 'ANY-001',
          effects: [
            {
              kind: 'standard' as const,
              effect: {
                id: 'trash-any-hand-cards-for-leader-power',
                text: 'Trash any number of cards from your hand. Your Leader gains +1000 power for each card trashed.',
                trigger: { type: 'onPlay' as const },
                actions: [
                  {
                    type: 'storeSelectedCards' as const,
                    key: 'trashed-hand',
                    selector: {
                      player: 'self' as const,
                      zones: ['hand'] as const,
                      count: { kind: 'any' as const },
                    },
                  },
                  {
                    type: 'moveStoredCards' as const,
                    key: 'trashed-hand',
                    destinationPlayer: 'selectedCardOwner' as const,
                    destinationZone: 'trash' as const,
                  },
                  {
                    type: 'modifyPowerByStoredCount' as const,
                    key: 'trashed-hand',
                    selector: {
                      player: 'self' as const,
                      zones: ['leader'] as const,
                      count: { kind: 'exact' as const, value: 1 },
                    },
                    amountPerCard: 1000,
                    duration: { type: 'untilEndOfBattle' as const },
                  },
                ],
              },
            },
          ],
        },
      ],
    };
    const engine = new EffectEngine(
      createRegistry([op01EffectDefinitions, anyCountDefinition]),
      host,
    );
    const source = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ANY-001',
        number: 'ANY-001',
        name: 'Any Count Source',
        type: 'Character',
      }),
      'any-source',
    );
    const first = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'HAND-1',
        number: 'HAND-1',
        name: 'Hand 1',
        type: 'Event',
      }),
      'hand-1',
    );
    const second = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'HAND-2',
        number: 'HAND-2',
        name: 'Hand 2',
        type: 'Event',
      }),
      'hand-2',
    );
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'HAND-3',
        number: 'HAND-3',
        name: 'Hand 3',
        type: 'Event',
      }),
      'hand-3',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: source.instanceId,
      sourceCardId: source.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');
    expect(decision?.prompt.max).toBe(3);

    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [first.instanceId, second.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.trash).toHaveLength(2);
    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(1);
    expect(host.getPlayer('p1')?.zones.leader.power).toBe(7000);
  });

  it('can apply conditional power changes to the same stored selection', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const conditionalStoredSelectionDefinition = {
      editionId: 'TEST',
      cards: [
        {
          cardId: 'COND-001',
          effects: [
            {
              kind: 'standard' as const,
              effect: {
                id: 'conditional-stored-power',
                text: 'Choose up to 1 of your Leader or Character cards. It gains +2000 power during this battle. Then, if your opponent has 2 or less Life cards, that card gains an additional +2000 power during this battle.',
                trigger: { type: 'activateCounter' as const },
                actions: [
                  {
                    type: 'storeSelectedCards' as const,
                    key: 'selected-target',
                    selector: {
                      player: 'self' as const,
                      zones: ['leader', 'characters'] as const,
                      count: { kind: 'upTo' as const, value: 1 },
                    },
                  },
                  {
                    type: 'modifyStoredCardsPower' as const,
                    key: 'selected-target',
                    amount: 2000,
                    duration: { type: 'untilEndOfBattle' as const },
                  },
                  {
                    type: 'ifConditionsMatch' as const,
                    conditions: [
                      {
                        type: 'playerHasLifeAtMost' as const,
                        player: 'opponent' as const,
                        value: 2,
                      },
                    ],
                    actions: [
                      {
                        type: 'modifyStoredCardsPower' as const,
                        key: 'selected-target',
                        amount: 2000,
                        duration: { type: 'untilEndOfBattle' as const },
                      },
                    ],
                  },
                ],
              },
            },
          ],
        },
      ],
    };
    const engine = new EffectEngine(
      createRegistry([
        op01EffectDefinitions,
        conditionalStoredSelectionDefinition,
      ]),
      host,
    );
    const source = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'COND-001',
        number: 'COND-001',
        name: 'Conditional Source',
        type: 'Event',
      }),
      'conditional-source',
    );
    const target = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'TARGET-001',
        number: 'TARGET-001',
        name: 'Target',
        type: 'Character',
        power: 4000,
      }),
      'target',
    );

    host.getPlayer('p2')!.zones.life = host
      .getPlayer('p2')!
      .zones.life.slice(0, 2);

    engine.handleEvent({
      type: 'activateCounter',
      playerSessionId: 'p1',
      sourceInstanceId: source.instanceId,
      sourceCardId: source.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: decision?.id ?? '',
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(target.power).toBe(8000);
  });

  it('supports conditions on the combined life and hand count', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const combinedLifeAndHandDefinition = {
      editionId: 'TEST',
      cards: [
        {
          cardId: 'COMBINED-001',
          effects: [
            {
              kind: 'standard' as const,
              effect: {
                id: 'combined-life-hand-draw',
                text: 'If you have 4 or fewer cards total in your Life area and hand, draw 1 card.',
                trigger: { type: 'onPlay' as const },
                conditions: [
                  {
                    type: 'playerHasLifeAndHandAtMost' as const,
                    player: 'self' as const,
                    value: 4,
                  },
                ],
                actions: [
                  { type: 'draw' as const, player: 'self' as const, amount: 1 },
                ],
              },
            },
          ],
        },
      ],
    };
    const engine = new EffectEngine(
      createRegistry([op01EffectDefinitions, combinedLifeAndHandDefinition]),
      host,
    );
    const source = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'COMBINED-001',
        number: 'COMBINED-001',
        name: 'Combined Count Source',
        type: 'Character',
      }),
      'combined-source',
    );

    host.getPlayer('p1')!.zones.life = host
      .getPlayer('p1')!
      .zones.life.slice(0, 2);
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'HAND-1',
        number: 'HAND-1',
        name: 'Hand 1',
        type: 'Event',
      }),
      'hand-1',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'DRAW-1',
        number: 'DRAW-1',
        name: 'Draw 1',
        type: 'Event',
      }),
      'draw-1',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: source.instanceId,
      sourceCardId: source.cardId,
    });

    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(2);
  });

  it('supports conditions against the played card in observer-style onCharacterPlayed effects', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const observerDefinition = {
      editionId: 'TEST',
      cards: [
        {
          cardId: 'OBSERVER-001',
          effects: [
            {
              kind: 'standard' as const,
              effect: {
                id: 'observer-draw-on-trigger-character-play',
                text: 'When you play a Character with Trigger, draw 1 card.',
                trigger: { type: 'onCharacterPlayed' as const },
                conditions: [
                  { type: 'controllerTurn' as const, value: true },
                  { type: 'eventPlayerIs' as const, player: 'self' as const },
                  {
                    type: 'eventTargetMatchesFilter' as const,
                    filter: {
                      cardCategory: ['Character'] as const,
                      hasTrigger: true,
                    },
                  },
                ],
                actions: [
                  { type: 'draw' as const, player: 'self' as const, amount: 1 },
                ],
              },
            },
          ],
        },
      ],
    };
    const engine = new EffectEngine(
      createRegistry([op01EffectDefinitions, observerDefinition]),
      host,
    );
    const observer = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OBSERVER-001',
        number: 'OBSERVER-001',
        name: 'Observer',
        type: 'Character',
      }),
      'observer',
    );
    const playedCharacter = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'PLAYED-001',
        number: 'PLAYED-001',
        name: 'Played Trigger Character',
        type: 'Character',
        trigger: 'Play this card.',
      }),
      'played-trigger-character',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'DRAW-1',
        number: 'DRAW-1',
        name: 'Draw 1',
        type: 'Event',
      }),
      'draw-1',
    );

    engine.handleEvent({
      type: 'onCharacterPlayed',
      playerSessionId: 'p1',
      sourceInstanceId: playedCharacter.instanceId,
      sourceCardId: playedCharacter.cardId,
      sourceZone: 'hand',
    });

    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(1);
    expect(host.getPlayer('p1')?.zones.hand[0]?.name).toBe('Draw 1');
    expect(host.getPlayer('p1')?.zones.characters).toContain(observer);
  });

  it('supports observer-style onCardRemovedByEffect effects with source and destination zone conditions', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const observerDefinition = {
      editionId: 'TEST',
      cards: [
        {
          cardId: 'OBSERVER-REMOVE-001',
          effects: [
            {
              kind: 'standard' as const,
              effect: {
                id: 'observer-draw-on-own-hand-trash-by-effect',
                text: 'When a card is trashed from your hand by an effect, draw 1 card.',
                trigger: { type: 'onCardRemovedByEffect' as const },
                conditions: [
                  { type: 'eventPlayerIs' as const, player: 'self' as const },
                  {
                    type: 'eventSourceZoneIs' as const,
                    value: 'hand' as const,
                  },
                  {
                    type: 'eventDestinationZoneIs' as const,
                    value: 'trash' as const,
                  },
                ],
                actions: [
                  { type: 'draw' as const, player: 'self' as const, amount: 1 },
                ],
              },
            },
          ],
        },
        {
          cardId: 'TRASH-HAND-001',
          effects: [
            {
              kind: 'standard' as const,
              effect: {
                id: 'trash-one-hand-card',
                text: 'Trash 1 card from your hand.',
                trigger: { type: 'onPlay' as const },
                actions: [
                  {
                    type: 'trashFromHand' as const,
                    selector: {
                      player: 'self' as const,
                      zones: ['hand'] as const,
                      count: { kind: 'exact' as const, value: 1 },
                    },
                  },
                ],
              },
            },
          ],
        },
      ],
    };
    const engine = new EffectEngine(
      createRegistry([op01EffectDefinitions, observerDefinition]),
      host,
    );
    const observer = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OBSERVER-REMOVE-001',
        number: 'OBSERVER-REMOVE-001',
        name: 'Removal Observer',
        type: 'Character',
      }),
      'observer-remove',
    );
    const trashSource = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'TRASH-HAND-001',
        number: 'TRASH-HAND-001',
        name: 'Trash Source',
        type: 'Character',
      }),
      'trash-source',
    );
    const trashedCard = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'TRASH-ME',
        number: 'TRASH-ME',
        name: 'Trash Me',
        type: 'Event',
      }),
      'trash-me',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'DRAW-REMOVE-1',
        number: 'DRAW-REMOVE-1',
        name: 'Draw Remove 1',
        type: 'Event',
      }),
      'draw-remove-1',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: trashSource.instanceId,
      sourceCardId: trashSource.cardId,
    });

    expect(host.getPlayer('p1')?.zones.trash).toContain(trashedCard);
    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(1);
    expect(host.getPlayer('p1')?.zones.hand[0]?.name).toBe('Draw Remove 1');
    expect(host.getPlayer('p1')?.zones.characters).toContain(observer);
  });

  it('supports observer-style onCardRemovedByEffect effects from cards in the stage area', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const observerDefinition = {
      editionId: 'TEST',
      cards: [
        {
          cardId: 'STAGE-OBSERVER-001',
          effects: [
            {
              kind: 'standard' as const,
              effect: {
                id: 'stage-observer-add-rested-don',
                text: 'When your character is removed from the field by your opponent effect, add 1 rested DON.',
                trigger: { type: 'onCardRemovedByEffect' as const },
                conditions: [
                  { type: 'eventPlayerIs' as const, player: 'self' as const },
                  {
                    type: 'eventEffectControllerIs' as const,
                    player: 'opponent' as const,
                  },
                  {
                    type: 'eventSourceZoneIs' as const,
                    value: 'characters' as const,
                  },
                  {
                    type: 'eventTargetMatchesFilter' as const,
                    filter: {
                      cardCategory: ['Character'] as const,
                      owner: 'self' as const,
                    },
                  },
                ],
                actions: [
                  {
                    type: 'addDon' as const,
                    player: 'self' as const,
                    amount: 1,
                    rested: true,
                  },
                ],
              },
            },
          ],
        },
        {
          cardId: 'REMOVE-OPPONENT-CHAR',
          effects: [
            {
              kind: 'standard' as const,
              effect: {
                id: 'remove-opponent-character',
                text: 'Move 1 opponent Character to the trash.',
                trigger: { type: 'onPlay' as const },
                actions: [
                  {
                    type: 'moveCard' as const,
                    selector: {
                      player: 'opponent' as const,
                      zones: ['characters'] as const,
                      filter: {
                        cardCategory: ['Character'] as const,
                        name: ['Removed Character'] as const,
                      },
                      count: { kind: 'exact' as const, value: 1 },
                    },
                    destinationPlayer: 'selectedCardOwner' as const,
                    destinationZone: 'trash' as const,
                  },
                ],
              },
            },
          ],
        },
      ],
    };
    const engine = new EffectEngine(
      createRegistry([op01EffectDefinitions, observerDefinition]),
      host,
    );
    const stageObserver = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'STAGE-OBSERVER-001',
        number: 'STAGE-OBSERVER-001',
        name: 'Stage Observer',
        type: 'Stage',
      }),
      'stage-observer',
    );
    host.moveCard(stageObserver, 'p1', 'stage');
    host.addCardToZone(
      'p1',
      'donDeck',
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
    host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'REMOVED-CHAR',
        number: 'REMOVED-CHAR',
        name: 'Removed Character',
        type: 'Character',
      }),
      'removed-character',
    );
    const remover = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'REMOVE-OPPONENT-CHAR',
        number: 'REMOVE-OPPONENT-CHAR',
        name: 'Remover',
        type: 'Character',
      }),
      'remover',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p2',
      sourceInstanceId: remover.instanceId,
      sourceCardId: remover.cardId,
    });

    expect(host.getPlayer('p1')?.zones.cost).toHaveLength(1);
    expect(host.getPlayer('p1')?.zones.cost[0]?.rested).toBe(true);
  });
});
