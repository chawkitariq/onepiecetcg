import type { DuelPlayerView, PrivateCard } from '@onepiecetcg/shared'
import type { PlayerTransitionDiff } from '~/utils/duelTransitions'
import type { Ref } from 'vue'
import cardBackRegular from '~/assets/card-back-regular.png'
import cardFrontDon from '~/assets/don.png'
import { deriveAttachedDonTravelTargetIds } from '~/utils/attachedDonTransitions'
import { createStaggeredTravelPlan } from '~/utils/travelStagger'

type TravelSource = { sourceRect: DOMRect, expiresAt: number }
type SelfHandTravelSource = TravelSource & { source: 'life' | 'deck' }

type UseDuelBoardTravelQueuesOptions = {
  phase: Ref<string>
  reducedMotion: Ref<string>
  boardTravelStaggerMs: number
  attachedDonTravelStaggerMs: number
  selfRevealedHandCardIds: Ref<string[]>
  selfDeferredHandCardIds: Ref<string[]>
  selfDeferredBoardCardIds: Ref<string[]>
  selfDeferredCostCardIds: Ref<string[]>
  selfDeferredTrashCardIds: Ref<string[]>
  opponentDeferredHandTravelIds: Ref<string[]>
  opponentDeferredBoardCardIds: Ref<string[]>
  opponentDeferredCostCardIds: Ref<string[]>
  opponentDeferredTrashCardIds: Ref<string[]>
  animatedSelfLifeToHandIds: Set<string>
  animatedSelfDeckToHandIds: Set<string>
  animatedOpponentBoardEntryIds: Set<string>
  pendingSelfHandTravelSources: SelfHandTravelSource[]
  pendingBoardTravelSources: Map<string, { imageUrl: string, sourceRect: DOMRect }>
  pendingOpponentHandTravelSources: TravelSource[]
  pendingTrashTravelSources: Map<string, { imageUrl: string, sourceRect: DOMRect, expiresAt: number }>
  pendingAttachedDonTravelSources: TravelSource[]
  cacheSelfHandTravelSources: (source: 'life' | 'deck', count: number, sourceElement: HTMLElement | null) => void
  pruneSelfHandTravelSources: () => void
  pruneOpponentHandTravelSources: () => void
  pruneTrashTravelSources: () => void
  pruneAttachedDonTravelSources: () => void
  nextOpponentHiddenHandOverlayInstanceId: (source: 'deck' | 'life', index: number) => string
  nextAttachedDonOverlayKey: (instanceId: string) => { key: string, instanceId: string }
  attachedDonOverlayTarget: Ref<string[]>
  revealDeferredVisibleCard: (target: Ref<string[]>, instanceId: string) => void
  createReadableAttachedDonDestinationRect: (sourceRect: DOMRect, destinationElement: HTMLElement) => DOMRect
  createTravelOverlay: (
    key: string,
    instanceId: string,
    imageUrl: string,
    sourceRect: DOMRect,
    destinationElement: HTMLElement,
    target: Ref<string[]>,
    rotated?: boolean,
    delayMs?: number,
    variant?: 'default' | 'attachedDon',
    onComplete?: () => void
  ) => void
  createTravelOverlayFromRect: (
    key: string,
    instanceId: string,
    imageUrl: string,
    sourceRect: DOMRect,
    destinationRect: DOMRect,
    target: Ref<string[]>,
    rotated?: boolean,
    delayMs?: number,
    variant?: 'default' | 'attachedDon',
    onComplete?: () => void
  ) => void
  deriveRemovedUntappedCostSourceRects: (
    previous: DuelPlayerView | null,
    current: DuelPlayerView,
    side: 0 | 1
  ) => DOMRect[]
  queryCardElement: (instanceId: string) => HTMLElement | null
  queryLifeStackElement: (side: 0 | 1) => HTMLElement | null
  queryOpponentDeckElement: () => HTMLElement | null
  queryOpponentHandElement: () => HTMLElement | null
  queryOpponentHandTopCardElement: () => HTMLElement | null
  queryOpponentCostCardElement: (instanceId: string) => HTMLElement | null
  queryOpponentUntappedCostCardElement: () => HTMLElement | null
  querySelfCostCardElement: (instanceId: string) => HTMLElement | null
  querySelfDeckElement: () => HTMLElement | null
  querySelfDonDeckElement: () => HTMLElement | null
  queryOpponentDonDeckElement: () => HTMLElement | null
  querySelfUntappedCostCardElement: () => HTMLElement | null
  queryAttachedDonSlotElement: (instanceId: string, slotIndex: number) => HTMLElement | null
  queryTrashCardElement: (side: 0 | 1, instanceId: string) => HTMLElement | null
}

