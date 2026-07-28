<script setup lang="ts">
import type { PrivateCard } from '@onepiecetcg/shared'
import type { HoveredDuelCard } from '~/utils/hoveredDuelCard'
import { animate } from 'animejs'
import cardBackRegular from '~/assets/card-back-regular.png'
import { createHoveredDuelCard } from '~/utils/hoveredDuelCard'
import { getStackedCardLayout } from '~/utils/cardStack'
import { resolveDuelHighlightClasses, resolveDuelHighlightState, type DuelHighlightState } from '~/utils/duelHighlight'

/**
 * Renders a fixed hand strip docked outside the mirrored board (DuelBoard.vue), either as the
 * owner's interactive revealed hand or as the opponent's face-down count-only hand. Per
 * docs/optcg-rules.md, Main is one of the nine duel zones but is not part of "le terrain"
 * (Leader/Character/Stage/Cost), so it never belongs on the gridded, mirrored board itself.
 */

type StackContainerSize = {
  width: number
  height: number
}

const props = defineProps<{
  hand?: PrivateCard[]
  handCount?: number
  hidden?: boolean
  deferredHiddenCount?: number
  draggableHandCardIds?: string[]
  invalidHandCardIds?: string[]
  revealedHandCardIds?: string[]
  deferredHandCardIds?: string[]
  selectedHandCardIds?: string[]
  linkedPreviewInstanceId?: string | null
  linkedSelectedInstanceIds?: string[]
  draggedHandCardCount?: number
  align?: 'start' | 'center'
}>()

const emit = defineEmits<{
  cardClick: [instanceId: string, options: { ctrlKey: boolean }]
  cardDragStart: [instanceId: string]
  cardDragEnd: [instanceId: string]
  invalidCardDragAttempt: [instanceId: string]
  cardHover: [card: HoveredDuelCard | null]
}>()

const reducedMotion = usePreferredReducedMotion()
const appConfig = useAppConfig()
const handStackSize = useMeasuredStackSize('handStack')
const handCardElements = new Map<string, HTMLElement>()
const visibleHand = computed(() => props.hand ?? [])
const renderedHandCount = computed(() => {
  if (!props.hidden) {
    return props.hand?.length ?? 0
  }

  return Math.max((props.handCount ?? 0) - (props.deferredHiddenCount ?? 0), 0)
})
const hiddenHand = computed(() => Array.from({ length: props.handCount ?? 0 }))

function isDeferredHiddenCard(index: number): boolean {
  if (!props.hidden) {
    return false
  }

  const deferredCount = props.deferredHiddenCount ?? 0

  if (deferredCount <= 0) {
    return false
  }

  return index >= hiddenHand.value.length - deferredCount
}

function useMeasuredStackSize(templateRefName: string) {
  const element = useTemplateRef<HTMLElement>(templateRefName)
  const size = reactive<StackContainerSize>({ width: 0, height: 0 })
  let observer: ResizeObserver | null = null

  onMounted(() => {
    if (!element.value) {
      return
    }

    size.width = element.value.clientWidth
    size.height = element.value.clientHeight

    observer = new ResizeObserver(([entry]) => {
      if (!entry) {
        return
      }

      size.width = entry.contentRect.width
      size.height = entry.contentRect.height
    })
    observer.observe(element.value)
  })

  onBeforeUnmount(() => {
    observer?.disconnect()
  })

  return size
}

function stackedCardStyle(index: number, cardCount: number, size: StackContainerSize) {
  const { startPercent, offsetPercent } = getStackedCardLayout(cardCount, size.width, size.height, {
    centered: props.align !== 'start',
    sideSpaceCards: props.align === 'start' ? 0 : undefined
  })

  return {
    left: `${startPercent + index * offsetPercent}%`,
    zIndex: index + 1
  }
}

function isHandCardDraggable(instanceId: string): boolean {
  return props.draggableHandCardIds?.includes(instanceId) ?? false
}

function isHandCardSelected(instanceId: string): boolean {
  return props.selectedHandCardIds?.includes(instanceId) ?? false
}

function isHandCardInvalid(instanceId: string): boolean {
  return props.invalidHandCardIds?.includes(instanceId) ?? false
}

function isRevealedHandCard(instanceId: string): boolean {
  return props.revealedHandCardIds?.includes(instanceId) ?? false
}

function isDeferredHandCard(instanceId: string): boolean {
  return props.deferredHandCardIds?.includes(instanceId) ?? false
}

function isLinkedPreview(instanceId: string): boolean {
  return props.linkedPreviewInstanceId === instanceId
}

function isLinkedSelected(instanceId: string): boolean {
  return props.linkedSelectedInstanceIds?.includes(instanceId) ?? false
}

const selectedHandCount = computed(() => props.selectedHandCardIds?.length ?? 0)

function shouldShowSelectedHandCount(instanceId: string): boolean {
  if (selectedHandCount.value < 2) {
    return false
  }

  return props.selectedHandCardIds?.at(-1) === instanceId
}

function handRevealAnimation(instanceId: string) {
  return isRevealedHandCard(instanceId) && reducedMotion.value !== 'reduce'
}

function duelHighlightClasses(state: DuelHighlightState) {
  return resolveDuelHighlightClasses(appConfig, state)
}

