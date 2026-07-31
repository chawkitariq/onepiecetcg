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
import { specialHandlerDefinitions } from '../index.js';
import { op06EffectDefinitions } from './OP-06.effects';

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
  definitions = [op06EffectDefinitions],
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
    if (!player) return;
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
      if (player.zones.leader.instanceId === instanceId)
        return player.zones.leader;
      if (player.zones.stage.instanceId === instanceId)
        return player.zones.stage;
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
          (c) => c.instanceId === instanceId,
        );
        if (found) return found;
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
      if (!player) continue;
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
          )
            continue;
          if (
            selector.filter?.costMax != null &&
            card.cost > selector.filter.costMax
          )
            continue;
          if (
            selector.filter?.costMin != null &&
            card.cost < selector.filter.costMin
          )
            continue;
          if (
            selector.filter?.powerMax != null &&
            card.power > selector.filter.powerMax
          )
            continue;
          if (
            selector.filter?.powerMin != null &&
            card.power < selector.filter.powerMin
          )
            continue;
          if (
            selector.filter?.color &&
            !selector.filter.color.some((c: string) => card.colors.includes(c))
          )
            continue;
          if (
            selector.filter?.trait &&
            !selector.filter.trait.some((t: string) =>
              card.families.includes(t),
            )
          )
            continue;
          if (
            selector.filter?.excludeName &&
            selector.filter.excludeName.includes(card.name)
          )
            continue;
          if (
            selector.filter?.name &&
            !selector.filter.name.includes(card.name)
          )
            continue;
          if (
            selector.filter?.rested != null &&
            card.rested !== selector.filter.rested
          )
            continue;
          matches.push(card);
        }
      }
    }
    return matches;
  }

  public moveCard(
    card: DuelCard,
    destSessionId: string,
    destZone: string,
    options?: { faceDown?: boolean; rested?: boolean; toBottom?: boolean },
  ): void {
    this.removeCard(card.instanceId);
    const player = this.getPlayer(destSessionId);
    if (!player) return;
    card.ownerSessionId = destSessionId;
    card.faceDown = options?.faceDown ?? false;
    card.rested = options?.rested ?? false;
    const zones = player.zones as any;
    if (destZone === 'trash') zones.trash.unshift(card);
    else if (destZone === 'hand') zones.hand.push(card);
    else if (destZone === 'life' && options?.toBottom) zones.life.push(card);
    else if (destZone === 'life') zones.life.unshift(card);
    else if (destZone === 'deck' && options?.toBottom) zones.deck.push(card);
    else if (destZone === 'deck') zones.deck.unshift(card);
    else if (destZone === 'donDeck') zones.donDeck.push(card);
    else if (destZone === 'cost') zones.cost.push(card);
    else if (destZone === 'characters') zones.characters.push(card);
    else if (destZone === 'stage') zones.stage = card;
  }

  public drawCard(playerSessionId: string): DuelCard | null {
    const player = this.getPlayer(playerSessionId);
    const card = player?.zones.deck.shift();
    if (!player || !card) return null;
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
    if (!player) return moved;
    for (let i = 0; i < amount; i += 1) {
      const card = player.zones.deck.shift();
      if (!card) break;
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
    if (!player) return 0;
    let moved = 0;
    for (let i = 0; i < amount; i += 1) {
      const don = player.zones.donDeck.shift();
      if (!don) break;
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
            (c) => c.instanceId === targetInstanceId,
          );
    if (!player || !target) return 0;
    const matchingDon = player.zones.cost.filter((c) =>
      options?.rested === undefined ? true : c.rested === options.rested,
    );
    const attached = Math.min(amount, matchingDon.length);
    for (const don of matchingDon.slice(0, attached)) {
      const idx = player.zones.cost.indexOf(don);
      if (idx >= 0) player.zones.cost.splice(idx, 1);
    }
    target.attachedDon += attached;
    return attached;
  }

  public returnDonToDonDeck(playerSessionId: string, amount: number): number {
    const player = this.getPlayer(playerSessionId);
    if (!player) return 0;
    let moved = 0;
    while (player.zones.cost.length > 0 && moved < amount) {
      const card = player.zones.cost.pop();
      if (!card) break;
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
    const idx =
      player?.zones.characters.findIndex((c) => c.instanceId === instanceId) ??
      -1;
    if (!player || idx < 0) return false;
    const [card] = player.zones.characters.splice(idx, 1);
    if (!card) return false;
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
        const idx = player.zones[zone].findIndex(
          (c) => c.instanceId === instanceId,
        );
        if (idx >= 0) {
          player.zones[zone].splice(idx, 1);
          return;
        }
      }
    }
  }
}