function isCardWithImage(card: PrivateCard): card is PrivateCard & { imageUrl: string } {
  return typeof card.imageUrl === 'string' && card.imageUrl.length > 0
}

/**
 * Queues and plays board travel overlays after duel state transitions are applied.
 */
export function useDuelBoardTravelQueues(options: UseDuelBoardTravelQueuesOptions) {
  function mergeRevealedHandCards(target: Ref<string[]>, ids: string[]) {
    if (ids.length === 0) {
      return
    }

    const freshIds = ids.filter(id => !target.value.includes(id))

    if (freshIds.length === 0) {
      return
    }

    target.value = [...target.value, ...freshIds]

    window.setTimeout(() => {
      target.value = target.value.filter(id => !freshIds.includes(id))
    }, 320)
  }

  function mergeDeferredVisibleCards(target: Ref<string[]>, ids: string[]) {
    if (ids.length === 0) {
      return
    }

    target.value = Array.from(new Set([...target.value, ...ids]))
  }

  function cacheMulliganDeckToHandTravelSources(current: DuelPlayerView, previous: DuelPlayerView | null) {
    if (!previous || options.phase.value !== 'mulligan') {
      return
    }

    const previousHandIds = new Set(previous.hand.map(card => card.instanceId))
    const currentHandIds = new Set(current.hand.map(card => card.instanceId))
    const newHandCount = current.hand.filter(card => !previousHandIds.has(card.instanceId)).length
    const replacedHandCount = previous.hand.filter(card => !currentHandIds.has(card.instanceId)).length

    if (newHandCount === 0 || replacedHandCount === 0) {
      return
    }

    options.cacheSelfHandTravelSources('deck', newHandCount, options.querySelfDeckElement())
  }

  function queueSelfHandTravelOverlays(current: DuelPlayerView, previous: DuelPlayerView | null) {
    if (!previous || options.reducedMotion.value === 'reduce' || typeof window === 'undefined') {
      return
    }

    options.pruneSelfHandTravelSources()

    const previousHandIds = new Set(previous.hand.map(card => card.instanceId))
    const newHandCards = current.hand
      .filter(card => !previousHandIds.has(card.instanceId))
      .filter(card =>
        !options.animatedSelfLifeToHandIds.has(card.instanceId) && !options.animatedSelfDeckToHandIds.has(card.instanceId)
      )
      .filter(isCardWithImage)

    if (newHandCards.length === 0 || options.pendingSelfHandTravelSources.length === 0) {
      return
    }

    const assignments: Array<{
      card: PrivateCard & { imageUrl: string }
      source: 'life' | 'deck'
      sourceRect: DOMRect
    }> = []

    for (const card of newHandCards) {
      const source = options.pendingSelfHandTravelSources.shift()

      if (!source) {
        break
      }

      assignments.push({
        card,
        source: source.source,
        sourceRect: source.sourceRect
      })
    }

    if (assignments.length === 0) {
      return
    }

    nextTick(() => {
      const destinationRects = new Map<string, DOMRect>()

      for (const { card } of assignments) {
        const destinationElement = options.queryCardElement(card.instanceId)

        if (destinationElement) {
          destinationRects.set(card.instanceId, destinationElement.getBoundingClientRect())
        }
      }

      if (destinationRects.size === 0) {
        return
      }

      mergeDeferredVisibleCards(
        options.selfDeferredHandCardIds,
        assignments
          .map(({ card }) => card)
          .filter(card => destinationRects.has(card.instanceId))
          .map(card => card.instanceId)
      )

      for (const { item: assignment, delayMs } of createStaggeredTravelPlan(assignments, options.boardTravelStaggerMs)) {
        const { card, source, sourceRect } = assignment
        const destinationRect = destinationRects.get(card.instanceId)

        if (!destinationRect) {
          options.revealDeferredVisibleCard(options.selfDeferredHandCardIds, card.instanceId)
          continue
        }

        if (source === 'life') {
          options.animatedSelfLifeToHandIds.add(card.instanceId)
        } else {
          options.animatedSelfDeckToHandIds.add(card.instanceId)
        }

        options.createTravelOverlayFromRect(
          `${source}-hand:${card.instanceId}`,
          card.instanceId,
          card.imageUrl,
          sourceRect,
          destinationRect,
          options.selfDeferredHandCardIds,
          false,
          delayMs,
          'default',
          source === 'life'
            ? () => mergeRevealedHandCards(options.selfRevealedHandCardIds, [card.instanceId])
            : undefined
        )
      }
    })
  }

  function queueOpponentHiddenHandTravelOverlays(
    source: 'deck' | 'life',
    count: number,
    sourceElement: HTMLElement | null
  ) {
    if (count <= 0 || options.reducedMotion.value === 'reduce' || typeof window === 'undefined' || !sourceElement) {
      return
    }

    const sourceRect = sourceElement.getBoundingClientRect()

    nextTick(() => {
      const destinationElement = options.queryOpponentHandTopCardElement()

      if (!destinationElement) {
        return
      }

      const destinationRect = destinationElement.getBoundingClientRect()

      for (const { item: index, delayMs } of createStaggeredTravelPlan(
        Array.from({ length: count }, (_, itemIndex) => itemIndex),
        options.boardTravelStaggerMs
      )) {
        const overlayInstanceId = options.nextOpponentHiddenHandOverlayInstanceId(source, index)

        mergeDeferredVisibleCards(options.opponentDeferredHandTravelIds, [overlayInstanceId])

        options.createTravelOverlayFromRect(
          overlayInstanceId,
          overlayInstanceId,
          cardBackRegular,
          sourceRect,
          destinationRect,
          options.opponentDeferredHandTravelIds,
          false,
          delayMs
        )
      }
    })
  }

  function queueOpponentLifeToHandTravelOverlays(previous: DuelPlayerView | null, current: DuelPlayerView) {
    if (!previous) {
      return
    }

    const handGain = Math.max(current.handCount - previous.handCount, 0)
    const lifeLoss = Math.max(previous.lifeCount - current.lifeCount, 0)
    const lifeToHandCount = Math.min(handGain, lifeLoss)

    queueOpponentHiddenHandTravelOverlays('life', lifeToHandCount, options.queryLifeStackElement(1))
  }

  function queueOpponentDeckToHandTravelOverlays(previous: DuelPlayerView | null, current: DuelPlayerView) {
    if (!previous) {
      return
    }

    const handGain = Math.max(current.handCount - previous.handCount, 0)
    const lifeLoss = Math.max(previous.lifeCount - current.lifeCount, 0)
    const deckLoss = Math.max(previous.deckCount - current.deckCount, 0)
    const deckToHandCount = Math.min(Math.max(handGain - lifeLoss, 0), deckLoss)

    queueOpponentHiddenHandTravelOverlays('deck', deckToHandCount, options.queryOpponentDeckElement())
  }

  function queueTrashTravelOverlay(
    current: DuelPlayerView | null,
    previous: DuelPlayerView | null,
    side: 0 | 1,
    deferredTrashTarget: Ref<string[]>
  ) {
    if (!current || !previous || options.reducedMotion.value === 'reduce' || typeof window === 'undefined') {
      return
    }

    options.pruneTrashTravelSources()

    const topTrash = current.trash[0]

    if (
      !topTrash
      || typeof topTrash.imageUrl !== 'string'
      || topTrash.imageUrl.length === 0
      || previous.trash.some(card => card.instanceId === topTrash.instanceId)
    ) {
      return
    }

    const existedInVisibleZone = previous.characters.some(card => card.instanceId === topTrash.instanceId)
      || previous.stage?.instanceId === topTrash.instanceId
      || previous.cost.some(card => card.instanceId === topTrash.instanceId)
      || (side === 0 && previous.hand.some(card => card.instanceId === topTrash.instanceId))

    if (!existedInVisibleZone) {
      return
    }

    const pendingSource = options.pendingTrashTravelSources.get(topTrash.instanceId)
    options.pendingTrashTravelSources.delete(topTrash.instanceId)
    const sourceRect = pendingSource?.sourceRect ?? options.queryCardElement(topTrash.instanceId)?.getBoundingClientRect()

    if (!sourceRect) {
      return
    }

    mergeDeferredVisibleCards(deferredTrashTarget, [topTrash.instanceId])

    nextTick(() => {
      const destinationElement = options.queryTrashCardElement(side, topTrash.instanceId)

      if (!destinationElement) {
        options.revealDeferredVisibleCard(deferredTrashTarget, topTrash.instanceId)
        return
      }

      options.createTravelOverlay(
        `trash:${side}:${topTrash.instanceId}`,
        topTrash.instanceId,
        topTrash.imageUrl,
        sourceRect,
        destinationElement,
        deferredTrashTarget
      )
    })
  }

  function queuePendingBoardTravelOverlays(current: DuelPlayerView, previous: DuelPlayerView | null) {
    if (!previous || options.reducedMotion.value === 'reduce' || typeof window === 'undefined') {
      return
    }

    const boardArrivalIds = [
      ...current.characters
        .filter(character =>
          !previous.characters.some(previousCharacter => previousCharacter.instanceId === character.instanceId)
          && options.pendingBoardTravelSources.has(character.instanceId)
        )
        .map(character => character.instanceId),
      ...(current.stage
        && previous.stage?.instanceId !== current.stage.instanceId
        && options.pendingBoardTravelSources.has(current.stage.instanceId)
        ? [current.stage.instanceId]
        : [])
    ]
    const pendingArrivals = boardArrivalIds.filter(instanceId => options.pendingBoardTravelSources.has(instanceId))

    if (pendingArrivals.length === 0) {
      return
    }

    mergeDeferredVisibleCards(options.selfDeferredBoardCardIds, pendingArrivals)

    nextTick(() => {
      for (const { item: instanceId, delayMs } of createStaggeredTravelPlan(pendingArrivals, options.boardTravelStaggerMs)) {
        const pendingSource = options.pendingBoardTravelSources.get(instanceId)
        options.pendingBoardTravelSources.delete(instanceId)

        const destinationElement = options.queryCardElement(instanceId)

        if (!pendingSource || !destinationElement) {
          options.revealDeferredVisibleCard(options.selfDeferredBoardCardIds, instanceId)
          continue
        }

        options.createTravelOverlay(
          `board:${instanceId}`,
          instanceId,
          pendingSource.imageUrl,
          pendingSource.sourceRect,
          destinationElement,
          options.selfDeferredBoardCardIds,
          false,
          delayMs
        )
      }
    })
  }

  function queueOpponentHandToBoardTravelOverlays(current: DuelPlayerView, previous: DuelPlayerView | null) {
    if (!previous || options.reducedMotion.value === 'reduce' || typeof window === 'undefined') {
      return
    }

    options.pruneOpponentHandTravelSources()

    const sourceElement = options.queryOpponentHandElement()

    if (!sourceElement) {
      return
    }

    const boardArrivalIds = [
      ...current.characters
        .filter(character =>
          !previous.characters.some(previousCharacter => previousCharacter.instanceId === character.instanceId)
          && !options.animatedOpponentBoardEntryIds.has(character.instanceId)
        )
        .map(character => character.instanceId),
      ...(current.stage && previous.stage?.instanceId !== current.stage.instanceId
        && !options.animatedOpponentBoardEntryIds.has(current.stage.instanceId)
        ? [current.stage.instanceId]
        : [])
    ]

    const travelCount = Math.min(boardArrivalIds.length, options.pendingOpponentHandTravelSources.length)

    if (travelCount === 0) {
      return
    }

    const travellingArrivalIds = boardArrivalIds.slice(0, travelCount)
    travellingArrivalIds.forEach(instanceId => options.animatedOpponentBoardEntryIds.add(instanceId))
    mergeDeferredVisibleCards(options.opponentDeferredBoardCardIds, travellingArrivalIds)

    nextTick(() => {
      for (const { item: instanceId, delayMs } of createStaggeredTravelPlan(travellingArrivalIds, options.boardTravelStaggerMs)) {
        const destinationElement = options.queryCardElement(instanceId)
        const card = current.characters.find(character => character.instanceId === instanceId)
          ?? (current.stage?.instanceId === instanceId ? current.stage : null)
        const sourceRect = options.pendingOpponentHandTravelSources.shift()?.sourceRect
          ?? options.queryOpponentHandTopCardElement()?.getBoundingClientRect()

        if (!destinationElement || !card?.imageUrl || !sourceRect) {
          options.revealDeferredVisibleCard(options.opponentDeferredBoardCardIds, instanceId)
          continue
        }

        options.createTravelOverlay(
          `opponent-board:${instanceId}`,
          instanceId,
          card.imageUrl,
          sourceRect,
          destinationElement,
          options.opponentDeferredBoardCardIds,
          false,
          delayMs
        )
      }
    })
  }

  function queueDonDeckToCostTravelOverlays(
    diff: PlayerTransitionDiff | null,
    side: 0 | 1,
    deferredCostTarget: Ref<string[]>
  ) {
    if (!diff || options.reducedMotion.value === 'reduce' || typeof window === 'undefined') {
      return
    }

    const donCostIds = diff.ghosts
      .filter(ghost => ghost.source === 'donDeck')
      .map(ghost => ghost.instanceId)

    if (donCostIds.length === 0) {
      return
    }

    const sourceElement = side === 0
      ? options.querySelfDonDeckElement()
      : options.queryOpponentDonDeckElement()

    if (!sourceElement) {
      return
    }

    const sourceRect = sourceElement.getBoundingClientRect()
    mergeDeferredVisibleCards(deferredCostTarget, donCostIds)

    nextTick(() => {
      for (const { item: instanceId, delayMs } of createStaggeredTravelPlan(donCostIds, options.boardTravelStaggerMs)) {
        const destinationElement = side === 0
          ? options.querySelfCostCardElement(instanceId)
          : options.queryOpponentCostCardElement(instanceId)

        if (!destinationElement) {
          options.revealDeferredVisibleCard(deferredCostTarget, instanceId)
          continue
        }

        options.createTravelOverlay(
          `cost:${side}:${instanceId}`,
          instanceId,
          cardFrontDon,
          sourceRect,
          destinationElement,
          deferredCostTarget,
          false,
          delayMs
        )
      }
    })
  }

  function queueAttachedDonTravelOverlays(current: DuelPlayerView, previous: DuelPlayerView | null) {
    if (options.reducedMotion.value === 'reduce' || typeof window === 'undefined') {
      options.pendingAttachedDonTravelSources.length = 0
      return
    }

    const targetIds = deriveAttachedDonTravelTargetIds(previous, current)

    if (targetIds.length === 0) {
      return
    }

    options.pruneAttachedDonTravelSources()

    const previousAttachedCounts = new Map<string, number>()

    if (previous?.leader) {
      previousAttachedCounts.set(previous.leader.instanceId, previous.leader.attachedDon)
    }

    for (const character of previous?.characters ?? []) {
      previousAttachedCounts.set(character.instanceId, character.attachedDon)
    }

    const currentAttachedCounts = new Map<string, number>()

    if (current.leader) {
      currentAttachedCounts.set(current.leader.instanceId, current.leader.attachedDon)
    }

    for (const character of current.characters) {
      currentAttachedCounts.set(character.instanceId, character.attachedDon)
    }

    const consumedTargetCounts = new Map<string, number>()
    const removedCostSourceRects = options.deriveRemovedUntappedCostSourceRects(previous, current, 0)

    nextTick(() => {
      for (const { item: instanceId, delayMs } of createStaggeredTravelPlan(
        targetIds,
        options.attachedDonTravelStaggerMs
      )) {
        const previousAttachedCount = previousAttachedCounts.get(instanceId) ?? 0
        const consumedCount = consumedTargetCounts.get(instanceId) ?? 0
        const destinationSlotIndex = previousAttachedCount + consumedCount
        const destinationElement = options.queryAttachedDonSlotElement(instanceId, destinationSlotIndex)
        const immediateSourceRect = removedCostSourceRects.shift()
        const pendingSource = options.pendingAttachedDonTravelSources.shift()
        const fallbackSource = options.querySelfUntappedCostCardElement()
        const sourceRect = immediateSourceRect ?? pendingSource?.sourceRect ?? fallbackSource?.getBoundingClientRect()

        consumedTargetCounts.set(instanceId, consumedCount + 1)

        if (!destinationElement || !sourceRect || !currentAttachedCounts.has(instanceId)) {
          continue
        }

        const overlayId = options.nextAttachedDonOverlayKey(instanceId)
        options.createTravelOverlayFromRect(
          overlayId.key,
          overlayId.instanceId,
          cardFrontDon,
          sourceRect,
          options.createReadableAttachedDonDestinationRect(sourceRect, destinationElement),
          options.attachedDonOverlayTarget,
          false,
          delayMs,
          'attachedDon'
        )
      }
    })
  }

  function queueOpponentAttachedDonTravelOverlays(current: DuelPlayerView, previous: DuelPlayerView | null) {
    if (!previous || options.reducedMotion.value === 'reduce' || typeof window === 'undefined') {
      return
    }

    const targetIds = deriveAttachedDonTravelTargetIds(previous, current)

    if (targetIds.length === 0) {
      return
    }

    const previousAttachedCounts = new Map<string, number>()

    if (previous.leader) {
      previousAttachedCounts.set(previous.leader.instanceId, previous.leader.attachedDon)
    }

    for (const character of previous.characters) {
      previousAttachedCounts.set(character.instanceId, character.attachedDon)
    }

    const sourceRects = Array.from(
      options.deriveRemovedUntappedCostSourceRects(previous, current, 1)
    )

    while (sourceRects.length < targetIds.length) {
      const fallbackRect = options.queryOpponentUntappedCostCardElement()?.getBoundingClientRect()

      if (!fallbackRect) {
        break
      }

      sourceRects.push(fallbackRect)
    }

    const consumedTargetCounts = new Map<string, number>()

    nextTick(() => {
      for (const { item: instanceId, delayMs } of createStaggeredTravelPlan(
        targetIds,
        options.attachedDonTravelStaggerMs
      )) {
        const previousAttachedCount = previousAttachedCounts.get(instanceId) ?? 0
        const consumedCount = consumedTargetCounts.get(instanceId) ?? 0
        const destinationSlotIndex = previousAttachedCount + consumedCount
        const destinationElement = options.queryAttachedDonSlotElement(instanceId, destinationSlotIndex)
        const sourceRect = sourceRects.shift()

        consumedTargetCounts.set(instanceId, consumedCount + 1)

        if (!destinationElement || !sourceRect) {
          continue
        }

        const overlayId = options.nextAttachedDonOverlayKey(instanceId)
        options.createTravelOverlayFromRect(
          overlayId.key,
          overlayId.instanceId,
          cardFrontDon,
          sourceRect,
          options.createReadableAttachedDonDestinationRect(sourceRect, destinationElement),
          options.attachedDonOverlayTarget,
          false,
          delayMs,
          'attachedDon'
        )
      }
    })
  }

  return {
    cacheMulliganDeckToHandTravelSources,
    mergeDeferredVisibleCards,
    mergeRevealedHandCards,
    queueAttachedDonTravelOverlays,
    queueDonDeckToCostTravelOverlays,
    queueOpponentAttachedDonTravelOverlays,
    queueOpponentDeckToHandTravelOverlays,
    queueOpponentHandToBoardTravelOverlays,
    queueOpponentLifeToHandTravelOverlays,
    queuePendingBoardTravelOverlays,
    queueSelfHandTravelOverlays,
    queueTrashTravelOverlay
  }
}
