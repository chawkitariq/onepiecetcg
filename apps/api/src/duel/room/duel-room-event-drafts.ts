import type { DuelCard, DuelState } from '@onepiecetcg/shared';
import type { DomainEventDraft } from '../../duel-events/duel-domain-event.types';
import {
  captureCardLocations,
  findCardByInstanceId,
  findMovedCards,
  findShuffledDeckPlayers,
  inferZonePlacement,
  toEventZoneName,
  type CardLocation,
  type DuelStateSnapshot,
  type OrderedZoneSnapshot,
  type RefreshStepSnapshot,
} from './duel-room-state-snapshot';

export type DuelRoomEventDraftBuilderDeps = {
  getPlayerId: (sessionId: string) => string;
};

/**
 * Builds mulligan-related domain events and the initial turn start events when
 * mulligans transition the duel into a started match.
 */
export function buildMulliganEventDrafts(
  deps: DuelRoomEventDraftBuilderDeps,
  before: DuelStateSnapshot,
  state: DuelState,
  actorSessionId: string,
  tookMulligan: boolean,
): DomainEventDraft[] {
  const drafts: DomainEventDraft[] = [
    {
      type: 'MulliganRequested',
      version: 1,
      payload: {
        playerId: deps.getPlayerId(actorSessionId),
        tookMulligan,
      },
    },
    ...(tookMulligan
      ? [
          {
            type: 'DeckShuffled',
            version: 1,
            payload: {
              playerId: deps.getPlayerId(actorSessionId),
            },
          } satisfies DomainEventDraft,
        ]
      : []),
    {
      type: 'MulliganResolved',
      version: 1,
      payload: {
        playerId: deps.getPlayerId(actorSessionId),
        tookMulligan,
      },
    },
  ];

  if (!before.startedAt && state.startedAt) {
    drafts.push(
      {
        type: 'MatchStarted',
        version: 1,
        payload: {
          startedAt: state.startedAt,
          firstPlayerId: deps.getPlayerId(state.firstPlayerSessionId),
        },
      },
      {
        type: 'TurnStarted',
        version: 1,
        payload: {
          turn: state.turn,
          playerId: deps.getPlayerId(state.activePlayerSessionId),
        },
      },
      {
        type: 'PhaseChanged',
        version: 1,
        payload: {
          turn: state.turn,
          playerId: deps.getPlayerId(state.activePlayerSessionId),
          fromPhase: before.phase,
          toPhase: state.phase,
        },
      },
    );
  }

  return drafts;
}

/**
 * Builds turn and phase transition events between two state snapshots.
 */
export function buildTurnTransitionDrafts(
  deps: DuelRoomEventDraftBuilderDeps,
  before: DuelStateSnapshot,
  state: DuelState,
): DomainEventDraft[] {
  const drafts: DomainEventDraft[] = [];

  if (before.phase === 'end' && state.turn > before.turn) {
    drafts.push(
      {
        type: 'TurnEnded',
        version: 1,
        payload: {
          turn: before.turn,
          playerId: deps.getPlayerId(before.activePlayerSessionId),
        },
      },
      {
        type: 'TurnStarted',
        version: 1,
        payload: {
          turn: state.turn,
          playerId: deps.getPlayerId(state.activePlayerSessionId),
        },
      },
    );
  }

  if (before.phase !== state.phase || before.turn !== state.turn) {
    drafts.push({
      type: 'PhaseChanged',
      version: 1,
      payload: {
        turn: state.turn,
        playerId: deps.getPlayerId(state.activePlayerSessionId),
        fromPhase: before.phase,
        toPhase: state.phase,
      },
    });
  }

  return drafts;
}

/**
 * Builds events caused by the structural refresh/draw/DON!! step transitions.
 */
export function buildTurnStepDrafts(
  deps: DuelRoomEventDraftBuilderDeps,
  before: DuelStateSnapshot,
  beforeLocations: Map<string, CardLocation>,
  beforeRefresh: RefreshStepSnapshot,
  state: DuelState,
): DomainEventDraft[] {
  const movedCards = findMovedCards(beforeLocations, captureCardLocations(state));
  const drafts: DomainEventDraft[] = [];

  if (before.phase === 'refresh' && state.phase === 'draw') {
    for (const movedCard of movedCards) {
      if (movedCard.from.zone !== 'deck' || movedCard.to.zone !== 'hand') {
        continue;
      }

      drafts.push({
        type: 'CardDrawn',
        version: 1,
        payload: {
          playerId: deps.getPlayerId(movedCard.to.ownerSessionId),
          count: 1,
          cardInstanceId: movedCard.instanceId,
          cardDefinitionId: movedCard.to.cardId,
        },
      });
    }
  }

  if (before.phase === 'draw' && state.phase === 'don') {
    const donAddedByPlayer = new Map<string, number>();

    for (const movedCard of movedCards) {
      if (movedCard.from.zone !== 'donDeck' || movedCard.to.zone !== 'cost') {
        continue;
      }

      donAddedByPlayer.set(
        movedCard.to.ownerSessionId,
        (donAddedByPlayer.get(movedCard.to.ownerSessionId) ?? 0) + 1,
      );
    }

    for (const [ownerSessionId, count] of donAddedByPlayer.entries()) {
      drafts.push({
        type: 'DonAdded',
        version: 1,
        payload: {
          playerId: deps.getPlayerId(ownerSessionId),
          count,
        },
      });
    }
  }

  if (before.phase === 'end' && state.phase === 'refresh') {
    for (const [instanceId, source] of beforeRefresh.attachedDonSources) {
      const card = findCardByInstanceId(state, instanceId);

      if (!card || card.attachedDon >= source.attachedDon) {
        continue;
      }

      drafts.push({
        type: 'DonDetached',
        version: 1,
        payload: {
          playerId: deps.getPlayerId(source.ownerSessionId),
          sourceInstanceId: instanceId,
          sourceCardId: source.cardDefinitionId,
          count: source.attachedDon - card.attachedDon,
        },
      });
    }

    const refreshedByPlayer = new Map<string, number>();

    for (const player of state.players.values()) {
      for (const donCard of player.zones.cost) {
        if (
          beforeRefresh.restedCostCardIds.has(donCard.instanceId) &&
          !donCard.rested
        ) {
          refreshedByPlayer.set(
            player.sessionId,
            (refreshedByPlayer.get(player.sessionId) ?? 0) + 1,
          );
        }
      }
    }

    for (const [ownerSessionId, count] of refreshedByPlayer.entries()) {
      drafts.push({
        type: 'DonRefreshed',
        version: 1,
        payload: {
          playerId: deps.getPlayerId(ownerSessionId),
          count,
        },
      });
    }
  }

  return drafts;
}

