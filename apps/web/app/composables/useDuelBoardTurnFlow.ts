import type { Ref } from 'vue'

type PendingEffectDecision = {
  id?: string
} | null

type UseDuelBoardTurnFlowOptions = {
  phase: Ref<string>
  isSelfTurn: Ref<boolean>
  isCombatInProgress: Ref<boolean>
  isAwaitingEffectDecision: Ref<boolean>
  pendingEffectDecision: Ref<PendingEffectDecision>
  autoAdvancePhases: ReadonlySet<string>
  showTurnFeedback: () => void
  clearTurnFeedbackTimeout: () => void
  endPhase: () => void
}

/**
 * Handles DuelBoard turn-entry feedback and frontend-only phase auto-advance.
 */
export function useDuelBoardTurnFlow(options: UseDuelBoardTurnFlowOptions) {
  watch(options.isSelfTurn, (selfTurn, previousSelfTurn) => {
    if (!selfTurn || previousSelfTurn || options.phase.value === 'finished') {
      return
    }

    options.showTurnFeedback()
  })

  onBeforeUnmount(() => {
    options.clearTurnFeedbackTimeout()
  })

  watch(
    [
      options.phase,
      options.isSelfTurn,
      options.isCombatInProgress,
      options.isAwaitingEffectDecision,
      options.pendingEffectDecision
    ],
    ([currentPhase, selfTurn, combatInProgress, awaitingEffectDecision, decision]) => {
      if (
        !selfTurn
        || combatInProgress
        || (awaitingEffectDecision && !decision)
        || !options.autoAdvancePhases.has(currentPhase)
        || currentPhase === 'finished'
      ) {
        return
      }

      window.setTimeout(() => {
        if (
          options.isSelfTurn.value
          && !options.isCombatInProgress.value
          && !(options.isAwaitingEffectDecision.value && !options.pendingEffectDecision.value)
          && options.phase.value === currentPhase
          && options.autoAdvancePhases.has(currentPhase)
        ) {
          options.endPhase()
        }
      }, 0)
    },
    { immediate: true }
  )
}
