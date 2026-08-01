import type { DuelPlayerView, PrivateCard } from '@onepiecetcg/shared'
import type { ComputedRef, Ref } from 'vue'

type UseDuelHandInteractionOptions = {
  self: Ref<DuelPlayerView | null>
  phase: Ref<string>
  isSelfTurn: Ref<boolean>
  isMainPhase: Ref<boolean>
  isCombatInProgress: Ref<boolean>
  selfUntappedDonCount: Ref<number>
  isSelfCharacterZoneFull: Ref<boolean>
  selectableHandCardIds: ComputedRef<string[]>
  pendingCharacterInstanceId: Ref<string | null>
  onCacheBoardTravelSource: (card: PrivateCard) => void
  onPlayCard: (instanceId: string) => void
}

/**
 * Manages self-hand selection, dragging, and queued play submission for the duel board.
 */
export function useDuelHandInteraction(options: UseDuelHandInteractionOptions) {
  const draggedHandCardInstanceId = ref<string | null>(null)
  const selectedHandCardIds = ref<string[]>([])
  const pendingQueuedHandCardIds = ref<string[]>([])
  const queuedHandCardInstanceId = ref<string | null>(null)
  const invalidHandCardIds = ref<string[]>([])

  const draggableHandCardIds = computed(() => options.selectableHandCardIds.value)

  const draggedHandCard = computed(() =>
    options.self.value?.hand.find(card => card.instanceId === draggedHandCardInstanceId.value) ?? null
  )

  const draggedHandCardCount = computed(() => {
    if (!draggedHandCardInstanceId.value) {
      return 0
    }

    return selectedHandCardIds.value.includes(draggedHandCardInstanceId.value)
      ? Math.max(selectedHandCardIds.value.length, 1)
      : 1
  })

  function pulseHandCard(instanceId: string) {
    invalidHandCardIds.value = Array.from(new Set([...invalidHandCardIds.value, instanceId]))

    window.setTimeout(() => {
      invalidHandCardIds.value = invalidHandCardIds.value.filter(current => current !== instanceId)
    }, 220)
  }

  function clearSelectedHandCards() {
    selectedHandCardIds.value = []
  }

  function clearPendingHandPlayQueue() {
    pendingQueuedHandCardIds.value = []
    queuedHandCardInstanceId.value = null
  }

  function resetDraggedHandCard() {
    draggedHandCardInstanceId.value = null
  }

  function syncSelectedHandCardsWithHand() {
    const selectableIds = new Set(options.selectableHandCardIds.value)

    selectedHandCardIds.value = selectedHandCardIds.value.filter(id => selectableIds.has(id))

    if (draggedHandCardInstanceId.value && !selectableIds.has(draggedHandCardInstanceId.value)) {
      resetDraggedHandCard()
    }
  }

  function requestPlayFromHand(instanceId: string) {
    if (!options.isMainPhase.value || !options.isSelfTurn.value || options.isCombatInProgress.value) {
      pulseHandCard(instanceId)
      return false
    }

    const card = options.self.value?.hand.find(candidate => candidate.instanceId === instanceId)

    if (
      !card
      || !['Character', 'Stage'].includes(card.type)
      || (card.cost ?? Number.POSITIVE_INFINITY) > options.selfUntappedDonCount.value
    ) {
      pulseHandCard(instanceId)
      return false
    }

    if (card.type === 'Character' && options.isSelfCharacterZoneFull.value) {
      clearSelectedHandCards()
      options.pendingCharacterInstanceId.value = instanceId
      return true
    }

    if (card.type === 'Character' || card.type === 'Stage') {
      options.onCacheBoardTravelSource(card)
    }

    clearSelectedHandCards()
    options.onPlayCard(instanceId)
    return true
  }

  function resolveSelectedHandPlayIds(targetType: 'Character' | 'Stage', preferredInstanceId: string) {
    const orderedIds = options.self.value?.hand
      .filter(card => card.type === targetType)
      .map(card => card.instanceId) ?? []

    if (selectedHandCardIds.value.length > 0 && selectedHandCardIds.value.includes(preferredInstanceId)) {
      return orderedIds.filter(id => selectedHandCardIds.value.includes(id))
    }

    return orderedIds.includes(preferredInstanceId) ? [preferredInstanceId] : []
  }

  function playQueuedHandCards(instanceIds: string[]) {
    const remainingIds = [...instanceIds]

    while (remainingIds.length > 0) {
      const nextInstanceId = remainingIds.shift()

      if (!nextInstanceId) {
        continue
      }

      const isQueued = remainingIds.length > 0
      queuedHandCardInstanceId.value = nextInstanceId
      pendingQueuedHandCardIds.value = remainingIds

      const accepted = requestPlayFromHand(nextInstanceId)

      if (!accepted) {
        clearPendingHandPlayQueue()
        return
      }

      if (!isQueued && !options.pendingCharacterInstanceId.value) {
        clearPendingHandPlayQueue()
      }

      return
    }

    clearPendingHandPlayQueue()
  }

  function syncPendingHandPlayQueue(current: DuelPlayerView | null) {
    if (!queuedHandCardInstanceId.value) {
      return
    }

    if (options.pendingCharacterInstanceId.value === queuedHandCardInstanceId.value) {
      return
    }

    const queuedCardStillInHand = current?.hand.some(card => card.instanceId === queuedHandCardInstanceId.value) ?? false

    if (queuedCardStillInHand) {
      return
    }

    queuedHandCardInstanceId.value = null

    if (pendingQueuedHandCardIds.value.length === 0) {
      clearPendingHandPlayQueue()
      return
    }

    playQueuedHandCards(pendingQueuedHandCardIds.value)
  }

  function toggleSelectedHandCard(instanceId: string) {
    if (!options.selectableHandCardIds.value.includes(instanceId)) {
      pulseHandCard(instanceId)
      return
    }

    if (selectedHandCardIds.value.includes(instanceId)) {
      selectedHandCardIds.value = selectedHandCardIds.value.filter(id => id !== instanceId)
      return
    }

    selectedHandCardIds.value = [...selectedHandCardIds.value, instanceId]
  }

  function onSelfHandCardClick(instanceId: string, optionsArg: { ctrlKey: boolean }) {
    if (optionsArg.ctrlKey) {
      toggleSelectedHandCard(instanceId)
      return
    }

    clearSelectedHandCards()
    requestPlayFromHand(instanceId)
  }

  function onSelfHandCardDragStart(instanceId: string) {
    if (!draggableHandCardIds.value.includes(instanceId)) {
      pulseHandCard(instanceId)
      return
    }

    if (!selectedHandCardIds.value.includes(instanceId)) {
      clearSelectedHandCards()
    }

    draggedHandCardInstanceId.value = instanceId
  }

  function onSelfHandCardDragEnd() {
    clearSelectedHandCards()
    resetDraggedHandCard()
  }

  function onInvalidHandCardDragAttempt(instanceId: string) {
    clearSelectedHandCards()
    resetDraggedHandCard()
    pulseHandCard(instanceId)
  }

  function onSelfCharacterZoneDrop() {
    if (!draggedHandCardInstanceId.value) {
      return
    }

    const instanceId = draggedHandCardInstanceId.value
    const handPlayIds = resolveSelectedHandPlayIds('Character', instanceId)
    resetDraggedHandCard()
    clearSelectedHandCards()
    playQueuedHandCards(handPlayIds)
  }

  function onSelfStageZoneDrop() {
    if (!draggedHandCardInstanceId.value) {
      return
    }

    const instanceId = draggedHandCardInstanceId.value
    const handPlayIds = resolveSelectedHandPlayIds('Stage', instanceId)
    resetDraggedHandCard()
    clearSelectedHandCards()
    playQueuedHandCards(handPlayIds)
  }

  watch(options.selectableHandCardIds, syncSelectedHandCardsWithHand, { immediate: true })

  watch(
    [options.phase, options.isSelfTurn],
    ([currentPhase, selfTurn], [previousPhase, previousSelfTurn]) => {
      if (
        currentPhase === 'main'
        && selfTurn
        && (previousPhase !== 'main' || !previousSelfTurn)
      ) {
        clearSelectedHandCards()
        clearPendingHandPlayQueue()
        resetDraggedHandCard()
        invalidHandCardIds.value = []
      }
    },
    { immediate: true }
  )

  return {
    draggedHandCard,
    draggedHandCardCount,
    draggedHandCardInstanceId,
    draggableHandCardIds,
    invalidHandCardIds,
    pulseHandCard,
    selectedHandCardIds,
    clearPendingHandPlayQueue,
    clearSelectedHandCards,
    onInvalidHandCardDragAttempt,
    onSelfCharacterZoneDrop,
    onSelfHandCardClick,
    onSelfHandCardDragEnd,
    onSelfHandCardDragStart,
    onSelfStageZoneDrop,
    resetDraggedHandCard,
    syncPendingHandPlayQueue
  }
}
