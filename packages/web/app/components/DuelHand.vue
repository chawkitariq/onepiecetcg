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
}>()

const emit = defineEmits<{
  cardClick: [instanceId: string]
  cardDragStart: [instanceId: string]
  cardDragEnd: [instanceId: string]
  invalidCardDragAttempt: [instanceId: string]
  cardHover: [card: HoveredDuelCard | null]
}>()

const reducedMotion = usePreferredReducedMotion()
const handStackSize = useMeasuredStackSize('handStack')

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
  const { startPercent, offsetPercent } = getStackedCardLayout(cardCount, size.width, size.height, { centered: true })

  return {
    left: `${startPercent + index * offsetPercent}%`,
    zIndex: index + 1
  }
}

function isHandCardDraggable(instanceId: string): boolean {
  return props.draggableHandCardIds?.includes(instanceId) ?? false
}

function isHandCardInvalid(instanceId: string): boolean {
  return props.invalidHandCardIds?.includes(instanceId) ?? false
}

function isRevealedHandCard(instanceId: string): boolean {
  return props.revealedHandCardIds?.includes(instanceId) ?? false
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
</script>

<template>
  <UTooltip
    :text="String(hand.length)"
    :delay-duration="0"
    :ui="{ content: 'text-sm' }"
  >
    <div
      ref="handStack"
      class="relative h-28 w-full shrink-0 overflow-visible sm:h-32"
    >
      <motion.button
        v-for="(card, index) in hand"
        v-show="handStackSize.width > 0"
        :key="card.instanceId"
        type="button"
        draggable="true"
        layout
        :layout-id="card.instanceId"
        :initial="false"
        :animate="handRevealAnimation(card.instanceId)"
        :transition="{ duration: 0.22, ease: 'easeOut' }"
        class="group absolute top-0 h-full hover:z-50 focus-visible:z-50"
        :class="[
          isHandCardDraggable(card.instanceId) ? 'cursor-grab active:cursor-grabbing' : '',
          isHandCardInvalid(card.instanceId) ? 'duel-invalid-target ring-4 ring-error' : ''
        ]"
        :style="stackedCardStyle(index, hand.length, handStackSize)"
        @click="emit('cardClick', card.instanceId)"
        @dragstart="onCardDragStart(card.instanceId, $event)"
        @dragend="emit('cardDragEnd', card.instanceId)"
        @mouseenter="onCardHover(card)"
        @mouseleave="onCardHover(null)"
      >
        <div class="h-full transition-transform duration-150 ease-out group-hover:-translate-y-4 group-focus-visible:-translate-y-4">
          <DuelCard :src="card.imageUrl" />
        </div>
      </motion.button>
    </div>
  </UTooltip>
</template>
