import type { DuelPlayerView } from '@onepiecetcg/shared'

export type HiddenZoneTransitionSource = 'deck' | 'life' | 'donDeck'

export type TransitionGhost = {
  instanceId: string
  source: HiddenZoneTransitionSource
}

export type PlayerTransitionDiff = {
  ghosts: TransitionGhost[]
  revealedHandCardIds: string[]
  lifeLoss: number
}

function getNewIds(previousIds: string[], currentIds: string[]) {
  const previousSet = new Set(previousIds)

  return currentIds.filter(id => !previousSet.has(id))
}

/**
 * Infers short-lived client-side transition hints from two player snapshots.
 * It only covers sources that are structurally hidden or stack-collapsed in the
 * UI (`deck`, `life`, `donDeck`), so visible-to-visible moves still rely on
 * shared layout animation through the rendered card instance itself.
 */
export function derivePlayerTransitionDiff(
  previous: DuelPlayerView | null,
  current: DuelPlayerView
): PlayerTransitionDiff {
  if (!previous) {
    return {
      ghosts: [],
      revealedHandCardIds: [],
      lifeLoss: 0
    }
  }

  const newHandIds = getNewIds(
    previous.hand.map(card => card.instanceId),
    current.hand.map(card => card.instanceId)
  )
  const newCostIds = getNewIds(
    previous.cost.map(card => card.instanceId),
    current.cost.map(card => card.instanceId)
  )

  const ghosts: TransitionGhost[] = []
  const revealedHandCardIds: string[] = []

  const lifeLoss = Math.max(previous.lifeCount - current.lifeCount, 0)
  const deckLoss = Math.max(previous.deckCount - current.deckCount, 0)
  const donDeckLoss = Math.max(previous.donDeckCount - current.donDeckCount, 0)

  const lifeSourcedHandIds = newHandIds.slice(0, Math.min(newHandIds.length, lifeLoss))

  for (const instanceId of lifeSourcedHandIds) {
    ghosts.push({ instanceId, source: 'life' })
    revealedHandCardIds.push(instanceId)
  }

  const remainingHandIds = newHandIds.slice(lifeSourcedHandIds.length)
  const deckSourcedHandIds = remainingHandIds.slice(0, Math.min(remainingHandIds.length, deckLoss))

  for (const instanceId of deckSourcedHandIds) {
    ghosts.push({ instanceId, source: 'deck' })
  }

  const donSourcedCostIds = newCostIds.slice(0, Math.min(newCostIds.length, donDeckLoss))

  for (const instanceId of donSourcedCostIds) {
    ghosts.push({ instanceId, source: 'donDeck' })
  }

  return {
    ghosts,
    revealedHandCardIds,
    lifeLoss
  }
}
