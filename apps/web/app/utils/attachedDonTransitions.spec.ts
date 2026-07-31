import type { DuelPlayerView, PublicCard } from '@onepiecetcg/shared'
import { describe, expect, it } from 'vitest'
import { deriveAttachedDonTravelTargetIds } from './attachedDonTransitions'

function createPublicCard(instanceId: string, overrides: Partial<PublicCard> = {}): PublicCard {
  return {
    instanceId,
    cardId: instanceId,
    number: instanceId,
    name: instanceId,
    type: 'Character',
    colors: ['Red'],
    cost: 1,
    power: 1000,
    life: null,
    counter: 1000,
    imageUrl: '/card.png',
    rested: false,
    attachedDon: 0,
    playedThisTurn: false,
    ...overrides
  }
}

function createPlayer(overrides: Partial<DuelPlayerView> = {}): DuelPlayerView {
  return {
    sessionId: 'player-a',
    displayName: 'Player A',
    deckId: 'deck-a',
    ready: true,
    connected: true,
    mulliganDecided: true,
    hasTakenFirstTurn: true,
    leader: createPublicCard('leader-a', { type: 'Leader', power: 5000 }),
    stage: null,
    characters: [createPublicCard('character-a')],
    cost: [],
    trash: [],
    donDeckCount: 10,
    hand: [],
    handCount: 0,
    deck: [],
    deckCount: 40,
    life: [],
    lifeCount: 5,
    ...overrides
  }
}

describe('deriveAttachedDonTravelTargetIds', () => {
  it('marks a new leader attachment as one travel target', () => {
    expect(deriveAttachedDonTravelTargetIds(
      createPlayer({
        leader: createPublicCard('leader-a', { type: 'Leader', power: 5000, attachedDon: 0 })
      }),
      createPlayer({
        leader: createPublicCard('leader-a', { type: 'Leader', power: 5000, attachedDon: 1 })
      })
    )).toEqual(['leader-a'])
  })

  it('repeats a character id for each new DON!! attached to it', () => {
    expect(deriveAttachedDonTravelTargetIds(
      createPlayer({
        characters: [createPublicCard('character-a', { attachedDon: 1 })]
      }),
      createPlayer({
        characters: [createPublicCard('character-a', { attachedDon: 3 })]
      })
    )).toEqual(['character-a', 'character-a'])
  })
})
