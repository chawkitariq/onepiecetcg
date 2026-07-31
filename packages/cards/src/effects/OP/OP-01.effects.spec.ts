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
import { op01EffectDefinitions } from './OP-01.effects';

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

describe('op01EffectDefinitions', () => {
  describe('OP01-015 tony-tony-chopper-when-attacking-trash-1-recover-straw-hat', () => {
    it('trashes 1 hand card to recover up to 1 other Straw Hat Crew cost 4 or less from trash', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const chopper = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-015',
          number: 'OP01-015',
          name: 'Tony Tony.Chopper',
          type: 'Character',
          families: ['Straw Hat Crew'],
        }),
        'chopper',
      );
      chopper.attachedDon = 1;
      const handFodder = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'CHOPPER-HAND-FODDER',
          number: 'CHOPPER-HAND-FODDER',
          name: 'Hand Fodder',
          type: 'Character',
        }),
        'chopper-hand-fodder',
      );
      const validTarget = host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'STRAW-HAT-TARGET',
          number: 'STRAW-HAT-TARGET',
          name: 'Recovered Ally',
          type: 'Character',
          cost: 4,
          families: ['Straw Hat Crew'],
        }),
        'straw-hat-target',
      );
      host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'TONY-TONY-TRASH',
          number: 'TONY-TONY-TRASH',
          name: 'Tony Tony.Chopper',
          type: 'Character',
          cost: 2,
          families: ['Straw Hat Crew'],
        }),
        'tony-tony-trash',
      );
      host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'EXPENSIVE-STRAW-HAT',
          number: 'EXPENSIVE-STRAW-HAT',
          name: 'Expensive Ally',
          type: 'Character',
          cost: 5,
          families: ['Straw Hat Crew'],
        }),
        'expensive-straw-hat',
      );

      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: chopper.instanceId,
        sourceCardId: chopper.cardId,
      });

      let decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        confirmed: true,
      });

      decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      expect(decision?.prompt.selector.filter).toMatchObject({
        trait: ['Straw Hat Crew'],
        costMax: 4,
        excludeName: ['Tony Tony.Chopper'],
      });
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        selectedCardInstanceIds: [validTarget.instanceId],
      });

      expect(host.getPlayer('p1')?.zones.hand).toContain(validTarget);
      expect(host.getPlayer('p1')?.zones.hand).not.toContain(handFodder);
      expect(host.getPlayer('p1')?.zones.trash[0]).toBe(handFodder);
    });
  });

  describe('OP01-051 Eustass\"Captain\"Kid', () => {
    it('rests itself to play up to 1 cost 3 or less character from hand', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 2;
      const engine = new EffectEngine(createRegistry(), host);
      const kid = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-051',
          number: 'OP01-051',
          name: 'Eustass"Captain"Kid',
          type: 'Character',
        }),
        'kid',
      );
      const cheapCharacter = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'KID-CHEAP-CHARACTER',
          number: 'KID-CHEAP-CHARACTER',
          name: 'Cheap Character',
          type: 'Character',
          cost: 3,
        }),
        'kid-cheap-character',
      );
      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'KID-EXPENSIVE-CHARACTER',
          number: 'KID-EXPENSIVE-CHARACTER',
          name: 'Expensive Character',
          type: 'Character',
          cost: 4,
        }),
        'kid-expensive-character',
      );

      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: kid.instanceId,
        sourceCardId: kid.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectCards');
      expect(decision?.prompt.selector.filter).toMatchObject({
        cardCategory: ['Character'],
        costMax: 3,
      });
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        selectedCardInstanceIds: [cheapCharacter.instanceId],
      });

      expect(kid.rested).toBe(true);
      expect(host.getPlayer('p1')?.zones.characters).toContain(cheapCharacter);
      expect(host.getPlayer('p1')?.zones.hand).not.toContain(cheapCharacter);
    });

    it('marks the source as the forced attack target only on the opponent turn when rested with DON attached', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const kid = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-051',
          number: 'OP01-051',
          name: 'Eustass"Captain"Kid',
          type: 'Character',
        }),
        'kid-forced-target',
      );

      kid.attachedDon = 1;
      kid.rested = true;
      host.state.activePlayerSessionId = 'p2';
      engine.reapplyContinuousEffects();
      expect(kid.mustBeAttackTarget).toBe(true);

      host.state.activePlayerSessionId = 'p1';
      engine.reapplyContinuousEffects();
      expect(kid.mustBeAttackTarget).toBe(false);

      host.state.activePlayerSessionId = 'p2';
      kid.attachedDon = 0;
      engine.reapplyContinuousEffects();
      expect(kid.mustBeAttackTarget).toBe(false);
    });
  });

  describe('OP01-055 you-can-be-my-samurai-main-rest-2-draw-2', () => {
    it('rests exactly 2 of your characters to draw 2 cards', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const eventCard = host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'OP01-055',
          number: 'OP01-055',
          name: 'You Can Be My Samurai!!',
          type: 'Event',
        }),
        'you-can-be-my-samurai',
      );
      const firstCharacter = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'SAMURAI-1',
          number: 'SAMURAI-1',
          name: 'Samurai 1',
          type: 'Character',
        }),
        'samurai-1',
      );
      const secondCharacter = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'SAMURAI-2',
          number: 'SAMURAI-2',
          name: 'Samurai 2',
          type: 'Character',
        }),
        'samurai-2',
      );
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'SAMURAI-DRAW-1',
          number: 'SAMURAI-DRAW-1',
          name: 'Samurai Draw 1',
          type: 'Character',
        }),
        'samurai-draw-1',
      );
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'SAMURAI-DRAW-2',
          number: 'SAMURAI-DRAW-2',
          name: 'Samurai Draw 2',
          type: 'Character',
        }),
        'samurai-draw-2',
      );

      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: eventCard.instanceId,
        sourceCardId: eventCard.cardId,
      });

      expect(firstCharacter.rested).toBe(true);
      expect(secondCharacter.rested).toBe(true);
      expect(host.getPlayer('p1')?.zones.hand).toHaveLength(2);
    });
  });

  describe('OP01-106 Basil Hawkins', () => {
    it('adds a rested DON on play and can play itself from trigger', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const basil = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-106',
          number: 'OP01-106',
          name: 'Basil Hawkins',
          type: 'Character',
        }),
        'basil-played',
      );
      host.addCardToZone(
        'p1',
        'donDeck',
        makeCard({
          id: 'BASIL-DON',
          number: 'BASIL-DON',
          name: 'DON!!',
          type: 'DON!!',
          cost: 0,
          power: 0,
        }),
        'basil-don',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: basil.instanceId,
        sourceCardId: basil.cardId,
      });

      expect(host.getPlayer('p1')?.zones.cost).toHaveLength(1);
      expect(host.getPlayer('p1')?.zones.cost[0]?.rested).toBe(true);

      const triggerBasil = host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'OP01-106',
          number: 'OP01-106',
          name: 'Basil Hawkins',
          type: 'Character',
        }),
        'basil-trigger',
      );

      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: triggerBasil.instanceId,
        sourceCardId: triggerBasil.cardId,
      });

      expect(host.getPlayer('p1')?.zones.characters).toContain(triggerBasil);
      expect(host.getPlayer('p1')?.zones.trash).not.toContain(triggerBasil);
    });
  });

  describe('OP01-121 yamato-has-double-attack-and-banish', () => {
    it('grants both Double Attack and Banish continuously to Yamato', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const yamato = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-121',
          number: 'OP01-121',
          name: 'Yamato',
          type: 'Character',
        }),
        'yamato',
      );

      engine.reapplyContinuousEffects();

      expect(yamato.hasDoubleAttack).toBe(true);
      expect(yamato.hasBanish).toBe(true);
    });
  });

  describe('OP01-117 sheeps-horn-main-don-minus-1-rest-cost-6-or-less', () => {
    it('spends 1 DON to rest up to 1 opponent character with cost 6 or less', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const eventCard = host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'OP01-117',
          number: 'OP01-117',
          name: "Sheep's Horn",
          type: 'Event',
        }),
        'sheeps-horn',
      );
      host.addCardToZone(
        'p1',
        'cost',
        makeCard({
          id: 'SHEEP-DON',
          number: 'SHEEP-DON',
          name: 'DON!!',
          type: 'DON!!',
          cost: 0,
          power: 0,
        }),
        'sheep-don',
      );
      const opponentCharacter = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'SHEEP-TARGET',
          number: 'SHEEP-TARGET',
          name: 'Sheep Target',
          type: 'Character',
          cost: 6,
        }),
        'sheep-target',
      );

      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: eventCard.instanceId,
        sourceCardId: eventCard.cardId,
      });

      expect(host.getPlayer('p1')?.zones.cost).toHaveLength(0);
      expect(opponentCharacter.rested).toBe(true);
    });
  });

  describe('OP01-039 killer-on-block-draw-1', () => {
    it('draws 1 on block only when you have DON attached and at least 3 characters', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const killer = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-039',
          number: 'OP01-039',
          name: 'Killer',
          type: 'Character',
        }),
        'killer',
      );
      killer.attachedDon = 1;
      host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'KILLER-ALLY-1',
          number: 'KILLER-ALLY-1',
          name: 'Killer Ally 1',
          type: 'Character',
        }),
        'killer-ally-1',
      );
      host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'KILLER-ALLY-2',
          number: 'KILLER-ALLY-2',
          name: 'Killer Ally 2',
          type: 'Character',
        }),
        'killer-ally-2',
      );
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'KILLER-DRAW',
          number: 'KILLER-DRAW',
          name: 'Killer Draw',
          type: 'Character',
        }),
        'killer-draw',
      );

      engine.handleEvent({
        type: 'onBlock',
        playerSessionId: 'p1',
        sourceInstanceId: killer.instanceId,
        sourceCardId: killer.cardId,
      });

      expect(host.getPlayer('p1')?.zones.hand).toHaveLength(1);
    });
  });

  describe('OP01-006 otama-on-play', () => {
    it('gives up to 1 opponent character -2000 power during this turn', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);

      const otama = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-006',
          number: 'OP01-006',
          name: 'Otama',
          type: 'Character',
          power: 2000,
        }),
        'otama',
      );
      const target = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'TEST-ENEMY',
          number: 'TEST-ENEMY',
          name: 'Enemy',
          type: 'Character',
          power: 5000,
        }),
        'enemy',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: otama.instanceId,
        sourceCardId: otama.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(target.power).toBe(3000);
    });
  });

  describe('OP01-011 gordon-on-play-bottom-deck-1-draw-1', () => {
    it('does not retrigger when another on-play character enters play', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);

      host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-011',
          number: 'OP01-011',
          name: 'Gordon',
          type: 'Character',
          power: 3000,
        }),
        'gordon',
      );
      const izo = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-033',
          number: 'OP01-033',
          name: 'Izo',
          type: 'Character',
          power: 3000,
        }),
        'izo',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: izo.instanceId,
        sourceCardId: izo.cardId,
      });

      expect(engine.getPendingDecision()).toBeNull();
    });

    it('does not retrigger another on-play character already in play when Gordon is played', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);

      host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-033',
          number: 'OP01-033',
          name: 'Izo',
          type: 'Character',
          power: 3000,
        }),
        'izo',
      );
      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'HAND-FODDER',
          number: 'HAND-FODDER',
          name: 'Hand Fodder',
          type: 'Character',
          power: 1000,
        }),
        'hand-fodder',
      );
      const enemy = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'ENEMY-REST-TARGET',
          number: 'ENEMY-REST-TARGET',
          name: 'Enemy Rest Target',
          type: 'Character',
          power: 4000,
        }),
        'enemy-rest-target',
      );

      const gordon = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-011',
          number: 'OP01-011',
          name: 'Gordon',
          type: 'Character',
          power: 3000,
        }),
        'gordon',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: gordon.instanceId,
        sourceCardId: gordon.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision?.effectId).toBe('gordon-on-play-bottom-deck-1-draw-1');
      expect(decision?.sourceInstanceId).toBe(gordon.instanceId);

      engine.answerDecision({
        decisionId: decision?.id ?? '',
        confirmed: true,
        selectedCardInstanceIds: ['p1:hand-fodder'],
      });

      expect(enemy.rested).toBe(false);
      expect(engine.getPendingDecision()).toBeNull();
    });
  });

  describe('OP01-024 Monkey.D.Luffy', () => {
    it('attaches up to 2 rested DON to this character on activate main', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const luffy = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-024',
          number: 'OP01-024',
          name: 'Monkey.D.Luffy',
          type: 'Character',
        }),
        'luffy-rested-don',
      );
      const restedDonA = host.addCardToZone(
        'p1',
        'cost',
        makeCard({
          id: 'DON-A',
          number: 'DON-A',
          name: 'DON!!',
          type: 'DON!!',
          cost: 0,
          power: 0,
        }),
        'don-a',
      );
      const restedDonB = host.addCardToZone(
        'p1',
        'cost',
        makeCard({
          id: 'DON-B',
          number: 'DON-B',
          name: 'DON!!',
          type: 'DON!!',
          cost: 0,
          power: 0,
        }),
        'don-b',
      );
      restedDonA.rested = true;
      restedDonB.rested = true;

      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: luffy.instanceId,
        sourceCardId: luffy.cardId,
      });

      expect(luffy.attachedDon).toBe(2);
      expect(host.getPlayer('p1')?.zones.cost).toHaveLength(0);
    });
  });

  describe('OP01-025 zoro-plus-1000-during-your-turn', () => {
    it('recomputes continuous power bonuses without mutating printed power', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);

      const zoro = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-025',
          number: 'OP01-025',
          name: 'Roronoa Zoro',
          type: 'Character',
          power: 5000,
        }),
        'zoro',
      );

      engine.reapplyContinuousEffects();
      expect(zoro.basePower).toBe(5000);
      expect(zoro.power).toBe(6000);

      host.state.activePlayerSessionId = 'p2';
      engine.reapplyContinuousEffects();
      expect(zoro.power).toBe(5000);
    });
  });

  describe('OP01-047 trafalgar-law-on-play-return-1-character-play-cost-5-or-less', () => {
    it('runs as a two-step decision flow', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);

      const law = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-047',
          number: 'OP01-047',
          name: 'Trafalgar Law',
          type: 'Character',
          power: 5000,
        }),
        'law',
      );
      const returnTarget = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ALLY-001',
          number: 'ALLY-001',
          name: 'Ally',
          type: 'Character',
          power: 3000,
        }),
        'ally',
      );
      const handTarget = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'HAND-001',
          number: 'HAND-001',
          name: 'Cheap Character',
          type: 'Character',
          power: 4000,
          cost: 4,
        }),
        'cheap',
      );
      host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'HAND-002',
          number: 'HAND-002',
          name: 'Other Character',
          type: 'Character',
          power: 3000,
          cost: 3,
        }),
        'other',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: law.instanceId,
        sourceCardId: law.cardId,
      });

      const firstDecision = engine.getPendingDecision();
      expect(firstDecision).not.toBeNull();
      engine.answerDecision({
        decisionId: firstDecision?.id ?? '',
        selectedCardInstanceIds: [returnTarget.instanceId],
      });

      const secondDecision = engine.getPendingDecision();
      expect(secondDecision).not.toBeNull();
      engine.answerDecision({
        decisionId: secondDecision?.id ?? '',
        selectedCardInstanceIds: [handTarget.instanceId],
      });

      expect(host.getPlayer('p1')?.zones.hand).toContain(returnTarget);
      expect(host.getPlayer('p1')?.zones.characters).toContain(handTarget);
    });
  });

  describe('OP01-058 Punk Gibson', () => {
    it('applies counter-phase power bonuses until end of battle only', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const eventCard = host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'OP01-058',
          number: 'OP01-058',
          name: 'Punk Gibson',
          type: 'Event',
        }),
        'punk-gibson',
      );
      const enemy = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'ENEMY-REST',
          number: 'ENEMY-REST',
          name: 'Enemy',
          type: 'Character',
          cost: 4,
        }),
        'enemy',
      );

      engine.handleEvent({
        type: 'activateCounter',
        playerSessionId: 'p1',
        sourceInstanceId: eventCard.instanceId,
        sourceCardId: eventCard.cardId,
      });

      const firstDecision = engine.getPendingDecision();
      expect(firstDecision).not.toBeNull();
      engine.answerDecision({
        decisionId: firstDecision?.id ?? '',
        selectedCardInstanceIds: [
          host.getPlayer('p1')?.zones.leader.instanceId ?? '',
        ],
      });

      expect(host.getPlayer('p1')?.zones.leader.power).toBe(9000);
      expect(enemy.rested).toBe(true);

      engine.clearCombatModifiers();

      expect(host.getPlayer('p1')?.zones.leader.power).toBe(5000);
    });
  });

  describe('OP01-060 doflamingo-don-2-when-attacking-pay-1-reveal-top-and-play-warlord', () => {
    it('reveals the top deck card and can play it rested when it matches the declarative filter', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const doflamingo = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-060',
          number: 'OP01-060',
          name: 'Donquixote Doflamingo',
          type: 'Character',
        }),
        'doflamingo',
      );
      doflamingo.attachedDon = 2;
      host.addCardToZone(
        'p1',
        'cost',
        makeCard({
          id: 'DON-COST-DOFFY',
          number: 'DON-COST-DOFFY',
          name: 'DON!!',
          type: 'DON!!',
          cost: 0,
          power: 0,
        }),
        'doflamingo-cost',
      );
      const topDeckCard = host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'WARLORD-001',
          number: 'WARLORD-001',
          name: 'Warlord Character',
          type: 'Character',
          cost: 4,
          families: ['The Seven Warlords of the Sea'],
        }),
        'warlord-top',
      );

      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: doflamingo.instanceId,
        sourceCardId: doflamingo.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        confirmed: true,
      });

      expect(host.getPlayer('p1')?.zones.characters).toContain(topDeckCard);
      expect(topDeckCard.rested).toBe(true);
      expect(host.getPlayer('p1')?.zones.cost).toHaveLength(0);
    });
  });

  describe('OP01-067 Crocodile', () => {
    it('recomputes continuous hand cost reduction effects from in-play sources', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const crocodile = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-067',
          number: 'OP01-067',
          name: 'Crocodile',
          type: 'Character',
        }),
        'crocodile-cost',
      );
      crocodile.attachedDon = 1;
      const blueEvent = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'BLUE-EVENT',
          number: 'BLUE-EVENT',
          name: 'Blue Event',
          type: 'Event',
          colors: ['Blue'],
          cost: 2,
        }),
        'blue-event',
      );
      const redEvent = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'RED-EVENT',
          number: 'RED-EVENT',
          name: 'Red Event',
          type: 'Event',
          colors: ['Red'],
          cost: 2,
        }),
        'red-event',
      );

      engine.reapplyContinuousEffects();

      expect(blueEvent.cost).toBe(1);
      expect(redEvent.cost).toBe(2);
      expect(crocodile.hasBanish).toBe(true);
    });
  });

  describe('OP01-077 perona-on-play-arrange-top-5', () => {
    it('reorders a viewed deck window between the top and bottom in chosen order', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const perona = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-077',
          number: 'OP01-077',
          name: 'Perona',
          type: 'Character',
        }),
        'perona',
      );
      const top1 = host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'TOP-1',
          number: 'TOP-1',
          name: 'Top 1',
          type: 'Character',
        }),
        'top-1',
      );
      const top2 = host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'TOP-2',
          number: 'TOP-2',
          name: 'Top 2',
          type: 'Character',
        }),
        'top-2',
      );
      const top3 = host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'TOP-3',
          number: 'TOP-3',
          name: 'Top 3',
          type: 'Character',
        }),
        'top-3',
      );
      const top4 = host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'TOP-4',
          number: 'TOP-4',
          name: 'Top 4',
          type: 'Character',
        }),
        'top-4',
      );
      const top5 = host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'TOP-5',
          number: 'TOP-5',
          name: 'Top 5',
          type: 'Character',
        }),
        'top-5',
      );
      const nextTop = host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'TOP-6',
          number: 'TOP-6',
          name: 'Next Top',
          type: 'Character',
        }),
        'top-6',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: perona.instanceId,
        sourceCardId: perona.cardId,
      });

      let decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectChoice');
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        selectedChoiceIds: [top2.instanceId],
      });

      decision = engine.getPendingDecision();
      expect(decision?.prompt.type).toBe('selectChoice');
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        selectedChoiceIds: ['top'],
      });

      decision = engine.getPendingDecision();
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        selectedChoiceIds: [top5.instanceId],
      });

      decision = engine.getPendingDecision();
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        selectedChoiceIds: ['bottom'],
      });

      decision = engine.getPendingDecision();
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        selectedChoiceIds: [top1.instanceId],
      });

      decision = engine.getPendingDecision();
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        selectedChoiceIds: ['top'],
      });

      decision = engine.getPendingDecision();
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        selectedChoiceIds: [top4.instanceId],
      });

      decision = engine.getPendingDecision();
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        selectedChoiceIds: ['bottom'],
      });

      decision = engine.getPendingDecision();
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        selectedChoiceIds: [top3.instanceId],
      });

      decision = engine.getPendingDecision();
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        selectedChoiceIds: ['top'],
      });

      const deck = host.getPlayer('p1')?.zones.deck ?? [];
      expect(deck[0]).toBe(top2);
      expect(deck[1]).toBe(top1);
      expect(deck[2]).toBe(top3);
      expect(deck[3]).toBe(nextTop);
      expect(deck.at(-2)).toBe(top5);
      expect(deck.at(-1)).toBe(top4);
    });
  });

  describe('OP01-093 ulti-on-play-pay-1-add-rested-don', () => {
    it('pays the DON cost before adding a rested DON on play', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const ulti = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-093',
          number: 'OP01-093',
          name: 'Ulti',
          type: 'Character',
        }),
        'ulti',
      );
      host.addCardToZone(
        'p1',
        'cost',
        makeCard({
          id: 'DON-COST',
          number: 'DON-COST',
          name: 'DON!!',
          type: 'DON!!',
          cost: 0,
          power: 0,
        }),
        'cost-don',
      );
      host.addCardToZone(
        'p1',
        'donDeck',
        makeCard({
          id: 'DON-DECK',
          number: 'DON-DECK',
          name: 'DON!!',
          type: 'DON!!',
          cost: 0,
          power: 0,
        }),
        'don-deck-don',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: ulti.instanceId,
        sourceCardId: ulti.cardId,
      });

      expect(host.getPlayer('p1')?.zones.cost).toHaveLength(1);
      expect(host.getPlayer('p1')?.zones.cost[0]?.rested).toBe(true);
    });

    it('skips the effect when its DON cost cannot be paid', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const ulti = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-093',
          number: 'OP01-093',
          name: 'Ulti',
          type: 'Character',
        }),
        'ulti-no-cost',
      );
      host.addCardToZone(
        'p1',
        'donDeck',
        makeCard({
          id: 'DON-DECK-2',
          number: 'DON-DECK-2',
          name: 'DON!!',
          type: 'DON!!',
          cost: 0,
          power: 0,
        }),
        'don-deck-only',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: ulti.instanceId,
        sourceCardId: ulti.cardId,
      });

      expect(host.getPlayer('p1')?.zones.cost).toHaveLength(0);
    });
  });

  describe('OP01-114 x-drake-on-play-don-minus-1-opponent-trashes-1', () => {
    it('assigns the discard decision to the opponent when the effect makes them trash from hand', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const xDrake = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-114',
          number: 'OP01-114',
          name: 'X.Drake',
          type: 'Character',
        }),
        'x-drake',
      );
      host.addCardToZone(
        'p1',
        'cost',
        makeCard({
          id: 'DON-COST-1',
          number: 'DON-COST-1',
          name: 'DON!!',
          type: 'DON!!',
          cost: 0,
          power: 0,
        }),
        'don-cost-1',
      );
      const kept = host.addCardToZone(
        'p2',
        'hand',
        makeCard({
          id: 'P2-HAND-1',
          number: 'P2-HAND-1',
          name: 'Kept Card',
          type: 'Character',
        }),
        'kept',
      );
      const trashed = host.addCardToZone(
        'p2',
        'hand',
        makeCard({
          id: 'P2-HAND-2',
          number: 'P2-HAND-2',
          name: 'Trashed Card',
          type: 'Character',
        }),
        'trashed',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: xDrake.instanceId,
        sourceCardId: xDrake.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision?.playerSessionId).toBe('p2');
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        selectedCardInstanceIds: [trashed.instanceId],
      });

      expect(host.getPlayer('p2')?.zones.hand).toContain(kept);
      expect(host.getPlayer('p2')?.zones.hand).not.toContain(trashed);
      expect(host.getPlayer('p2')?.zones.trash[0]).toBe(trashed);
    });
  });

  describe('OP01-004 usopp-on-opponent-event-draw-1', () => {
    it('triggers an in-play reaction when the opponent activates an Event', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.activePlayerSessionId = 'p1';
      const engine = new EffectEngine(createRegistry(), host);
      const usopp = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-004',
          number: 'OP01-004',
          name: 'Usopp',
          type: 'Character',
        }),
        'usopp',
      );
      usopp.attachedDon = 1;
      const enemyEvent = host.addCardToZone(
        'p2',
        'trash',
        makeCard({
          id: 'EVENT-001',
          number: 'EVENT-001',
          name: 'Enemy Event',
          type: 'Event',
        }),
        'enemy-event',
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
        type: 'onEventActivated',
        playerSessionId: 'p2',
        sourceInstanceId: enemyEvent.instanceId,
        sourceCardId: enemyEvent.cardId,
      });

      expect(host.getPlayer('p1')?.zones.hand).toHaveLength(1);
    });
  });

  describe('OP01-061 kaido-on-opponent-ko-add-active-don', () => {
    it("triggers when the opponent's character is K.O.'d during your turn", () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.activePlayerSessionId = 'p1';
      const engine = new EffectEngine(createRegistry(), host);
      const kaido = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-061',
          number: 'OP01-061',
          name: 'Kaido',
          type: 'Character',
        }),
        'kaido',
      );
      kaido.attachedDon = 1;
      host.addCardToZone(
        'p1',
        'donDeck',
        makeCard({
          id: 'DON-DECK-KAIDO',
          number: 'DON-DECK-KAIDO',
          name: 'DON!!',
          type: 'DON!!',
          cost: 0,
          power: 0,
        }),
        'don-kaido',
      );
      const enemy = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'ENEMY-KO',
          number: 'ENEMY-KO',
          name: 'Enemy KO',
          type: 'Character',
        }),
        'enemy-ko',
      );

      engine.handleEvent({
        type: 'onKo',
        playerSessionId: 'p2',
        sourceInstanceId: enemy.instanceId,
        sourceCardId: enemy.cardId,
      });

      expect(host.getPlayer('p1')?.zones.cost).toHaveLength(1);
      expect(host.getPlayer('p1')?.zones.cost[0]?.rested).toBe(false);
    });
  });

  describe('OP01-062 crocodile-on-own-event-draw-1', () => {
    it('triggers a leader reaction when you activate an Event', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const leader = host.getPlayer('p1')!.zones.leader;
      leader.cardId = 'OP01-062';
      leader.number = 'OP01-062';
      leader.name = 'Crocodile';
      leader.type = 'Leader';
      leader.attachedDon = 1;
      const ownEvent = host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'EVENT-002',
          number: 'EVENT-002',
          name: 'Own Event',
          type: 'Event',
        }),
        'own-event',
      );
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'DRAW-002',
          number: 'DRAW-002',
          name: 'Leader Draw',
          type: 'Character',
        }),
        'leader-draw',
      );

      engine.handleEvent({
        type: 'onEventActivated',
        playerSessionId: 'p1',
        sourceInstanceId: ownEvent.instanceId,
        sourceCardId: ownEvent.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        confirmed: true,
      });

      expect(host.getPlayer('p1')?.zones.hand).toHaveLength(1);
    });
  });

  describe('OP01-086 overheat-trigger-bounce-cost-4-or-less', () => {
    it('moves a selected character to its owner hand with selectedCardOwner', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const overheat = host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'OP01-086',
          number: 'OP01-086',
          name: 'Overheat',
          type: 'Event',
        }),
        'overheat',
      );
      const enemy = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'ENEMY-001',
          number: 'ENEMY-001',
          name: 'Enemy',
          type: 'Character',
          cost: 3,
        }),
        'enemy',
      );

      engine.handleEvent({
        type: 'trigger',
        playerSessionId: 'p1',
        sourceInstanceId: overheat.instanceId,
        sourceCardId: overheat.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        selectedCardInstanceIds: [enemy.instanceId],
      });

      expect(host.getPlayer('p2')?.zones.hand).toContain(enemy);
      expect(host.getPlayer('p2')?.zones.characters).not.toContain(enemy);
    });
  });

  describe('OP01-097 queen-on-play-don-minus-1-rush-and-minus-2000', () => {
    it('grants temporary rush from Queen on play and clears it at end of turn', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const queen = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-097',
          number: 'OP01-097',
          name: 'Queen',
          type: 'Character',
        }),
        'queen',
      );
      host.addCardToZone(
        'p1',
        'cost',
        makeCard({
          id: 'DON-COST-QUEEN',
          number: 'DON-COST-QUEEN',
          name: 'DON!!',
          type: 'DON!!',
          cost: 0,
          power: 0,
        }),
        'don-queen',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: queen.instanceId,
        sourceCardId: queen.cardId,
      });

      expect(queen.hasRush).toBe(true);

      engine.clearTurnModifiers();

      expect(queen.hasRush).toBe(false);
    });
  });

  describe('OP01-098 kurozumi-orochi-on-play-search-smile', () => {
    it('shuffles the deck after a full-deck search effect', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const orochi = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-098',
          number: 'OP01-098',
          name: 'Kurozumi Orochi',
          type: 'Character',
        }),
        'orochi',
      );
      const top = host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'TOP',
          number: 'TOP',
          name: 'Top Card',
          type: 'Character',
        }),
        'top',
      );
      const smile = host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'SMILE',
          number: 'SMILE',
          name: 'Artificial Devil Fruit SMILE',
          type: 'Event',
        }),
        'smile',
      );
      const bottom = host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'BOTTOM',
          number: 'BOTTOM',
          name: 'Bottom Card',
          type: 'Character',
        }),
        'bottom',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: orochi.instanceId,
        sourceCardId: orochi.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        selectedCardInstanceIds: [smile.instanceId],
      });

      expect(host.getPlayer('p1')?.zones.hand).toContain(smile);
      expect(host.getPlayer('p1')?.zones.deck[0]).toBe(bottom);
      expect(host.getPlayer('p1')?.zones.deck[1]).toBe(top);
    });
  });

  describe('OP01-030 In Two Years!!', () => {
    it('returns unchosen searched cards to the bottom of the deck after adding up to 1 Straw Hat Crew character', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const eventCard = host.addCardToZone(
        'p1',
        'trash',
        makeCard({
          id: 'OP01-030',
          number: 'OP01-030',
          name: 'In Two Years!! At the Sabaody Archipelago!!',
          type: 'Event',
        }),
        'in-two-years',
      );
      const nonMatching1 = host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'TOP-1',
          number: 'TOP-1',
          name: 'Top 1',
          type: 'Character',
          families: ['Navy'],
        }),
        'top-1',
      );
      const matching = host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'TOP-2',
          number: 'TOP-2',
          name: 'Straw Hat Hit',
          type: 'Character',
          families: ['Straw Hat Crew'],
        }),
        'top-2',
      );
      const nonMatching2 = host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'TOP-3',
          number: 'TOP-3',
          name: 'Top 3',
          type: 'Character',
          families: ['Animal Kingdom Pirates'],
        }),
        'top-3',
      );
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'TOP-4',
          number: 'TOP-4',
          name: 'Top 4',
          type: 'Character',
        }),
        'top-4',
      );
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'TOP-5',
          number: 'TOP-5',
          name: 'Top 5',
          type: 'Character',
        }),
        'top-5',
      );
      const nextTop = host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'TOP-6',
          number: 'TOP-6',
          name: 'Next Top',
          type: 'Character',
        }),
        'top-6',
      );

      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: eventCard.instanceId,
        sourceCardId: eventCard.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        selectedCardInstanceIds: [matching.instanceId],
      });

      expect(host.getPlayer('p1')?.zones.hand).toContain(matching);
      expect(host.getPlayer('p1')?.zones.deck[0]).toBe(nextTop);
      expect(host.getPlayer('p1')?.zones.deck).toContain(nonMatching1);
      expect(host.getPlayer('p1')?.zones.deck).toContain(nonMatching2);
    });
  });

  describe('OP01-083 Mr.1 (Daz.Bonez)', () => {
    it('gains variable power from the counted Baroque Works event cards in trash', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const mr1 = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-083',
          number: 'OP01-083',
          name: 'Mr.1 (Daz.Bonez)',
          type: 'Character',
          power: 4000,
        }),
        'mr1',
      );
      mr1.attachedDon = 1;
      host.getPlayer('p1')!.zones.leader.families.push('Baroque Works');
      host.state.activePlayerSessionId = 'p1';

      for (let index = 0; index < 5; index += 1) {
        host.addCardToZone(
          'p1',
          'trash',
          makeCard({
            id: `EVENT-${index}`,
            number: `EVENT-${index}`,
            name: `Event ${index}`,
            type: 'Event',
          }),
          `event-${index}`,
        );
      }

      engine.reapplyContinuousEffects();

      expect(mr1.power).toBe(6000);
    });
  });

  describe('OP01-095 kyoshirou-on-play-draw-1-if-total-don-8-or-more', () => {
    it('counts attached and cost DON toward the total DON condition', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const kyoshirou = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-095',
          number: 'OP01-095',
          name: 'Kyoshirou',
          type: 'Character',
        }),
        'kyoshirou',
      );
      kyoshirou.attachedDon = 1;
      host.getPlayer('p1')!.zones.leader.attachedDon = 1;

      for (let index = 0; index < 6; index += 1) {
        host.addCardToZone(
          'p1',
          'cost',
          makeCard({
            id: `DON-${index}`,
            number: `DON-${index}`,
            name: 'DON!!',
            type: 'DON!!',
            cost: 0,
            power: 0,
          }),
          `don-${index}`,
        );
      }

      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'DRAW-001',
          number: 'DRAW-001',
          name: 'Drawn Card',
          type: 'Character',
        }),
        'drawn-card',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: kyoshirou.instanceId,
        sourceCardId: kyoshirou.cardId,
      });

      expect(host.getPlayer('p1')?.zones.hand).toHaveLength(1);
    });
  });

  describe('OP01-052 raizo-when-attacking-draw-1', () => {
    it('honors once per turn across repeated attacks in the same turn', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 3;
      const engine = new EffectEngine(createRegistry(), host);
      const raizo = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-052',
          number: 'OP01-052',
          name: 'Raizo',
          type: 'Character',
        }),
        'raizo',
      );
      host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ALLY-REST-1',
          number: 'ALLY-REST-1',
          name: 'Rested Ally 1',
          type: 'Character',
        }),
        'rested-ally-1',
      ).rested = true;
      host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ALLY-REST-2',
          number: 'ALLY-REST-2',
          name: 'Rested Ally 2',
          type: 'Character',
        }),
        'rested-ally-2',
      ).rested = true;
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'DRAW-RAIZO-1',
          number: 'DRAW-RAIZO-1',
          name: 'Raizo Draw 1',
          type: 'Character',
        }),
        'raizo-draw-1',
      );
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'DRAW-RAIZO-2',
          number: 'DRAW-RAIZO-2',
          name: 'Raizo Draw 2',
          type: 'Character',
        }),
        'raizo-draw-2',
      );

      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: raizo.instanceId,
        sourceCardId: raizo.cardId,
      });
      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: raizo.instanceId,
        sourceCardId: raizo.cardId,
      });

      expect(host.getPlayer('p1')?.zones.hand).toHaveLength(1);

      host.state.turn = 4;
      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: raizo.instanceId,
        sourceCardId: raizo.cardId,
      });

      expect(host.getPlayer('p1')?.zones.hand).toHaveLength(2);
    });

    it('does not trigger when a different character attacks', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      host.state.turn = 3;
      const engine = new EffectEngine(createRegistry(), host);
      host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-052',
          number: 'OP01-052',
          name: 'Raizo',
          type: 'Character',
        }),
        'raizo',
      );
      const otherAttacker = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ALLY-ATTACKER',
          number: 'ALLY-ATTACKER',
          name: 'Other Attacker',
          type: 'Character',
        }),
        'other-attacker',
      );
      host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ALLY-REST-1',
          number: 'ALLY-REST-1',
          name: 'Rested Ally 1',
          type: 'Character',
        }),
        'rested-ally-1',
      ).rested = true;
      host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ALLY-REST-2',
          number: 'ALLY-REST-2',
          name: 'Rested Ally 2',
          type: 'Character',
        }),
        'rested-ally-2',
      ).rested = true;
      host.addCardToZone(
        'p1',
        'deck',
        makeCard({
          id: 'DRAW-SHOULD-NOT-HAPPEN',
          number: 'DRAW-SHOULD-NOT-HAPPEN',
          name: 'Unexpected Draw',
          type: 'Character',
        }),
        'unexpected-draw',
      );

      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: otherAttacker.instanceId,
        sourceCardId: otherAttacker.cardId,
      });

      expect(host.getPlayer('p1')?.zones.hand).toHaveLength(0);
    });
  });

  describe('OP01-002 trafalgar-law-activate-main-pay-2-return-character-play-different-color', () => {
    it('stores a selected character, returns it to hand, then only allows playing a character of a different color', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const law = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-002',
          number: 'OP01-002',
          name: 'Trafalgar Law',
          type: 'Character',
          colors: ['Red'],
        }),
        'law-op01-002',
      );
      host.addCardToZone(
        'p1',
        'cost',
        makeCard({
          id: 'LAW-DON-1',
          number: 'LAW-DON-1',
          name: 'DON!!',
          type: 'DON!!',
          cost: 0,
          power: 0,
        }),
        'law-don-1',
      );
      host.addCardToZone(
        'p1',
        'cost',
        makeCard({
          id: 'LAW-DON-2',
          number: 'LAW-DON-2',
          name: 'DON!!',
          type: 'DON!!',
          cost: 0,
          power: 0,
        }),
        'law-don-2',
      );
      const returnedCharacter = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ALLY-RED',
          number: 'ALLY-RED',
          name: 'Returned Ally',
          type: 'Character',
          colors: ['Red'],
        }),
        'returned-ally',
      );

      for (let index = 0; index < 3; index += 1) {
        host.addCardToZone(
          'p1',
          'characters',
          makeCard({
            id: `FILLER-${index}`,
            number: `FILLER-${index}`,
            name: `Filler ${index}`,
            type: 'Character',
            colors: ['Green'],
          }),
          `filler-${index}`,
        );
      }

      const blueCharacter = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'HAND-BLUE',
          number: 'HAND-BLUE',
          name: 'Blue Character',
          type: 'Character',
          colors: ['Blue'],
          cost: 5,
        }),
        'hand-blue',
      );
      const redCharacter = host.addCardToZone(
        'p1',
        'hand',
        makeCard({
          id: 'HAND-RED',
          number: 'HAND-RED',
          name: 'Red Character',
          type: 'Character',
          colors: ['Red'],
          cost: 5,
        }),
        'hand-red',
      );

      engine.handleEvent({
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: law.instanceId,
        sourceCardId: law.cardId,
      });

      let decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        selectedCardInstanceIds: [returnedCharacter.instanceId],
      });

      decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      const prompt = decision?.prompt;
      expect(prompt?.type).toBe('selectCards');
      expect(prompt?.selector.filter).toMatchObject({
        differentColorThanStoredSelection: 'returnedCharacter',
      });
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        selectedCardInstanceIds: [blueCharacter.instanceId],
      });

      expect(host.getPlayer('p1')?.zones.hand).toContain(returnedCharacter);
      expect(host.getPlayer('p1')?.zones.characters).toContain(blueCharacter);
      expect(host.getPlayer('p1')?.zones.characters).not.toContain(
        redCharacter,
      );
    });
  });

  describe('OP01-063 arlong-activate-main-reveal-opponent-hand-event-branch', () => {
    it('reveals a stored opponent hand card and branches when it is an Event', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const arlong = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-063',
          number: 'OP01-063',
          name: 'Arlong',
          type: 'Character',
        }),
        'arlong',
      );
      arlong.attachedDon = 1;
      const opponentEvent = host.addCardToZone(
        'p2',
        'hand',
        makeCard({
          id: 'OPP-EVENT',
          number: 'OPP-EVENT',
          name: 'Opponent Event',
          type: 'Event',
        }),
        'opponent-event',
      );
      host.addCardToZone(
        'p2',
        'hand',
        makeCard({
          id: 'OPP-CHARACTER',
          number: 'OPP-CHARACTER',
          name: 'Opponent Character',
          type: 'Character',
        }),
        'opponent-character',
      );
      const lifeCard = host.addCardToZone(
        'p2',
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
        type: 'activateMain',
        playerSessionId: 'p1',
        sourceInstanceId: arlong.instanceId,
        sourceCardId: arlong.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      expect(decision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        selectedCardInstanceIds: [opponentEvent.instanceId],
      });

      const lifeDecision = engine.getPendingDecision();
      expect(lifeDecision).not.toBeNull();
      expect(lifeDecision?.prompt.type).toBe('selectCards');
      engine.answerDecision({
        decisionId: lifeDecision?.id ?? '',
        selectedCardInstanceIds: [lifeCard.instanceId],
      });

      expect(host.logs.some((log) => log.includes('Opponent Event'))).toBe(
        true,
      );
      expect(host.getPlayer('p2')?.zones.deck).toContain(lifeCard);
      expect(host.getPlayer('p2')?.zones.life).not.toContain(lifeCard);
      expect(arlong.rested).toBe(true);
    });
  });

  describe('OP01-001 roronoa-zoro-your-turn-all-your-characters-plus-1000', () => {
    it('grants +1000 power to all your characters during your turn while the source has DON attached', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const zoroLeader = host.getPlayer('p1')!.zones.leader;
      zoroLeader.cardId = 'OP01-001';
      zoroLeader.number = 'OP01-001';
      zoroLeader.name = 'Roronoa Zoro';
      zoroLeader.attachedDon = 1;
      const ally = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'ALLY-ZORO-BUFF',
          number: 'ALLY-ZORO-BUFF',
          name: 'Ally',
          type: 'Character',
          power: 4000,
        }),
        'ally-zoro-buff',
      );

      host.state.activePlayerSessionId = 'p1';
      engine.reapplyContinuousEffects();

      expect(zoroLeader.power).toBe(5000);
      expect(ally.power).toBe(5000);

      host.state.activePlayerSessionId = 'p2';
      engine.reapplyContinuousEffects();

      expect(zoroLeader.power).toBe(5000);
      expect(ally.power).toBe(4000);
    });
  });

  describe('OP01-017 nico-robin-when-attacking-ko-3000-or-less', () => {
    it('K.O.s up to 1 opponent character with 3000 power or less when attacking with DON attached', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const robin = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-017',
          number: 'OP01-017',
          name: 'Nico Robin',
          type: 'Character',
        }),
        'robin',
      );
      robin.attachedDon = 1;
      const target = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'ROBIN-TARGET',
          number: 'ROBIN-TARGET',
          name: 'Small Target',
          type: 'Character',
          power: 3000,
        }),
        'robin-target',
      );

      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: robin.instanceId,
        sourceCardId: robin.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(host.getPlayer('p2')?.zones.characters).not.toContain(target);
      expect(host.getPlayer('p2')?.zones.trash[0]).toBe(target);
    });
  });

  describe('OP01-022 brook-when-attacking-minus-2000-to-up-to-2', () => {
    it('gives up to 2 opponent characters -2000 power during this turn when attacking with DON attached', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const brook = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-022',
          number: 'OP01-022',
          name: 'Brook',
          type: 'Character',
        }),
        'brook',
      );
      brook.attachedDon = 1;
      const targetA = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'BROOK-TARGET-A',
          number: 'BROOK-TARGET-A',
          name: 'Target A',
          type: 'Character',
          power: 5000,
        }),
        'brook-target-a',
      );
      const targetB = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'BROOK-TARGET-B',
          number: 'BROOK-TARGET-B',
          name: 'Target B',
          type: 'Character',
          power: 4000,
        }),
        'brook-target-b',
      );

      engine.handleEvent({
        type: 'whenAttacking',
        playerSessionId: 'p1',
        sourceInstanceId: brook.instanceId,
        sourceCardId: brook.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        selectedCardInstanceIds: [targetA.instanceId, targetB.instanceId],
      });

      expect(targetA.power).toBe(3000);
      expect(targetB.power).toBe(2000);
    });
  });

  describe('OP01-033 izo-on-play-rest-cost-4-or-less', () => {
    it('rests up to 1 opponent character with cost 4 or less on play', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const izo = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-033',
          number: 'OP01-033',
          name: 'Izo',
          type: 'Character',
        }),
        'izo',
      );
      const target = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'IZO-TARGET',
          number: 'IZO-TARGET',
          name: 'Izo Target',
          type: 'Character',
          cost: 4,
        }),
        'izo-target',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: izo.instanceId,
        sourceCardId: izo.cardId,
      });

      expect(target.rested).toBe(true);
    });
  });

  describe('OP01-054 x-drake-on-play-ko-rested-cost-4-or-less', () => {
    it('K.O.s up to 1 opponent rested character with cost 4 or less on play', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const xDrake = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-054',
          number: 'OP01-054',
          name: 'X.Drake',
          type: 'Character',
        }),
        'x-drake-rested-ko',
      );
      const target = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'XDRAKE-TARGET',
          number: 'XDRAKE-TARGET',
          name: 'Rested Target',
          type: 'Character',
          cost: 4,
        }),
        'xdrake-target',
      );
      target.rested = true;

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: xDrake.instanceId,
        sourceCardId: xDrake.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(host.getPlayer('p2')?.zones.characters).not.toContain(target);
      expect(host.getPlayer('p2')?.zones.trash[0]).toBe(target);
    });
  });

  describe('OP01-068 gecko-moria-your-turn-gains-double-attack', () => {
    it('gains Double Attack only during your turn when you have 5 or more cards in hand', () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const moria = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-068',
          number: 'OP01-068',
          name: 'Gecko Moria',
          type: 'Character',
        }),
        'moria',
      );

      for (let index = 0; index < 5; index += 1) {
        host.addCardToZone(
          'p1',
          'hand',
          makeCard({
            id: `MORIA-HAND-${index}`,
            number: `MORIA-HAND-${index}`,
            name: `Hand ${index}`,
            type: 'Character',
          }),
          `moria-hand-${index}`,
        );
      }

      host.state.activePlayerSessionId = 'p1';
      engine.reapplyContinuousEffects();
      expect(moria.hasDoubleAttack).toBe(true);

      host.state.activePlayerSessionId = 'p2';
      engine.reapplyContinuousEffects();
      expect(moria.hasDoubleAttack).toBe(false);
    });
  });

  describe('OP01-070 dracule-mihawk-on-play-bottom-deck-cost-7-or-less', () => {
    it("places up to 1 character with cost 7 or less at the bottom of the owner's deck", () => {
      const host = new TestHost();
      host.addPlayer('p1');
      host.addPlayer('p2');
      const engine = new EffectEngine(createRegistry(), host);
      const mihawk = host.addCardToZone(
        'p1',
        'characters',
        makeCard({
          id: 'OP01-070',
          number: 'OP01-070',
          name: 'Dracule Mihawk',
          type: 'Character',
        }),
        'mihawk',
      );
      const target = host.addCardToZone(
        'p2',
        'characters',
        makeCard({
          id: 'MIHAWK-TARGET',
          number: 'MIHAWK-TARGET',
          name: 'Mihawk Target',
          type: 'Character',
          cost: 7,
        }),
        'mihawk-target',
      );

      engine.handleEvent({
        type: 'onPlay',
        playerSessionId: 'p1',
        sourceInstanceId: mihawk.instanceId,
        sourceCardId: mihawk.cardId,
      });

      const decision = engine.getPendingDecision();
      expect(decision).not.toBeNull();
      engine.answerDecision({
        decisionId: decision?.id ?? '',
        selectedCardInstanceIds: [target.instanceId],
      });

      expect(host.getPlayer('p2')?.zones.characters).not.toContain(target);
      expect(host.getPlayer('p2')?.zones.deck.at(-1)).toBe(target);
    });
  });
});
