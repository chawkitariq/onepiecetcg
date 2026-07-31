import { describe, expect, it } from 'vitest';
import {
  DuelCard,
  DuelPlayer,
  DuelState,
  createDuelCard,
  type Card,
  type CardEffectDefinition,
} from '@onepiecetcg/shared';
import { EffectEngine, type EffectEngineHost } from '../../../effect-engine/src/effect-engine.js';
import { buildEffectIndexes } from '../../../effect-engine/src/effect-indexes.js';
import type {
  EffectRegistry,
  SpecialHandlerDefinition,
} from '../../../effect-engine/src/types/effect-registry.js';
import { op05EffectDefinitions } from './OP-05.effects';
import { op05007SpecialHandler } from './special/OP05-007.special';
import { op05043SpecialHandler } from './special/OP05-043.special';
import { op05019SpecialHandler } from './special/OP05-019.special';
import { op05002SpecialHandler } from './special/OP05-002.special';
import { op05058SpecialHandler } from './special/OP05-058.special';
import { op05099SpecialHandler } from './special/OP05-099.special';
import { op05119SpecialHandler } from './special/OP05-119.special';

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
  definitions = [op05EffectDefinitions],
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
        player.zones.stage = createDuelCard(
          makeCard({
            id: `${player.sessionId}:empty-stage`,
            number: `${player.sessionId}:empty-stage`,
            name: 'Empty Stage',
            type: 'Stage',
            cost: null,
            power: null,
            counter: null,
          }),
          `${player.sessionId}:stage-empty`,
          player.sessionId,
        );
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

