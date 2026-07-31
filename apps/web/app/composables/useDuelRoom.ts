import type { DuelLogEntry, DuelPlayerView, FirstOrSecondChoice } from '@onepiecetcg/shared'

type DuelRoomDevOverride = ReturnType<typeof _createDuelRoomDevOverrideShape>

function _createDuelRoomDevOverrideShape() {
  return {
    self: ref<DuelPlayerView | null>(null),
    opponent: ref<DuelPlayerView | null>(null),
    phase: ref('setup'),
    turn: ref(0),
    winnerSessionId: ref<string | null>(null),
    startedAt: ref<string | null>(null),
    finishedAt: ref<string | null>(null),
    activePlayerSessionId: ref<string | null>(null),
    startingPlayerSessionId: ref<string | null>(null),
    firstPlayerSessionId: ref<string | null>(null),
    isSelfTurn: computed(() => false),
    isMainPhase: computed(() => false),
    canEndPhase: computed(() => false),
    selfUntappedDonCount: computed(() => 0),
    isSelfCharacterZoneFull: computed(() => false),
    logs: ref<DuelLogEntry[]>([]),
    errorMessage: ref<string | null>(null),
    pendingEffectDecision: ref(null),
    activeDecision: ref(null),
    isAwaitingEffectDecision: computed(() => false),
    selectedEffectCardIds: ref<string[]>([]),
    selectedEffectChoiceIds: ref<string[]>([]),
    selectableDecisionCardIds: computed(() => [] as string[]),
    selectableRevealedDecisionCardIds: computed(() => [] as string[]),
    selectableEffectCards: computed(() => [] as never[]),
    effectChoiceViews: computed(() => [] as never[]),
    effectDecisionSubmitState: computed(() => ({ canSubmit: false, reason: null as string | null })),
    selectableContext: computed(() => ({
      source: null,
      kind: 'none',
      selector: null,
      selectableCardInstanceIds: [] as string[],
      revealedCardInstanceIds: [] as string[]
    })),
    cardPower: () => 0,
    chooseFirstOrSecond: (_choice: FirstOrSecondChoice) => {},
    mulligan: (_shouldMulligan: boolean) => {},
    endPhase: () => {},
    playCard: () => {},
    attachDon: () => {},
    clearError: () => {},
    combat: ref(null),
    isCombatInProgress: computed(() => false),
    isSelfAttacker: computed(() => false),
    isSelfDefender: computed(() => false),
    canDeclareAttack: computed(() => false),
    isBlockingStep: computed(() => false),
    isCounteringStep: computed(() => false),
    isAwaitingTriggerDecision: computed(() => false),
    declareAttack: () => {},
    declareBlock: () => {},
    declareCounter: () => {},
    finishCounterStep: () => {},
    resolveTrigger: () => {},
    isOpponentDisconnected: computed(() => false),
    isSelfDesignatedToChoose: computed(() => false),
    isSelfTurnToMulligan: computed(() => false),
    toggleEffectCardSelection: (_instanceId: string) => {},
    toggleEffectChoiceSelection: (_choiceId: string) => {},
    submitEffectDecision: () => {},
    declineEffectDecision: () => {},
    cancelEffectDecisionSelection: () => {}
  }
}

function getDuelRoomDevOverride(): DuelRoomDevOverride | null {
  if (!import.meta.client || !import.meta.dev) {
    return null
  }

  const override = (window as typeof window & {
    __DUEL_ROOM_DEV_OVERRIDE__?: DuelRoomDevOverride
  }).__DUEL_ROOM_DEV_OVERRIDE__

  return override ?? null
}

/** Composes transport, structural state, and the generic decision UI for the duel board. */
export function useDuelRoom(): DuelRoomDevOverride {
  const devOverride = getDuelRoomDevOverride()

  if (devOverride) {
    return devOverride
  }

  const transport = useDuelRoomTransport()
  const state = useDuelRoomState(transport.version)
  const decisionUi = useDuelDecisionUi({
    self: state.self,
    opponent: state.opponent,
    selfSessionId: state.selfSessionId,
    activePlayerSessionId: state.activePlayerSessionId,
    isBlockingStep: state.isBlockingStep,
    isCounteringStep: state.isCounteringStep,
    isAwaitingTriggerDecision: state.isAwaitingTriggerDecision,
    isSelfDefender: state.isSelfDefender,
    pendingEffectDecision: transport.pendingEffectDecision,
    effectDecisionWaitingOnSessionId: transport.effectDecisionWaitingOnSessionId,
    resolveEffectDecision: transport.resolveEffectDecision
  })

  return {
    ...state,
    errorMessage: transport.errorMessage,
    clearError: transport.clearError,
    pendingEffectDecision: transport.pendingEffectDecision,
    activeDecision: decisionUi.activeDecision,
    isAwaitingEffectDecision: decisionUi.isAwaitingEffectDecision,
    selectedEffectCardIds: decisionUi.selectedEffectCardIds,
    selectedEffectChoiceIds: decisionUi.selectedEffectChoiceIds,
    selectableDecisionCardIds: computed(() => decisionUi.selectableContext.value.selectableCardInstanceIds),
    selectableRevealedDecisionCardIds: computed(() => decisionUi.selectableContext.value.revealedCardInstanceIds),
    toggleEffectCardSelection: decisionUi.toggleEffectCardSelection,
    toggleEffectChoiceSelection: decisionUi.toggleEffectChoiceSelection,
    submitEffectDecision: decisionUi.submitEffectDecision,
    declineEffectDecision: decisionUi.declineEffectDecision,
    cancelEffectDecisionSelection: decisionUi.cancelEffectDecisionSelection,
    selectableEffectCards: decisionUi.selectableEffectCards,
    effectChoiceViews: decisionUi.effectChoiceViews,
    effectDecisionSubmitState: decisionUi.effectDecisionSubmitState,
    selectableContext: decisionUi.selectableContext
  }
}
