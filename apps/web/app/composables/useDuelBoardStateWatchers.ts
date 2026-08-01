import type { DuelPlayerView, PublicCard } from '@onepiecetcg/shared'
import type { PlayerTransitionDiff, TransitionGhost } from '~/utils/duelTransitions'
import { derivePlayerTransitionDiff } from '~/utils/duelTransitions'
import type { Ref } from 'vue'

type UseDuelBoardStateWatchersOptions = {
  self: Ref<DuelPlayerView | null>
  opponent: Ref<DuelPlayerView | null>
  phase: Ref<string>
  selfTransitionGhosts: Ref<TransitionGhost[]>
  opponentTransitionGhosts: Ref<TransitionGhost[]>
  selfRevealedHandCardIds: Ref<string[]>
  selfDeferredCostCardIds: Ref<string[]>
  selfDeferredTrashCardIds: Ref<string[]>
  opponentDeferredCostCardIds: Ref<string[]>
  opponentDeferredTrashCardIds: Ref<string[]>
  animatedSelfLifeToHandIds: Set<string>
  animatedSelfDeckToHandIds: Set<string>
  animatedOpponentBoardEntryIds: Set<string>
  mergeRevealedHandCards: (target: Ref<string[]>, ids: string[]) => void
  pruneSelfHandTravelSources: () => void
  cacheSelfHandTravelSources: (source: 'life' | 'deck', count: number, sourceElement: HTMLElement | null) => void
  cacheMulliganDeckToHandTravelSources: (current: DuelPlayerView, previous: DuelPlayerView | null) => void
  queryLifeStackElement: (side: 0 | 1) => HTMLElement | null
  querySelfDeckElement: () => HTMLElement | null
  queueSelfHandTravelOverlays: (current: DuelPlayerView, previous: DuelPlayerView | null) => void
  queuePendingBoardTravelOverlays: (current: DuelPlayerView, previous: DuelPlayerView | null) => void
  queueDonDeckToCostTravelOverlays: (
    diff: PlayerTransitionDiff | null,
    side: 0 | 1,
    deferredCostTarget: Ref<string[]>
  ) => void
  queueAttachedDonTravelOverlays: (current: DuelPlayerView, previous: DuelPlayerView | null) => void
  queueTrashTravelOverlay: (
    current: DuelPlayerView | null,
    previous: DuelPlayerView | null,
    side: 0 | 1,
    deferredTrashTarget: Ref<string[]>
  ) => void
  syncPendingHandPlayQueue: (current: DuelPlayerView | null) => void
  pruneOpponentHandTravelSources: () => void
  cacheOpponentHandTravelSources: (count: number) => void
  queueOpponentLifeToHandTravelOverlays: (previous: DuelPlayerView | null, current: DuelPlayerView) => void
  queueOpponentDeckToHandTravelOverlays: (previous: DuelPlayerView | null, current: DuelPlayerView) => void
  queueOpponentHandToBoardTravelOverlays: (current: DuelPlayerView, previous: DuelPlayerView | null) => void
  queueOpponentAttachedDonTravelOverlays: (current: DuelPlayerView, previous: DuelPlayerView | null) => void
  queryCardElement: (instanceId: string) => HTMLElement | null
  spawnCardFeedback: (instanceId: string | undefined, text: string, tone?: 'status' | 'impact' | 'gain') => void
  spawnCardFeedbackAtPosition: (x: number, y: number, text: string, tone?: 'status' | 'impact' | 'gain') => void
  spawnLifeLossFloatingNumber: (instanceId: string | undefined, amount: number) => void
}

function cardMapFromPlayer(player: DuelPlayerView | null) {
  const map = new Map<string, PublicCard>()

  if (!player) {
    return map
  }

  if (player.leader) {
    map.set(player.leader.instanceId, player.leader)
  }

  if (player.stage) {
    map.set(player.stage.instanceId, player.stage)
  }

  for (const card of player.characters) {
    map.set(card.instanceId, card)
  }

  return map
}

/**
 * Synchronizes duel board transition state and travel/feedback side effects from player state updates.
 */