describe('op05EffectDefinitions', () => {
  it('applies Koala on play only with a Revolutionary Army leader', () => {
    const host = new TestHost();
    host.addPlayer('p1', {
      families: ['Revolutionary Army'],
    });
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op05EffectDefinitions]),
      host,
    );

    const koala = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-006',
        number: 'OP05-006',
        name: 'Koala',
        type: 'Character',
      }),
      'koala',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-001',
        number: 'OP99-001',
        name: 'Target',
        type: 'Character',
        power: 5000,
      }),
      'target',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: koala.instanceId,
      sourceCardId: koala.cardId,
    });

    const pending = engine.getPendingDecision();

    expect(pending?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: pending!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(target.power).toBe(2000);
  });

  it('moves a selected cost 4 or less character to the bottom of its owner deck with Borsalino', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const borsalino = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-051',
        number: 'OP05-051',
        name: 'Borsalino',
        type: 'Character',
      }),
      'borsalino',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-002',
        number: 'OP99-002',
        name: 'Low Cost Target',
        type: 'Character',
        cost: 4,
      }),
      'low-cost-target',
    );
    host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-003',
        number: 'OP99-003',
        name: 'High Cost Target',
        type: 'Character',
        cost: 5,
      }),
      'high-cost-target',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: borsalino.instanceId,
      sourceCardId: borsalino.cardId,
    });

    const pending = engine.getPendingDecision();

    expect(pending?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: pending!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(
      host
        .getPlayer('p2')
        ?.zones.characters.find(
          (card) => card.instanceId === target.instanceId,
        ),
    ).toBeUndefined();
    expect(host.getPlayer('p2')?.zones.deck.at(-1)?.instanceId).toBe(
      target.instanceId,
    );
  });

  it('grants Fra-Nosuke rush while it has DON!! x1 and the player has 8 or more DON!! on the field', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const fraNosuke = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-070',
        number: 'OP05-070',
        name: 'Fra-Nosuke',
        type: 'Character',
      }),
      'fra-nosuke',
    );

    for (let index = 0; index < 7; index += 1) {
      host.addCardToZone(
        'p1',
        'cost',
        makeCard({
          id: `DON-${index}`,
          number: `DON-${index}`,
          name: `DON ${index}`,
          type: 'DON!!',
          cost: null,
          power: null,
          counter: null,
        }),
        `don-${index}`,
      );
    }

    fraNosuke.attachedDon = 1;
    engine.reapplyContinuousEffects();

    expect(fraNosuke.hasRush).toBe(true);
  });

  it('grants Bunny Joe the blocker keyword continuously', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const bunnyJoe = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-013',
        number: 'OP05-013',
        name: 'Bunny Joe',
        type: 'Character',
      }),
      'bunny-joe',
    );

    engine.reapplyContinuousEffects();

    expect(bunnyJoe.mustBeAttackTarget).toBe(true);
  });

  it('plays Satori from trash after paying the trigger hand cost', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const satori = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP05-105',
        number: 'OP05-105',
        name: 'Satori',
        type: 'Character',
      }),
      'satori',
    );
    const fodder = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OP99-004',
        number: 'OP99-004',
        name: 'Fodder',
        type: 'Character',
      }),
      'fodder',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: satori.instanceId,
      sourceCardId: satori.cardId,
    });

    const optionalDecision = engine.getPendingDecision();

    expect(optionalDecision?.prompt.type).toBe('confirm');

    engine.answerDecision({
      decisionId: optionalDecision!.id,
      confirmed: true,
    });

    expect(
      host
        .getPlayer('p1')
        ?.zones.characters.find(
          (card) => card.instanceId === satori.instanceId,
        ),
    ).toBeDefined();
    expect(host.getPlayer('p1')?.zones.trash[0]?.instanceId).toBe(
      fodder.instanceId,
    );
  });

  it('sets Donquixote Rosinante leader active at the end of its controller turn when hand size is 6 or less', () => {
    const host = new TestHost();
    const player = host.addPlayer('p1', {
      id: 'OP05-022',
      number: 'OP05-022',
      name: 'Donquixote Rosinante',
      families: ['Donquixote Pirates'],
    });
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    player.zones.leader.rested = true;

    for (let index = 0; index < 6; index += 1) {
      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: `OP99-H${index}`,
          number: `OP99-H${index}`,
          name: `Hand ${index}`,
          type: 'Character',
        }),
        `hand-${index}`,
      );
    }

    engine.handleEvent({
      type: 'onTurnEnd',
      playerSessionId: 'p1',
      sourceInstanceId: player.zones.leader.instanceId,
      sourceCardId: player.zones.leader.cardId,
    });

    expect(player.zones.leader.rested).toBe(false);
  });

  it('gives Jinbe +1000 power during the opponent turn when its controller has 10 DON!! on the field', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    host.state.activePlayerSessionId = 'p2';
    const engine = new EffectEngine(createRegistry(), host);

    const jinbe = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-066',
        number: 'OP05-066',
        name: 'Jinbe',
        type: 'Character',
        power: 5000,
      }),
      'jinbe',
    );

    for (let index = 0; index < 10; index += 1) {
      host.addCardToZone(
        'p1',
        'cost',
        makeCard({
          id: `DON-J${index}`,
          number: `DON-J${index}`,
          name: `DON J${index}`,
          type: 'DON!!',
          cost: null,
          power: null,
          counter: null,
        }),
        `jinbe-don-${index}`,
      );
    }

    engine.reapplyContinuousEffects();

    expect(jinbe.power).toBe(6000);
  });

  it('plays a Revolutionary Army character from hand with Emporio Energy Hormone trigger', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const hormone = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP05-018',
        number: 'OP05-018',
        name: 'Emporio Energy Hormone',
        type: 'Event',
      }),
      'energy-hormone',
    );
    const revolutionaryArmy = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OP99-RA1',
        number: 'OP99-RA1',
        name: 'Revolutionary Army Recruit',
        type: 'Character',
        power: 5000,
        families: ['Revolutionary Army'],
      }),
      'revolutionary-army',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: hormone.instanceId,
      sourceCardId: hormone.cardId,
    });

    const pending = engine.getPendingDecision();

    expect(pending?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: pending!.id,
      selectedCardInstanceIds: [revolutionaryArmy.instanceId],
    });

    expect(
      host
        .getPlayer('p1')
        ?.zones.characters.find(
          (card) => card.instanceId === revolutionaryArmy.instanceId,
        ),
    ).toBeDefined();
    expect(
      host
        .getPlayer('p1')
        ?.zones.hand.find(
          (card) => card.instanceId === revolutionaryArmy.instanceId,
        ),
    ).toBeUndefined();
  });

  it('searches the top 5 cards with Baby 5 (034) after paying its activate main cost', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const baby5 = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-034',
        number: 'OP05-034',
        name: 'Baby 5',
        type: 'Character',
        families: ['Donquixote Pirates'],
      }),
      'baby-5-034',
    );
    const don = host.addCardToZone(
      'p1',
      'cost',
      makeCard({
        id: 'DON-B5',
        number: 'DON-B5',
        name: 'DON',
        type: 'DON!!',
        cost: null,
        power: null,
        counter: null,
      }),
      'baby-5-don',
    );
    const searchTarget = host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'OP99-DP1',
        number: 'OP99-DP1',
        name: 'Donquixote Pirate Target',
        type: 'Character',
        families: ['Donquixote Pirates'],
      }),
      'deck-target',
    );

    for (let index = 0; index < 4; index += 1) {
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: `OP99-FILL${index}`,
          number: `OP99-FILL${index}`,
          name: `Filler ${index}`,
          type: 'Character',
        }),
        `filler-${index}`,
      );
    }

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: baby5.instanceId,
      sourceCardId: baby5.cardId,
    });

    const pending = engine.getPendingDecision();

    expect(pending?.prompt.type).toBe('confirm');

    engine.answerDecision({
      decisionId: pending!.id,
      confirmed: true,
    });

    const searchDecision = engine.getPendingDecision();

    expect(searchDecision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: searchDecision!.id,
      selectedCardInstanceIds: [searchTarget.instanceId],
    });

    expect(baby5.rested).toBe(true);
    expect(host.getPlayer('p1')?.zones.cost).toHaveLength(0);
    expect(
      host
        .getPlayer('p1')
        ?.zones.hand.find(
          (card) => card.instanceId === searchTarget.instanceId,
        ),
    ).toBeDefined();
    expect(
      host
        .getPlayer('p1')
        ?.zones.deck.find(
          (card) => card.instanceId === searchTarget.instanceId,
        ),
    ).toBeUndefined();
    expect(host.getPlayer('p1')?.zones.donDeck.at(-1)?.instanceId).toBe(
      don.instanceId,
    );
  });

  it('makes the opponent trash 1 card with Shirahoshi when they have 6 or more cards in hand', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const shirahoshi = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-082',
        number: 'OP05-082',
        name: 'Shirahoshi',
        type: 'Character',
      }),
      'shirahoshi',
    );
    const trashA = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP99-TA',
        number: 'OP99-TA',
        name: 'Trash A',
        type: 'Character',
      }),
      'trash-a',
    );
    const trashB = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP99-TB',
        number: 'OP99-TB',
        name: 'Trash B',
        type: 'Character',
      }),
      'trash-b',
    );
    const discardTarget = host.addCardToZone(
      'p2',
      'hand',
      makeCard({
        id: 'OP99-O0',
        number: 'OP99-O0',
        name: 'Opponent 0',
        type: 'Character',
      }),
      'opponent-0',
    );

    for (let index = 1; index < 6; index += 1) {
      host.addCardToZone(
        'p2',
        'hand',
        makeCard({
          id: `OP99-O${index}`,
          number: `OP99-O${index}`,
          name: `Opponent ${index}`,
          type: 'Character',
        }),
        `opponent-${index}`,
      );
    }

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: shirahoshi.instanceId,
      sourceCardId: shirahoshi.cardId,
    });

    const optionalDecision = engine.getPendingDecision();

    expect(optionalDecision?.prompt.type).toBe('confirm');

    engine.answerDecision({
      decisionId: optionalDecision!.id,
      confirmed: true,
    });

    const discardDecision = engine.getPendingDecision();

    expect(discardDecision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: discardDecision!.id,
      selectedCardInstanceIds: [discardTarget.instanceId],
    });

    expect(shirahoshi.rested).toBe(true);
    expect(host.getPlayer('p1')?.zones.trash).toHaveLength(0);
    expect(host.getPlayer('p1')?.zones.deck.at(-1)?.instanceId).toBe(
      trashB.instanceId,
    );
    expect(host.getPlayer('p1')?.zones.deck.at(-2)?.instanceId).toBe(
      trashA.instanceId,
    );
    expect(
      host
        .getPlayer('p2')
        ?.zones.hand.find(
          (card) => card.instanceId === discardTarget.instanceId,
        ),
    ).toBeUndefined();
    expect(
      host
        .getPlayer('p2')
        ?.zones.trash.find(
          (card) => card.instanceId === discardTarget.instanceId,
        ),
    ).toBeDefined();
  });

  it('lets I Bid 500 Million!! choose the KO branch and draw if a Celestial Dragons character is present', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const eventCard = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP05-096',
        number: 'OP05-096',
        name: 'I Bid 500 Million!!',
        type: 'Event',
      }),
      'bid-500-million',
    );
    host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP99-CD',
        number: 'OP99-CD',
        name: 'Celestial Dragon Guard',
        type: 'Character',
        families: ['Celestial Dragons'],
      }),
      'celestial',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-T1',
        number: 'OP99-T1',
        name: 'Tiny Target',
        type: 'Character',
        cost: 1,
      }),
      'tiny-target',
    );

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: eventCard.instanceId,
      sourceCardId: eventCard.cardId,
    });

    const branchDecision = engine.getPendingDecision();

    expect(branchDecision?.prompt.type).toBe('selectChoice');
    expect(branchDecision?.prompt.choices).toHaveLength(3);
    expect(branchDecision?.prompt.choices.map((choice) => choice.id)).toEqual([
      'ko-main',
      'return-main',
      'life-main',
    ]);
  });

  it('lets Hino Bird Zap KO an opponent character from trigger by activating its main effect', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op05EffectDefinitions]),
      host,
    );

    const hinoBirdZap = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP05-116',
        number: 'OP05-116',
        name: 'Hino Bird Zap',
        type: 'Event',
      }),
      'hino-bird-zap',
    );
    host.addCardToZone(
      'p2',
      'life',
      makeCard({
        id: 'OP99-L1',
        number: 'OP99-L1',
        name: 'Opponent Life',
        type: 'Character',
      }),
      'opponent-life',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-T1',
        number: 'OP99-T1',
        name: 'Opponent Target',
        type: 'Character',
        cost: 1,
      }),
      'target',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: hinoBirdZap.instanceId,
      sourceCardId: hinoBirdZap.cardId,
    });

    const pending = engine.getPendingDecision();

    expect(pending?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: pending!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(host.getPlayer('p2')?.zones.characters).not.toContain(target);
    expect(host.getPlayer('p2')?.zones.trash).toContain(target);
  });

  it('lets Trafalgar Law 069 search the top 5 cards when the opponent has more DON!! on the field', () => {
    const host = new TestHost();
    host.addPlayer('p1', {
      colors: ['Red', 'Blue'],
      name: 'Multicolor Leader',
    });
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op05EffectDefinitions]),
      host,
    );

    const law = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-069',
        number: 'OP05-069',
        name: 'Trafalgar Law',
        type: 'Character',
      }),
      'law-069',
    );
    host.addCardToZone(
      'p1',
      'cost',
      makeCard({
        id: 'DON-P1',
        number: 'DON-P1',
        name: 'DON',
        type: 'DON!!',
        cost: null,
        power: null,
        counter: null,
      }),
      'don-p1',
    );
    for (let index = 0; index < 2; index += 1) {
      host.addCardToZone(
        'p2',
        'cost',
        makeCard({
          id: `DON-P2-${index}`,
          number: `DON-P2-${index}`,
          name: 'DON',
          type: 'DON!!',
          cost: null,
          power: null,
          counter: null,
        }),
        `don-p2-${index}`,
      );
    }
    const heartPirates = host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'OP99-HP1',
        number: 'OP99-HP1',
        name: 'Heart Pirates Target',
        type: 'Character',
        families: ['Heart Pirates'],
      }),
      'heart-pirates-target',
    );
    for (let index = 0; index < 4; index += 1) {
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: `OP99-FILL${index}`,
          number: `OP99-FILL${index}`,
          name: `Filler ${index}`,
          type: 'Character',
        }),
        `filler-${index}`,
      );
    }

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: law.instanceId,
      sourceCardId: law.cardId,
    });

    const searchDecision = engine.getPendingDecision();

    expect(searchDecision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: searchDecision!.id,
      selectedCardInstanceIds: [heartPirates.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.hand).toContain(heartPirates);
    expect(host.getPlayer('p1')?.zones.deck).not.toContain(heartPirates);
  });

  it('lets Let Us Begin the World of Violence!! draw and bounce a character while the leader is multicolored', () => {
    const host = new TestHost();
    host.addPlayer('p1', {
      colors: ['Red', 'Blue'],
      name: 'Multicolor Leader',
    });
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op05EffectDefinitions]),
      host,
    );

    const eventCard = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP05-059',
        number: 'OP05-059',
        name: 'Let Us Begin the World of Violence!!',
        type: 'Event',
      }),
      'violence',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-T5',
        number: 'OP99-T5',
        name: 'Opponent Target',
        type: 'Character',
        cost: 5,
      }),
      'target',
    );

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: eventCard.instanceId,
      sourceCardId: eventCard.cardId,
    });

    const mainDecision = engine.getPendingDecision();

    expect(mainDecision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: mainDecision!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(0);
    expect(host.getPlayer('p2')?.zones.hand).toContain(target);
  });

  it('lets Let Us Begin the World of Violence!! draw 2 cards from trigger while the leader is multicolored', () => {
    const host = new TestHost();
    host.addPlayer('p1', {
      colors: ['Red', 'Blue'],
      name: 'Multicolor Leader',
    });
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op05EffectDefinitions]),
      host,
    );

    const eventCard = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP05-059',
        number: 'OP05-059',
        name: 'Let Us Begin the World of Violence!!',
        type: 'Event',
      }),
      'violence-trigger',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'OP99-D1',
        number: 'OP99-D1',
        name: 'Draw One',
        type: 'Character',
      }),
      'draw-1',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'OP99-D2',
        number: 'OP99-D2',
        name: 'Draw Two',
        type: 'Character',
      }),
      'draw-2',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: eventCard.instanceId,
      sourceCardId: eventCard.cardId,
    });

    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(2);
  });

  it('lets Pagaya draw 2 cards and trash 2 cards when a Trigger activates', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const pagaya = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-109',
        number: 'OP05-109',
        name: 'Pagaya',
        type: 'Character',
      }),
      'pagaya',
    );
    const triggerCard = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP99-E1',
        number: 'OP99-E1',
        name: 'Trigger Event',
        type: 'Event',
      }),
      'trigger-event',
    );
    const handA = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OP99-PA',
        number: 'OP99-PA',
        name: 'Hand A',
        type: 'Character',
      }),
      'hand-a',
    );
    const handB = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OP99-PB',
        number: 'OP99-PB',
        name: 'Hand B',
        type: 'Character',
      }),
      'hand-b',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'OP99-D1',
        number: 'OP99-D1',
        name: 'Draw One',
        type: 'Character',
      }),
      'draw-one',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'OP99-D2',
        number: 'OP99-D2',
        name: 'Draw Two',
        type: 'Character',
      }),
      'draw-two',
    );

    engine.handleEvent({
      type: 'onEventActivated',
      playerSessionId: 'p1',
      sourceInstanceId: triggerCard.instanceId,
      sourceCardId: triggerCard.cardId,
    });

    const trashDecision = engine.getPendingDecision();

    expect(trashDecision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: trashDecision!.id,
      selectedCardInstanceIds: [handA.instanceId, handB.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(2);
    expect(host.getPlayer('p1')?.zones.trash).toContain(handA);
    expect(host.getPlayer('p1')?.zones.trash).toContain(handB);
    expect(host.getPlayer('p1')?.zones.characters).toContain(pagaya);
  });

  it('lets Ulti add one of the top 3 cards to hand and reorder the rest when the leader is multicolored', () => {
    const host = new TestHost();
    host.addPlayer('p1', {
      colors: ['Red', 'Blue'],
      name: 'Multicolor Leader',
    });
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op05EffectDefinitions], [op05043SpecialHandler]),
      host,
    );

    const ulti = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-043',
        number: 'OP05-043',
        name: 'Ulti',
        type: 'Character',
      }),
      'ulti',
    );
    const topA = host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'OP99-U1',
        number: 'OP99-U1',
        name: 'Top A',
        type: 'Character',
      }),
      'top-a',
    );
    const topB = host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'OP99-U2',
        number: 'OP99-U2',
        name: 'Top B',
        type: 'Character',
      }),
      'top-b',
    );
    const topC = host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'OP99-U3',
        number: 'OP99-U3',
        name: 'Top C',
        type: 'Character',
      }),
      'top-c',
    );
    const filler = host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'OP99-U4',
        number: 'OP99-U4',
        name: 'Filler',
        type: 'Character',
      }),
      'filler',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: ulti.instanceId,
      sourceCardId: ulti.cardId,
    });

    const firstDecision = engine.getPendingDecision();

    expect(firstDecision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: firstDecision!.id,
      selectedCardInstanceIds: [topA.instanceId],
    });

    const secondDecision = engine.getPendingDecision();

    expect(secondDecision?.prompt.type).toBe('selectChoice');

    engine.answerDecision({
      decisionId: secondDecision!.id,
      selectedChoiceIds: ['top'],
    });

    const thirdDecision = engine.getPendingDecision();

    expect(thirdDecision?.prompt.type).toBe('selectChoice');

    engine.answerDecision({
      decisionId: thirdDecision!.id,
      selectedChoiceIds: [topC.instanceId],
    });

    const fourthDecision = engine.getPendingDecision();

    expect(fourthDecision?.prompt.type).toBe('selectChoice');

    engine.answerDecision({
      decisionId: fourthDecision!.id,
      selectedChoiceIds: ['bottom'],
    });

    expect(host.getPlayer('p1')?.zones.hand).toContain(topA);
    expect(host.getPlayer('p1')?.zones.deck[0]).toBe(topB);
    expect(host.getPlayer('p1')?.zones.deck).toContain(topC);
    expect(host.getPlayer('p1')?.zones.deck).toContain(filler);
  });

  it("lets Fire Fist reduce a target to 0 power and KO it from trigger when you're at 2 Life", () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op05EffectDefinitions], [op05019SpecialHandler]),
      host,
    );

    const fireFist = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP05-019',
        number: 'OP05-019',
        name: 'Fire Fist',
        type: 'Event',
      }),
      'fire-fist',
    );
    host.addCardToZone(
      'p1',
      'life',
      makeCard({
        id: 'OP99-L1',
        number: 'OP99-L1',
        name: 'Life One',
        type: 'Character',
      }),
      'life-one',
    );
    host.addCardToZone(
      'p1',
      'life',
      makeCard({
        id: 'OP99-L2',
        number: 'OP99-L2',
        name: 'Life Two',
        type: 'Character',
      }),
      'life-two',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-FF1',
        number: 'OP99-FF1',
        name: 'Fire Fist Target',
        type: 'Character',
        power: 4000,
      }),
      'fire-fist-target',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: fireFist.instanceId,
      sourceCardId: fireFist.cardId,
    });

    const decision = engine.getPendingDecision();

    expect(decision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    const koDecision = engine.getPendingDecision();

    expect(koDecision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: koDecision!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(host.getPlayer('p2')?.zones.characters).not.toContain(target);
    expect(host.getPlayer('p2')?.zones.trash).toContain(target);
  });

  it('lets Belo Betty trash a Revolutionary Army card to power up up to 3 characters and respects once per turn', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op05EffectDefinitions], [op05002SpecialHandler]),
      host,
    );

    const betty = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-002',
        number: 'OP05-002',
        name: 'Belo Betty',
        type: 'Character',
      }),
      'betty',
    );
    const costCardA = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OP99-RA1',
        number: 'OP99-RA1',
        name: 'Revolutionary Army Cost A',
        type: 'Character',
        families: ['Revolutionary Army'],
      }),
      'revolutionary-a',
    );
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OP99-RA2',
        number: 'OP99-RA2',
        name: 'Revolutionary Army Cost B',
        type: 'Character',
        families: ['Revolutionary Army'],
      }),
      'revolutionary-b',
    );
    const revolutionary = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP99-RA3',
        number: 'OP99-RA3',
        name: 'Revolutionary Target',
        type: 'Character',
        families: ['Revolutionary Army'],
        power: 3000,
      }),
      'revolutionary-target',
    );
    const triggered = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP99-TR1',
        number: 'OP99-TR1',
        name: 'Trigger Target',
        type: 'Character',
        power: 4000,
        trigger: '[Trigger]',
      }),
      'trigger-target',
    );
    const filler = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP99-FI1',
        number: 'OP99-FI1',
        name: 'Filler Target',
        type: 'Character',
        power: 5000,
      }),
      'filler-target',
    );

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: betty.instanceId,
      sourceCardId: betty.cardId,
    });

    const confirmDecision = engine.getPendingDecision();

    expect(confirmDecision?.prompt.type).toBe('confirm');

    engine.answerDecision({
      decisionId: confirmDecision!.id,
      confirmed: true,
    });

    const trashDecision = engine.getPendingDecision();

    expect(trashDecision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: trashDecision!.id,
      selectedCardInstanceIds: [costCardA.instanceId],
    });

    const buffDecision = engine.getPendingDecision();

    expect(buffDecision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: buffDecision!.id,
      selectedCardInstanceIds: [
        revolutionary.instanceId,
        triggered.instanceId,
        filler.instanceId,
      ],
    });

    expect(revolutionary.power).toBe(6000);
    expect(triggered.power).toBe(7000);
    expect(filler.power).toBe(5000);
    expect(host.getPlayer('p1')?.zones.trash).toContain(costCardA);

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: betty.instanceId,
      sourceCardId: betty.cardId,
    });

    expect(engine.getPendingDecision()).toBeNull();
  });

  it("moves all cost 3-or-less Characters to their owner's deck and both players discard to 5 for It's a Waste of Human Life!!", () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op05EffectDefinitions], [op05058SpecialHandler]),
      host,
    );

    const eventCard = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP05-058',
        number: 'OP05-058',
        name: "It's a Waste of Human Life!!",
        type: 'Event',
      }),
      'waste',
    );
    const p1Small = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP99-SM1',
        number: 'OP99-SM1',
        name: 'P1 Small',
        type: 'Character',
        cost: 3,
      }),
      'p1-small',
    );
    const p2Small = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-SM2',
        number: 'OP99-SM2',
        name: 'P2 Small',
        type: 'Character',
        cost: 2,
      }),
      'p2-small',
    );
    host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP99-LG1',
        number: 'OP99-LG1',
        name: 'P1 Large',
        type: 'Character',
        cost: 4,
      }),
      'p1-large',
    );
    host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-LG2',
        number: 'OP99-LG2',
        name: 'P2 Large',
        type: 'Character',
        cost: 4,
      }),
      'p2-large',
    );
    const p1DiscardA = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OP99-H1',
        number: 'OP99-H1',
        name: 'P1 Hand A',
        type: 'Character',
      }),
      'p1-hand-a',
    );
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OP99-H2',
        number: 'OP99-H2',
        name: 'P1 Hand B',
        type: 'Character',
      }),
      'p1-hand-b',
    );
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OP99-H3',
        number: 'OP99-H3',
        name: 'P1 Hand C',
        type: 'Character',
      }),
      'p1-hand-c',
    );
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OP99-H4',
        number: 'OP99-H4',
        name: 'P1 Hand D',
        type: 'Character',
      }),
      'p1-hand-d',
    );
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OP99-H5',
        number: 'OP99-H5',
        name: 'P1 Hand E',
        type: 'Character',
      }),
      'p1-hand-e',
    );
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OP99-H6',
        number: 'OP99-H6',
        name: 'P1 Hand F',
        type: 'Character',
      }),
      'p1-hand-f',
    );
    const p2DiscardA = host.addCardToZone(
      'p2',
      'hand',
      makeCard({
        id: 'OP99-Q1',
        number: 'OP99-Q1',
        name: 'P2 Hand A',
        type: 'Character',
      }),
      'p2-hand-a',
    );
    const p2DiscardB = host.addCardToZone(
      'p2',
      'hand',
      makeCard({
        id: 'OP99-Q2',
        number: 'OP99-Q2',
        name: 'P2 Hand B',
        type: 'Character',
      }),
      'p2-hand-b',
    );
    host.addCardToZone(
      'p2',
      'hand',
      makeCard({
        id: 'OP99-Q3',
        number: 'OP99-Q3',
        name: 'P2 Hand C',
        type: 'Character',
      }),
      'p2-hand-c',
    );
    host.addCardToZone(
      'p2',
      'hand',
      makeCard({
        id: 'OP99-Q4',
        number: 'OP99-Q4',
        name: 'P2 Hand D',
        type: 'Character',
      }),
      'p2-hand-d',
    );
    host.addCardToZone(
      'p2',
      'hand',
      makeCard({
        id: 'OP99-Q5',
        number: 'OP99-Q5',
        name: 'P2 Hand E',
        type: 'Character',
      }),
      'p2-hand-e',
    );
    host.addCardToZone(
      'p2',
      'hand',
      makeCard({
        id: 'OP99-Q6',
        number: 'OP99-Q6',
        name: 'P2 Hand F',
        type: 'Character',
      }),
      'p2-hand-f',
    );
    host.addCardToZone(
      'p2',
      'hand',
      makeCard({
        id: 'OP99-Q7',
        number: 'OP99-Q7',
        name: 'P2 Hand G',
        type: 'Character',
      }),
      'p2-hand-g',
    );

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: eventCard.instanceId,
      sourceCardId: eventCard.cardId,
    });

    const firstDecision = engine.getPendingDecision();

    expect(firstDecision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: firstDecision!.id,
      selectedCardInstanceIds: [p1DiscardA.instanceId],
    });

    const secondDecision = engine.getPendingDecision();

    expect(secondDecision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: secondDecision!.id,
      selectedCardInstanceIds: [p2DiscardA.instanceId, p2DiscardB.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.characters).not.toContain(p1Small);
    expect(host.getPlayer('p2')?.zones.characters).not.toContain(p2Small);
    expect(host.getPlayer('p1')?.zones.deck).toContain(p1Small);
    expect(host.getPlayer('p2')?.zones.deck).toContain(p2Small);
    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(5);
    expect(host.getPlayer('p2')?.zones.hand).toHaveLength(5);
  });

  it('lets Amazon either make the attacker trash a Life card or apply a battle power reduction', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op05EffectDefinitions], [op05099SpecialHandler]),
      host,
    );

    const amazon = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-099',
        number: 'OP05-099',
        name: 'Amazon',
        type: 'Character',
      }),
      'amazon',
    );
    const lifeA = host.addCardToZone(
      'p2',
      'life',
      makeCard({
        id: 'OP99-LA',
        number: 'OP99-LA',
        name: 'Life A',
        type: 'Character',
      }),
      'life-a',
    );
    host.addCardToZone(
      'p2',
      'life',
      makeCard({
        id: 'OP99-LB',
        number: 'OP99-LB',
        name: 'Life B',
        type: 'Character',
      }),
      'life-b',
    );

    engine.handleEvent({
      type: 'onAttacked',
      playerSessionId: 'p1',
      sourceInstanceId: amazon.instanceId,
      sourceCardId: amazon.cardId,
    });

    const confirmDecision = engine.getPendingDecision();

    expect(confirmDecision?.prompt.type).toBe('confirm');

    engine.answerDecision({
      decisionId: confirmDecision!.id,
      confirmed: true,
    });

    const lifeDecision = engine.getPendingDecision();

    expect(lifeDecision?.prompt.type).toBe('selectChoice');

    engine.answerDecision({
      decisionId: lifeDecision!.id,
      selectedChoiceIds: ['trash-life'],
    });

    expect(amazon.rested).toBe(true);
    expect(host.getPlayer('p2')?.zones.life).not.toContain(lifeA);
    expect(host.getPlayer('p2')?.zones.trash).toContain(lifeA);
    expect(engine.getPendingDecision()).toBeNull();
  });

  it('lets Mozambia gain +2000 power once when an outside-Draw-Phase effect draws two cards', () => {
    const host = new TestHost();
    host.addPlayer('p1', {
      colors: ['Red', 'Blue'],
      name: 'Multicolor Leader',
    });
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op05EffectDefinitions]),
      host,
    );

    const mozambia = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-053',
        number: 'OP05-053',
        name: 'Mozambia',
        type: 'Character',
      }),
      'mozambia',
    );
    const eventCard = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP05-059',
        number: 'OP05-059',
        name: 'Let Us Begin the World of Violence!!',
        type: 'Event',
      }),
      'violence',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'OP99-D1',
        number: 'OP99-D1',
        name: 'Draw One',
        type: 'Character',
      }),
      'draw-1',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'OP99-D2',
        number: 'OP99-D2',
        name: 'Draw Two',
        type: 'Character',
      }),
      'draw-2',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: eventCard.instanceId,
      sourceCardId: eventCard.cardId,
    });

    expect(mozambia.power).toBe(3000);
    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(2);
  });

  it.each([
    ['OP05-084', 'Saint Charlos', -4],
    ['OP05-092', 'Saint Rosward', -6],
  ])(
    'applies the Celestial Dragons-only cost reduction for %s while the board stays pure',
    (cardId, name, amount) => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(
        createRegistry([op05EffectDefinitions]),
        host,
      );

      host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: cardId,
          number: cardId,
          name: `${name} Source`,
          type: 'Character',
          families: ['Celestial Dragons'],
        }),
        `${cardId.toLowerCase()}-source`,
      );
      const target = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: `${cardId}-TARGET`,
          number: `${cardId}-TARGET`,
          name: `${name} Target`,
          type: 'Character',
          cost: 8,
        }),
        `${cardId.toLowerCase()}-target`,
      );

      engine.reapplyContinuousEffects();

      expect(target.cost).toBe(8 + amount);

      host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: `${cardId}-BROKEN`,
          number: `${cardId}-BROKEN`,
          name: `${name} Breaker`,
          type: 'Character',
          families: ['Random'],
        }),
        `${cardId.toLowerCase()}-breaker`,
      );

      engine.reapplyContinuousEffects();

      expect(target.cost).toBe(8);
    },
  );

  it('lets Birdcage keep cost 5-or-less characters rested and clears itself at end of turn when Doflamingo has 10 DON!!', () => {
    const host = new TestHost();
    host.addPlayer('p1', {
      name: 'Donquixote Doflamingo',
    });
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op05EffectDefinitions]),
      host,
    );

    const birdcage = createDuelCard(
      makeCard({
        id: 'OP05-040',
        number: 'OP05-040',
        name: 'Birdcage',
        type: 'Stage',
      }),
      'birdcage',
      'p1',
    );
    host.getPlayer('p1')!.zones.stage = birdcage;
    const p1Small = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP99-BC1',
        number: 'OP99-BC1',
        name: 'Birdcage Target A',
        type: 'Character',
        cost: 5,
      }),
      'birdcage-p1-small',
    );
    const p2Small = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-BC2',
        number: 'OP99-BC2',
        name: 'Birdcage Target B',
        type: 'Character',
        cost: 4,
      }),
      'birdcage-p2-small',
    );
    host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-BC3',
        number: 'OP99-BC3',
        name: 'Birdcage Target C',
        type: 'Character',
        cost: 6,
      }),
      'birdcage-p2-large',
    );
    for (let index = 0; index < 10; index += 1) {
      host.addCardToZone(
        'p1',
        'cost',
        makeCard({
          id: `DON-B${index}`,
          number: `DON-B${index}`,
          name: 'DON',
          type: 'DON!!',
          cost: null,
          power: null,
          counter: null,
        }),
        `birdcage-don-${index}`,
      );
    }

    engine.reapplyContinuousEffects();

    expect(p1Small.skipNextRefreshPhases).toBe(1);
    expect(p2Small.skipNextRefreshPhases).toBe(1);

    p1Small.rested = true;
    p2Small.rested = true;

    engine.handleEvent({
      type: 'onTurnEnd',
      playerSessionId: 'p1',
      sourceInstanceId: birdcage.instanceId,
      sourceCardId: birdcage.cardId,
    });

    expect(host.getPlayer('p1')?.zones.characters).not.toContain(p1Small);
    expect(host.getPlayer('p2')?.zones.characters).not.toContain(p2Small);
    expect(host.getPlayer('p1')?.zones.trash).toContain(p1Small);
    expect(host.getPlayer('p2')?.zones.trash).toContain(p2Small);
    expect(host.getPlayer('p1')?.zones.stage.instanceId).not.toBe(
      birdcage.instanceId,
    );
    expect(host.getPlayer('p1')?.zones.trash).toContain(birdcage);
  });

  it('lets Lindbergh K.O. a low-power target when it attacks at 7000 power', () => {
    const host = new TestHost();
    host.addPlayer('p1', {
      colors: ['Red', 'Blue'],
      name: 'Multicolor Leader',
    });
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op05EffectDefinitions]),
      host,
    );

    const lindbergh = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-017',
        number: 'OP05-017',
        name: 'Lindbergh',
        type: 'Character',
        power: 7000,
      }),
      'lindbergh',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-LP1',
        number: 'OP99-LP1',
        name: 'Low Power Target',
        type: 'Character',
        power: 3000,
      }),
      'low-power-target',
    );

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: lindbergh.instanceId,
      sourceCardId: lindbergh.cardId,
    });

    const decision = engine.getPendingDecision();

    expect(decision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(host.getPlayer('p2')?.zones.characters).not.toContain(target);
    expect(host.getPlayer('p2')?.zones.trash).toContain(target);
  });

  it('lets Lindbergh play itself from trigger after trashing a hand card with a multicolored leader', () => {
    const host = new TestHost();
    host.addPlayer('p1', {
      colors: ['Red', 'Blue'],
      name: 'Multicolor Leader',
    });
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op05EffectDefinitions]),
      host,
    );

    const lindbergh = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP05-017',
        number: 'OP05-017',
        name: 'Lindbergh',
        type: 'Character',
      }),
      'lindbergh-trigger',
    );
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OP99-H1',
        number: 'OP99-H1',
        name: 'Hand Fodder',
        type: 'Character',
      }),
      'hand-fodder',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: lindbergh.instanceId,
      sourceCardId: lindbergh.cardId,
    });

    const confirmDecision = engine.getPendingDecision();

    expect(confirmDecision?.prompt.type).toBe('confirm');

    engine.answerDecision({
      decisionId: confirmDecision!.id,
      confirmed: true,
    });

    expect(host.getPlayer('p1')?.zones.characters).toContain(lindbergh);
    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(0);
  });

  it('lets Sabo 007 KO up to 2 opponent characters whose total power is 4000 or less', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op05EffectDefinitions], [op05007SpecialHandler]),
      host,
    );

    host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-P1',
        number: 'OP99-P1',
        name: 'Target One',
        type: 'Character',
        power: 1000,
      }),
      'target-one',
    );
    const targetTwo = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-P2',
        number: 'OP99-P2',
        name: 'Target Two',
        type: 'Character',
        power: 3000,
      }),
      'target-two',
    );
    const sabo = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-007',
        number: 'OP05-007',
        name: 'Sabo',
        type: 'Character',
      }),
      'sabo-007',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: sabo.instanceId,
      sourceCardId: sabo.cardId,
    });

    const decision = engine.getPendingDecision();

    expect(decision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [targetTwo.instanceId],
    });

    expect(host.getPlayer('p2')?.zones.characters).not.toContain(targetTwo);
    expect(host.getPlayer('p2')?.zones.trash).toContain(targetTwo);
  });

  it('lets Two-Hundred Million Volts Amaru trash 2 cards and add the top deck card to life on trigger', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const amaru = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP05-115',
        number: 'OP05-115',
        name: 'Two-Hundred Million Volts Amaru',
        type: 'Event',
      }),
      'amaru',
    );
    const handA = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OP99-HA',
        number: 'OP99-HA',
        name: 'Hand A',
        type: 'Character',
      }),
      'hand-a',
    );
    const handB = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OP99-HB',
        number: 'OP99-HB',
        name: 'Hand B',
        type: 'Character',
      }),
      'hand-b',
    );
    const lifeTop = host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'OP99-L1',
        number: 'OP99-L1',
        name: 'Life Top',
        type: 'Character',
      }),
      'life-top',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: amaru.instanceId,
      sourceCardId: amaru.cardId,
    });

    const optionalDecision = engine.getPendingDecision();

    expect(optionalDecision?.prompt.type).toBe('confirm');

    engine.answerDecision({
      decisionId: optionalDecision!.id,
      confirmed: true,
    });

    expect(host.getPlayer('p1')?.zones.hand).toHaveLength(0);
    expect(host.getPlayer('p1')?.zones.trash).toContain(handA);
    expect(host.getPlayer('p1')?.zones.trash).toContain(handB);
    expect(host.getPlayer('p1')?.zones.life.at(-1)?.instanceId).toBe(
      lifeTop.instanceId,
    );
  });

  it('lets Chaka attach up to 2 rested DON!! cards to your leader with the activate main prompt', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const chaka = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-008',
        number: 'OP05-008',
        name: 'Chaka',
        type: 'Character',
      }),
      'chaka',
    );
    chaka.attachedDon = 1;
    host.addCardToZone(
      'p1',
      'donDeck',
      makeCard({
        id: 'DON-001',
        number: 'DON-001',
        name: 'DON!!',
        type: 'DON!!',
      }),
      'don-1',
    );
    host.addCardToZone(
      'p1',
      'donDeck',
      makeCard({
        id: 'DON-002',
        number: 'DON-002',
        name: 'DON!!',
        type: 'DON!!',
      }),
      'don-2',
    );
    host.addDonToCost('p1', 2, true);

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: chaka.instanceId,
      sourceCardId: chaka.cardId,
    });

    const optionalDecision = engine.getPendingDecision();

    expect(optionalDecision?.prompt.type).toBe('confirm');

    engine.answerDecision({
      decisionId: optionalDecision!.id,
      confirmed: true,
    });

    const targetDecision = engine.getPendingDecision();

    expect(targetDecision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: targetDecision!.id,
      selectedCardInstanceIds: [host.getPlayer('p1')!.zones.leader.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.cost).toHaveLength(0);
    expect(host.getPlayer('p1')?.zones.leader.attachedDon).toBe(2);
  });

  it('unrests Pica at the end of your turn and replaces its KO by resting another cost 3 or more character', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const pica = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-032',
        number: 'OP05-032',
        name: 'Pica',
        type: 'Character',
      }),
      'pica',
    );
    pica.rested = true;
    const ally = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP99-C3',
        number: 'OP99-C3',
        name: 'Cost Three Ally',
        type: 'Character',
        cost: 3,
      }),
      'cost-three-ally',
    );
    host.addCardToZone(
      'p1',
      'donDeck',
      makeCard({
        id: 'DON-003',
        number: 'DON-003',
        name: 'DON!!',
        type: 'DON!!',
      }),
      'don-3',
    );
    host.addDonToCost('p1', 1, true);

    engine.handleEvent({
      type: 'onTurnEnd',
      playerSessionId: 'p1',
      sourceInstanceId: pica.instanceId,
      sourceCardId: pica.cardId,
    });

    const optionalDecision = engine.getPendingDecision();

    expect(optionalDecision?.prompt.type).toBe('confirm');

    engine.answerDecision({
      decisionId: optionalDecision!.id,
      confirmed: true,
    });

    expect(pica.rested).toBe(false);
    expect(host.getPlayer('p1')?.zones.cost).toHaveLength(0);

    const replaced = engine.applyReplacement({
      type: 'wouldKoCharacter',
      playerSessionId: 'p1',
      sourceInstanceId: pica.instanceId,
      reason: 'effect',
    });

    expect(replaced).toBe(true);
    expect(ally.rested).toBe(true);
  });

  it('lets Enel add the top deck card to life and trash a hand card when your life reaches 0 on the opponent turn', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    host.state.activePlayerSessionId = 'p2';
    const engine = new EffectEngine(createRegistry(), host);

    const enel = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-098',
        number: 'OP05-098',
        name: 'Enel',
        type: 'Character',
      }),
      'enel',
    );
    const lifeTop = host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'OP99-L1',
        number: 'OP99-L1',
        name: 'Life Top',
        type: 'Character',
      }),
      'life-top',
    );
    const handCard = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OP99-H1',
        number: 'OP99-H1',
        name: 'Hand Card',
        type: 'Character',
      }),
      'hand-card',
    );

    engine.handleEvent({
      type: 'onLifeDamageDealt',
      playerSessionId: 'p1',
      sourceInstanceId: enel.instanceId,
      sourceCardId: enel.cardId,
    });

    expect(host.getPlayer('p1')?.zones.life.at(0)?.instanceId).toBe(
      lifeTop.instanceId,
    );
    expect(host.getPlayer('p1')?.zones.hand).not.toContain(handCard);
    expect(host.getPlayer('p1')?.zones.trash).toContain(handCard);
  });

  it('gives Lieutenant Spacey +2000 power when a card is added from your life during your turn', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const spacey = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-107',
        number: 'OP05-107',
        name: 'Lieutenant Spacey',
        type: 'Character',
      }),
      'spacey',
    );

    engine.handleEvent({
      type: 'onLifeDamageDealt',
      playerSessionId: 'p1',
      sourceInstanceId: spacey.instanceId,
      sourceCardId: spacey.cardId,
    });

    expect(spacey.power).toBe(3000);
  });

  it('gives El Thor +2000 power twice on counter when the opponent has 2 or fewer life cards', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op05EffectDefinitions]),
      host,
    );

    const elThor = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OP05-114',
        number: 'OP05-114',
        name: 'El Thor',
        type: 'Event',
      }),
      'el-thor',
    );
    host.getPlayer('p2')!.zones.life.pop();
    host.getPlayer('p2')!.zones.life.pop();
    host.getPlayer('p2')!.zones.life.pop();
    const target = host.getPlayer('p1')!.zones.leader;

    engine.handleEvent({
      type: 'activateCounter',
      playerSessionId: 'p1',
      sourceInstanceId: elThor.instanceId,
      sourceCardId: elThor.cardId,
    });

    const decision = engine.getPendingDecision();

    expect(decision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(target.power).toBe(9000);
  });

  it('lets Monkey.D.Luffy 060 move the top life card to hand and add a DON!! when the field has 3 DON!! cards', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op05EffectDefinitions]),
      host,
    );

    const luffy = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-060',
        number: 'OP05-060',
        name: 'Monkey.D.Luffy',
        type: 'Character',
      }),
      'luffy',
    );
    const lifeTop = host.addCardToZone(
      'p1',
      'life',
      makeCard({
        id: 'OP99-L1',
        number: 'OP99-L1',
        name: 'Life Top',
        type: 'Character',
      }),
      'life-top',
    );
    host.addCardToZone(
      'p1',
      'donDeck',
      makeCard({
        id: 'DON-001',
        number: 'DON-001',
        name: 'DON!!',
        type: 'DON!!',
        cost: null,
        power: null,
        counter: null,
      }),
      'don-1',
    );
    for (let index = 0; index < 3; index += 1) {
      host.addCardToZone(
        'p1',
        'cost',
        makeCard({
          id: `DON-C${index}`,
          number: `DON-C${index}`,
          name: `DON Cost ${index}`,
          type: 'DON!!',
          cost: null,
          power: null,
          counter: null,
        }),
        `don-cost-${index}`,
      );
    }

    engine.handleEvent({
      type: 'activateMain',
      playerSessionId: 'p1',
      sourceInstanceId: luffy.instanceId,
      sourceCardId: luffy.cardId,
    });

    const optionalDecision = engine.getPendingDecision();

    expect(optionalDecision?.prompt.type).toBe('confirm');

    engine.answerDecision({
      decisionId: optionalDecision!.id,
      confirmed: true,
    });

    expect(host.getPlayer('p1')?.zones.hand).toContain(lifeTop);
    expect(host.getPlayer('p1')?.zones.cost).toHaveLength(4);
    expect(host.getPlayer('p1')?.zones.cost.at(-1)?.instanceId).toBeDefined();
  });

  it('lets Bartholomew Kuma K.O. a low-power character when the leader is multicolored', () => {
    const host = new TestHost();
    host.addPlayer('p1', {
      colors: ['Red', 'Blue'],
      name: 'Multicolor Leader',
    });
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op05EffectDefinitions]),
      host,
    );

    const kuma = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-011',
        number: 'OP05-011',
        name: 'Bartholomew Kuma',
        type: 'Character',
      }),
      'kuma',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-P2',
        number: 'OP99-P2',
        name: 'Low Power Target',
        type: 'Character',
        power: 2000,
      }),
      'target',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: kuma.instanceId,
      sourceCardId: kuma.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(host.getPlayer('p2')?.zones.characters).not.toContain(target);
    expect(host.getPlayer('p2')?.zones.trash).toContain(target);
  });

  it('lets Bartholomew Kuma play itself from trigger when the leader is multicolored', () => {
    const host = new TestHost();
    host.addPlayer('p1', {
      colors: ['Red', 'Blue'],
      name: 'Multicolor Leader',
    });
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op05EffectDefinitions]),
      host,
    );

    const kuma = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP05-011',
        number: 'OP05-011',
        name: 'Bartholomew Kuma',
        type: 'Character',
      }),
      'kuma',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: kuma.instanceId,
      sourceCardId: kuma.cardId,
    });

    expect(host.getPlayer('p1')?.zones.characters).toContain(kuma);
    expect(host.getPlayer('p1')?.zones.trash).not.toContain(kuma);
  });

  it('prevents blocker activation during battle when Morley attacks with 7000 power or more', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op05EffectDefinitions]),
      host,
    );

    const morley = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-016',
        number: 'OP05-016',
        name: 'Morley',
        type: 'Character',
        power: 7000,
      }),
      'morley',
    );
    const blocker = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-B1',
        number: 'OP99-B1',
        name: 'Blocker Target',
        type: 'Character',
      }),
      'blocker',
    );

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: morley.instanceId,
      sourceCardId: morley.cardId,
    });

    expect(blocker.cannotBlock).toBe(true);
  });

  it('lets Morley play itself from trigger when the leader is multicolored', () => {
    const host = new TestHost();
    host.addPlayer('p1', {
      colors: ['Red', 'Blue'],
      name: 'Multicolor Leader',
    });
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op05EffectDefinitions]),
      host,
    );

    const morley = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP05-016',
        number: 'OP05-016',
        name: 'Morley',
        type: 'Character',
      }),
      'morley',
    );
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OP99-H1',
        number: 'OP99-H1',
        name: 'Hand Card',
        type: 'Character',
      }),
      'hand-card',
    );

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: morley.instanceId,
      sourceCardId: morley.cardId,
    });

    const decision = engine.getPendingDecision();

    expect(decision?.prompt.type).toBe('confirm');

    engine.answerDecision({
      decisionId: decision!.id,
      confirmed: true,
    });

    expect(host.getPlayer('p1')?.zones.characters).toContain(morley);
    expect(host.getPlayer('p1')?.zones.trash).not.toContain(morley);
  });

  it('lets Kotori KO an opponent character when Hotori is on the field', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP99-HOT',
        number: 'OP99-HOT',
        name: 'Hotori',
        type: 'Character',
      }),
      'hotori',
    );
    const kotori = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-103',
        number: 'OP05-103',
        name: 'Kotori',
        type: 'Character',
      }),
      'kotori',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-T1',
        number: 'OP99-T1',
        name: 'Target',
        type: 'Character',
        cost: 3,
      }),
      'target',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: kotori.instanceId,
      sourceCardId: kotori.cardId,
    });

    const decision = engine.getPendingDecision();
    expect(decision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(host.getPlayer('p2')?.zones.characters).not.toContain(target);
    expect(host.getPlayer('p2')?.zones.trash).toContain(target);
  });

  it('gives Bepo -2000 power to an opponent character when the opponent has more DON!! on the field', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op05EffectDefinitions]),
      host,
    );

    const bepo = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-071',
        number: 'OP05-071',
        name: 'Bepo',
        type: 'Character',
      }),
      'bepo',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-T2',
        number: 'OP99-T2',
        name: 'Opponent Target',
        type: 'Character',
      }),
      'target',
    );
    for (let index = 0; index < 2; index += 1) {
      host.addCardToZone(
        'p1',
        'cost',
        makeCard({
          id: `DON-P${index}`,
          number: `DON-P${index}`,
          name: `P DON ${index}`,
          type: 'DON!!',
          cost: null,
          power: null,
          counter: null,
        }),
        `don-p-${index}`,
      );
    }
    for (let index = 0; index < 3; index += 1) {
      host.addCardToZone(
        'p2',
        'cost',
        makeCard({
          id: `DON-O${index}`,
          number: `DON-O${index}`,
          name: `O DON ${index}`,
          type: 'DON!!',
          cost: null,
          power: null,
          counter: null,
        }),
        `don-o-${index}`,
      );
    }

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: bepo.instanceId,
      sourceCardId: bepo.cardId,
    });

    const decision = engine.getPendingDecision();

    expect(decision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(target.power).toBe(-1000);
  });

  it('reduces the play cost of Celestial Dragons characters on your turn with Mary Geoise', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const maryGeoise = createDuelCard(
      makeCard({
        id: 'OP05-097',
        number: 'OP05-097',
        name: 'Mary Geoise',
        type: 'Stage',
      }),
      'p1:mary-geoise',
      'p1',
    );
    host.getPlayer('p1')!.zones.stage = maryGeoise;
    const celestial = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OP99-CD',
        number: 'OP99-CD',
        name: 'Celestial Character',
        type: 'Character',
        cost: 3,
        families: ['Celestial Dragons'],
      }),
      'celestial',
    );

    host.state.activePlayerSessionId = 'p1';
    engine.reapplyContinuousEffects();

    expect(maryGeoise.instanceId).toBeDefined();
    expect(celestial.cost).toBe(2);
  });

  it('grants the basic Blocker keyword to Kuween, Maynard, and Yama', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const kuween = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-024',
        number: 'OP05-024',
        name: 'Kuween',
        type: 'Character',
      }),
      'kuween',
    );
    const maynard = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-052',
        number: 'OP05-052',
        name: 'Maynard',
        type: 'Character',
      }),
      'maynard',
    );
    const yama = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-113',
        number: 'OP05-113',
        name: 'Yama',
        type: 'Character',
      }),
      'yama',
    );

    engine.reapplyContinuousEffects();

    expect(kuween.mustBeAttackTarget).toBe(true);
    expect(maynard.mustBeAttackTarget).toBe(true);
    expect(yama.mustBeAttackTarget).toBe(true);
  });

  it('grants Blocker to O-Nami when you have 10 DON!! on the field', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const onami = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-062',
        number: 'OP05-062',
        name: 'O-Nami',
        type: 'Character',
      }),
      'onami',
    );
    for (let index = 0; index < 10; index += 1) {
      host.addCardToZone(
        'p1',
        'cost',
        makeCard({
          id: `DON-O${index}`,
          number: `DON-O${index}`,
          name: `DON O ${index}`,
          type: 'DON!!',
          cost: null,
          power: null,
          counter: null,
        }),
        `don-o-${index}`,
      );
    }

    engine.reapplyContinuousEffects();

    expect(onami.mustBeAttackTarget).toBe(true);
  });

  it('grants Blocker to Nefeltari Vivi when you have 10 or more cards in trash', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const vivi = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-086',
        number: 'OP05-086',
        name: 'Nefeltari Vivi',
        type: 'Character',
      }),
      'vivi',
    );
    for (let index = 0; index < 10; index += 1) {
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

    engine.reapplyContinuousEffects();

    expect(vivi.mustBeAttackTarget).toBe(true);
  });

  it('registers El Thor as standard counter and trigger effects', () => {
    const card = op05EffectDefinitions.cards.find(
      (entry) => entry.cardId === 'OP05-114',
    );
    expect(card).toBeDefined();
    const effectIds = card?.effects
      ?.filter((entry) => entry.kind === 'standard')
      .map((entry) => (entry.kind === 'standard' ? entry.effect.id : null));
    expect(effectIds).toEqual(
      expect.arrayContaining([
        'el-thor-counter-dynamic-power',
        'el-thor-trigger-ko-cost-equal-to-opponent-life',
      ]),
    );
  });

  it("lets Gedatsu K.O. an opposing character with cost at most the opponent's life count", () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op05EffectDefinitions]),
      host,
    );

    const gedatsu = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-102',
        number: 'OP05-102',
        name: 'Gedatsu',
        type: 'Character',
      }),
      'gedatsu',
    );
    for (let index = 0; index < 3; index += 1) {
      host.addCardToZone(
        'p2',
        'life',
        makeCard({
          id: `OP99-L${index}`,
          number: `OP99-L${index}`,
          name: `Life ${index}`,
          type: 'Character',
        }),
        `life-${index}`,
      );
    }
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'OP99-C3',
        number: 'OP99-C3',
        name: 'Cost Three Target',
        type: 'Character',
        cost: 3,
      }),
      'target',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: gedatsu.instanceId,
      sourceCardId: gedatsu.cardId,
    });

    const decision = engine.getPendingDecision();

    expect(decision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: decision!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(host.getPlayer('p2')?.zones.characters).not.toContain(target);
    expect(host.getPlayer('p2')?.zones.trash).toContain(target);
  });

  it('trashes Rosinante instead of a rested Character being KOed', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    host.state.activePlayerSessionId = 'p2';
    const engine = new EffectEngine(createRegistry(), host);

    const rosinante = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-030',
        number: 'OP05-030',
        name: 'Donquixote Rosinante',
        type: 'Character',
      }),
      'rosinante',
    );
    rosinante.rested = true;

    const replaced = engine.applyReplacement({
      type: 'wouldKoCharacter',
      playerSessionId: 'p1',
      sourceInstanceId: rosinante.instanceId,
      reason: 'battle',
    });

    expect(replaced).toBe(true);
    expect(
      host
        .getPlayer('p1')
        ?.zones.characters.find(
          (card) => card.instanceId === rosinante.instanceId,
        ),
    ).toBeUndefined();
    expect(
      host
        .getPlayer('p1')
        ?.zones.trash.find((card) => card.instanceId === rosinante.instanceId),
    ).toBeDefined();
  });

  it("raises Sabo to 6000 power instead of letting it be KOed while it has DON!! x1 on the opponent's turn", () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    host.state.activePlayerSessionId = 'p2';
    const engine = new EffectEngine(createRegistry(), host);

    const sabo = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-001',
        number: 'OP05-001',
        name: 'Sabo',
        type: 'Character',
        power: 5000,
      }),
      'sabo',
    );
    sabo.attachedDon = 1;

    const replaced = engine.applyReplacement({
      type: 'wouldKoCharacter',
      playerSessionId: 'p1',
      sourceInstanceId: sabo.instanceId,
      reason: 'battle',
    });

    expect(replaced).toBe(true);
    expect(sabo.power).toBe(6000);
  });

  it('does not replace Enel leaving the field when a Monkey.D.Luffy character is present', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

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
    host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP99-LUFFY',
        number: 'OP99-LUFFY',
        name: 'Monkey.D.Luffy',
        type: 'Character',
      }),
      'luffy',
    );
    host.addCardToZone(
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

    expect(replaced).toBe(false);
    expect(host.getPlayer('p1')?.zones.characters).toContain(enel);
    expect(host.getPlayer('p1')?.zones.life).toHaveLength(1);
  });

  it('lets Monkey.D.Luffy bottom deck its other characters and flag an extra turn when played with 10 DON!!', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(
      createRegistry([op05EffectDefinitions], [op05119SpecialHandler]),
      host,
    );

    const luffy = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-119',
        number: 'OP05-119',
        name: 'Monkey.D.Luffy',
        type: 'Character',
      }),
      'luffy',
    );
    const source = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP99-SRC',
        number: 'OP99-SRC',
        name: 'Source',
        type: 'Character',
      }),
      'source',
    );
    const ally = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP99-ALLY',
        number: 'OP99-ALLY',
        name: 'Ally',
        type: 'Character',
      }),
      'ally',
    );

    for (let index = 0; index < 10; index += 1) {
      host.addCardToZone(
        'p1',
        'cost',
        makeCard({
          id: `DON-L${index}`,
          number: `DON-L${index}`,
          name: `DON ${index}`,
          type: 'DON!!',
          cost: null,
          power: null,
          counter: null,
        }),
        `don-${index}`,
      );
    }

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: luffy.instanceId,
      sourceCardId: luffy.cardId,
    });

    expect(host.getPlayer('p1')?.zones.cost).toHaveLength(0);
    expect(host.getPlayer('p1')?.zones.characters).toContain(luffy);
    expect(host.getPlayer('p1')?.zones.characters).not.toContain(source);
    expect(host.getPlayer('p1')?.zones.deck.at(-1)?.instanceId).toBe(
      ally.instanceId,
    );
    expect(host.state.pendingExtraTurnSessionId).toBe('p1');
    expect(host.getPlayer('p1')?.zones.characters).not.toContain(ally);
  });

  it('lets Sarquiss rest another character to restand itself and Hakuba KO a different allied character for -5 cost', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const sarquiss = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP05-026',
        number: 'OP05-026',
        name: 'Sarquiss',
        type: 'Character',
      }),
      'sarquiss',
    );
    sarquiss.attachedDon = 1;
    const costThree = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP99-C3',
        number: 'OP99-C3',
        name: 'Cost Three Ally',
        type: 'Character',
        cost: 3,
      }),
      'cost-three',
    );

    engine.handleEvent({
      type: 'whenAttacking',
      playerSessionId: 'p1',
      sourceInstanceId: sarquiss.instanceId,
      sourceCardId: sarquiss.cardId,
    });

    const sarquissConfirm = engine.getPendingDecision();

    expect(sarquissConfirm?.prompt.type).toBe('confirm');

    engine.answerDecision({
      decisionId: sarquissConfirm!.id,
      confirmed: true,
    });

    expect(sarquiss.rested).toBe(false);
  });
});
