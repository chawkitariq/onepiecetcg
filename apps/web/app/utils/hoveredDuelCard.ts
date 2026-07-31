import type { Card, PrivateCard, PublicCard } from '@onepiecetcg/shared'

/**
 * Normalized card shape used by duel hover previews across hand, board, and trash views.
 */
export type HoveredDuelCard = Pick<PublicCard, 'cardId' | 'number' | 'name' | 'type' | 'colors' | 'cost' | 'power' | 'life' | 'counter' | 'imageUrl'>
  & Partial<Pick<PrivateCard, 'text' | 'trigger'>>

/**
 * Builds the hover-preview payload emitted by duel card surfaces.
 */
export function createHoveredDuelCard(card: PublicCard | PrivateCard): HoveredDuelCard {
  return {
    cardId: card.cardId,
    number: card.number,
    name: card.name,
    type: card.type,
    colors: card.colors,
    cost: card.cost,
    power: card.power,
    life: card.life,
    counter: card.counter,
    imageUrl: card.imageUrl,
    text: 'text' in card ? card.text : undefined,
    trigger: 'trigger' in card ? card.trigger : undefined
  }
}

/**
 * Backfills hover-preview text fields from the catalog without overwriting already-visible private data.
 */
export function mergeHoveredDuelCardDetails(
  hoveredCard: HoveredDuelCard | null,
  catalogCard: Pick<Card, 'text' | 'trigger'> | null | undefined
): HoveredDuelCard | null {
  if (!hoveredCard) {
    return null
  }

  if (!catalogCard) {
    return hoveredCard
  }

  return {
    ...hoveredCard,
    text: hoveredCard.text === undefined ? catalogCard.text : hoveredCard.text,
    trigger: hoveredCard.trigger === undefined ? catalogCard.trigger : hoveredCard.trigger
  }
}
