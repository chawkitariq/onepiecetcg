import type {
  DuelCard,
  DuelEndReason,
  DuelLogLevel,
  DuelPlayer,
  DuelState,
} from '@onepiecetcg/shared';
import type { DuelEngineEffectBoundary } from './contracts.js';
import {
  captureDuelRoomCardKeywordSnapshot,
  restoreDuelRoomCardKeywordSnapshot,
} from './duel-card-keyword-snapshot.js';
import {
  createDuelGameplayRuntime,
  type DuelGameplayRuntime,
} from './duel-gameplay-runtime.js';
import { DuelRoomRuntimeState } from './duel-runtime-state.js';
import { cloneRoomDuelState } from './duel-state-copy.js';

/**
 * State and helpers used while executing a gameplay command against a detached
 * clone of the live duel room state.
 */
export type DuelRoomIsolatedGameplayRuntime = {
  state: DuelState;
  lifecycle: {
    importState(state: unknown): void;
    exportState(): unknown;
    finalizeMatch(endReason: DuelEndReason, winnerSessionId: string): void;
    recordMatchResult(): void;
    markMatchStarted(startedAt: Date): void;
  };
  gameplayRuntime: DuelGameplayRuntime;
  runtimeState: DuelRoomRuntimeState;
  mainPhaseErrors: string[];
  combatErrors: string[];
};

/**
 * Dependencies required to build an isolated gameplay runtime from the current
 * live room state.
 */
export type CreateDuelRoomIsolatedGameplayRuntimeInput = {
  liveState: DuelState;
  liveLifecycleState: unknown;
  liveEffectBoundaryState: ReturnType<DuelEngineEffectBoundary['exportState']>;
  maxClients: number;
  createLifecycleForState: (
    state: DuelState,
  ) => DuelRoomIsolatedGameplayRuntime['lifecycle'];
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
  createEffectBoundary: Parameters<
    typeof createDuelGameplayRuntime
  >[0]['createEffectBoundary'];
};

/**
 * Creates a detached gameplay runtime that can resolve commands without
 * mutating the live room state until adoption is explicitly requested.
 */
export function createDuelRoomIsolatedGameplayRuntime(
  input: CreateDuelRoomIsolatedGameplayRuntimeInput,
): DuelRoomIsolatedGameplayRuntime {
  const state = cloneRoomDuelState(input.liveState);
  const keywordSnapshot = captureDuelRoomCardKeywordSnapshot(state);
  const lifecycle = input.createLifecycleForState(state);
  lifecycle.importState(input.liveLifecycleState);
  const mainPhaseErrors: string[] = [];
  const combatErrors: string[] = [];
  const gameplayRuntime = createDuelGameplayRuntime({
    state,
    maxClients: input.maxClients,
    addLog: (message, level, actorSessionId) =>
      input.appendLogToState(state, message, level, actorSessionId),
    reportMainPhaseError: (message) => {
      mainPhaseErrors.push(message);
    },
    reportCombatError: (message) => {
      combatErrors.push(message);
    },
    broadcastCardView: () => undefined,
    onPendingEffectDecisionChange: () => undefined,
    shuffleCards: (cards) => input.shuffleCards(cards),
    finalizeMatch: (endReason: DuelEndReason, winnerSessionId: string) =>
      lifecycle.finalizeMatch(endReason, winnerSessionId),
    recordMatchResult: () => lifecycle.recordMatchResult(),
    markMatchStarted: (startedAt) => lifecycle.markMatchStarted(startedAt),
    unshiftIntoTrash: (player, card) => input.unshiftIntoTrash(player, card),
    knockOutCharacter: (owner, card, reason, skipReplacement) =>
      input.knockOutCharacter(
        state,
        gameplayRuntime.effectBoundary,
        owner,
        card,
        reason,
        skipReplacement,
      ),
    knockOutCharacterById: (playerSessionId, instanceId, reason) =>
      input.knockOutCharacterById(
        state,
        gameplayRuntime.effectBoundary,
        playerSessionId,
        instanceId,
        reason,
      ),
    isProtectedFromBattleKo: (defendingCard, attackerCard) =>
      input.isProtectedFromBattleKo(defendingCard, attackerCard),
    createEffectBoundary: input.createEffectBoundary,
  });
  gameplayRuntime.effectBoundary.importState(input.liveEffectBoundaryState);
  restoreDuelRoomCardKeywordSnapshot(state, keywordSnapshot);

  return {
    state,
    lifecycle,
    gameplayRuntime,
    runtimeState: new DuelRoomRuntimeState({ state }),
    mainPhaseErrors,
    combatErrors,
  };
}
