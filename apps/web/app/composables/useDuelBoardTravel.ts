import type { DuelPlayerView, PrivateCard, PublicCard } from '@onepiecetcg/shared'
import type { Ref } from 'vue'

export type BoardTravelOverlay = {
  key: string
  instanceId: string
  imageUrl: string
  sourceRect: DOMRect
  destinationRect: DOMRect
  translateX: number
  translateY: number
  scaleX: number
  scaleY: number
  settled: boolean
  durationMs: number
  easing: string
  variant: 'default' | 'attachedDon'
  opacity: number
  rotated?: boolean
}

type UseDuelBoardTravelOptions = {
  reducedMotion: Ref<string>
  boardTravelMs: number
  defaultTravelEasing: string
  attachedDonTravelEasing: string
}

/**
 * Owns board-travel overlay state, DOM queries, and cached travel sources for the duel board.
 */
export function useDuelBoardTravel(options: UseDuelBoardTravelOptions) {
  const boardTravelOverlays = ref<BoardTravelOverlay[]>([])
  const attachedDonOverlayTarget = ref<string[]>([])
  const boardTravelOverlayElements = new Map<string, HTMLElement>()
  const pendingBoardTravelSources = new Map<string, { imageUrl: string, sourceRect: DOMRect }>()
  const pendingTrashTravelSources = new Map<string, { imageUrl: string, sourceRect: DOMRect, expiresAt: number }>()
  const pendingAttachedDonTravelSources: Array<{ sourceRect: DOMRect, expiresAt: number }> = []
  const pendingSelfHandTravelSources: Array<{ source: 'life' | 'deck', sourceRect: DOMRect, expiresAt: number }> = []
  const pendingOpponentHandTravelSources: Array<{ sourceRect: DOMRect, expiresAt: number }> = []
  let attachedDonTravelKey = 0
  let opponentHiddenHandTravelKey = 0

  function queryCardElement(instanceId: string): HTMLElement | null {
    return document.querySelector(`[data-instance-id="${CSS.escape(instanceId)}"]`)
  }

  function querySelfDonDeckElement(): HTMLElement | null {
    return document.querySelector('[data-don-deck-side="0"]')
  }

  function queryOpponentDonDeckElement(): HTMLElement | null {
    return document.querySelector('[data-don-deck-side="1"]')
  }

  function querySelfDeckElement(): HTMLElement | null {
    return document.querySelector('[data-deck-side="0"][data-deck-top="true"]')
  }

  function queryOpponentDeckElement(): HTMLElement | null {
    return document.querySelector('[data-deck-side="1"][data-deck-top="true"]')
  }

  function queryOpponentHandElement(): HTMLElement | null {
    return document.querySelector('[data-opponent-hand="true"]')
  }

  function queryOpponentHandTopCardElement(): HTMLElement | null {
    return document.querySelector('[data-opponent-hand="true"] [data-hidden-hand-top="true"]')
  }

  function queryLifeStackElement(side: 0 | 1): HTMLElement | null {
    return document.querySelector(`[data-life-side="${side}"] [data-life-top="true"]`)
  }

  function querySelfCostCardElement(instanceId: string): HTMLElement | null {
    return document.querySelector(`[data-zone-side="0"][data-instance-id="${CSS.escape(instanceId)}"]`)
  }

  function queryOpponentCostCardElement(instanceId: string): HTMLElement | null {
    return document.querySelector(`[data-zone-side="1"][data-instance-id="${CSS.escape(instanceId)}"]`)
  }

  function querySelfUntappedCostCardElement(): HTMLElement | null {
    const matches = Array.from(document.querySelectorAll<HTMLElement>('[data-zone-side="0"][data-cost-state="untapped"]'))

    return matches.at(-1) ?? null
  }

  function queryOpponentUntappedCostCardElement(): HTMLElement | null {
    const matches = Array.from(document.querySelectorAll<HTMLElement>('[data-zone-side="1"][data-cost-state="untapped"]'))

    return matches.at(-1) ?? null
  }

  function queryAttachedDonSlotElement(instanceId: string, slotIndex: number): HTMLElement | null {
    return document.querySelector(
      `[data-attached-don-owner="${CSS.escape(instanceId)}"][data-attached-don-slot="${String(slotIndex)}"]`
    )
  }

  function queryTrashCardElement(side: 0 | 1, instanceId: string): HTMLElement | null {
    return document.querySelector(`[data-trash-side="${side}"] [data-instance-id="${CSS.escape(instanceId)}"]`)
  }

  function queryCharacterZoneCardElement(side: 0 | 1): HTMLElement | null {
    return document.querySelector(`[data-character-side="${side}"] [data-instance-id]`)
  }

  function revealDeferredVisibleCard(target: Ref<string[]>, instanceId: string) {
    target.value = target.value.filter(id => id !== instanceId)
  }

  function removeBoardTravelOverlay(key: string, target: Ref<string[]>, instanceId: string) {
    boardTravelOverlayElements.delete(key)
    boardTravelOverlays.value = boardTravelOverlays.value.filter(overlay => overlay.key !== key)
    revealDeferredVisibleCard(target, instanceId)
  }

  function boardTravelOverlayStyle(overlay: BoardTravelOverlay) {
    const settledOpacity = overlay.variant === 'attachedDon'
      ? 0.18
      : 1

    return {
      left: `${overlay.sourceRect.left}px`,
      top: `${overlay.sourceRect.top}px`,
      width: `${overlay.sourceRect.width}px`,
      height: `${overlay.sourceRect.height}px`,
      transform: overlay.settled
        ? `translate(${overlay.translateX}px, ${overlay.translateY}px) scale(${overlay.scaleX}, ${overlay.scaleY})`
        : 'translate(0px, 0px) scale(1, 1)',
      opacity: overlay.settled ? settledOpacity : overlay.opacity,
      transitionDuration: `${overlay.durationMs}ms`,
      transitionTimingFunction: overlay.easing
    }
  }

  function setBoardTravelOverlayElement(key: string, value: Element | null) {
    if (value instanceof HTMLElement) {
      boardTravelOverlayElements.set(key, value)
      return
    }

    boardTravelOverlayElements.delete(key)
  }

  function createTravelOverlayFromRect(
    key: string,
    instanceId: string,
    imageUrl: string,
    sourceRect: DOMRect,
    destinationRect: DOMRect,
    target: Ref<string[]>,
    rotated = false,
    delayMs = 0,
    variant: BoardTravelOverlay['variant'] = 'default',
    onComplete?: () => void
  ) {
    const translateX = destinationRect.left - sourceRect.left
    const translateY = destinationRect.top - sourceRect.top
    const scaleX = sourceRect.width === 0 ? 1 : destinationRect.width / sourceRect.width
    const scaleY = sourceRect.height === 0 ? 1 : destinationRect.height / sourceRect.height
    const distance = Math.hypot(translateX, translateY)
    const durationMs = variant === 'attachedDon'
      ? Math.min(580, Math.max(340, 320 + distance * 0.18))
      : Math.min(options.boardTravelMs, Math.max(220, 200 + distance * 0.16))
    const easing = variant === 'attachedDon'
      ? options.attachedDonTravelEasing
      : options.defaultTravelEasing
    const opacity = variant === 'attachedDon' ? 0.98 : 1

    window.setTimeout(() => {
      boardTravelOverlays.value = [
        ...boardTravelOverlays.value.filter(overlay => overlay.key !== key),
        {
          key,
          instanceId,
          imageUrl,
          sourceRect,
          destinationRect,
          translateX,
          translateY,
          scaleX,
          scaleY,
          settled: false,
          durationMs,
          easing,
          variant,
          opacity,
          rotated
        }
      ]

      nextTick(() => {
        const element = boardTravelOverlayElements.get(key)

        if (!element) {
          removeBoardTravelOverlay(key, target, instanceId)
          onComplete?.()
          return
        }

        const scheduleOverlayStart = typeof window.requestAnimationFrame === 'function'
          ? window.requestAnimationFrame.bind(window)
          : (callback: FrameRequestCallback) => window.setTimeout(() => callback(performance.now()), 16)

        scheduleOverlayStart(() => {
          boardTravelOverlays.value = boardTravelOverlays.value.map((overlay) => {
            if (overlay.key !== key) {
              return overlay
            }

            return {
              ...overlay,
              settled: true
            }
          })
        })

        window.setTimeout(() => {
          removeBoardTravelOverlay(key, target, instanceId)
          onComplete?.()
        }, durationMs)
      })
    }, delayMs)
  }

  function createTravelOverlay(
    key: string,
    instanceId: string,
    imageUrl: string,
    sourceRect: DOMRect,
    destinationElement: HTMLElement,
    target: Ref<string[]>,
    rotated = false,
    delayMs = 0,
    variant: BoardTravelOverlay['variant'] = 'default',
    onComplete?: () => void
  ) {
    createTravelOverlayFromRect(
      key,
      instanceId,
      imageUrl,
      sourceRect,
      destinationElement.getBoundingClientRect(),
      target,
      rotated,
      delayMs,
      variant,
      onComplete
    )
  }

  function createReadableAttachedDonDestinationRect(sourceRect: DOMRect, destinationElement: HTMLElement) {
    const rect = destinationElement.getBoundingClientRect()
    const width = Math.max(rect.width + 18, sourceRect.width * 0.62)
    const height = Math.max(rect.height + 10, sourceRect.height * 0.62)
    const left = rect.left + (rect.width - width) / 2
    const top = rect.top + (rect.height - height) / 2 - 4

    return new DOMRect(left, top, width, height)
  }

  function queryCostCardElement(side: 0 | 1, instanceId: string): HTMLElement | null {
    return side === 0
      ? querySelfCostCardElement(instanceId)
      : queryOpponentCostCardElement(instanceId)
  }

  function deriveRemovedUntappedCostSourceRects(
    previous: DuelPlayerView | null,
    current: DuelPlayerView,
    side: 0 | 1
  ) {
    if (!previous) {
      return []
    }

    const currentCostIds = new Set(current.cost.map(card => card.instanceId))

    return previous.cost
      .filter(card => !card.rested && !currentCostIds.has(card.instanceId))
      .map(card => queryCostCardElement(side, card.instanceId)?.getBoundingClientRect())
      .filter((rect): rect is DOMRect => Boolean(rect))
  }

  function cacheBoardTravelSource(card: PrivateCard) {
    if (options.reducedMotion.value === 'reduce' || typeof window === 'undefined' || !card.imageUrl) {
      return
    }

    const sourceElement = queryCardElement(card.instanceId)

    if (!sourceElement) {
      return
    }

    pendingBoardTravelSources.set(card.instanceId, {
      imageUrl: card.imageUrl,
      sourceRect: sourceElement.getBoundingClientRect()
    })
  }

  function cacheTrashTravelSource(card: PrivateCard | PublicCard | null | undefined) {
    if (options.reducedMotion.value === 'reduce' || typeof window === 'undefined' || !card?.imageUrl) {
      return
    }

    const sourceElement = queryCardElement(card.instanceId)

    if (!sourceElement) {
      return
    }

    pendingTrashTravelSources.set(card.instanceId, {
      imageUrl: card.imageUrl,
      sourceRect: sourceElement.getBoundingClientRect(),
      expiresAt: Date.now() + 3000
    })
  }

  function cacheAttachedDonTravelSources(instanceIds: string[]) {
    if (options.reducedMotion.value === 'reduce' || typeof window === 'undefined') {
      return
    }

    pruneAttachedDonTravelSources()

    for (const instanceId of instanceIds) {
      const sourceElement = querySelfCostCardElement(instanceId)

      if (!sourceElement) {
        continue
      }

      pendingAttachedDonTravelSources.push({
        sourceRect: sourceElement.getBoundingClientRect(),
        expiresAt: Date.now() + 3000
      })
    }
  }

  function cacheOpponentHandTravelSources(count: number) {
    if (count <= 0 || options.reducedMotion.value === 'reduce' || typeof window === 'undefined') {
      return
    }

    const sourceElement = queryOpponentHandTopCardElement()

    if (!sourceElement) {
      return
    }

    const sourceRect = sourceElement.getBoundingClientRect()
    const expiresAt = Date.now() + 3000

    for (let index = 0; index < count; index += 1) {
      pendingOpponentHandTravelSources.push({ sourceRect, expiresAt })
    }
  }

  function cacheSelfHandTravelSources(source: 'life' | 'deck', count: number, sourceElement: HTMLElement | null) {
    if (count <= 0 || options.reducedMotion.value === 'reduce' || typeof window === 'undefined' || !sourceElement) {
      return
    }

    const sourceRect = sourceElement.getBoundingClientRect()
    const expiresAt = Date.now() + 3000

    for (let index = 0; index < count; index += 1) {
      pendingSelfHandTravelSources.push({ source, sourceRect, expiresAt })
    }
  }

  function pruneSelfHandTravelSources() {
    const now = Date.now()

    while (pendingSelfHandTravelSources[0] && pendingSelfHandTravelSources[0].expiresAt <= now) {
      pendingSelfHandTravelSources.shift()
    }
  }

  function pruneOpponentHandTravelSources() {
    const now = Date.now()

    while (pendingOpponentHandTravelSources[0] && pendingOpponentHandTravelSources[0].expiresAt <= now) {
      pendingOpponentHandTravelSources.shift()
    }
  }

  function pruneTrashTravelSources() {
    const now = Date.now()

    for (const [instanceId, source] of pendingTrashTravelSources) {
      if (source.expiresAt <= now) {
        pendingTrashTravelSources.delete(instanceId)
      }
    }
  }

  function pruneAttachedDonTravelSources() {
    const now = Date.now()

    while (pendingAttachedDonTravelSources[0] && pendingAttachedDonTravelSources[0].expiresAt <= now) {
      pendingAttachedDonTravelSources.shift()
    }
  }

  function nextOpponentHiddenHandOverlayInstanceId(source: 'deck' | 'life', index: number) {
    opponentHiddenHandTravelKey += 1
    return `opponent-hidden-hand:${source}:${opponentHiddenHandTravelKey}:${index}`
  }

  function nextAttachedDonOverlayKey(instanceId: string) {
    attachedDonTravelKey += 1
    return {
      key: `attached-don:${attachedDonTravelKey}`,
      instanceId: `attached-don:${instanceId}:${attachedDonTravelKey}`
    }
  }

  return {
    attachedDonOverlayTarget,
    boardTravelOverlays,
    boardTravelOverlayStyle,
    cacheAttachedDonTravelSources,
    cacheBoardTravelSource,
    cacheOpponentHandTravelSources,
    cacheSelfHandTravelSources,
    cacheTrashTravelSource,
    createReadableAttachedDonDestinationRect,
    createTravelOverlay,
    createTravelOverlayFromRect,
    deriveRemovedUntappedCostSourceRects,
    nextAttachedDonOverlayKey,
    nextOpponentHiddenHandOverlayInstanceId,
    pendingAttachedDonTravelSources,
    pendingBoardTravelSources,
    pendingOpponentHandTravelSources,
    pendingSelfHandTravelSources,
    pendingTrashTravelSources,
    pruneAttachedDonTravelSources,
    pruneOpponentHandTravelSources,
    pruneSelfHandTravelSources,
    pruneTrashTravelSources,
    queryAttachedDonSlotElement,
    queryCardElement,
    queryCharacterZoneCardElement,
    queryLifeStackElement,
    queryOpponentCostCardElement,
    queryOpponentDeckElement,
    queryOpponentDonDeckElement,
    queryOpponentHandElement,
    queryOpponentHandTopCardElement,
    queryOpponentUntappedCostCardElement,
    querySelfCostCardElement,
    querySelfDeckElement,
    querySelfDonDeckElement,
    querySelfUntappedCostCardElement,
    queryTrashCardElement,
    revealDeferredVisibleCard,
    setBoardTravelOverlayElement
  }
}
