import type { Deck } from '@onepiecetcg/shared'

/**
 * Returns the saved deck targeted by the `deckId` route query when present.
 */
export function findDeckByRouteQuery(decks: Deck[], deckIdQuery: unknown): Deck | null {
  if (typeof deckIdQuery !== 'string') {
    return null
  }

  return decks.find(deck => deck.id === deckIdQuery) ?? null
}
