/**
 * Builds a launch plan that spaces travel animations by a fixed delay so
 * multiple cards don't start on the same frame.
 */
export function createStaggeredTravelPlan<T>(items: T[], staggerMs: number) {
  return items.map((item, index) => ({
    item,
    delayMs: index * staggerMs
  }))
}
