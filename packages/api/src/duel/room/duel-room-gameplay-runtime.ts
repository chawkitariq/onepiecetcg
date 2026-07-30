import type {
  DuelCard,
  DuelEndReason,
  DuelPlayer,
  DuelState,
  PendingEffectDecision,
} from '@onepiecetcg/shared';
import { DuelRoomEffectBoundary } from '../effects/duel-room-effect-boundary';
import { DuelCardQueryEngine } from '../game-engine/duel-card-query-engine';
import { DuelCombatEngine } from '../game-engine/duel-combat-engine';
import { DuelMainPhaseEngine } from '../game-engine/duel-main-phase-engine';
import { DuelTurnEngine } from '../game-engine/duel-turn-engine';
import { DuelZoneEngine } from '../game-engine/duel-zone-engine';
import { DuelRoomRuntimeState } from './duel-room-runtime-state';

/**
 * Runtime bundle for one duel-state execution scope. The same factory can wire
 * live room state today and isolated working copies later.
 */
export type DuelRoomGameplayRuntime = {
  effectBoundary: DuelRoomEffectBoundary;
  turnEngine: DuelTurnEngine;
  mainPhaseEngine: DuelMainPhaseEngine;
  combatEngine: DuelCombatEngine;
  zoneEngine: DuelZoneEngine;
  cardQueryEngine: DuelCardQueryEngine;
  runtimeState: DuelRoomRuntimeState;
};

/**
 * Dependencies needed to wire the gameplay helpers for one duel-state scope.
 */
export type CreateDuelRoomGameplayRuntimeInput = {
  state: DuelState;
  maxClients: number;
  addLog: (message: string) => void;
  reportMainPhaseError: (message: string) => void;
  reportCombatError: (message: string) => void;
  broadcastCardView: (card: DuelCard) => void;
  onPendingEffectDecisionChange: (
    decision: PendingEffectDecision | null,
  ) => void;
  shuffleCards: (cards: {
    length: number;
    [index: number]: DuelCard | undefined;
  }) => void;
  finalizeMatch: (endReason: DuelEndReason, winnerSessionId: string) => void;
  recordMatchResult: () => void;
  markMatchStarted: (startedAt: Date) => void;
  unshiftIntoTrash: (player: DuelPlayer, card: DuelCard) => void;
  knockOutCharacter: (
    owner: DuelPlayer,
    card: DuelCard,
    reason?: 'battle' | 'effect',
    skipReplacement?: boolean,
  ) => void;
  knockOutCharacterById: (
    playerSessionId: string,
    instanceId: string,
    reason: 'battle' | 'effect',
  ) => boolean;
  isProtectedFromBattleKo: (
    defendingCard: DuelCard,
    attackerCard: DuelCard,
  ) => boolean;
};

/**
 * Creates all state-scoped gameplay helpers used by the duel room.
 */
