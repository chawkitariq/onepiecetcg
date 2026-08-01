import type { DuelLogEntry } from '@onepiecetcg/shared'
import type { Ref } from 'vue'

type ScrollAreaInstance = {
  $el?: HTMLElement
}

type ScrollAreaRef = HTMLElement | ScrollAreaInstance | null

type JournalDragSession = {
  pointerId: number
  anchorY: number
  anchorScrollTop: number
  previousY: number
  previousTimestamp: number
  velocityPxPerMs: number
}

type UseDuelJournalOptions = {
  logs: Ref<DuelLogEntry[]>
  reducedMotion: Ref<'reduce' | 'no-preference'>
  onNewEntries: (entries: DuelLogEntry[]) => void
}

const JOURNAL_RELEASE_MIN_VELOCITY = 0.05
const JOURNAL_RELEASE_STOP_VELOCITY = 0.01
const JOURNAL_RELEASE_FRICTION = 0.92
const JOURNAL_RELEASE_FALLBACK_FRAME_MS = 16

function resolveJournalScrollElement(target: ScrollAreaRef | undefined) {
  if (target instanceof HTMLElement) {
    return target
  }

  if (target?.$el instanceof HTMLElement) {
    return target.$el
  }

  return null
}

function resolveJournalEventTimestamp(event: PointerEvent) {
  return event.timeStamp > 0 ? event.timeStamp : performance.now()
}

/**
 * Manages the duel journal slideover state, auto-scroll behavior, and drag momentum.
 */
export function useDuelJournal(options: UseDuelJournalOptions) {
  const journalScrollArea = useTemplateRef<ScrollAreaRef>('journal-scroll-area')
  const journalEnd = useTemplateRef<HTMLElement>('journal-end')
  const isJournalOpen = ref(false)
  const seenLogCount = ref(0)
  const unseenLogCount = computed(() => Math.max(options.logs.value.length - seenLogCount.value, 0))
  const journalDragSession = ref<JournalDragSession | null>(null)
  let journalReleaseAnimationFrame: number | null = null

  function stopJournalReleaseMomentum() {
    if (journalReleaseAnimationFrame === null) {
      return
    }

    cancelAnimationFrame(journalReleaseAnimationFrame)
    journalReleaseAnimationFrame = null
  }

  async function scrollJournalToLatest(behavior: ScrollBehavior = 'smooth') {
    stopJournalReleaseMomentum()
    await nextTick()
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()))

    const target = journalEnd.value
    const element = resolveJournalScrollElement(journalScrollArea.value)

    if (target) {
      target.scrollIntoView({
        behavior,
        block: 'end'
      })
    }

    if (!element) {
      return
    }

    element.scrollTo({
      top: element.scrollHeight,
      behavior
    })
  }

  function startJournalReleaseMomentum(initialVelocity: number) {
    if (options.reducedMotion.value === 'reduce' || Math.abs(initialVelocity) < JOURNAL_RELEASE_MIN_VELOCITY) {
      return
    }

    stopJournalReleaseMomentum()

    let velocityPxPerMs = initialVelocity
    let previousFrameTimestamp: number | null = null

    const step = (timestamp: number) => {
      const element = resolveJournalScrollElement(journalScrollArea.value)

      if (!element) {
        journalReleaseAnimationFrame = null
        return
      }

      const deltaMs = previousFrameTimestamp === null
        ? JOURNAL_RELEASE_FALLBACK_FRAME_MS
        : Math.max(timestamp - previousFrameTimestamp, 1)
      previousFrameTimestamp = timestamp

      element.scrollTop += velocityPxPerMs * deltaMs
      velocityPxPerMs *= JOURNAL_RELEASE_FRICTION

      if (Math.abs(velocityPxPerMs) < JOURNAL_RELEASE_STOP_VELOCITY) {
        journalReleaseAnimationFrame = null
        return
      }

      journalReleaseAnimationFrame = requestAnimationFrame(step)
    }

    journalReleaseAnimationFrame = requestAnimationFrame(step)
  }

  function onJournalPointerDown(event: PointerEvent) {
    if (event.button !== 0 || event.pointerType === 'touch') {
      return
    }

    const element = resolveJournalScrollElement(journalScrollArea.value)
    const surface = event.currentTarget instanceof HTMLElement ? event.currentTarget : null

    if (!element || !surface || element.scrollHeight <= element.clientHeight) {
      return
    }

    stopJournalReleaseMomentum()

    const timestamp = resolveJournalEventTimestamp(event)

    journalDragSession.value = {
      pointerId: event.pointerId,
      anchorY: event.clientY,
      anchorScrollTop: element.scrollTop,
      previousY: event.clientY,
      previousTimestamp: timestamp,
      velocityPxPerMs: 0
    }

    if (typeof surface.setPointerCapture === 'function') {
      surface.setPointerCapture(event.pointerId)
    }

    event.preventDefault()
  }

  function onJournalPointerMove(event: PointerEvent) {
    if (!journalDragSession.value || journalDragSession.value.pointerId !== event.pointerId) {
      return
    }

    const element = resolveJournalScrollElement(journalScrollArea.value)

    if (!element) {
      journalDragSession.value = null
      return
    }

    const deltaY = event.clientY - journalDragSession.value.anchorY
    const timestamp = resolveJournalEventTimestamp(event)
    const deltaSinceLastMove = event.clientY - journalDragSession.value.previousY
    const deltaTime = Math.max(timestamp - journalDragSession.value.previousTimestamp, 1)

    element.scrollTop = journalDragSession.value.anchorScrollTop - deltaY
    journalDragSession.value.velocityPxPerMs = -(deltaSinceLastMove / deltaTime)
    journalDragSession.value.previousY = event.clientY
    journalDragSession.value.previousTimestamp = timestamp
    event.preventDefault()
  }

  function endJournalDrag(event: PointerEvent) {
    if (!journalDragSession.value || journalDragSession.value.pointerId !== event.pointerId) {
      return
    }

    const surface = event.currentTarget instanceof HTMLElement ? event.currentTarget : null

    if (surface && typeof surface.releasePointerCapture === 'function') {
      surface.releasePointerCapture(event.pointerId)
    }

    startJournalReleaseMomentum(journalDragSession.value.velocityPxPerMs)
    journalDragSession.value = null
  }

  watch(() => options.logs.value.length, async (newLength, previousLength) => {
    if (newLength <= previousLength) {
      return
    }

    const newEntries = options.logs.value.slice(previousLength, newLength)
    options.onNewEntries(newEntries)

    if (isJournalOpen.value) {
      seenLogCount.value = newLength
      await scrollJournalToLatest('smooth')
    }
  })

  watch(isJournalOpen, async (open) => {
    if (!open) {
      return
    }

    seenLogCount.value = options.logs.value.length
    await scrollJournalToLatest('auto')
  })

  onMounted(() => {
    seenLogCount.value = options.logs.value.length
  })

  onBeforeUnmount(() => {
    stopJournalReleaseMomentum()
  })

  return {
    isJournalOpen,
    journalEnd,
    journalScrollArea,
    scrollJournalToLatest,
    onJournalPointerDown,
    onJournalPointerMove,
    endJournalDrag,
    unseenLogCount
  }
}
