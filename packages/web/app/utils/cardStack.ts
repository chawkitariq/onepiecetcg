const CARD_WIDTH_RATIO = 5 / 7
const NATURAL_CARD_GAP_PX = 8
const SIDE_CARD_SPACE = 2

export type StackedCardLayout = {
  startPercent: number
  offsetPercent: number
}

export type StackedCardLayoutOptions = {
  cardWidthRatio?: number
  centered?: boolean
}

/**
 * Returns the start and horizontal offset between stacked cards as percentages of the zone width.
 * The stack keeps up to two card widths of side space, then shrinks the offset as the card count
 * grows so the final card stays inside that centered area.
 */
export function getStackedCardLayout(
  cardCount: number,
  containerWidth: number,
  containerHeight: number,
  options: StackedCardLayoutOptions = {}
): StackedCardLayout {
  if (cardCount <= 0 || containerWidth <= 0 || containerHeight <= 0) {
    return {
      startPercent: 0,
      offsetPercent: 0
    }
  }

  const { cardWidthRatio = CARD_WIDTH_RATIO, centered = false } = options
  const cardWidth = containerHeight * cardWidthRatio
  const desiredSideSpace = cardWidth * SIDE_CARD_SPACE
  const maxSideSpace = Math.max((containerWidth - cardWidth) / 2, 0)
  const sideSpace = Math.min(desiredSideSpace, maxSideSpace)

  if (cardCount === 1) {
    return {
      startPercent: (sideSpace / containerWidth) * 100,
      offsetPercent: 0
    }
  }

  const availableWidth = Math.max(containerWidth - sideSpace * 2 - cardWidth, 0)
  const naturalStep = cardWidth + NATURAL_CARD_GAP_PX
  const constrainedStep = availableWidth / (cardCount - 1)
  const step = Math.min(naturalStep, constrainedStep)
  const stackWidth = step * (cardCount - 1) + cardWidth
  const start = centered ? Math.max((containerWidth - stackWidth) / 2, 0) : sideSpace

  return {
    startPercent: (start / containerWidth) * 100,
    offsetPercent: (step / containerWidth) * 100
  }
}

/**
 * Returns only the offset from `getStackedCardLayout` for callers that do not need the start.
 */
export function getStackedCardOffsetPercent(
  cardCount: number,
  containerWidth: number,
  containerHeight: number,
  cardWidthRatio = CARD_WIDTH_RATIO
) {
  return getStackedCardLayout(
    cardCount,
    containerWidth,
    containerHeight,
    { cardWidthRatio }
  ).offsetPercent
}
