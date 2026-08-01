import type { Ref } from 'vue'

type UseDuelBoardSelectionShellOptions = {
  isChoosingCharacterToDiscard: Ref<boolean>
  isChoosingTarget: Ref<boolean>
  selectedHandCardIds: Ref<string[]>
  selectedDonCardIds: Ref<string[]>
  querySelfCostCardElement: (instanceId: string) => HTMLElement | null
  cancelDiscardSelection: () => void
  cancelTargetSelection: () => void
  clearSelectedHandCards: () => void
  clearSelectedDonCards: () => void
  clearTransientBoardSelections: () => void
}

/**
 * Handles DuelBoard selection dismissal from outside clicks and Escape, plus keepalive hit testing.
 */
export function useDuelBoardSelectionShell(options: UseDuelBoardSelectionShellOptions) {
  const isInstructionModeActive = computed(() =>
    options.isChoosingCharacterToDiscard.value || options.isChoosingTarget.value
  )

  function cancelInstructionMode() {
    if (options.isChoosingCharacterToDiscard.value) {
      options.cancelDiscardSelection()
      return
    }

    if (options.isChoosingTarget.value) {
      options.cancelTargetSelection()
    }
  }

  function isWithinSelectedHandCard(target: EventTarget | null): boolean {
    if (!(target instanceof Node) || options.selectedHandCardIds.value.length === 0) {
      return false
    }

    return options.selectedHandCardIds.value.some((instanceId) => {
      const element = document.querySelector(`[data-duel-hand="true"] [data-instance-id="${CSS.escape(instanceId)}"]`)

      return element?.contains(target) ?? false
    })
  }

  function isWithinSelectedDonCard(target: EventTarget | null): boolean {
    if (!(target instanceof Node) || options.selectedDonCardIds.value.length === 0) {
      return false
    }

    return options.selectedDonCardIds.value.some((instanceId) => {
      const element = options.querySelfCostCardElement(instanceId)

      return element?.contains(target) ?? false
    })
  }

  function isWithinDonSelectionKeepAliveArea(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false
    }

    return Boolean(
      target.closest('[data-don-attach-target="true"]')
      || target.closest('[data-don-selection-keepalive="true"]')
    )
  }

  const boardContainer = useTemplateRef<HTMLElement>('board-container')

  onClickOutside(boardContainer, () => {
    if (isInstructionModeActive.value) {
      cancelInstructionMode()
    }
  })

  useEventListener(document, 'pointerdown', (event) => {
    const hasSelectedHandCards = options.selectedHandCardIds.value.length > 0
    const hasSelectedDonCards = options.selectedDonCardIds.value.length > 0

    if (!hasSelectedHandCards && !hasSelectedDonCards) {
      return
    }

    if (hasSelectedHandCards) {
      const handElement = document.querySelector('[data-duel-hand="true"]')

      if (isWithinSelectedHandCard(event.target) || (event.ctrlKey && handElement?.contains(event.target as Node))) {
        return
      }
    }

    if (hasSelectedDonCards && (isWithinSelectedDonCard(event.target) || isWithinDonSelectionKeepAliveArea(event.target))) {
      return
    }

    if (hasSelectedHandCards) {
      options.clearSelectedHandCards()
    }

    if (hasSelectedDonCards) {
      options.clearSelectedDonCards()
    }
  })

  defineShortcuts({
    escape: {
      handler: () => {
        if (isInstructionModeActive.value) {
          cancelInstructionMode()
        }

        options.clearTransientBoardSelections()
      }
    }
  })

  return {
    isInstructionModeActive
  }
}
