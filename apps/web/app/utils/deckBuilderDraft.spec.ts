import { describe, expect, it } from 'vitest'
import { fromBuilderDraft, toBuilderDraft } from './deckBuilderDraft'

describe('toBuilderDraft', () => {
  it('copies the builder state into a persistable snapshot', () => {
    const deckCards = [{ cardId: 'card-1', quantity: 4 }]

    const draft = toBuilderDraft({
      selectedDeckId: 'deck-1',
      deckName: 'Mon deck',
      leaderCardId: 'leader-1',
      deckCards
    })

    expect(draft).toEqual({
      selectedDeckId: 'deck-1',
      deckName: 'Mon deck',
      leaderCardId: 'leader-1',
      deckCards: [{ cardId: 'card-1', quantity: 4 }]
    })
  })

  it('does not alias the source deckCards array or its entries', () => {
    const deckCards = [{ cardId: 'card-1', quantity: 1 }]

    const draft = toBuilderDraft({
      selectedDeckId: null,
      deckName: 'Nouveau deck',
      leaderCardId: '',
      deckCards
    })

    draft.deckCards[0]!.quantity = 99
    deckCards[0]!.quantity = 1

    expect(draft.deckCards).not.toBe(deckCards)
    expect(draft.deckCards[0]).not.toBe(deckCards[0])
  })
})

describe('fromBuilderDraft', () => {
  it('returns null for missing, non-object, or malformed values', () => {
    expect(fromBuilderDraft(null)).toBeNull()
    expect(fromBuilderDraft(undefined)).toBeNull()
    expect(fromBuilderDraft('not an object')).toBeNull()
    expect(fromBuilderDraft(42)).toBeNull()
    expect(fromBuilderDraft({})).toBeNull()
    expect(fromBuilderDraft({ deckName: 'Deck' })).toBeNull()
  })

  it('restores a valid persisted draft', () => {
    const draft = fromBuilderDraft({
      selectedDeckId: 'deck-1',
      deckName: 'Mon deck',
      leaderCardId: 'leader-1',
      deckCards: [{ cardId: 'card-1', quantity: 4 }]
    })

    expect(draft).toEqual({
      selectedDeckId: 'deck-1',
      deckName: 'Mon deck',
      leaderCardId: 'leader-1',
      deckCards: [{ cardId: 'card-1', quantity: 4 }]
    })
  })

  it('defaults selectedDeckId to null when absent or not a string', () => {
    expect(fromBuilderDraft({
      deckName: 'Deck',
      leaderCardId: 'leader-1',
      deckCards: []
    })?.selectedDeckId).toBeNull()

    expect(fromBuilderDraft({
      selectedDeckId: 42,
      deckName: 'Deck',
      leaderCardId: 'leader-1',
      deckCards: []
    })?.selectedDeckId).toBeNull()
  })

  it('drops malformed deckCards entries instead of failing the whole draft', () => {
    const draft = fromBuilderDraft({
      deckName: 'Deck',
      leaderCardId: 'leader-1',
      deckCards: [
        { cardId: 'card-1', quantity: 2 },
        { cardId: 'card-2' },
        { quantity: 3 },
        null,
        'not a card',
        { cardId: 'card-3', quantity: 1 }
      ]
    })

    expect(draft?.deckCards).toEqual([
      { cardId: 'card-1', quantity: 2 },
      { cardId: 'card-3', quantity: 1 }
    ])
  })

  it('defaults deckCards to an empty array when not an array', () => {
    const draft = fromBuilderDraft({
      deckName: 'Deck',
      leaderCardId: 'leader-1',
      deckCards: 'not an array'
    })

    expect(draft?.deckCards).toEqual([])
  })
})
