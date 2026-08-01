import type { DuelPlayerView } from '@onepiecetcg/shared'
import type { Ref } from 'vue'

type UseDuelTrashModalOptions = {
  self: Ref<DuelPlayerView | null>
  opponent: Ref<DuelPlayerView | null>
  queryCharacterZoneCardElement: (side: 0 | 1) => HTMLElement | null
  queryTrashCardElement: (side: 0 | 1, instanceId: string) => HTMLElement | null
}

/**
 * Manages the duel trash modal state and keeps its preview sizing in sync.
 */
export function useDuelTrashModal(options: UseDuelTrashModalOptions) {
  const openedTrashSide = ref<0 | 1 | null>(null)
  const selectedTrashCardInstanceId = ref<string | null>(null)
  const trashModalCardSize = ref<{ width: number, height: number } | null>(null)

  const activeTrashPlayer = computed(() => {
    if (openedTrashSide.value === 0) {
      return options.self.value
    }

    if (openedTrashSide.value === 1) {
      return options.opponent.value
    }

    return null
  })

  const activeTrashCards = computed(() => activeTrashPlayer.value?.trash ?? [])

  watch(activeTrashCards, (cards) => {
    if (cards.length === 0) {
      openedTrashSide.value = null
      selectedTrashCardInstanceId.value = null
      return
    }

    if (!cards.some(card => card.instanceId === selectedTrashCardInstanceId.value)) {
      selectedTrashCardInstanceId.value = cards[0]?.instanceId ?? null
    }
  })

  function closeTrashModal() {
    openedTrashSide.value = null
    selectedTrashCardInstanceId.value = null
    trashModalCardSize.value = null
  }

  function syncTrashModalCardSize(side: 0 | 1, instanceId: string) {
    if (typeof window === 'undefined') {
      return
    }

    const referenceElement = options.queryCharacterZoneCardElement(side) ?? options.queryTrashCardElement(side, instanceId)

    if (!referenceElement) {
      trashModalCardSize.value = null
      return
    }

    const { width, height } = referenceElement.getBoundingClientRect()

    if (width <= 0 || height <= 0) {
      trashModalCardSize.value = null
      return
    }

    trashModalCardSize.value = { width, height }
  }

  async function openTrashModal(side: 0 | 1) {
    const player = side === 0 ? options.self.value : options.opponent.value
    const firstCard = player?.trash[0]

    if (!player || !firstCard) {
      return
    }

    openedTrashSide.value = side
    selectedTrashCardInstanceId.value = firstCard.instanceId
    syncTrashModalCardSize(side, firstCard.instanceId)
  }

  return {
    activeTrashCards,
    activeTrashPlayer,
    closeTrashModal,
    openTrashModal,
    openedTrashSide,
    selectedTrashCardInstanceId,
    trashModalCardSize
  }
}
