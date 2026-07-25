import { describe, expect, it } from 'vitest'
import type { DuelPlayerView, PrivateCard, PublicCard } from '@onepiecetcg/shared'
import { derivePlayerTransitionDiff } from './duelTransitions'

function createPublicCard(instanceId: string): PublicCard {
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
    playedThisTurn: false
  }
}

function createPrivateCard(instanceId: string): PrivateCard {
  return {
    ...createPublicCard(instanceId),
    text: '',
    trigger: null
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
    leader: createPublicCard('leader-a'),
    stage: null,
    characters: [],
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

describe('derivePlayerTransitionDiff', () => {
  it('marks a life-to-hand reveal as both a ghost and a revealed hand card', () => {
    const previous = createPlayer({
      hand: [createPrivateCard('hand-1')],
      handCount: 1,
      lifeCount: 3
    })
    const current = createPlayer({
      hand: [createPrivateCard('hand-1'), createPrivateCard('revealed-life')],
      handCount: 2,
      lifeCount: 2
    })

    expect(derivePlayerTransitionDiff(previous, current)).toEqual({
      ghosts: [{ instanceId: 'revealed-life', source: 'life' }],
      revealedHandCardIds: ['revealed-life'],
      lifeLoss: 1
    })
  })

  it('marks a deck draw as a deck ghost without a reveal flag', () => {
    const previous = createPlayer({
      hand: [createPrivateCard('hand-1')],
      handCount: 1,
      deckCount: 30
    })
    const current = createPlayer({
      hand: [createPrivateCard('hand-1'), createPrivateCard('drawn-card')],
      handCount: 2,
      deckCount: 29
    })

    expect(derivePlayerTransitionDiff(previous, current)).toEqual({
      ghosts: [{ instanceId: 'drawn-card', source: 'deck' }],
      revealedHandCardIds: [],
      lifeLoss: 0
    })
  })

  it('marks new cost DON!! as coming from the DON!! deck', () => {
    const previous = createPlayer({
      cost: [createPublicCard('don-1')],
      donDeckCount: 9
    })
    const current = createPlayer({
      cost: [createPublicCard('don-1'), createPublicCard('don-2')],
      donDeckCount: 8
    })

    expect(derivePlayerTransitionDiff(previous, current)).toEqual({
      ghosts: [{ instanceId: 'don-2', source: 'donDeck' }],
      revealedHandCardIds: [],
      lifeLoss: 0
    })
  })
})