describe('op06EffectDefinitions', () => {
  it('K.O.s a 10000 power or less character with Shanks on play', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const shanks = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP06-007',
        number: 'OP06-007',
        name: 'Shanks',
        type: 'Character',
      }),
      'shanks',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'TARGET',
        number: 'TARGET',
        name: 'Weakling',
        type: 'Character',
        power: 9000,
      }),
      'target',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: shanks.instanceId,
      sourceCardId: shanks.cardId,
    });

    const pending = engine.getPendingDecision();
    expect(pending?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: pending!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(host.getPlayer('p2')?.zones.characters).toHaveLength(0);
    expect(host.getPlayer('p2')?.zones.trash).toHaveLength(1);
  });

  it('plays a Revolutionary Army character via Emporio.Ivankov on play', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const ivankov = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP06-003',
        number: 'OP06-003',
        name: 'Emporio.Ivankov',
        type: 'Character',
      }),
      'ivankov',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'REV-001',
        number: 'REV-001',
        name: 'Revolutionary Fighter',
        type: 'Character',
        power: 4000,
        families: ['Revolutionary Army'],
      }),
      'rev-fighter',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: ivankov.instanceId,
      sourceCardId: ivankov.cardId,
    });

    const pending = engine.getPendingDecision();
    expect(pending?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: pending!.id,
      selectedCardInstanceIds: ['p1:rev-fighter'],
    });

    expect(
      host
        .getPlayer('p1')!
        .zones.characters.find((c) => c.instanceId === 'p1:rev-fighter'),
    ).toBeDefined();
  });

  it('gives Inazuma Banish when it has 7000+ power (continuous)', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const inazuma = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP06-002',
        number: 'OP06-002',
        name: 'Inazuma',
        type: 'Character',
        power: 7000,
      }),
      'inazuma',
    );

    engine.reapplyContinuousEffects();
    expect(inazuma.hasBanish).toBe(true);
  });

  it('withholds Banish from Inazuma when power is below 7000', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const inazuma = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP06-002',
        number: 'OP06-002',
        name: 'Inazuma',
        type: 'Character',
        power: 5000,
      }),
      'inazuma',
    );

    engine.reapplyContinuousEffects();
    expect(inazuma.hasBanish).toBe(false);
  });

  it('grants Douglas Bullet Blocker when the leader has the FILM type', () => {
    const host = new TestHost();
    host.addPlayer('p1', { families: ['FILM'] });
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const bullet = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP06-010',
        number: 'OP06-010',
        name: 'Douglas Bullet',
        type: 'Character',
      }),
      'bullet',
    );

    engine.reapplyContinuousEffects();
    expect(bullet.mustBeAttackTarget).toBe(true);
  });

  it('searches top 5 for a Navy card with Tashigi on play', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const tashigi = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP06-050',
        number: 'OP06-050',
        name: 'Tashigi',
        type: 'Character',
      }),
      'tashigi',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'NAVY-001',
        number: 'NAVY-001',
        name: 'Navy Officer',
        type: 'Character',
        families: ['Navy'],
      }),
      'navy-officer',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: tashigi.instanceId,
      sourceCardId: tashigi.cardId,
    });

    const pending = engine.getPendingDecision();
    expect(pending?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: pending!.id,
      selectedCardInstanceIds: ['p1:navy-officer'],
    });

    expect(
      host
        .getPlayer('p1')!
        .zones.hand.find((c) => c.instanceId === 'p1:navy-officer'),
    ).toBeDefined();
  });

  it('draws 2 and asks to bottom-deck 2 with Kuzan on play', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const kuzan = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP06-045',
        number: 'OP06-045',
        name: 'Kuzan',
        type: 'Character',
      }),
      'kuzan',
    );
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({ id: 'H1', number: 'H1', name: 'Card1', type: 'Event' }),
      'h1',
    );
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({ id: 'H2', number: 'H2', name: 'Card2', type: 'Event' }),
      'h2',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'DRAW1', number: 'DRAW1', name: 'Draw1', type: 'Event' }),
      'draw1',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'DRAW2', number: 'DRAW2', name: 'Draw2', type: 'Event' }),
      'draw2',
    );

    const initialHand = host.getPlayer('p1')!.zones.hand.length;

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: kuzan.instanceId,
      sourceCardId: kuzan.cardId,
    });

    expect(host.getPlayer('p1')!.zones.hand.length).toBe(initialHand + 2);

    const pending = engine.getPendingDecision();
    expect(pending?.prompt.type).toBe('selectCards');

    const handCards = host.getPlayer('p1')!.zones.hand;
    engine.answerDecision({
      decisionId: pending!.id,
      selectedCardInstanceIds: [
        handCards[0].instanceId,
        handCards[1].instanceId,
      ],
    });

    expect(host.getPlayer('p1')!.zones.hand.length).toBe(initialHand);
  });

  it('bottom-decks a Character with cost <= 2 via Sakazuki on play', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const sakazuki = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP06-046',
        number: 'OP06-046',
        name: 'Sakazuki',
        type: 'Character',
      }),
      'sakazuki',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'TGT',
        number: 'TGT',
        name: 'CheapChar',
        type: 'Character',
        cost: 2,
      }),
      'target',
    );
    host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'TOOEXP',
        number: 'TOOEXP',
        name: 'ExpChar',
        type: 'Character',
        cost: 3,
      }),
      'too-exp',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: sakazuki.instanceId,
      sourceCardId: sakazuki.cardId,
    });

    const pending = engine.getPendingDecision();
    expect(pending?.prompt.type).toBe('selectCards');
    expect(pending?.prompt.selector?.filter?.costMax).toBe(2);

    engine.answerDecision({
      decisionId: pending!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(
      host
        .getPlayer('p2')
        ?.zones.characters.find((c) => c.instanceId === target.instanceId),
    ).toBeUndefined();
    expect(host.getPlayer('p2')?.zones.deck.at(-1)?.instanceId).toBe(
      target.instanceId,
    );
  });

  it('makes Tokikake immune to battle KO when hand <= 4 and has DON!! x1', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const tokikake = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP06-052',
        number: 'OP06-052',
        name: 'Tokikake',
        type: 'Character',
      }),
      'tokikake',
    );
    tokikake.attachedDon = 1;

    engine.reapplyContinuousEffects();
    expect(tokikake.cannotBeKoedInBattle).toBe(true);
  });

  it('triggers Vinsmoke Reiju leader draw on DON!! return during own turn', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const reiju = host.getPlayer('p1')!.zones.leader;
    reiju.cardId = 'OP06-042';

    host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'DC1', number: 'DC1', name: 'DeckCard', type: 'Event' }),
      'dc1',
    );

    const initialHand = host.getPlayer('p1')!.zones.hand.length;

    engine.handleEvent({
      type: 'onDonReturned',
      playerSessionId: 'p1',
      sourceInstanceId: reiju.instanceId,
      sourceCardId: reiju.cardId,
    });

    expect(host.getPlayer('p1')!.zones.hand.length).toBe(initialHand + 1);
  });

  it('grants Yamato leader Double Attack continuously', () => {
    const host = new TestHost();
    host.addPlayer('p1', { name: 'Yamato', families: ['Land of Wano'] });
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    host.getPlayer('p1')!.zones.leader.cardId = 'OP06-022';
    host.getPlayer('p1')!.zones.leader.name = 'Yamato';

    engine.reapplyContinuousEffects();
    expect(host.getPlayer('p1')!.zones.leader.hasDoubleAttack).toBe(true);
  });

  it('searches FILM type via Monkey.D.Luffy on play', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const luffy = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP06-013',
        number: 'OP06-013',
        name: 'Monkey.D.Luffy',
        type: 'Character',
      }),
      'luffy',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({
        id: 'FILM-001',
        number: 'FILM-001',
        name: 'Film Char',
        type: 'Character',
        families: ['FILM'],
      }),
      'film-char',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: luffy.instanceId,
      sourceCardId: luffy.cardId,
    });

    const pending = engine.getPendingDecision();
    expect(pending?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: pending!.id,
      selectedCardInstanceIds: ['p1:film-char'],
    });

    expect(
      host
        .getPlayer('p1')!
        .zones.hand.find((c) => c.instanceId === 'p1:film-char'),
    ).toBeDefined();
  });

  it('enables White Snake counter to boost power and draw 1', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const ws = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP06-059',
        number: 'OP06-059',
        name: 'White Snake',
        type: 'Event',
      }),
      'white-snake',
    );
    host.addCardToZone(
      'p1',
      'deck',
      makeCard({ id: 'TOP', number: 'TOP', name: 'TopDeck', type: 'Event' }),
      'top-deck',
    );

    const initialHand = host.getPlayer('p1')!.zones.hand.length;
    const leader = host.getPlayer('p1')!.zones.leader;

    engine.handleEvent({
      type: 'activateCounter',
      playerSessionId: 'p1',
      sourceInstanceId: ws.instanceId,
      sourceCardId: ws.cardId,
    });

    const pending = engine.getPendingDecision();
    expect(pending?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: pending!.id,
      selectedCardInstanceIds: [leader.instanceId],
    });

    expect(leader.power).toBe(6000);
    expect(host.getPlayer('p1')!.zones.hand.length).toBe(initialHand + 1);
  });

  it('triggers K.O. via The Billion-fold World Trichiliocosm trigger on rested cost <= 3', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const trich = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP06-038',
        number: 'OP06-038',
        name: 'Trichiliocosm',
        type: 'Event',
      }),
      'trich',
    );
    const target = host.addCardToZone(
      'p2',
      'characters',
      makeCard({
        id: 'TGT',
        number: 'TGT',
        name: 'Target',
        type: 'Character',
        cost: 3,
      }),
      'target',
    );
    target.rested = true;

    engine.handleEvent({
      type: 'trigger',
      playerSessionId: 'p1',
      sourceInstanceId: trich.instanceId,
      sourceCardId: trich.cardId,
    });

    const pending = engine.getPendingDecision();
    expect(pending?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: pending!.id,
      selectedCardInstanceIds: [target.instanceId],
    });

    expect(host.getPlayer('p2')?.zones.trash).toHaveLength(1);
  });

  it('lets Ratchet trash any number of FILM cards to buff a chosen ally', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const ratchet = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP06-014',
        number: 'OP06-014',
        name: 'Ratchet',
        type: 'Character',
      }),
      'ratchet',
    );
    const ally = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'ALLY-001',
        number: 'ALLY-001',
        name: 'Film Ally',
        type: 'Character',
        power: 1000,
      }),
      'film-ally',
    );
    const filmOne = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'FILM-1',
        number: 'FILM-1',
        name: 'Film One',
        type: 'Character',
        families: ['FILM'],
      }),
      'film-one',
    );
    const filmTwo = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'FILM-2',
        number: 'FILM-2',
        name: 'Film Two',
        type: 'Event',
        families: ['FILM'],
      }),
      'film-two',
    );
    host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'OTHER-1',
        number: 'OTHER-1',
        name: 'Other Card',
        type: 'Event',
      }),
      'other-one',
    );

    engine.handleEvent({
      type: 'onAttacked',
      playerSessionId: 'p1',
      sourceInstanceId: ratchet.instanceId,
      sourceCardId: ratchet.cardId,
    });

    const confirmDecision = engine.getPendingDecision();
    expect(confirmDecision?.prompt.type).toBe('confirm');

    engine.answerDecision({
      decisionId: confirmDecision?.id ?? '',
      confirmed: true,
    });

    const trashDecision = engine.getPendingDecision();
    expect(trashDecision?.prompt.type).toBe('selectCards');
    expect(trashDecision?.prompt.max).toBe(2);

    engine.answerDecision({
      decisionId: trashDecision?.id ?? '',
      selectedCardInstanceIds: [filmOne.instanceId, filmTwo.instanceId],
    });

    const buffDecision = engine.getPendingDecision();
    expect(buffDecision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: buffDecision?.id ?? '',
      selectedCardInstanceIds: [ally.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.trash).toHaveLength(2);
    expect(ally.power).toBe(3000);
  });

  it('routes Aisa trigger branch through declarative life reordering', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const aisa = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP06-099',
        number: 'OP06-099',
        name: 'Aisa',
        type: 'Character',
      }),
      'aisa',
    );
    const topLife = host.addCardToZone(
      'p2',
      'life',
      makeCard({
        id: 'LIFE-TOP',
        number: 'LIFE-TOP',
        name: 'Top Life',
        type: 'Character',
      }),
      'life-top',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: aisa.instanceId,
      sourceCardId: aisa.cardId,
    });

    const branchDecision = engine.getPendingDecision();
    expect(branchDecision?.prompt.type).toBe('selectChoice');

    engine.answerDecision({
      decisionId: branchDecision?.id ?? '',
      selectedChoiceIds: ['opponent'],
    });

    const lifeDecision = engine.getPendingDecision();
    expect(lifeDecision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: lifeDecision?.id ?? '',
      selectedCardInstanceIds: [topLife.instanceId],
    });

    const positionDecision = engine.getPendingDecision();
    expect(positionDecision?.prompt.type).toBe('selectChoice');

    engine.answerDecision({
      decisionId: positionDecision?.id ?? '',
      selectedChoiceIds: ['bottom'],
    });

    expect(host.getPlayer('p2')?.zones.life.at(-1)?.instanceId).toBe(
      topLife.instanceId,
    );
    expect(topLife.faceDown).toBe(false);
  });

  it('stacks Shadows Asgard power from any number of sacrificed Thriller Bark Pirates', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const shadowsAsgard = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'OP06-095',
        number: 'OP06-095',
        name: 'Shadows Asgard',
        type: 'Event',
      }),
      'shadows-asgard',
    );
    const first = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'TB-1',
        number: 'TB-1',
        name: 'Thriller One',
        type: 'Character',
        cost: 2,
        families: ['Thriller Bark Pirates'],
      }),
      'thriller-one',
    );
    const second = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'TB-2',
        number: 'TB-2',
        name: 'Thriller Two',
        type: 'Character',
        cost: 1,
        families: ['Thriller Bark Pirates'],
      }),
      'thriller-two',
    );

    engine.handleEvent({
      type: 'activateCounter',
      playerSessionId: 'p1',
      sourceInstanceId: shadowsAsgard.instanceId,
      sourceCardId: shadowsAsgard.cardId,
    });

    const sacrificeDecision = engine.getPendingDecision();
    expect(sacrificeDecision?.prompt.type).toBe('selectCards');
    expect(sacrificeDecision?.prompt.max).toBe(2);

    engine.answerDecision({
      decisionId: sacrificeDecision?.id ?? '',
      selectedCardInstanceIds: [first.instanceId, second.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.trash).toHaveLength(3);
    expect(host.getPlayer('p1')?.zones.leader.power).toBe(8000);
  });

  it('moves a chosen Life card to hand and puts a hand card back on top with Kouzuki Hiyori', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const hiyori = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP06-106',
        number: 'OP06-106',
        name: 'Kouzuki Hiyori',
        type: 'Character',
      }),
      'hiyori',
    );
    host.addCardToZone(
      'p1',
      'life',
      makeCard({
        id: 'LIFE-BOTTOM',
        number: 'LIFE-BOTTOM',
        name: 'Bottom Life',
        type: 'Character',
      }),
      'life-bottom',
    );
    const topLife = host.addCardToZone(
      'p1',
      'life',
      makeCard({
        id: 'LIFE-TOP-HIYORI',
        number: 'LIFE-TOP-HIYORI',
        name: 'Top Life',
        type: 'Character',
      }),
      'life-top-hiyori',
    );
    const handCard = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'HAND-HIYORI',
        number: 'HAND-HIYORI',
        name: 'Hand Return',
        type: 'Event',
      }),
      'hand-hiyori',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: hiyori.instanceId,
      sourceCardId: hiyori.cardId,
    });

    const confirmDecision = engine.getPendingDecision();
    expect(confirmDecision?.prompt.type).toBe('confirm');

    engine.answerDecision({
      decisionId: confirmDecision?.id ?? '',
      confirmed: true,
    });

    const takeLifeDecision = engine.getPendingDecision();
    expect(takeLifeDecision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: takeLifeDecision?.id ?? '',
      selectedCardInstanceIds: [topLife.instanceId],
    });

    const returnLifeDecision = engine.getPendingDecision();
    expect(returnLifeDecision?.prompt.type).toBe('selectCards');

    engine.answerDecision({
      decisionId: returnLifeDecision?.id ?? '',
      selectedCardInstanceIds: [handCard.instanceId],
    });

    expect(host.getPlayer('p1')?.zones.hand).toContain(topLife);
    expect(host.getPlayer('p1')?.zones.life[0]).toBe(handCard);
    expect(handCard.faceDown).toBe(true);
  });

  it('plays only distinct GERMA 66 names with Vinsmoke Judge on play', () => {
    const host = new TestHost();
    host.addPlayer('p1', { families: ['GERMA 66'] });
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const judge = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP06-062',
        number: 'OP06-062',
        name: 'Vinsmoke Judge',
        type: 'Character',
      }),
      'judge',
    );
    host.addCardToZone(
      'p1',
      'cost',
      makeCard({
        id: 'DON-1',
        number: 'DON-1',
        name: 'DON!!',
        type: 'DON!!',
        cost: null,
        power: null,
        counter: null,
      }),
      'don-1',
    );
    const handOne = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'HAND-J1',
        number: 'HAND-J1',
        name: 'Trash 1',
        type: 'Event',
      }),
      'hand-j1',
    );
    const handTwo = host.addCardToZone(
      'p1',
      'hand',
      makeCard({
        id: 'HAND-J2',
        number: 'HAND-J2',
        name: 'Trash 2',
        type: 'Event',
      }),
      'hand-j2',
    );
    const reijuOne = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'GERMA-R1',
        number: 'GERMA-R1',
        name: 'Vinsmoke Reiju',
        type: 'Character',
        power: 4000,
        families: ['GERMA 66'],
      }),
      'reiju-one',
    );
    const reijuTwo = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'GERMA-R2',
        number: 'GERMA-R2',
        name: 'Vinsmoke Reiju',
        type: 'Character',
        power: 4000,
        families: ['GERMA 66'],
      }),
      'reiju-two',
    );
    const ichiji = host.addCardToZone(
      'p1',
      'trash',
      makeCard({
        id: 'GERMA-I1',
        number: 'GERMA-I1',
        name: 'Vinsmoke Ichiji',
        type: 'Character',
        power: 4000,
        families: ['GERMA 66'],
      }),
      'ichiji-one',
    );

    engine.handleEvent({
      type: 'onPlay',
      playerSessionId: 'p1',
      sourceInstanceId: judge.instanceId,
      sourceCardId: judge.cardId,
    });

    const confirmDecision = engine.getPendingDecision();
    expect(confirmDecision?.prompt.type).toBe('confirm');
    engine.answerDecision({
      decisionId: confirmDecision?.id ?? '',
      confirmed: true,
    });

    const playDecision = engine.getPendingDecision();
    expect(playDecision?.prompt.type).toBe('selectCards');
    engine.answerDecision({
      decisionId: playDecision?.id ?? '',
      selectedCardInstanceIds: [
        reijuOne.instanceId,
        reijuTwo.instanceId,
        ichiji.instanceId,
      ],
    });

    expect(host.getPlayer('p1')?.zones.characters).toContain(judge);
    expect(host.getPlayer('p1')?.zones.characters).toContain(reijuOne);
    expect(host.getPlayer('p1')?.zones.characters).toContain(ichiji);
    expect(host.getPlayer('p1')?.zones.characters).not.toContain(reijuTwo);
    expect(host.getPlayer('p1')?.zones.donDeck).toHaveLength(1);
  });

  it('grants Shiki Blocker when your DON!! total is at least 2 less than your opponent', () => {
    const host = new TestHost();
    host.addPlayer('p1', { families: ['GERMA 66'] });
    host.addPlayer('p2');
    const engine = new EffectEngine(createRegistry(), host);

    const shiki = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP06-072',
        number: 'OP06-072',
        name: 'Shiki',
        type: 'Character',
      }),
      'shiki',
    );

    host.addCardToZone(
      'p1',
      'cost',
      makeCard({
        id: 'P1-DON-1',
        number: 'P1-DON-1',
        name: 'DON!!',
        type: 'DON!!',
        cost: null,
        power: null,
        counter: null,
      }),
      'p1-don-1',
    );
    host.addCardToZone(
      'p2',
      'cost',
      makeCard({
        id: 'P2-DON-1',
        number: 'P2-DON-1',
        name: 'DON!!',
        type: 'DON!!',
        cost: null,
        power: null,
        counter: null,
      }),
      'p2-don-1',
    );
    host.addCardToZone(
      'p2',
      'cost',
      makeCard({
        id: 'P2-DON-2',
        number: 'P2-DON-2',
        name: 'DON!!',
        type: 'DON!!',
        cost: null,
        power: null,
        counter: null,
      }),
      'p2-don-2',
    );
    host.addCardToZone(
      'p2',
      'cost',
      makeCard({
        id: 'P2-DON-3',
        number: 'P2-DON-3',
        name: 'DON!!',
        type: 'DON!!',
        cost: null,
        power: null,
        counter: null,
      }),
      'p2-don-3',
    );

    engine.reapplyContinuousEffects();

    expect(shiki.mustBeAttackTarget).toBe(true);
  });

  it('updates OP06-009 Shuraiya base power on block without requiring host.syncCard', () => {
    const host = new TestHost();
    host.addPlayer('p1');
    host.addPlayer('p2', {
      id: 'opp-leader',
      number: 'opp-leader',
      name: 'Opponent Leader',
      type: 'Leader',
      power: 7000,
      life: 5,
    });

    const engine = new EffectEngine(
      createRegistry([op06EffectDefinitions], specialHandlerDefinitions),
      host,
    );

    const shuraiya = host.addCardToZone(
      'p1',
      'characters',
      makeCard({
        id: 'OP06-009',
        number: 'OP06-009',
        name: 'Shuraiya',
        type: 'Character',
        cost: 3,
        power: 4000,
      }),
      'shuraiya',
    );

    expect(() =>
      engine.handleEvent({
        type: 'onBlock',
        playerSessionId: 'p1',
        sourceInstanceId: shuraiya.instanceId,
        sourceCardId: 'OP06-009',
      }),
    ).not.toThrow();

    expect(shuraiya.basePower).toBe(7000);
  });
});
