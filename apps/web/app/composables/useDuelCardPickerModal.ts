import type { Ref } from 'vue'

type UseDuelCardPickerModalOptions<TCard extends { instanceId: string }> = {
  cards: Ref<readonly TCard[]>
  queryReferenceCardElement: () => HTMLElement | null
}

/**
 * Normalizes the "pick a card from a list" modal behavior so future debug
 * tools can reuse the same open/close, selection, and sizing mechanics.
 */
export function useDuelCardPickerModal<TCard extends { instanceId: string }>(
  options: UseDuelCardPickerModalOptions<TCard>,
) {
  const openedCardPicker = ref(false)
  const selectedCardInstanceId = ref<string | null>(null)
  const pickerCardSize = ref<{ width: number, height: number } | null>(null)

  const activeCards = computed(() => options.cards.value)

  watch(activeCards, (cards) => {
    if (cards.length === 0) {
      openedCardPicker.value = false
      selectedCardInstanceId.value = null
      return
    }

    if (!cards.some(card => card.instanceId === selectedCardInstanceId.value)) {
      selectedCardInstanceId.value = cards[0]?.instanceId ?? null
    }
  })

  function closeCardPicker() {
    openedCardPicker.value = false
    selectedCardInstanceId.value = null
    pickerCardSize.value = null
  }

  function syncCardPickerSize() {
    if (typeof window === 'undefined') {
      return
    }

    const referenceElement = options.queryReferenceCardElement()

    if (!referenceElement) {
      pickerCardSize.value = null
      return
    }

    const { width, height } = referenceElement.getBoundingClientRect()

    if (width <= 0 || height <= 0) {
      pickerCardSize.value = null
      return
    }

    pickerCardSize.value = { width, height }
  }

  function openCardPicker() {
    const firstCard = options.cards.value[0]

    if (!firstCard) {
      return
    }

    openedCardPicker.value = true
    selectedCardInstanceId.value = firstCard.instanceId
    syncCardPickerSize()
  }

  return {
    activeCards,
    closeCardPicker,
    openedCardPicker,
    pickerCardSize,
    openCardPicker,
    selectedCardInstanceId
  }
}
