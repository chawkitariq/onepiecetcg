import { describe, expect, it } from 'vitest'
import { getStackedCardLayout, getStackedCardOffsetPercent } from './cardStack'

describe('getStackedCardLayout', () => {
  it('keeps two card widths of side space when the zone has enough room', () => {
    const containerWidth = 1000
    const containerHeight = 140
    const cardWidth = containerHeight * (5 / 7)
    const layout = getStackedCardLayout(3, containerWidth, containerHeight)

    expect(layout.startPercent).toBeCloseTo(((cardWidth * 2) / containerWidth) * 100)
    expect(layout.offsetPercent).toBeCloseTo(10.8)
  })

  it('shrinks the spacing so the final card stays inside the reserved centered area', () => {
    const cardCount = 10
    const containerWidth = 900
    const containerHeight = 140
    const cardWidth = containerHeight * (5 / 7)
    const layout = getStackedCardLayout(cardCount, containerWidth, containerHeight)
    const start = (layout.startPercent / 100) * containerWidth
    const offset = (layout.offsetPercent / 100) * containerWidth
    const finalCardRightEdge = start + offset * (cardCount - 1) + cardWidth

    expect(finalCardRightEdge).toBeLessThanOrEqual(containerWidth - cardWidth * 2)
  })

  it('supports wider visual cards such as rotated DON!! cards', () => {
    const cardCount = 10
    const containerWidth = 1000
    const containerHeight = 140
    const layout = getStackedCardLayout(cardCount, containerWidth, containerHeight, { cardWidthRatio: 1 })
    const start = (layout.startPercent / 100) * containerWidth
    const offset = (layout.offsetPercent / 100) * containerWidth
    const finalCardRightEdge = start + offset * (cardCount - 1) + containerHeight

    expect(finalCardRightEdge).toBeLessThanOrEqual(containerWidth - containerHeight * 2)
  })

  it('centers the visible stack when requested', () => {
    const cardCount = 5
    const containerWidth = 1000
    const containerHeight = 140
    const cardWidth = containerHeight * (5 / 7)
    const layout = getStackedCardLayout(cardCount, containerWidth, containerHeight, { centered: true })
    const start = (layout.startPercent / 100) * containerWidth
    const offset = (layout.offsetPercent / 100) * containerWidth
    const stackWidth = offset * (cardCount - 1) + cardWidth

    expect(start).toBeCloseTo((containerWidth - stackWidth) / 2)
  })

  it('increases overlap as more cards are stacked into the same zone', () => {
    const fiveCards = getStackedCardLayout(5, 700, 140)
    const tenCards = getStackedCardLayout(10, 700, 140)

    expect(tenCards.offsetPercent).toBeLessThan(fiveCards.offsetPercent)
  })

  it('fully overlaps cards when the zone is narrower than a card', () => {
    expect(getStackedCardLayout(10, 80, 210)).toEqual({
      startPercent: 0,
      offsetPercent: 0
    })
  })
})

describe('getStackedCardOffsetPercent', () => {
  it('returns the offset from the full stacked card layout', () => {
    expect(getStackedCardOffsetPercent(10, 500, 210)).toBe(
      getStackedCardLayout(10, 500, 210).offsetPercent
    )
  })
})
