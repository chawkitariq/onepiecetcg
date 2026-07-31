import { describe, expect, it } from 'vitest';
import { DuelState, type DuelCard, type DuelPlayer } from '@onepiecetcg/shared';
import type {
  DuelEngineCardEventType,
  DuelEngineEffectBoundary,
  DuelEngineEffectBoundaryDeps,
} from './contracts.js';
import { createDuelGameplayRuntime } from './duel-gameplay-runtime.js';
import { createDuelRoomIsolatedGameplayRuntime } from './duel-isolated-gameplay-runtime.js';

class StubEffectBoundary implements DuelEngineEffectBoundary {
  public constructor(private readonly deps: DuelEngineEffectBoundaryDeps) {}

  private importedState: unknown = { imported: false };

  public hasPendingPlayerInteraction(): boolean {
    return false;
  }

  public getPendingEffectDecision() {
    return null;
  }

  public reapplyContinuousEffects(): void {}

  public clearTurnModifiers(): void {}

  public clearTurnStartModifiers(): void {}

  public clearCombatModifiers(): void {}

  public exportState(): unknown {
    return this.importedState;
  }

  public importState(state: unknown): void {
    this.importedState = state;
  }

  public applyKoReplacement(): boolean {
    return false;
  }

  public applyMoveReplacement(): boolean {
    return false;
  }

  public emitCardEvent(
    _event: DuelEngineCardEventType,
    _playerSessionId: string,
    _card: DuelCard,
  ): void {}

  public emitWindowEffects(): void {}

  public emitPlayedCard(): void {}

  public emitDonAttached(): void {}

  public emitDonReturned(): void {}

  public emitBattleKo(): void {}

  public getNextPlayCostModifier(): number {
    return 0;
  }

  public consumeNextPlayCostModifier(): void {}

  public hasCounterEffect(): boolean {
    return false;
  }

  public emitCounterUsage(): void {}

  public resolveRevealedLifeCard(): 'addedToHand' {
    return 'addedToHand';
  }
}

function createLiveEffectBoundaryState() {
  const state = new DuelState();
  const runtime = createDuelGameplayRuntime({
    state,
    maxClients: 2,
    addLog: () => undefined,
    reportMainPhaseError: () => undefined,
    reportCombatError: () => undefined,
    broadcastCardView: () => undefined,
    onPendingEffectDecisionChange: () => undefined,
    shuffleCards: () => undefined,
    finalizeMatch: () => undefined,
    recordMatchResult: () => undefined,
    markMatchStarted: () => undefined,
    unshiftIntoTrash: () => undefined,
    knockOutCharacter: () => undefined,
    knockOutCharacterById: () => false,
    isProtectedFromBattleKo: () => false,
    createEffectBoundary: (deps) => new StubEffectBoundary(deps),
  });

  return runtime.effectBoundary.exportState();
}

describe('createDuelRoomIsolatedGameplayRuntime', () => {
  it('creates a detached runtime with imported lifecycle and boundary state', () => {
    const liveState = new DuelState();
    const importedLifecycleStates: unknown[] = [];
    const isolatedRuntime = createDuelRoomIsolatedGameplayRuntime({
      liveState,
      liveLifecycleState: {
        authUserIdBySession: [],
        playerIdBySession: [],
        nextPlayerOrdinal: 1,
        matchStartedAt: null,
        matchResultRecorded: false,
      },
      liveEffectBoundaryState: createLiveEffectBoundaryState(),
      maxClients: 2,
      createLifecycleForState: () =>
        ({
          importState: (state: unknown) => {
            importedLifecycleStates.push(state);
          },
          exportState: () => null,
          finalizeMatch: () => undefined,
          recordMatchResult: () => undefined,
          markMatchStarted: () => undefined,
        }) as never,
      appendLogToState: () => undefined,
      shuffleCards: () => undefined,
      unshiftIntoTrash: () => undefined,
      knockOutCharacter: (
        _state: DuelState,
        _effectBoundary: DuelEngineEffectBoundary,
        _owner: DuelPlayer,
        _card: DuelCard,
      ) => undefined,
      knockOutCharacterById: () => false,
      isProtectedFromBattleKo: () => false,
      createEffectBoundary: (deps) => new StubEffectBoundary(deps),
    });

    expect(isolatedRuntime.state).not.toBe(liveState);
    expect(importedLifecycleStates).toHaveLength(1);
    expect(isolatedRuntime.mainPhaseErrors).toEqual([]);
    expect(isolatedRuntime.combatErrors).toEqual([]);
    expect(isolatedRuntime.gameplayRuntime.effectBoundary.exportState()).toEqual(
      createLiveEffectBoundaryState(),
    );
  });
});
