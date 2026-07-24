/**
 * Unsaved builder edits (name, Leader, card list, and which saved deck --
 * if any -- is currently loaded), persisted client-side so a refresh
 * doesn't discard in-progress work that hasn't been saved yet.
 */
export type PersistedBuilderState = {
  selectedDeckId: string | null
  deckName: string
  leaderCardId: string
  deckCards: Array<{ cardId: string, quantity: number }>
}

/**
 * Builds the value to persist from the builder's current in-memory state.
 * Copies `deckCards` so the persisted snapshot doesn't alias the live array.
 */
export function toBuilderDraft(state: PersistedBuilderState): PersistedBuilderState {
  return {
    selectedDeckId: state.selectedDeckId,
    deckName: state.deckName,
    leaderCardId: state.leaderCardId,
    deckCards: state.deckCards.map(card => ({ ...card }))
  }
}

/**
 * Validates a value read back from storage (which may be `null`, stale, or
 * corrupted) and returns a safe snapshot to apply to the builder, or `null`
 * if there's nothing usable to restore.
 */
export function fromBuilderDraft(persisted: unknown): PersistedBuilderState | null {
  if (!persisted || typeof persisted !== 'object') {
    return null
  }

  const candidate = persisted as Partial<PersistedBuilderState>

  if (typeof candidate.deckName !== 'string' || typeof candidate.leaderCardId !== 'string') {
    return null
  }

  const deckCards = Array.isArray(candidate.deckCards)
    ? candidate.deckCards.filter((card): card is { cardId: string, quantity: number } =>
        Boolean(card)
        && typeof card === 'object'
        && typeof card.cardId === 'string'
        && typeof card.quantity === 'number')
    : []

  return {
    selectedDeckId: typeof candidate.selectedDeckId === 'string' ? candidate.selectedDeckId : null,
    deckName: candidate.deckName,
    leaderCardId: candidate.leaderCardId,
    deckCards: deckCards.map(card => ({ ...card }))
  }
}
