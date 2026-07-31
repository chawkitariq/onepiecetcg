import type { Card } from '@onepiecetcg/shared'
import { describe, expect, it } from 'vitest'

function createCard(overrides: Partial<Card> = {}): Card {
  return {
    id: overrides.id ?? 'card-1',
    number: overrides.number ?? 'OP01-001',
    name: overrides.name ?? 'Monkey.D.Luffy',
    set: overrides.set ?? { id: 'OP01', name: 'Romance Dawn' },
    text: overrides.text ?? '',
    colors: overrides.colors ?? ['Red'],
    type: overrides.type ?? 'Leader',
    life: overrides.life ?? 5,
    cost: overrides.cost ?? null,
    power: overrides.power ?? 5000,
    counter: overrides.counter ?? null,
    attributes: overrides.attributes ?? ['Strike'],
    families: overrides.families ?? ['Straw Hat Crew'],
    rarity: overrides.rarity ?? 'L',
    trigger: overrides.trigger ?? null,
    imageUrl: overrides.imageUrl ?? null
  }
}

describe('useCardPreview', () => {
  it('prefers the hovered card and falls back to the selected card', () => {
    const selectedCard = ref<Card | null>(createCard())
    const hoveredCard = createCard({
      id: 'card-2',
      number: 'OP01-003',
      name: 'Roronoa Zoro',
      type: 'Character',
      life: null,
      cost: 3,
      power: 5000,
      counter: 1000,
      rarity: 'UC'
    })

    const { previewCard, previewHoveredCard, clearHoveredCard } = useCardPreview(selectedCard)

    expect(previewCard.value?.id).toBe('card-1')

    previewHoveredCard(hoveredCard)
    expect(previewCard.value?.id).toBe('card-2')

    clearHoveredCard()
    expect(previewCard.value?.id).toBe('card-1')
  })

  it('keeps the hover preview when clearing a different card id', () => {
    const selectedCard = ref<Card | null>(createCard())
    const hoveredCard = createCard({ id: 'card-2' })

    const { previewCard, previewHoveredCard, clearHoveredCard } = useCardPreview(selectedCard)

    previewHoveredCard(hoveredCard)
    clearHoveredCard('card-3')

    expect(previewCard.value?.id).toBe('card-2')
  })
})
