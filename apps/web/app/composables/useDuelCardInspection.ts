import type { Card, PublicCard } from '@onepiecetcg/shared'
import type { HoveredDuelCard } from '~/utils/hoveredDuelCard'
import { createHoveredDuelCard, mergeHoveredDuelCardDetails } from '~/utils/hoveredDuelCard'
import type { ComputedRef, Ref } from 'vue'

type UseDuelCardInspectionOptions = {
  api: <T>(path: string) => Promise<T>
  pendingEffectDecisionId: ComputedRef<string | null>
  pendingEffectPromptType: ComputedRef<string | null>
  selectedEffectCardIds: Ref<string[]>
}

/**
 * Manages hovered card inspection, effect prompt preview state, and catalog detail hydration.
 */
export function useDuelCardInspection(options: UseDuelCardInspectionOptions) {
  const hoveredCard = ref<HoveredDuelCard | null>(null)
  const hoveredEffectPromptCard = ref<HoveredDuelCard | null>(null)
  const selectedEffectPromptCard = ref<HoveredDuelCard | null>(null)
  const hoveredCardCatalogDetails = reactive<Record<string, Pick<Card, 'text' | 'trigger'> | undefined>>({})
  const pendingHoveredCardDetailIds = ref<string[]>([])
  const hoveredCardDetailRetryTimestamps = reactive<Record<string, number | undefined>>({})
  const hoveredCardDetailRetryDelayMs = 5_000

  const inspectedCard = computed(() =>
    hoveredCard.value
    ?? hoveredEffectPromptCard.value
    ?? selectedEffectPromptCard.value
  )

  const effectPromptLinkedPreviewInstanceId = computed(() =>
    hoveredEffectPromptCard.value?.instanceId
    ?? selectedEffectPromptCard.value?.instanceId
    ?? null
  )

  const effectPromptLinkedSelectedInstanceIds = computed(() =>
    options.pendingEffectPromptType.value === 'selectCards'
      ? [...options.selectedEffectCardIds.value]
      : []
  )

  const resolvedHoveredCard = computed(() =>
    mergeHoveredDuelCardDetails(
      inspectedCard.value,
      inspectedCard.value ? hoveredCardCatalogDetails[inspectedCard.value.cardId] : null
    )
  )

  const isHoveredCardDetailPending = computed(() =>
    Boolean(
      inspectedCard.value
      && pendingHoveredCardDetailIds.value.includes(inspectedCard.value.cardId)
    )
  )

  const hoveredCardRows = computed<Array<[string, string | number]>>(() => {
    if (!resolvedHoveredCard.value) {
      return []
    }

    return [
      ['Numero', resolvedHoveredCard.value.number],
      ['Type', resolvedHoveredCard.value.type],
      ['Couleur', resolvedHoveredCard.value.colors.join(', ') || 'Aucune'],
      ['Cout', resolvedHoveredCard.value.cost ?? '-'],
      ['Puissance', resolvedHoveredCard.value.power ?? '-'],
      ['Contre', resolvedHoveredCard.value.counter ?? '-'],
      ['Vie', resolvedHoveredCard.value.life ?? '-'],
      ['Declenchement', resolvedHoveredCard.value.trigger ?? '-']
    ]
  })

  watch(
    () => inspectedCard.value,
    (card) => {
      if (!card) {
        return
      }

      if (card.text === undefined && card.trigger === undefined) {
        return
      }

      hoveredCardCatalogDetails[card.cardId] = {
        text: card.text ?? null,
        trigger: card.trigger ?? null
      }
      hoveredCardDetailRetryTimestamps[card.cardId] = undefined
    },
    { immediate: true }
  )

  watch(
    () => inspectedCard.value?.cardId ?? null,
    async (cardId) => {
      if (!cardId || hoveredCardCatalogDetails[cardId]) {
        return
      }

      const nextRetryAt = hoveredCardDetailRetryTimestamps[cardId]

      if (nextRetryAt && Date.now() < nextRetryAt) {
        return
      }

      if (!pendingHoveredCardDetailIds.value.includes(cardId)) {
        pendingHoveredCardDetailIds.value = [...pendingHoveredCardDetailIds.value, cardId]
      }

      try {
        const card = await options.api<Card>(`/catalog/cards/${cardId}`)

        hoveredCardCatalogDetails[cardId] = {
          text: card.text,
          trigger: card.trigger
        }
      } catch {
        hoveredCardDetailRetryTimestamps[cardId] = Date.now() + hoveredCardDetailRetryDelayMs
      } finally {
        pendingHoveredCardDetailIds.value = pendingHoveredCardDetailIds.value.filter(id => id !== cardId)
      }
    },
    { immediate: true }
  )

  watch(
    options.pendingEffectDecisionId,
    () => {
      hoveredEffectPromptCard.value = null
      selectedEffectPromptCard.value = null
    }
  )

  function previewEffectPromptCard(card: PublicCard) {
    const preview = createHoveredDuelCard(card)
    hoveredEffectPromptCard.value = preview
    selectedEffectPromptCard.value = preview
  }

  function clearEffectPromptPreview() {
    hoveredEffectPromptCard.value = null
  }

  return {
    hoveredCard,
    hoveredCardRows,
    effectPromptLinkedPreviewInstanceId,
    effectPromptLinkedSelectedInstanceIds,
    isHoveredCardDetailPending,
    previewEffectPromptCard,
    clearEffectPromptPreview,
    resolvedHoveredCard
  }
}
