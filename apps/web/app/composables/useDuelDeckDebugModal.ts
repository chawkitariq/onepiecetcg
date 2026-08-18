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
  const picker = useDuelCardPickerModal({
    cards: computed(() => options.self.value?.deck ?? []),
    queryReferenceCardElement: options.queryDeckCardElement
  })

  return {
    activeDeckCards: picker.activeCards,
    closeDeckDebugModal: picker.closeCardPicker,
    deckDebugModalCardSize: picker.pickerCardSize,
    openDeckDebugModal: picker.openCardPicker,
    openedDeckDebug: picker.openedCardPicker,
    selectedDeckCardInstanceId: picker.selectedCardInstanceId
  }
}
