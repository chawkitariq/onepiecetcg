import type {
  EffectDecisionResponse,
  PendingEffectDecision
} from '@onepiecetcg/shared'

type ActionErrorMessage = {
  message: string
}

type EffectDecisionWaitingMessage = {
  playerSessionId: string
}

type DuelRoomTransport = {
  version: Ref<number>
  errorMessage: Ref<string | null>
  pendingEffectDecision: Ref<PendingEffectDecision | null>
  effectDecisionWaitingOnSessionId: Ref<string | null>
  resolveEffectDecision: (response: EffectDecisionResponse) => void
  clearLocalDecisionState: () => void
  clearError: () => void
}

/** Owns Colyseus message wiring for action errors and out-of-band effect decisions. */
export function useDuelRoomTransport(): DuelRoomTransport {
  const { room, sendMessage } = useColyseus()
  const version = ref(0)
  const errorMessage = ref<string | null>(null)
  const pendingEffectDecision = ref<PendingEffectDecision | null>(null)
  const effectDecisionWaitingOnSessionId = ref<string | null>(null)

  function onRoomStateChange() {
    version.value += 1
  }

  function onActionError(payload: ActionErrorMessage) {
    errorMessage.value = payload.message
  }

  function onPendingEffectDecision(payload: PendingEffectDecision) {
    pendingEffectDecision.value = payload
    effectDecisionWaitingOnSessionId.value = payload.playerSessionId
  }

  function onClearPendingEffectDecision() {
    pendingEffectDecision.value = null
  }

  function onEffectDecisionWaiting(payload: EffectDecisionWaitingMessage) {
    effectDecisionWaitingOnSessionId.value = payload.playerSessionId
  }

  function onClearEffectDecisionWaiting() {
    effectDecisionWaitingOnSessionId.value = null
  }

  function clearLocalDecisionState() {
    pendingEffectDecision.value = null
    effectDecisionWaitingOnSessionId.value = null
  }

  function clearError() {
    errorMessage.value = null
  }

  function resolveEffectDecision(response: EffectDecisionResponse) {
    errorMessage.value = null
    sendMessage('resolveEffectDecision', response)
  }

  watch(room, (nextRoom, previousRoom) => {
    previousRoom?.onStateChange.remove(onRoomStateChange)
    nextRoom?.onStateChange(onRoomStateChange)
    nextRoom?.onMessage?.('actionError', onActionError)
    nextRoom?.onMessage?.('pendingEffectDecision', onPendingEffectDecision)
    nextRoom?.onMessage?.('clearPendingEffectDecision', onClearPendingEffectDecision)
    nextRoom?.onMessage?.('effectDecisionWaiting', onEffectDecisionWaiting)
    nextRoom?.onMessage?.('clearEffectDecisionWaiting', onClearEffectDecisionWaiting)

    if (!nextRoom) {
      clearLocalDecisionState()
      return
    }

    version.value += 1
  }, { immediate: true })

  onScopeDispose(() => {
    room.value?.onStateChange.remove(onRoomStateChange)
  })

  return {
    version,
    errorMessage,
    pendingEffectDecision,
    effectDecisionWaitingOnSessionId,
    resolveEffectDecision,
    clearLocalDecisionState,
    clearError
  }
}
