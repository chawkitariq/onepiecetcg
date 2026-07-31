import type { Card, PrivateCard, PublicCard } from '@onepiecetcg/shared'
import { describe, expect, it } from 'vitest'
import { createHoveredDuelCard, mergeHoveredDuelCardDetails } from './hoveredDuelCard'

function createPublicCard(): PublicCard {
  return {
    instanceId: 'card-1',
    cardId: 'op01-001',
    number: 'OP01-001',
    name: 'Monkey.D.Luffy',
    type: 'Leader',
    colors: ['Red'],
    cost: null,
    power: 5000,
    life: 5,
    counter: null,
    imageUrl: 'https://example.com/luffy.png',
    rested: false,
    attachedDon: 0,
    playedThisTurn: false
  }
}

function createCatalogCard(): Card {
  return {
    id: 'op01-001',
    number: 'OP01-001',
    name: 'Monkey.D.Luffy',
    type: 'Leader',
    colors: ['Red'],
    cost: null,
    power: 5000,
    life: 5,
    counter: null,
    attributes: [],
    families: [],
    text: '[Actif : Principale] Gagne +1000.',
    trigger: '[Déclenchement] Piochez 1 carte.',
    imageUrl: 'https://example.com/luffy.png',
    set: {
      id: 'op01',
      name: 'Romance Dawn'
    },
    rarity: 'L'
  }
}

describe('createHoveredDuelCard', () => {
  it('preserves private text when hovering a private card', () => {
    const privateCard: PrivateCard = {
      ...createPublicCard(),
      text: '[Jouée] Piochez 1 carte.',
      trigger: null
    }

    expect(createHoveredDuelCard(privateCard)).toMatchObject({
      cardId: 'op01-001',
      text: '[Jouée] Piochez 1 carte.',
      trigger: null
    })
  })

  it('omits text when hovering a public-only card', () => {
    expect(createHoveredDuelCard(createPublicCard())).toMatchObject({
      cardId: 'op01-001',
      text: undefined,
      trigger: undefined
    })
  })
})

describe('mergeHoveredDuelCardDetails', () => {
  it('backfills catalog text for public hover cards', () => {
    const hovered = createHoveredDuelCard(createPublicCard())

    expect(mergeHoveredDuelCardDetails(hovered, createCatalogCard())).toMatchObject({
      text: '[Actif : Principale] Gagne +1000.',
      trigger: '[Déclenchement] Piochez 1 carte.'
    })
  })

  it('does not overwrite text already visible in a private hover card', () => {
    const hovered = createHoveredDuelCard({
      ...createPublicCard(),
      text: '[Contre] +1000.',
      trigger: null
    } satisfies PrivateCard)

    expect(mergeHoveredDuelCardDetails(hovered, createCatalogCard())).toMatchObject({
      text: '[Contre] +1000.',
      trigger: null
    })
  })
})