export function createDuelRoomGameplayRuntime(
  input: CreateDuelRoomGameplayRuntimeInput,
): DuelRoomGameplayRuntime {
  const runtimeState = new DuelRoomRuntimeState({
    state: input.state,
  });

  const cardQueryEngineRef: { current: DuelCardQueryEngine | null } = {
    current: null,
  };
  const zoneEngineRef: { current: DuelZoneEngine | null } = {
    current: null,
  };

  const effectBoundary = new DuelRoomEffectBoundary({
    state: input.state,
    addLog: input.addLog,
    onPendingEffectDecisionChange: input.onPendingEffectDecisionChange,
    getPlayer: (sessionId) => input.state.players.get(sessionId),
    getOpponentSessionId: (sessionId) =>
      runtimeState.getOpponentSessionId(sessionId),
    getCard: (instanceId) =>
      cardQueryEngineRef.current?.getCardByInstanceId(instanceId) ?? null,
    getCards: (selector, controllerSessionId) =>
      cardQueryEngineRef.current?.getCardsForSelector(
        selector,
        controllerSessionId,
      ) ?? [],
    moveCard: (card, destinationPlayerSessionId, destinationZone, options) =>
      zoneEngineRef.current?.moveCardToZone(
        card,
        destinationPlayerSessionId,
        destinationZone,
        options,
      ),
    shuffleDeck: (playerSessionId) => {
      const player = input.state.players.get(playerSessionId);

      if (player) {
        input.shuffleCards(player.zones.deck);
      }
    },
    drawCard: (playerSessionId) =>
      zoneEngineRef.current?.drawCardForEffect(playerSessionId) ?? null,
    trashTopDeckCards: (playerSessionId, amount) =>
      zoneEngineRef.current?.trashTopDeckCards(playerSessionId, amount) ?? [],
    addDonToCost: (playerSessionId, amount, rested) =>
      zoneEngineRef.current?.addDonToCost(playerSessionId, amount, rested) ?? 0,
    attachDon: (playerSessionId, targetInstanceId, amount, options) =>
      zoneEngineRef.current?.attachDonFromCost(
        playerSessionId,
        targetInstanceId,
        amount,
        options,
      ) ?? 0,
    returnDonToDonDeck: (playerSessionId, amount) => {
      const returned =
        zoneEngineRef.current?.returnEffectDonToDeck(playerSessionId, amount) ??
        0;
      const player = input.state.players.get(playerSessionId);

      if (returned > 0 && player) {
        effectBoundary.emitDonReturned(playerSessionId, player.zones.leader);
      }

      return returned;
    },
    koCharacter: (playerSessionId, instanceId, reason) =>
      input.knockOutCharacterById(playerSessionId, instanceId, reason),
    syncPlayer: (playerSessionId) => {
      const player = input.state.players.get(playerSessionId);

      if (player) {
        runtimeState.syncZoneCounts(player);
      }
    },
    broadcastCardView: input.broadcastCardView,
  });

  const cardQueryEngine = new DuelCardQueryEngine({
    state: input.state,
    getOpponentSessionId: (sessionId) =>
      runtimeState.getOpponentSessionId(sessionId),
    cardPower: (card) => runtimeState.cardPower(card),
  });
  cardQueryEngineRef.current = cardQueryEngine;

  const zoneEngine = new DuelZoneEngine({
    state: input.state,
    effectBoundary,
    broadcastCardView: input.broadcastCardView,
    syncZoneCounts: (player) => runtimeState.syncZoneCounts(player),
    findCardInZone: (player, zone, instanceId) =>
      runtimeState.findCardInZone(player, zone, instanceId),
    takeAttachableDonCards: (player, amount, rested) =>
      runtimeState.takeAttachableDonCards(player, amount, rested),
  });
  zoneEngineRef.current = zoneEngine;

  const mainPhaseEngine = new DuelMainPhaseEngine({
    state: input.state,
    effectBoundary,
    addLog: input.addLog,
    sendError: input.reportMainPhaseError,
    broadcastCardView: input.broadcastCardView,
    syncZoneCounts: (player) => runtimeState.syncZoneCounts(player),
    unshiftIntoTrash: input.unshiftIntoTrash,
    returnDonToCost: (player, sessionId, count) =>
      runtimeState.returnDonToCost(player, sessionId, count),
    findCardInZone: (player, zone, instanceId) =>
      runtimeState.findCardInZone(player, zone, instanceId),
    takeUntappedDonCards: (player, amount) =>
      runtimeState.takeUntappedDonCards(player, amount),
  });

  const combatEngine = new DuelCombatEngine({
    state: input.state,
    effectBoundary,
    addLog: input.addLog,
    sendError: input.reportCombatError,
    broadcastCardView: input.broadcastCardView,
    syncZoneCounts: (player) => runtimeState.syncZoneCounts(player),
    unshiftIntoTrash: input.unshiftIntoTrash,
    isCombatInProgress: () => runtimeState.isCombatInProgress(),
    getOpponentSessionId: (sessionId) =>
      runtimeState.getOpponentSessionId(sessionId),
    findCardInZone: (player, zone, instanceId) =>
      runtimeState.findCardInZone(player, zone, instanceId),
    cardPower: (card) => runtimeState.cardPower(card),
    knockOutCharacter: (owner, card) => input.knockOutCharacter(owner, card),
    isProtectedFromBattleKo: input.isProtectedFromBattleKo,
    finalizeMatch: input.finalizeMatch,
    recordMatchResult: input.recordMatchResult,
  });

  const turnEngine = new DuelTurnEngine({
    state: input.state,
    maxClients: input.maxClients,
    effectBoundary,
    addLog: input.addLog,
    shuffle: input.shuffleCards,
    syncZoneCounts: (player) => runtimeState.syncZoneCounts(player),
    returnDonToCost: (player, sessionId, count) =>
      runtimeState.returnDonToCost(player, sessionId, count),
    getOpponentSessionId: (sessionId) =>
      runtimeState.getOpponentSessionId(sessionId),
    isCombatInProgress: () => runtimeState.isCombatInProgress(),
    finalizeMatch: input.finalizeMatch,
    recordMatchResult: input.recordMatchResult,
    onMatchStarted: input.markMatchStarted,
  });

  return {
    effectBoundary,
    turnEngine,
    mainPhaseEngine,
    combatEngine,
    zoneEngine,
    cardQueryEngine,
    runtimeState,
  };
}
