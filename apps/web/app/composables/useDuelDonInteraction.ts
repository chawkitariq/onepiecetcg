import type { ComputedRef, Ref } from 'vue'

type UseDuelDonInteractionOptions = {
  canAttachDon: Ref<boolean>
  selectableDonCardIds: ComputedRef<string[]>
  onAttachDon: (target: 'leader' | 'character', targetInstanceId: string | undefined, count: number) => void
  onCacheAttachedDonTravelSources: (instanceIds: string[]) => void
  onInvalidLeaderTarget: () => void
  onInvalidCharacterTarget: (instanceId: string) => void
}

/**
 * Manages self DON!! selection, dragging, and attach submission for the duel board.
 */
export function useDuelDonInteraction(options: UseDuelDonInteractionOptions) {
  const selectedDonCardIds = ref<string[]>([])
  const selectedDonAnchorInstanceId = ref<string | null>(null)
  const draggedDonCardInstanceId = ref<string | null>(null)

  const draggedDonCardCount = computed(() => {
    if (!draggedDonCardInstanceId.value) {
      return 0
    }

    return selectedDonCardIds.value.includes(draggedDonCardInstanceId.value)
      ? Math.max(selectedDonCardIds.value.length, 1)
      : 1
  })

  function clearSelectedDonCards() {
    selectedDonCardIds.value = []
    selectedDonAnchorInstanceId.value = null
  }

  function clearDraggedDonCard() {
    draggedDonCardInstanceId.value = null
  }

  function syncSelectedDonCardsWithCost() {
    const selectableIds = new Set(options.selectableDonCardIds.value)

    if (!options.canAttachDon.value) {
      clearSelectedDonCards()
      clearDraggedDonCard()
      return
    }

    selectedDonCardIds.value = selectedDonCardIds.value.filter(id => selectableIds.has(id))

    if (!selectedDonAnchorInstanceId.value || !selectableIds.has(selectedDonAnchorInstanceId.value)) {
      selectedDonAnchorInstanceId.value = selectedDonCardIds.value.at(-1) ?? null
    }

    if (draggedDonCardInstanceId.value && !selectableIds.has(draggedDonCardInstanceId.value)) {
      clearDraggedDonCard()
    }
  }

  function resolveAttachDonSourceIds(preferredInstanceId?: string) {
    const orderedIds = options.selectableDonCardIds.value

    if (
      preferredInstanceId
      && selectedDonCardIds.value.length > 0
      && selectedDonCardIds.value.includes(preferredInstanceId)
    ) {
      return orderedIds.filter(id => selectedDonCardIds.value.includes(id))
    }

    if (!preferredInstanceId && selectedDonCardIds.value.length > 0) {
      return orderedIds.filter(id => selectedDonCardIds.value.includes(id))
    }

    if (preferredInstanceId) {
      return orderedIds.includes(preferredInstanceId) ? [preferredInstanceId] : []
    }

    const fallbackId = orderedIds.at(-1)

    return fallbackId ? [fallbackId] : []
  }

  function consumeAttachDonCount(preferredInstanceId?: string) {
    if (
      selectedDonCardIds.value.length > 0
      && (
        !preferredInstanceId
        || selectedDonCardIds.value.includes(preferredInstanceId)
      )
    ) {
      const count = selectedDonCardIds.value.length
      clearSelectedDonCards()

      return count
    }

    return 1
  }

  function attachDonToTarget(target: 'leader' | 'character', targetInstanceId?: string, preferredDonInstanceId?: string) {
    if (!options.canAttachDon.value) {
      if (target === 'leader') {
        options.onInvalidLeaderTarget()
      } else if (targetInstanceId) {
        options.onInvalidCharacterTarget(targetInstanceId)
      }
      return
    }

    const sourceIds = resolveAttachDonSourceIds(preferredDonInstanceId)

    if (sourceIds.length === 0) {
      if (target === 'leader') {
        options.onInvalidLeaderTarget()
      } else if (targetInstanceId) {
        options.onInvalidCharacterTarget(targetInstanceId)
      }
      return
    }

    const count = consumeAttachDonCount(preferredDonInstanceId)

    options.onCacheAttachedDonTravelSources(sourceIds)
    clearDraggedDonCard()
    options.onAttachDon(target, targetInstanceId, count)
  }

  function selectDonRangeTo(instanceId: string) {
    if (!options.canAttachDon.value || !options.selectableDonCardIds.value.includes(instanceId)) {
      return
    }

    const anchorId = selectedDonAnchorInstanceId.value

    if (!anchorId || !options.selectableDonCardIds.value.includes(anchorId)) {
      selectedDonCardIds.value = [instanceId]
      selectedDonAnchorInstanceId.value = instanceId
      return
    }

    const anchorIndex = options.selectableDonCardIds.value.indexOf(anchorId)
    const targetIndex = options.selectableDonCardIds.value.indexOf(instanceId)

    if (anchorIndex === -1 || targetIndex === -1) {
      selectedDonCardIds.value = [instanceId]
      selectedDonAnchorInstanceId.value = instanceId
      return
    }

    const [start, end] = anchorIndex < targetIndex
      ? [anchorIndex, targetIndex]
      : [targetIndex, anchorIndex]

    selectedDonCardIds.value = options.selectableDonCardIds.value.slice(start, end + 1)
  }

  function onSelfDonCardSelectionStart(instanceId: string) {
    if (!options.canAttachDon.value || !options.selectableDonCardIds.value.includes(instanceId)) {
      return
    }

    selectedDonAnchorInstanceId.value = instanceId
    selectedDonCardIds.value = [instanceId]
  }

  function onSelfDonCardSelectionHover(instanceId: string) {
    if (!selectedDonAnchorInstanceId.value) {
      return
    }

    selectDonRangeTo(instanceId)
  }

  function onSelfDonCardDragStart(instanceId: string) {
    if (!options.canAttachDon.value || !options.selectableDonCardIds.value.includes(instanceId)) {
      return
    }

    draggedDonCardInstanceId.value = instanceId
  }

  function onSelfDonCardDragEnd() {
    clearSelectedDonCards()
    clearDraggedDonCard()
  }

  function onSelfLeaderDonDrop() {
    if (!draggedDonCardInstanceId.value) {
      return
    }

    attachDonToTarget('leader', undefined, draggedDonCardInstanceId.value)
  }

  function onSelfCharacterDonDrop(_side: 0 | 1, instanceId: string) {
    if (!draggedDonCardInstanceId.value) {
      return
    }

    attachDonToTarget('character', instanceId, draggedDonCardInstanceId.value)
  }

  watch([options.selectableDonCardIds, options.canAttachDon], syncSelectedDonCardsWithCost, { immediate: true })

  return {
    draggedDonCardCount,
    draggedDonCardInstanceId,
    selectedDonCardIds,
    attachDonToTarget,
    clearDraggedDonCard,
    clearSelectedDonCards,
    onSelfCharacterDonDrop,
    onSelfDonCardDragEnd,
    onSelfDonCardDragStart,
    onSelfDonCardSelectionHover,
    onSelfDonCardSelectionStart,
    onSelfLeaderDonDrop
  }
}
