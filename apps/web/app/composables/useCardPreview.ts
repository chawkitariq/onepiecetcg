import type { Card } from '@onepiecetcg/shared'
import type { Ref } from 'vue'

/**
 * Combines persistent card selection with a temporary hover preview.
 */
export function useCardPreview(selectedCard: Ref<Card | null>) {
  const hoveredCard = ref<Card | null>(null)
  const previewCard = computed(() => hoveredCard.value ?? selectedCard.value)

  function selectCard(card: Card) {
    selectedCard.value = card
  }

  function previewHoveredCard(card: Card) {
    hoveredCard.value = card
  }

  function clearHoveredCard(cardId?: string) {
    if (!hoveredCard.value) {
      return
    }

    if (cardId && hoveredCard.value.id !== cardId) {
      return
    }

    hoveredCard.value = null
  }

  return {
    hoveredCard: readonly(hoveredCard),
    previewCard,
    selectCard,
    previewHoveredCard,
    clearHoveredCard
  }
}
