import { describe, expect, it } from 'vitest'
import { createStaggeredTravelPlan } from './travelStagger'

describe('createStaggeredTravelPlan', () => {
  it('spaces each travel launch by the configured stagger', () => {
    expect(createStaggeredTravelPlan(['card-a', 'card-b', 'card-c'], 90)).toEqual([
      { item: 'card-a', delayMs: 0 },
      { item: 'card-b', delayMs: 90 },
      { item: 'card-c', delayMs: 180 }
    ])
  })

  it('returns an empty launch plan when there are no cards to travel', () => {
    expect(createStaggeredTravelPlan([], 90)).toEqual([])
  })
})
