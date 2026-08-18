import type { DuelPlayerView } from '@onepiecetcg/shared'
import type { Ref } from 'vue'

type UseDuelDeckDebugModalOptions = {
  self: Ref<DuelPlayerView | null>
  queryDeckCardElement: () => HTMLElement | null
}

/**
 * Specializes the generic card picker modal for the dev-only deck debug tool.
 */
export function useDuelDeckDebugModal(options: UseDuelDeckDebugModalOptions) {
  const deckDebugSearchQuery = ref('')
  const picker = useDuelCardPickerModal({
    cards: computed(() => options.self.value?.deck ?? []),
    queryReferenceCardElement: options.queryDeckCardElement
  })

  function resetDeckDebugSearchQuery() {
    deckDebugSearchQuery.value = ''
  }

  function openDeckDebugModal() {
    resetDeckDebugSearchQuery()
    picker.openCardPicker()
  }

  function closeDeckDebugModal() {
    resetDeckDebugSearchQuery()
    picker.closeCardPicker()
  }

  function toggleDeckDebugModal() {
    if (picker.openedCardPicker.value) {
      closeDeckDebugModal()
      return
    }

    openDeckDebugModal()
  }

  return {
    activeDeckCards: picker.activeCards,
    closeDeckDebugModal,
    deckDebugModalCardSize: picker.pickerCardSize,
    deckDebugSearchQuery,
    openDeckDebugModal,
    toggleDeckDebugModal,
    openedDeckDebug: picker.openedCardPicker,
    selectedDeckCardInstanceId: picker.selectedCardInstanceId
  }
}