/**
 * Builds movement-related events, including hand returns, deck/life placement,
 * and deck shuffle detection.
 */
export function buildCardMovementDrafts(
  deps: DuelRoomEventDraftBuilderDeps,
  beforeLocations: Map<string, CardLocation>,
  beforeDeckOrder: OrderedZoneSnapshot,
  beforeLifeOrder: OrderedZoneSnapshot,
  state: DuelState,
): DomainEventDraft[] {
  const drafts: DomainEventDraft[] = [];
  const shuffledPlayers = findShuffledDeckPlayers(beforeDeckOrder, state);

  for (const movedCard of findMovedCards(
    beforeLocations,
    captureCardLocations(state),
  )) {
    const fromZone = toEventZoneName(movedCard.from.zone);
    const toZone = toEventZoneName(movedCard.to.zone);
    const playerId = deps.getPlayerId(movedCard.to.ownerSessionId);

    drafts.push({
      type: 'CardMoved',
      version: 1,
      payload: {
        playerId,
        cardInstanceId: movedCard.instanceId,
        cardDefinitionId: movedCard.to.cardId,
        fromZone,
        toZone,
      },
    });

    if (movedCard.to.zone === 'hand' && movedCard.from.zone !== 'hand') {
      drafts.push({
        type: 'CardReturnedToHand',
        version: 1,
        payload: {
          playerId,
          cardInstanceId: movedCard.instanceId,
          cardDefinitionId: movedCard.to.cardId,
          fromZone,
        },
      });
    }

    if (movedCard.to.zone === 'deck') {
      drafts.push({
        type: 'CardPlacedOnDeck',
        version: 1,
        payload: {
          playerId,
          cardInstanceId: movedCard.instanceId,
          cardDefinitionId: movedCard.to.cardId,
          fromZone,
          placement: inferZonePlacement(
            movedCard.instanceId,
            state.players.get(movedCard.to.ownerSessionId)?.zones.deck,
            beforeDeckOrder.get(movedCard.to.ownerSessionId),
          ),
        },
      });
    }

    if (movedCard.to.zone === 'life') {
      drafts.push({
        type: 'CardAddedToLife',
        version: 1,
        payload: {
          playerId,
          cardInstanceId: movedCard.instanceId,
          cardDefinitionId: movedCard.to.cardId,
          fromZone,
          placement: inferZonePlacement(
            movedCard.instanceId,
            state.players.get(movedCard.to.ownerSessionId)?.zones.life,
            beforeLifeOrder.get(movedCard.to.ownerSessionId),
          ),
        },
      });
    }
  }

  for (const ownerSessionId of shuffledPlayers) {
    drafts.push({
      type: 'DeckShuffled',
      version: 1,
      payload: {
        playerId: deps.getPlayerId(ownerSessionId),
      },
    });
  }

  return drafts;
}

/**
 * Builds the terminal match-ended event when the duel newly transitions into a
 * finished state.
 */
export function buildTerminalEventDrafts(
  deps: DuelRoomEventDraftBuilderDeps,
  before: DuelStateSnapshot,
  state: DuelState,
): DomainEventDraft[] {
  if (before.phase === 'finished' || state.phase !== 'finished') {
    return [];
  }

  return [
    {
      type: 'MatchEnded',
      version: 1,
      payload: {
        winnerPlayerId: deps.getPlayerId(state.winnerSessionId),
        endReason: state.endReason,
        finishedAt: state.finishedAt,
      },
    },
  ];
}

/**
 * Builds the initial player/deck/opening-hand events when the persistent duel
 * event stream is created.
 */
export function buildInitialEventStreamDrafts(
  deps: DuelRoomEventDraftBuilderDeps,
  state: DuelState,
): DomainEventDraft[] {
  const drafts: DomainEventDraft[] = [];

  for (const player of state.players.values()) {
    const playerId = deps.getPlayerId(player.sessionId);
    drafts.push(
      {
        type: 'PlayerJoined',
        version: 1,
        payload: {
          playerId,
          displayName: player.displayName,
        },
      },
      {
        type: 'DeckLocked',
        version: 1,
        payload: {
          playerId,
          deckId: player.deckId,
          leaderCardId: player.zones.leader.cardId,
        },
      },
      {
        type: 'OpeningHandDrawn',
        version: 1,
        payload: {
          playerId,
          count: player.zones.hand.length,
        },
      },
    );
  }

  return drafts;
}
