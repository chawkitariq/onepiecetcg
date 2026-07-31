import type {
  DuelCard,
  DuelEndReason,
  DuelState,
  GamePhase,
} from '@onepiecetcg/shared';

export type DuelStateSnapshot = {
  phase: GamePhase;
  turn: number;
  activePlayerSessionId: string;
  startedAt: string;
  winnerSessionId: string;
  endReason: DuelEndReason | '';
};

export type CardLocation = {
  ownerSessionId: string;
  zone:
    | 'leader'
    | 'stage'
    | 'deck'
    | 'donDeck'
    | 'hand'
    | 'life'
    | 'characters'
    | 'cost'
    | 'trash';
  cardId: string;
};

export type MovedCard = {
  instanceId: string;
  from: CardLocation;
  to: CardLocation;
};

export type RefreshStepSnapshot = {
  attachedDonSources: Map<
    string,
    {
      ownerSessionId: string;
      cardDefinitionId: string;
      attachedDon: number;
    }
  >;
  restedCostCardIds: Set<string>;
};

export type CostZoneRestSnapshot = Map<string, boolean>;

export type OrderedZoneSnapshot = Map<string, string[]>;

/**
 * Captures the minimal state fields needed to compare phase/turn transitions
 * and structural game-end changes.
 */
export function captureDuelStateSnapshot(
  state: DuelState,
): DuelStateSnapshot {
  return {
    phase: state.phase,
    turn: state.turn,
    activePlayerSessionId: state.activePlayerSessionId,
    startedAt: state.startedAt,
    winnerSessionId: state.winnerSessionId,
    endReason: state.endReason,
  };
}

/**
 * Captures every card's owning player and zone in the current duel state.
 */
export function captureCardLocations(
  state: DuelState,
): Map<string, CardLocation> {
  const locations = new Map<string, CardLocation>();

  for (const player of state.players.values()) {
    locations.set(player.zones.leader.instanceId, {
      ownerSessionId: player.sessionId,
      zone: 'leader',
      cardId: player.zones.leader.cardId,
    });

    if (player.zones.stage.instanceId) {
      locations.set(player.zones.stage.instanceId, {
        ownerSessionId: player.sessionId,
        zone: 'stage',
        cardId: player.zones.stage.cardId,
      });
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
      for (const card of player.zones[zone]) {
        locations.set(card.instanceId, {
          ownerSessionId: player.sessionId,
          zone,
          cardId: card.cardId,
        });
      }
    }
  }

  return locations;
}

/**
 * Returns cards whose owning player or zone changed between two snapshots.
 */
export function findMovedCards(
  before: Map<string, CardLocation>,
  after: Map<string, CardLocation>,
): MovedCard[] {
  const moved: MovedCard[] = [];

  for (const [instanceId, beforeLocation] of before.entries()) {
    const afterLocation = after.get(instanceId);

    if (
      afterLocation &&
      (afterLocation.zone !== beforeLocation.zone ||
        afterLocation.ownerSessionId !== beforeLocation.ownerSessionId)
    ) {
      moved.push({
        instanceId,
        from: beforeLocation,
        to: afterLocation,
      });
    }
  }

  return moved;
}

/**
 * Captures attached DON!! sources and rested cost DON!! cards before the
 * refresh step resolves.
 */
export function captureRefreshStepSnapshot(
  state: DuelState,
): RefreshStepSnapshot {
  const attachedDonSources = new Map<
    string,
    {
      ownerSessionId: string;
      cardDefinitionId: string;
      attachedDon: number;
    }
  >();
  const restedCostCardIds = new Set<string>();

  for (const player of state.players.values()) {
    if (player.zones.leader.attachedDon > 0) {
      attachedDonSources.set(player.zones.leader.instanceId, {
        ownerSessionId: player.sessionId,
        cardDefinitionId: player.zones.leader.cardId,
        attachedDon: player.zones.leader.attachedDon,
      });
    }

    for (const character of player.zones.characters) {
      if (character.attachedDon > 0) {
        attachedDonSources.set(character.instanceId, {
          ownerSessionId: player.sessionId,
          cardDefinitionId: character.cardId,
          attachedDon: character.attachedDon,
        });
      }
    }

    for (const donCard of player.zones.cost) {
      if (donCard.rested) {
        restedCostCardIds.add(donCard.instanceId);
      }
    }
  }

  return {
    attachedDonSources,
    restedCostCardIds,
  };
}

/**
 * Captures the ordered list of card instance ids for one ordered hidden zone.
 */
export function captureOrderedZoneSnapshot(
  state: DuelState,
  zone: 'deck' | 'life',
): OrderedZoneSnapshot {
  const snapshot: OrderedZoneSnapshot = new Map();

  for (const player of state.players.values()) {
    snapshot.set(
      player.sessionId,
      Array.from(player.zones[zone], (card) => card.instanceId),
    );
  }

  return snapshot;
}

