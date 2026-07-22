import type { Deck } from '@onepiecetcg/shared'
import { describe, expect, it } from 'vitest'
import { findDeckByRouteQuery } from './deckRouteSelection'

function createDeck(overrides: Partial<Deck> = {}): Deck {
  return {
    id: overrides.id ?? 'deck-1',
    name: overrides.name ?? 'Deck test',
    leaderCardId: overrides.leaderCardId ?? 'leader-1',
    cards: overrides.cards ?? [{ cardId: 'card-1', quantity: 50 }],
    exportText: overrides.exportText ?? '1xleader-1\n50xcard-1',
    createdAt: overrides.createdAt ?? '2026-07-22T00:00:00.000Z',
    updatedAt: overrides.updatedAt ?? '2026-07-22T00:00:00.000Z'
  }
}

describe('findDeckByRouteQuery', () => {
  it('returns the matching saved deck for a string route query', () => {
    const targetDeck = createDeck({ id: 'deck-2', name: 'Deck cible' })

    const result = findDeckByRouteQuery(
      [createDeck(), targetDeck],
      'deck-2'
    )

    expect(result).toEqual(targetDeck)
  })

  it('returns null when the route query is missing or invalid', () => {
    const decks = [createDeck()]

    expect(findDeckByRouteQuery(decks, undefined)).toBeNull()
    expect(findDeckByRouteQuery(decks, ['deck-1'])).toBeNull()
    expect(findDeckByRouteQuery(decks, 'missing-deck')).toBeNull()
  })
})