function handCardHighlightState(instanceId: string) {
  return resolveDuelHighlightState({
    invalid: isHandCardInvalid(instanceId),
    selected: isHandCardSelected(instanceId) || isLinkedSelected(instanceId),
    preview: isLinkedPreview(instanceId),
    source: isHandCardDraggable(instanceId)
  })
}

function setHandCardElement(instanceId: string, value: Element | null) {
  if (value instanceof HTMLElement) {
    handCardElements.set(instanceId, value)
    return
  }

  handCardElements.delete(instanceId)
}

function runHandRevealAnimation(instanceId: string) {
  if (reducedMotion.value === 'reduce') {
    return
  }

  const element = handCardElements.get(instanceId)

  if (!element) {
    return
  }

  animate(element, {
    rotateY: ['90deg', '0deg'],
    scale: [0.94, 1],
    duration: 320,
    ease: 'outQuad'
  })
}

function onCardHover(card: PrivateCard | null) {
  if (!card) {
    emit('cardHover', null)
    return
  }

  emit('cardHover', createHoveredDuelCard(card))
}

function onCardDragStart(instanceId: string, event: DragEvent) {
  if (!isHandCardDraggable(instanceId)) {
    event.preventDefault()
    emit('invalidCardDragAttempt', instanceId)
    return
  }

  event.dataTransfer?.setData('text/plain', instanceId)
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
  }
  emit('cardDragStart', instanceId)
}

function onCardClick(instanceId: string, event: MouseEvent) {
  emit('cardClick', instanceId, {
    ctrlKey: event.ctrlKey
  })
}

watch(
  () => props.revealedHandCardIds ?? [],
  (current, previous) => {
    const previousIds = new Set(previous ?? [])
    const freshIds = current.filter(id => !previousIds.has(id))

    if (freshIds.length === 0) {
      return
    }

    nextTick(() => {
      for (const instanceId of freshIds) {
        runHandRevealAnimation(instanceId)
      }
    })
  },
  { immediate: true }
)
</script>

<template>
  <UTooltip
    :text="String(renderedHandCount)"
    :delay-duration="0"
    :ui="{ content: 'text-sm' }"
  >
    <div
      ref="handStack"
      :data-duel-hand="hidden ? undefined : 'true'"
      :data-opponent-hand="hidden ? 'true' : undefined"
      class="relative h-28 w-full shrink-0 overflow-visible sm:h-32"
    >
      <template v-if="hidden">
        <DuelCard
          v-for="(_, index) in hiddenHand"
          :key="index"
          :src="cardBackRegular"
          alt="Main adverse"
          class="absolute top-0"
          :data-hidden-hand-card="true"
          :data-hidden-hand-top="index === hiddenHand.length - 1 ? 'true' : undefined"
          :class="isDeferredHiddenCard(index) ? 'pointer-events-none opacity-0' : ''"
          :style="stackedCardStyle(index, hiddenHand.length, handStackSize)"
        />
      </template>
      <template v-else>
        <button
          v-for="(card, index) in visibleHand"
          v-show="handStackSize.width > 0"
          :key="card.instanceId"
          :ref="(value: Element | null) => setHandCardElement(card.instanceId, value)"
          type="button"
          draggable="true"
          :data-instance-id="card.instanceId"
        :data-layout-id="card.instanceId"
        class="group absolute top-0 z-20 h-full hover:z-50 focus-visible:z-50"
        :class="[
          'duel-hand-card',
          ...duelHighlightClasses(handCardHighlightState(card.instanceId)),
          isDeferredHandCard(card.instanceId) ? 'pointer-events-none opacity-0' : '',
          isHandCardDraggable(card.instanceId) ? 'cursor-grab active:cursor-grabbing' : '',
          handRevealAnimation(card.instanceId) ? 'duel-hand-card--revealed' : '',
          'rounded-lg'
          ]"
          :style="stackedCardStyle(index, visibleHand.length, handStackSize)"
          @click="onCardClick(card.instanceId, $event)"
          @dragstart="onCardDragStart(card.instanceId, $event)"
          @dragend="emit('cardDragEnd', card.instanceId)"
          @mouseenter="onCardHover(card)"
          @mouseleave="onCardHover(null)"
        >
          <div class="h-full transition-transform duration-150 ease-out group-hover:-translate-y-4 group-focus-visible:-translate-y-4">
            <DuelCard :src="card.imageUrl" />
          </div>
          <div
            v-if="shouldShowSelectedHandCount(card.instanceId)"
            class="pointer-events-none absolute -right-2 -top-2 z-10"
            :title="`${selectedHandCount} cartes selectionnees`"
            :aria-label="`${selectedHandCount} cartes selectionnees`"
          >
            <UChip
              :text="String(selectedHandCount)"
              color="info"
              size="lg"
              standalone
              inset
            />
          </div>
          <span
            v-if="draggedHandCardCount && draggedHandCardCount > 1 && isHandCardSelected(card.instanceId)"
            class="pointer-events-none absolute -right-2 -top-2 z-10 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground"
          >
            x{{ draggedHandCardCount }}
          </span>
        </button>
      </template>
    </div>
  </UTooltip>
</template>

<style scoped>
.duel-hand-card {
  transition:
    left 520ms ease-in-out,
    top 520ms ease-in-out,
    transform 180ms ease-out,
    box-shadow 180ms ease-out;
}

.duel-hand-card--revealed {
  transform-origin: center center;
}

@media (prefers-reduced-motion: reduce) {
  .duel-hand-card {
    transition-duration: 0ms !important;
  }
}
</style>