/**
 * Infers whether a card was placed on top, bottom, or at an unknown position
 * in an ordered zone.
 */
export function inferZonePlacement(
  instanceId: string,
  cards: ArrayLike<DuelCard> | undefined,
  beforeOrder: string[] | undefined,
): 'top' | 'bottom' | 'unknown' {
  const afterOrder = cards ? Array.from(cards, (card) => card.instanceId) : [];

  if (afterOrder[0] === instanceId) {
    return 'top';
  }

  if (afterOrder.at(-1) === instanceId) {
    return 'bottom';
  }

  if (!beforeOrder) {
    return 'unknown';
  }

  const afterIndex = afterOrder.indexOf(instanceId);

  if (afterIndex === -1) {
    return 'unknown';
  }

  const firstSharedBefore = beforeOrder.find((existingId) =>
    afterOrder.includes(existingId),
  );

  if (firstSharedBefore) {
    const firstSharedAfterIndex = afterOrder.indexOf(firstSharedBefore);

    if (afterIndex < firstSharedAfterIndex) {
      return 'top';
    }
  }

  const lastSharedBefore = [...beforeOrder]
    .reverse()
    .find((existingId) => afterOrder.includes(existingId));

  if (lastSharedBefore) {
    const lastSharedAfterIndex = afterOrder.indexOf(lastSharedBefore);

    if (afterIndex > lastSharedAfterIndex) {
      return 'bottom';
    }
  }

  return 'unknown';
}

/**
 * Detects players whose deck order changed for the shared surviving cards.
 */
export function findShuffledDeckPlayers(
  beforeDeckOrder: OrderedZoneSnapshot,
  state: DuelState,
): string[] {
  const shuffledPlayers: string[] = [];

  for (const player of state.players.values()) {
    const beforeOrder = beforeDeckOrder.get(player.sessionId) ?? [];
    const afterOrder = Array.from(player.zones.deck, (card) => card.instanceId);
    const sharedCardIds = beforeOrder.filter((cardId) =>
      afterOrder.includes(cardId),
    );

    if (sharedCardIds.length < 2) {
      continue;
    }

    const afterSharedOrder = afterOrder.filter((cardId) =>
      sharedCardIds.includes(cardId),
    );

    if (
      !sharedCardIds.every((cardId, index) => afterSharedOrder[index] === cardId)
    ) {
      shuffledPlayers.push(player.sessionId);
    }
  }

  return shuffledPlayers;
}

/**
 * Converts an internal duel zone name to its persisted domain-event zone name.
 */
export function toEventZoneName(
  zone: CardLocation['zone'],
):
  | 'LEADER'
  | 'STAGE_AREA'
  | 'DECK'
  | 'DON_DECK'
  | 'HAND'
  | 'LIFE'
  | 'CHARACTER_AREA'
  | 'COST_AREA'
  | 'TRASH' {
  switch (zone) {
    case 'leader':
      return 'LEADER';
    case 'stage':
      return 'STAGE_AREA';
    case 'deck':
      return 'DECK';
    case 'donDeck':
      return 'DON_DECK';
    case 'hand':
      return 'HAND';
    case 'life':
      return 'LIFE';
    case 'characters':
      return 'CHARACTER_AREA';
    case 'cost':
      return 'COST_AREA';
    case 'trash':
      return 'TRASH';
  }
}

/**
 * Captures rested state for every DON!! card currently in cost areas.
 */
export function captureCostZoneRestSnapshot(
  state: DuelState,
): CostZoneRestSnapshot {
  const snapshot: CostZoneRestSnapshot = new Map();

  for (const player of state.players.values()) {
    for (const donCard of player.zones.cost) {
      snapshot.set(donCard.instanceId, donCard.rested);
    }
  }

  return snapshot;
}

/**
 * Counts DON!! cards that were unrested before and are now rested.
 */
export function countNewlyRestedCostDonCards(
  before: CostZoneRestSnapshot,
  state: DuelState,
  ownerSessionId: string,
): number {
  let count = 0;
  const player = state.players.get(ownerSessionId);

  if (!player) {
    return 0;
  }

  for (const donCard of player.zones.cost) {
    if (before.get(donCard.instanceId) === false && donCard.rested) {
      count += 1;
    }
  }

  return count;
}

/**
 * Finds a card anywhere in the duel state by its instance id.
 */
export function findCardByInstanceId(
  state: DuelState,
  instanceId: string,
): DuelCard | null {
  for (const player of state.players.values()) {
    if (player.zones.leader.instanceId === instanceId) {
      return player.zones.leader;
    }

    if (player.zones.stage.instanceId === instanceId) {
      return player.zones.stage;
    }

    for (const zone of [
      player.zones.deck,
      player.zones.donDeck,
      player.zones.hand,
      player.zones.life,
      player.zones.characters,
      player.zones.cost,
      player.zones.trash,
    ]) {
      const match = zone.find((card) => card.instanceId === instanceId);

      if (match) {
        return match;
      }
    }
  }

  return null;
}
