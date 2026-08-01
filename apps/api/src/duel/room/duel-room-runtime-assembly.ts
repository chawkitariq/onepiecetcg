import type {
  DuelCard,
  DuelEndReason,
  DuelLogLevel,
  DuelPlayer,
  DuelState,
  PendingEffectDecision,
} from '@onepiecetcg/shared';
import type {
  DuelEffectBoundary,
  DuelEngineEffectBoundary,
} from '@onepiecetcg/duel-engine';
import {
  createDuelRoomGameplayRuntime,
  type DuelRoomGameplayRuntime,
} from './duel-room-gameplay-runtime';
import {
  createDuelRoomIsolatedGameplayRuntime,
  type DuelRoomIsolatedGameplayRuntime,
} from './duel-room-isolated-gameplay-runtime';
import type {
  DuelRoomLifecycle,
  DuelRoomLifecycleState,
} from './duel-room-lifecycle';

type DuelRoomGameplayCallbacks = {
  shuffleCards: (cards: {
    length: number;
    [index: number]: DuelCard | undefined;
  }) => void;
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
 * Input needed to assemble the live gameplay runtime.
 */
export type CreateLiveDuelRoomGameplayRuntimeInput =
  DuelRoomGameplayCallbacks & {
    state: DuelState;
    maxClients: number;
    addLog: (
      message: string,
      level?: DuelLogLevel,
      actorSessionId?: string,
    ) => void;
    reportMainPhaseError: (message: string) => void;
    reportCombatError: (message: string) => void;
    broadcastCardView: (card: DuelCard) => void;
    onPendingEffectDecisionChange: (
      decision: PendingEffectDecision | null,
    ) => void;
    finalizeMatch: (endReason: DuelEndReason, winnerSessionId: string) => void;
    recordMatchResult: () => void;
    markMatchStarted: (startedAt: Date) => void;
  };

/**
 * Input needed to assemble an isolated gameplay runtime.
 */
export type CreateIsolatedDuelRoomGameplayRuntimeInput = {
  liveState: DuelState;
  liveLifecycleState: DuelRoomLifecycleState;
  liveEffectBoundaryState: ReturnType<DuelEffectBoundary['exportState']>;
  maxClients: number;
  createLifecycleForState: (state: DuelState) => DuelRoomLifecycle;
  appendLogToState: (
    state: DuelState,
    message: string,
    level?: DuelLogLevel,
    actorSessionId?: string,
  ) => void;
  shuffleCards: (cards: {
    length: number;
    [index: number]: DuelCard | undefined;
  }) => void;
  unshiftIntoTrash: (player: DuelPlayer, card: DuelCard) => void;
  knockOutCharacter: (
    state: DuelState,
    effectBoundary: DuelEngineEffectBoundary,
    owner: DuelPlayer,
    card: DuelCard,
    reason?: 'battle' | 'effect',
    skipReplacement?: boolean,
  ) => void;
  knockOutCharacterById: (
    state: DuelState,
    effectBoundary: DuelEngineEffectBoundary,
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
 * Creates the gameplay runtime bound to the live authoritative room state.
 */
export function createLiveDuelRoomGameplayRuntime(
  input: CreateLiveDuelRoomGameplayRuntimeInput,
): DuelRoomGameplayRuntime {
  return createDuelRoomGameplayRuntime({
    state: input.state,
    maxClients: input.maxClients,
    addLog: (message, level, actorSessionId) =>
      input.addLog(message, level, actorSessionId),
    reportMainPhaseError: (message) => input.reportMainPhaseError(message),
    reportCombatError: (message) => input.reportCombatError(message),
    broadcastCardView: (card) => input.broadcastCardView(card),
    onPendingEffectDecisionChange: (decision) =>
      input.onPendingEffectDecisionChange(decision),
    shuffleCards: (cards) => input.shuffleCards(cards),
    finalizeMatch: (endReason, winnerSessionId) =>
      input.finalizeMatch(endReason, winnerSessionId),
    recordMatchResult: () => input.recordMatchResult(),
    markMatchStarted: (startedAt) => input.markMatchStarted(startedAt),
    unshiftIntoTrash: (player, card) => input.unshiftIntoTrash(player, card),
    knockOutCharacter: (owner, card, reason, skipReplacement) =>
      input.knockOutCharacter(owner, card, reason, skipReplacement),
    knockOutCharacterById: (playerSessionId, instanceId, reason) =>
      input.knockOutCharacterById(playerSessionId, instanceId, reason),
    isProtectedFromBattleKo: (defendingCard, attackerCard) =>
      input.isProtectedFromBattleKo(defendingCard, attackerCard),
  });
}

/**
 * Creates the gameplay runtime bound to a detached cloned duel state.
 */
export function createIsolatedDuelRoomGameplayRuntime(
  input: CreateIsolatedDuelRoomGameplayRuntimeInput,
): DuelRoomIsolatedGameplayRuntime {
  return createDuelRoomIsolatedGameplayRuntime({
    liveState: input.liveState,
    liveLifecycleState: input.liveLifecycleState,
    liveEffectBoundaryState: input.liveEffectBoundaryState,
    maxClients: input.maxClients,
    createLifecycleForState: (state) => input.createLifecycleForState(state),
    appendLogToState: (state, message, level, actorSessionId) =>
      input.appendLogToState(state, message, level, actorSessionId),
    shuffleCards: (cards) => input.shuffleCards(cards),
    unshiftIntoTrash: (player, card) => input.unshiftIntoTrash(player, card),
    knockOutCharacter: (
      state,
      effectBoundary,
      owner,
      card,
      reason,
      skipReplacement,
    ) =>
      input.knockOutCharacter(
        state,
        effectBoundary,
        owner,
        card,
        reason,
        skipReplacement,
      ),
    knockOutCharacterById: (
      state,
      effectBoundary,
      playerSessionId,
      instanceId,
      reason,
    ) =>
      input.knockOutCharacterById(
        state,
        effectBoundary,
        playerSessionId,
        instanceId,
        reason,
      ),
    isProtectedFromBattleKo: (defendingCard, attackerCard) =>
      input.isProtectedFromBattleKo(defendingCard, attackerCard),
  });
}
