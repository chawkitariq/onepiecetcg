<script setup lang="ts">
import type { PrivateCard, PublicCard } from '@onepiecetcg/shared'
import { motion } from 'motion-v'
import { getStackedCardLayout } from '~/utils/cardStack'

/**
 * Renders the owner's own hand as a fixed strip docked below the mirrored board (DuelBoard.vue),
 * not as a zone inside PlayZone.vue -- per docs/optcg-rules.md, Main is one of the nine duel zones
 * but is not part of "le terrain" (Leader/Character/Stage/Cost), so it never belongs on the
 * gridded, mirrored board alongside the opponent's side.
 */

type HoveredDuelCard = Pick<PublicCard, 'number' | 'name' | 'type' | 'colors' | 'cost' | 'power' | 'life' | 'counter' | 'imageUrl'>
  & Partial<Pick<PrivateCard, 'text' | 'trigger'>>

type StackContainerSize = {
  width: number
  height: number
}

const props = defineProps<{
  hand: PrivateCard[]
  draggableHandCardIds?: string[]
  invalidHandCardIds?: string[]
  revealedHandCardIds?: string[]
  deferredHandCardIds?: string[]
  selectedHandCardIds?: string[]
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
const handStackSize = useMeasuredStackSize('handStack')
const sharedCardTravelTransition = {
  layout: {
    duration: 0.52,
    ease: 'easeInOut',
    type: 'tween'
  }
} as const
const visibleHand = computed(() =>
  props.hand.filter(card => !props.deferredHandCardIds?.includes(card.instanceId))
)

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

const selectedHandCount = computed(() => props.selectedHandCardIds?.length ?? 0)

function shouldShowSelectedHandCount(instanceId: string): boolean {
  if (selectedHandCount.value < 2) {
    return false
  }

  return props.selectedHandCardIds?.at(-1) === instanceId
}

function handRevealAnimation(instanceId: string) {
  if (!isRevealedHandCard(instanceId) || reducedMotion.value === 'reduce') {
    return undefined
  }

  return {
    rotateY: [90, 0],
    scale: [0.94, 1],
    filter: ['brightness(1.16)', 'brightness(1)']
  }
}

function onCardHover(card: PrivateCard | null) {
  if (!card) {
    emit('cardHover', null)
    return
  }

  emit('cardHover', {
    number: card.number,
    name: card.name,
    type: card.type,
    colors: card.colors,
    cost: card.cost,
    power: card.power,
    life: card.life,
    counter: card.counter,
    imageUrl: card.imageUrl,
    text: card.text,
    trigger: card.trigger
  })
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
</script>

<template>
  <UTooltip
    :text="String(hand.length)"
    :delay-duration="0"
    :ui="{ content: 'text-sm' }"
  >
    <div
      ref="handStack"
      data-duel-hand="true"
      class="relative h-28 w-full shrink-0 overflow-visible sm:h-32"
    >
      <motion.button
        v-for="(card, index) in visibleHand"
        v-show="handStackSize.width > 0"
        :key="card.instanceId"
        type="button"
        draggable="true"
        layout
        :layout-id="card.instanceId"
        :data-instance-id="card.instanceId"
        :initial="false"
        :animate="handRevealAnimation(card.instanceId)"
        :transition="sharedCardTravelTransition"
        class="group absolute top-0 z-20 h-full hover:z-50 focus-visible:z-50"
        :class="[
          isHandCardDraggable(card.instanceId) ? 'cursor-grab active:cursor-grabbing' : '',
          isHandCardSelected(card.instanceId) ? 'rounded-lg ring-4 ring-info/70' : '',
          isHandCardInvalid(card.instanceId) ? 'duel-invalid-target ring-4 ring-error' : ''
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
      </motion.button>
    </div>
  </UTooltip>
</template>