export function useDuelBoardStateWatchers(options: UseDuelBoardStateWatchersOptions) {
  function mergeGhosts(target: Ref<TransitionGhost[]>, ghosts: TransitionGhost[]) {
    if (ghosts.length === 0) {
      return
    }

    const existingKeys = new Set(target.value.map(ghost => `${ghost.source}:${ghost.instanceId}`))
    const freshGhosts = ghosts.filter(ghost => !existingKeys.has(`${ghost.source}:${ghost.instanceId}`))

    if (freshGhosts.length === 0) {
      return
    }

    target.value = [...target.value, ...freshGhosts]

    window.setTimeout(() => {
      const expiredKeys = new Set(freshGhosts.map(ghost => `${ghost.source}:${ghost.instanceId}`))
      target.value = target.value.filter(ghost => !expiredKeys.has(`${ghost.source}:${ghost.instanceId}`))
    }, 520)
  }

  function queueAttachedDonFeedback(current: DuelPlayerView | null, previous: DuelPlayerView | null) {
    const currentCards = cardMapFromPlayer(current)
    const previousCards = cardMapFromPlayer(previous)

    for (const [instanceId, card] of currentCards) {
      const previousAttachedDon = previousCards.get(instanceId)?.attachedDon ?? 0
      const attachedDonGain = card.attachedDon - previousAttachedDon

      if (attachedDonGain <= 0) {
        continue
      }

      nextTick(() => options.spawnCardFeedback(instanceId, `+${attachedDonGain * 1000}`, 'gain'))
    }
  }

  function queueKoFeedback(current: DuelPlayerView | null, previous: DuelPlayerView | null) {
    if (!previous) {
      return
    }

    const currentCharacterIds = new Set(current?.characters.map(card => card.instanceId) ?? [])

    for (const previousCharacter of previous.characters) {
      if (currentCharacterIds.has(previousCharacter.instanceId)) {
        continue
      }

      const element = options.queryCardElement(previousCharacter.instanceId)

      if (!element) {
        continue
      }

      const rect = element.getBoundingClientRect()
      options.spawnCardFeedbackAtPosition(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        'KO',
        'impact'
      )
    }
  }

  function syncPlayerTransitions(
    current: DuelPlayerView | null,
    previous: DuelPlayerView | null,
    ghostsTarget: Ref<TransitionGhost[]>,
    revealedHandTarget?: Ref<string[]>,
    skippedGhostSources: TransitionGhost['source'][] = []
  ) {
    if (!current) {
      return null
    }

    const diff = derivePlayerTransitionDiff(previous, current)
    mergeGhosts(
      ghostsTarget,
      diff.ghosts.filter(ghost => !skippedGhostSources.includes(ghost.source))
    )

    if (revealedHandTarget && !skippedGhostSources.includes('life')) {
      options.mergeRevealedHandCards(revealedHandTarget, diff.revealedHandCardIds)
    }

    if (diff.lifeLoss > 0) {
      nextTick(() => options.spawnLifeLossFloatingNumber(current.leader?.instanceId, diff.lifeLoss))
    }

    return diff
  }

  watch(options.self, (current, previous) => {
    const currentHandIds = new Set(current?.hand.map(card => card.instanceId) ?? [])

    for (const instanceId of Array.from(options.animatedSelfLifeToHandIds)) {
      if (!currentHandIds.has(instanceId)) {
        options.animatedSelfLifeToHandIds.delete(instanceId)
      }
    }

    for (const instanceId of Array.from(options.animatedSelfDeckToHandIds)) {
      if (!currentHandIds.has(instanceId)) {
        options.animatedSelfDeckToHandIds.delete(instanceId)
      }
    }

    if (previous && current) {
      options.pruneSelfHandTravelSources()
      options.cacheSelfHandTravelSources('life', Math.max(previous.lifeCount - current.lifeCount, 0), options.queryLifeStackElement(0))
      options.cacheSelfHandTravelSources('deck', Math.max(previous.deckCount - current.deckCount, 0), options.querySelfDeckElement())
      options.cacheMulliganDeckToHandTravelSources(current, previous)
    }

    queueKoFeedback(current, previous)
    const diff = syncPlayerTransitions(
      current,
      previous,
      options.selfTransitionGhosts,
      options.selfRevealedHandCardIds,
      ['donDeck', 'life']
    )

    if (current) {
      options.queueSelfHandTravelOverlays(current, previous)
      options.queuePendingBoardTravelOverlays(current, previous)
      options.queueDonDeckToCostTravelOverlays(diff, 0, options.selfDeferredCostCardIds)
      options.queueAttachedDonTravelOverlays(current, previous)
    }

    options.queueTrashTravelOverlay(current, previous, 0, options.selfDeferredTrashCardIds)
    queueAttachedDonFeedback(current, previous)
    options.syncPendingHandPlayQueue(current)
  })

  watch(options.phase, (currentPhase, previousPhase) => {
    if (currentPhase !== 'mulligan' || previousPhase === 'mulligan' || !options.self.value) {
      return
    }

    options.mergeRevealedHandCards(options.selfRevealedHandCardIds, options.self.value.hand.map(card => card.instanceId))
  })

  watch(options.opponent, (current, previous) => {
    const previousVisibleBoardIds = new Set([
      ...(previous?.characters.map(card => card.instanceId) ?? []),
      ...(previous?.stage ? [previous.stage.instanceId] : [])
    ])
    const currentVisibleBoardIds = new Set([
      ...(current?.characters.map(card => card.instanceId) ?? []),
      ...(current?.stage ? [current.stage.instanceId] : [])
    ])

    for (const instanceId of Array.from(options.animatedOpponentBoardEntryIds)) {
      if (!currentVisibleBoardIds.has(instanceId) && !previousVisibleBoardIds.has(instanceId)) {
        options.animatedOpponentBoardEntryIds.delete(instanceId)
      }
    }

    queueKoFeedback(current, previous)
    const diff = syncPlayerTransitions(current, previous, options.opponentTransitionGhosts)
    const handLoss = previous && current ? Math.max(previous.handCount - current.handCount, 0) : 0

    options.pruneOpponentHandTravelSources()
    options.cacheOpponentHandTravelSources(handLoss)

    if (current) {
      options.queueOpponentLifeToHandTravelOverlays(previous, current)
      options.queueOpponentDeckToHandTravelOverlays(previous, current)
      options.queueOpponentHandToBoardTravelOverlays(current, previous)
      options.queueDonDeckToCostTravelOverlays(diff, 1, options.opponentDeferredCostCardIds)
      options.queueOpponentAttachedDonTravelOverlays(current, previous)
    }

    options.queueTrashTravelOverlay(current, previous, 1, options.opponentDeferredTrashCardIds)
    queueAttachedDonFeedback(current, previous)
  })
}
